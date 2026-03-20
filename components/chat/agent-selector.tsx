"use client";

import Link from "next/link";
import { AGENT_CONFIGS } from "@/lib/chat/agent-configs";

const MATERIAL_ICONS: Record<string, string> = {
  tiktok: "music_note",
  emails: "mail",
  voiceover: "mic",
  talleres: "theater_comedy",
  clases: "library_books",
  cursos: "school",
  libros: "menu_book",
  sora: "movie",
  conocimiento: "database",
  outputs: "history",
};

export function AgentSelector({ onSelect }: { onSelect: (agentType: string) => void }) {
  return (
    <div className="max-w-7xl mx-auto py-12 px-8 lg:px-16">
      {/* Hero Header */}
      <div className="text-center mb-14 chat-msg-enter max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full border border-[#D4AF37]/40 p-1.5 bg-gradient-to-tr from-black to-zinc-900 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#A67C00]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#D4AF37] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ¿Qué quieres crear hoy?
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Selecciona un agente especializado para potenciar tu estrategia con{" "}
          <span className="text-[#D4AF37] font-bold">inteligencia artificial de élite</span>.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(AGENT_CONFIGS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="glass-card rounded-xl p-6 flex flex-col justify-between h-56 relative overflow-hidden group text-left"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-4 border border-[#D4AF37]/20">
                <span
                  className="material-symbols-outlined text-[#D4AF37]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {MATERIAL_ICONS[key] || "smart_toy"}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {config.title}
              </h3>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{config.description}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span
                className="text-xs px-2 py-1 bg-[#D4AF37]/10 text-[#FFD700] rounded border border-[#D4AF37]/20 font-bold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {config.agentCount} Agentes
              </span>
              <span className="material-symbols-outlined text-gray-600 group-hover:text-[#FFD700] transition-colors">
                arrow_forward
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* My files button */}
      <div className="mt-12 flex justify-center">
        <Link
          href="/outputs"
          className="flex items-center gap-3 px-8 py-4 rounded-xl border border-[#D4AF37]/30 bg-zinc-900/80 text-[#D4AF37] text-base font-bold hover:bg-[#D4AF37] hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="material-symbols-outlined">folder_open</span>
          Mis archivos guardados
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
        <span>58 agentes</span>
        <span className="w-1 h-1 rounded-full bg-[#D4AF37]/30" />
        <span>80 prompts</span>
        <span className="w-1 h-1 rounded-full bg-[#D4AF37]/30" />
        <span>47 PDFs</span>
      </div>
    </div>
  );
}
