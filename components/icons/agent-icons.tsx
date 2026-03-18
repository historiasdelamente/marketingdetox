/** SVG icons for each agent module - robot characters doing specific tasks */

export function IconTikTok({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Phone/screen */}
      <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Play button */}
      <path d="M10 8.5L15 12L10 15.5V8.5Z" fill="currentColor" opacity="0.7" />
      {/* Musical note */}
      <path d="M16 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="5" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconEmails({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Envelope */}
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Envelope flap */}
      <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Heart */}
      <path d="M12 11.5C12 11.5 10 9.5 10 8.5C10 7.5 11 7 12 8C13 7 14 7.5 14 8.5C14 9.5 12 11.5 12 11.5Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function IconVoiceover({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Microphone */}
      <rect x="9" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Stand */}
      <path d="M12 15V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 19H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sound waves */}
      <path d="M5 8C5 8 6 6 6 9C6 12 5 10 5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M19 8C19 8 18 6 18 9C18 12 19 10 19 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      {/* Outer waves */}
      <path d="M3 7C3 7 4 4 4 9C4 14 3 11 3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <path d="M21 7C21 7 20 4 20 9C20 14 21 11 21 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function IconTalleres({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Whiteboard */}
      <rect x="2" y="3" width="20" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Board stand */}
      <path d="M8 16L6 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 16L18 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Content lines on board */}
      <path d="M5 7H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M5 10H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      {/* People silhouettes */}
      <circle cx="17" cy="7" r="1.5" fill="currentColor" opacity="0.5" />
      <path d="M15 12C15 10.5 16 10 17 10C18 10 19 10.5 19 12" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

export function IconClases({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Camera/live indicator */}
      <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" opacity="0.6" />
      {/* Rec dot */}
      <circle cx="19" cy="5" r="2" fill="currentColor" opacity="0.8" />
      {/* Screen frame */}
      <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Base */}
      <path d="M8 20H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCursos({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Graduation cap */}
      <path d="M2 10L12 5L22 10L12 15L2 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 12V17C6 17 9 20 12 20C15 20 18 17 18 17V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Tassel */}
      <path d="M22 10V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="17" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function IconLibros({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Open book */}
      <path d="M12 5C12 5 9 3 5 3C3 3 2 4 2 4V18C2 18 3 17 5 17C9 17 12 19 12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5C12 5 15 3 19 3C21 3 22 4 22 4V18C22 18 21 17 19 17C15 17 12 19 12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Page lines */}
      <path d="M5 7H9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M5 10H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M15 7H19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M15 10H18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      {/* Spine */}
      <path d="M12 5V19" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

export function IconConocimiento({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Brain outline */}
      <path d="M12 2C9 2 7 4 7 6C5 6 3 8 3 10C3 12 4 13 5 14C4 15 4 17 5 18C6 19 8 20 10 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2C15 2 17 4 17 6C19 6 21 8 21 10C21 12 20 13 19 14C20 15 20 17 19 18C18 19 16 20 14 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Center line */}
      <path d="M12 2V22" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Neural connections */}
      <circle cx="9" cy="10" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="15" cy="10" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="12" cy="14" r="1" fill="currentColor" opacity="0.4" />
      {/* Stem */}
      <path d="M10 20L12 22L14 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHistorial({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Clock */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      {/* Hands */}
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Arrow (history) */}
      <path d="M3 12C3 7 7 3 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 8V12H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Map of agent type to icon component */
export const AGENT_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  tiktok: IconTikTok,
  emails: IconEmails,
  voiceover: IconVoiceover,
  talleres: IconTalleres,
  clases: IconClases,
  cursos: IconCursos,
  libros: IconLibros,
  conocimiento: IconConocimiento,
  historial: IconHistorial,
};
