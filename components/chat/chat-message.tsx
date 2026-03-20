"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/chat/types";

function AgentAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center shrink-0 border border-yellow-500/15">
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-yellow-400">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M12 8C10.34 8 9 9.34 9 11s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M6 18.5C7.5 16 9.5 15 12 15s4.5 1 6 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const boldReplaced = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground/90 font-semibold">$1</strong>');
    if (line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 py-0.5">
          <span className="text-yellow-500/60 shrink-0">•</span>
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
    <div className="flex gap-3 mb-4 chat-msg-agent">
      <AgentAvatar />
      <div className="flex-1 max-w-[85%]">
        <div className="chat-bubble-agent rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">✨</span>
            <span className="text-sm font-semibold text-foreground/85">{message.output?.title || "Resultado"}</span>
          </div>
          <div className="bg-black/20 rounded-xl p-4 max-h-[400px] overflow-y-auto terminal-scroll">
            <pre className="whitespace-pre-wrap text-sm text-foreground/65 leading-relaxed font-sans">
              {message.output?.content}
            </pre>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={handleCopy} className="chip-btn text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              {copied ? (
                <><span className="text-green-400">✓</span> Copiado</>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M3 11V3.5A.5.5 0 013.5 3H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  Copiar
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saved || saving}
              className="chip-btn text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {saved ? (
                <><span className="text-green-400">✓</span> Guardado</>
              ) : saving ? (
                <><span className="w-2 h-2 rounded-full bg-yellow-400/50 animate-pulse" /> Guardando...</>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M3 14V2.5A.5.5 0 013.5 2h7.793a.5.5 0 01.354.146l1.707 1.708a.5.5 0 01.146.354V14a.5.5 0 01-.5.5h-10A.5.5 0 013 14z" stroke="currentColor" strokeWidth="1.2" /><path d="M5.5 2v3h5V2" stroke="currentColor" strokeWidth="1" /><rect x="5" y="9" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" /></svg>
                  Guardar
                </>
              )}
            </button>
            <button onClick={() => onChipClick?.("__new__")} className="chip-btn text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Generar otro
            </button>
          </div>
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
      <div className="flex justify-end mb-4 chat-msg-user">
        <div className="chat-bubble-user rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%]">
          <p className="text-sm text-foreground/85 leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === "progress") {
    return (
      <div className="flex gap-3 mb-4 chat-msg-agent">
        <AgentAvatar />
        <div className="flex-1 max-w-[80%]">
          <div className="chat-bubble-agent rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400/60 animate-pulse" />
              <span className="text-xs text-yellow-400/70 font-medium">Procesando...</span>
            </div>
            <p className="text-sm text-foreground/60 mb-2">{message.progress?.step}</p>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full progress-gradient transition-all duration-500"
                style={{ width: `${message.progress?.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground/50 mt-1.5 text-right">
              {Math.round(message.progress?.percentage || 0)}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "output") {
    return (
      <OutputBubble message={message} onChipClick={onChipClick} />
    );
  }

  if (message.type === "error") {
    return (
      <div className="flex gap-3 mb-4 chat-msg-agent">
        <AgentAvatar />
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-red-500/10 border border-red-500/15">
            <p className="text-sm text-red-300/80">{message.content}</p>
            <button
              onClick={() => onChipClick?.("__retry__")}
              className="mt-2 text-xs text-red-400/70 hover:text-red-300 underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Agent text, field-prompt, suggestion-chips
  return (
    <div className="flex gap-3 mb-4 chat-msg-agent">
      <AgentAvatar />
      <div className="flex-1 max-w-[80%]">
        <div className="chat-bubble-agent rounded-2xl rounded-bl-md px-4 py-2.5">
          <div className="text-sm text-foreground/75 leading-relaxed space-y-1">
            {renderMarkdown(message.content)}
          </div>
        </div>
        {message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2.5 pl-1">
            {message.chips.map((chip) => (
              <button
                key={chip.value}
                onClick={() => onChipClick?.(chip.value)}
                className="chip-btn text-xs px-3 py-1.5 rounded-full"
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
