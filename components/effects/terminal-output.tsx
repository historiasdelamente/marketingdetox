"use client";

import { useEffect, useRef } from "react";

export interface TerminalLine {
  time: string;
  text: string;
  type?: "info" | "success" | "error" | "step";
}

export function TerminalOutput({ lines }: { lines: TerminalLine[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="rounded-xl glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-violet-500/[0.06]">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400/30" />
          <span className="w-2 h-2 rounded-full bg-amber-400/30" />
          <span className="w-2 h-2 rounded-full bg-teal-400/30" />
        </div>
        <span className="text-[9px] text-violet-300/25 ml-1">actividad</span>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        className="p-3 max-h-48 overflow-y-auto terminal-scroll text-[11px] leading-relaxed"
      >
        {lines.length === 0 && (
          <div className="text-violet-300/20">
            <span className="text-violet-400/30">&bull;</span> esperando ejecución...
            <span className="inline-block w-1.5 h-3.5 bg-violet-400/30 ml-0.5 align-middle" style={{ animation: "blink-cursor 1s step-end infinite" }} />
          </div>
        )}

        {lines.map((line, i) => {
          const isLast = i === lines.length - 1;
          const prefix = line.type === "step" ? "\u25B6" : line.type === "success" ? "\u2713" : line.type === "error" ? "\u2717" : "\u2022";

          return (
            <div key={i} className="flex gap-2 mb-0.5">
              <span className="text-violet-300/15 shrink-0 select-none w-10 text-right text-[10px]">{line.time}</span>
              <span className={`shrink-0 select-none text-[10px] ${
                line.type === "success" ? "text-teal-400/50" :
                line.type === "error" ? "text-rose-400/50" :
                line.type === "step" ? "text-violet-400/40" :
                "text-violet-300/20"
              }`}>
                {prefix}
              </span>
              <span className={`${
                line.type === "success" ? "text-teal-300/50" :
                line.type === "error" ? "text-rose-300/50" :
                line.type === "step" ? "text-violet-200/50" :
                "text-foreground/30"
              }`}>
                {line.text}
                {isLast && (
                  <span
                    className="inline-block w-1.5 h-3.5 bg-violet-400/30 ml-0.5 align-middle"
                    style={{ animation: "blink-cursor 1s step-end infinite" }}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
