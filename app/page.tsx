import Link from "next/link";
import {
  IconTikTok,
  IconEmails,
  IconVoiceover,
  IconTalleres,
  IconClases,
  IconCursos,
  IconLibros,
  IconSora,
} from "@/components/icons/agent-icons";

const AGENTS = [
  {
    href: "/tiktok",
    Icon: IconTikTok,
    title: "TikTok Textos",
    description: "Scripts virales de 2-4 minutos sobre narcisismo, apego y sanación",
    agents: 10,
    output: "Scripts .md",
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    accent: "text-rose-400",
    border: "hover:border-rose-500/15",
    shadow: "hover:shadow-rose-500/5",
  },
  {
    href: "/emails",
    Icon: IconEmails,
    title: "Email Marketing",
    description: "Emails HTML de alto impacto emocional para clientas y leads",
    agents: 4,
    output: "Emails .html",
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    accent: "text-amber-400",
    border: "hover:border-amber-500/15",
    shadow: "hover:shadow-amber-500/5",
  },
  {
    href: "/voiceover",
    Icon: IconVoiceover,
    title: "Voiceover Psicológico",
    description: "Voiceovers de 3 partes (~37,500 caracteres) para lives diarios",
    agents: 3,
    output: "Voiceovers .md",
    gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    accent: "text-violet-400",
    border: "hover:border-violet-500/15",
    shadow: "hover:shadow-violet-500/5",
  },
  {
    href: "/talleres",
    Icon: IconTalleres,
    title: "Talleres Vivenciales",
    description: "Talleres de 90 min con metáforas y dinámicas transformacionales",
    agents: 7,
    output: "Guión + Mapa + Material",
    gradient: "from-emerald-500/10 via-green-500/5 to-transparent",
    accent: "text-emerald-400",
    border: "hover:border-emerald-500/15",
    shadow: "hover:shadow-emerald-500/5",
  },
  {
    href: "/clases",
    Icon: IconClases,
    title: "Clases en Vivo",
    description: "Guiones completos para clases del programa Apego Detox",
    agents: 7,
    output: "Guiones .md/.pdf",
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent",
    accent: "text-sky-400",
    border: "hover:border-sky-500/15",
    shadow: "hover:shadow-sky-500/5",
  },
  {
    href: "/cursos",
    Icon: IconCursos,
    title: "Cursos Educativos",
    description: "Programas de aprendizaje estructurados sobre psicología relacional",
    agents: 7,
    output: "Programas HTML/PDF",
    gradient: "from-orange-500/10 via-amber-500/5 to-transparent",
    accent: "text-orange-400",
    border: "hover:border-orange-500/15",
    shadow: "hover:shadow-orange-500/5",
  },
  {
    href: "/libros",
    Icon: IconLibros,
    title: "Libros Amazon & Hotmart",
    description: "Libros completos de 30,000+ palabras para autopublicación",
    agents: 8,
    output: "Manuscritos .md/.pdf",
    gradient: "from-teal-500/10 via-cyan-500/5 to-transparent",
    accent: "text-teal-400",
    border: "hover:border-teal-500/15",
    shadow: "hover:shadow-teal-500/5",
  },
  {
    href: "/sora",
    Icon: IconSora,
    title: "Sora Prompts",
    description: "Prompts cinematográficos optimizados para generar videos con Sora (OpenAI)",
    agents: 5,
    output: "Prompts .md",
    gradient: "from-fuchsia-500/10 via-pink-500/5 to-transparent",
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-500/15",
    shadow: "hover:shadow-fuchsia-500/5",
  },
];

export default function Home() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/15 to-teal-500/10 flex items-center justify-center shadow-lg shadow-violet-500/5">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-violet-400">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M12 8C10.34 8 9 9.34 9 11s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M6 18.5C7.5 16 9.5 15 12 15s4.5 1 6 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-300 via-violet-200 to-teal-300 bg-clip-text text-transparent">
              Marketing Detox
            </h1>
            <p className="text-xs text-muted-foreground/50">Historias de la Mente &middot; Hub de Agentes IA</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/40 max-w-xl leading-relaxed">
          8 sistemas de agentes especializados en contenido psicológico. Selecciona un agente para comenzar a generar.
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {AGENTS.map((agent) => (
          <Link key={agent.href} href={agent.href} className="group">
            <div className={`card-3d glass-card h-full rounded-xl p-5 transition-all duration-300 ${agent.border} hover:shadow-xl ${agent.shadow}`}>
              {/* Subtle gradient overlay */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${agent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="relative">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <agent.Icon className={`w-5.5 h-5.5 ${agent.accent}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight mb-0.5 text-foreground/90 group-hover:text-foreground transition-colors">
                      {agent.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground/35">
                      {agent.agents} agentes
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground/50 leading-relaxed mb-4">
                  {agent.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
                  <span className="text-[10px] text-muted-foreground/25 flex items-center gap-1">
                    <svg viewBox="0 0 12 12" className="w-3 h-3">
                      <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
                      <path d="M4 5H8M4 7H6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    </svg>
                    {agent.output}
                  </span>
                  <span className={`text-[10px] ${agent.accent} opacity-0 group-hover:opacity-70 transition-opacity flex items-center gap-1`}>
                    Abrir
                    <svg viewBox="0 0 12 12" className="w-3 h-3">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground/25 border-t border-white/[0.03] pt-4">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-violet-400/30">
            <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M2 10C2 8 4 7 6 7C8 7 10 8 10 10" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </svg>
          58 agentes totales
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-teal-400/30">
            <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M4 4H8M4 6H7M4 8H8" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          80 prompts
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-orange-400/30">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.5" />
          </svg>
          47 PDFs base
        </span>
      </div>
    </div>
  );
}
