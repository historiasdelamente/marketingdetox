# -*- coding: utf-8 -*-
"""Regenera SOLO el PDF del instructor - version vivencial"""

from fpdf import FPDF
import os
import re

OUTPUT_DIR = r"C:\Users\jivca\OneDrive\Documentos\documentos_hechos\taller apego detox"
FONTS_DIR = "C:/Windows/Fonts"
SOURCE = r"c:\Users\jivca\OneDrive\Documentos\TRABAJOIA\apps\historiasdelamente\marketingdetox\output\talleres\taller_senal_de_radio_2026-03-24\taller_completo_instructor.md"

GOLD = (201, 168, 76)
DARK_GOLD = (160, 130, 50)
LIGHT_GOLD = (255, 248, 220)
BLACK = (30, 30, 30)
DARK_GRAY = (60, 60, 60)
MEDIUM_GRAY = (120, 120, 120)
WHITE = (255, 255, 255)
CREAM = (252, 250, 243)
VOICE_COLOR = (150, 130, 80)


class InstructorPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)
        self.add_font("Arial", "", os.path.join(FONTS_DIR, "arial.ttf"))
        self.add_font("Arial", "B", os.path.join(FONTS_DIR, "arialbd.ttf"))
        self.add_font("Arial", "I", os.path.join(FONTS_DIR, "ariali.ttf"))
        self.add_font("Arial", "BI", os.path.join(FONTS_DIR, "arialbi.ttf"))

    def header(self):
        if self.page_no() == 1:
            return
        self.set_draw_color(*GOLD)
        self.set_line_width(0.8)
        self.line(15, 10, self.w - 15, 10)
        self.set_font("Arial", "I", 8)
        self.set_text_color(*MEDIUM_GRAY)
        self.set_y(12)
        self.cell(0, 5, "Historias de la Mente  |  Taller La Senal de Radio", align="C")
        self.ln(8)

    def footer(self):
        self.set_y(-20)
        self.set_draw_color(*GOLD)
        self.set_line_width(0.5)
        self.line(15, self.get_y(), self.w - 15, self.get_y())
        self.ln(3)
        self.set_font("Arial", "I", 8)
        self.set_text_color(*MEDIUM_GRAY)
        self.cell(0, 5, f"Pagina {self.page_no()}", align="C")


def parse_and_render(pdf, md_path):
    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Cover page
    pdf.add_page()
    pdf.set_fill_color(*GOLD)
    pdf.rect(0, 0, pdf.w, 120, "F")
    pdf.set_y(30)
    pdf.set_font("Arial", "B", 28)
    pdf.set_text_color(*WHITE)
    pdf.multi_cell(0, 12, "LA SENAL DE RADIO", align="C")
    pdf.set_y(pdf.get_y() + 5)
    pdf.set_draw_color(*WHITE)
    pdf.set_line_width(0.5)
    mid = pdf.w / 2
    pdf.line(mid - 40, pdf.get_y(), mid + 40, pdf.get_y())
    pdf.set_y(pdf.get_y() + 8)
    pdf.set_font("Arial", "", 13)
    pdf.set_text_color(255, 255, 230)
    pdf.multi_cell(0, 7, "Taller Vivencial  |  90 minutos\n20 mujeres  |  100% experiencial", align="C")
    pdf.set_y(140)
    pdf.set_text_color(*DARK_GRAY)
    pdf.set_font("Arial", "B", 13)
    pdf.cell(0, 8, "HISTORIAS DE LA MENTE", align="C")
    pdf.ln(10)
    pdf.set_font("Arial", "", 11)
    pdf.cell(0, 7, "Apego Detox", align="C")
    pdf.ln(12)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(*MEDIUM_GRAY)
    pdf.cell(0, 6, "GUION DEL INSTRUCTOR", align="C")

    pdf.add_page()

    in_dialogue = False
    dialogue_buffer = ""

    def flush_dialogue():
        nonlocal dialogue_buffer, in_dialogue
        if dialogue_buffer.strip():
            text = dialogue_buffer.strip().strip('"').strip()
            pdf.set_font("Arial", "", 10.5)
            pdf.set_text_color(*BLACK)
            pdf.multi_cell(0, 6, text)
            pdf.ln(3)
        dialogue_buffer = ""
        in_dialogue = False

    for line in lines:
        line = line.rstrip("\n")
        stripped = line.strip()

        # Skip the very first title lines (already in cover)
        if stripped.startswith("# TALLER VIVENCIAL") or stripped.startswith('## "Confundes'):
            continue

        # H2 gold heading (blocks)
        if stripped.startswith("## "):
            flush_dialogue()
            text = stripped.lstrip("# ").strip()
            # Check if it's a block separator
            if "===" in text or "BLOQUE" in text.upper():
                text = text.replace("=", "").strip()
                pdf.add_page()
                pdf.ln(2)
                pdf.set_fill_color(*GOLD)
                pdf.set_text_color(*WHITE)
                pdf.set_font("Arial", "B", 13)
                pdf.cell(0, 10, f"  {text}", fill=True, new_x="LMARGIN", new_y="NEXT")
                pdf.ln(4)
            else:
                pdf.ln(4)
                pdf.set_fill_color(*GOLD)
                pdf.set_text_color(*WHITE)
                pdf.set_font("Arial", "B", 12)
                pdf.cell(0, 9, f"  {text}", fill=True, new_x="LMARGIN", new_y="NEXT")
                pdf.ln(3)
            continue

        # H3 subheading
        if stripped.startswith("### "):
            flush_dialogue()
            text = stripped.lstrip("# ").strip()
            pdf.ln(3)
            pdf.set_draw_color(*GOLD)
            pdf.set_line_width(0.5)
            y = pdf.get_y()
            pdf.line(15, y, pdf.w - 15, y)
            pdf.ln(3)
            pdf.set_text_color(*DARK_GOLD)
            pdf.set_font("Arial", "B", 11)
            pdf.cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            continue

        # Voice instruction *[...]*
        if stripped.startswith("*[") and stripped.endswith("]*"):
            flush_dialogue()
            text = stripped.strip("*[]")
            pdf.set_font("Arial", "I", 9)
            pdf.set_text_color(*VOICE_COLOR)
            pdf.multi_cell(0, 5, text)
            pdf.ln(2)
            continue

        # Horizontal rule
        if stripped == "---":
            flush_dialogue()
            continue

        # Bullet points
        if stripped.startswith("- ") and not stripped.startswith("- ["):
            flush_dialogue()
            text = stripped[2:]
            pdf.set_x(20)
            pdf.set_font("Arial", "", 10)
            pdf.set_text_color(*DARK_GRAY)
            pdf.cell(5, 5.5, "-")
            # Handle bold in bullets
            if "**" in text:
                parts = text.split("**")
                x = pdf.get_x()
                for i, part in enumerate(parts):
                    if i % 2 == 1:
                        pdf.set_font("Arial", "B", 10)
                    else:
                        pdf.set_font("Arial", "", 10)
                    pdf.write(5.5, part)
                pdf.ln(6)
            else:
                pdf.multi_cell(pdf.w - 40, 5.5, text)
            pdf.ln(1)
            continue

        # Checklist items
        if stripped.startswith("- [ ]"):
            flush_dialogue()
            text = stripped[6:]
            pdf.set_x(20)
            pdf.set_font("Arial", "", 10)
            pdf.set_text_color(*DARK_GRAY)
            pdf.cell(5, 5.5, "-")
            pdf.multi_cell(pdf.w - 40, 5.5, text)
            pdf.ln(1)
            continue

        # Table detection
        if stripped.startswith("|") and "|" in stripped[1:]:
            flush_dialogue()
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            if all(set(c) <= set("- :") for c in cells):
                continue  # Skip separator row
            # Detect if header (bold or first row)
            is_header = "**" in stripped or cells[0] in ["Bloque", "#", ""]
            col_count = len(cells)
            col_w = (pdf.w - 30) / col_count

            if is_header or (pdf.get_y() < 30):
                pdf.set_fill_color(*GOLD)
                pdf.set_text_color(*WHITE)
                pdf.set_font("Arial", "B", 8.5)
            else:
                pdf.set_fill_color(*LIGHT_GOLD)
                pdf.set_text_color(*DARK_GRAY)
                pdf.set_font("Arial", "", 8.5)

            for i, cell in enumerate(cells):
                cell_clean = cell.replace("**", "")
                pdf.cell(col_w, 7, f" {cell_clean}", fill=True, border=1)
            pdf.ln()
            continue

        # Dialogue (starts with ")
        if stripped.startswith('"'):
            flush_dialogue()
            in_dialogue = True
            dialogue_buffer = stripped + "\n"
            continue

        if in_dialogue:
            if stripped == "" and dialogue_buffer.strip().endswith('"'):
                flush_dialogue()
            else:
                dialogue_buffer += stripped + "\n"
                continue

        # Bold text lines
        if stripped.startswith("**") and stripped.endswith("**"):
            flush_dialogue()
            text = stripped.strip("*")
            pdf.set_font("Arial", "B", 10)
            pdf.set_text_color(*BLACK)
            pdf.multi_cell(0, 5.5, text)
            pdf.ln(2)
            continue

        # Info lines with bold key
        if stripped.startswith("- **") or stripped.startswith("**") and ":" in stripped:
            flush_dialogue()
            text = stripped.lstrip("- ")
            # Remove markdown bold
            text = text.replace("**", "")
            pdf.set_font("Arial", "", 10)
            pdf.set_text_color(*DARK_GRAY)
            pdf.multi_cell(0, 5.5, text)
            pdf.ln(1)
            continue

        # Regular text
        if stripped:
            flush_dialogue()
            # Handle inline bold
            text = stripped
            if "**" in text:
                text = text.replace("**", "")
            pdf.set_font("Arial", "", 10)
            pdf.set_text_color(*DARK_GRAY)
            pdf.multi_cell(0, 5.5, text)
            pdf.ln(2)
        else:
            if in_dialogue:
                dialogue_buffer += "\n"
            else:
                pass  # empty line

    flush_dialogue()


if __name__ == "__main__":
    pdf = InstructorPDF()
    parse_and_render(pdf, SOURCE)
    path = os.path.join(OUTPUT_DIR, "taller_completo_instructor.pdf")
    pdf.output(path)
    print(f"PDF generado: {path}")
    print(f"Ubicacion: {OUTPUT_DIR}")
