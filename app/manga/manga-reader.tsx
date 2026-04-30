"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, RotateCcw, X } from "lucide-react";

export type MangaPage = {
  name: string;
  src: string;
};

export type MangaChapter = {
  name: string;
  pages: MangaPage[];
};

export type MangaStory = {
  name: string;
  description: string;
  thumbnail?: string;
  chapters: MangaChapter[];
};

type Transform = {
  scale: number;
  x: number;
  y: number;
};

type DragState = {
  intent: "pending" | "pan-all" | "pan-x";
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  transform: Transform;
};

type PinchState = {
  distance: number;
  transform: Transform;
};

type TouchPanState = {
  intent: "pending" | "pan-x" | "scroll-y";
  startX: number;
  startY: number;
  transform: Transform;
};

type ReaderTouchEvent = {
  preventDefault: () => void;
  touches: TouchList;
};

type MangaReaderProps = {
  initialPageIndex: number;
  initialStoryName?: string;
  library: MangaStory[];
};

/* eslint-disable @next/next/no-img-element */

const minZoom = 1;
const maxZoom = 3.5;
const zoomStep = 0.35;
const zoomEpsilon = 0.01;
const pinchZoomOutSensitivity = 1.55;
const readerStorageKey = "manga-reader-progress";
const urlUpdateDelay = 900;
const mobileReaderBreakpoint = 780;
const mobileReaderGutter = 24;
const desktopReaderMaxWidth = 860;
const desktopReaderWidthRatio = 0.56;

function clampZoom(zoom: number) {
  const clampedZoom = Math.min(Math.max(zoom, minZoom), maxZoom);
  return Math.abs(clampedZoom - minZoom) < zoomEpsilon ? minZoom : clampedZoom;
}

function stripMarkdown(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .trim();
}

function getTouchDistance(touches: TouchList) {
  if (touches.length < 2) {
    return 0;
  }

  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );
}

function getTouchFocalPoint(touches: TouchList) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

function getPinchZoomMultiplier(distance: number, startDistance: number) {
  const multiplier = distance / Math.max(startDistance, 1);

  if (multiplier >= 1) {
    return multiplier;
  }

  return multiplier ** pinchZoomOutSensitivity;
}

function normalizeWheelDelta(delta: number, deltaMode: number) {
  if (deltaMode === 1) {
    return delta * 16;
  }

  if (deltaMode === 2) {
    return delta * window.innerHeight;
  }

  return delta;
}

function getReaderWidth() {
  if (typeof window === "undefined") {
    return null;
  }

  const viewportWidths = [
    window.visualViewport?.width,
    window.innerWidth,
    document.documentElement.clientWidth,
  ].filter((width): width is number => typeof width === "number" && width > 0);

  if (viewportWidths.length === 0) {
    return null;
  }

  const viewportWidth = Math.floor(Math.min(...viewportWidths));

  if (viewportWidth <= mobileReaderBreakpoint) {
    return Math.max(280, viewportWidth - mobileReaderGutter);
  }

  return Math.min(
    desktopReaderMaxWidth,
    Math.floor(viewportWidth * desktopReaderWidthRatio),
  );
}

export function MangaReader({
  initialPageIndex,
  initialStoryName,
  library,
}: MangaReaderProps) {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const pinchRef = useRef<PinchState | null>(null);
  const touchPanRef = useRef<TouchPanState | null>(null);
  const pageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const restoredPageRef = useRef(false);
  const lastSavedPageRef = useRef(initialPageIndex);
  const scrollFrameRef = useRef<number | null>(null);
  const urlUpdateTimeoutRef = useRef<number | null>(null);
  const transformRef = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  const [selectedStory, setSelectedStory] = useState<MangaStory | null>(
    () => library.find((story) => story.name === initialStoryName) ?? null,
  );
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const firstChapter = selectedStory?.chapters[0];
  const pages = firstChapter?.pages ?? [];
  const isZoomed = transform.scale > minZoom + zoomEpsilon;

  const getBounds = useCallback((scale: number) => {
    const surface = surfaceRef.current;
    const content = contentRef.current;

    if (!surface || !content || scale <= minZoom + zoomEpsilon) {
      return { x: 0, y: 0 };
    }

    return {
      x: Math.max(0, content.offsetWidth * scale - surface.clientWidth),
      y: Math.max(0, content.offsetHeight * scale - surface.clientHeight),
    };
  }, []);

  const clampTransform = useCallback(
    (next: Transform): Transform => {
      const scale = clampZoom(next.scale);

      if (scale <= minZoom + zoomEpsilon) {
        return { scale: 1, x: 0, y: 0 };
      }

      const bounds = getBounds(scale);

      return {
        scale,
        x: Math.min(Math.max(next.x, -bounds.x), 0),
        y: Math.min(Math.max(next.y, -bounds.y), 0),
      };
    },
    [getBounds],
  );

  const applyTransform = useCallback(
    (next: Transform) => {
      const clamped = clampTransform(next);
      transformRef.current = clamped;
      setTransform(clamped);
    },
    [clampTransform],
  );

  const resetZoom = useCallback(() => {
    dragRef.current = null;
    pinchRef.current = null;
    touchPanRef.current = null;
    transformRef.current = { scale: 1, x: 0, y: 0 };
    setTransform({ scale: 1, x: 0, y: 0 });
    window.scrollTo({ left: 0, top: window.scrollY });
  }, []);

  const resetHorizontalScroll = useCallback(() => {
    window.scrollTo({ left: 0, top: window.scrollY });

    const scrollingElement = document.scrollingElement;

    if (scrollingElement) {
      scrollingElement.scrollLeft = 0;
    }

    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }, []);

  const updateMeasuredReaderWidth = useCallback(() => {
    const surface = surfaceRef.current;
    const readerWidth = getReaderWidth();

    if (!surface || !readerWidth) {
      return;
    }

    surface.style.setProperty("--manga-measured-width", `${readerWidth}px`);
  }, []);

  const zoomAroundPoint = useCallback(
    (nextScale: number, clientX?: number, clientY?: number) => {
      const surface = surfaceRef.current;
      const content = contentRef.current;
      const previous = transformRef.current;
      const scale = clampZoom(nextScale);

      if (!surface || !content || scale <= minZoom + zoomEpsilon) {
        resetZoom();
        return;
      }

      const surfaceRect = surface.getBoundingClientRect();
      const focalX =
        (clientX ?? surfaceRect.left + surface.clientWidth / 2) - surfaceRect.left;
      const focalY =
        (clientY ?? surfaceRect.top + surface.clientHeight / 2) - surfaceRect.top;
      const contentX = (focalX - content.offsetLeft - previous.x) / previous.scale;
      const contentY = (focalY - content.offsetTop - previous.y) / previous.scale;

      applyTransform({
        scale,
        x: focalX - content.offsetLeft - contentX * scale,
        y: focalY - content.offsetTop - contentY * scale,
      });
    },
    [applyTransform, resetZoom],
  );

  const saveReaderProgress = useCallback((story: MangaStory, pageIndex: number) => {
    if (lastSavedPageRef.current === pageIndex) {
      return;
    }

    lastSavedPageRef.current = pageIndex;

    try {
      window.sessionStorage.setItem(
        readerStorageKey,
        JSON.stringify({
          page: pageIndex + 1,
          story: story.name,
        }),
      );
    } catch {
      // Storage can be unavailable in private browsing; the URL remains enough.
    }

    if (urlUpdateTimeoutRef.current !== null) {
      window.clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = window.setTimeout(() => {
      urlUpdateTimeoutRef.current = null;

      try {
        const params = new URLSearchParams(window.location.search);
        params.set("story", story.name);
        params.set("page", String(pageIndex + 1));
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${params}`,
        );
      } catch {
        // Mobile browsers can reject frequent history writes while scrolling.
      }
    }, urlUpdateDelay);
  }, []);

  function openStory(story: MangaStory) {
    setSelectedStory(story);
    restoredPageRef.current = true;
    lastSavedPageRef.current = 0;
    resetZoom();
    saveReaderProgress(story, 0);

    try {
      const params = new URLSearchParams(window.location.search);
      params.set("story", story.name);
      params.set("page", "1");
      window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
    } catch {
      // Non-critical; scroll progress is also stored in sessionStorage.
    }

    window.scrollTo({ left: 0, top: 0 });
  }

  function closeStory() {
    setSelectedStory(null);
    restoredPageRef.current = false;
    lastSavedPageRef.current = 0;
    resetZoom();
    try {
      window.sessionStorage.removeItem(readerStorageKey);
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      // Leaving the URL alone is better than crashing the reader.
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (!isZoomed || event.button !== 0) {
      return;
    }

    if (event.pointerType === "touch") {
      return;
    }

    event.preventDefault();
    dragRef.current = {
      intent: "pan-all",
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      transform: transformRef.current,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some automated pointer events do not have an active pointer to capture.
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    event.preventDefault();
    applyTransform({
      scale: transformRef.current.scale,
      x: drag.transform.x + deltaX,
      y: drag.transform.y + deltaY,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLElement>) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      zoomAroundPoint(
        transformRef.current.scale + (event.deltaY > 0 ? -zoomStep : zoomStep),
        event.clientX,
        event.clientY,
      );
      return;
    }

    const horizontalDelta = normalizeWheelDelta(
      event.deltaX || (event.shiftKey ? event.deltaY : 0),
      event.deltaMode,
    );

    if (!isZoomed || Math.abs(horizontalDelta) < 1) {
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
    }

    applyTransform({
      ...transformRef.current,
      x: transformRef.current.x - horizontalDelta,
    });
  }

  function handleTouchStart(event: ReaderTouchEvent) {
    if (event.touches.length >= 2) {
      event.preventDefault();
      touchPanRef.current = null;
      pinchRef.current = {
        distance: getTouchDistance(event.touches),
        transform: transformRef.current,
      };
      return;
    }

    if (!isZoomed) {
      pinchRef.current = null;
      touchPanRef.current = null;
      return;
    }

    touchPanRef.current = null;
    const touch = event.touches[0];

    touchPanRef.current = {
      intent: "pending",
      startX: touch.clientX,
      startY: touch.clientY,
      transform: transformRef.current,
    };
  }

  function handleTouchMove(event: ReaderTouchEvent) {
    const pinch = pinchRef.current;

    if (pinch && event.touches.length >= 2) {
      event.preventDefault();
      const focal = getTouchFocalPoint(event.touches);
      const nextScale = pinch.transform.scale * getPinchZoomMultiplier(
        getTouchDistance(event.touches),
        pinch.distance,
      );

      transformRef.current = pinch.transform;
      zoomAroundPoint(nextScale, focal.x, focal.y);
      return;
    }

    const touchPan = touchPanRef.current;

    if (!touchPan || event.touches.length !== 1 || !isZoomed) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchPan.startX;
    const deltaY = touch.clientY - touchPan.startY;

    if (touchPan.intent === "pending") {
      const horizontalIntent = Math.abs(deltaX) > Math.abs(deltaY) + 6;
      const verticalIntent = Math.abs(deltaY) > Math.abs(deltaX) + 6;

      if (horizontalIntent) {
        touchPan.intent = "pan-x";
      } else if (verticalIntent) {
        touchPan.intent = "scroll-y";
      } else {
        return;
      }
    }

    if (touchPan.intent === "scroll-y") {
      return;
    }

    event.preventDefault();
    applyTransform({
      scale: transformRef.current.scale,
      x: touchPan.transform.x + deltaX,
      y: transformRef.current.y,
    });
  }

  function handleTouchEnd(event: ReaderTouchEvent) {
    if (event.touches.length < 2) {
      pinchRef.current = null;
    }

    if (event.touches.length === 0) {
      touchPanRef.current = null;
    }
  }

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    const handleNativeTouchStart = (event: TouchEvent) => handleTouchStart(event);
    const handleNativeTouchMove = (event: TouchEvent) => handleTouchMove(event);
    const handleNativeTouchEnd = (event: TouchEvent) => handleTouchEnd(event);

    surface.addEventListener("touchstart", handleNativeTouchStart, {
      passive: false,
    });
    surface.addEventListener("touchmove", handleNativeTouchMove, {
      passive: false,
    });
    surface.addEventListener("touchend", handleNativeTouchEnd, {
      passive: false,
    });
    surface.addEventListener("touchcancel", handleNativeTouchEnd, {
      passive: false,
    });

    return () => {
      surface.removeEventListener("touchstart", handleNativeTouchStart);
      surface.removeEventListener("touchmove", handleNativeTouchMove);
      surface.removeEventListener("touchend", handleNativeTouchEnd);
      surface.removeEventListener("touchcancel", handleNativeTouchEnd);
    };
  });

  useLayoutEffect(() => {
    function updateReaderWidth() {
      updateMeasuredReaderWidth();
      resetHorizontalScroll();
      applyTransform(transformRef.current);
    }

    updateReaderWidth();

    window.visualViewport?.addEventListener("resize", updateReaderWidth);
    window.addEventListener("resize", updateReaderWidth);
    window.addEventListener("orientationchange", updateReaderWidth);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateReaderWidth);
      window.removeEventListener("resize", updateReaderWidth);
      window.removeEventListener("orientationchange", updateReaderWidth);
    };
  }, [applyTransform, resetHorizontalScroll, updateMeasuredReaderWidth]);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (selectedStory || initialStoryName) {
      return;
    }

    let restoreTimeout: number | null = null;

    try {
      const progress = JSON.parse(
        window.sessionStorage.getItem(readerStorageKey) ?? "null",
      ) as { page?: number; story?: string } | null;
      const story = library.find((item) => item.name === progress?.story);

      if (!story) {
        return;
      }

      lastSavedPageRef.current = Math.max((progress?.page ?? 1) - 1, 0);
      restoredPageRef.current = false;
      restoreTimeout = window.setTimeout(() => setSelectedStory(story), 0);
    } catch {
      // Bad stored state should not stop the library from loading.
    }

    return () => {
      if (restoreTimeout !== null) {
        window.clearTimeout(restoreTimeout);
      }
    };
  }, [initialStoryName, library, selectedStory]);

  useEffect(() => {
    if (selectedStory) {
      resetHorizontalScroll();
    }
  }, [resetHorizontalScroll, selectedStory]);

  useEffect(() => {
    function handleResize() {
      applyTransform(transformRef.current);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyTransform]);

  useEffect(() => {
    if (!selectedStory) {
      return;
    }

    const story = selectedStory;

    function handleScroll() {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        const readingLine = Math.min(window.innerHeight * 0.35, 260);
        let activePage = 0;
        let activeDistance = Number.POSITIVE_INFINITY;

        pageRefs.current.forEach((page, index) => {
          if (!page) {
            return;
          }

          const distance = Math.abs(page.getBoundingClientRect().top - readingLine);

          if (distance < activeDistance) {
            activeDistance = distance;
            activePage = index;
          }
        });

        saveReaderProgress(story, activePage);
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }

      if (urlUpdateTimeoutRef.current !== null) {
        window.clearTimeout(urlUpdateTimeoutRef.current);
        urlUpdateTimeoutRef.current = null;
      }
    };
  }, [saveReaderProgress, selectedStory]);

  useEffect(() => {
    if (!selectedStory || restoredPageRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const pageIndex = initialStoryName
        ? initialPageIndex
        : lastSavedPageRef.current;

      pageRefs.current[pageIndex]?.scrollIntoView({
        block: "start",
        inline: "start",
      });
      resetHorizontalScroll();
      restoredPageRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [initialPageIndex, initialStoryName, resetHorizontalScroll, selectedStory]);

  if (library.length === 0) {
    return (
      <main className="manga-shell">
        <div className="manga-empty">
          <Link className="project-back-link" href="/#work">
            <ArrowLeft aria-hidden="true" />
            Project history
          </Link>
          <h1>Manga Library</h1>
          <p>
            Add story folders to <code>public/Manga</code> with a thumbnail,
            description, and chapter images to load the reader.
          </p>
        </div>
      </main>
    );
  }

  if (selectedStory) {
    return (
      <main className="manga-shell manga-shell-reader">
        <header className="manga-reader-bar">
          <button className="manga-text-button" onClick={closeStory} type="button">
            <ArrowLeft aria-hidden="true" />
            <span>Library</span>
          </button>
          <div>
            <p>{selectedStory.name}</p>
            <h1>{firstChapter?.name ?? "Chapter 1"}</h1>
          </div>
          <div className="manga-zoom-controls" aria-label="Zoom controls">
            <button
              aria-label="Zoom out"
              disabled={!isZoomed}
              onClick={() => zoomAroundPoint(transform.scale - zoomStep)}
              type="button"
            >
              <Minus aria-hidden="true" />
            </button>
            <button
              aria-label="Reset zoom"
              disabled={!isZoomed}
              onClick={resetZoom}
              type="button"
            >
              <RotateCcw aria-hidden="true" />
            </button>
            <button
              aria-label="Zoom in"
              disabled={transform.scale >= maxZoom}
              onClick={() => zoomAroundPoint(transform.scale + zoomStep)}
              type="button"
            >
              <Plus aria-hidden="true" />
            </button>
          </div>
        </header>

        <section
          aria-label={`${selectedStory.name} pages`}
          className="manga-scroll-viewport"
          data-zoomed={isZoomed}
          onDoubleClick={(event) =>
            zoomAroundPoint(isZoomed ? 1 : 2, event.clientX, event.clientY)
          }
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          ref={(node) => {
            surfaceRef.current = node;
            updateMeasuredReaderWidth();
          }}
        >
          <button
            aria-label="Close reader"
            className="manga-reader-close"
            onClick={closeStory}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
          <div
            className="manga-page-stack"
            ref={contentRef}
            style={{
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            }}
          >
            {pages.map((page, index) => (
              <img
                alt={`${selectedStory.name} ${firstChapter?.name ?? "chapter"} page ${index + 1}`}
                decoding="async"
                key={page.src}
                loading={index < 2 ? "eager" : "lazy"}
                onLoad={() => {
                  const restoreIndex = initialStoryName
                    ? initialPageIndex
                    : lastSavedPageRef.current;

                  if (index === restoreIndex && !restoredPageRef.current) {
                    pageRefs.current[index]?.scrollIntoView({
                      block: "start",
                      inline: "start",
                    });
                    resetHorizontalScroll();
                    restoredPageRef.current = true;
                  }
                }}
                ref={(node) => {
                  pageRefs.current[index] = node;
                }}
                src={page.src}
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="manga-shell">
      <section className="manga-library" aria-labelledby="manga-title">
        <header className="manga-library-header">
          <Link className="project-back-link" href="/#work">
            <ArrowLeft aria-hidden="true" />
            Project history
          </Link>
          <div>
            <p className="eyebrow">Demo</p>
            <h1 id="manga-title">Manga Library</h1>
          </div>
        </header>

        <div className="manga-grid">
          {library.map((story) => (
            <button
              aria-label={`Open ${story.name}`}
              className="manga-card"
              key={story.name}
              onClick={() => openStory(story)}
              type="button"
            >
              <span className="manga-card-image">
                {story.thumbnail ? (
                  <img alt="" src={story.thumbnail} />
                ) : (
                  <span aria-hidden="true">{story.name.slice(0, 1)}</span>
                )}
                {story.description && (
                  <span className="manga-card-description">
                    <span>{stripMarkdown(story.description)}</span>
                  </span>
                )}
              </span>
              <span className="manga-card-title">{story.name}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
