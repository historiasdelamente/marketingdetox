"use client";

import { useEffect, useRef } from "react";

/**
 * Gradient blobs that drift slowly, representing abstract thoughts.
 * Uses canvas for smooth performance.
 */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const blobs = [
      { x: 0.2, y: 0.3, r: 250, vx: 0.15, vy: -0.1, color: "rgba(167, 139, 250, 0.04)" },  // violet
      { x: 0.7, y: 0.6, r: 300, vx: -0.1, vy: 0.12, color: "rgba(94, 234, 212, 0.03)" },    // teal
      { x: 0.5, y: 0.2, r: 200, vx: 0.08, vy: 0.15, color: "rgba(251, 146, 60, 0.025)" },   // warm orange
      { x: 0.3, y: 0.8, r: 280, vx: -0.12, vy: -0.08, color: "rgba(167, 139, 250, 0.03)" }, // violet 2
      { x: 0.8, y: 0.3, r: 220, vx: 0.1, vy: 0.1, color: "rgba(94, 234, 212, 0.025)" },     // teal 2
    ];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    function draw() {
      t += 0.002;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const blob of blobs) {
        const cx = (blob.x + Math.sin(t * blob.vx * 10) * 0.15) * canvas!.width;
        const cy = (blob.y + Math.cos(t * blob.vy * 10) * 0.15) * canvas!.height;
        const r = blob.r * (1 + Math.sin(t * 2) * 0.1);

        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "transparent");

        ctx!.fillStyle = grad;
        ctx!.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
