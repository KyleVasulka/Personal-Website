"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Maximize2,
  PanelTop,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

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
  chapters: MangaChapter[];
};

type ReadingDirection = "ltr" | "rtl";
type FitMode = "height" | "width";
type Transform = {
  scale: number;
  x: number;
  y: number;
};

type MangaReaderProps = {
  library: MangaStory[];
};

type TouchGesture =
  | {
      type: "pinch";
      distance: number;
      focalX: number;
      focalY: number;
      startScale: number;
      startX: number;
      startY: number;
    }
  | {
      type: "pan";
      lastTime: number;
      lastX: number;
      lastY: number;
      startTransform: Transform;
      startX: number;
      startY: number;
      velocityX: number;
      velocityY: number;
    }
  | {
      type: "swipe";
      startX: number;
      startY: number;
    };

/* eslint-disable @next/next/no-img-element */

const minZoom = 1;
const maxZoom = 4;
const zoomEpsilon = 0.01;

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 0), Math.max(totalPages - 1, 0));
}

function clampZoom(zoom: number) {
  const clampedZoom = Math.min(Math.max(zoom, minZoom), maxZoom);

  if (Math.abs(clampedZoom - minZoom) < zoomEpsilon) {
    return minZoom;
  }

  return clampedZoom;
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

function getTouchFocalPoint(surface: HTMLDivElement, touches: TouchList) {
  const rect = surface.getBoundingClientRect();

  return {
    x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
    y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
  };
}

export function MangaReader({ library }: MangaReaderProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const gestureRef = useRef<TouchGesture | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const transformRef = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  const [storyIndex, setStoryIndex] = useState(0);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<ReadingDirection>("rtl");
  const [fitMode, setFitMode] = useState<FitMode>("height");
  const [showAllPages, setShowAllPages] = useState(false);
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    x: 0,
    y: 0,
  });

  const selectedStory = library[storyIndex];
  const selectedChapter = selectedStory?.chapters[chapterIndex];
  const pages = selectedChapter?.pages ?? [];
  const safePageIndex = clampPage(pageIndex, pages.length);
  const currentPage = pages[safePageIndex];
  const isZoomed = transform.scale > minZoom + zoomEpsilon;

  const chapterOptions = useMemo(
    () =>
      selectedStory?.chapters.map((chapter, index) => ({
        label: chapter.name,
        value: index,
      })) ?? [],
    [selectedStory],
  );

  function getBounds(scale: number) {
    const surface = surfaceRef.current;
    const image = imageRef.current;

    if (!surface || !image) {
      return { x: 0, y: 0 };
    }

    return {
      x: Math.max(0, (image.offsetWidth * scale - surface.clientWidth) / 2),
      y: Math.max(0, (image.offsetHeight * scale - surface.clientHeight) / 2),
    };
  }

  function clampTransform(next: Transform): Transform {
    const scale = clampZoom(next.scale);

    if (scale <= minZoom + zoomEpsilon) {
      return { scale: 1, x: 0, y: 0 };
    }

    const bounds = getBounds(scale);

    return {
      scale,
      x: Math.min(Math.max(next.x, -bounds.x), bounds.x),
      y: Math.min(Math.max(next.y, -bounds.y), bounds.y),
    };
  }

  const cancelInertia = useCallback(() => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  function applyTransform(next: Transform) {
    const clamped = clampTransform(next);
    transformRef.current = clamped;
    setTransform(clamped);
  }

  const resetZoom = useCallback(() => {
    cancelInertia();
    gestureRef.current = null;
    transformRef.current = { scale: 1, x: 0, y: 0 };
    setTransform({ scale: 1, x: 0, y: 0 });
    window.scrollTo({ left: 0, top: window.scrollY });
  }, [cancelInertia]);

  function zoomAroundPoint(nextScale: number, focalX?: number, focalY?: number) {
    cancelInertia();

    const surface = surfaceRef.current;
    const previous = transformRef.current;
    const scale = clampZoom(nextScale);

    if (!surface || scale <= minZoom + zoomEpsilon) {
      resetZoom();
      return;
    }

    const centerX = surface.clientWidth / 2;
    const centerY = surface.clientHeight / 2;
    const pointX = focalX ?? centerX;
    const pointY = focalY ?? centerY;
    const contentX = (pointX - centerX - previous.x) / previous.scale;
    const contentY = (pointY - centerY - previous.y) / previous.scale;

    applyTransform({
      scale,
      x: pointX - centerX - contentX * scale,
      y: pointY - centerY - contentY * scale,
    });
  }

  const goToPreviousPage = useCallback(() => {
    setPageIndex((current) => clampPage(current - 1, pages.length));
    resetZoom();
  }, [pages.length, resetZoom]);

  const goToNextPage = useCallback(() => {
    setPageIndex((current) => clampPage(current + 1, pages.length));
    resetZoom();
  }, [pages.length, resetZoom]);

  const goToDirectionalPreviousPage = useCallback(() => {
    if (direction === "rtl") {
      goToNextPage();
      return;
    }

    goToPreviousPage();
  }, [direction, goToNextPage, goToPreviousPage]);

  const goToDirectionalNextPage = useCallback(() => {
    if (direction === "rtl") {
      goToPreviousPage();
      return;
    }

    goToNextPage();
  }, [direction, goToNextPage, goToPreviousPage]);

  function goToPreviousChapter() {
    setChapterIndex((current) => Math.max(current - 1, 0));
    setPageIndex(0);
    resetZoom();
  }

  function goToNextChapter() {
    const lastChapterIndex = Math.max((selectedStory?.chapters.length ?? 1) - 1, 0);
    setChapterIndex((current) => Math.min(current + 1, lastChapterIndex));
    setPageIndex(0);
    resetZoom();
  }

  function startInertia(velocityX: number, velocityY: number) {
    const speed = Math.hypot(velocityX, velocityY);

    if (speed < 0.08 || transformRef.current.scale <= minZoom + zoomEpsilon) {
      return;
    }

    let xVelocity = velocityX;
    let yVelocity = velocityY;
    let lastTime: number | null = null;

    function coast(timestamp: number) {
      const previousTime = lastTime ?? timestamp;
      const elapsed = Math.min(timestamp - previousTime, 32);
      lastTime = timestamp;
      const current = transformRef.current;
      const next = clampTransform({
        ...current,
        x: current.x + xVelocity * elapsed,
        y: current.y + yVelocity * elapsed,
      });

      if (Math.abs(next.x - current.x) < 0.1) {
        xVelocity = 0;
      }

      if (Math.abs(next.y - current.y) < 0.1) {
        yVelocity = 0;
      }

      transformRef.current = next;
      setTransform(next);

      const friction = Math.pow(0.94, elapsed / 16);
      xVelocity *= friction;
      yVelocity *= friction;

      if (Math.hypot(xVelocity, yVelocity) < 0.02) {
        inertiaFrameRef.current = null;
        return;
      }

      inertiaFrameRef.current = requestAnimationFrame(coast);
    }

    inertiaFrameRef.current = requestAnimationFrame(coast);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        goToDirectionalPreviousPage();
      }

      if (event.key === "ArrowRight") {
        goToDirectionalNextPage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToDirectionalNextPage, goToDirectionalPreviousPage]);

  useEffect(() => {
    if (!isZoomed) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [isZoomed]);

  function handleTouchStart(event: globalThis.TouchEvent) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    cancelInertia();

    if (event.touches.length >= 2 && surfaceRef.current) {
      const focal = getTouchFocalPoint(surfaceRef.current, event.touches);

      gestureRef.current = {
        type: "pinch",
        distance: getTouchDistance(event.touches),
        focalX: focal.x,
        focalY: focal.y,
        startScale: transformRef.current.scale,
        startX: transformRef.current.x,
        startY: transformRef.current.y,
      };
      return;
    }

    const touch = event.touches[0];

    if (transformRef.current.scale > minZoom + zoomEpsilon) {
      gestureRef.current = {
        type: "pan",
        lastTime: performance.now(),
        lastX: touch.clientX,
        lastY: touch.clientY,
        startTransform: transformRef.current,
        startX: touch.clientX,
        startY: touch.clientY,
        velocityX: 0,
        velocityY: 0,
      };
      return;
    }

    gestureRef.current = {
      type: "swipe",
      startX: touch.clientX,
      startY: touch.clientY,
    };
  }

  function handleTouchMove(event: globalThis.TouchEvent) {
    const gesture = gestureRef.current;

    if (!gesture) {
      return;
    }

    if (event.touches.length >= 2 && gesture.type === "pinch" && surfaceRef.current) {
      event.preventDefault();
      const focal = getTouchFocalPoint(surfaceRef.current, event.touches);
      const scale = clampZoom(
        gesture.startScale *
          (getTouchDistance(event.touches) / Math.max(gesture.distance, 1)),
      );

      if (scale <= minZoom + zoomEpsilon) {
        resetZoom();
        return;
      }

      const centerX = surfaceRef.current.clientWidth / 2;
      const centerY = surfaceRef.current.clientHeight / 2;
      const contentX = (gesture.focalX - centerX - gesture.startX) / gesture.startScale;
      const contentY = (gesture.focalY - centerY - gesture.startY) / gesture.startScale;
      applyTransform({
        scale,
        x: focal.x - centerX - contentX * scale,
        y: focal.y - centerY - contentY * scale,
      });
      return;
    }

    if (event.touches.length === 1 && gesture.type === "pan") {
      const touch = event.touches[0];
      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;
      const bounds = getBounds(transformRef.current.scale);
      const wantsVerticalPan = Math.abs(deltaY) >= Math.abs(deltaX);
      const nextX = gesture.startTransform.x + deltaX;
      const nextY = gesture.startTransform.y + deltaY;
      const atVerticalEdge =
        wantsVerticalPan &&
        ((deltaY > 0 && transformRef.current.y >= bounds.y) ||
          (deltaY < 0 && transformRef.current.y <= -bounds.y));

      if (atVerticalEdge) {
        return;
      }

      event.preventDefault();
      const now = performance.now();
      const elapsed = Math.max(now - gesture.lastTime, 1);
      gesture.velocityX = (touch.clientX - gesture.lastX) / elapsed;
      gesture.velocityY = (touch.clientY - gesture.lastY) / elapsed;
      gesture.lastX = touch.clientX;
      gesture.lastY = touch.clientY;
      gesture.lastTime = now;
      applyTransform({
        scale: transformRef.current.scale,
        x: nextX,
        y: nextY,
      });
      return;
    }

    if (event.touches.length === 1 && gesture.type === "swipe") {
      const touch = event.touches[0];
      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;

      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault();
      }
    }
  }

  function handleTouchEnd(event: globalThis.TouchEvent) {
    const gesture = gestureRef.current;

    if (!gesture || event.touches.length > 0) {
      return;
    }

    gestureRef.current = null;

    if (gesture.type === "pinch") {
      if (transformRef.current.scale <= minZoom + zoomEpsilon) {
        resetZoom();
        return;
      }
      setTransform(transformRef.current);
      return;
    }

    if (gesture.type === "pan") {
      startInertia(gesture.velocityX, gesture.velocityY);
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    const isHorizontalSwipe =
      Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

    if (!isHorizontalSwipe) {
      return;
    }

    if (deltaX < 0) {
      goToDirectionalPreviousPage();
    } else {
      goToDirectionalNextPage();
    }
  }

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    surface.addEventListener("touchstart", handleTouchStart, { passive: false });
    surface.addEventListener("touchmove", handleTouchMove, { passive: false });
    surface.addEventListener("touchend", handleTouchEnd, { passive: false });
    surface.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      surface.removeEventListener("touchstart", handleTouchStart);
      surface.removeEventListener("touchmove", handleTouchMove);
      surface.removeEventListener("touchend", handleTouchEnd);
      surface.removeEventListener("touchcancel", handleTouchEnd);
    };
  });

  if (library.length === 0) {
    return (
      <main className="manga-shell">
        <div className="manga-empty">
          <Link className="project-back-link" href="/#work">
            <ArrowLeft aria-hidden="true" />
            Project history
          </Link>
          <h1>Web Manga Viewer</h1>
          <p>
            Add story folders to <code>public/Manga</code> to load them into the
            demo reader.
          </p>
        </div>
      </main>
    );
  }

  const isFirstPage = safePageIndex <= 0;
  const isLastPage = safePageIndex >= pages.length - 1;
  const isFirstChapter = chapterIndex <= 0;
  const isLastChapter =
    chapterIndex >= Math.max((selectedStory?.chapters.length ?? 1) - 1, 0);

  return (
    <main className="manga-shell">
      <section className="manga-reader" aria-labelledby="manga-title">
        <aside className="manga-sidebar" aria-label="Manga controls">
          <Link className="project-back-link" href="/#work">
            <ArrowLeft aria-hidden="true" />
            Project history
          </Link>

          <div>
            <p className="eyebrow">Demo</p>
            <h1 id="manga-title">Web Manga Viewer</h1>
            <p>
              Load a local manga folder, pick a chapter, and read through the
              pages in a browser-friendly view.
            </p>
          </div>

          <label className="manga-field" htmlFor="story-select">
            Story
            <select
              id="story-select"
              onChange={(event) => {
                setStoryIndex(Number(event.target.value));
                setChapterIndex(0);
                setPageIndex(0);
                resetZoom();
              }}
              suppressHydrationWarning
              value={storyIndex}
            >
              {library.map((story, index) => (
                <option key={story.name} value={index}>
                  {story.name}
                </option>
              ))}
            </select>
          </label>

          <label className="manga-field" htmlFor="chapter-select">
            Chapter
            <select
              id="chapter-select"
              onChange={(event) => {
                setChapterIndex(Number(event.target.value));
                setPageIndex(0);
                resetZoom();
              }}
              suppressHydrationWarning
              value={chapterIndex}
            >
              {chapterOptions.map((chapter) => (
                <option key={chapter.label} value={chapter.value}>
                  {chapter.label}
                </option>
              ))}
            </select>
          </label>

          <label className="manga-field" htmlFor="page-range">
            Page {safePageIndex + 1} of {pages.length}
            <input
              id="page-range"
              max={Math.max(pages.length - 1, 0)}
              min={0}
              onChange={(event) => setPageIndex(Number(event.target.value))}
              type="range"
              value={safePageIndex}
            />
          </label>

          <div className="manga-toggle-group" aria-label="Reading direction">
            <button
              aria-pressed={direction === "rtl"}
              onClick={() => setDirection("rtl")}
              type="button"
            >
              RTL
            </button>
            <button
              aria-pressed={direction === "ltr"}
              onClick={() => setDirection("ltr")}
              type="button"
            >
              LTR
            </button>
          </div>

          <div className="manga-icon-row" aria-label="Viewer mode">
            <button
              aria-label="Fit page height"
              aria-pressed={fitMode === "height"}
              onClick={() => setFitMode("height")}
              type="button"
              title="Fit page height"
            >
              <Maximize2 aria-hidden="true" />
            </button>
            <button
              aria-label="Fit page width"
              aria-pressed={fitMode === "width"}
              onClick={() => setFitMode("width")}
              type="button"
              title="Fit page width"
            >
              <PanelTop aria-hidden="true" />
            </button>
            <button
              aria-label="Show all pages"
              aria-pressed={showAllPages}
              onClick={() => setShowAllPages((current) => !current)}
              type="button"
              title="Show all pages"
            >
              <Columns2 aria-hidden="true" />
            </button>
            <button
              aria-label="Zoom out"
              disabled={!isZoomed}
              onClick={() => zoomAroundPoint(transform.scale - 0.35)}
              type="button"
              title="Zoom out"
            >
              <ZoomOut aria-hidden="true" />
            </button>
            <button
              aria-label="Reset zoom"
              disabled={!isZoomed}
              onClick={resetZoom}
              type="button"
              title="Reset zoom"
            >
              <RotateCcw aria-hidden="true" />
            </button>
            <button
              aria-label="Zoom in"
              disabled={transform.scale >= maxZoom}
              onClick={() => zoomAroundPoint(transform.scale + 0.35)}
              type="button"
              title="Zoom in"
            >
              <ZoomIn aria-hidden="true" />
            </button>
          </div>

          <div className="manga-chapter-nav">
            <button
              disabled={isFirstChapter}
              onClick={goToPreviousChapter}
              type="button"
            >
              Previous chapter
            </button>
            <button disabled={isLastChapter} onClick={goToNextChapter} type="button">
              Next chapter
            </button>
          </div>
        </aside>

        <section className="manga-stage" aria-label="Manga pages">
          <div className="manga-stage-header">
            <div>
              <p>{selectedStory?.name}</p>
              <h2>{selectedChapter?.name}</h2>
            </div>
            <span>
              {safePageIndex + 1}/{pages.length}
            </span>
          </div>

          {showAllPages ? (
            <div className="manga-scroll-strip" data-direction={direction}>
              {pages.map((page, index) => (
                <img
                  alt={`${selectedChapter?.name} page ${index + 1}`}
                  key={page.src}
                  src={page.src}
                />
              ))}
            </div>
          ) : (
            <div className="manga-page-frame" data-fit={fitMode}>
              <button
                aria-label={direction === "rtl" ? "Next page" : "Previous page"}
                className="manga-page-button"
                disabled={direction === "rtl" ? isLastPage : isFirstPage}
                onClick={direction === "rtl" ? goToNextPage : goToPreviousPage}
                type="button"
              >
                <ChevronLeft aria-hidden="true" />
              </button>

              <div
                className="manga-zoom-surface"
                data-zoomed={isZoomed}
                onDoubleClick={() =>
                  zoomAroundPoint(isZoomed ? 1 : 2)
                }
                ref={surfaceRef}
              >
                {isZoomed && (
                  <button
                    aria-label="Exit zoom"
                    className="manga-zoom-exit"
                    onClick={resetZoom}
                    type="button"
                  >
                    <RotateCcw aria-hidden="true" />
                  </button>
                )}
                {currentPage && (
                  <img
                    alt={`${selectedChapter?.name} page ${safePageIndex + 1}`}
                    ref={imageRef}
                    src={currentPage.src}
                    style={{
                      transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                    }}
                  />
                )}
              </div>

              <button
                aria-label={direction === "rtl" ? "Previous page" : "Next page"}
                className="manga-page-button"
                disabled={direction === "rtl" ? isFirstPage : isLastPage}
                onClick={direction === "rtl" ? goToPreviousPage : goToNextPage}
                type="button"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
