"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MODULES = [
  { href: "/tiktok", label: "TikTok", icon: "movie_filter", description: "Scripts virales" },
  { href: "/emails", label: "Emails", icon: "alternate_email", description: "Email marketing" },
  { href: "/voiceover", label: "Voiceover", icon: "record_voice_over", description: "Voiceovers psicológicos" },
  { href: "/talleres", label: "Talleres", icon: "rebase_edit", description: "Talleres vivenciales" },
  { href: "/clases", label: "Clases", icon: "school", description: "Clases en vivo" },
  { href: "/cursos", label: "Cursos", icon: "local_library", description: "Programas educativos" },
  { href: "/libros", label: "Libros", icon: "menu_book", description: "Amazon & Hotmart" },
  { href: "/sora", label: "Sora Prompts", icon: "auto_awesome", description: "Videos con Sora IA" },
];

const EXTRA = [
  { href: "/conocimiento", label: "Base de Conocimiento", icon: "database" },
  { href: "/outputs", label: "Historial", icon: "history" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-black flex flex-col fixed left-0 top-0 z-30 border-r border-[#D4AF37]/10 shadow-[20px_0_40px_rgba(0,0,0,0.8)]">
      {/* Logo */}
      <Link href="/" className="px-6 py-6 border-b border-[#D4AF37]/10 block hover:bg-[#D4AF37]/[0.03] transition-colors">
        <h1 className="gold-gradient text-2xl font-bold tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Marketing Detox
        </h1>
        <p className="text-[#D4AF37]/60 text-xs tracking-widest mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Historias de la Mente
        </p>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar space-y-1">
        {MODULES.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 relative",
                active
                  ? "bg-gradient-to-r from-[#D4AF37]/10 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37] translate-x-0.5"
                  : "text-gray-500 hover:bg-white/5 hover:text-white"
              )}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-xl",
                  active ? "text-[#D4AF37]" : ""
                )}
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {m.icon}
              </span>
              <span className="font-medium tracking-wide">{m.label}</span>
            </Link>
          );
        })}

        <div className="my-4 mx-4 h-px bg-gradient-to-r from-[#D4AF37]/10 via-white/5 to-transparent" />

        {EXTRA.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 relative",
                active
                  ? "bg-gradient-to-r from-[#D4AF37]/10 to-transparent text-[#D4AF37] border-l-2 border-[#D4AF37] translate-x-0.5"
                  : "text-gray-500 hover:bg-white/5 hover:text-white"
              )}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className="material-symbols-outlined text-xl">{m.icon}</span>
              <span className="font-medium tracking-wide">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080808] border border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#A67C00] flex items-center justify-center">
            <span className="material-symbols-outlined text-black text-sm">person</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Claude CLI</p>
            <p className="text-[10px] text-[#D4AF37]/70 font-semibold tracking-wider truncate uppercase">Activo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
