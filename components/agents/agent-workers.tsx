"use client";

import { useEffect, useState } from "react";

const AGENT_COLORS = [
  "#d4a052", // gold
  "#7c9ae0", // blue
  "#e07c7c", // red
  "#7ce0a8", // green
  "#c07ce0", // purple
];

function BuilderAgent({
  index,
  progress,
  total,
}: {
  index: number;
  progress: number;
  total: number;
}) {
  const color = AGENT_COLORS[index % AGENT_COLORS.length];
  // Position agents spread along the built section of the bar
  const agentProgress = Math.min(progress, 100);
  const spacing = agentProgress / Math.max(total, 1);
  const xPct = Math.min(spacing * index + spacing * 0.5, agentProgress - 2);
  const x = (xPct / 100) * 280 + 10;
  const groundY = 52;
  const delay = index * 0.2;

  return (
    <g>
      {/* Shadow */}
      <ellipse cx={x} cy={groundY + 17} rx="7" ry="2" fill="rgba(0,0,0,0.3)" />

      {/* Body group with bounce */}
      <g>
        {/* Legs */}
        <line x1={x - 3} y1={groundY + 10} x2={x - 4} y2={groundY + 15} stroke={color} strokeWidth="2" strokeLinecap="round">
          <animate attributeName="x2" values={`${x - 5};${x - 3};${x - 5}`} dur="0.5s" begin={`${delay}s`} repeatCount="indefinite" />
        </line>
        <line x1={x + 3} y1={groundY + 10} x2={x + 4} y2={groundY + 15} stroke={color} strokeWidth="2" strokeLinecap="round">
          <animate attributeName="x2" values={`${x + 3};${x + 5};${x + 3}`} dur="0.5s" begin={`${delay + 0.25}s`} repeatCount="indefinite" />
        </line>

        {/* Body */}
        <rect x={x - 6} y={groundY - 2} width="12" height="13" rx="3" fill={color} opacity="0.9">
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="0.8s" begin={`${delay}s`} repeatCount="indefinite" />
        </rect>

        {/* Head */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="0.8s" begin={`${delay}s`} repeatCount="indefinite" />
          <rect x={x - 7} y={groundY - 14} width="14" height="13" rx="4" fill={color} />
          {/* Visor / Eyes */}
          <rect x={x - 5} y={groundY - 11} width="10" height="5" rx="2" fill="#1a1a1a" />
          <circle cx={x - 2} cy={groundY - 8.5} r="1.5" fill="#4ade80">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={x + 3} cy={groundY - 8.5} r="1.5" fill="#4ade80">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" begin={`${delay + 0.2}s`} repeatCount="indefinite" />
          </circle>
          {/* Antenna */}
          <line x1={x} y1={groundY - 14} x2={x} y2={groundY - 19} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx={x} cy={groundY - 20} r="2" fill={color}>
            <animate attributeName="fill" values={`${color};#fff;${color}`} dur="1s" begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        </g>

        {/* Arms - hammering / building animation */}
        {/* Left arm - holds tool */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="0.8s" begin={`${delay}s`} repeatCount="indefinite" />
          <line x1={x - 6} y1={groundY + 2} x2={x - 12} y2={groundY - 4} stroke={color} strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0,${x - 6},${groundY + 2};-20,${x - 6},${groundY + 2};0,${x - 6},${groundY + 2}" dur="0.5s" begin={`${delay}s`} repeatCount="indefinite" />
          </line>
        </g>
        {/* Right arm - working on bar */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="0.8s" begin={`${delay}s`} repeatCount="indefinite" />
          <line x1={x + 6} y1={groundY + 2} x2={x + 12} y2={groundY - 6} stroke={color} strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0,${x + 6},${groundY + 2};25,${x + 6},${groundY + 2};0,${x + 6},${groundY + 2}" dur="0.4s" begin={`${delay}s`} repeatCount="indefinite" />
          </line>
          {/* Tool/hammer */}
          <rect x={x + 10} y={groundY - 10} width="5" height="3" rx="1" fill="#888">
            <animateTransform attributeName="transform" type="rotate" values="0,${x + 6},${groundY + 2};25,${x + 6},${groundY + 2};0,${x + 6},${groundY + 2}" dur="0.4s" begin={`${delay}s`} repeatCount="indefinite" />
          </rect>
        </g>

        {/* Sparks when hammering */}
        <g>
          {[0, 1, 2].map((s) => (
            <circle
              key={s}
              cx={x + 12 + s * 3}
              cy={groundY - 6 - s * 2}
              r="1"
              fill="#ffd700"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="0.4s"
                begin={`${delay + s * 0.1}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="0;1.5;0"
                dur="0.4s"
                begin={`${delay + s * 0.1}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      </g>
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

  const barY = 72;
  const barHeight = 8;
  const barWidth = 280;
  const barX = 10;
  const filledWidth = (progress / 100) * barWidth;

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border/40 bg-gradient-to-b from-[#1a1510] to-[#0f0d0a] p-3">
      <svg viewBox="0 0 300 95" className="w-full h-auto" style={{ maxHeight: "160px" }}>
        {/* Background grid */}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`vline-${i}`}
            x1={barX + i * (barWidth / 10)}
            y1="0"
            x2={barX + i * (barWidth / 10)}
            y2="95"
            stroke="rgba(212, 160, 82, 0.04)"
            strokeWidth="0.5"
          />
        ))}

        {/* Percentage markers */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <text
            key={`pct-${pct}`}
            x={barX + (pct / 100) * barWidth}
            y={barY + barHeight + 9}
            textAnchor="middle"
            fontSize="5"
            fill="rgba(255,255,255,0.2)"
            fontFamily="monospace"
          >
            {pct}%
          </text>
        ))}

        {/* Progress bar background */}
        <rect
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
          rx="4"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />

        {/* Progress bar fill - "under construction" look */}
        <rect
          x={barX}
          y={barY}
          width={filledWidth}
          height={barHeight}
          rx="4"
          fill="url(#barGradient)"
        >
          <animate
            attributeName="opacity"
            values="0.85;1;0.85"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Construction edge - rough edge effect */}
        {filledWidth > 5 && (
          <g>
            {[0, 1, 2].map((i) => (
              <rect
                key={`edge-${i}`}
                x={barX + filledWidth - 2 + i}
                y={barY + i * 3}
                width="3"
                height="3"
                rx="0.5"
                fill="rgba(212, 160, 82, 0.5)"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur="0.6s"
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </g>
        )}

        {/* Glow on fill edge */}
        {filledWidth > 0 && (
          <circle
            cx={barX + filledWidth}
            cy={barY + barHeight / 2}
            r="6"
            fill="rgba(212, 160, 82, 0.25)"
          >
            <animate
              attributeName="r"
              values="4;8;4"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Agents building the bar */}
        {Array.from({ length: visibleAgents }).map((_, i) => (
          <BuilderAgent
            key={i}
            index={i}
            progress={progress}
            total={visibleAgents}
          />
        ))}

        {/* Floating data particles rising from bar */}
        {Array.from({ length: 6 }).map((_, i) => {
          const px = barX + Math.random() * filledWidth;
          return (
            <circle key={`part-${i}`} cx={px} cy={barY} r="1" fill="#d4a052">
              <animate
                attributeName="cy"
                values={`${barY};${barY - 25}`}
                dur={`${2 + i * 0.5}s`}
                begin={`${i * 0.7}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0"
                dur={`${2 + i * 0.5}s`}
                begin={`${i * 0.7}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="50%" stopColor="#d4a052" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>
      </svg>

      {/* Status text */}
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-primary font-mono">
            {visibleAgents} agente{visibleAgents > 1 ? "s" : ""} construyendo
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[60%] text-right">
          {currentStep}{dots}
        </span>
      </div>
    </div>
  );
}
