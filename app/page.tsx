import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AGENTS = [
  {
    href: "/tiktok",
    icon: "TT",
    title: "TikTok Textos",
    description: "Scripts virales de 2-4 minutos sobre narcisismo, apego y sanación",
    agents: 10,
    output: "Scripts .md",
  },
  {
    href: "/emails",
    icon: "EM",
    title: "Email Marketing",
    description: "Emails HTML de alto impacto emocional para clientas y leads",
    agents: 4,
    output: "Emails .html",
  },
  {
    href: "/voiceover",
    icon: "VO",
    title: "Voiceover Psicológico",
    description: "Voiceovers de 3 partes (~37,500 caracteres) para lives diarios",
    agents: 3,
    output: "Voiceovers .md/.pdf",
  },
  {
    href: "/talleres",
    icon: "TA",
    title: "Talleres Vivenciales",
    description: "Talleres de 90 minutos con metáforas y dinámicas transformacionales",
    agents: 7,
    output: "Guión + Mapa + Material",
  },
  {
    href: "/clases",
    icon: "CL",
    title: "Clases en Vivo",
    description: "Guiones completos para clases del programa Apego Detox",
    agents: 7,
    output: "Guiones .md/.pdf",
  },
  {
    href: "/cursos",
    icon: "CU",
    title: "Cursos Educativos",
    description: "Programas de aprendizaje estructurados sobre psicología relacional",
    agents: 7,
    output: "Programas HTML/PDF",
  },
  {
    href: "/libros",
    icon: "LI",
    title: "Libros Amazon & Hotmart",
    description: "Libros completos de 30,000+ palabras para autopublicación",
    agents: 8,
    output: "Manuscritos .md/.pdf",
  },
];

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-1">Marketing Detox</h1>
        <p className="text-muted-foreground">Hub centralizado de agentes de contenido para Historias de la Mente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENTS.map((agent) => (
          <Card key={agent.href} className="hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {agent.icon}
                </span>
                <div>
                  <CardTitle className="text-base">{agent.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{agent.agents} agentes</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 text-sm leading-relaxed">
                {agent.description}
              </CardDescription>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Output: {agent.output}</span>
                <Link href={agent.href}>
                  <Button size="sm">Crear nuevo</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
