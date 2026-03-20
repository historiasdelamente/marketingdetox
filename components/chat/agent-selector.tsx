"use client";

import { AGENT_CONFIGS } from "@/lib/chat/agent-configs";

const ACCENT_COLORS: Record<string, string> = {
  rose: "from-rose-500/15 to-rose-600/5 border-rose-500/10 hover:border-rose-500/20",
  amber: "from-amber-500/15 to-amber-600/5 border-amber-500/10 hover:border-amber-500/20",
  violet: "from-violet-500/15 to-violet-600/5 border-violet-500/10 hover:border-violet-500/20",
  emerald: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/10 hover:border-emerald-500/20",
  sky: "from-sky-500/15 to-sky-600/5 border-sky-500/10 hover:border-sky-500/20",
  orange: "from-orange-500/15 to-orange-600/5 border-orange-500/10 hover:border-orange-500/20",
  teal: "from-teal-500/15 to-teal-600/5 border-teal-500/10 hover:border-teal-500/20",
  fuchsia: "from-fuchsia-500/15 to-fuchsia-600/5 border-fuchsia-500/10 hover:border-fuchsia-500/20",
};

const TEXT_COLORS: Record<string, string> = {
  rose: "text-rose-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  sky: "text-sky-400",
  orange: "text-orange-400",
  teal: "text-teal-400",
  fuchsia: "text-fuchsia-400",
};

export function AgentSelector({ onSelect }: { onSelect: (agentType: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Welcome */}
      <div className="text-center mb-8 chat-msg-enter">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 flex items-center justify-center mx-auto mb-4 border border-yellow-500/10">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-yellow-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M12 8C10.34 8 9 9.34 9 11s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M6 18.5C7.5 16 9.5 15 12 15s4.5 1 6 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground/90 mb-2">
          ¿Qué quieres crear hoy?
        </h1>
        <p className="text-sm text-muted-foreground/50">
          Selecciona un agente y te guiaré paso a paso
        </p>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(AGENT_CONFIGS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`group p-4 rounded-xl bg-gradient-to-br border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-left ${ACCENT_COLORS[config.accent] || ""}`}
          >
            <span className="text-2xl block mb-2">{config.icon}</span>
            <h3 className={`text-sm font-semibold mb-0.5 ${TEXT_COLORS[config.accent] || "text-foreground/80"}`}>
              {config.title}
            </h3>
            <p className="text-[10px] text-muted-foreground/40 leading-tight">
              {config.description}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[9px] text-muted-foreground/30">{config.agentCount} agentes</span>
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/30">
        <span>58 agentes</span>
        <span className="w-1 h-1 rounded-full bg-yellow-500/20" />
        <span>80 prompts</span>
        <span className="w-1 h-1 rounded-full bg-yellow-500/20" />
        <span>47 PDFs</span>
      </div>
    </div>
  );
}
