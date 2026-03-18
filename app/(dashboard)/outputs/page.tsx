"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type OutputItem = {
  id: string;
  agent_type: string;
  title: string;
  file_type: string;
  created_at: string;
};

const AGENT_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  emails: "Emails",
  voiceover: "Voiceover",
  talleres: "Talleres",
  clases: "Clases",
  cursos: "Cursos",
  libros: "Libros",
};

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/outputs")
      .then((r) => r.json())
      .then((data) => setOutputs(data.outputs || []))
      .catch(() => {});
  }, []);

  const filtered = filter
    ? outputs.filter((o) => o.agent_type === filter)
    : outputs;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Historial de Outputs</h1>
        <p className="text-sm text-muted-foreground">
          Todos los contenidos generados por los agentes
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
            !filter ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
          }`}
        >
          Todos
        </button>
        {Object.entries(AGENT_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filter === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aún no hay outputs generados. Ejecuta un agente para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((output) => (
            <Card key={output.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {AGENT_LABELS[output.agent_type] || output.agent_type}
                    </Badge>
                    <CardTitle className="text-sm font-medium">
                      {output.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">.{output.file_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(output.created_at).toLocaleDateString("es")}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
