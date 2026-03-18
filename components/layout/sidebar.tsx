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
  IconConocimiento,
  IconHistorial,
} from "@/components/icons/agent-icons";

const MODULES = [
  { href: "/tiktok", label: "TikTok", Icon: IconTikTok, description: "Scripts virales", accent: "text-rose-400", bg: "from-rose-500/20 to-pink-500/10" },
  { href: "/emails", label: "Emails", Icon: IconEmails, description: "Email marketing", accent: "text-amber-400", bg: "from-amber-500/20 to-yellow-500/10" },
  { href: "/voiceover", label: "Voiceover", Icon: IconVoiceover, description: "Voiceovers psicológicos", accent: "text-violet-400", bg: "from-violet-500/20 to-purple-500/10" },
  { href: "/talleres", label: "Talleres", Icon: IconTalleres, description: "Talleres vivenciales", accent: "text-emerald-400", bg: "from-emerald-500/20 to-green-500/10" },
  { href: "/clases", label: "Clases", Icon: IconClases, description: "Clases en vivo", accent: "text-sky-400", bg: "from-sky-500/20 to-blue-500/10" },
  { href: "/cursos", label: "Cursos", Icon: IconCursos, description: "Programas educativos", accent: "text-orange-400", bg: "from-orange-500/20 to-amber-500/10" },
  { href: "/libros", label: "Libros", Icon: IconLibros, description: "Amazon & Hotmart", accent: "text-teal-400", bg: "from-teal-500/20 to-cyan-500/10" },
];

const EXTRA = [
  { href: "/conocimiento", label: "Base de Conocimiento", Icon: IconConocimiento, accent: "text-primary", bg: "from-primary/20 to-primary/5" },
  { href: "/outputs", label: "Historial", Icon: IconHistorial, accent: "text-primary", bg: "from-primary/20 to-primary/5" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <Link href="/" className="px-5 py-4 border-b border-sidebar-border flex items-center gap-3 hover:bg-sidebar-accent/30 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-primary leading-tight">Marketing Detox</h1>
          <p className="text-[10px] text-sidebar-foreground/50">Historias de la Mente</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 px-3 mb-2 font-medium">Agentes</p>
        {MODULES.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5",
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                active
                  ? `bg-gradient-to-br ${m.bg}`
                  : "bg-sidebar-accent/50"
              )}>
                <m.Icon className={cn("w-4.5 h-4.5", active ? m.accent : "text-sidebar-foreground/50")} />
              </div>
              <div className="min-w-0">
                <p className="leading-tight text-[13px]">{m.label}</p>
                <p className="text-[10px] text-muted-foreground/50 leading-tight truncate">{m.description}</p>
              </div>
            </Link>
          );
        })}

        <div className="my-3 mx-3 border-t border-sidebar-border/50" />

        {EXTRA.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5",
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                active ? `bg-gradient-to-br ${m.bg}` : "bg-sidebar-accent/50"
              )}>
                <m.Icon className={cn("w-4.5 h-4.5", active ? m.accent : "text-sidebar-foreground/50")} />
              </div>
              <span className="text-[13px]">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border/50 text-[10px] text-muted-foreground/30">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/70 animate-pulse" />
          Claude CLI activo
        </div>
      </div>
    </aside>
  );
}
