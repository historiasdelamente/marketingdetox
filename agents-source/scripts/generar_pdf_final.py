"""
Generador de PDF limpio para lectura en vivo
Agente FORMATO/PDF - Sistema Apego Detox
Usa reportlab para soporte Unicode completo
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import re
import os

# Colores
GRAFITO = HexColor('#1a1a1a')
GRIS_TEXTO = HexColor('#2d2d2d')
GRIS_CLARO = HexColor('#888888')
GRIS_MARCA = HexColor('#aaaaaa')
DORADO = HexColor('#b8960c')
AZUL_MARCA = HexColor('#5078aa')
VERDE_MARCA = HexColor('#508050')
NARANJA_MARCA = HexColor('#aa6430')
VIOLETA_MARCA = HexColor('#6464a0')

def crear_pdf():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    guion_path = os.path.join(script_dir, 'guion_clase1_v3_final.md')
    output_path = os.path.join(script_dir, 'Guion_Clase1_DisonanciaCognitiva_FINAL.pdf')

    with open(guion_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Estilos
    styles = getSampleStyleSheet()

    style_titulo_parte = ParagraphStyle(
        'TituloParte', parent=styles['Heading1'],
        fontSize=20, textColor=GRAFITO, alignment=TA_CENTER,
        spaceAfter=6, fontName='Helvetica-Bold'
    )
    style_texto = ParagraphStyle(
        'Texto', parent=styles['Normal'],
        fontSize=13, leading=19, textColor=GRIS_TEXTO,
        spaceAfter=4, fontName='Helvetica'
    )
    style_impacto = ParagraphStyle(
        'Impacto', parent=styles['Normal'],
        fontSize=14, leading=20, textColor=GRAFITO,
        spaceAfter=4, fontName='Helvetica-Bold'
    )
    style_pausa = ParagraphStyle(
        'Pausa', parent=styles['Normal'],
        fontSize=11, textColor=VIOLETA_MARCA, alignment=TA_CENTER,
        spaceBefore=10, spaceAfter=10, fontName='Helvetica-Oblique'
    )
    style_voz = ParagraphStyle(
        'Voz', parent=styles['Normal'],
        fontSize=10, textColor=VERDE_MARCA, alignment=TA_CENTER,
        spaceBefore=8, spaceAfter=8, fontName='Helvetica-BoldOblique'
    )
    style_slide = ParagraphStyle(
        'Slide', parent=styles['Normal'],
        fontSize=10, textColor=AZUL_MARCA,
        spaceBefore=6, spaceAfter=6, fontName='Helvetica-Oblique'
    )
    style_cta = ParagraphStyle(
        'CTA', parent=styles['Normal'],
        fontSize=11, textColor=DORADO, alignment=TA_CENTER,
        spaceBefore=8, spaceAfter=4, fontName='Helvetica-Bold'
    )
    style_interaccion = ParagraphStyle(
        'Interaccion', parent=styles['Normal'],
        fontSize=11, textColor=NARANJA_MARCA, alignment=TA_CENTER,
        spaceBefore=8, spaceAfter=8, fontName='Helvetica-BoldOblique'
    )
    style_portada_titulo = ParagraphStyle(
        'PortadaTitulo', parent=styles['Title'],
        fontSize=30, textColor=GRAFITO, alignment=TA_CENTER,
        spaceAfter=8, fontName='Helvetica-Bold'
    )
    style_portada_sub = ParagraphStyle(
        'PortadaSub', parent=styles['Normal'],
        fontSize=16, textColor=GRIS_CLARO, alignment=TA_CENTER,
        spaceAfter=4, fontName='Helvetica'
    )
    style_portada_info = ParagraphStyle(
        'PortadaInfo', parent=styles['Normal'],
        fontSize=12, textColor=GRIS_MARCA, alignment=TA_CENTER,
        spaceAfter=3, fontName='Helvetica'
    )

    # Crear documento
    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        leftMargin=2.5*cm, rightMargin=2.5*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    story = []

    # --- PORTADA ---
    story.append(Spacer(1, 5*cm))
    story.append(Paragraph('CLASE 1', style_portada_titulo))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph('"Lo que nadie te ha dicho sobre<br/>por qué no puedes irte"', style_portada_sub))
    story.append(Spacer(1, 1.5*cm))
    story.append(HRFlowable(width="40%", color=DORADO, thickness=1))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph('Javier Vieira', style_portada_info))
    story.append(Paragraph('Psicólogo especialista  |  COLPSIC 293219', style_portada_info))
    story.append(Paragraph('Historias de la Mente  |  Apego Detox', style_portada_info))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph('Duración: ~32 minutos  |  3 partes', style_portada_info))
    story.append(Paragraph('Eje: Disonancia Cognitiva', style_portada_info))
    story.append(PageBreak())

    # --- Procesar contenido ---
    p1_start = content.find('PARTE 1')
    p2_start = content.find('PARTE 2')
    p3_start = content.find('PARTE 3')

    parts = [
        ('PARTE 1 — "Yo sé por qué estás aquí"', content[p1_start:p2_start]),
        ('PARTE 2 — "Lo que nadie te ha dicho"', content[p2_start:p3_start]),
        ('PARTE 3 — "Hay salida. Y tú lo sabes."', content[p3_start:])
    ]

    for idx, (part_title, part_content) in enumerate(parts):
        # Titulo de parte
        story.append(Paragraph(part_title, style_titulo_parte))
        story.append(HRFlowable(width="60%", color=DORADO, thickness=0.5))
        story.append(Spacer(1, 0.5*cm))

        lines = part_content.split('\n')

        for line in lines:
            stripped = line.strip()

            # Saltar markdown y separadores
            if stripped.startswith('#'):
                continue
            if re.match(r'^[═]+$', stripped):
                continue
            if stripped == '':
                story.append(Spacer(1, 3*mm))
                continue

            # Separadores
            if re.match(r'^[─—-]{5,}$', stripped):
                story.append(Spacer(1, 4*mm))
                story.append(HRFlowable(width="50%", color=HexColor('#dddddd'), thickness=0.3))
                story.append(Spacer(1, 4*mm))
                continue

            # Escapar HTML
            safe = stripped.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

            # PAUSA
            if '[PAUSA' in stripped:
                story.append(Paragraph(safe, style_pausa))
                continue

            # VOZ
            if stripped in ['[VOZ FIRME]', '[VOZ BAJA]', '[VOZ BAJA, íntima]', '[DESPACIO]']:
                clean = stripped.replace('[', '').replace(']', '')
                story.append(Paragraph(clean, style_voz))
                continue

            # SLIDE
            if stripped.startswith('→ SLIDE:'):
                story.append(Paragraph(safe, style_slide))
                continue

            # CTA marker
            if stripped.startswith('→ CTA'):
                story.append(Paragraph('— MOMENTO CTA —', style_cta))
                continue

            # INTERACCION
            if stripped.startswith('[INTERACCI'):
                clean = stripped.replace('[INTERACCIÓN]', '').replace('[INTERACCION]', '').strip()
                clean_safe = clean.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                story.append(Paragraph(clean_safe, style_interaccion))
                continue

            # Texto normal
            clean_line = safe.replace('**', '')

            # Frases cortas = impacto
            if len(stripped) < 55 and not stripped.startswith('→'):
                story.append(Paragraph(clean_line, style_impacto))
            else:
                story.append(Paragraph(clean_line, style_texto))

        # Page break entre partes (no despues de la ultima)
        if idx < len(parts) - 1:
            story.append(PageBreak())

    # Construir
    doc.build(story)
    print(f'PDF generado exitosamente: {output_path}')

if __name__ == '__main__':
    crear_pdf()
