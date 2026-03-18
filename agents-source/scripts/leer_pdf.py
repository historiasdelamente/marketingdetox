"""
Herramienta para leer PDFs de la base de conocimiento.
Uso: python leer_pdf.py <ruta_del_pdf> [pagina_inicio] [pagina_fin]

Ejemplos:
  python leer_pdf.py "APEGO/DOC8_Vinculacion_Traumatica_Trauma_Bond.pdf"
  python leer_pdf.py "APEGO/DOC8_Vinculacion_Traumatica_Trauma_Bond.pdf" 3 7
  python leer_pdf.py --buscar "ventana de tolerancia"
  python leer_pdf.py --indice
"""

import sys
import os

# Forzar UTF-8 en Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

from pypdf import PdfReader

BASE = "C:/Users/jivca/OneDrive/Documentos/AGENTES/base_conocimiento"


def leer_pdf(ruta, pagina_inicio=None, pagina_fin=None):
    """Lee un PDF y devuelve el texto."""
    if not os.path.isabs(ruta):
        ruta = os.path.join(BASE, ruta)

    reader = PdfReader(ruta)
    total = len(reader.pages)

    inicio = (pagina_inicio or 1) - 1
    fin = pagina_fin or total

    print(f"Archivo: {os.path.basename(ruta)}")
    print(f"Total paginas: {total}")
    print(f"Leyendo: paginas {inicio+1} a {fin}")
    print("=" * 60)

    for i in range(inicio, min(fin, total)):
        text = reader.pages[i].extract_text()
        if text:
            # Limpiar espacios multiples
            text = ' '.join(text.split())
            # Restaurar saltos de parrafo
            text = text.replace('. ', '.\n')
            print(f"\n--- PAGINA {i+1} ---\n")
            print(text)

    return total


def buscar_en_todos(termino):
    """Busca un termino en todos los PDFs de la base."""
    resultados = []

    for root, dirs, files in os.walk(BASE):
        for f in sorted(files):
            if not f.endswith('.pdf'):
                continue
            fp = os.path.join(root, f)
            folder = os.path.relpath(root, BASE)
            try:
                reader = PdfReader(fp)
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text and termino.lower() in text.lower():
                        # Extraer contexto alrededor del termino
                        idx = text.lower().find(termino.lower())
                        start = max(0, idx - 150)
                        end = min(len(text), idx + len(termino) + 150)
                        contexto = text[start:end].replace('\n', ' ')
                        resultados.append({
                            'archivo': f"{folder}/{f}",
                            'pagina': i + 1,
                            'contexto': contexto
                        })
            except Exception:
                pass

    print(f"Busqueda: '{termino}'")
    print(f"Resultados: {len(resultados)}")
    print("=" * 60)

    for r in resultados:
        print(f"\n{r['archivo']} (pag {r['pagina']})")
        print(f"  ...{r['contexto']}...")

    return resultados


def indice_completo():
    """Genera un indice de toda la base de conocimiento."""
    print("INDICE COMPLETO DE LA BASE DE CONOCIMIENTO")
    print("=" * 60)

    total_archivos = 0
    total_paginas = 0

    for root, dirs, files in os.walk(BASE):
        folder = os.path.relpath(root, BASE)
        pdfs = [f for f in sorted(files) if f.endswith('.pdf')]
        if not pdfs:
            continue

        print(f"\n=== {folder} ===")
        for f in pdfs:
            fp = os.path.join(root, f)
            try:
                reader = PdfReader(fp)
                pages = len(reader.pages)
                total_archivos += 1
                total_paginas += pages

                # Leer titulo/tema de primera pagina
                text = reader.pages[0].extract_text() or ''
                # Extraer primeras 200 chars como descripcion
                desc = ' '.join(text.split())[:200]

                print(f"  {f} ({pages}p)")
                print(f"    {desc}...")
            except Exception as e:
                print(f"  {f} — ERROR: {e}")

    print(f"\n{'=' * 60}")
    print(f"TOTAL: {total_archivos} archivos, {total_paginas} paginas")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    if sys.argv[1] == "--buscar":
        termino = " ".join(sys.argv[2:])
        buscar_en_todos(termino)
    elif sys.argv[1] == "--indice":
        indice_completo()
    else:
        ruta = sys.argv[1]
        inicio = int(sys.argv[2]) if len(sys.argv) > 2 else None
        fin = int(sys.argv[3]) if len(sys.argv) > 3 else None
        leer_pdf(ruta, inicio, fin)
