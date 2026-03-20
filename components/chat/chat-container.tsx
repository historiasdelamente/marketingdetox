"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ChatMessage } from "@/lib/chat/types";
import { AGENT_CONFIGS } from "@/lib/chat/agent-configs";
import { processAgentSelection, processUserInput, skipField } from "@/lib/chat/chat-engine";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { AgentSelector } from "./agent-selector";

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

    // Regular chip = field value
    handleSend(value);
  }, [activeAgent, collectedFields, currentFieldIndex, addMessages, handleExecute, handleSend, handleAgentSelect]);

  if (showSelector) {
    return (
      <div className="flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex-1 overflow-y-auto terminal-scroll" ref={scrollRef}>
          <AgentSelector onSelect={handleAgentSelect} />
        </div>
      </div>
    );
  }

  const config = activeAgent ? AGENT_CONFIGS[activeAgent] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Chat header */}
      {config && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-background/50 backdrop-blur-sm shrink-0">
          <span className="text-xl">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground/85 truncate">{config.title}</h2>
            <p className="text-[10px] text-muted-foreground/40 truncate">{config.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/outputs"
              className="text-xs text-muted-foreground/40 hover:text-yellow-400/60 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/[0.03] flex items-center gap-1.5 border border-transparent hover:border-yellow-500/10"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path d="M2 4.5A1.5 1.5 0 013.5 3h3.293a1 1 0 01.707.293L8.5 4.293A1 1 0 009.207 4.5H12.5A1.5 1.5 0 0114 6v6.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-8z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Mis archivos
            </Link>
            <button
              onClick={() => { setShowSelector(true); setMessages([]); setActiveAgent(null); }}
              className="text-xs text-muted-foreground/40 hover:text-yellow-400/60 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/[0.03]"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto terminal-scroll px-4 py-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} onChipClick={handleChipClick} />
          ))}
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isRunning}
        placeholder={config ? `Escríbele al agente de ${config.title}...` : "Escribe aquí..."}
      />
    </div>
  );
}
