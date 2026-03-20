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
  { href: "/tiktok", label: "TikTok", Icon: IconTikTok, description: "Scripts virales", accent: "text-rose-400", bg: "from-rose-500/15 to-pink-500/5" },
  { href: "/emails", label: "Emails", Icon: IconEmails, description: "Email marketing", accent: "text-amber-400", bg: "from-amber-500/15 to-yellow-500/5" },
  { href: "/voiceover", label: "Voiceover", Icon: IconVoiceover, description: "Voiceovers psicológicos", accent: "text-violet-400", bg: "from-violet-500/15 to-purple-500/5" },
  { href: "/talleres", label: "Talleres", Icon: IconTalleres, description: "Talleres vivenciales", accent: "text-emerald-400", bg: "from-emerald-500/15 to-green-500/5" },
  { href: "/clases", label: "Clases", Icon: IconClases, description: "Clases en vivo", accent: "text-sky-400", bg: "from-sky-500/15 to-blue-500/5" },
  { href: "/cursos", label: "Cursos", Icon: IconCursos, description: "Programas educativos", accent: "text-orange-400", bg: "from-orange-500/15 to-amber-500/5" },
  { href: "/libros", label: "Libros", Icon: IconLibros, description: "Amazon & Hotmart", accent: "text-teal-400", bg: "from-teal-500/15 to-cyan-500/5" },
  { href: "/sora", label: "Sora Prompts", Icon: IconSora, description: "Videos con Sora IA", accent: "text-fuchsia-400", bg: "from-fuchsia-500/15 to-pink-500/5" },
];

const EXTRA = [
  { href: "/conocimiento", label: "Base de Conocimiento", Icon: IconConocimiento, accent: "text-violet-300", bg: "from-violet-500/15 to-purple-500/5" },
  { href: "/outputs", label: "Historial", Icon: IconHistorial, accent: "text-teal-300", bg: "from-teal-500/15 to-cyan-500/5" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar/80 backdrop-blur-xl border-r border-violet-500/[0.06] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <Link href="/" className="px-5 py-4 border-b border-violet-500/[0.06] flex items-center gap-3 hover:bg-violet-500/[0.03] transition-colors group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/15 to-teal-500/10 flex items-center justify-center shrink-0 group-hover:from-violet-500/20 group-hover:to-teal-500/15 transition-all">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-violet-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M12 8C10.34 8 9 9.34 9 11s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M6 18.5C7.5 16 9.5 15 12 15s4.5 1 6 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-violet-200 leading-tight">Marketing Detox</h1>
          <p className="text-[10px] text-violet-400/30">Historias de la Mente</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        <p className="text-[10px] uppercase tracking-wider text-violet-400/25 px-3 mb-2 font-medium">Agentes</p>
        {MODULES.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all duration-200 mb-0.5 relative",
                active
                  ? "bg-violet-500/[0.06] text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/60 hover:bg-violet-500/[0.04] hover:text-sidebar-foreground/80"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r bg-gradient-to-b from-violet-400 to-teal-400 opacity-60" />
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                active
                  ? `bg-gradient-to-br ${m.bg}`
                  : "bg-sidebar-accent/40"
              )}>
                <m.Icon className={cn("w-4.5 h-4.5", active ? m.accent : "text-sidebar-foreground/40")} />
              </div>
              <div className="min-w-0">
                <p className="leading-tight text-[13px]">{m.label}</p>
                <p className="text-[10px] text-muted-foreground/40 leading-tight truncate">{m.description}</p>
              </div>
            </Link>
          );
        })}

        <div className="my-3 mx-3 h-px bg-gradient-to-r from-violet-500/10 via-teal-500/5 to-transparent" />

        {EXTRA.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all duration-200 mb-0.5 relative",
                active
                  ? "bg-violet-500/[0.06] text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/60 hover:bg-violet-500/[0.04] hover:text-sidebar-foreground/80"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r bg-gradient-to-b from-violet-400 to-teal-400 opacity-60" />
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                active ? `bg-gradient-to-br ${m.bg}` : "bg-sidebar-accent/40"
              )}>
                <m.Icon className={cn("w-4.5 h-4.5", active ? m.accent : "text-sidebar-foreground/40")} />
              </div>
              <span className="text-[13px]">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-violet-500/[0.06] text-[10px] text-violet-400/25">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-pulse" />
          <span>Claude CLI activo</span>
        </div>
      </div>
    </aside>
  );
}
