"use client";

import { useEffect, useState } from "react";

const THOUGHTS = [
  "\u2727", "\u2726", "\u2022", "\u25CB", "\u25CF", "\u2023",
  "\u223F", "\u2248", "\u221E", "\u2261",
  "\u2660", "\u2665", "\u2666", "\u2663",
];

const COLORS = [
  "text-violet-400/15",
  "text-teal-300/12",
  "text-orange-300/10",
  "text-violet-300/10",
  "text-rose-300/8",
];

interface Particle {
  id: number;
  symbol: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
}

let nextId = 0;

function createParticle(): Particle {
  return {
    id: nextId++,
    symbol: THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)],
    x: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 20 + Math.random() * 25,
    size: 10 + Math.random() * 14,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export function FallingSymbols() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 14 }, () => createParticle()));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute select-none ${p.color}`}
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            animation: `thought-float ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
