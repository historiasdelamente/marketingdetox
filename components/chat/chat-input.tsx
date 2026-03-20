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
    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/95 to-transparent">
      <div className="max-w-4xl mx-auto flex items-end gap-4 glass-panel p-2 rounded-3xl border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] neon-glow-gold">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Describe lo que quieres crear..."}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none focus:ring-0 text-white py-3 px-4 resize-none custom-scrollbar max-h-32 placeholder-white/20 text-sm focus:outline-none disabled:opacity-40"
        />
        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className="w-12 h-12 rounded-full gold-bg-gradient text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined font-black">arrow_upward</span>
          </button>
        </div>
      </div>
      {disabled && (
        <p className="text-center text-xs text-[#D4AF37]/50 mt-3 font-medium tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
          Los agentes están trabajando en tu solicitud...
        </p>
      )}
    </div>
  );
}
