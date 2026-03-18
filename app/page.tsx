import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconTikTok,
  IconEmails,
  IconVoiceover,
  IconTalleres,
  IconClases,
  IconCursos,
  IconLibros,
} from "@/components/icons/agent-icons";

const AGENTS = [
  {
    href: "/tiktok",
    Icon: IconTikTok,
    title: "TikTok Textos",
    description: "Scripts virales de 2-4 minutos sobre narcisismo, apego y sanación",
    agents: 10,
    output: "Scripts .md",
    color: "from-rose-500/20 to-pink-500/10",
    accent: "text-rose-400",
  },
  {
    href: "/emails",
    Icon: IconEmails,
    title: "Email Marketing",
    description: "Emails HTML de alto impacto emocional para clientas y leads",
    agents: 4,
    output: "Emails .html",
    color: "from-amber-500/20 to-yellow-500/10",
    accent: "text-amber-400",
  },
  {
    href: "/voiceover",
    Icon: IconVoiceover,
    title: "Voiceover Psicológico",
    description: "Voiceovers de 3 partes (~37,500 caracteres) para lives diarios",
    agents: 3,
    output: "Voiceovers .md",
    color: "from-violet-500/20 to-purple-500/10",
    accent: "text-violet-400",
  },
  {
    href: "/talleres",
    Icon: IconTalleres,
    title: "Talleres Vivenciales",
    description: "Talleres de 90 min con metáforas y dinámicas transformacionales",
    agents: 7,
    output: "Guión + Mapa + Material",
    color: "from-emerald-500/20 to-green-500/10",
    accent: "text-emerald-400",
  },
  {
    href: "/clases",
    Icon: IconClases,
    title: "Clases en Vivo",
    description: "Guiones completos para clases del programa Apego Detox",
    agents: 7,
    output: "Guiones .md/.pdf",
    color: "from-sky-500/20 to-blue-500/10",
    accent: "text-sky-400",
  },
  {
    href: "/cursos",
    Icon: IconCursos,
    title: "Cursos Educativos",
    description: "Programas de aprendizaje estructurados sobre psicología relacional",
    agents: 7,
    output: "Programas HTML/PDF",
    color: "from-orange-500/20 to-amber-500/10",
    accent: "text-orange-400",
  },
  {
    href: "/libros",
    Icon: IconLibros,
    title: "Libros Amazon & Hotmart",
    description: "Libros completos de 30,000+ palabras para autopublicación",
    agents: 8,
    output: "Manuscritos .md/.pdf",
    color: "from-teal-500/20 to-cyan-500/10",
    accent: "text-teal-400",
  },
];

export default function Home() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-primary">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Marketing Detox</h1>
            <p className="text-xs text-muted-foreground">Historias de la Mente &middot; Hub de Agentes IA</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 max-w-xl">
          7 sistemas de agentes especializados en contenido psicológico. Selecciona un agente para comenzar a generar.
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {AGENTS.map((agent) => (
          <Link key={agent.href} href={agent.href} className="group">
            <Card className="h-full transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-0.5">
              <CardContent className="p-5">
                {/* Icon + Title row */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                    <agent.Icon className={`w-6 h-6 ${agent.accent}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight mb-0.5">{agent.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <svg viewBox="0 0 12 12" className="w-3 h-3 opacity-50">
                          <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
                          <path d="M2 10C2 8 4 7 6 7C8 7 10 8 10 10" stroke="currentColor" strokeWidth="1" fill="none" />
                        </svg>
                        {agent.agents} agentes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {agent.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                    <svg viewBox="0 0 12 12" className="w-3 h-3">
                      <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
                      <path d="M4 5H8M4 7H6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                    </svg>
                    {agent.output}
                  </span>
                  <span className="text-[10px] text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Abrir
                    <svg viewBox="0 0 12 12" className="w-3 h-3">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground/60 border-t border-border/30 pt-4">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 12 12" className="w-3.5 h-3.5">
            <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M2 10C2 8 4 7 6 7C8 7 10 8 10 10" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </svg>
          53 agentes totales
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 12 12" className="w-3.5 h-3.5">
            <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M4 4H8M4 6H7M4 8H8" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          75 prompts
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 12 12" className="w-3.5 h-3.5">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.5" />
          </svg>
          47 PDFs base
        </span>
      </div>
    </div>
  );
}
