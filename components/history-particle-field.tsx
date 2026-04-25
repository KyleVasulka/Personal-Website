"use client";

import { useEffect, useRef } from "react";

type Particle = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
};

const particleCount = 130;
const pointerRadius = 155;
const linkDistance = 78;

function hasReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HistoryParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const canvasElement = canvas;
    const interactionTarget = canvasElement.parentElement;
    const context = canvasElement.getContext("2d");

    if (!context || !interactionTarget) {
      return;
    }

    const sectionElement = interactionTarget;
    const reducedMotion = hasReducedMotion();
    const drawingContext = context;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let particles: Particle[] = [];
    const pointer = {
      active: false,
      x: 0,
      y: 0,
    };

    function updateCanvasPosition() {
      const sectionBounds = sectionElement.getBoundingClientRect();
      const sectionTop = sectionBounds.top + window.scrollY;
      const maxOffset = Math.max(0, sectionBounds.height - height);
      const offset = Math.min(Math.max(window.scrollY - sectionTop, 0), maxOffset);
      canvasElement.style.transform = `translate3d(-50%, ${offset}px, 0)`;
    }

    function resize() {
      const bounds = canvasElement.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvasElement.width = Math.floor(width * pixelRatio);
      canvasElement.height = Math.floor(height * pixelRatio);
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      updateCanvasPosition();

      particles = Array.from({ length: particleCount }, () => {
        const baseX = Math.random() * width;
        const baseY = Math.random() * height;

        return {
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          size: 0.8 + Math.random() * 2.1,
          phase: Math.random() * Math.PI * 2,
        };
      });

      draw(reducedMotion ? 1200 : performance.now());
    }

    function updatePointer(event: PointerEvent) {
      const sectionBounds = sectionElement.getBoundingClientRect();

      if (event.clientY < sectionBounds.top || event.clientY > sectionBounds.bottom) {
        pointer.active = false;
        return;
      }

      const canvasBounds = canvasElement.getBoundingClientRect();
      pointer.active = true;
      pointer.x = event.clientX - canvasBounds.left;
      pointer.y = event.clientY - canvasBounds.top;
    }

    function clearPointer() {
      pointer.active = false;
    }

    function updateParticles(time: number) {
      for (const particle of particles) {
        const homeForceX = (particle.baseX - particle.x) * 0.0025;
        const homeForceY = (particle.baseY - particle.y) * 0.0025;
        const waveX = Math.sin(time * 0.00035 + particle.phase) * 0.018;
        const waveY = Math.cos(time * 0.00028 + particle.phase) * 0.018;

        particle.vx += homeForceX + waveX;
        particle.vy += homeForceY + waveY;

        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < pointerRadius && distance > 0.01) {
            const force = (1 - distance / pointerRadius) * 0.58;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        }

        particle.vx *= 0.94;
        particle.vy *= 0.94;
        particle.x += particle.vx;
        particle.y += particle.vy;
      }
    }

    function draw(time: number) {
      drawingContext.clearRect(0, 0, width, height);

      const backdrop = drawingContext.createRadialGradient(
        width * 0.54,
        height * 0.18,
        0,
        width * 0.54,
        height * 0.22,
        Math.max(width, height) * 0.72,
      );
      backdrop.addColorStop(0, "rgba(90, 215, 255, 0.07)");
      backdrop.addColorStop(0.42, "rgba(128, 218, 194, 0.032)");
      backdrop.addColorStop(1, "rgba(128, 218, 194, 0)");
      drawingContext.fillStyle = backdrop;
      drawingContext.fillRect(0, 0, width, height);

      if (!reducedMotion) {
        updateParticles(time);
      }

      drawingContext.save();
      drawingContext.globalCompositeOperation = "screen";

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const first = particles[i];
          const second = particles[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);

          if (distance < linkDistance) {
            const opacity = (1 - distance / linkDistance) * 0.105;
            drawingContext.strokeStyle = `rgba(128, 218, 194, ${opacity})`;
            drawingContext.lineWidth = 1;
            drawingContext.beginPath();
            drawingContext.moveTo(first.x, first.y);
            drawingContext.lineTo(second.x, second.y);
            drawingContext.stroke();
          }
        }
      }

      for (const particle of particles) {
        const pulse = Math.sin(time * 0.0012 + particle.phase) * 0.32;
        drawingContext.fillStyle = "rgba(215, 255, 236, 0.56)";
        drawingContext.beginPath();
        drawingContext.arc(particle.x, particle.y, Math.max(0.7, particle.size + pulse), 0, Math.PI * 2);
        drawingContext.fill();
      }

      if (pointer.active) {
        const aura = drawingContext.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          pointerRadius,
        );
        aura.addColorStop(0, "rgba(255, 240, 194, 0.16)");
        aura.addColorStop(0.5, "rgba(90, 215, 255, 0.07)");
        aura.addColorStop(1, "rgba(90, 215, 255, 0)");
        drawingContext.fillStyle = aura;
        drawingContext.beginPath();
        drawingContext.arc(pointer.x, pointer.y, pointerRadius, 0, Math.PI * 2);
        drawingContext.fill();
      }

      drawingContext.restore();

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateCanvasPosition, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", clearPointer);
    window.addEventListener("pointercancel", clearPointer);

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateCanvasPosition);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("pointercancel", clearPointer);
    };
  }, []);

  return <canvas className="history-particle-field" ref={canvasRef} aria-hidden="true" />;
}
