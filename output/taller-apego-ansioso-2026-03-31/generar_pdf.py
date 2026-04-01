"""Genera PDFs del taller y cuaderno de participante."""
import os
import re
from fpdf import FPDF

class TallerPDF(FPDF):
    def __init__(self, header_text=""):
        super().__init__()
        self.header_text = header_text

    def header(self):
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(153, 153, 153)
        self.cell(0, 5, self.header_text, align="C")
        self.ln(3)
        self.set_draw_color(201, 168, 76)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(153, 153, 153)
        self.cell(0, 10, f"Pagina {self.page_no()} | Javier Vieira - Psicologo Especialista", align="C")


def clean(text):
    text = text.replace("**", "").replace("*", "")
    replacements = {
        "\u201c": '"', "\u201d": '"', "\u2018": "'", "\u2019": "'",
        "\u2014": "--", "\u2013": "-", "\u2026": "...", "\u2022": "-",
        "\u2610": "[ ]", "\u2605": "*", "\u2611": "[x]",
        "\u2192": "->", "\u2713": "v", "\u2003": " ",
        "\u26a1": "(rayo)", "\u2744": "(hielo)",
        "\u00a9": "(c)", "\u2550": "=", "\u2591": "",
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Remove remaining non-latin1 chars
    text = text.encode("latin-1", errors="replace").decode("latin-1")
    return text


def md_to_pdf(md_path, pdf_path, header_text):
    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    pdf = TallerPDF(header_text)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    in_code = False

    for line in lines:
        line = line.rstrip("\n")

        # Code block toggle
        if line.strip().startswith("```"):
            in_code = not in_code
            continue

        if in_code:
            pdf.set_font("Courier", "", 8)
            pdf.set_text_color(102, 102, 102)
            pdf.set_x(15)
            pdf.cell(0, 5, clean(line))
            pdf.ln()
            continue

        # Empty lines
        if not line.strip():
            pdf.ln(2)
            continue

        # H1
        if line.startswith("# ") and not line.startswith("## "):
            pdf.ln(5)
            pdf.set_font("Times", "B", 20)
            pdf.set_text_color(26, 26, 26)
            pdf.multi_cell(0, 9, clean(line[2:].strip()))
            pdf.set_draw_color(201, 168, 76)
            pdf.set_line_width(1)
            pdf.line(10, pdf.get_y() + 2, 80, pdf.get_y() + 2)
            pdf.ln(5)
            continue

        # H2
        if line.startswith("## ") and not line.startswith("### "):
            pdf.ln(4)
            pdf.set_font("Times", "B", 14)
            pdf.set_text_color(201, 168, 76)
            pdf.multi_cell(0, 7, clean(line[3:].strip()))
            pdf.ln(2)
            continue

        # H3
        if line.startswith("### "):
            pdf.ln(3)
            pdf.set_font("Times", "B", 12)
            pdf.set_text_color(26, 26, 26)
            pdf.multi_cell(0, 6, clean(line[4:].strip()))
            pdf.ln(1)
            continue

        # H4
        if line.startswith("#### "):
            pdf.ln(2)
            pdf.set_font("Times", "BI", 11)
            pdf.set_text_color(201, 168, 76)
            pdf.multi_cell(0, 6, clean(line[5:].strip()))
            pdf.ln(1)
            continue

        # HR
        if line.strip() == "---":
            pdf.ln(4)
            pdf.set_draw_color(201, 168, 76)
            pdf.set_line_width(0.3)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(4)
            continue

        # Table
        if line.strip().startswith("|"):
            cols = [c.strip() for c in line.strip().split("|")[1:-1]]
            if all(set(c) <= set("- :") for c in cols):
                continue

            ncols = len(cols)
            col_w = 190 / max(ncols, 1)

            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(51, 51, 51)

            for c in cols:
                c = clean(c)[:50]
                pdf.cell(col_w, 6, c, border=1)
            pdf.ln()
            continue

        # Blockquote
        if line.startswith(">"):
            pdf.set_font("Times", "I", 10)
            pdf.set_text_color(102, 102, 102)
            text = clean(line.lstrip("> ").strip())
            pdf.set_fill_color(250, 248, 242)
            y_before = pdf.get_y()
            pdf.set_x(20)
            pdf.multi_cell(170, 6, text, fill=True)
            pdf.set_fill_color(201, 168, 76)
            h = pdf.get_y() - y_before
            if h > 0:
                pdf.rect(16, y_before, 2, h, "F")
            pdf.ln(1)
            continue

        # Checkbox
        if line.strip().startswith("- [ ]") or line.strip().startswith("- [x]"):
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(102, 102, 102)
            checked = "[x]" in line[:10]
            text = clean(line.strip()[6:].strip())
            pdf.set_x(15)
            pdf.cell(6, 6, "[x]" if checked else "[ ]")
            pdf.multi_cell(170, 6, text)
            continue

        # Bullet list
        if line.strip().startswith("- ") or line.strip().startswith("* "):
            pdf.set_font("Times", "", 10)
            pdf.set_text_color(51, 51, 51)
            indent = len(line) - len(line.lstrip())
            text = clean(line.strip()[2:].strip())
            pdf.set_x(15 + indent)
            pdf.cell(5, 6, "-")
            pdf.multi_cell(165 - indent, 6, text)
            continue

        # Numbered list
        m = re.match(r"^(\d+)\.\s+", line.strip())
        if m:
            pdf.set_font("Times", "", 10)
            pdf.set_text_color(51, 51, 51)
            text = clean(line.strip()[len(m.group(0)):].strip())
            pdf.set_x(15)
            pdf.cell(8, 6, m.group(1) + ".")
            pdf.multi_cell(167, 6, text)
            continue

        # Instruction lines *[...]*
        stripped = line.strip()
        if stripped.startswith("*[") and stripped.endswith("]*"):
            pdf.set_font("Helvetica", "I", 8)
            pdf.set_text_color(153, 153, 153)
            text = clean(stripped[2:-2].strip())
            pdf.set_fill_color(245, 245, 245)
            pdf.multi_cell(0, 5, text, fill=True)
            pdf.ln(2)
            continue

        # Regular paragraph
        pdf.set_font("Times", "", 11)
        pdf.set_text_color(51, 51, 51)
        text = clean(stripped)

        if text.startswith('"'):
            pdf.set_text_color(26, 26, 26)

        pdf.multi_cell(0, 6, text)
        pdf.ln(1)

    pdf.output(pdf_path)
    print(f"PDF generado: {pdf_path}")


if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))

    md_to_pdf(
        os.path.join(base, "taller-completo-apego-ansioso.md"),
        os.path.join(base, "taller-completo-apego-ansioso.pdf"),
        "Historias de la Mente | Taller: La Nina en la Ventana",
    )

    md_to_pdf(
        os.path.join(base, "cuaderno-participante-apego-ansioso.md"),
        os.path.join(base, "cuaderno-participante-apego-ansioso.pdf"),
        "Historias de la Mente | Cuaderno de Participante",
    )
