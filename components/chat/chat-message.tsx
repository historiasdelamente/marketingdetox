"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/chat/types";
import { AgentWorkers } from "@/components/agents/agent-workers";

function AgentAvatar() {
  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center border border-[#D4AF37]/50">
      <span
        className="material-symbols-outlined text-[#D4AF37] text-lg"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        smart_toy
      </span>
    </div>
  );
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const boldReplaced = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    if (line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 py-0.5">
          <span className="text-[#D4AF37]/60 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: boldReplaced.slice(2) }} />
        </div>
      );
    }
    return <p key={i} className={line === "" ? "h-2" : ""} dangerouslySetInnerHTML={{ __html: boldReplaced }} />;
  });
}

function OutputBubble({
  message,
  onChipClick,
}: {
  message: ChatMessage;
  onChipClick?: (value: string) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!message.output?.content || !message.agentType) return;
    setSaving(true);
    try {
      const res = await fetch("/api/outputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: message.agentType,
          title: message.output.title || "Output",
          content: message.output.content,
          file_type: "md",
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.output?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-4 mb-6 chat-msg-agent max-w-3xl">
      <AgentAvatar />
      <div className="flex-1 space-y-4">
        <div className="chat-bubble-agent rounded-2xl rounded-tl-none px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#D4AF37]">✨</span>
            <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {message.output?.title || "Resultado"}
            </span>
          </div>
          <div className="bg-black/60 rounded-xl p-5 max-h-[400px] overflow-y-auto custom-scrollbar border border-[#D4AF37]/10">
            <pre className="whitespace-pre-wrap text-sm text-[#F5E0A3] leading-relaxed font-mono">
              {message.output?.content}
            </pre>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleCopy} className="flex items-center gap-2 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors px-2 py-1 font-bold">
            {copied ? (
              <><span className="text-green-400">✓</span> Copiado</>
            ) : (
              <><span className="material-symbols-outlined text-sm">content_copy</span> Copiar</>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className="flex items-center gap-2 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors px-2 py-1 font-bold disabled:opacity-50"
          >
            {saved ? (
              <><span className="text-green-400">✓</span> Guardado</>
            ) : saving ? (
              <><span className="w-2 h-2 rounded-full bg-[#D4AF37]/50 animate-pulse" /> Guardando...</>
            ) : (
              <><span className="material-symbols-outlined text-sm">save</span> Guardar</>
            )}
          </button>
          <button onClick={() => onChipClick?.("__new__")} className="flex items-center gap-2 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors px-2 py-1 font-bold">
            <span className="material-symbols-outlined text-sm">refresh</span> Generar otro
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatMessageBubble({
  message,
  onChipClick,
}: {
  message: ChatMessage;
  onChipClick?: (value: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex flex-row-reverse gap-4 mb-6 chat-msg-user max-w-3xl ml-auto">
        <div className="chat-bubble-user rounded-2xl rounded-tr-none px-6 py-4 max-w-[75%]">
          <p className="text-sm text-white leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === "progress") {
    const agentCount = 5;
    const pct = message.progress?.percentage || 0;
    return (
      <div className="mb-8 chat-msg-agent max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <AgentAvatar />
          <div>
            <span className="text-sm text-[#D4AF37] font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Agentes trabajando...
            </span>
            <span className="text-xs text-[#D4AF37]/50 ml-3">{pct}%</span>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/20 bg-[#0a0a0a] p-1">
          <AgentWorkers
            currentStep={message.progress?.step || "Iniciando..."}
            agentCount={agentCount}
            progress={pct}
          />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full progress-gradient transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2 truncate">{message.progress?.step}</p>
      </div>
    );
  }

  if (message.type === "output") {
    return <OutputBubble message={message} onChipClick={onChipClick} />;
  }

  if (message.type === "error") {
    return (
      <div className="flex gap-4 mb-6 chat-msg-agent max-w-3xl">
        <AgentAvatar />
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-tl-none px-6 py-4 bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-300">{message.content}</p>
            <button
              onClick={() => onChipClick?.("__retry__")}
              className="mt-2 text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">refresh</span> Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Agent text, field-prompt, suggestion-chips
  return (
    <div className="flex gap-4 mb-6 chat-msg-agent max-w-3xl">
      <AgentAvatar />
      <div className="flex-1 space-y-3">
        <div className="chat-bubble-agent rounded-2xl rounded-tl-none px-6 py-4">
          <div className="text-sm text-gray-300 leading-relaxed space-y-1">
            {renderMarkdown(message.content)}
          </div>
        </div>
        {message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.chips.map((chip) => (
              <button
                key={chip.value}
                onClick={() => onChipClick?.(chip.value)}
                className="chip-btn text-xs px-4 py-2 rounded-full"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
