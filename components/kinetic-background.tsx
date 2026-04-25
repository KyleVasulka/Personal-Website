"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

type Particle = {
  angle: number;
  orbit: number;
  radius: number;
  speed: number;
  twinkle: number;
};

type NodePoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const particleCount = 160;
const nodeCount = 34;
const shootingStarCount = 18;
const fallbackNodeCount = 18;
const fallbackLinkCount = 15;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function KineticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const reduceMotion = prefersReducedMotion();
    const canvasElement = canvas;
    const context = canvasElement.getContext("2d");

    if (!context) {
      return;
    }

    const drawingContext = context;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let particles: Particle[] = [];
    let nodes: NodePoint[] = [];

    function resize() {
      const bounds = canvasElement.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvasElement.width = Math.floor(width * pixelRatio);
      canvasElement.height = Math.floor(height * pixelRatio);
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      particles = Array.from({ length: particleCount }, (_, index) => ({
        angle: (index / particleCount) * Math.PI * 10 + Math.random() * 0.7,
        orbit: Math.pow(index / particleCount, 0.78) * Math.min(width, height) * 0.56,
        radius: 0.55 + Math.random() * 1.65,
        speed: 0.00006 + Math.random() * 0.00012,
        twinkle: Math.random() * Math.PI * 2,
      }));

      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.28,
        radius: 1.1 + Math.random() * 2.1,
      }));

      if (reduceMotion) {
        requestAnimationFrame(drawStillFrame);
      }
    }

    function drawGalaxy(time: number) {
      const centerX = width * 0.7;
      const centerY = height * 0.36;

      drawingContext.save();
      drawingContext.globalCompositeOperation = "screen";
      drawingContext.translate(centerX, centerY);
      drawingContext.rotate(time * 0.0000012);

      const coreGradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, Math.min(width, height) * 0.24);
      coreGradient.addColorStop(0, "rgba(255, 240, 194, 0.48)");
      coreGradient.addColorStop(0.34, "rgba(109, 220, 199, 0.22)");
      coreGradient.addColorStop(1, "rgba(109, 220, 199, 0)");
      drawingContext.fillStyle = coreGradient;
      drawingContext.beginPath();
      drawingContext.ellipse(0, 0, Math.min(width, height) * 0.34, Math.min(width, height) * 0.17, -0.46, 0, Math.PI * 2);
      drawingContext.fill();

      for (const particle of particles) {
        const spiral = particle.angle + particle.orbit * 0.026 + time * particle.speed;
        const wobble = Math.sin(time * 0.00045 + particle.twinkle) * 7;
        const x = Math.cos(spiral) * (particle.orbit + wobble);
        const y = Math.sin(spiral) * (particle.orbit * 0.42 + wobble * 0.25);
        const opacity = 0.28 + Math.sin(time * 0.0015 + particle.twinkle) * 0.16;

        drawingContext.fillStyle = `rgba(217, 244, 255, ${opacity})`;
        drawingContext.beginPath();
        drawingContext.arc(x, y, particle.radius, 0, Math.PI * 2);
        drawingContext.fill();
      }

      drawingContext.restore();
    }

    function drawNodes(time: number) {
      drawingContext.save();
      drawingContext.globalCompositeOperation = "screen";

      if (!reduceMotion) {
        for (const node of nodes) {
          node.x += node.vx + Math.sin(time * 0.0004 + node.y * 0.01) * 0.045;
          node.y += node.vy + Math.cos(time * 0.00032 + node.x * 0.01) * 0.04;

          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i];
          const second = nodes[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          const maxDistance = Math.min(width, height) * 0.2;

          if (distance < maxDistance) {
            const alpha = (1 - distance / maxDistance) * 0.24;
            drawingContext.strokeStyle = `rgba(128, 218, 194, ${alpha})`;
            drawingContext.lineWidth = 1;
            drawingContext.beginPath();
            drawingContext.moveTo(first.x, first.y);
            drawingContext.lineTo(second.x, second.y);
            drawingContext.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = Math.sin(time * 0.002 + node.x) * 0.4;
        drawingContext.fillStyle = "rgba(205, 255, 233, 0.74)";
        drawingContext.beginPath();
        drawingContext.arc(node.x, node.y, node.radius + pulse, 0, Math.PI * 2);
        drawingContext.fill();
      }

      drawingContext.restore();
    }

    function draw(time: number) {
      drawingContext.clearRect(0, 0, width, height);
      drawGalaxy(time);
      drawNodes(time);
      animationFrame = requestAnimationFrame(draw);
    }

    function drawStillFrame() {
      drawingContext.clearRect(0, 0, width, height);
      drawGalaxy(1800);
      drawNodes(1800);
    }

    resize();
    if (reduceMotion) {
      drawStillFrame();
    } else {
      animationFrame = requestAnimationFrame(draw);
    }
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="kinetic-background" aria-hidden="true">
      <div className="ambient-network">
        {Array.from({ length: fallbackLinkCount }, (_, index) => (
          <span
            className="ambient-link"
            key={`link-${index}`}
            style={{ "--network-index": index } as CSSProperties}
          />
        ))}
        {Array.from({ length: fallbackNodeCount }, (_, index) => (
          <span
            className="ambient-node"
            key={`node-${index}`}
            style={{ "--network-index": index } as CSSProperties}
          />
        ))}
      </div>
      <canvas ref={canvasRef} />
      <div className="shooting-stars">
        {Array.from({ length: shootingStarCount }, (_, index) => (
          <span
            className="shooting-star"
            key={index}
            style={{ "--star-index": index } as CSSProperties}
          />
        ))}
      </div>
      <div className="kinetic-scanline" />
    </div>
  );
}
