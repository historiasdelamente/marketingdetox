"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  tiktok: { label: "TikTok", color: "bg-rose-500/20 text-rose-400" },
  emails: { label: "Emails", color: "bg-amber-500/20 text-amber-400" },
  voiceover: { label: "Voiceover", color: "bg-violet-500/20 text-violet-400" },
  talleres: { label: "Talleres", color: "bg-emerald-500/20 text-emerald-400" },
  clases: { label: "Clases", color: "bg-sky-500/20 text-sky-400" },
  cursos: { label: "Cursos", color: "bg-orange-500/20 text-orange-400" },
  libros: { label: "Libros", color: "bg-teal-500/20 text-teal-400" },
};

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
      <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <IconHistorial className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Historial de Outputs</h1>
          <p className="text-sm text-muted-foreground">
            {outputs.length} contenido{outputs.length !== 1 ? "s" : ""} generado{outputs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
            !filter ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
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
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                filter === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Output list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-muted-foreground/40">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 8H16M8 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">
              Aún no hay outputs generados. Ejecuta un agente para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((output) => {
            const agentInfo = AGENT_LABELS[output.agent_type] || { label: output.agent_type, color: "bg-muted text-muted-foreground" };
            return (
              <Card key={output.id} className="hover:border-primary/20 transition-colors">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: badge + title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge className={`${agentInfo.color} border-0 text-[10px] shrink-0`}>
                        {agentInfo.label}
                      </Badge>
                      <CardTitle className="text-sm font-medium truncate">
                        {output.title}
                      </CardTitle>
                    </div>

                    {/* Right: meta + download */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                          <span>.{output.file_type}</span>
                          {output.file_size > 0 && (
                            <>
                              <span>&middot;</span>
                              <span>{formatFileSize(output.file_size)}</span>
                            </>
                          )}
                          <span>&middot;</span>
                          <span>{new Date(output.created_at).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 gap-1.5 text-xs"
                        onClick={() => handleDownload(output)}
                        disabled={downloading === output.id}
                      >
                        <DownloadIcon />
                        {downloading === output.id ? "..." : "Descargar"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
