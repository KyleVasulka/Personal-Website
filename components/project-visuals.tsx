"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as THREE from "three";

export function HarmonicPianoShowcase() {
  return (
    <section className="feature-showcase" data-reveal>
      <Link
        className="feature-card-link"
        href="/projects/harmonic-piano"
        aria-label="Read the Harmonic Piano writeup"
      />
      <div className="feature-copy">
        <p className="eyebrow">Featured experiment</p>
        <h3>
          <Link className="feature-title-link" href="/projects/harmonic-piano">
            Harmonic Piano
          </Link>
        </h3>
        <p>
          A synthesizer interface for sculpting the harmonic content of each
          note in real time. Draw the spectrum, hear the timbre shift, and save
          tones as playable presets.
        </p>
        <div className="history-links">
          <Link href="/projects/harmonic-piano">
            Read writeup
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <a href="https://youtu.be/gYpqAZQKDLQ">
            Watch demo
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="https://www.youtube.com/watch?v=rRnOtKlg4jA">
            Inspiration
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
      <Link
        className="piano-mockup-frame"
        href="/projects/harmonic-piano"
        aria-label="Read the Harmonic Piano writeup"
      >
        <Image
          alt="Harmonic Piano synthesizer mockup"
          height={820}
          loading="eager"
          src="/harmonic-piano-mockup.svg"
          width={1440}
        />
      </Link>
    </section>
  );
}

export function ProjectModelScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const canvasWrapElement = canvasWrapRef.current;

    if (!canvasElement || !canvasWrapElement) {
      return;
    }

    const wrapElement = canvasWrapElement;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasElement,
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const group = new THREE.Group();
    const accent = new THREE.Color("#adc49c");
    const cyan = new THREE.Color("#5ad7ff");
    const amber = new THREE.Color("#f0b477");
    const material = new THREE.MeshStandardMaterial({
      color: "#d8d3c8",
      metalness: 0.34,
      roughness: 0.42,
    });
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });

    camera.position.set(0, 0.35, 7.2);
    scene.add(new THREE.AmbientLight("#ffffff", 1.2));

    const keyLight = new THREE.DirectionalLight("#ffffff", 2.1);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight("#5ad7ff", 14, 10);
    rimLight.position.set(-3, 1.5, 2);
    scene.add(rimLight);

    const torus = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.95, 0.22, 130, 14),
      material,
    );
    torus.position.x = -1.6;
    group.add(torus);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.01, 12, 120),
      wireMaterial,
    );
    orbit.rotation.x = Math.PI / 2.8;
    group.add(orbit);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.15, 1.15),
      new THREE.MeshStandardMaterial({
        color: cyan,
        emissive: cyan,
        emissiveIntensity: 0.12,
        metalness: 0.15,
        roughness: 0.35,
      }),
    );
    cube.position.set(1.45, 0.2, 0.1);
    cube.rotation.set(0.4, 0.7, 0.1);
    group.add(cube);

    const droneMaterial = new THREE.MeshStandardMaterial({
      color: amber,
      emissive: amber,
      emissiveIntensity: 0.18,
      metalness: 0.2,
      roughness: 0.5,
    });

    for (let index = 0; index < 6; index += 1) {
      const angle = (index / 6) * Math.PI * 2;
      const puck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24),
        droneMaterial,
      );
      puck.position.set(Math.cos(angle) * 2.35, Math.sin(angle) * 0.95, -0.2);
      puck.rotation.x = Math.PI / 2;
      group.add(puck);
    }

    scene.add(group);

    let frame = 0;
    let animationId = 0;
    let width = 0;
    let height = 0;
    let hasVisibleFrame = false;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function resize() {
      const rect = canvasElement!.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(rect.width));
      const nextHeight = Math.max(1, Math.floor(rect.height));

      if (nextWidth === width && nextHeight === height) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function markCanvasReadyWhenPainted() {
      if (hasVisibleFrame || width < 1 || height < 1) {
        return;
      }

      const gl = renderer.getContext();
      const samplePoints = [0.24, 0.36, 0.48, 0.6, 0.72].flatMap((xRatio) =>
        [0.32, 0.44, 0.56, 0.68].map((yRatio) => [xRatio, yRatio]),
      );
      const pixel = new Uint8Array(4);

      try {
        hasVisibleFrame = samplePoints.some(([xRatio, yRatio]) => {
          gl.readPixels(
            Math.floor(width * xRatio),
            Math.floor(height * yRatio),
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixel,
          );

          return pixel[3] > 0;
        });
      } catch {
        hasVisibleFrame = true;
      }

      if (hasVisibleFrame) {
        wrapElement.classList.add("is-rendering");
      }
    }

    function animate() {
      resize();
      frame += reduceMotion ? 0 : 0.01;
      group.rotation.y = frame;
      group.rotation.x = Math.sin(frame * 0.7) * 0.12;
      torus.rotation.x += reduceMotion ? 0 : 0.006;
      cube.rotation.y -= reduceMotion ? 0 : 0.008;
      renderer.render(scene, camera);
      markCanvasReadyWhenPainted();
      animationId = window.requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      wrapElement.classList.remove("is-rendering");
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const objectMaterial = object.material;
          if (Array.isArray(objectMaterial)) {
            objectMaterial.forEach((entry) => entry.dispose());
          } else {
            objectMaterial.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <section className="model-showcase" data-reveal>
      <div className="model-copy">
        <p className="eyebrow">Visual systems</p>
        <h3>Software that reaches into the physical world.</h3>
        <p>
          The work spans AI tools, 3D games, drones, AR interfaces, robotics,
          and custom motor-driver hardware.
        </p>
      </div>
      <div
        className="model-canvas-wrap"
        ref={canvasWrapRef}
        aria-label="Rotating 3D project forms"
      >
        <div className="model-fallback" aria-hidden="true">
          <span className="model-fallback-orbit" />
          <span className="model-fallback-knot" />
          <span className="model-fallback-cube" />
          <span className="model-fallback-puck model-fallback-puck-a" />
          <span className="model-fallback-puck model-fallback-puck-b" />
          <span className="model-fallback-puck model-fallback-puck-c" />
          <span className="model-fallback-puck model-fallback-puck-d" />
        </div>
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}
