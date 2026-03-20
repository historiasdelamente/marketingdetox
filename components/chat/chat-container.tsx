"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ChatMessage } from "@/lib/chat/types";
import { AGENT_CONFIGS } from "@/lib/chat/agent-configs";
import { processAgentSelection, processUserInput, skipField } from "@/lib/chat/chat-engine";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { AgentSelector } from "./agent-selector";

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialAgent && messages.length === 0) {
      handleAgentSelect(initialAgent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAgent]);

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

    const startTime = Date.now();

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

      const jobId = data.jobId;
      const eventSource = new EventSource(`/api/stream/${jobId}`);

      eventSource.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "progress") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === progressMsgId
                ? { ...m, content: msg.step, progress: { step: msg.step, percentage: msg.percentage } }
                : m
            )
          );
        } else if (msg.type === "complete") {
          setMessages((prev) => prev.filter((m) => m.id !== progressMsgId));
          const config = AGENT_CONFIGS[activeAgent!];
          addMessages([{
            id: `output-${Date.now()}`,
            role: "agent",
            type: "output",
            content: "",
            timestamp: new Date(),
            agentType: activeAgent!,
            output: {
              content: msg.output,
              title: `${config?.title || "Resultado"} — ${formatElapsed(Date.now() - startTime)}`,
            },
          }]);
          setIsRunning(false);
          eventSource.close();
        } else if (msg.type === "error") {
          setMessages((prev) => prev.filter((m) => m.id !== progressMsgId));
          addMessages([{
            id: `error-${Date.now()}`,
            role: "agent",
            type: "error",
            content: msg.message,
            timestamp: new Date(),
          }]);
          setIsRunning(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setMessages((prev) => prev.filter((m) => m.id !== progressMsgId));
        addMessages([{
          id: `error-${Date.now()}`,
          role: "agent",
          type: "error",
          content: "Conexión perdida con el servidor",
          timestamp: new Date(),
        }]);
        setIsRunning(false);
        eventSource.close();
      };
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== progressMsgId));
      addMessages([{
        id: `error-${Date.now()}`,
        role: "agent",
        type: "error",
        content: "Error de conexión",
        timestamp: new Date(),
      }]);
      setIsRunning(false);
    }
  }, [activeAgent, collectedFields, addMessages]);

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
    if (value === "__reset__") {
      if (activeAgent) handleAgentSelect(activeAgent);
      return;
    }
    if (value === "__new__") {
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
