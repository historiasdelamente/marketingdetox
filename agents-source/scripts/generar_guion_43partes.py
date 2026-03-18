#!/usr/bin/env python3
"""
Genera PDF completo — Clase 1: Apego Detox
43 Partes compiladas en un solo documento
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    HRFlowable
)
import os
import re

# ─── Colors ───
GOLD = HexColor("#e8c840")
DARK_TEXT = HexColor("#1a1a1a")
MEDIUM_GRAY = HexColor("#444444")
LIGHT_GRAY = HexColor("#999999")
DARK_RED = HexColor("#8B0000")

# ─── Output ───
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "Guion_Clase1_43Partes_ApegoDetox.pdf")
input_path = os.path.join(script_dir, "guion_completo.txt")

# ─── Read content ───
with open(input_path, "r", encoding="utf-8") as f:
    raw = f.read()

# ─── Parse parts ───
raw_parts = raw.split("===PARTE ")
parts = []
for rp in raw_parts:
    rp = rp.strip()
    if not rp:
        continue
    # Extract number and title from "N: Title==="
    header_match = re.match(r"(\d+):\s*(.+?)===", rp)
    if header_match:
        num = int(header_match.group(1))
        title = header_match.group(2).strip()
        body = rp[header_match.end():].strip()
        parts.append({"num": num, "title": title, "body": body})

print(f"Parsed {len(parts)} parts")

# ─── Document ───
doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.7 * inch,
    bottomMargin=0.7 * inch,
    leftMargin=0.85 * inch,
    rightMargin=0.85 * inch,
)

styles = getSampleStyleSheet()

# ─── Custom styles ───
styles.add(ParagraphStyle(
    name='CoverTitle',
    fontSize=30,
    leading=36,
    alignment=TA_CENTER,
    textColor=GOLD,
    spaceAfter=12,
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
    name='CoverInfo',
    fontSize=11,
    leading=14,
    alignment=TA_CENTER,
    textColor=LIGHT_GRAY,
    spaceAfter=4,
    fontName='Helvetica',
))

styles.add(ParagraphStyle(
    name='PartTitle',
    fontSize=20,
    leading=26,
    alignment=TA_LEFT,
    textColor=DARK_RED,
    spaceBefore=10,
    spaceAfter=20,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='PartNumber',
    fontSize=11,
    leading=14,
    alignment=TA_LEFT,
    textColor=GOLD,
    spaceBefore=0,
    spaceAfter=4,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='BodyText2',
    fontSize=11.5,
    leading=17,
    alignment=TA_JUSTIFY,
    textColor=DARK_TEXT,
    spaceAfter=10,
    fontName='Helvetica',
    firstLineIndent=0,
))

styles.add(ParagraphStyle(
    name='CharCount',
    fontSize=9,
    leading=12,
    alignment=TA_LEFT,
    textColor=LIGHT_GRAY,
    spaceAfter=2,
    fontName='Helvetica-Oblique',
))

# ─── Build story ───
story = []

# Cover page
story.append(Spacer(1, 2 * inch))
story.append(Paragraph("GUIÓN COMPLETO", styles['CoverTitle']))
story.append(Paragraph("Clase 1 — Apego Detox", styles['CoverTitle']))
story.append(Spacer(1, 0.4 * inch))
story.append(Paragraph("¿Por qué no puedes dejarlo aunque sabes que te destruye?", styles['CoverSubtitle']))
story.append(Spacer(1, 0.6 * inch))
story.append(Paragraph("43 Partes — Guión para lectura en vivo", styles['CoverInfo']))
story.append(Spacer(1, 0.15 * inch))
story.append(Paragraph("Javier Vieira — Psicólogo Especialista (COLPSIC 293219)", styles['CoverInfo']))
story.append(Paragraph("Historias de la Mente — @historias.de.la.mente", styles['CoverInfo']))
story.append(Spacer(1, 0.3 * inch))

total_chars = sum(len(p["body"]) for p in parts)
story.append(Paragraph(f"Total: {total_chars:,} caracteres | {len(parts)} partes", styles['CoverInfo']))
story.append(PageBreak())

# Table of contents
story.append(Paragraph("ÍNDICE", styles['PartTitle']))
story.append(Spacer(1, 0.15 * inch))

toc_style = ParagraphStyle(
    name='TOC',
    fontSize=10.5,
    leading=16,
    textColor=DARK_TEXT,
    fontName='Helvetica',
)

for p in parts:
    chars = len(p["body"])
    story.append(Paragraph(
        f"<b>Parte {p['num']}</b>  —  {p['title']}  ({chars:,} caracteres)",
        toc_style
    ))

story.append(PageBreak())

# ─── Each part ───
for p in parts:
    chars = len(p["body"])

    # Part header
    story.append(Paragraph(f"PARTE {p['num']} DE 43", styles['PartNumber']))
    story.append(Paragraph(p["title"], styles['PartTitle']))
    story.append(Paragraph(f"{chars:,} caracteres", styles['CharCount']))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=GOLD, spaceAfter=15, spaceBefore=5
    ))

    # Body paragraphs
    paragraphs = p["body"].split("\n\n")
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        # Replace line breaks within paragraph
        para = para.replace("\n", " ")
        # Escape XML special chars
        para = para.replace("&", "&amp;")
        para = para.replace("<", "&lt;")
        para = para.replace(">", "&gt;")

        story.append(Paragraph(para, styles['BodyText2']))

    # Page break between parts
    story.append(PageBreak())

# ─── Build PDF ───
print("Generating PDF...")
doc.build(story)
print(f"PDF generated: {output_path}")
print(f"Total parts: {len(parts)}")
print(f"Total characters: {total_chars:,}")
