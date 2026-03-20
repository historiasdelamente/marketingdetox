"use client";

import { useState, useRef, useEffect } from "react";

export function ChatInput({
  onSend,
  disabled,
  placeholder,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/[0.06] bg-background/80 backdrop-blur-md px-4 py-3">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Escribe aquí..."}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-foreground/85 placeholder:text-muted-foreground/40 focus:border-yellow-500/20 focus:ring-1 focus:ring-yellow-500/10 focus:outline-none transition-colors disabled:opacity-40"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/80 to-yellow-600/60 text-black flex items-center justify-center shrink-0 hover:from-yellow-500/90 hover:to-yellow-600/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-yellow-500/10"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
      {disabled && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50 animate-pulse" />
          <span className="text-xs text-muted-foreground/40">Procesando...</span>
        </div>
      )}
    </div>
  );
}
