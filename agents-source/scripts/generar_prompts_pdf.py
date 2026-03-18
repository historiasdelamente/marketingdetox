#!/usr/bin/env python3
"""
Genera PDF profesional con los 15 prompts de NotebookLM para Apego Detox.
Fondo blanco, tipografia limpia, cada slide en su seccion.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    HRFlowable, Table, TableStyle, Preformatted
)
from reportlab.lib import colors
import os

# Colors
GOLD_DARK = HexColor("#705700")
GOLD = HexColor("#b8960c")
DARK_TEXT = HexColor("#1a1a1a")
MEDIUM_GRAY = HexColor("#555555")
LIGHT_GRAY = HexColor("#999999")
DARK_RED = HexColor("#8B0000")
PROMPT_BG = HexColor("#F5F5F0")
WHITE = HexColor("#FFFFFF")

script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "Prompts_NotebookLM_ApegoDetox.pdf")

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.6 * inch,
    bottomMargin=0.6 * inch,
    leftMargin=0.75 * inch,
    rightMargin=0.75 * inch,
)

styles = getSampleStyleSheet()

styles.add(ParagraphStyle(name='CoverTitle', fontSize=26, leading=32, alignment=TA_CENTER, textColor=DARK_TEXT, spaceAfter=8, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='CoverSub', fontSize=14, leading=18, alignment=TA_CENTER, textColor=MEDIUM_GRAY, spaceAfter=6, fontName='Helvetica'))
styles.add(ParagraphStyle(name='CoverInfo', fontSize=10, leading=14, alignment=TA_CENTER, textColor=LIGHT_GRAY, spaceAfter=4, fontName='Helvetica'))
styles.add(ParagraphStyle(name='SlideNum', fontSize=10, leading=12, alignment=TA_LEFT, textColor=GOLD_DARK, spaceBefore=0, spaceAfter=2, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='SlideTitle', fontSize=17, leading=22, alignment=TA_LEFT, textColor=DARK_TEXT, spaceBefore=2, spaceAfter=4, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='SlideRef', fontSize=9.5, leading=13, alignment=TA_LEFT, textColor=DARK_RED, spaceBefore=0, spaceAfter=8, fontName='Helvetica-Oblique'))
styles.add(ParagraphStyle(name='PromptText', fontSize=10, leading=14.5, alignment=TA_LEFT, textColor=DARK_TEXT, spaceBefore=6, spaceAfter=6, fontName='Courier', leftIndent=10, rightIndent=10, backColor=PROMPT_BG, borderPadding=8))
styles.add(ParagraphStyle(name='SlideType', fontSize=9, leading=12, alignment=TA_LEFT, textColor=MEDIUM_GRAY, spaceBefore=2, spaceAfter=2, fontName='Helvetica'))
styles.add(ParagraphStyle(name='Emotion', fontSize=9.5, leading=13, alignment=TA_LEFT, textColor=GOLD_DARK, spaceBefore=4, spaceAfter=0, fontName='Helvetica-BoldOblique'))
styles.add(ParagraphStyle(name='SectionHead', fontSize=14, leading=18, alignment=TA_LEFT, textColor=DARK_RED, spaceBefore=12, spaceAfter=8, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='MasterLabel', fontSize=11, leading=14, alignment=TA_CENTER, textColor=WHITE, fontName='Helvetica-Bold'))

# --- Content ---
slides = [
    {
        "num": 1,
        "title": "Las 3 de la mañana",
        "type": "IMAGEN",
        "part": "Parte 1",
        "ref": '"Se que estas leyendo esto a las dos de la manana..."',
        "emotion": "Identificacion",
        "prompt": 'Genera una fotografia hiperrealista sobre fondo blanco. Una mujer latina de unos 30 anos, cabello oscuro desordenado, sin maquillaje, ojos ligeramente hinchados. Esta sentada en el borde de una cama con sabanas blancas arrugadas en una habitacion completamente a oscuras. Sostiene su telefono con ambas manos a la altura del pecho. La unica luz en toda la imagen es la luz azul-blanca de la pantalla del telefono que ilumina su rostro y sus manos. Su expresion es de angustia silenciosa, cejas contraidas, labios apretados, mirando fijamente la pantalla como si estuviera a punto de escribir un mensaje que sabe que no deberia enviar. En la mesita de noche hay un reloj digital que marca las 3:17 AM en numeros rojos y un vaso de agua medio vacio. El otro lado de la cama esta vacio, la almohada sin tocar. La imagen se siente como una escena de documental psicologico, cruda, real, intima, con absoluta dignidad. Centrada sobre fondo blanco limpio con espacio alrededor como una fotografia enmarcada en galeria. Sin texto en la slide.'
    },
    {
        "num": 2,
        "title": "Tu cerebro esta secuestrado",
        "type": "LETRERO",
        "part": "Parte 1",
        "ref": '"La recoges porque tu cerebro esta secuestrado. Literalmente. Neurologicamente."',
        "emotion": "Impacto",
        "prompt": 'Genera una slide con fondo blanco puro. En el centro, el texto "Tu cerebro esta secuestrado." en color grafito oscuro casi negro, tipografia sans-serif bold, tamano grande, centrado horizontal y verticalmente. Debajo, con un espacio generoso, el subtexto "Y no es tu culpa." en gris medio, tipografia sans-serif light, tamano notablemente mas pequeno. Mucho espacio en blanco alrededor de ambas lineas de texto. Una linea horizontal decorativa muy delgada en dorado oscuro debajo del subtexto, centrada, que ocupe solo un tercio del ancho de la slide. La composicion debe sentirse limpia, profesional, seria. El silencio del espacio blanco amplifica el peso de la frase. Nada mas en la slide.'
    },
    {
        "num": 3,
        "title": "No es amor, es dopamina",
        "type": "LETRERO",
        "part": "Parte 1",
        "ref": '"Eso que tu sientes cuando el vuelve... eso no es amor. Es dopamina."',
        "emotion": "Revelacion",
        "prompt": 'Genera una slide con fondo blanco puro. Dos lineas de texto centradas verticalmente. La primera linea dice "No es amor." en color rojo oscuro profundo, tipografia sans-serif bold, tamano grande. La segunda linea justo debajo dice "Es dopamina." en color grafito oscuro casi negro, tipografia sans-serif bold, mismo tamano. Un espacio generoso entre ambas lineas para que respiren. Debajo de ambas, con mas espacio, el subtexto "Tu cerebro confunde el alivio del dolor con amor." en gris medio, tipografia sans-serif light, tamano considerablemente mas pequeno. Mucho espacio en blanco en toda la slide. Nada mas. La simplicidad hace que las palabras golpeen mas fuerte.'
    },
    {
        "num": 4,
        "title": "La nina en el rincon",
        "type": "IMAGEN",
        "part": "Parte 1",
        "ref": '"Piensa en esa nina que eras tu, sentada en algun rincon de la casa..."',
        "emotion": "Dolor profundo",
        "prompt": 'Genera una fotografia hiperrealista sobre fondo blanco. Una nina latina de aproximadamente 7 anos sentada en el rincon de una habitacion de una casa sencilla. Esta en el suelo con las rodillas contra el pecho, abrazandose a si misma. Lleva un vestido sencillo de algodon y zapatos escolares ligeramente gastados. Su cabello oscuro esta un poco despeinado. No llora, tiene una expresion de espera cautelosa, como si estuviera escuchando algo al otro lado de la pared que no deberia estar escuchando. La unica fuente de luz es una ventana a su izquierda que deja entrar luz dorada de tarde, creando sombras largas y suaves en el piso de baldosa. La puerta de la habitacion esta entreabierta frente a ella. Las paredes son sencillas, con pintura algo desgastada. La imagen tiene un tono ligeramente calido, como una memoria de infancia. Se siente como una fotografia de documental sobre la infancia, real, no posada, capturada en un momento intimo y vulnerable. Centrada sobre fondo blanco. Sin texto.'
    },
    {
        "num": 5,
        "title": "Esa nina sigue dentro de ti",
        "type": "LETRERO",
        "part": "Parte 1",
        "ref": '"Esa nina sigue dentro de ti. Y cada vez que el se va y tu sientes ese panico..."',
        "emotion": "Quiebre",
        "prompt": 'Genera una slide con fondo blanco puro. En el centro exacto de la slide, el texto "Esa nina sigue dentro de ti." en color grafito oscuro casi negro, tipografia serif con peso medio, tamano grande. Nada mas. Sin subtexto. Sin imagenes. Sin decoraciones. Sin lineas. Solo la frase sobre blanco infinito. El espacio vacio alrededor debe sentirse como silencio despues de una verdad que duele. La frase debe verse sola, flotando, como si fuera lo unico que existe en ese momento. Limpio. Directo. Devastador en su simplicidad.'
    },
    {
        "num": 6,
        "title": "Apagon emocional",
        "type": "LETRERO",
        "part": "Parte 1",
        "ref": '"Eso se llama apagon emocional. Es cuando tu sistema nervioso ya no puede mas..."',
        "emotion": "Reconocimiento",
        "prompt": 'Genera una slide con fondo blanco puro. El texto "APAGON EMOCIONAL" centrado, en color grafito oscuro casi negro, tipografia sans-serif bold con espaciado amplio entre letras, tamano grande. Debajo, con espacio generoso, el subtexto "Cuando tu cuerpo ya no puede mas, se apaga." en gris medio, tipografia sans-serif light, tamano mas pequeno. Una linea horizontal muy delgada en dorado oscuro encima del titulo, centrada, ocupando un cuarto del ancho. La composicion es limpia, clinica, seria, como la portada de un paper psicologico pero con impacto emocional. Mucho espacio blanco. La palabra APAGON debe sentirse como lo que describe: un momento donde todo se detiene.'
    },
    {
        "num": 7,
        "title": "La lagrima",
        "type": "IMAGEN",
        "part": "Parte 2",
        "ref": '"Quiero que cierres los ojos y pienses en la ultima vez que lloraste por el."',
        "emotion": "Vulnerabilidad",
        "prompt": 'Genera una fotografia hiperrealista sobre fondo blanco. Un close-up extremo de la mejilla de una mujer latina. Se ve solo la parte de la cara desde debajo del ojo hasta la barbilla. La piel es real, con textura visible, poros, sin retoque ni perfeccion artificial. Una sola lagrima recorre la mejilla desde el ojo hasta cerca de la barbilla, atrapando un pequeno reflejo de luz en su recorrido. La comisura del labio se ve ligeramente temblorosa. El fondo esta completamente desenfocado en tonos muy suaves, casi blancos. La iluminacion es lateral, suave, como la luz de una ventana en un dia nublado, sin dureza, sin sombras marcadas. La imagen esta centrada sobre fondo blanco de la slide con mucho espacio alrededor, como una fotografia de galeria de arte. Sin texto. Es la slide mas silenciosa y mas poderosa de toda la presentacion. Cruda pero con absoluta dignidad.'
    },
    {
        "num": 8,
        "title": "Gaslighting",
        "type": "LETRERO",
        "part": "Parte 2",
        "ref": '"Se llama gaslighting. Y es una de las formas mas crueles de abuso psicologico..."',
        "emotion": "Nombrar el abuso",
        "prompt": 'Genera una slide con fondo blanco puro. El texto "GASLIGHTING" centrado, en color grafito oscuro casi negro, tipografia sans-serif bold, tamano grande, con espaciado amplio entre letras. Debajo, con espacio generoso, el subtexto "Te hicieron creer que estabas loca." en gris medio, tipografia sans-serif light, tamano mas pequeno, tambien centrado. Mucho espacio en blanco en toda la slide. Una linea decorativa horizontal muy delgada en rojo oscuro profundo debajo del subtexto, centrada, que ocupe solo un cuarto del ancho. Nada mas en la slide. La composicion es seria, clinica, directa. La palabra GASLIGHTING debe verse como un diagnostico. Como el nombre de algo que por fin tiene nombre.'
    },
    {
        "num": 9,
        "title": "El no va a cambiar",
        "type": "LETRERO",
        "part": "Parte 2",
        "ref": '"El no va a cambiar. No. Escuchame bien. El no va a cambiar."',
        "emotion": "Verdad cruda",
        "prompt": 'Genera una slide con fondo blanco puro. En el centro exacto, el texto "El no va a cambiar." en color rojo oscuro profundo, tipografia sans-serif bold, tamano grande. Nada mas. Sin subtexto. Sin imagenes. Sin decoraciones. Sin lineas. Solo la frase en rojo oscuro sobre blanco infinito. El rojo oscuro no es agresivo, es solemne, como la verdad que necesitas escuchar aunque te duela. El espacio en blanco alrededor es inmenso, intencional, como una pausa larga despues de decir algo que no se puede retirar. Es la slide mas directa, mas honesta y mas necesaria de toda la presentacion.'
    },
    {
        "num": 10,
        "title": "Cuando entiendes",
        "type": "LETRERO",
        "part": "Parte 2",
        "ref": '"Y cuando entiendes... empiezas a ver las cosas de forma completamente diferente."',
        "emotion": "Primera esperanza",
        "prompt": 'Genera una slide con fondo blanco puro. El texto "Cuando entiendes," en color grafito oscuro, tipografia sans-serif medium, tamano grande, centrado. Debajo, el texto "empiezas a ver." en color dorado oscuro, tipografia sans-serif bold, mismo tamano, centrado. El dorado oscuro debe contrastar bien contra el blanco y sentirse como un rayo de luz entrando por primera vez. El espacio entre ambas lineas es generoso. Mucho blanco alrededor. Es una slide de transicion entre el dolor y la esperanza. El grafito oscuro es el pasado, el dorado es el primer destello de futuro. Nada mas en la slide. Limpia. Esperanzadora sin ser cursi.'
    },
    {
        "num": 11,
        "title": "La puerta abierta",
        "type": "IMAGEN",
        "part": "Parte 3",
        "ref": '"Afuera es donde esta tu vida. Tu vida real."',
        "emotion": "Decision",
        "prompt": 'Genera una fotografia hiperrealista sobre fondo blanco. Una mujer latina de unos 30 anos vista de espaldas, de pie frente a una puerta abierta de par en par. Detras de ella hay un pasillo en penumbra con sombras suaves. A traves de la puerta abierta entra luz dorada intensa de amanecer, volumetrica, con rayos de sol visibles en el aire y pequenas particulas de polvo flotando en la luz. No se ve que hay del otro lado de la puerta, solo luz dorada pura. La mujer tiene un pie ligeramente adelantado, como si estuviera a punto de dar el paso pero todavia no lo ha dado. Su silueta se recorta contra la luz. Lleva ropa sencilla, cabello suelto. Su postura transmite decision, no miedo. La composicion es simetrica, ella centrada, oscuridad a los lados, luz al centro. Centrada sobre fondo blanco. Sin texto. Es el momento visual donde todo cambia de direccion.'
    },
    {
        "num": 12,
        "title": "La mujer y la nina",
        "type": "IMAGEN",
        "part": "Parte 3",
        "ref": '"Esa nina sigue ahi. Esta escondida... Eres tu."',
        "emotion": "Reconciliacion",
        "prompt": 'Genera una fotografia hiperrealista con efecto de doble exposicion sobre fondo blanco. Una mujer latina adulta de unos 32 anos sentada en el suelo abrazando sus rodillas contra el pecho, mirando ligeramente hacia abajo. Superpuesta en transparencia sutil sobre ella, en la misma posicion exacta, una nina de aproximadamente 7 anos. Las dos figuras se fusionan suavemente, creando la impresion visual de que son la misma persona en dos momentos diferentes de su vida. La mujer adulta es mas visible, la nina aparece como una memoria o presencia interior translucida. La iluminacion es calida, dorada, como sol de atardecer entrando por una ventana. El tono general de la imagen es ligeramente calido, con matices de sepia moderno sutil. Centrada sobre fondo blanco con espacio generoso. Sin texto. Es la imagen mas emotiva de toda la presentacion. Transmite que sanar es reconciliarte con la nina que fuiste.'
    },
    {
        "num": 13,
        "title": "Tienes permiso",
        "type": "LETRERO",
        "part": "Parte 3",
        "ref": '"Tienes permiso. Tienes permiso para elegirte a ti..."',
        "emotion": "Abrazo emocional",
        "prompt": 'Genera una slide con fondo blanco puro. En el centro exacto de la slide, el texto "Tienes permiso." en color grafito oscuro casi negro, tipografia serif medium, tamano grande. Debajo, con espacio generoso, el subtexto "Para elegirte a ti." en gris medio, tipografia serif light italic, tamano mas pequeno. Mucho espacio en blanco alrededor. La tipografia serif le da calidez humana a la frase, como si fuera una carta escrita a mano. El punto final de la frase principal es importante: cierra la oracion con firmeza. Nada mas en la slide. Es una slide que debe sentirse como un abrazo. Como alguien que te toma de los hombros, te mira a los ojos y te dice lo que nadie te ha dicho.'
    },
    {
        "num": 14,
        "title": "Apego Detox: Tu salida",
        "type": "CTA",
        "part": "Parte 3",
        "ref": '"Apego Detox... 8 modulos completos, 32 capitulos, terapia en vivo..."',
        "emotion": "Confianza",
        "prompt": 'Genera una slide de producto con fondo blanco limpio y profesional. En la parte superior central, el texto "APEGO DETOX" en color dorado oscuro que contraste bien sobre blanco, tipografia sans-serif bold, tamano grande. Debajo, con espacio, el precio "$25 USD" en grafito oscuro casi negro, tipografia sans-serif bold, tamano destacado. Debajo del precio, una linea horizontal delgada decorativa en dorado oscuro que ocupe un tercio del ancho, centrada. Debajo de la linea, organizados en lista vertical centrada, los beneficios en grafito oscuro, tipografia sans-serif light, tamano mediano: 8 modulos y 32 capitulos. Terapia en vivo 2x por semana por Google Meet. Grupo de WhatsApp con comunidad de mujeres. Acompanamiento 24/7. Acceso inmediato. Debajo de los beneficios, con espacio, el texto "Javier Vieira - Psicologo Especialista" en gris medio, tamano pequeno. La composicion es limpia, ordenada, profesional, que transmita confianza y seriedad.'
    },
    {
        "num": 15,
        "title": "Tu nueva vida empieza hoy",
        "type": "CTA FINAL",
        "part": "Parte 3",
        "ref": '"historiasdelamente.com/apegodetox. Tu nueva vida te esta esperando."',
        "emotion": "Calma + accion",
        "prompt": 'Genera la slide final de la presentacion con fondo blanco limpio. En la parte superior central, el texto "Tu nueva vida empieza hoy." en color grafito oscuro casi negro, tipografia serif medium, tamano grande. Debajo, con espacio generoso, una linea horizontal delgada decorativa en dorado oscuro, centrada, un tercio del ancho. Debajo de la linea, la URL "historiasdelamente.com/apegodetox" en dorado oscuro que contraste bien, tipografia sans-serif medium, tamano mediano-grande. Debajo, con espacio, los datos de contacto en gris medio, tipografia sans-serif light, tamano pequeno: @historias.de.la.mente y WhatsApp +57 300 1681053. En la parte inferior, centrado, el texto "Javier Vieira - Psicologo Especialista (COLPSIC 293219)" en gris claro, tamano pequeno. Toda la composicion es limpia, profesional, con mucho espacio blanco. Es la ultima imagen que ven. Debe transmitir calma, confianza, y la sensacion de que el primer paso es simple.'
    },
]

# Master prompt
master_prompt = """Crea una presentacion de 15 slides basada en el documento adjunto. El documento tiene 3 partes sobre trauma bonding, apego emocional y sanacion, escrito por Javier Vieira, psicologo especialista.

Estilo general:
- Fondo blanco en todas las slides
- Imagenes hiperrealistas que parezcan fotografias reales, no ilustraciones
- Texto oscuro sobre blanco: negro para titulos, rojo oscuro para frases de dolor, dorado oscuro para la marca
- Tipografia limpia, moderna, grande
- Mucho espacio en blanco alrededor de cada elemento
- Maximo 7 palabras de texto por slide
- Las imagenes se presentan centradas con espacio blanco alrededor como fotografias de galeria
- Cada slide conecta con un momento exacto del documento
- Los letreros reflejan el concepto que se esta tratando en ese punto del texto"""

# --- Build PDF ---
story = []

# Cover
story.append(Spacer(1, 1.8 * inch))
story.append(Paragraph("PROMPTS NOTEBOOKLM", styles['CoverTitle']))
story.append(Spacer(1, 6))
story.append(Paragraph("15 Slides \u2014 Apego Detox", styles['CoverTitle']))
story.append(Spacer(1, 0.3 * inch))
story.append(HRFlowable(width="40%", thickness=2, color=GOLD, spaceAfter=15, spaceBefore=5))
story.append(Paragraph("Prompts listos para copiar y pegar en NotebookLM", styles['CoverSub']))
story.append(Paragraph("Coherentes con las 3 Partes del CTA Emocional", styles['CoverSub']))
story.append(Spacer(1, 0.5 * inch))
story.append(Paragraph("Javier Vieira \u2014 Psicologo Especialista (COLPSIC 293219)", styles['CoverInfo']))
story.append(Paragraph("Historias de la Mente \u2014 @historias.de.la.mente", styles['CoverInfo']))
story.append(Spacer(1, 0.8 * inch))

# Summary table
story.append(Paragraph("RESUMEN DE LAS 15 SLIDES", styles['SectionHead']))
table_data = [["#", "Tipo", "Contenido", "Parte", "Emocion"]]
for s in slides:
    table_data.append([str(s["num"]), s["type"], s["title"], s["part"], s["emotion"]])

t = Table(table_data, colWidths=[0.4*inch, 0.8*inch, 2.5*inch, 0.8*inch, 1.4*inch])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DARK_TEXT),
    ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 8.5),
    ('TEXTCOLOR', (0, 1), (-1, -1), DARK_TEXT),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor("#F8F8F8")]),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(PageBreak())

# Master prompt page
story.append(Paragraph("PROMPT MAESTRO", styles['SectionHead']))
story.append(Paragraph("Pegar esto primero en NotebookLM junto con el documento de las 3 partes:", styles['SlideType']))
story.append(Spacer(1, 6))

# Wrap master prompt
for line in master_prompt.split('\n'):
    line = line.strip()
    if not line:
        story.append(Spacer(1, 4))
        continue
    line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    story.append(Paragraph(line, styles['PromptText']))

story.append(PageBreak())

# Each slide
current_part = ""
for s in slides:
    # Section header when part changes
    if s["part"] != current_part:
        current_part = s["part"]
        if s["num"] == 1:
            label = "PARTE 1 \u2014 Yo se lo que sientes"
        elif s["num"] == 7:
            label = "PARTE 2 \u2014 Esto es lo que el te hizo"
        elif s["num"] == 11:
            label = "PARTE 3 \u2014 Tu nueva vida empieza hoy"
        else:
            label = current_part
        story.append(Paragraph(label, styles['SectionHead']))
        story.append(HRFlowable(width="100%", thickness=1.5, color=DARK_RED, spaceAfter=10, spaceBefore=2))

    # Slide header
    story.append(Paragraph(f"SLIDE {s['num']} / 15 \u2014 {s['type']}", styles['SlideNum']))
    title_clean = s['title'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    story.append(Paragraph(title_clean, styles['SlideTitle']))
    ref_clean = s['ref'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    story.append(Paragraph(f"{s['part']}: {ref_clean}", styles['SlideRef']))

    # Gold line
    story.append(HRFlowable(width="100%", thickness=0.75, color=GOLD, spaceAfter=6, spaceBefore=2))

    # Prompt label
    story.append(Paragraph("PROMPT PARA NOTEBOOKLM (copiar y pegar):", styles['SlideType']))

    # Prompt text - break into sentences for readability
    prompt_clean = s['prompt'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    story.append(Paragraph(prompt_clean, styles['PromptText']))

    # Emotion
    emotion_clean = s['emotion'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    story.append(Paragraph(f"Emocion objetivo: {emotion_clean}", styles['Emotion']))

    story.append(Spacer(1, 16))

    # Page break every 2 slides for readability
    if s["num"] in [2, 4, 6, 8, 10, 12, 14]:
        story.append(PageBreak())

# Build
print("Generating PDF...")
doc.build(story)
print(f"PDF generated: {output_path}")
print(f"Total slides: {len(slides)}")
