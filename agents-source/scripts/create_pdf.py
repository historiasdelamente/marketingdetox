#!/usr/bin/env python3
"""
Generador de documento PDF para Voiceover Psicológico.
Combina 3 partes de voiceover (.md) en un solo documento PDF formateado.

Uso:
    python create_pdf.py parte1.md parte2.md parte3.md --tema "Nombre del Tema" --output salida.pdf
"""

import argparse
import os
import re
import sys
from datetime import datetime

from fpdf import FPDF


class VoiceoverPDF(FPDF):
    """PDF personalizado para voiceovers psicológicos."""

    # Colores
    COLOR_TITLE = (44, 62, 80)       # #2C3E50
    COLOR_BODY = (51, 51, 51)        # #333333
    COLOR_META = (102, 102, 102)     # #666666
    COLOR_NOTES = (136, 136, 136)    # #888888
    COLOR_ACCENT = (51, 153, 204)    # #3399CC
    COLOR_LINE = (200, 200, 200)     # #C8C8C8
    COLOR_BG_COVER = (248, 249, 250) # #F8F9FA

    # Nombre de fuente Unicode registrada
    FONT_NAME = 'ArialUni'

    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)
        self.set_margins(25, 25, 25)
        # Registrar Arial (Windows) como fuente Unicode
        fonts_dir = 'C:/Windows/Fonts'
        self.add_font('ArialUni', '', f'{fonts_dir}/arial.ttf')
        self.add_font('ArialUni', 'B', f'{fonts_dir}/arialbd.ttf')
        self.add_font('ArialUni', 'I', f'{fonts_dir}/ariali.ttf')
        self.add_font('ArialUni', 'BI', f'{fonts_dir}/arialbi.ttf')

    def header(self):
        if self.page_no() > 1:
            self.set_font(self.FONT_NAME, 'I', 8)
            self.set_text_color(*self.COLOR_META)
            self.cell(0, 10, 'Voiceover Psicológico — Historias de la Mente', new_x='RIGHT', new_y='TOP')
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font(self.FONT_NAME, 'I', 8)
        self.set_text_color(*self.COLOR_META)
        self.cell(0, 10, f'Página {self.page_no()}', new_x='RIGHT', new_y='TOP', align='C')

    def add_cover(self, titulo_live, tema, duracion, total_chars, total_words, hashtags):
        """Genera la portada del documento."""
        self.add_page()

        # Fondo suave para la portada
        self.set_fill_color(*self.COLOR_BG_COVER)
        self.rect(0, 0, 210, 297, 'F')

        # Espacio superior
        self.ln(50)

        # Subtítulo
        self.set_font(self.FONT_NAME, 'B', 12)
        self.set_text_color(*self.COLOR_META)
        self.cell(0, 8, 'VOICEOVER PSICOLÓGICO', 0, 1, 'C')
        self.ln(5)

        # Título principal
        self.set_font(self.FONT_NAME, 'B', 24)
        self.set_text_color(*self.COLOR_TITLE)
        # Multi_cell para títulos largos
        self.multi_cell(0, 12, titulo_live, 0, 'C')
        self.ln(8)

        # Línea decorativa
        self.set_draw_color(*self.COLOR_LINE)
        self.set_line_width(0.5)
        x_center = self.w / 2
        self.line(x_center - 30, self.get_y(), x_center + 30, self.get_y())
        self.ln(12)

        # Metadata
        meta_items = [
            f'Tema: {tema}',
            f'Fecha: {datetime.now().strftime("%d/%m/%Y")}',
            f'Duración total estimada: {duracion}',
            f'Caracteres totales: {total_chars:,}',
            f'Palabras totales: {total_words:,}',
        ]

        self.set_font(self.FONT_NAME, '', 11)
        self.set_text_color(*self.COLOR_META)
        for item in meta_items:
            self.cell(0, 7, item, 0, 1, 'C')

        self.ln(10)

        # Hashtags
        self.set_font(self.FONT_NAME, 'I', 10)
        self.set_text_color(*self.COLOR_ACCENT)
        self.multi_cell(0, 6, hashtags, 0, 'C')

    def add_part(self, part_number, part_name, content, chars, words, production_notes):
        """Agrega una parte del voiceover al PDF."""
        self.add_page()

        # Encabezado de parte
        self.set_font(self.FONT_NAME, 'B', 16)
        self.set_text_color(*self.COLOR_TITLE)
        self.cell(0, 10, part_name, 0, 1, 'L')

        # Línea bajo encabezado
        self.set_draw_color(*self.COLOR_LINE)
        self.set_line_width(0.3)
        self.line(25, self.get_y(), self.w - 25, self.get_y())
        self.ln(3)

        # Metadata de la parte
        self.set_font(self.FONT_NAME, 'I', 9)
        self.set_text_color(*self.COLOR_META)
        meta_text = f'Caracteres: {chars:,}  |  Palabras: {words:,}  |  Duración: ~{words // 140} min'
        self.cell(0, 6, meta_text, 0, 1, 'L')
        self.ln(5)

        # Contenido del voiceover
        self.set_font(self.FONT_NAME, '', 11)
        self.set_text_color(*self.COLOR_BODY)

        paragraphs = content.split('\n\n')
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Detectar subtítulos
            if para.startswith('#'):
                para = re.sub(r'^#+\s*', '', para)
                self.ln(3)
                self.set_font(self.FONT_NAME, 'B', 13)
                self.set_text_color(*self.COLOR_TITLE)
                self.multi_cell(0, 7, para, 0, 'L')
                self.ln(2)
                self.set_font(self.FONT_NAME, '', 11)
                self.set_text_color(*self.COLOR_BODY)
                continue

            # Párrafo normal con interlineado 1.5
            self.multi_cell(0, 7, para, 0, 'J')
            self.ln(3)

        # Notas de producción
        if production_notes:
            self.ln(5)

            # Línea separadora
            self.set_draw_color(*self.COLOR_LINE)
            self.line(25, self.get_y(), self.w - 25, self.get_y())
            self.ln(5)

            self.set_font(self.FONT_NAME, 'BI', 10)
            self.set_text_color(*self.COLOR_NOTES)
            self.cell(0, 6, 'Notas de producción:', 0, 1, 'L')
            self.ln(2)

            self.set_font(self.FONT_NAME, 'I', 9)
            for line in production_notes.split('\n'):
                line = line.strip()
                if line:
                    self.multi_cell(0, 5, line, 0, 'L')
                    self.ln(1)


def parse_metadata(content):
    """Extrae metadata del encabezado del archivo .md"""
    metadata = {}
    lines = content.split('\n')

    for line in lines:
        line = line.strip()
        if line.startswith('**Tema:**'):
            metadata['tema'] = line.replace('**Tema:**', '').strip()
        elif line.startswith('**Parte:**'):
            metadata['parte'] = line.replace('**Parte:**', '').strip()
        elif line.startswith('**Caracteres:**'):
            metadata['caracteres'] = line.replace('**Caracteres:**', '').strip()
        elif line.startswith('**Palabras:**'):
            metadata['palabras'] = line.replace('**Palabras:**', '').strip()
        elif 'uracion' in line.lower() and line.startswith('**'):
            metadata['duracion'] = line.split(':**')[-1].strip()
        elif line.startswith('**Hashtags'):
            metadata['hashtags'] = line.split(':**')[-1].strip()
        elif line.startswith('**Titulo sugerido') or line.startswith('**Título sugerido'):
            metadata['titulo_live'] = line.split(':**')[-1].strip()

    return metadata


def extract_content(text):
    """Extrae el contenido principal y las notas de producción del markdown."""
    lines = text.split('\n')
    content_lines = []
    production_lines = []
    in_content = False
    in_production = False
    passed_first_separator = False

    for line in lines:
        stripped = line.strip()

        # Detectar notas de producción
        if 'notas de producci' in stripped.lower() and stripped.startswith('*'):
            in_production = True
            in_content = False
            continue

        if in_production:
            production_lines.append(line)
            continue

        # Detectar primer separador ---
        if stripped == '---' and not passed_first_separator:
            passed_first_separator = True
            in_content = True
            continue

        if stripped == '---' and in_content:
            continue

        if not in_content:
            continue

        content_lines.append(line)

    content = '\n'.join(content_lines).strip()
    production_notes = '\n'.join(production_lines).strip()

    # Limpiar markdown
    content = re.sub(r'\*\*(.+?)\*\*', r'\1', content)
    content = re.sub(r'\*(.+?)\*', r'\1', content)

    # Limpiar caracteres problemáticos para fpdf2
    content = content.replace('\u2019', "'").replace('\u2018', "'")
    content = content.replace('\u201c', '"').replace('\u201d', '"')
    content = content.replace('\u2014', ' — ').replace('\u2013', ' – ')
    content = content.replace('\u2026', '...')

    production_notes = production_notes.replace('\u2019', "'").replace('\u2018', "'")
    production_notes = production_notes.replace('\u201c', '"').replace('\u201d', '"')
    production_notes = production_notes.replace('\u2014', ' — ').replace('\u2013', ' – ')

    return content, production_notes


def create_pdf(parte1_path, parte2_path, parte3_path, tema, output_path):
    """Crea el documento PDF combinando las 3 partes."""

    pdf = VoiceoverPDF()

    # Leer los 3 archivos
    partes_data = []
    total_chars = 0
    total_words = 0

    for path in [parte1_path, parte2_path, parte3_path]:
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()

        metadata = parse_metadata(raw)
        content, prod_notes = extract_content(raw)

        chars = len(content)
        words = len(content.split())
        total_chars += chars
        total_words += words

        partes_data.append({
            'metadata': metadata,
            'content': content,
            'production_notes': prod_notes,
            'chars': chars,
            'words': words
        })

    # Metadata general
    meta1 = partes_data[0]['metadata']
    titulo_live = meta1.get('titulo_live', tema)
    hashtags = meta1.get('hashtags', '#SanaciónEmocional #HistoriasDeLaMente')
    duracion_total = f"{total_words // 140} minutos"

    # Portada
    pdf.add_cover(titulo_live, tema, duracion_total, total_chars, total_words, hashtags)

    # Partes
    part_names = [
        'PARTE 1: GANCHO + SETUP EMOCIONAL',
        'PARTE 2: CONFRONTACIÓN + EXPLORACIÓN PROFUNDA',
        'PARTE 3: RESOLUCIÓN + LLAMADO A LA ACCIÓN'
    ]

    for i, parte in enumerate(partes_data):
        pdf.add_part(
            i + 1,
            part_names[i],
            parte['content'],
            parte['chars'],
            parte['words'],
            parte['production_notes']
        )

    # Guardar
    pdf.output(output_path)
    print(f'PDF creado: {output_path}')
    print(f'Caracteres totales: {total_chars:,}')
    print(f'Palabras totales: {total_words:,}')
    print(f'Duración estimada: {duracion_total}')


def main():
    parser = argparse.ArgumentParser(description='Genera documento PDF de voiceover psicológico')
    parser.add_argument('parte1', help='Ruta al archivo .md de la Parte 1')
    parser.add_argument('parte2', help='Ruta al archivo .md de la Parte 2')
    parser.add_argument('parte3', help='Ruta al archivo .md de la Parte 3')
    parser.add_argument('--tema', required=True, help='Nombre del tema')
    parser.add_argument('--output', required=True, help='Ruta del archivo PDF de salida')

    args = parser.parse_args()

    for path in [args.parte1, args.parte2, args.parte3]:
        if not os.path.exists(path):
            print(f'Error: No se encontró el archivo {path}')
            sys.exit(1)

    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    create_pdf(args.parte1, args.parte2, args.parte3, args.tema, args.output)


if __name__ == '__main__':
    main()
