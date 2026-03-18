"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MODULES = [
  { href: "/tiktok", label: "TikTok", icon: "TT", description: "Scripts virales" },
  { href: "/emails", label: "Emails", icon: "EM", description: "Email marketing" },
  { href: "/voiceover", label: "Voiceover", icon: "VO", description: "Voiceovers psicológicos" },
  { href: "/talleres", label: "Talleres", icon: "TA", description: "Talleres vivenciales" },
  { href: "/clases", label: "Clases", icon: "CL", description: "Clases en vivo" },
  { href: "/cursos", label: "Cursos", icon: "CU", description: "Programas educativos" },
  { href: "/libros", label: "Libros", icon: "LI", description: "Amazon & Hotmart" },
];

const EXTRA = [
  { href: "/conocimiento", label: "Base de Conocimiento", icon: "BC" },
  { href: "/outputs", label: "Historial", icon: "HI" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-30">
      <Link href="/" className="px-6 py-5 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-primary">Marketing Detox</h1>
        <p className="text-xs text-sidebar-foreground/60">Historias de la Mente</p>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">Agentes</p>
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mb-0.5",
              pathname === m.href
                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <span className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
              pathname === m.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "bg-sidebar-accent text-sidebar-foreground/70"
            )}>
              {m.icon}
            </span>
            <div>
              <p className="leading-tight">{m.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{m.description}</p>
            </div>
          </Link>
        ))}

        <div className="my-3 border-t border-sidebar-border" />

        {EXTRA.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5",
              pathname === m.href
                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <span className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
              pathname === m.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "bg-sidebar-accent text-sidebar-foreground/70"
            )}>
              {m.icon}
            </span>
            <span>{m.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
