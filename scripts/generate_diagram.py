"""Genera un diagrama Excalidraw con la arquitectura completa de Marketing Detox."""
import json
import random
import time

random.seed(42)

GOLD = "#C9A84C"
GOLD_LIGHT = "#FFF4D6"
BLACK = "#1e1e1e"
WHITE = "#ffffff"
BLUE = "#4dabf7"
BLUE_LIGHT = "#E7F5FF"
GREEN_LIGHT = "#D3F9D8"
GREEN = "#51cf66"
PURPLE_LIGHT = "#F3E8FF"
PURPLE = "#9775fa"
RED_LIGHT = "#FFE3E3"
RED = "#ff6b6b"
GRAY_LIGHT = "#F1F3F5"
GRAY = "#868E96"

elements = []


def new_id():
    return "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=16))


def base(**kw):
    d = {
        "id": new_id(),
        "angle": 0,
        "strokeColor": BLACK,
        "backgroundColor": "transparent",
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "roundness": {"type": 3},
        "seed": random.randint(1, 2_000_000_000),
        "versionNonce": random.randint(1, 2_000_000_000),
        "isDeleted": False,
        "boundElements": [],
        "updated": int(time.time() * 1000),
        "link": None,
        "locked": False,
    }
    d.update(kw)
    return d


def rect(x, y, w, h, *, stroke=BLACK, bg="transparent", fill="solid", sw=2, style="solid", round_=True):
    return base(
        type="rectangle",
        x=x, y=y, width=w, height=h,
        strokeColor=stroke, backgroundColor=bg, fillStyle=fill,
        strokeWidth=sw, strokeStyle=style,
        roundness={"type": 3} if round_ else None,
    )


def text(x, y, w, h, content, *, size=20, color=BLACK, align="center", valign="middle", family=5):
    return base(
        type="text",
        x=x, y=y, width=w, height=h,
        strokeColor=color, backgroundColor="transparent", fillStyle="solid",
        strokeWidth=1,
        fontSize=size,
        fontFamily=family,
        text=content,
        textAlign=align,
        verticalAlign=valign,
        containerId=None,
        originalText=content,
        autoResize=True,
        lineHeight=1.25,
        roundness=None,
    )


def arrow(x1, y1, x2, y2, *, color=BLACK, sw=2, style="solid"):
    dx = x2 - x1
    dy = y2 - y1
    return base(
        type="arrow",
        x=x1, y=y1,
        width=abs(dx) if dx != 0 else 1,
        height=abs(dy) if dy != 0 else 1,
        strokeColor=color, backgroundColor="transparent", fillStyle="solid",
        strokeWidth=sw, strokeStyle=style,
        points=[[0, 0], [dx, dy]],
        lastCommittedPoint=None,
        startBinding=None,
        endBinding=None,
        startArrowhead=None,
        endArrowhead="arrow",
        elbowed=False,
        roundness={"type": 2},
    )


def add_card(x, y, w, h, title, lines, *, bg=GOLD_LIGHT, stroke=GOLD, title_size=18, line_size=13):
    elements.append(rect(x, y, w, h, stroke=stroke, bg=bg, sw=2))
    elements.append(text(x + 12, y + 10, w - 24, 26, title, size=title_size, align="left"))
    for i, ln in enumerate(lines):
        elements.append(text(x + 14, y + 40 + i * 18, w - 28, 20, ln, size=line_size, align="left"))


# ============================================================
# SECTION 1: TITLE
# ============================================================
elements.append(rect(100, 40, 2500, 110, stroke=BLACK, bg=BLACK, fill="solid", sw=3))
elements.append(text(100, 50, 2500, 40, "MARKETING  DETOX", size=42, color=GOLD))
elements.append(text(100, 100, 2500, 30, "Historias de la Mente  ·  Sistema de 12 Agentes de IA para Contenido Terapéutico", size=18, color=WHITE))

# ============================================================
# SECTION 2: IDENTIDAD + REGLAS
# ============================================================
# Identidad card (left)
add_card(
    100, 180, 1200, 340,
    "IDENTIDAD",
    [
        "Marca:       Historias de la Mente  (@historiasdelamente)",
        "Creador:     Javier Vieira — Psicólogo Especialista  (COLPSIC 293219 interno)",
        "Audiencia:   Mujeres hispanohablantes 25-65 años",
        "             Relaciones con narcisistas / apego ansioso",
        "Producto:    Apego Detox  —  $25 USD en Hotmart",
        "Visual:      Negro + dorado #C9A84C · Georgia",
        "",
        "Tono Lives:    VOZ UNIFICADA — directo a ella, sin separar voces",
        "Tono TikTok:   Walter Riso (40%) + Marian Rojas Estapé (60%)",
        "Tono Emails:   Directo al hueso, precisión quirúrgica",
        "",
        "Web App:     Next.js 16 + React 19 + SQLite + Claude CLI",
    ],
    bg=GOLD_LIGHT, stroke=GOLD, title_size=22,
)

# Reglas card (right)
add_card(
    1400, 180, 1200, 340,
    "REGLAS ABSOLUTAS  —  NUNCA ROMPER",
    [
        "1.  SIEMPRE  'Psicólogo Especialista'  (nunca 'clínico')",
        "2.  NO modificar agentes sin confirmación explícita",
        "3.  NUNCA incluir COLPSIC en contenido público",
        "4.  Talleres = CERO teoría — todo vivencial, visceral",
        "5.  Modo Live = voz unificada (no separar Marian / Riso)",
        "6.  Sora: NO caracterizar @historiasdelamente",
        "7.  Sora: NO maquillaje corrido, solo 2 personajes (ÉL y ELLA)",
        "8.  Sora: estilo premium  —  photorealistic, 35mm, Kodak",
        "9.  Autonomía total  —  ejecutar completo sin preguntar",
        "10. Guardar todo lo relevante en memoria",
    ],
    bg=RED_LIGHT, stroke=RED, title_size=22, line_size=14,
)

# ============================================================
# SECTION 3: LOS 12 AGENTES
# ============================================================
elements.append(rect(100, 560, 2500, 60, stroke=GOLD, bg=BLACK, sw=3))
elements.append(text(100, 568, 2500, 40, "LOS  12  SISTEMAS  DE  AGENTES", size=28, color=GOLD))

# Subsection label: Con Adapter Web
elements.append(text(100, 640, 2500, 30, "▼  AGENTES  CON  ADAPTER  WEB  (8)  —  funcionan en la app Next.js", size=18, color=BLACK, align="left"))

# 8 Web agents in 2 rows x 4 cols
web_agents = [
    ("TIKTOK",
     ["Prompts: tiktok/ (10)",
      "orquestador → investigador",
      "→ viral → depurador",
      "→ descripciones → voiceover",
      "→ contador calidad",
      "Modelos: haiku/sonnet/opus",
      "Output: 350-700 palabras"]),
    ("EMAILS",
     ["Prompts: emails/ (5)",
      "planificador → director",
      "→ redactor → corrector",
      "→ diseñador HTML",
      "7 tipos: welcome, pre-clase,",
      "post-clase, carrito abandonado,",
      "re-engagement, onboarding…"]),
    ("VOICEOVER",
     ["Prompts: voiceover/ (SKILL+4)",
      "3 partes × (generar +",
      "ortografía + caracteres +",
      "revisión emocional)",
      "~37.500 caracteres totales",
      "45 temas predefinidos",
      "Modelos: opus + haiku"]),
    ("TALLERES",
     ["Prompts: talleres/ (16+)",
      "orquestador → investigador",
      "→ metáfora → estructura",
      "→ escritor → calidad",
      "CERO teoría — vivencial",
      "293+ técnicas disponibles"]),
    ("CLASES",
     ["Prompts: clases/ (22+)",
      "CLAUDE.md propio",
      "dolor → storytelling",
      "→ producto → CTA",
      "→ estructura → slides",
      "→ validación",
      "Modelos: sonnet/opus"]),
    ("CURSOS",
     ["Prompts: cursos/ (7)",
      "director → investigador",
      "→ profesor → emocional",
      "→ escritor → organizador",
      "→ calidad",
      "Módulos completos"]),
    ("LIBROS",
     ["Adapter: libros-adapter.ts",
      "investigación → arquitectura",
      "→ escritura → edición",
      "30.000+ palabras",
      "Modelos: sonnet/opus",
      "(sin prompts en disco)"]),
    ("SORA",
     ["Prompts: sora/ (5)",
      "analizador → director visual",
      "→ compositor → optimizador",
      "→ 3 variaciones",
      "Videos 15s · 9:16",
      "Output en inglés",
      "photorealistic, 35mm"]),
]

card_w = 600
card_h = 200
start_x = 100
start_y = 680
gap_x = 20
gap_y = 20

for i, (title, lines) in enumerate(web_agents):
    row = i // 4
    col = i % 4
    x = start_x + col * (card_w + gap_x)
    y = start_y + row * (card_h + gap_y)
    add_card(x, y, card_w, card_h, title, lines, bg=GOLD_LIGHT, stroke=GOLD, title_size=20, line_size=13)

# Subsection label: CLI-Only
cli_y = start_y + 2 * (card_h + gap_y) + 20
elements.append(text(100, cli_y, 2500, 30, "▼  AGENTES  CLI-ONLY  (5)  —  sin adapter web todavía", size=18, color=BLACK, align="left"))

cli_agents = [
    ("BLOG / SEO",
     ["Prompts: blog/ (1)",
      "01_escritor_blog_seo",
      "Artículos SEO en español",
      "Clusters temáticos"]),
    ("INSTAGRAM",
     ["Prompts: instagram/ (4)",
      "director → carousels",
      "→ reels → stories"]),
    ("WHATSAPP",
     ["Prompts: whatsapp/ (1)",
      "01_engagement",
      "Broadcasts diarios",
      "Rituales semanales"]),
    ("INVESTIGADOR CIENTÍFICO",
     ["Prompts: investigador-cientifico/ (3)",
      "buscador → sintetizador",
      "→ integrador",
      "Revistas científicas",
      "Ejecutar mensualmente"]),
    ("GUARDIÁN DEL CONOCIMIENTO",
     ["Prompts: guardian-conocimiento/ (1)",
      "01_guardian",
      "Audita uso de la base",
      "Rota técnicas",
      "Ejecutar semanalmente"]),
]

cli_card_w = 480
cli_card_h = 160
cli_start_y = cli_y + 40
cli_gap = 20
for i, (title, lines) in enumerate(cli_agents):
    x = start_x + i * (cli_card_w + cli_gap)
    y = cli_start_y
    add_card(x, y, cli_card_w, cli_card_h, title, lines, bg=PURPLE_LIGHT, stroke=PURPLE, title_size=18, line_size=13)

# ============================================================
# SECTION 4: BASE DE CONOCIMIENTO
# ============================================================
kb_y = cli_start_y + cli_card_h + 50

elements.append(rect(100, kb_y, 1600, 60, stroke=BLUE, bg=BLACK, sw=3))
elements.append(text(100, kb_y + 8, 1600, 40, "BASE  DE  CONOCIMIENTO", size=26, color=BLUE))

# PDFs clínicos card
pdf_y = kb_y + 80
add_card(
    100, pdf_y, 780, 280,
    "PDFs  CLÍNICOS  (45+ docs)    ·    base_conocimiento/",
    [
        "APEGO/               (12)   Estilos · trauma bond · amor romántico",
        "NARCICISMO/          ( 9)   Freud · Kohut · Jung · DSM-5 · tipos",
        "LA NIÑA INTERIOR/    (16)   Heridas · reparentalización · límites",
        "RECUPERACION.../     ( 3)   Identidad · autoestima · nueva vida",
        "talleres_apego/      ( 5)   Trauma bonding · regulación · partes",
    ],
    bg=BLUE_LIGHT, stroke=BLUE, title_size=18, line_size=13,
)

# Research docs card
add_card(
    900, pdf_y, 800, 280,
    "RESEARCH  DOCS  (293+ técnicas)    ·    content/",
    [
        "terapias-tercera-generacion     (42)  ACT · DBT · CFT · MBCT",
        "universidades-top               (37)  Harvard · Stanford · Yale · MIT",
        "metaforas-somaticas             (38)  IFS · Gestalt · Polyvagal · EMDR",
        "trauma-recovery-narcissistic    (38)  Narcisismo · C-PTSD · apego",
        "tecnicas-corporales             (32)  Yoga trauma · TRE · breathwork",
        "group-therapy-innovations       (37)  Psicodrama · círculos · neuro",
        "bioquimica-trauma-bond          (22)  Dopamina · cortisol · fawn",
        "verguenza-shame-resilience      (24)  Brené Brown · Bradshaw",
        "trauma-intergeneracional        (23)  Epigenética · herida materna",
    ],
    bg=BLUE_LIGHT, stroke=BLUE, title_size=18, line_size=13,
)

# ============================================================
# SECTION 5: WEB APP FLOW (right column)
# ============================================================
flow_x = 1750
flow_y = kb_y
elements.append(rect(flow_x, flow_y, 850, 60, stroke=GREEN, bg=BLACK, sw=3))
elements.append(text(flow_x, flow_y + 8, 850, 40, "FLUJO  DE  LA  WEB  APP", size=26, color=GREEN))

steps = [
    ("1.  UI  (Next.js)", "Form en agent-configs.ts", GREEN_LIGHT),
    ("2.  POST  /api/agents/[type]", "Recibe parámetros", GREEN_LIGHT),
    ("3.  registry.ts", "Auto-registro de adapters", GREEN_LIGHT),
    ("4.  runner.ts", "Ejecuta pipeline", GREEN_LIGHT),
    ("5.  {tipo}-adapter.ts", "loadPrompt() + callClaudeCli()", GREEN_LIGHT),
    ("6.  Claude CLI", "Ejecuta cada paso del pipeline", GREEN_LIGHT),
    ("7.  data/outputs/{fecha}/", "Guarda .md · .html · .json", GREEN_LIGHT),
    ("8.  SSE  /api/stream/[jobId]", "Streaming en tiempo real a UI", GREEN_LIGHT),
]

step_h = 42
step_gap = 6
for i, (title_s, desc, bg) in enumerate(steps):
    sy = flow_y + 80 + i * (step_h + step_gap)
    elements.append(rect(flow_x, sy, 850, step_h, stroke=GREEN, bg=bg, sw=2))
    elements.append(text(flow_x + 12, sy + 4, 500, 20, title_s, size=15, color=BLACK, align="left"))
    elements.append(text(flow_x + 12, sy + 22, 820, 18, desc, size=12, color=GRAY, align="left"))
    if i < len(steps) - 1:
        ax = flow_x + 425
        elements.append(arrow(ax, sy + step_h, ax, sy + step_h + step_gap, color=GREEN, sw=2))

# ============================================================
# SECTION 6: OUTPUTS & ORGANIZATION
# ============================================================
out_y = pdf_y + 310
elements.append(rect(100, out_y, 2500, 50, stroke=BLACK, bg=GOLD, sw=3))
elements.append(text(100, out_y + 6, 2500, 35, "ORGANIZACIÓN  DE  OUTPUT", size=22, color=BLACK))

out_cards = [
    ("Web App", "data/outputs/{YYYY-MM-DD}/", "{agente}-{titulo}.{md|html|json}"),
    ("CLI Manual", "output/", "Libre"),
    ("Voiceover Skill", "output/voiceover-{tema}-parte-{N}.md", "3 archivos → 1 PDF"),
    ("Sora Prompts", "content/sora-prompts/", "sora-{concepto}-{parte}.md  (en inglés)"),
    ("Research", "content/research-{tema}.md", "kebab-case · siempre .md"),
]

ocw = 480
och = 110
ogap = 20
ostart = 100
for i, (label, path, fmt) in enumerate(out_cards):
    x = ostart + i * (ocw + ogap)
    y = out_y + 70
    elements.append(rect(x, y, ocw, och, stroke=GOLD, bg=GOLD_LIGHT, sw=2))
    elements.append(text(x + 12, y + 8, ocw - 24, 22, label, size=16, color=BLACK, align="left"))
    elements.append(text(x + 12, y + 36, ocw - 24, 20, path, size=13, color=BLACK, align="left"))
    elements.append(text(x + 12, y + 62, ocw - 24, 20, fmt, size=12, color=GRAY, align="left"))

# ============================================================
# SECTION 7: PIPELINE CENTRAL (conceptual)  — pequeño banner abajo
# ============================================================
foot_y = out_y + 210
elements.append(rect(100, foot_y, 2500, 110, stroke=BLACK, bg=BLACK, sw=3))
elements.append(text(100, foot_y + 8, 2500, 30, "JERARQUÍA  DE  INSTRUCCIONES", size=20, color=GOLD))
elements.append(text(100, foot_y + 42, 2500, 24, "CLAUDE.md (raíz)    >    {subdirectorio}/CLAUDE.md    >    prompt individual", size=16, color=WHITE))
elements.append(text(100, foot_y + 72, 2500, 22, "Si hay conflicto, la raíz gana. Los archivos especializados profundizan — nunca contradicen.", size=13, color="#aaaaaa"))

# ============================================================
# SECTION 8: FLECHAS DEL ORQUESTADOR CENTRAL (conceptuales)
# Conectar "12 Agentes" header con base de conocimiento
# ============================================================
# Flecha de "Base de Conocimiento" hacia los agentes (conceptual)
elements.append(arrow(900, kb_y - 10, 900, kb_y - 40, color=BLUE, sw=2, style="dashed"))
elements.append(text(700, kb_y - 40, 400, 20, "alimenta a todos los agentes", size=12, color=BLUE, align="center"))

# ============================================================
# FINAL DOC
# ============================================================
doc = {
    "type": "excalidraw",
    "version": 2,
    "source": "https://excalidraw.com",
    "elements": elements,
    "appState": {
        "gridSize": None,
        "viewBackgroundColor": "#fafafa",
    },
    "files": {},
}

with open("/home/user/marketingdetox/docs/marketing-detox.excalidraw", "w", encoding="utf-8") as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)

print(f"OK — {len(elements)} elementos generados")
