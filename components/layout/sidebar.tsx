"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconTikTok,
  IconEmails,
  IconVoiceover,
  IconTalleres,
  IconClases,
  IconCursos,
  IconLibros,
  IconSora,
  IconConocimiento,
  IconHistorial,
} from "@/components/icons/agent-icons";

const MODULES = [
  { href: "/tiktok", label: "TikTok", Icon: IconTikTok, description: "Scripts virales" },
  { href: "/emails", label: "Emails", Icon: IconEmails, description: "Email marketing" },
  { href: "/voiceover", label: "Voiceover", Icon: IconVoiceover, description: "Voiceovers psicológicos" },
  { href: "/talleres", label: "Talleres", Icon: IconTalleres, description: "Talleres vivenciales" },
  { href: "/clases", label: "Clases", Icon: IconClases, description: "Clases en vivo" },
  { href: "/cursos", label: "Cursos", Icon: IconCursos, description: "Programas educativos" },
  { href: "/libros", label: "Libros", Icon: IconLibros, description: "Amazon & Hotmart" },
  { href: "/sora", label: "Sora Prompts", Icon: IconSora, description: "Videos con Sora IA" },
];

const EXTRA = [
  { href: "/conocimiento", label: "Base de Conocimiento", Icon: IconConocimiento },
  { href: "/outputs", label: "Historial", Icon: IconHistorial },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar/90 backdrop-blur-xl border-r border-white/[0.05] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <Link href="/" className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-3 hover:bg-yellow-500/[0.03] transition-colors group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 flex items-center justify-center shrink-0 border border-yellow-500/10 group-hover:border-yellow-500/20 transition-all">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-yellow-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M12 8C10.34 8 9 9.34 9 11s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M6 18.5C7.5 16 9.5 15 12 15s4.5 1 6 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground/85 leading-tight">Marketing Detox</h1>
          <p className="text-[10px] text-yellow-400/40">Historias de la Mente</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 terminal-scroll">
        <p className="text-[10px] uppercase tracking-wider text-yellow-400/25 px-3 mb-2 font-medium">Agentes</p>
        {MODULES.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all duration-200 mb-0.5 relative",
                active
                  ? "bg-yellow-500/[0.08] text-foreground/90 font-medium"
                  : "text-foreground/50 hover:bg-white/[0.03] hover:text-foreground/70"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r bg-yellow-400/70" />
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                active
                  ? "bg-yellow-500/[0.12] border border-yellow-500/10"
                  : "bg-white/[0.03]"
              )}>
                <m.Icon className={cn("w-4.5 h-4.5", active ? "text-yellow-400" : "text-foreground/35")} />
              </div>
              <div className="min-w-0">
                <p className="leading-tight text-[13px]">{m.label}</p>
                <p className="text-[10px] text-muted-foreground/35 leading-tight truncate">{m.description}</p>
              </div>
            </Link>
          );
        })}

        <div className="my-3 mx-3 h-px bg-gradient-to-r from-yellow-500/10 via-white/5 to-transparent" />

        {EXTRA.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all duration-200 mb-0.5 relative",
                active
                  ? "bg-yellow-500/[0.08] text-foreground/90 font-medium"
                  : "text-foreground/50 hover:bg-white/[0.03] hover:text-foreground/70"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r bg-yellow-400/70" />
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                active ? "bg-yellow-500/[0.12] border border-yellow-500/10" : "bg-white/[0.03]"
              )}>
                <m.Icon className={cn("w-4.5 h-4.5", active ? "text-yellow-400" : "text-foreground/35")} />
              </div>
              <span className="text-[13px]">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.05] text-[10px] text-muted-foreground/30">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50 animate-pulse" />
          <span>Claude CLI activo</span>
        </div>
      </div>
    </aside>
  );
}
