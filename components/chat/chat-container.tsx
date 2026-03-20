"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ChatMessage } from "@/lib/chat/types";
import { AGENT_CONFIGS } from "@/lib/chat/agent-configs";
import { processAgentSelection, processUserInput, skipField } from "@/lib/chat/chat-engine";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { AgentSelector } from "./agent-selector";
import { useActiveJobs } from "@/lib/jobs/use-active-jobs";

const MATERIAL_ICONS: Record<string, string> = {
  tiktok: "movie_filter",
  emails: "alternate_email",
  voiceover: "record_voice_over",
  talleres: "rebase_edit",
  clases: "school",
  cursos: "local_library",
  libros: "menu_book",
  sora: "auto_awesome",
  conocimiento: "database",
  outputs: "history",
};

function formatElapsed(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  if (mins > 0) return `${mins}m ${s}s`;
  return `${s}s`;
}

export function ChatContainer({ initialAgent }: { initialAgent?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(initialAgent || null);
  const [collectedFields, setCollectedFields] = useState<Record<string, string>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSelector, setShowSelector] = useState(!initialAgent);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { startJob, getByAgent, consumeCompleted } = useActiveJobs();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // On mount: check if there's an active or completed job for this agent
  useEffect(() => {
    if (!initialAgent) return;

    const existingJob = getByAgent(initialAgent);
    if (existingJob) {
      if (existingJob.status === "running") {
        // Reconnect to running job
        setIsRunning(true);
        setShowSelector(false);
        const agentMsgs = processAgentSelection(initialAgent);
        const progressMsg: ChatMessage = {
          id: `progress-${existingJob.jobId}`,
          role: "agent",
          type: "progress",
          content: existingJob.step,
          timestamp: new Date(),
          progress: { step: existingJob.step, percentage: existingJob.progress },
        };
        setMessages([...agentMsgs, progressMsg]);
      } else if (existingJob.status === "completed" && existingJob.output) {
        // Show completed result
        setShowSelector(false);
        const agentMsgs = processAgentSelection(initialAgent);
        const config = AGENT_CONFIGS[initialAgent];
        const elapsed = Date.now() - existingJob.startedAt;
        const outputMsg: ChatMessage = {
          id: `output-${existingJob.jobId}`,
          role: "agent",
          type: "output",
          content: "",
          timestamp: new Date(),
          agentType: initialAgent,
          output: {
            content: existingJob.output,
            title: `${config?.title || "Resultado"} — ${formatElapsed(elapsed)}`,
          },
        };
        setMessages([...agentMsgs, outputMsg]);
        consumeCompleted(existingJob.jobId);
      }
    } else if (messages.length === 0) {
      handleAgentSelect(initialAgent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAgent]);

  // Poll the global store for progress updates on running jobs
  useEffect(() => {
    if (!isRunning || !activeAgent) return;

    const interval = setInterval(() => {
      const job = getByAgent(activeAgent);
      if (!job) return;

      if (job.status === "running") {
        setMessages((prev) =>
          prev.map((m) =>
            m.type === "progress"
              ? { ...m, content: job.step, progress: { step: job.step, percentage: job.progress } }
              : m
          )
        );
      } else if (job.status === "completed" && job.output) {
        // Job finished! Show result
        setMessages((prev) => prev.filter((m) => m.type !== "progress"));
        const config = AGENT_CONFIGS[activeAgent];
        const elapsed = Date.now() - job.startedAt;
        addMessages([{
          id: `output-${job.jobId}`,
          role: "agent",
          type: "output",
          content: "",
          timestamp: new Date(),
          agentType: activeAgent,
          output: {
            content: job.output,
            title: `${config?.title || "Resultado"} — ${formatElapsed(elapsed)}`,
          },
        }]);
        setIsRunning(false);
        consumeCompleted(job.jobId);
        clearInterval(interval);
      } else if (job.status === "failed") {
        setMessages((prev) => prev.filter((m) => m.type !== "progress"));
        addMessages([{
          id: `error-${job.jobId}`,
          role: "agent",
          type: "error",
          content: job.error || "Error en la ejecución",
          timestamp: new Date(),
        }]);
        setIsRunning(false);
        consumeCompleted(job.jobId);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, activeAgent]);

  const addMessages = useCallback((newMsgs: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...newMsgs]);
  }, []);

  const handleAgentSelect = useCallback((agentType: string) => {
    setActiveAgent(agentType);
    setShowSelector(false);
    setCollectedFields({});
    setCurrentFieldIndex(0);
    setIsRunning(false);
    const agentMsgs = processAgentSelection(agentType);
    setMessages(agentMsgs);
  }, []);

  const handleExecute = useCallback(async () => {
    if (!activeAgent) return;
    setIsRunning(true);

    const progressMsgId = `progress-${Date.now()}`;
    const progressMsg: ChatMessage = {
      id: progressMsgId,
      role: "agent",
      type: "progress",
      content: "Iniciando...",
      timestamp: new Date(),
      progress: { step: "Iniciando ejecución...", percentage: 0 },
    };
    addMessages([progressMsg]);

    try {
      const res = await fetch(`/api/agents/${activeAgent}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectedFields),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== progressMsgId));
        addMessages([{
          id: `error-${Date.now()}`,
          role: "agent",
          type: "error",
          content: data.error || "Error al ejecutar el agente",
          timestamp: new Date(),
        }]);
        setIsRunning(false);
        return;
      }

      // Register job in global store — it handles SSE connection
      startJob(data.jobId, activeAgent);

    } catch {
      setMessages((prev) => prev.filter((m) => m.type !== "progress"));
      addMessages([{
        id: `error-${Date.now()}`,
        role: "agent",
        type: "error",
        content: "Error de conexión",
        timestamp: new Date(),
      }]);
      setIsRunning(false);
    }
  }, [activeAgent, collectedFields, addMessages, startJob]);

  const handleSend = useCallback((text: string) => {
    if (!activeAgent) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      type: "text",
      content: text,
      timestamp: new Date(),
    };
    addMessages([userMsg]);

    const { messages: agentMsgs, newFields, newIndex, readyToExecute } =
      processUserInput(activeAgent, collectedFields, currentFieldIndex, text);

    setCollectedFields(newFields);
    setCurrentFieldIndex(newIndex);

    setTimeout(() => {
      addMessages(agentMsgs);
      if (readyToExecute) {
        handleExecute();
      }
    }, 300);
  }, [activeAgent, collectedFields, currentFieldIndex, addMessages, handleExecute]);

  const handleChipClick = useCallback((value: string) => {
    if (value === "__execute__") {
      handleExecute();
      return;
    }
    if (value === "__reset__" || value === "__new__") {
      if (activeAgent) handleAgentSelect(activeAgent);
      return;
    }
    if (value === "__retry__") {
      handleExecute();
      return;
    }
    if (value === "__skip__") {
      if (!activeAgent) return;
      const { messages: agentMsgs, newIndex, readyToExecute } =
        skipField(activeAgent, collectedFields, currentFieldIndex);
      setCurrentFieldIndex(newIndex);
      setTimeout(() => {
        addMessages(agentMsgs);
        if (readyToExecute) handleExecute();
      }, 200);
      return;
    }

    handleSend(value);
  }, [activeAgent, collectedFields, currentFieldIndex, addMessages, handleExecute, handleSend, handleAgentSelect]);

  if (showSelector) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
          <AgentSelector onSelect={handleAgentSelect} />
        </div>
      </div>
    );
  }

  const config = activeAgent ? AGENT_CONFIGS[activeAgent] : null;

  return (
    <div className="flex flex-col h-screen relative">
      {/* Chat header */}
      {config && (
        <header className="h-20 flex items-center justify-between px-10 glass-panel border-b border-[#D4AF37]/20 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#141414] flex items-center justify-center border border-[#D4AF37]/30">
              <span
                className="material-symbols-outlined text-[#D4AF37] text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {MATERIAL_ICONS[activeAgent!] || "smart_toy"}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {config.title}
              </h2>
              <p className="text-sm text-gray-500">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/outputs"
              className="text-gray-500 hover:text-[#D4AF37] transition-colors"
            >
              <span className="material-symbols-outlined">folder_open</span>
            </Link>
            <button
              onClick={() => { setShowSelector(true); setMessages([]); setActiveAgent(null); }}
              className="text-gray-500 hover:text-[#D4AF37] transition-colors"
            >
              <span className="material-symbols-outlined">swap_horiz</span>
            </button>
          </div>
        </header>
      )}

      {/* Messages */}
      <section className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8 pb-32" ref={scrollRef}>
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} onChipClick={handleChipClick} />
        ))}
      </section>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isRunning}
        placeholder={config ? `Describe lo que quieres crear con ${config.title}...` : "Escribe aquí..."}
      />
    </div>
  );
}
