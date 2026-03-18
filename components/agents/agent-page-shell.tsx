"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentWorkers } from "@/components/agents/agent-workers";

type AgentField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
};

type AgentPageShellProps = {
  title: string;
  icon: string;
  description: string;
  agentCount: number;
  outputType: string;
  fields: AgentField[];
  agentType: string;
  steps?: string[];
};

type LogEntry = {
  time: string;
  elapsed: string;
  step: string;
  percentage: number;
};

function formatElapsed(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  if (mins > 0) return `${mins}m ${s}s`;
  return `${s}s`;
}

function ElapsedTimer({ startTime }: { startTime: number }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = now - startTime;
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);

  return (
    <span className="text-xs font-mono text-muted-foreground tabular-nums">
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export function AgentPageShell({
  title,
  icon,
  description,
  agentCount,
  outputType,
  fields,
  agentType,
  steps = [],
}: AgentPageShellProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const now = Date.now();
    setRunning(true);
    setProgress(0);
    setCurrentStep("Iniciando...");
    setResult(null);
    setError(null);
    setStartTime(now);
    setLog([{
      time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      elapsed: "0s",
      step: "Iniciando ejecución...",
      percentage: 0,
    }]);

    try {
      const res = await fetch(`/api/agents/${agentType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al ejecutar el agente");
        setRunning(false);
        return;
      }

      // Start SSE for progress
      const jobId = data.jobId;
      const eventSource = new EventSource(`/api/stream/${jobId}`);

      eventSource.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "progress") {
          setProgress(msg.percentage);
          setCurrentStep(msg.step);
          setLog((prev) => [
            ...prev,
            {
              time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              elapsed: formatElapsed(Date.now() - now),
              step: msg.step,
              percentage: msg.percentage,
            },
          ]);
        } else if (msg.type === "complete") {
          setResult(msg.output);
          setRunning(false);
          setLog((prev) => [
            ...prev,
            {
              time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              elapsed: formatElapsed(Date.now() - now),
              step: "Completado",
              percentage: 100,
            },
          ]);
          eventSource.close();
        } else if (msg.type === "error") {
          setError(msg.message);
          setRunning(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setError("Conexión perdida con el servidor");
        setRunning(false);
        eventSource.close();
      };
    } catch {
      setError("Error de conexión");
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <span className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="secondary">{agentCount} agentes</Badge>
          <Badge variant="outline">{outputType}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium mb-1.5 block">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <Textarea
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={3}
                  />
                ) : field.type === "select" ? (
                  <select
                    className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={running}
              className="w-full"
            >
              {running ? "Ejecutando..." : "Ejecutar Agente"}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Output / Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {running ? "Progreso" : result ? "Resultado" : "Output"}
              </CardTitle>
              {running && startTime > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <ElapsedTimer startTime={startTime} />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {running && (
              <div className="space-y-4">
                <AgentWorkers
                  currentStep={currentStep}
                  agentCount={agentCount}
                  progress={progress}
                />

                {/* Live activity log */}
                <div className="rounded-lg border border-border/40 bg-black/20 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border/30 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">Activity Log</span>
                  </div>
                  <ScrollArea className="h-[140px]">
                    <div className="p-2 space-y-0.5">
                      {log.map((entry, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 text-[11px] font-mono py-0.5 px-1 rounded ${
                            i === log.length - 1 ? "bg-primary/10 text-primary" : "text-muted-foreground/70"
                          }`}
                        >
                          <span className="text-muted-foreground/40 shrink-0">{entry.time}</span>
                          <span className="text-primary/50 shrink-0">[{entry.elapsed}]</span>
                          <span className="truncate">{entry.step}</span>
                          <span className="ml-auto shrink-0 text-muted-foreground/40">{entry.percentage}%</span>
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Step checklist */}
                {steps.length > 0 && (
                  <div className="space-y-1">
                    {steps.map((step, i) => {
                      const stepPct = ((i + 1) / steps.length) * 100;
                      const isDone = progress >= stepPct;
                      const isCurrent = !isDone && (i === 0 || progress >= ((i) / steps.length) * 100);
                      return (
                        <div
                          key={step}
                          className={`flex items-center gap-2 text-xs py-0.5 ${
                            isDone
                              ? "text-primary"
                              : isCurrent
                              ? "text-amber-400"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {isDone ? (
                            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 shrink-0 text-green-500">
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
                              <path d="M3.5 6L5.5 8L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          ) : isCurrent ? (
                            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 shrink-0 animate-spin">
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
                              <path d="M6 1A5 5 0 0 1 11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 shrink-0">
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" />
                            </svg>
                          )}
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {result && !running && (
              <div>
                {log.length > 0 && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                    <svg viewBox="0 0 12 12" className="w-3 h-3">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" />
                      <path d="M6 3V6L8 7.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" fill="none" />
                    </svg>
                    Completado en {log[log.length - 1]?.elapsed}
                  </div>
                )}
                <ScrollArea className="h-[400px]">
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                    {result}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {!running && !result && !error && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Configura los parámetros y ejecuta el agente para ver el resultado aquí.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
