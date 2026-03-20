"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentWorkers } from "@/components/agents/agent-workers";
import { TerminalOutput, type TerminalLine } from "@/components/effects/terminal-output";

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
    <span className="text-xs font-mono text-violet-300/40 tabular-nums">
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
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
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
    setTerminalLines([{
      time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
      text: "Iniciando ejecución del agente...",
      type: "step",
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
        setTerminalLines((prev) => [...prev, {
          time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
          text: data.error || "Error al ejecutar el agente",
          type: "error",
        }]);
        return;
      }

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
          setTerminalLines((prev) => [...prev, {
            time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
            text: `[${msg.percentage}%] ${msg.step}`,
            type: msg.percentage >= 100 ? "success" : "info",
          }]);
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
          setTerminalLines((prev) => [...prev, {
            time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
            text: `Proceso completado en ${formatElapsed(Date.now() - now)}`,
            type: "success",
          }]);
          eventSource.close();
        } else if (msg.type === "error") {
          setError(msg.message);
          setRunning(false);
          setTerminalLines((prev) => [...prev, {
            time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
            text: msg.message,
            type: "error",
          }]);
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
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/15 to-teal-500/10 text-violet-300 flex items-center justify-center text-lg font-bold">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-teal-300 bg-clip-text text-transparent">{title}</h1>
          <p className="text-sm text-muted-foreground/40">{description}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="secondary" className="bg-violet-500/[0.06] text-violet-300/50 border-violet-500/10 text-[10px]">
            {agentCount} agentes
          </Badge>
          <Badge variant="outline" className="border-teal-500/10 text-teal-300/40 text-[10px]">
            {outputType}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <Card className="glass-card border-violet-500/[0.06]">
          <CardHeader>
            <CardTitle className="text-base text-violet-200/70">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium mb-1.5 block text-violet-200/40">
                  {field.label}
                  {field.required && <span className="text-rose-400/50 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <Textarea
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={3}
                    className="bg-background/50 border-violet-500/[0.06] text-foreground/70 placeholder:text-violet-300/15 text-sm focus:border-violet-500/15 focus:ring-violet-500/10"
                  />
                ) : field.type === "select" ? (
                  <select
                    className="w-full rounded-lg border border-violet-500/[0.06] bg-background/50 px-3 py-2 text-sm text-foreground/70 focus:border-violet-500/15"
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
                    className="w-full rounded-lg border border-violet-500/[0.06] bg-background/50 px-3 py-2 text-sm text-foreground/70 placeholder:text-violet-300/15 focus:border-violet-500/15"
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
              className="w-full bg-gradient-to-r from-violet-600/20 to-teal-600/15 text-violet-200 border border-violet-500/10 hover:from-violet-600/30 hover:to-teal-600/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
            >
              {running ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" />
                  Ejecutando...
                </span>
              ) : (
                "Ejecutar Agente"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Output / Progress */}
        <Card className={`glass-card border-violet-500/[0.06] transition-all duration-500 ${
          result && !running ? "shadow-lg shadow-violet-500/5 border-violet-500/10" : ""
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-violet-200/70">
                {running ? "Progreso" : result ? "Resultado" : "Output"}
              </CardTitle>
              {running && startTime > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400/40 animate-pulse" />
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

                <TerminalOutput lines={terminalLines} />

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
                              ? "text-teal-300/50"
                              : isCurrent
                              ? "text-violet-300/60"
                              : "text-muted-foreground/20"
                          }`}
                        >
                          {isDone ? (
                            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 shrink-0 text-teal-400/60">
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
                              <path d="M3.5 6L5.5 8L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          ) : isCurrent ? (
                            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 shrink-0 animate-spin text-violet-400/50">
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
              <div className="rounded-xl bg-rose-500/5 border border-rose-500/10 p-4 text-sm text-rose-300/60">
                {error}
              </div>
            )}

            {result && !running && (
              <div>
                {log.length > 0 && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-teal-300/30">
                    <svg viewBox="0 0 12 12" className="w-3 h-3">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" />
                      <path d="M6 3V6L8 7.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" fill="none" />
                    </svg>
                    Completado en {log[log.length - 1]?.elapsed}
                  </div>
                )}
                <div className="rounded-xl glass-card overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-violet-500/[0.06]">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400/30" />
                      <span className="w-2 h-2 rounded-full bg-amber-400/30" />
                      <span className="w-2 h-2 rounded-full bg-teal-400/30" />
                    </div>
                    <span className="text-[9px] text-violet-300/25 ml-1">resultado</span>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed p-4 text-foreground/60">
                      {result}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            )}

            {!running && !result && !error && (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-teal-500/5 flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-violet-400/30">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    <circle cx="9" cy="9.5" r="1" fill="currentColor" />
                    <circle cx="15" cy="9.5" r="1" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground/30">
                  Configura los parámetros y ejecuta el agente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div ref={logEndRef} />
    </div>
  );
}
