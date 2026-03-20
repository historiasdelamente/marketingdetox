"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconHistorial } from "@/components/icons/agent-icons";

type OutputItem = {
  id: string;
  agent_type: string;
  title: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  tiktok: { label: "TikTok", color: "bg-rose-500/15 text-rose-400 border-rose-500/10" },
  emails: { label: "Emails", color: "bg-amber-500/15 text-amber-400 border-amber-500/10" },
  voiceover: { label: "Voiceover", color: "bg-violet-500/15 text-violet-400 border-violet-500/10" },
  talleres: { label: "Talleres", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/10" },
  clases: { label: "Clases", color: "bg-sky-500/15 text-sky-400 border-sky-500/10" },
  cursos: { label: "Cursos", color: "bg-orange-500/15 text-orange-400 border-orange-500/10" },
  libros: { label: "Libros", color: "bg-teal-500/15 text-teal-400 border-teal-500/10" },
  sora: { label: "Sora", color: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/10" },
};

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [filter, setFilter] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/outputs")
      .then((r) => r.json())
      .then((data) => setOutputs(data.outputs || []))
      .catch(() => {});
  }, []);

  const filtered = filter
    ? outputs.filter((o) => o.agent_type === filter)
    : outputs;

  const handleDownload = async (output: OutputItem) => {
    setDownloading(output.id);
    try {
      const res = await fetch(`/api/outputs/${output.id}`);
      if (!res.ok) throw new Error("Error descargando");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${output.title}.${output.file_type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Error al descargar el archivo");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.05] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/[0.1] border border-yellow-500/10 flex items-center justify-center">
              <IconHistorial className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground/90">Mis Archivos</h1>
              <p className="text-xs text-muted-foreground/50">
                {outputs.length} archivo{outputs.length !== 1 ? "s" : ""} guardado{outputs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-muted-foreground/40 hover:text-yellow-400/60 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-yellow-500/10"
          >
            Volver al chat
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              !filter
                ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                : "border-white/[0.06] text-muted-foreground/50 hover:border-yellow-500/15 hover:text-yellow-400/60"
            }`}
          >
            Todos ({outputs.length})
          </button>
          {Object.entries(AGENT_LABELS).map(([key, { label }]) => {
            const count = outputs.filter((o) => o.agent_type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  filter === key
                    ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                    : "border-white/[0.06] text-muted-foreground/50 hover:border-yellow-500/15 hover:text-yellow-400/60"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto terminal-scroll px-6 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-muted-foreground/30">
                <path d="M3 7.5A1.5 1.5 0 014.5 6h4.793a1 1 0 01.707.293L11.5 7.793A1 1 0 0012.207 8H19.5A1.5 1.5 0 0121 9.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-11z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground/40 mb-1">Aún no hay archivos guardados</p>
            <p className="text-xs text-muted-foreground/25">Genera contenido con un agente y haz click en "Guardar"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((output) => {
              const agentInfo = AGENT_LABELS[output.agent_type] || { label: output.agent_type, color: "bg-white/5 text-muted-foreground border-white/5" };
              return (
                <div
                  key={output.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-yellow-500/10 hover:bg-white/[0.03] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${agentInfo.color} shrink-0`}>
                      {agentInfo.label}
                    </span>
                    <span className="text-sm text-foreground/75 truncate">{output.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground/35">
                      <span>.{output.file_type}</span>
                      {output.file_size > 0 && (
                        <>
                          <span>·</span>
                          <span>{formatFileSize(output.file_size)}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{new Date(output.created_at).toLocaleDateString("es", { day: "numeric", month: "short" })}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(output)}
                      disabled={downloading === output.id}
                      className="chip-btn text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                        <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {downloading === output.id ? "..." : "Descargar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
