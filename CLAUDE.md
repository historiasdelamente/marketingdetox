# Marketing Detox — Historias de la Mente

> Sistema de orquestación de 12 agentes de IA para generación de contenido terapéutico de alto impacto emocional.

| Campo | Valor |
|-------|-------|
| **Marca** | Historias de la Mente (@historiasdelamente) |
| **Creador** | Javier Vieira — **Psicólogo Especialista** (COLPSIC 293219) |
| **Audiencia** | Mujeres hispanohablantes 25-65 años, relaciones con narcisistas |
| **Producto** | Apego Detox — programa de sanación emocional (15 módulos, $37.97 USD/mes, Hotmart) |
| **Visual** | Negro + dorado (#C9A84C), fuente Georgia |
| **Tono Lives** | VOZ UNIFICADA — una sola voz que habla directo a ella, sin separar Marian/Riso |
| **Tono TikTok** | Fusión Walter Riso (40%) + Marian Rojas Estapé (60%) — solo para TikTok cortos |
| **Tono Emails** | Directo al hueso, toca la herida con precisión quirúrgica |
| **Web App** | Next.js 16 + React 19 + SQLite + Claude CLI |

---

## REGLAS ABSOLUTAS — NUNCA ROMPER

1. **SIEMPRE "Psicólogo Especialista"** — NUNCA decir "psicólogo clínico". En ningún contexto. En ningún archivo.
2. **NO modificar agentes sin confirmación** — NUNCA editar archivos en `agents-source/prompts/`, `lib/agents/*-adapter.ts`, ni `SKILL.md` sin que el usuario lo pida explícitamente.
3. **NUNCA incluir COLPSIC en contenido** — El número 293219 es interno. Jamás aparece en emails, TikToks, voiceovers, ni ningún output.
4. **Talleres = CERO teoría** — Todo vivencial, visceral, situaciones reales, sanar desde adentro. Las mujeres ya saben la teoría. No necesitan más información, necesitan SENTIR.
5. **Modo Live = voz unificada** — No separar "ahora habla Marian" / "ahora habla Riso". Es UNA sola voz que habla directo a ELLA. Menos neurociencia, más sentimiento.
6. **Sora: NO caracterizar @historiasdelamente** — Sora ya tiene el personaje registrado. No describir cara, rasgos, voz.
7. **Sora: NO maquillaje corrido, NO crear 3er personaje** — Solo 2 personajes (ÉL y ELLA). Ella es linda pero desgarrada, nunca grotesca.
8. **Sora: estilo visual premium** — Belleza detallada, luz diseñada por escena, emoción con micro-expresiones. Photorealistic, 35mm, Kodak.
9. **Autonomía total** — No preguntar, ejecutar completo. Decir sí a todo y hacer.
10. **Guardar en memoria** — Todo lo relevante se guarda en memoria para futuras conversaciones. Leer memoria al inicio siempre.

---

## Arquitectura del Proyecto

```
marketingdetox/
├── CLAUDE.md                          ← ESTE ARCHIVO (orquestador maestro)
├── agents-source/
│   ├── prompts/                       ← 90+ prompts en 12 categorías
│   │   ├── tiktok/          (10)      01_orquestador → 10_contador_calidad
│   │   ├── emails/          (5)       00_planificador → 04_disenador_html
│   │   ├── voiceover/       (SKILL+4) SKILL.md + references/
│   │   ├── talleres/        (16+)     00_orquestador → 16_cuaderno + GUIA_USO.md
│   │   ├── clases/          (22+)     CLAUDE.md propio + 7 agentes + guiones
│   │   ├── cursos/          (7)       director → calidad
│   │   ├── sora/            (5)       01_analizador → 05_variaciones
│   │   ├── blog/            (1)       01_escritor_blog_seo
│   │   ├── instagram/       (4)       01_director → 04_stories
│   │   ├── whatsapp/        (1)       01_engagement
│   │   ├── investigador-cientifico/ (3) 01_buscador → 03_integrador
│   │   └── guardian-conocimiento/  (1) 01_guardian
│   ├── templates/                     Plantillas HTML de email
│   └── scripts/                       Scripts Python auxiliares
├── lib/
│   ├── agents/                        Capa de adapters (TypeScript)
│   │   ├── base-agent.ts             loadPrompt() + callClaudeCli()
│   │   ├── registry.ts              Auto-registro de adapters
│   │   └── {tipo}-adapter.ts        8 adapters web (tiktok, emails, voiceover, talleres, clases, cursos, libros, sora)
│   ├── jobs/runner.ts                Ejecución de jobs + guardado de output
│   └── chat/agent-configs.ts        Configuración UI de agentes
├── base_conocimiento/                 45+ PDFs clínicos
│   ├── APEGO/                (12)    Teoría del apego, estilos, trauma bond
│   ├── NARCICISMO/           (9)     Freud, Kohut, Jung, DSM-5, tipos
│   ├── LA NIÑA INTERIOR/    (16)    Heridas, reparentalización, integración
│   ├── RECUPERACION.../      (3)     Identidad, autoestima, nueva vida
│   └── talleres_apego/       (5)     Materiales de talleres
├── content/                           Research + transcripciones
│   ├── BASE-CONOCIMIENTO-TALLERES.md ← ÍNDICE MAESTRO (293+ técnicas)
│   ├── research-*.md          (9)    Documentos de investigación
│   └── sora-prompts/                 Prompts Sora generados
├── data/
│   ├── outputs/{fecha}/              Output de la web app
│   └── marketingdetox.db            SQLite (jobs, outputs, knowledge)
└── output/                            Output manual/CLI
```

---

## Los 12 Sistemas de Agentes

### Agentes con Adapter Web (funcionan en la web app)

| Agente | Prompts | Adapter | Pipeline | Modelos |
|--------|---------|---------|----------|---------|
| **TikTok** | `tiktok/` (10) | `tiktok-adapter.ts` | orquestador → investigador → viral → depurador → descripciones → voiceover → contador | haiku/sonnet/opus |
| **Emails** | `emails/` (5) | `emails-adapter.ts` | planificador → director → redactor → corrector → diseñador HTML | sonnet/opus/haiku |
| **Voiceover** | `voiceover/` (SKILL+4) | `voiceover-adapter.ts` | 3 partes × (generar + ortografía + caracteres + revisión emocional) | opus/haiku |
| **Talleres** | `talleres/` (16+) | `talleres-adapter.ts` | orquestador → investigador → metáfora → estructura → escritor → calidad | varies |
| **Clases** | `clases/` (22+) | `clases-adapter.ts` | dolor → storytelling → producto → CTA → estructura → slides → validación | sonnet/opus |
| **Cursos** | `cursos/` (7) | `cursos-adapter.ts` | director → investigador → profesor → emocional → escritor → organizador → calidad | varies |
| **Libros** | — | `libros-adapter.ts` | investigación → arquitectura → escritura → edición (30,000+ palabras) | sonnet/opus |
| **Sora** | `sora/` (5) | `sora-adapter.ts` | analizador → director visual → compositor → optimizador → variaciones (3) | haiku/opus/sonnet |

### Agentes CLI-Only (sin adapter web todavía)

| Agente | Prompts | Función |
|--------|---------|---------|
| **Blog/SEO** | `blog/` (1) | Artículos SEO con keywords en español, clusters temáticos |
| **Instagram** | `instagram/` (4) | Director → carousels → reels → stories |
| **WhatsApp** | `whatsapp/` (1) | Broadcasts diarios, rituales semanales, engagement comunitario |
| **Investigador Científico** | `investigador-cientifico/` (3) | Busca actualizaciones en revistas científicas, sintetiza, integra en base |
| **Guardián del Conocimiento** | `guardian-conocimiento/` (1) | Audita uso de base, rota técnicas, verifica coherencia, genera resúmenes |

### Detalle de Pipelines Clave

**TikTok (7 pasos):** El orquestador recibe tema → investigador busca en base de conocimiento → viral optimiza con estructura de 5 bloques (gancho devastador, ancla de retención, desarrollo, cierre con anticipación, hashtags) → depurador limpia → descripciones genera caption → voiceover genera guión hablado → contador verifica 350-700 palabras.

**Voiceover Live (3 partes × 4 agentes):** Genera scripts de ~37,500 caracteres (3 partes de ~12,500). Cada parte pasa por: generación (opus) → ortografía (haiku) → verificador de caracteres (haiku) → revisor emocional (5 tests de impacto). Banco de 45 temas predefinidos + temas libres. Estilo: "amiga psicóloga que te dice la verdad con amor."

**Emails (5 agentes):** Planificador diseña secuencias automatizadas (7 tipos: welcome, pre-clase, post-clase, carrito abandonado, re-engagement, onboarding, retención) → Director crea brief creativo → Redactor escribe copy → Corrector revisa → Diseñador genera HTML con plantilla dorada.

**Sora (5 pasos):** Analizador traduce concepto psicológico a dirección visual + diálogo fundamentado → Director visual crea cinematografía → Compositor arma prompt en inglés para Sora → Optimizador refina → Variaciones genera 3 alternativas. Videos de 15 segundos, photorealistic, 9:16.

---

## Base de Conocimiento

### REGLA: Siempre consultar `content/BASE-CONOCIMIENTO-TALLERES.md` PRIMERO

### PDFs Clínicos (`base_conocimiento/`)

| Carpeta | Docs | Contenido |
|---------|------|-----------|
| `APEGO/` | 12 | Teoría del apego, estilos, trauma bond, amor romántico, somática |
| `NARCICISMO/` | 9 | Freud, Kohut, Jung, DSM-5, tipos clínicos, relaciones de pareja |
| `LA NIÑA INTERIOR/` | 16 | Heridas, reparentalización, límites, integración, programa 12 semanas |
| `RECUPERACION.../` | 3 | Identidad, autoestima, nueva vida |
| `talleres_apego/` | 5 | Trauma bonding, regulación, partes, duelo, visión futuro |

### Research Docs (`content/`) — 293+ técnicas validadas

| Archivo | Técnicas | Enfoque |
|---------|----------|---------|
| `research-terapias-tercera-generacion.md` | 42 | ACT, DBT, CFT, MBCT, Schema Therapy |
| `research-tecnicas-terapeuticas-universidades-top.md` | 37 | Harvard, Stanford, Yale, MIT, Oxford |
| `research-metaforas-tecnicas-somaticas.md` | 38 | Metáforas ACT, IFS, Gestalt, Polyvagal, EMDR |
| `research-trauma-recovery-narcissistic-abuse-techniques.md` | 38 | Narcisismo, C-PTSD, apego, codependencia |
| `research-tecnicas-corporales-transformacionales.md` | 32 | Yoga trauma, TRE, breathwork, voz, rituales |
| `research-group-therapy-innovations.md` | 37 | Psicodrama, círculos femeninos, neurociencia |
| `research-bioquimica-adiccion-trauma-bond.md` | 22 | Dopamina, cortisol, neuroplasticidad, fawn |
| `research-verguenza-shame-resilience.md` | 24 | Brené Brown, Bradshaw, shame en narcisismo |
| `research-trauma-intergeneracional-epigenetica.md` | 23 | Epigenética, constelaciones, herida materna |

### Mantenimiento de la Base

La base se mantiene viva con:
- **Investigador Científico** → busca nuevos hallazgos en revistas científicas. Ejecutar mensualmente o por tema.
- **Guardián del Conocimiento** → audita, rota técnicas, verifica coherencia. Ejecutar semanalmente.

---

## Cómo Funciona la Web App

### Flujo de ejecución

1. Usuario llena formulario en UI → campos definidos en `lib/chat/agent-configs.ts`
2. POST a `/api/agents/[type]/` con parámetros
3. `registry.ts` importa todos los adapters (auto-registro)
4. `runner.ts` ejecuta el adapter registrado
5. Adapter carga prompts via `loadPrompt(folder, name)` desde `agents-source/prompts/{folder}/{name}.md`
6. Adapter llama `callClaudeCli()` por cada paso del pipeline con selección de modelo
7. Output se guarda en `data/outputs/{fecha}/{tipo}-{titulo}.{ext}`
8. SSE streaming via `/api/stream/[jobId]/` actualiza UI en tiempo real

### Agregar un nuevo tipo de agente (5 pasos)

1. Crear prompts en `agents-source/prompts/{nuevo-tipo}/`
2. Crear `lib/agents/{nuevo-tipo}-adapter.ts` siguiendo el patrón de `tiktok-adapter.ts`
3. Agregar import en `lib/agents/registry.ts`
4. Agregar tipo al array `AGENT_TYPES` en `registry.ts`
5. Agregar config en `lib/chat/agent-configs.ts` (título, campos, pasos, greeting)

### Detalles técnicos

- `loadPrompt()` reemplaza `{{BASE_CONOCIMIENTO_PATH}}` con la ruta real
- Windows usa PowerShell para bypass del límite de 8191 caracteres
- Variable `CLAUDECODE` se elimina del proceso hijo para evitar sesiones anidadas
- Ollama como fallback para tareas nivel haiku cuando `OLLAMA_MODEL` está configurado

---

## Convenciones de Prompts

### Naming

- Archivos: `{NN}_{rol}.md` donde NN es orden de ejecución (01, 02, etc.)
- Prefijo `00_` = orquestador/planificador
- Cada archivo es un system prompt completo para un paso del pipeline

### Estructura estándar de un prompt

- `## ROL` — Quién es este agente
- `## IDENTIDAD` — Marca, creador, audiencia
- `## BASE DE CONOCIMIENTO` — Qué documentos consultar
- `## PROCESO / LO QUE HACES` — Pasos en orden
- `## OUTPUT` — Formato exacto de salida
- `## REGLAS INQUEBRANTABLES` — Lo que nunca hacer

### Placeholders

- `{{BASE_CONOCIMIENTO_PATH}}` → ruta a `base_conocimiento/`
- `{{ nombre }}` → nombre de la persona (en emails)
- `${CLAUDE_SKILL_DIR}` → directorio del skill (en voiceover)

### Idioma

- Prompts en español (matching brand voice)
- Excepto prompts Sora que generan output en inglés para Sora API

---

## Organización de Output

| Origen | Destino | Formato |
|--------|---------|---------|
| Web app | `data/outputs/{YYYY-MM-DD}/` | `{agente}-{titulo}.{md\|html\|json}` |
| CLI manual | `output/` | Libre |
| CLI voiceover skill | `output/voiceover-{tema}-parte-{N}.md` | 3 archivos .md → 1 PDF |
| Sora prompts | `content/sora-prompts/` | `sora-{concepto}-{parte}.md` |
| Research | `content/research-{tema}.md` | Kebab-case, siempre .md |
| Transcripciones | `content/transcripciones-{fuente}.md` | .md |

### Naming

- Siempre kebab-case: `research-terapias-tercera-generacion.md`
- Fechas en formato ISO: `2026-03-26`
- Sin acentos en nombres de archivo

---

## Referencias Cruzadas

Estos archivos especializan el CLAUDE.md maestro. NO contradicen — profundizan.

| Archivo | Función |
|---------|---------|
| `agents-source/prompts/clases/CLAUDE.md` | Orquestador del pipeline de 7 pasos para clases (dolor → validación) |
| `agents-source/prompts/talleres/GUIA_USO.md` | Guía de uso del sistema de generación de talleres |
| `agents-source/prompts/voiceover/SKILL.md` | Skill de voiceover (3 partes × 12,500 chars, 45 temas) |
| `agents-source/prompts/voiceover/references/_index.md` | Índice de materiales de referencia del voiceover |
| `agents-source/prompts/voiceover/references/style-guide.md` | ADN de la fusión Marian + Riso |
| `agents-source/prompts/voiceover/references/topic-bank.md` | 45 temas predefinidos con ángulos y arcos emocionales |
| `agents-source/prompts/clases/brand-voice.md` | Guía de voz de marca para clases |
| `content/BASE-CONOCIMIENTO-TALLERES.md` | Índice maestro de 293+ técnicas terapéuticas |

### Jerarquía

`CLAUDE.md` (raíz) > `{subdirectorio}/CLAUDE.md` > prompt individual

Si hay conflicto, la raíz gana.

---

## Comandos Rápidos

| Pedido del usuario | Qué hacer |
|-------------------|-----------|
| "Genera un TikTok sobre X" | Pipeline tiktok: 7 pasos, output a `output/` |
| "Crea un email de X" | Pipeline emails: 4 pasos, output HTML |
| "Escribe un voiceover sobre X" | `/voiceover-psicologico X` → 3 partes, 37,500 chars |
| "Diseña un taller de X" | Pipeline talleres: 6 pasos, CERO teoría |
| "Crea prompts Sora de X" | Pipeline sora: 5 pasos, output en inglés |
| "Busca actualizaciones científicas" | Investigador científico: buscar + sintetizar + integrar |
| "Audita la base de conocimiento" | Guardián: leer todos los prompts, verificar coherencia |
| "Agrega un nuevo agente" | Seguir los 5 pasos de la sección "Cómo Funciona la Web App" |
