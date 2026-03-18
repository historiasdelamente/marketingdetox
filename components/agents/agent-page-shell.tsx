"use client";

import { useState } from "react";
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

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setRunning(true);
    setProgress(0);
    setCurrentStep("Iniciando...");
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/agents/${agentType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al ejecutar el agente");
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
        } else if (msg.type === "complete") {
          setResult(msg.output);
          setRunning(false);
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
            <CardTitle className="text-base">
              {running ? "Progreso" : result ? "Resultado" : "Output"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {running && (
              <div className="space-y-4">
                <AgentWorkers
                  currentStep={currentStep}
                  agentCount={agentCount}
                  progress={progress}
                />
                {steps.length > 0 && (
                  <div className="space-y-1">
                    {steps.map((step, i) => {
                      const stepPct = ((i + 1) / steps.length) * 100;
                      return (
                        <p
                          key={step}
                          className={`text-xs ${
                            progress >= stepPct
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {progress >= stepPct ? "✓" : "○"} {step}
                        </p>
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
              <ScrollArea className="h-[400px]">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {result}
                </pre>
              </ScrollArea>
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
