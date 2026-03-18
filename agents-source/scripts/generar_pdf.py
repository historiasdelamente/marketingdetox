"""
Genera PDFs profesionales de los talleres de Historias de la Mente.
Uso: python generar_pdf.py <archivo.md> <salida.pdf>
"""
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Colors
WARM_DARK = HexColor('#2C1810')
WARM_ACCENT = HexColor('#8B4513')
WARM_LIGHT = HexColor('#F5E6D3')
WARM_BG = HexColor('#FDF8F0')
GRAY_TEXT = HexColor('#555555')
EXERCISE_BG = HexColor('#F0E8DD')
QUESTION_BG = HexColor('#E8E0D4')
VINETA_BG = HexColor('#F8F4EE')

def create_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        alignment=TA_CENTER,
        textColor=WARM_DARK,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=GRAY_TEXT,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name='TallerTitle',
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        textColor=WARM_DARK,
        spaceBefore=20,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        name='TallerSubtitle',
        fontName='Helvetica',
        fontSize=13,
        leading=16,
        alignment=TA_CENTER,
        textColor=WARM_ACCENT,
        spaceAfter=20,
    ))

    styles.add(ParagraphStyle(
        name='PartTitle',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=WARM_DARK,
        spaceBefore=24,
        spaceAfter=4,
        borderWidth=0,
        borderColor=WARM_ACCENT,
        borderPadding=6,
    ))

    styles.add(ParagraphStyle(
        name='PartQuote',
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=14,
        textColor=WARM_ACCENT,
        spaceBefore=2,
        spaceAfter=16,
        leftIndent=20,
    ))

    styles.add(ParagraphStyle(
        name='BodyText2',
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY,
        textColor=black,
        spaceAfter=8,
        firstLineIndent=0,
    ))

    styles.add(ParagraphStyle(
        name='VinetaTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=WARM_ACCENT,
        spaceBefore=12,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name='VinetaBody',
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY,
        textColor=HexColor('#333333'),
        spaceAfter=8,
        leftIndent=10,
        rightIndent=10,
    ))

    styles.add(ParagraphStyle(
        name='ExerciseTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=WARM_DARK,
        spaceBefore=16,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        name='ExerciseBody',
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=black,
        spaceAfter=6,
        leftIndent=10,
    ))

    styles.add(ParagraphStyle(
        name='QuestionBox',
        fontName='Helvetica-BoldOblique',
        fontSize=10,
        leading=14,
        textColor=WARM_DARK,
        spaceBefore=12,
        spaceAfter=4,
        leftIndent=15,
        rightIndent=15,
    ))

    styles.add(ParagraphStyle(
        name='Instruction',
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=GRAY_TEXT,
        spaceAfter=12,
        leftIndent=15,
    ))

    styles.add(ParagraphStyle(
        name='SectionHead',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=WARM_DARK,
        spaceBefore=14,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        name='QuoteText',
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=WARM_ACCENT,
        spaceAfter=8,
        leftIndent=20,
        rightIndent=20,
    ))

    styles.add(ParagraphStyle(
        name='Reference',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=GRAY_TEXT,
        spaceAfter=3,
    ))

    styles.add(ParagraphStyle(
        name='Footer',
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=GRAY_TEXT,
    ))

    styles.add(ParagraphStyle(
        name='WriteLine',
        fontName='Helvetica',
        fontSize=10,
        leading=24,
        textColor=HexColor('#CCCCCC'),
        spaceAfter=0,
    ))

    return styles


def add_header_footer(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(GRAY_TEXT)
    canvas.drawString(
        doc.leftMargin,
        doc.height + doc.topMargin + 15,
        "Historias de la Mente  |  @historias.de.la.mente"
    )
    canvas.drawRightString(
        doc.width + doc.leftMargin,
        doc.height + doc.topMargin + 15,
        f"Javier Vieira, Psicologo Especialista  |  Pag. {doc.page}"
    )
    # Header line
    canvas.setStrokeColor(WARM_ACCENT)
    canvas.setLineWidth(0.5)
    canvas.line(
        doc.leftMargin,
        doc.height + doc.topMargin + 10,
        doc.width + doc.leftMargin,
        doc.height + doc.topMargin + 10
    )
    canvas.restoreState()


def make_boxed(flowables, bg_color, border_color=None):
    """Wrap flowables in a colored box using a Table."""
    content = []
    for f in flowables:
        content.append([f])

    t = Table(content, colWidths=[6.2*inch])
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, -1), bg_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]
    if border_color:
        style_cmds.append(('BOX', (0, 0), (-1, -1), 1, border_color))

    t.setStyle(TableStyle(style_cmds))
    return t


def parse_and_build(md_text, styles, is_cuaderno=False):
    """Parse markdown and build reportlab flowables."""
    story = []
    lines = md_text.split('\n')
    i = 0
    in_cover = True
    cover_lines = []

    while i < len(lines):
        line = lines[i].strip()

        # Skip empty lines
        if not line:
            i += 1
            continue

        # Horizontal rule
        if line.startswith('---') or line.startswith('==='):
            story.append(HRFlowable(
                width="100%", thickness=0.5, color=WARM_ACCENT,
                spaceBefore=8, spaceAfter=8
            ))
            i += 1
            continue

        # Cover section (before first PARTE)
        if in_cover and '| PARTE' not in line and not line.startswith('| PARTE'):
            # Detect end of cover
            if 'PARTE 1' in line or '| PARTE' in line:
                in_cover = False
                # Don't increment, process this line as PARTE
                continue

            # Cover content
            if 'HISTORIAS DE LA MENTE' in line:
                story.append(Spacer(1, 40))
                story.append(Paragraph(line, styles['CoverTitle']))
            elif 'TALLER' in line and len(line) < 15:
                story.append(Spacer(1, 30))
                story.append(Paragraph(line, styles['TallerTitle']))
            elif line.startswith('El narcisista invisible') or line.startswith('el abuso'):
                story.append(Paragraph(line, styles['TallerSubtitle']))
            elif line.startswith('que no sabe'):
                story.append(Paragraph(line, styles['TallerSubtitle']))
            elif line.startswith('Un taller') or line.startswith('Basado en') or line.startswith('Facilitador') or line.startswith('Psicologo') or line.startswith('Modalidad'):
                story.append(Paragraph(line, styles['CoverSubtitle']))
            elif line.startswith('Psicologia del'):
                story.append(Paragraph(line, styles['CoverSubtitle']))
            elif line.startswith('Historias de la Mente |') or line.startswith('@historias') or line.startswith('Pagina'):
                pass  # Skip header lines
            elif 'MI CUADERNO' in line:
                story.append(Spacer(1, 40))
                story.append(Paragraph(line, styles['TallerTitle']))
            elif line.startswith('Sesion'):
                story.append(Paragraph(line, styles['CoverSubtitle']))
            else:
                story.append(Paragraph(line, styles['CoverSubtitle']))

            i += 1
            continue

        in_cover = False

        # PARTE headers
        if line.startswith('| PARTE') or '| PARTE' in line:
            story.append(Spacer(1, 10))
            story.append(HRFlowable(
                width="100%", thickness=2, color=WARM_ACCENT,
                spaceBefore=8, spaceAfter=4
            ))
            title_text = line.replace('|', '').strip()
            story.append(Paragraph(title_text, styles['PartTitle']))
            i += 1
            # Next line is usually the quote
            if i < len(lines):
                next_line = lines[i].strip()
                if next_line.startswith('"') or next_line.startswith("'"):
                    story.append(Paragraph(next_line, styles['PartQuote']))
                    i += 1
            continue

        # Cuaderno section headers
        if is_cuaderno and line.isupper() and len(line) > 5 and len(line) < 80:
            story.append(Spacer(1, 8))
            story.append(Paragraph(line, styles['SectionHead']))
            i += 1
            continue

        # Exercise blocks
        if 'EJERCICIO EN VIVO' in line or (is_cuaderno and line.startswith('EJERCICIO')):
            exercise_flows = []
            title = line.replace("EJERCICIO EN VIVO:", "EJERCICIO EN VIVO:").strip()
            exercise_flows.append(Paragraph(title, styles['ExerciseTitle']))
            i += 1
            # Collect exercise content until next major section
            while i < len(lines):
                eline = lines[i].strip()
                if not eline:
                    i += 1
                    continue
                if eline.startswith('Instruccion') and not is_cuaderno:
                    exercise_flows.append(Paragraph(eline, styles['Instruction']))
                    i += 1
                    break
                if eline.startswith('| PARTE') or eline.startswith('PREGUNTA PARA') or eline.startswith('Vineta clinica') or eline.startswith('HERRAMIENTA') or eline.startswith('Herramienta'):
                    break
                exercise_flows.append(Paragraph(eline, styles['ExerciseBody']))
                i += 1

            story.append(make_boxed(exercise_flows, EXERCISE_BG, WARM_ACCENT))
            story.append(Spacer(1, 8))
            continue

        # Question blocks
        if line.startswith('PREGUNTA PARA DISCUSION'):
            q_flows = []
            q_flows.append(Paragraph(line, styles['ExerciseTitle']))
            i += 1
            while i < len(lines):
                qline = lines[i].strip()
                if not qline:
                    i += 1
                    continue
                if qline.startswith('Instruccion'):
                    q_flows.append(Paragraph(qline, styles['Instruction']))
                    i += 1
                    break
                if qline.startswith('| PARTE') or qline.startswith('Vineta') or qline.startswith('EJERCICIO') or qline.startswith('Cierre:') or qline.startswith('Herramienta'):
                    break
                q_flows.append(Paragraph(qline, styles['QuestionBox']))
                i += 1

            story.append(make_boxed(q_flows, QUESTION_BG, WARM_ACCENT))
            story.append(Spacer(1, 8))
            continue

        # Vineta clinica
        if line.startswith('Vineta clinica'):
            story.append(Paragraph(line, styles['VinetaTitle']))
            i += 1
            vineta_text = []
            while i < len(lines):
                vline = lines[i].strip()
                if not vline:
                    i += 1
                    if i < len(lines) and not lines[i].strip():
                        break
                    continue
                if vline.startswith('| PARTE') or vline.startswith('EJERCICIO') or vline.startswith('PREGUNTA') or vline.startswith('Vineta clinica') or vline.startswith('Que hace') or vline.startswith('Herramienta') or vline.startswith('Cierre:'):
                    break
                vineta_text.append(vline)
                i += 1

            if vineta_text:
                full_text = ' '.join(vineta_text)
                story.append(make_boxed(
                    [Paragraph(full_text, styles['VinetaBody'])],
                    VINETA_BG
                ))
                story.append(Spacer(1, 6))
            continue

        # Section headers (Herramienta, La metafora, etc)
        if (line.startswith('Herramienta ') or
            line.startswith('La metafora') or
            line.startswith('Que hace diferente') or
            line.startswith('Cierre:') or
            line.startswith('Referencias teoricas') or
            line.startswith('LO QUE VAMOS') or
            line.startswith('PARA HACER') or
            line.startswith('FRASE PARA') or
            line.startswith('SI NECESITAS') or
            line.startswith('HERRAMIENTAS') or
            line.startswith('MI COMPROMISO')):
            story.append(Paragraph(line, styles['SectionHead']))
            i += 1
            continue

        # Quoted text
        if line.startswith('"') and line.endswith('"') and len(line) > 30:
            story.append(Paragraph(line, styles['QuoteText']))
            i += 1
            continue

        # Write lines for cuaderno
        if is_cuaderno and line.startswith('_____'):
            story.append(Paragraph(
                '_' * 70, styles['WriteLine']
            ))
            i += 1
            continue

        # Checkbox lines for cuaderno
        if is_cuaderno and line.startswith('- [ ]'):
            text = line.replace('- [ ]', '[ ]  ')
            story.append(Paragraph(text, styles['BodyText2']))
            i += 1
            continue

        # References
        if line.startswith('Pincus') or line.startswith('Wink') or line.startswith('Gibson') or line.startswith('Stern') or line.startswith('Brown') or line.startswith('Kernberg') or line.startswith('Van der') or line.startswith('Rosenberg') or line.startswith('Neff') or line.startswith('Freyd'):
            story.append(Paragraph(line, styles['Reference']))
            i += 1
            continue

        # Footer text
        if 'propiedad intelectual' in line or 'Prohibida' in line or 'COLPSIC' in line.lower():
            story.append(Paragraph(line, styles['Footer']))
            i += 1
            continue

        # WhatsApp line
        if line.startswith('WhatsApp'):
            story.append(Spacer(1, 12))
            story.append(Paragraph(line, styles['Footer']))
            i += 1
            continue

        # Default body text
        story.append(Paragraph(line, styles['BodyText2']))
        i += 1

    return story


def generate_pdf(md_path, pdf_path, is_cuaderno=False):
    """Generate PDF from markdown file."""
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    styles = create_styles()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        topMargin=1*inch,
        bottomMargin=0.8*inch,
        leftMargin=0.9*inch,
        rightMargin=0.9*inch,
    )

    story = parse_and_build(md_text, styles, is_cuaderno)

    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print(f"PDF generado: {pdf_path}")


if __name__ == "__main__":
    base = "C:/Users/jivca/OneDrive/Documentos/AGENTES/tallerespecial/salida_talleres/taller_narcisista_invisible"

    # Generate taller completo
    generate_pdf(
        f"{base}/taller_completo.md",
        f"{base}/taller_completo.pdf",
        is_cuaderno=False
    )

    # Generate cuaderno participante
    generate_pdf(
        f"{base}/cuaderno_participante.md",
        f"{base}/cuaderno_participante.pdf",
        is_cuaderno=True
    )

    print("\nListo! 2 PDFs generados.")
