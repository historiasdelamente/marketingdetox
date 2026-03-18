"use client";

import { useEffect, useState } from "react";

const COLORS = ["#d4a052", "#7c9ae0", "#e07c7c", "#7ce0a8", "#c07ce0"];
const LABELS = ["analizando", "escribiendo", "investigando", "revisando", "creando"];

/**
 * A single robot agent sitting at a desk, typing on a laptop.
 */
function DeskAgent({ index, total }: { index: number; total: number }) {
  const color = COLORS[index % COLORS.length];
  const label = LABELS[index % LABELS.length];
  const delay = index * 0.4;
  const spacing = 280 / Math.max(total, 1);
  const cx = 20 + spacing * index + spacing * 0.3;
  const deskY = 58;

  return (
    <g>
      {/* === DESK === */}
      <rect x={cx - 18} y={deskY} width="36" height="3" rx="1" fill="rgba(255,255,255,0.06)" />
      {/* Desk legs */}
      <line x1={cx - 15} y1={deskY + 3} x2={cx - 15} y2={deskY + 12} stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
      <line x1={cx + 15} y1={deskY + 3} x2={cx + 15} y2={deskY + 12} stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

      {/* === LAPTOP === */}
      {/* Screen */}
      <rect x={cx - 9} y={deskY - 11} width="18" height="11" rx="1.5" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      {/* Screen glow */}
      <rect x={cx - 7} y={deskY - 9.5} width="14" height="8" rx="1" fill={color} opacity="0.12" />
      {/* Code lines on screen */}
      <line x1={cx - 5} y1={deskY - 7.5} x2={cx + 2} y2={deskY - 7.5} stroke={color} strokeWidth="0.8" opacity="0.5" strokeLinecap="round">
        <animate attributeName="x2" values={`${cx - 2};${cx + 5};${cx - 2}`} dur="1.5s" begin={`${delay}s`} repeatCount="indefinite" />
      </line>
      <line x1={cx - 5} y1={deskY - 5.5} x2={cx} y2={deskY - 5.5} stroke={color} strokeWidth="0.8" opacity="0.3" strokeLinecap="round">
        <animate attributeName="x2" values={`${cx - 1};${cx + 3};${cx - 1}`} dur="2s" begin={`${delay + 0.3}s`} repeatCount="indefinite" />
      </line>
      <line x1={cx - 5} y1={deskY - 3.5} x2={cx + 1} y2={deskY - 3.5} stroke={color} strokeWidth="0.8" opacity="0.2" strokeLinecap="round">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1.8s" begin={`${delay + 0.5}s`} repeatCount="indefinite" />
      </line>
      {/* Keyboard base */}
      <rect x={cx - 10} y={deskY - 0.5} width="20" height="1.5" rx="0.5" fill="rgba(255,255,255,0.06)" />

      {/* === ROBOT AGENT === */}
      <g>
        {/* Body bounce */}
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-1.5;0,0" dur="1.2s" begin={`${delay}s`} repeatCount="indefinite" />

        {/* Body */}
        <rect x={cx - 6} y={deskY - 24} width="12" height="10" rx="2.5" fill={color} opacity="0.85" />
        {/* Chest light */}
        <circle cx={cx} cy={deskY - 19} r="1.2" fill="#fff" opacity="0.3">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>

        {/* Head */}
        <rect x={cx - 7} y={deskY - 36} width="14" height="12" rx="3.5" fill={color} />
        {/* Face visor */}
        <rect x={cx - 5} y={deskY - 32.5} width="10" height="5.5" rx="2" fill="#0d0d15" />
        {/* Eyes */}
        <circle cx={cx - 2} cy={deskY - 29.5} r="1.5" fill="#4ade80">
          <animate attributeName="r" values="1.5;1.5;0.3;1.5" dur="4s" begin={`${delay + 1.5}s`} repeatCount="indefinite" />
        </circle>
        <circle cx={cx + 3} cy={deskY - 29.5} r="1.5" fill="#4ade80">
          <animate attributeName="r" values="1.5;1.5;0.3;1.5" dur="4s" begin={`${delay + 1.5}s`} repeatCount="indefinite" />
        </circle>

        {/* Antenna */}
        <line x1={cx} y1={deskY - 36} x2={cx} y2={deskY - 40} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={cx} cy={deskY - 41} r="2" fill={color}>
          <animate attributeName="fill" values={`${color};#fff;${color}`} dur="1.5s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>

        {/* Left arm - resting on desk */}
        <line x1={cx - 6} y1={deskY - 18} x2={cx - 12} y2={deskY - 4} stroke={color} strokeWidth="2" strokeLinecap="round" />

        {/* Right arm - typing */}
        <line x1={cx + 6} y1={deskY - 18} x2={cx + 8} y2={deskY - 4} stroke={color} strokeWidth="2" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values="0,${cx + 6},${deskY - 18};-8,${cx + 6},${deskY - 18};0,${cx + 6},${deskY - 18}" dur="0.35s" begin={`${delay}s`} repeatCount="indefinite" />
        </line>

        {/* Typing sparks */}
        {[0, 1].map((s) => (
          <circle key={s} cx={cx + 4 + s * 4} cy={deskY - 2} r="1" fill={color}>
            <animate attributeName="opacity" values="0;0.8;0" dur="0.5s" begin={`${delay + s * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${deskY - 2};${deskY - 6}`} dur="0.5s" begin={`${delay + s * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* Label */}
      <text x={cx} y={deskY + 20} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}

export function AgentWorkers({
  currentStep,
  agentCount,
  progress,
}: {
  currentStep: string;
  agentCount: number;
  progress: number;
}) {
  const [dots, setDots] = useState("");
  const visibleAgents = Math.min(
    Math.max(Math.ceil((progress / 100) * Math.min(agentCount, 5)), 1),
    5
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const barY = 82;
  const barWidth = 280;
  const barX = 10;
  const filledWidth = (progress / 100) * barWidth;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border/30 bg-gradient-to-b from-[#12100e] to-[#0a0908] p-4">
      <svg viewBox="0 0 300 100" className="w-full h-auto" style={{ maxHeight: "180px" }}>
        {/* Background ambient glow */}
        <defs>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="50%" stopColor="#d4a052" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Agents at desks */}
        {Array.from({ length: visibleAgents }).map((_, i) => (
          <DeskAgent key={i} index={i} total={visibleAgents} />
        ))}

        {/* Progress bar track */}
        <rect x={barX} y={barY} width={barWidth} height="5" rx="2.5" fill="rgba(255,255,255,0.04)" />

        {/* Progress bar fill */}
        <rect x={barX} y={barY} width={filledWidth} height="5" rx="2.5" fill="url(#barGrad)" opacity="0.85">
          <animate attributeName="opacity" values="0.75;1;0.75" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Edge glow */}
        {filledWidth > 5 && (
          <circle cx={barX + filledWidth} cy={barY + 2.5} r="4" fill="rgba(212,160,82,0.3)" filter="url(#glow)">
            <animate attributeName="r" values="3;6;3" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Percentage text */}
        <text x={barX + barWidth / 2} y={barY + 14} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.2)" fontFamily="monospace">
          {Math.round(progress)}%
        </text>
      </svg>

      {/* Status text */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-primary/80 font-mono">
            {visibleAgents} agente{visibleAgents > 1 ? "s" : ""} activo{visibleAgents > 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground/60 font-mono truncate max-w-[55%] text-right">
          {currentStep}{dots}
        </span>
      </div>
    </div>
  );
}
