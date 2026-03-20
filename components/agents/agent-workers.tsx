"use client";

import { useEffect, useState } from "react";

type RobotState = "typing" | "thinking" | "reading" | "celebrating" | "waving" | "hugging";

function getRobotState(progress: number): RobotState {
  if (progress < 25) return "typing";
  if (progress < 50) return "thinking";
  if (progress < 65) return "reading";
  if (progress < 80) return "celebrating";
  if (progress < 95) return "waving";
  return "hugging";
}

const STATE_LABELS: Record<RobotState, string> = {
  typing: "escribiendo",
  thinking: "analizando",
  reading: "leyendo",
  celebrating: "celebrando",
  waving: "saludando",
  hugging: "completado",
};

const AURA_COLORS = ["#a78bfa", "#5eead4", "#fb923c", "#f472b6", "#818cf8"];
const BODY_COLORS = ["#a78bfa", "#7dd3fc", "#f472b6", "#5eead4", "#c084fc"];

function Aura({ cx, cy, color, delay }: { cx: number; cy: number; color: string; delay: number }) {
  return (
    <circle cx={cx} cy={cy - 26} r="18" fill={color} opacity="0">
      <animate attributeName="opacity" values="0.08;0.18;0.08" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
      <animate attributeName="r" values="16;20;16" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  );
}

function RobotBase({ cx, deskY, color, auraColor, delay, children }: {
  cx: number; deskY: number; color: string; auraColor: string; delay: number; children: React.ReactNode;
}) {
  return (
    <g>
      {/* Aura glow */}
      <Aura cx={cx} cy={deskY} color={auraColor} delay={delay} />
      {/* Body */}
      <rect x={cx - 6} y={deskY - 24} width="12" height="10" rx="2.5" fill={color} opacity="0.75" />
      <circle cx={cx} cy={deskY - 19} r="1.2" fill="white" opacity="0.2">
        <animate attributeName="opacity" values="0.15;0.3;0.15" dur="2.5s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      {/* Head */}
      <rect x={cx - 7} y={deskY - 36} width="14" height="12" rx="4" fill={color} opacity="0.85" />
      <rect x={cx - 5} y={deskY - 32.5} width="10" height="5.5" rx="2.5" fill="rgba(10,8,18,0.8)" />
      {/* Antenna */}
      <line x1={cx} y1={deskY - 36} x2={cx} y2={deskY - 40} stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <circle cx={cx} cy={deskY - 41} r="1.8" fill={auraColor} opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      {children}
    </g>
  );
}

function TypingRobot({ cx, deskY, delay, color, aura }: { cx: number; deskY: number; delay: number; color: string; aura: string }) {
  return (
    <RobotBase cx={cx} deskY={deskY} color={color} auraColor={aura} delay={delay}>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0" dur="1.2s" begin={`${delay}s`} repeatCount="indefinite" />
        {/* Eyes focused */}
        <circle cx={cx - 2} cy={deskY - 29.5} r="1.4" fill={aura} opacity="0.8">
          <animate attributeName="r" values="1.4;1.4;0.3;1.4" dur="4s" begin={`${delay + 1.5}s`} repeatCount="indefinite" />
        </circle>
        <circle cx={cx + 3} cy={deskY - 29.5} r="1.4" fill={aura} opacity="0.8">
          <animate attributeName="r" values="1.4;1.4;0.3;1.4" dur="4s" begin={`${delay + 1.5}s`} repeatCount="indefinite" />
        </circle>
        {/* Left arm */}
        <line x1={cx - 6} y1={deskY - 18} x2={cx - 12} y2={deskY - 4} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        {/* Right arm typing */}
        <line x1={cx + 6} y1={deskY - 18} x2={cx + 8} y2={deskY - 4} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values={`0,${cx + 6},${deskY - 18};-8,${cx + 6},${deskY - 18};0,${cx + 6},${deskY - 18}`} dur="0.4s" begin={`${delay}s`} repeatCount="indefinite" />
        </line>
        {/* Soft sparks */}
        {[0, 1].map((s) => (
          <circle key={s} cx={cx + 3 + s * 4} cy={deskY - 2} r="0.8" fill={aura}>
            <animate attributeName="opacity" values="0;0.5;0" dur="0.6s" begin={`${delay + s * 0.25}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${deskY - 2};${deskY - 5}`} dur="0.6s" begin={`${delay + s * 0.25}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    </RobotBase>
  );
}

function ThinkingRobot({ cx, deskY, delay, color, aura }: { cx: number; deskY: number; delay: number; color: string; aura: string }) {
  return (
    <RobotBase cx={cx} deskY={deskY} color={color} auraColor={aura} delay={delay}>
      {/* Eyes looking up */}
      <circle cx={cx - 2} cy={deskY - 30.5} r="1.3" fill={aura} opacity="0.7">
        <animate attributeName="cy" values={`${deskY - 29.5};${deskY - 31};${deskY - 29.5}`} dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      <circle cx={cx + 3} cy={deskY - 30.5} r="1.3" fill={aura} opacity="0.7">
        <animate attributeName="cy" values={`${deskY - 29.5};${deskY - 31};${deskY - 29.5}`} dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      {/* Hand on chin */}
      <line x1={cx + 6} y1={deskY - 18} x2={cx + 3} y2={deskY - 26} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <line x1={cx - 6} y1={deskY - 18} x2={cx - 10} y2={deskY - 8} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* Thought bubbles */}
      {[0, 1, 2].map((d) => (
        <circle key={d} cx={cx + 10 + d * 2.5} cy={deskY - 34 - d * 3} r={1 + d * 0.4} fill={aura} opacity="0">
          <animate attributeName="opacity" values="0;0.35;0" dur="2.5s" begin={`${delay + d * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </RobotBase>
  );
}

function ReadingRobot({ cx, deskY, delay, color, aura }: { cx: number; deskY: number; delay: number; color: string; aura: string }) {
  return (
    <RobotBase cx={cx} deskY={deskY} color={color} auraColor={aura} delay={delay}>
      {/* Scanning eyes */}
      <circle cx={cx - 2} cy={deskY - 29.5} r="1.2" fill={aura} opacity="0.7">
        <animate attributeName="cx" values={`${cx - 3};${cx + 1};${cx - 3}`} dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      <circle cx={cx + 3} cy={deskY - 29.5} r="1.2" fill={aura} opacity="0.7">
        <animate attributeName="cx" values={`${cx + 2};${cx + 6};${cx + 2}`} dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      {/* Arms holding doc */}
      <line x1={cx - 6} y1={deskY - 18} x2={cx - 8} y2={deskY - 10} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <line x1={cx + 6} y1={deskY - 18} x2={cx + 8} y2={deskY - 10} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* Document */}
      <rect x={cx - 6} y={deskY - 12} width="12" height="9" rx="1.5" fill="rgba(167,139,250,0.06)" stroke={aura} strokeWidth="0.4" opacity="0.5" />
      {[0, 1, 2].map((l) => (
        <line key={l} x1={cx - 4} y1={deskY - 9 + l * 2.5} x2={cx + 3 - l} y2={deskY - 9 + l * 2.5} stroke={aura} strokeWidth="0.4" opacity="0.2" />
      ))}
    </RobotBase>
  );
}

function CelebratingRobot({ cx, deskY, delay, color, aura }: { cx: number; deskY: number; delay: number; color: string; aura: string }) {
  return (
    <RobotBase cx={cx} deskY={deskY} color={color} auraColor={aura} delay={delay}>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2.5;0,0" dur="0.5s" begin={`${delay}s`} repeatCount="indefinite" />
        {/* Happy star eyes */}
        <text x={cx - 3.5} y={deskY - 28} fontSize="3.5" fill={aura} fontFamily="sans-serif">\u2727</text>
        <text x={cx + 1} y={deskY - 28} fontSize="3.5" fill={aura} fontFamily="sans-serif">\u2727</text>
        {/* Arms up */}
        <line x1={cx - 6} y1={deskY - 20} x2={cx - 14} y2={deskY - 32} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values={`0,${cx - 6},${deskY - 20};-8,${cx - 6},${deskY - 20};0,${cx - 6},${deskY - 20}`} dur="0.4s" begin={`${delay}s`} repeatCount="indefinite" />
        </line>
        <line x1={cx + 6} y1={deskY - 20} x2={cx + 14} y2={deskY - 32} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values={`0,${cx + 6},${deskY - 20};8,${cx + 6},${deskY - 20};0,${cx + 6},${deskY - 20}`} dur="0.4s" begin={`${delay}s`} repeatCount="indefinite" />
        </line>
        {/* Sparkles */}
        {[-6, 0, 6].map((dx, i) => (
          <text key={i} x={cx + dx} y={deskY - 44} fontSize="3" fill={AURA_COLORS[i % AURA_COLORS.length]} fontFamily="sans-serif">
            <animate attributeName="y" values={`${deskY - 42};${deskY - 50};${deskY - 42}`} dur="1s" begin={`${delay + i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0" dur="1s" begin={`${delay + i * 0.2}s`} repeatCount="indefinite" />
            {"\u2727"}
          </text>
        ))}
      </g>
    </RobotBase>
  );
}

function WavingRobot({ cx, deskY, delay, color, aura }: { cx: number; deskY: number; delay: number; color: string; aura: string }) {
  return (
    <RobotBase cx={cx} deskY={deskY} color={color} auraColor={aura} delay={delay}>
      {/* Happy curved eyes */}
      <path d={`M${cx - 4} ${deskY - 29} Q${cx - 2} ${deskY - 31} ${cx} ${deskY - 29}`} stroke={aura} strokeWidth="0.9" fill="none" opacity="0.7" />
      <path d={`M${cx + 1} ${deskY - 29} Q${cx + 3} ${deskY - 31} ${cx + 5} ${deskY - 29}`} stroke={aura} strokeWidth="0.9" fill="none" opacity="0.7" />
      <path d={`M${cx - 2} ${deskY - 27} Q${cx} ${deskY - 25.5} ${cx + 3} ${deskY - 27}`} stroke={aura} strokeWidth="0.6" fill="none" opacity="0.4" />
      {/* Left arm resting */}
      <line x1={cx - 6} y1={deskY - 18} x2={cx - 10} y2={deskY - 8} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* Right arm waving */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values={`-15,${cx + 6},${deskY - 20};15,${cx + 6},${deskY - 20};-15,${cx + 6},${deskY - 20}`} dur="0.7s" begin={`${delay}s`} repeatCount="indefinite" />
        <line x1={cx + 6} y1={deskY - 20} x2={cx + 16} y2={deskY - 34} stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        <circle cx={cx + 16} cy={deskY - 35} r="1.8" fill={color} opacity="0.6" />
      </g>
    </RobotBase>
  );
}

function HuggingRobots({ cx, deskY, delay, color1, color2, aura1, aura2 }: {
  cx: number; deskY: number; delay: number; color1: string; color2: string; aura1: string; aura2: string;
}) {
  return (
    <g>
      <animateTransform attributeName="transform" type="rotate" values={`-1.5,${cx},${deskY};1.5,${cx},${deskY};-1.5,${cx},${deskY}`} dur="2.5s" begin={`${delay}s`} repeatCount="indefinite" />
      {/* Combined aura */}
      <ellipse cx={cx} cy={deskY - 26} rx="22" ry="16" fill="url(#hugAura)" opacity="0">
        <animate attributeName="opacity" values="0.06;0.14;0.06" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
      </ellipse>
      {/* Robot 1 */}
      <rect x={cx - 13} y={deskY - 24} width="11" height="9" rx="2.5" fill={color1} opacity="0.7" />
      <rect x={cx - 14} y={deskY - 35} width="13" height="11" rx="3.5" fill={color1} opacity="0.8" />
      <rect x={cx - 12} y={deskY - 31.5} width="9" height="5" rx="2.5" fill="rgba(10,8,18,0.8)" />
      <path d={`M${cx - 11} ${deskY - 29} Q${cx - 9} ${deskY - 31} ${cx - 7} ${deskY - 29}`} stroke={aura1} strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* Robot 2 */}
      <rect x={cx + 2} y={deskY - 24} width="11" height="9" rx="2.5" fill={color2} opacity="0.7" />
      <rect x={cx + 1} y={deskY - 35} width="13" height="11" rx="3.5" fill={color2} opacity="0.8" />
      <rect x={cx + 3} y={deskY - 31.5} width="9" height="5" rx="2.5" fill="rgba(10,8,18,0.8)" />
      <path d={`M${cx + 4} ${deskY - 29} Q${cx + 6} ${deskY - 31} ${cx + 8} ${deskY - 29}`} stroke={aura2} strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* Hugging arms */}
      <line x1={cx - 2} y1={deskY - 19} x2={cx + 8} y2={deskY - 19} stroke={color1} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <line x1={cx + 2} y1={deskY - 21} x2={cx - 8} y2={deskY - 21} stroke={color2} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      {/* Floating hearts */}
      {[0, 1, 2].map((h) => (
        <text key={h} x={cx - 5 + h * 6} y={deskY - 38} fontSize="4" fill={h === 1 ? aura2 : aura1} fontFamily="sans-serif">
          <animate attributeName="y" values={`${deskY - 38};${deskY - 48};${deskY - 38}`} dur="2.5s" begin={`${delay + h * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0" dur="2.5s" begin={`${delay + h * 0.6}s`} repeatCount="indefinite" />
          {"\u2665"}
        </text>
      ))}
    </g>
  );
}

function DeskWithLaptop({ cx, deskY }: { cx: number; deskY: number }) {
  return (
    <g>
      <rect x={cx - 18} y={deskY} width="36" height="3" rx="1" fill="rgba(167,139,250,0.03)" />
      <line x1={cx - 15} y1={deskY + 3} x2={cx - 15} y2={deskY + 12} stroke="rgba(167,139,250,0.02)" strokeWidth="1.5" />
      <line x1={cx + 15} y1={deskY + 3} x2={cx + 15} y2={deskY + 12} stroke="rgba(167,139,250,0.02)" strokeWidth="1.5" />
      <rect x={cx - 9} y={deskY - 11} width="18" height="11" rx="1.5" fill="rgba(10,8,18,0.6)" stroke="rgba(167,139,250,0.08)" strokeWidth="0.4" />
      <line x1={cx - 6} y1={deskY - 8} x2={cx + 3} y2={deskY - 8} stroke="rgba(167,139,250,0.15)" strokeWidth="0.5">
        <animate attributeName="x2" values={`${cx - 1};${cx + 5};${cx - 1}`} dur="2s" repeatCount="indefinite" />
      </line>
      <line x1={cx - 6} y1={deskY - 5.5} x2={cx + 1} y2={deskY - 5.5} stroke="rgba(94,234,212,0.1)" strokeWidth="0.5" />
      <rect x={cx - 10} y={deskY - 0.5} width="20" height="1.5" rx="0.5" fill="rgba(167,139,250,0.02)" />
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
  const robotState = getRobotState(progress);
  const visibleAgents = Math.min(
    Math.max(Math.ceil((progress / 100) * Math.min(agentCount, 5)), 1),
    5
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const barY = 82;
  const barWidth = 280;
  const barX = 10;
  const filledWidth = (progress / 100) * barWidth;

  return (
    <div className="relative w-full rounded-xl overflow-hidden glass-card p-4">
      <svg viewBox="0 0 300 100" className="w-full h-auto" style={{ maxHeight: "180px" }}>
        <defs>
          <linearGradient id="barGradMind" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
          <radialGradient id="hugAura">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: visibleAgents }).map((_, i) => {
          const spacing = 280 / Math.max(visibleAgents, 1);
          const cx = 20 + spacing * i + spacing * 0.3;
          const deskY = 58;
          const delay = i * 0.5;
          const color = BODY_COLORS[i % BODY_COLORS.length];
          const aura = AURA_COLORS[i % AURA_COLORS.length];

          return (
            <g key={i}>
              <DeskWithLaptop cx={cx} deskY={deskY} />

              {robotState === "typing" && <TypingRobot cx={cx} deskY={deskY} delay={delay} color={color} aura={aura} />}
              {robotState === "thinking" && <ThinkingRobot cx={cx} deskY={deskY} delay={delay} color={color} aura={aura} />}
              {robotState === "reading" && <ReadingRobot cx={cx} deskY={deskY} delay={delay} color={color} aura={aura} />}
              {robotState === "celebrating" && <CelebratingRobot cx={cx} deskY={deskY} delay={delay} color={color} aura={aura} />}
              {robotState === "waving" && <WavingRobot cx={cx} deskY={deskY} delay={delay} color={color} aura={aura} />}
              {robotState === "hugging" && i < visibleAgents - 1 && i % 2 === 0 && (
                <HuggingRobots cx={cx + spacing * 0.5} deskY={deskY} delay={delay} color1={color} color2={BODY_COLORS[(i + 1) % BODY_COLORS.length]} aura1={aura} aura2={AURA_COLORS[(i + 1) % AURA_COLORS.length]} />
              )}

              <text x={cx} y={deskY + 20} textAnchor="middle" fontSize="4" fill="rgba(167,139,250,0.2)" fontFamily="sans-serif">
                {STATE_LABELS[robotState]}
              </text>
            </g>
          );
        })}

        {/* Progress bar */}
        <rect x={barX} y={barY} width={barWidth} height="4" rx="2" fill="rgba(167,139,250,0.04)" />
        <rect x={barX} y={barY} width={filledWidth} height="4" rx="2" fill="url(#barGradMind)" opacity="0.7">
          <animate attributeName="opacity" values="0.6;0.8;0.6" dur="2.5s" repeatCount="indefinite" />
        </rect>

        {filledWidth > 5 && (
          <circle cx={barX + filledWidth} cy={barY + 2} r="3" fill="rgba(167,139,250,0.25)" filter="url(#softGlow)">
            <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}

        <text x={barX + barWidth / 2} y={barY + 13} textAnchor="middle" fontSize="4.5" fill="rgba(167,139,250,0.2)" fontFamily="sans-serif">
          {Math.round(progress)}%
        </text>
      </svg>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" />
          <span className="text-[11px] text-violet-300/40">
            {visibleAgents} agente{visibleAgents > 1 ? "s" : ""} {STATE_LABELS[robotState]}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground/30 truncate max-w-[55%] text-right">
          {currentStep}{dots}
        </span>
      </div>
    </div>
  );
}
