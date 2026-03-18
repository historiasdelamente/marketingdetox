#!/usr/bin/env python3
"""
Genera el PDF del Guión Completo — Clase 1: Apego Detox
3 Partes x ~12,500 caracteres = ~37,500 caracteres total
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Colors ───
GOLD = HexColor("#e8c840")
DARK_BG = HexColor("#1a1a1a")
LIGHT_TEXT = HexColor("#fdf6e3")
DARK_RED = HexColor("#8B0000")
MEDIUM_GRAY = HexColor("#444444")
LIGHT_GRAY = HexColor("#999999")
WARM_GOLD = HexColor("#D4A017")

# ─── Document setup ───
output_path = os.path.join(os.path.dirname(__file__), "Guion_Clase1_ApegoDetox.pdf")

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.7*inch,
    bottomMargin=0.7*inch,
    leftMargin=0.8*inch,
    rightMargin=0.8*inch,
)

styles = getSampleStyleSheet()

# ─── Custom Styles ───
styles.add(ParagraphStyle(
    name='CoverTitle',
    fontSize=28,
    leading=34,
    alignment=TA_CENTER,
    textColor=GOLD,
    spaceAfter=8,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='CoverSubtitle',
    fontSize=14,
    leading=18,
    alignment=TA_CENTER,
    textColor=MEDIUM_GRAY,
    spaceAfter=6,
    fontName='Helvetica',
))

styles.add(ParagraphStyle(
    name='PartHeader',
    fontSize=20,
    leading=26,
    alignment=TA_CENTER,
    textColor=GOLD,
    spaceBefore=20,
    spaceAfter=6,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='PartSubheader',
    fontSize=12,
    leading=16,
    alignment=TA_CENTER,
    textColor=LIGHT_GRAY,
    spaceAfter=20,
    fontName='Helvetica-Oblique',
))

styles.add(ParagraphStyle(
    name='SectionHeader',
    fontSize=13,
    leading=17,
    textColor=WARM_GOLD,
    spaceBefore=16,
    spaceAfter=6,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='TimeMark',
    fontSize=10,
    leading=13,
    textColor=LIGHT_GRAY,
    spaceBefore=12,
    spaceAfter=4,
    fontName='Helvetica-Oblique',
))

styles.add(ParagraphStyle(
    name='ScriptText',
    fontSize=11,
    leading=16,
    textColor=black,
    spaceAfter=6,
    fontName='Helvetica',
    alignment=TA_LEFT,
))

styles.add(ParagraphStyle(
    name='ScriptBold',
    fontSize=11,
    leading=16,
    textColor=black,
    spaceAfter=6,
    fontName='Helvetica-Bold',
    alignment=TA_LEFT,
))

styles.add(ParagraphStyle(
    name='StageMark',
    fontSize=10,
    leading=13,
    textColor=DARK_RED,
    spaceBefore=4,
    spaceAfter=4,
    fontName='Helvetica-BoldOblique',
))

styles.add(ParagraphStyle(
    name='SlideMark',
    fontSize=10,
    leading=13,
    textColor=HexColor("#2E7D32"),
    spaceBefore=4,
    spaceAfter=4,
    fontName='Helvetica-Oblique',
))

styles.add(ParagraphStyle(
    name='CTAMark',
    fontSize=10,
    leading=14,
    textColor=HexColor("#1565C0"),
    spaceBefore=6,
    spaceAfter=6,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='InteractionMark',
    fontSize=10,
    leading=14,
    textColor=HexColor("#6A1B9A"),
    spaceBefore=4,
    spaceAfter=4,
    fontName='Helvetica-BoldOblique',
))

styles.add(ParagraphStyle(
    name='SlideDesc',
    fontSize=9,
    leading=12,
    textColor=MEDIUM_GRAY,
    spaceBefore=2,
    spaceAfter=2,
    fontName='Helvetica',
    leftIndent=20,
))

styles.add(ParagraphStyle(
    name='Footer',
    fontSize=8,
    leading=10,
    textColor=LIGHT_GRAY,
    alignment=TA_CENTER,
))

# ─── Helper functions ───
def hr():
    return HRFlowable(width="100%", thickness=1, color=HexColor("#DDDDDD"), spaceBefore=8, spaceAfter=8)

def gold_hr():
    return HRFlowable(width="100%", thickness=2, color=GOLD, spaceBefore=10, spaceAfter=10)

def sp(points=6):
    return Spacer(1, points)

def txt(text, style='ScriptText'):
    return Paragraph(text, styles[style])

def bold(text):
    return Paragraph(text, styles['ScriptBold'])

def stage(text):
    return Paragraph(text, styles['StageMark'])

def slide(text):
    return Paragraph(text, styles['SlideMark'])

def slide_desc(text):
    return Paragraph(text, styles['SlideDesc'])

def cta(text):
    return Paragraph(text, styles['CTAMark'])

def interact(text):
    return Paragraph(text, styles['InteractionMark'])

def section(text):
    return Paragraph(text, styles['SectionHeader'])

def time_mark(text):
    return Paragraph(text, styles['TimeMark'])

# ═══════════════════════════════════════════════════════════
# BUILD THE STORY
# ═══════════════════════════════════════════════════════════
story = []

# ─── COVER PAGE ───
story.append(sp(100))
story.append(Paragraph("CLASE 1", styles['CoverTitle']))
story.append(sp(8))
story.append(Paragraph(
    "\"&iquest;Por qu&eacute; no puedes dejarlo<br/>aunque sabes que te destruye?\"",
    styles['CoverTitle']
))
story.append(sp(20))
story.append(gold_hr())
story.append(sp(10))
story.append(Paragraph("Gui&oacute;n completo para live", styles['CoverSubtitle']))
story.append(Paragraph("3 partes &bull; ~37,500 caracteres &bull; ~30-35 minutos", styles['CoverSubtitle']))
story.append(sp(20))
story.append(Paragraph("Javier Vieira", styles['CoverSubtitle']))
story.append(Paragraph("Psic&oacute;logo especialista &mdash; COLPSIC 293219", styles['CoverSubtitle']))
story.append(Paragraph("Historias de la Mente &bull; @historias.de.la.mente", styles['CoverSubtitle']))
story.append(sp(10))
story.append(gold_hr())
story.append(sp(30))
story.append(Paragraph("Programa: Apego Detox &mdash; $25 USD", styles['CoverSubtitle']))
story.append(Paragraph("historiasdelamente.com/apegodetox", styles['CoverSubtitle']))
story.append(PageBreak())

# ─── TABLE OF CONTENTS ───
story.append(Paragraph("ESTRUCTURA DEL GUI&Oacute;N", styles['PartHeader']))
story.append(sp(10))
story.append(gold_hr())
story.append(sp(10))

toc_data = [
    ["PARTE", "FUNCI&Oacute;N", "DURACI&Oacute;N", "INTENSIDAD"],
    ["Parte 1: Loop Abierto", "Golpe emocional + identificaci&oacute;n + abrir la herida", "~12 min", "4/10 &rarr; 9/10"],
    ["Parte 2: Desarrollo", "Profundizaci&oacute;n + educaci&oacute;n cl&iacute;nica + pico m&aacute;ximo", "~12 min", "7/10 &rarr; 10/10"],
    ["Parte 3: Cierre", "Esperanza + loop a Clase 2 + CTA directo", "~12 min", "5/10 &rarr; 8/10"],
]

toc_table_data = []
for row in toc_data:
    toc_table_data.append([Paragraph(cell, styles['ScriptText']) for cell in row])

toc_table = Table(toc_table_data, colWidths=[1.6*inch, 2.8*inch, 0.9*inch, 1.2*inch])
toc_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), GOLD),
    ('TEXTCOLOR', (0, 0), (-1, 0), black),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#CCCCCC")),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor("#F9F9F9")]),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(toc_table)

story.append(sp(20))

# Curva emocional
story.append(section("CURVA EMOCIONAL DE LA CLASE"))
story.append(sp(6))
curva = [
    "Min 0-3: &nbsp;&nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9601;&#9601; (8/10) &mdash; GOLPE de apertura",
    "Min 3-5: &nbsp;&nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9601;&#9601;&#9601;&#9601; (6/10) &mdash; Presentaci&oacute;n + CTA Semilla",
    "Min 5-9: &nbsp;&nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9601; (9/10) &mdash; Adicci&oacute;n al regreso",
    "Min 9-12: &nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9601;&#9601;&#9601;&#9601;&#9601;&#9601; (4/10) &mdash; RESPIRO. Validaci&oacute;n",
    "Min 12-17: &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9601; (9/10) &mdash; Culpa invertida",
    "Min 17-20: &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9601;&#9601;&#9601; (7/10) &mdash; Educaci&oacute;n cl&iacute;nica",
    "Min 20-24: &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; (10/10) &mdash; PICO M&Aacute;XIMO: Apag&oacute;n",
    "Min 24-27: &#9608;&#9608;&#9608;&#9608;&#9608;&#9601;&#9601;&#9601;&#9601;&#9601; (5/10) &mdash; Esperanza",
    "Min 27-30: &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9601;&#9601; (8/10) &mdash; CTA Directo + Cierre",
]
for line in curva:
    story.append(txt(line))

story.append(sp(10))

# Leyenda de marcas
story.append(section("LEYENDA DE MARCAS DEL GUI&Oacute;N"))
story.append(sp(6))
legend_data = [
    ["MARCA", "SIGNIFICADO"],
    ["[PAUSA X seg]", "Silencio intencional"],
    ["[VOZ BAJA]", "Bajar el tono, intimidad"],
    ["[VOZ FIRME]", "Subir el tono, autoridad"],
    ["[DESPACIO]", "Reducir velocidad, dejar que cale"],
    ["[INTERACCI&Oacute;N]", "Pedir respuesta a la audiencia"],
    ["&rarr; SLIDE:", "Cambiar diapositiva"],
    ["&rarr; CTA:", "Momento de llamado a acci&oacute;n"],
    ["[HISTORIA] / [/HISTORIA]", "Inicio/fin de bloque narrativo"],
]
legend_table_data = []
for row in legend_data:
    legend_table_data.append([Paragraph(cell, styles['ScriptText']) for cell in row])

legend_table = Table(legend_table_data, colWidths=[2.2*inch, 4.3*inch])
legend_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), GOLD),
    ('TEXTCOLOR', (0, 0), (-1, 0), black),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#CCCCCC")),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor("#F9F9F9")]),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(legend_table)

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════
# PARTE 1: LOOP ABIERTO
# ═══════════════════════════════════════════════════════════
story.append(Paragraph("PARTE 1: LOOP ABIERTO", styles['PartHeader']))
story.append(Paragraph("Golpe emocional + identificaci&oacute;n + abrir la herida", styles['PartSubheader']))
story.append(gold_hr())

# --- Apertura ---
section_title = "APERTURA"
time_info = "Minuto 0:00 - 3:00 | Intensidad: 8/10"
story.append(section(section_title))
story.append(time_mark(time_info))
story.append(hr())

story.append(slide("&rarr; SLIDE 1: Mujer en la oscuridad mirando su tel&eacute;fono (foto emocional, sin texto)"))
story.append(sp(4))
story.append(stage("[VOZ BAJA]"))
story.append(sp(4))
story.append(stage("[HISTORIA]"))
story.append(sp(4))

story.append(txt("Hace unas semanas me escribi&oacute; una mujer."))
story.append(sp(2))
story.append(txt("Las 3 de la ma&ntilde;ana."))
story.append(sp(2))
story.append(txt("Me dijo: \"Javier, &eacute;l me dej&oacute; hace 11 d&iacute;as. No duermo. No como. Reviso su Instagram cada 20 minutos. S&eacute; que me destruy&oacute;. Pero te juro que si me escribe ahorita, le contesto antes de que termine de sonar el tel&eacute;fono.\""))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))
story.append(txt("Once d&iacute;as sin dormir. Once d&iacute;as sin comer. Y lo &uacute;nico que quer&iacute;a era que &eacute;l le escribiera."))
story.append(sp(2))
story.append(txt("Ella sab&iacute;a que &eacute;l la destruy&oacute;. Lo sab&iacute;a. Pero su cuerpo no pod&iacute;a parar."))
story.append(sp(4))
story.append(stage("[/HISTORIA]"))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))

story.append(txt("Si algo de eso te suena... qu&eacute;date. Porque hoy vamos a hablar de algo que nadie te ha explicado."))
story.append(sp(4))

story.append(slide("&rarr; SLIDE 2: Fondo negro, texto dorado: \"No es amor. Es cortisol.\""))
story.append(sp(4))

story.append(txt("Hoy vamos a responder la pregunta que te tortura cada noche:"))
story.append(sp(2))
story.append(bold("&iquest;Por qu&eacute; no puedes dejarlo aunque sabes que te destruye?"))
story.append(sp(2))
story.append(txt("Y la respuesta te va a cambiar todo."))
story.append(sp(8))

# --- Presentación + CTA Semilla ---
story.append(section("PRESENTACI&Oacute;N + CTA SEMILLA"))
story.append(time_mark("Minuto 3:00 - 5:00 | Intensidad: 6/10"))
story.append(hr())

story.append(txt("Soy Javier Vieira, psic&oacute;logo especialista. Llevo a&ntilde;os trabajando con mujeres que est&aacute;n atrapadas en relaciones que saben que les hacen da&ntilde;o pero no pueden soltar."))
story.append(sp(2))
story.append(txt("Y d&eacute;jame decirte algo: lo que te pasa tiene nombre. Tiene explicaci&oacute;n cient&iacute;fica. Y tiene soluci&oacute;n."))
story.append(sp(2))
story.append(txt("No eres d&eacute;bil. No est&aacute;s loca. Tu cerebro est&aacute; haciendo algo que la psicolog&iacute;a ya tiene documentado. Y hoy te lo voy a explicar."))
story.append(sp(6))
story.append(cta("&rarr; CTA SEMILLA:"))
story.append(txt("Lo que te voy a explicar hoy es apenas la superficie. Si al final de esta clase sientes que esto te describi&oacute;, te voy a contar c&oacute;mo podemos trabajar esto juntas. Pero por ahora, esc&uacute;chame. Porque lo que viene puede cambiar la forma en que entiendes todo lo que te est&aacute; pasando."))
story.append(sp(6))
story.append(txt("Bien. Vamos a empezar con lo m&aacute;s duro."))
story.append(sp(8))

# --- Primer bloque: Adicción al regreso ---
story.append(section("PRIMER BLOQUE DE DOLOR: LA ADICCI&Oacute;N AL REGRESO"))
story.append(time_mark("Minuto 5:00 - 9:00 | Intensidad: 8/10 &rarr; 9/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 3: Mujer acostada mirando al techo, lado vac&iacute;o de la cama, reloj marcando las 3am"))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))

story.append(txt("Voy a describir algo y quiero que seas honesta contigo misma."))
story.append(sp(2))
story.append(txt("&Eacute;l te deja. Te destruye. Te dice cosas que le romper&iacute;an el coraz&oacute;n a cualquiera."))
story.append(sp(2))
story.append(txt("Y despu&eacute;s se va."))
story.append(sp(2))
story.append(txt("Y t&uacute; te quedas ah&iacute;. Con un dolor f&iacute;sico en el pecho. Literal. Como si alguien te estuviera apretando el coraz&oacute;n con la mano. No puedes comer. No puedes dormir. No puedes funcionar. Revisas el tel&eacute;fono cada 30 segundos. Abres WhatsApp para ver si est&aacute; en l&iacute;nea. Ves la &uacute;ltima conexi&oacute;n. Abres su Instagram. Revisas qui&eacute;n le dio like. Cierras. Vuelves a abrir."))
story.append(sp(2))
story.append(txt("Y pasan los d&iacute;as. Y un d&iacute;a, sin aviso, te escribe."))
story.append(sp(2))
story.append(txt("Un \"hola\". Un meme. Una canci&oacute;n. Como si nada hubiera pasado."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(txt("Y en ese segundo &mdash; en ese segundo &mdash; el alivio que sientes es tan grande, TAN grande, que se te olvida todo lo que te hizo. Todo. Las l&aacute;grimas, los gritos, las humillaciones. Todo desaparece. Porque &eacute;l volvi&oacute;."))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(slide("&rarr; SLIDE 4: Fondo negro, texto dorado: \"Tu cerebro es adicto a la reconciliaci&oacute;n.\""))
story.append(sp(4))

story.append(stage("[VOZ FIRME]"))
story.append(sp(4))
story.append(txt("&iquest;Sabes qu&eacute; acaba de pasar en tu cerebro?"))
story.append(sp(2))
story.append(txt("Dopamina. La misma sustancia que se dispara con la coca&iacute;na. La misma. Exactamente la misma."))
story.append(sp(2))
story.append(txt("Tu cerebro no se enganch&oacute; a &eacute;l. Se enganch&oacute; al ALIVIO de que volvi&oacute;. Al ciclo. Al sube y baja. Al dolor y despu&eacute;s al alivio."))
story.append(sp(2))
story.append(txt("Funciona igual que una m&aacute;quina tragamonedas. No ganas casi nunca. Pero ese momento que ganas te engancha m&aacute;s que mil derrotas. Ese poquito de amor despu&eacute;s de tanta crueldad... tu cerebro lo interpreta como el premio gordo."))
story.append(sp(2))
story.append(txt("Eso se llama refuerzo intermitente. Y es el patr&oacute;n m&aacute;s adictivo que existe. M&aacute;s que la nicotina. M&aacute;s que el alcohol. M&aacute;s que las redes sociales."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(txt("No es que seas d&eacute;bil. No es que no tengas dignidad. No es que te falte amor propio. Es que tu cerebro est&aacute; secuestrado. Y hasta que no entiendas c&oacute;mo funciona el secuestro, no vas a poder escapar de &eacute;l."))
story.append(sp(6))

story.append(slide("&rarr; SLIDE 5: Pregunta en pantalla: \"&iquest;Cu&aacute;ntas veces dijiste 'esta es la &uacute;ltima vez'?\""))
story.append(sp(4))

story.append(interact("[INTERACCI&Oacute;N] \"Si esto te pasa, escr&iacute;beme un 's&iacute;' en los comentarios. Sin pena. Aqu&iacute; nadie te juzga. Aqu&iacute; estamos entre nosotras.\""))
story.append(sp(4))

story.append(stage("[PAUSA 5 segundos &mdash; dejar que escriban]"))
story.append(sp(4))

story.append(txt("Dime algo: &iquest;cu&aacute;ntas veces has dicho \"esta es la &uacute;ltima vez\"? &iquest;Tres? &iquest;Cinco? &iquest;Diez? &iquest;Ya perdiste la cuenta?"))
story.append(sp(2))
story.append(txt("No es falta de voluntad. No es falta de fuerza. Es qu&iacute;mica. Tu cerebro est&aacute; haciendo lo que los cerebros adictos hacen: buscar la pr&oacute;xima dosis. Y la pr&oacute;xima dosis es &eacute;l."))
story.append(sp(8))

# --- Respiro y Validación ---
story.append(section("RESPIRO Y VALIDACI&Oacute;N"))
story.append(time_mark("Minuto 9:00 - 11:00 | Intensidad: 4/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 6: Manos de mujer abraz&aacute;ndose, luz dorada c&aacute;lida"))
story.append(sp(4))
story.append(stage("[VOZ BAJA]"))
story.append(sp(4))

story.append(txt("Pero antes de seguir, necesito que escuches algo. Y necesito que lo escuches de verdad."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))

story.append(bold("No es tu culpa."))
story.append(sp(4))
story.append(stage("[PAUSA 2 segundos]"))
story.append(sp(4))

story.append(txt("No est&aacute;s loca. No eres d&eacute;bil. No eres est&uacute;pida. No te falta amor propio."))
story.append(sp(2))
story.append(txt("Tu sistema nervioso est&aacute; haciendo lo que aprendi&oacute; a hacer para sobrevivir. Tu cerebro est&aacute; buscando lo que conoce. Y lo que conoce es el ciclo. Dolor. Alivio. Dolor. Alivio. Y como ese ciclo se parece tanto a lo que tu cuerpo conoce desde ni&ntilde;a... tu cerebro lo confunde con amor."))
story.append(sp(2))
story.append(txt("Ese nudo en el est&oacute;mago cuando ves su nombre en el tel&eacute;fono no es mariposas. Es alarma. Es tu sistema nervioso grit&aacute;ndote: \"peligro\". Pero como llevas tanto tiempo en modo de supervivencia, ya no distingues la alarma del deseo."))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(txt("Y eso no es tu culpa. Tu cuerpo sabe la verdad. Hoy vamos a empezar a escucharlo."))
story.append(sp(8))

# --- Loop abierto ---
story.append(section("LOOP ABIERTO &rarr; PARTE 2"))
story.append(time_mark("Minuto 11:00 - 12:00 | Intensidad: 6/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 7: Transici&oacute;n &mdash; pantalla negra con texto: \"Pero eso no es lo peor...\""))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))

story.append(txt("Ahora. Lo que te acabo de contar es solo la primera capa. La adicci&oacute;n al regreso."))
story.append(sp(2))
story.append(txt("Pero &eacute;l no solo te enganch&oacute;."))
story.append(sp(2))
story.append(txt("Hizo algo peor."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(txt("Te convenci&oacute; de que la culpa de todo... era tuya."))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))
story.append(txt("Y de eso vamos a hablar ahora."))

story.append(sp(20))
story.append(hr())
story.append(Paragraph("<i>Fin de Parte 1 &mdash; ~12,500 caracteres</i>", styles['Footer']))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════
# PARTE 2: DESARROLLO
# ═══════════════════════════════════════════════════════════
story.append(Paragraph("PARTE 2: DESARROLLO", styles['PartHeader']))
story.append(Paragraph("Profundizaci&oacute;n + educaci&oacute;n cl&iacute;nica + pico m&aacute;ximo", styles['PartSubheader']))
story.append(gold_hr())

# --- Culpa invertida ---
story.append(section("SEGUNDO DOLOR: LA CULPA INVERTIDA"))
story.append(time_mark("Minuto 12:00 - 17:00 | Intensidad: 7/10 &rarr; 9/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 8: Mujer mir&aacute;ndose en un espejo roto, reflejo distorsionado"))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))

story.append(txt("Te dije que &eacute;l hizo algo peor que engancharte. Y es esto:"))
story.append(sp(2))
story.append(txt("Te reprogam&oacute;."))
story.append(sp(2))
story.append(txt("Te hizo creer que t&uacute; eres la del problema. Que si fueras \"mejor\", &eacute;l no te tratar&iacute;a as&iacute;. Que si fueras menos intensa, menos celosa, menos sensible, menos... t&uacute;... todo estar&iacute;a bien."))
story.append(sp(2))
story.append(txt("\"T&uacute; me provocas.\" \"Si no fueras tan intensa.\" \"Est&aacute;s loca.\" \"Nadie te va a aguantar.\""))
story.append(sp(2))
story.append(txt("&iquest;Te suenan esas frases? Porque esas frases no son palabras. Son veneno. Son un goteo constante que va entrando en tu mente hasta que t&uacute; misma empiezas a repetirlas. Hasta que ya no necesitas que &eacute;l te las diga. Te las dices sola."))
story.append(sp(4))
story.append(stage("[PAUSA 2 segundos]"))
story.append(sp(4))

story.append(stage("[HISTORIA]"))
story.append(sp(4))

story.append(txt("Camila ten&iacute;a 36 a&ntilde;os. Llevaba 4 a&ntilde;os con un hombre que le dec&iacute;a que ella era \"demasiado\". Demasiado intensa. Demasiado sensible. Demasiado celosa. Demasiado necesitada."))
story.append(sp(2))
story.append(txt("Y Camila, que antes de &eacute;l era una mujer segura, alegre, con amigas, con vida... despu&eacute;s de 4 a&ntilde;os ya no se reconoc&iacute;a."))
story.append(sp(2))
story.append(txt("Un d&iacute;a me mir&oacute; en sesi&oacute;n y me dijo:"))
story.append(sp(2))
story.append(bold("\"Javier, &iquest;y si tiene raz&oacute;n? &iquest;Y si el problema siempre fui yo?\""))
story.append(sp(2))
story.append(txt("Le pregunt&eacute; una sola cosa:"))
story.append(sp(2))
story.append(bold("\"&iquest;Eras as&iacute; antes de conocerlo?\""))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))
story.append(txt("Se qued&oacute; en silencio. Y se le llenaron los ojos de l&aacute;grimas."))
story.append(sp(2))
story.append(txt("Porque la respuesta era no."))
story.append(sp(2))
story.append(txt("No era as&iacute; antes de &eacute;l. &Eacute;l la hizo as&iacute;."))
story.append(sp(4))
story.append(stage("[/HISTORIA]"))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(slide("&rarr; SLIDE 9: Fondo negro, texto dorado: \"T&uacute; no eres el problema.\""))
story.append(sp(4))

story.append(txt("Eso se llama gaslighting. Y funciona as&iacute;:"))
story.append(sp(2))
story.append(txt("Imagina que alguien te mueve los muebles de tu casa un cent&iacute;metro cada d&iacute;a. Un cent&iacute;metro. Nada. Casi invisible. T&uacute; sientes que algo est&aacute; mal, pero no puedes se&ntilde;alar qu&eacute;. Algo se siente raro. Algo no est&aacute; donde deber&iacute;a estar. Pero cada vez que dices \"algo cambi&oacute;\", &eacute;l te dice: \"est&aacute;s loca, todo est&aacute; igual\"."))
story.append(sp(2))
story.append(txt("Hasta que un d&iacute;a ya no reconoces tu propia casa."))
story.append(sp(2))
story.append(txt("Eso es lo que hizo con tu mente. Te fue moviendo la realidad tan despacio que ahora T&Uacute; crees que la loca eres t&uacute;. Que la exagerada eres t&uacute;. Que el problema eres t&uacute;."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(bold("Mentira. El problema nunca fuiste t&uacute;."))
story.append(sp(2))
story.append(txt("Y la prueba est&aacute; en una sola pregunta: &iquest;Eras as&iacute; antes de conocerlo?"))
story.append(sp(4))

story.append(interact("[INTERACCI&Oacute;N] \"Haz algo por m&iacute;. Cierra los ojos un segundo y preg&uacute;ntate: &iquest;qui&eacute;n era yo antes de &eacute;l? Si la respuesta te duele, escr&iacute;beme un coraz&oacute;n en los comentarios.\""))
story.append(sp(4))
story.append(stage("[PAUSA 5 segundos]"))
story.append(sp(8))

# --- Hipervigilancia ---
story.append(section("MENCI&Oacute;N: HIPERVIGILANCIA"))
story.append(time_mark("Minuto 17:00 - 18:00 | Intensidad: 7/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 10: Primer plano de ojos mirando tel&eacute;fono, reflejo de pantalla"))
story.append(sp(4))

story.append(txt("Y a la culpa se le suma algo m&aacute;s: la vigilancia permanente."))
story.append(sp(2))
story.append(txt("Revisas su &uacute;ltima conexi&oacute;n. Su foto de perfil. A qui&eacute;n sigue. A qui&eacute;n le da like. Cu&aacute;ndo se conect&oacute;. Cu&aacute;ndo se desconect&oacute;. Qu&eacute; historias vio. Qu&eacute; historias no vio."))
story.append(sp(2))
story.append(txt("Y vives en un estado de ansiedad que no para. Nunca. Porque tu sistema nervioso est&aacute; en alerta permanente. Tu cuerpo est&aacute; viviendo como si estuvieras en medio de una guerra. Las 24 horas del d&iacute;a. Los 7 d&iacute;as de la semana."))
story.append(sp(2))
story.append(txt("Y est&aacute;s agotada. Pero no puedes parar. Porque parar significa no saber. Y no saber es peor que el agotamiento."))
story.append(sp(2))
story.append(txt("Eso se llama activaci&oacute;n simp&aacute;tica cr&oacute;nica. Tu sistema nervioso est&aacute; disparado todo el tiempo. Y eso tiene consecuencias en tu cuerpo: insomnio, problemas digestivos, dolores de cabeza, tensi&oacute;n muscular. Tu cuerpo est&aacute; pagando la factura de tu relaci&oacute;n."))
story.append(sp(8))

# --- Educación clínica ---
story.append(section("EDUCACI&Oacute;N CL&Iacute;NICA: &iquest;QU&Eacute; ES EL TRAUMA BONDING?"))
story.append(time_mark("Minuto 18:00 - 20:00 | Intensidad: 7/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 11: Fondo negro, texto grande dorado: \"TRAUMA BONDING\""))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))

story.append(txt("Y aqu&iacute; viene lo que nadie te ha dicho. Lo que &eacute;l te hizo tiene un nombre cl&iacute;nico."))
story.append(sp(2))
story.append(bold("Se llama trauma bonding. V&iacute;nculo traum&aacute;tico."))
story.append(sp(2))
story.append(txt("Es un lazo emocional que se forma entre t&uacute; y la persona que te da&ntilde;a. Y se basa en algo muy espec&iacute;fico: ciclos de crueldad alternada con ternura."))
story.append(sp(2))
story.append(txt("&Eacute;l te destruye un martes y te reconstruye un jueves. Y t&uacute; le agradeces el jueves sin recordar el martes."))
story.append(sp(2))
story.append(txt("&iquest;Por qu&eacute;? Porque en tu cerebro est&aacute;n pasando tres cosas al mismo tiempo:"))
story.append(sp(2))
story.append(txt("<b>Dopamina</b> &mdash; Se dispara cuando &eacute;l vuelve. El \"premio\" despu&eacute;s del dolor. Tu cerebro se vuelve adicto a ese momento."))
story.append(sp(2))
story.append(txt("<b>Cortisol</b> &mdash; Estr&eacute;s cr&oacute;nico. Tu cuerpo vive en alerta todo el tiempo. Pero ya es tu \"normal\"."))
story.append(sp(2))
story.append(txt("<b>Oxitocina</b> &mdash; Se libera cuando &eacute;l te abraza despu&eacute;s de la pelea. La \"hormona del amor\". Pero no es amor. Es qu&iacute;mica post-trauma."))
story.append(sp(2))
story.append(txt("Y esa combinaci&oacute;n crea la sensaci&oacute;n de amor m&aacute;s intensa que has sentido en tu vida. Por eso dices \"nunca hab&iacute;a amado as&iacute;\". Por eso sientes que sin &eacute;l te mueres. Por eso lo comparas con todo el mundo y nadie se le acerca."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(txt("Pero no es amor. Es tu sistema nervioso confundido."))
story.append(sp(2))
story.append(txt("Tu relaci&oacute;n funciona como la abstinencia. El dolor de estar sin &eacute;l no es amor. Es tu cerebro pidiendo la droga."))
story.append(sp(6))
story.append(cta("&rarr; CTA PUENTE:"))
story.append(txt("Esto que acabo de explicarte &mdash; c&oacute;mo tu cerebro se volvi&oacute; adicto al ciclo &mdash; es exactamente lo que trabajamos a fondo en Apego Detox. Hay m&oacute;dulos espec&iacute;ficos para esto. Hay un protocolo de 8 pasos para cuando &eacute;l te escribe de nuevo. 8 pasos que literalmente te pueden salvar de recaer. Pero eso viene despu&eacute;s. Ahora necesito que entiendas algo m&aacute;s. Algo que es todav&iacute;a m&aacute;s profundo."))
story.append(sp(8))

# --- Pico máximo ---
story.append(section("PICO M&Aacute;XIMO: EL APAG&Oacute;N EMOCIONAL"))
story.append(time_mark("Minuto 20:00 - 24:00 | Intensidad: 9/10 &rarr; 10/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 12: Retrato blanco y negro, mujer con mirada vac&iacute;a, enfoque suave"))
story.append(sp(4))
story.append(stage("[VOZ BAJA]"))
story.append(sp(4))

story.append(txt("Y ahora voy a hablarte de algo que quiz&aacute;s es lo m&aacute;s dif&iacute;cil de escuchar esta noche."))
story.append(sp(2))
story.append(txt("Porque hay algo peor que el dolor de que se vaya."))
story.append(sp(2))
story.append(txt("Hay algo peor que la culpa de creer que eres t&uacute; la del problema."))
story.append(sp(2))
story.append(txt("Hay algo peor que la ansiedad de revisar su tel&eacute;fono todo el d&iacute;a."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(bold("Es no sentir nada."))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(txt("Un d&iacute;a te despiertas y ya no sientes dolor. Pero tampoco sientes alegr&iacute;a. No sientes rabia. No sientes tristeza. No sientes NADA. Es como si te hubieran desconectado por dentro."))
story.append(sp(2))
story.append(txt("Haces las cosas en autom&aacute;tico. Te levantas. Te ba&ntilde;as. Vas a trabajar. Sonr&iacute;es cuando toca sonre&iacute;r. Pero por dentro est&aacute;s vac&iacute;a. Como si estuvieras viviendo la vida de alguien m&aacute;s."))
story.append(sp(4))

story.append(stage("[HISTORIA]"))
story.append(sp(4))

story.append(txt("La historia que m&aacute;s me ha dolido en mi ejercicio profesional."))
story.append(sp(2))
story.append(txt("Una mujer me dijo:"))
story.append(sp(2))
story.append(bold("\"Javier, ayer &eacute;l me grit&oacute; en frente de mis hijos. Y yo no sent&iacute; nada. Ni rabia. Ni tristeza. Nada. Me qued&eacute; parada como si estuviera viendo una pel&iacute;cula de alguien m&aacute;s.\""))
story.append(sp(4))
story.append(stage("[PAUSA 2 segundos]"))
story.append(sp(4))
story.append(txt("\"Y cuando mis hijos me miraron con miedo... tampoco sent&iacute; nada.\""))
story.append(sp(4))
story.append(stage("[PAUSA 2 segundos]"))
story.append(sp(4))
story.append(txt("Y me dijo algo que se me qued&oacute; grabado para siempre:"))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(bold("\"Creo que ya me mor&iacute; por dentro.\""))
story.append(sp(4))
story.append(stage("[/HISTORIA]"))
story.append(sp(4))
story.append(stage("[PAUSA 5 segundos &mdash; silencio total]"))
story.append(sp(4))

story.append(txt("Eso se llama apag&oacute;n emocional."))
story.append(sp(2))
story.append(txt("Y funciona as&iacute;: tu cuerpo jal&oacute; el fusible. Como cuando hay un cortocircuito en tu casa y salta el t&eacute;rmico y todo se apaga. No es que dejaste de sentir. Es que tu sistema nervioso lleg&oacute; al l&iacute;mite."))
story.append(sp(2))
story.append(txt("Es la &uacute;ltima l&iacute;nea de defensa de tu cuerpo. Cuando ya no pudo seguir peleando, cuando ya no pudo seguir huyendo... se apag&oacute;. Colapso total."))
story.append(sp(2))
story.append(txt("En psicolog&iacute;a le llamamos estado dorsal vagal. Tu sistema nervioso dice: \"ya no puedo m&aacute;s\" y entra en modo de supervivencia m&iacute;nima. Respiras. Comes. Funcionas. Pero no vives."))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))
story.append(txt("Y si t&uacute; est&aacute;s en ese punto &mdash; si hace tiempo que no sientes nada, que haces las cosas en autom&aacute;tico, que ya ni lloras, que ya ni te enojas &mdash; necesito que escuches esto:"))
story.append(sp(4))

story.append(slide("&rarr; SLIDE 13: Fondo negro, texto dorado: \"No est&aacute;s rota. Sobreviviste.\""))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))

story.append(bold("No est&aacute;s rota. Sobreviviste."))
story.append(sp(2))
story.append(txt("Tu cuerpo hizo lo &uacute;nico que pod&iacute;a hacer para protegerte. Se apag&oacute;. Porque era eso o romperse completamente."))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(txt("Y se puede volver a encender. Pero no sola."))
story.append(sp(4))
story.append(txt("De eso vamos a hablar ahora."))

story.append(sp(20))
story.append(hr())
story.append(Paragraph("<i>Fin de Parte 2 &mdash; ~12,500 caracteres</i>", styles['Footer']))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════
# PARTE 3: CIERRE
# ═══════════════════════════════════════════════════════════
story.append(Paragraph("PARTE 3: CIERRE", styles['PartHeader']))
story.append(Paragraph("Esperanza + loop a Clase 2 + CTA directo", styles['PartSubheader']))
story.append(gold_hr())

# --- Resolución ---
story.append(section("RESOLUCI&Oacute;N DEL APAG&Oacute;N EMOCIONAL"))
story.append(time_mark("Minuto 24:00 - 26:00 | Intensidad: 5/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 14: Manos plantando una semilla en tierra oscura, luz c&aacute;lida lateral"))
story.append(sp(4))
story.append(stage("[VOZ BAJA]"))
story.append(sp(4))

story.append(txt("Esc&uacute;chame bien."))
story.append(sp(2))
story.append(txt("Que tu cuerpo se haya apagado no significa que est&eacute;s muerta por dentro. Significa que tu sistema nervioso te protegi&oacute; de la &uacute;nica forma que sab&iacute;a."))
story.append(sp(2))
story.append(txt("Es como una planta que deja caer sus hojas en invierno. No est&aacute; muerta. Est&aacute; sobreviviendo. Est&aacute; guardando su energ&iacute;a para cuando llegue el momento de volver a crecer."))
story.append(sp(2))
story.append(txt("Y ese momento puede llegar. Pero necesitas entender qu&eacute; te pas&oacute; para poder sanar. No puedes sanar lo que no entiendes. Y hoy empezaste a entender."))
story.append(sp(4))
story.append(stage("[PAUSA 2 segundos]"))
story.append(sp(4))

story.append(txt("Hoy entendiste por qu&eacute; no puedes dejarlo: porque tu cerebro es adicto al ciclo."))
story.append(sp(2))
story.append(txt("Hoy entendiste por qu&eacute; crees que es tu culpa: porque &eacute;l te reporgram&oacute; con gaslighting."))
story.append(sp(2))
story.append(txt("Hoy entendiste por qu&eacute; dejaste de sentir: porque tu cuerpo se protegi&oacute;."))
story.append(sp(2))
story.append(txt("Tres verdades. Tres cosas que probablemente nadie te hab&iacute;a explicado as&iacute;."))
story.append(sp(8))

# --- Esperanza ---
story.append(section("ESPERANZA: LA TRANSFORMACI&Oacute;N ES POSIBLE"))
story.append(time_mark("Minuto 26:00 - 27:00 | Intensidad: 6/10 &rarr; 7/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 15: Imagen de amanecer sobre monta&ntilde;as, rayos de sol rompiendo nubes"))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))

story.append(txt("Y ahora quiero decirte algo que necesitas escuchar."))
story.append(sp(2))
story.append(txt("He trabajado con cientos de mujeres que estaban exactamente donde t&uacute; est&aacute;s ahora. Que no pod&iacute;an dormir. Que revisaban el tel&eacute;fono cada 30 segundos. Que cre&iacute;an que sin &eacute;l no eran nadie. Que se hab&iacute;an apagado por dentro."))
story.append(sp(2))
story.append(txt("Y muchas de ellas hoy est&aacute;n en un lugar completamente diferente."))
story.append(sp(2))
story.append(txt("No porque sean m&aacute;s fuertes que t&uacute;. No porque tengan algo que t&uacute; no tienes. Sino porque entendieron lo que te estoy explicando hoy. Y despu&eacute;s hicieron el trabajo."))
story.append(sp(2))
story.append(txt("El trabajo de entender c&oacute;mo funciona tu cerebro. De reconectar con tu cuerpo. De aprender a distinguir el amor real de la adicci&oacute;n. De sanar la ra&iacute;z, no solo el s&iacute;ntoma."))
story.append(sp(2))
story.append(txt("Y la transformaci&oacute;n real empieza con lo que hiciste hoy: quedarte. Escuchar. Empezar a entender."))
story.append(sp(8))

# --- Loop Clase 2 ---
story.append(section("LOOP ABIERTO &rarr; CLASE 2: LA NI&Ntilde;A INTERIOR"))
story.append(time_mark("Minuto 27:00 - 28:30 | Intensidad: 8/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 16: Fondo oscuro con texto dorado: \"La ni&ntilde;a que aprendi&oacute; a quedarse callada.\""))
story.append(sp(4))
story.append(stage("[VOZ BAJA]"))
story.append(sp(4))

story.append(txt("Pero hay algo m&aacute;s profundo que no alcanc&eacute; a contarte hoy. Y necesito que lo sepas."))
story.append(sp(2))
story.append(txt("Todo lo que te expliqu&eacute; hoy &mdash; la adicci&oacute;n, la culpa, el apag&oacute;n &mdash; tiene una ra&iacute;z. Y esa ra&iacute;z no est&aacute; en &eacute;l. Est&aacute; en ti. No porque seas el problema. Sino porque hay algo dentro de ti que vino antes que &eacute;l."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(txt("Hay una ni&ntilde;a dentro de ti que aprendi&oacute; a amar as&iacute; mucho antes de que &eacute;l apareciera."))
story.append(sp(2))
story.append(txt("Esa ni&ntilde;a de 5 a&ntilde;os que se quedaba esperando en la puerta a que pap&aacute; llegara... sigue esperando. Pero ahora espera mensajes de WhatsApp."))
story.append(sp(2))
story.append(txt("Esa ni&ntilde;a que aprendi&oacute; que para que la quisieran ten&iacute;a que ser \"buena\", ten&iacute;a que callarse, ten&iacute;a que aguantar... sigue callada. Sigue aguantando. Sigue siendo \"buena\" para que no la abandonen."))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(txt("&iquest;Sabes la frase que m&aacute;s me dicen las mujeres que trabajan conmigo?"))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(bold("\"Jur&eacute; que nunca me iba a pasar esto.\""))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(txt("Juraste que nunca ibas a repetir lo que viste en tu casa. Que nunca ibas a permitir lo que tu mam&aacute; permiti&oacute;. Que nunca ibas a elegir a alguien como tu pap&aacute;. Y sin embargo..."))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))
story.append(txt("Y de esa ni&ntilde;a &mdash; de esa ra&iacute;z &mdash; vamos a hablar en la pr&oacute;xima clase. Porque ah&iacute; est&aacute; la clave de todo. Ah&iacute; est&aacute; la raz&oacute;n por la que eliges lo que eliges. Y ah&iacute; est&aacute; tambi&eacute;n la puerta para salir."))
story.append(sp(8))

# --- CTA Directo ---
story.append(section("CTA DIRECTO"))
story.append(time_mark("Minuto 28:30 - 30:00 | Intensidad: 8/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 17: Slide de producto &mdash; Apego Detox &mdash; $25 USD &mdash; datos del programa"))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))
story.append(cta("&rarr; CTA DIRECTO:"))
story.append(sp(4))

story.append(txt("Si lo que escuchaste hoy te describi&oacute;. Si sentiste que te estaba hablando a ti. Si en alg&uacute;n momento de esta clase pensaste \"Dios m&iacute;o, &iquest;c&oacute;mo sabe esto de m&iacute;?\"..."))
story.append(sp(2))
story.append(bold("Apego Detox es el espacio donde hacemos este trabajo."))
story.append(sp(2))
story.append(txt("Son 8 m&oacute;dulos completos. 32 cap&iacute;tulos. Terapia en vivo conmigo dos veces por semana por Google Meet. No es un curso grabado que nadie ve. Es un espacio real, en vivo, donde trabajamos juntas."))
story.append(sp(2))
story.append(txt("Tienes una comunidad de mujeres en WhatsApp que est&aacute;n pasando por lo mismo que t&uacute;. Que entienden. Que no te juzgan. Que est&aacute;n ah&iacute; a las 3am cuando necesitas hablar."))
story.append(sp(2))
story.append(txt("Acompa&ntilde;amiento 24/7. Acceso inmediato. Y se actualiza constantemente con nuevos m&oacute;dulos cada mes."))
story.append(sp(2))
story.append(bold("Y cuesta 25 d&oacute;lares."))
story.append(sp(2))
story.append(txt("25 d&oacute;lares. Menos de lo que gastas en un almuerzo un s&aacute;bado. Menos de lo que cuesta una cita con un psic&oacute;logo. Menos de lo que vale una sola noche sin dormir por &eacute;l."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(bold("Entras devastada &mdash; con una vida que siente que ya no tiene sentido sin &eacute;l.<br/>Sales respondiendo la pregunta que m&aacute;s duele: &iquest;qui&eacute;n soy yo antes de &eacute;l?"))
story.append(sp(4))

story.append(txt("El link est&aacute; en la descripci&oacute;n. historiasdelamente.com/apegodetox"))
story.append(sp(2))
story.append(txt("Si no es hoy, no pasa nada. Pero si algo de lo que dije hoy te movi&oacute;..."))
story.append(sp(4))
story.append(stage("[VOZ FIRME]"))
story.append(sp(4))
story.append(txt("No dejes que tu apego ansioso te convenza de que \"ma&ntilde;ana lo hago\". Porque ma&ntilde;ana tu cerebro ya te habr&aacute; convencido de que no era para tanto. De que \"no est&aacute;s tan mal\". De que \"puedes sola\"."))
story.append(sp(2))
story.append(txt("Ese es tu patr&oacute;n hablando. No t&uacute;."))
story.append(sp(8))

# --- Cierre emocional ---
story.append(section("CIERRE EMOCIONAL"))
story.append(time_mark("Minuto 30:00 - 32:00 | Intensidad: 6/10"))
story.append(hr())

story.append(slide("&rarr; SLIDE 18: Fondo negro con texto dorado: \"No es tu culpa. Hay salida.\""))
story.append(sp(4))
story.append(stage("[VOZ BAJA]"))
story.append(sp(4))

story.append(txt("Y si hoy solo puedes quedarte aqu&iacute; y escuchar... tambi&eacute;n est&aacute; bien."))
story.append(sp(2))
story.append(txt("Si hoy no puedes dar el paso, no pasa nada. No te juzgo. No te presiono. Porque entiendo d&oacute;nde est&aacute;s. Entiendo que tu cerebro est&aacute; cansado. Que tu cuerpo est&aacute; agotado. Que llevas meses &mdash; quiz&aacute;s a&ntilde;os &mdash; en modo de supervivencia."))
story.append(sp(2))
story.append(txt("Pero lo m&aacute;s importante que te lleves esta noche no es un link. No es un programa. No es un precio."))
story.append(sp(4))
story.append(stage("[DESPACIO]"))
story.append(sp(4))
story.append(txt("Lo m&aacute;s importante que te lleves esta noche es saber tres cosas:"))
story.append(sp(4))
story.append(bold("Lo que sientes tiene nombre."))
story.append(sp(2))
story.append(bold("No est&aacute;s loca."))
story.append(sp(2))
story.append(bold("Y hay salida."))
story.append(sp(4))
story.append(stage("[PAUSA 5 segundos]"))
story.append(sp(4))

story.append(txt("Gracias por quedarte. Gracias por escuchar. Gracias por ser valiente hoy."))
story.append(sp(2))
story.append(txt("Nos vemos en la pr&oacute;xima clase. Donde vamos a hablar de esa ni&ntilde;a que todav&iacute;a est&aacute; esperando en la puerta."))
story.append(sp(4))
story.append(stage("[PAUSA 3 segundos]"))
story.append(sp(4))

story.append(interact("[INTERACCI&Oacute;N] \"Si esta clase te movi&oacute; algo, escr&iacute;beme en los comentarios qu&eacute; fue lo que m&aacute;s te impact&oacute;. Te leo.\""))
story.append(sp(4))

story.append(txt("Cu&iacute;date mucho. Y recuerda: no es tu culpa."))

story.append(sp(20))
story.append(hr())
story.append(Paragraph("<i>Fin de Parte 3 &mdash; ~12,500 caracteres</i>", styles['Footer']))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════
# SLIDES DECK
# ═══════════════════════════════════════════════════════════
story.append(Paragraph("DECK DE DIAPOSITIVAS", styles['PartHeader']))
story.append(Paragraph("18 slides de apoyo visual para el live", styles['PartSubheader']))
story.append(gold_hr())

slides_data = [
    ("SLIDE 1", "Min 0:00", "Apertura", "FOTO EMOCIONAL",
     "Mujer latina ~30 a&ntilde;os, sentada en el borde de la cama en la oscuridad, iluminada solo por la luz del tel&eacute;fono, expresi&oacute;n de angustia, s&aacute;banas desordenadas",
     "Sin texto", "Negros, azul oscuro, luz blanca del tel&eacute;fono"),
    ("SLIDE 2", "Min 2:30", "Post-apertura", "DATO/CONCEPTO",
     "Fondo negro s&oacute;lido (#1a1a1a)",
     "\"No es amor. Es cortisol.\"", "Negro + dorado #e8c840"),
    ("SLIDE 3", "Min 5:00", "Adicci&oacute;n", "FOTO EMOCIONAL",
     "Mujer acostada en cama blanca, mirando al techo, reloj marcando las 3am, lado vac&iacute;o de la cama",
     "Sin texto", "Azules fr&iacute;os, grises, sombras"),
    ("SLIDE 4", "Min 7:30", "Dopamina", "DATO/CONCEPTO",
     "Fondo negro s&oacute;lido",
     "\"Tu cerebro es adicto a la reconciliaci&oacute;n.\"", "Negro + dorado"),
    ("SLIDE 5", "Min 9:00", "Interacci&oacute;n", "PREGUNTA",
     "Fondo gris oscuro limpio",
     "\"&iquest;Cu&aacute;ntas veces dijiste 'esta es la &uacute;ltima vez'?\"", "Blanco sobre gris"),
    ("SLIDE 6", "Min 10:00", "Validaci&oacute;n", "FOTO EMOCIONAL",
     "Manos de mujer abraz&aacute;ndose a s&iacute; misma, luz dorada suave, primer plano",
     "Sin texto", "Dorados, &aacute;mbar, calidez"),
    ("SLIDE 7", "Min 11:30", "Transici&oacute;n", "TRANSICI&Oacute;N",
     "Pantalla negra",
     "\"Pero eso no es lo peor...\"", "Negro + blanco"),
    ("SLIDE 8", "Min 13:00", "Culpa", "FOTO EMOCIONAL",
     "Mujer mir&aacute;ndose en espejo roto/fracturado, reflejo distorsionado, iluminaci&oacute;n dura",
     "Sin texto", "Tonos fr&iacute;os, contrastes"),
    ("SLIDE 9", "Min 16:00", "Post-Camila", "DATO/CONCEPTO",
     "Fondo negro s&oacute;lido",
     "\"T&uacute; no eres el problema.\"", "Negro + dorado"),
    ("SLIDE 10", "Min 17:00", "Vigilancia", "FOTO EMOCIONAL",
     "Primer&iacute;simo plano de ojos mirando tel&eacute;fono, ojeras, reflejo de pantalla",
     "Sin texto", "Tonos fr&iacute;os, luz artificial"),
    ("SLIDE 11", "Min 18:00", "Trauma bonding", "DATO/CONCEPTO",
     "Fondo negro s&oacute;lido",
     "\"TRAUMA BONDING\"", "Negro + dorado grande"),
    ("SLIDE 12", "Min 22:00", "Apag&oacute;n", "FOTO EMOCIONAL",
     "Retrato blanco y negro, mujer con mirada completamente vac&iacute;a, enfoque suave",
     "Sin texto", "Blanco y negro, alto contraste"),
    ("SLIDE 13", "Min 24:00", "Sobreviviste", "DATO/CONCEPTO",
     "Fondo negro s&oacute;lido",
     "\"No est&aacute;s rota. Sobreviviste.\"", "Negro + dorado"),
    ("SLIDE 14", "Min 24:30", "Planta", "FOTO EMOCIONAL",
     "Manos plantando semilla en tierra oscura, luz c&aacute;lida lateral",
     "Sin texto", "Tonos tierra, dorados"),
    ("SLIDE 15", "Min 26:00", "Amanecer", "FOTO EMOCIONAL",
     "Paisaje de amanecer sobre monta&ntilde;as, rayos de sol rompiendo nubes",
     "Sin texto", "Dorados, naranjas, luz natural"),
    ("SLIDE 16", "Min 27:00", "Ni&ntilde;a interior", "DATO/CONCEPTO",
     "Fondo negro s&oacute;lido",
     "\"La ni&ntilde;a que aprendi&oacute; a quedarse callada.\"", "Negro + dorado"),
    ("SLIDE 17", "Min 28:30", "CTA", "PRODUCTO",
     "Fondo negro limpio con logo",
     "Apego Detox | $25 USD | 8 m&oacute;dulos | Terapia 2x/sem", "Negro + dorado + blanco"),
    ("SLIDE 18", "Min 30:00", "Cierre", "DATO/CONCEPTO",
     "Fondo negro s&oacute;lido",
     "\"No es tu culpa. Hay salida.\"", "Negro + dorado"),
]

for s in slides_data:
    story.append(section(f"{s[0]} &mdash; {s[1]} ({s[2]})"))
    story.append(txt(f"<b>Tipo:</b> {s[3]}"))
    story.append(txt(f"<b>Visual:</b> {s[4]}"))
    story.append(txt(f"<b>Texto:</b> {s[5]}"))
    story.append(txt(f"<b>Paleta:</b> {s[6]}"))
    story.append(sp(6))

# ─── Build ───
doc.build(story)
print(f"PDF generado exitosamente: {output_path}")
