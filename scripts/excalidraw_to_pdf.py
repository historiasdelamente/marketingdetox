"""Convierte el .excalidraw de Marketing Detox a PDF usando reportlab.

Renderiza una aproximación fiel del layout (rectángulos, textos, flechas).
El estilo "rough" de Excalidraw se sustituye por líneas limpias — el contenido
y el layout son idénticos.
"""
import json

from reportlab.lib.colors import HexColor, black, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

SRC = "/home/user/marketingdetox/docs/marketing-detox.excalidraw"
DST = "/home/user/marketingdetox/docs/marketing-detox.pdf"

# ---- cargar diagrama ----
with open(SRC, encoding="utf-8") as f:
    doc = json.load(f)

elements = doc["elements"]
bg = doc["appState"].get("viewBackgroundColor", "#ffffff")

# ---- calcular bounding box ----
xs_min = min(e["x"] for e in elements)
ys_min = min(e["y"] for e in elements)
xs_max = max(e["x"] + e.get("width", 0) for e in elements)
ys_max = max(e["y"] + e.get("height", 0) for e in elements)

pad = 40
width = (xs_max - xs_min) + 2 * pad
height = (ys_max - ys_min) + 2 * pad

# ---- registrar fuente (DejaVu tiene UTF-8 completo) ----
try:
    pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("BodyBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Mono", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"))
    FONT = "Body"
    FONT_BOLD = "BodyBold"
    FONT_MONO = "Mono"
except Exception:
    FONT = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"
    FONT_MONO = "Courier"


def col(value):
    if not value or value == "transparent":
        return None
    try:
        return HexColor(value)
    except Exception:
        return None


def flip_y(y, h=0):
    """Excalidraw usa Y descendente, PDF ascendente."""
    return height - (y - ys_min + pad) - h


c = canvas.Canvas(DST, pagesize=(width, height))

# fondo
bg_color = col(bg)
if bg_color:
    c.setFillColor(bg_color)
    c.rect(0, 0, width, height, stroke=0, fill=1)

# ---- render pass 1: rectángulos ----
for e in elements:
    if e["type"] != "rectangle":
        continue
    x = e["x"] - xs_min + pad
    y = flip_y(e["y"], e["height"])
    w, h = e["width"], e["height"]
    stroke = col(e.get("strokeColor"))
    fill = col(e.get("backgroundColor"))
    sw = e.get("strokeWidth", 1)
    opacity = e.get("opacity", 100) / 100.0
    c.setLineWidth(sw)
    if stroke:
        c.setStrokeColor(stroke)
    if fill:
        c.setFillColor(fill)
    # dashed
    if e.get("strokeStyle") == "dashed":
        c.setDash(6, 4)
    else:
        c.setDash()
    c.setFillAlpha(opacity)
    c.setStrokeAlpha(opacity)
    if e.get("roundness"):
        radius = min(8, min(w, h) / 4)
        c.roundRect(x, y, w, h, radius, stroke=1 if stroke else 0, fill=1 if fill else 0)
    else:
        c.rect(x, y, w, h, stroke=1 if stroke else 0, fill=1 if fill else 0)

c.setDash()
c.setFillAlpha(1)
c.setStrokeAlpha(1)

# ---- render pass 2: flechas ----
def draw_arrowhead(cvs, x1, y1, x2, y2, size=8):
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    a = math.pi / 7
    xa = x2 - size * math.cos(angle - a)
    ya = y2 - size * math.sin(angle - a)
    xb = x2 - size * math.cos(angle + a)
    yb = y2 - size * math.sin(angle + a)
    p = cvs.beginPath()
    p.moveTo(x2, y2)
    p.lineTo(xa, ya)
    p.lineTo(xb, yb)
    p.close()
    cvs.drawPath(p, stroke=1, fill=1)


for e in elements:
    if e["type"] != "arrow":
        continue
    pts = e.get("points", [])
    if len(pts) < 2:
        continue
    stroke = col(e.get("strokeColor")) or black
    sw = e.get("strokeWidth", 1)
    c.setStrokeColor(stroke)
    c.setFillColor(stroke)
    c.setLineWidth(sw)
    if e.get("strokeStyle") == "dashed":
        c.setDash(6, 4)
    else:
        c.setDash()

    ox = e["x"] - xs_min + pad
    oy_raw = e["y"]
    # En excalidraw los puntos son relativos al x,y del elemento (sin height)
    # y el eje Y es hacia abajo.
    def xform(px, py):
        absx = ox + px
        absy = height - (oy_raw - ys_min + pad) - py
        return absx, absy

    x1, y1 = xform(*pts[0])
    for p in pts[1:]:
        x2, y2 = xform(*p)
        c.line(x1, y1, x2, y2)
        x1, y1 = x2, y2

    # arrowhead al final
    if e.get("endArrowhead") == "arrow" and len(pts) >= 2:
        penul_x, penul_y = xform(*pts[-2])
        last_x, last_y = xform(*pts[-1])
        draw_arrowhead(c, penul_x, penul_y, last_x, last_y, size=max(6, sw * 3))

c.setDash()

# ---- render pass 3: textos ----
def pick_font(size, text_content):
    # Bold para títulos grandes; mono para paths; body normal para el resto
    if size >= 20:
        return FONT_BOLD
    if "/" in text_content and (".md" in text_content or "outputs" in text_content or "content/" in text_content):
        return FONT_MONO
    return FONT


for e in elements:
    if e["type"] != "text":
        continue
    txt = e.get("text", "")
    if not txt:
        continue
    size = e.get("fontSize", 16)
    color = col(e.get("strokeColor")) or black
    align = e.get("textAlign", "left")
    valign = e.get("verticalAlign", "top")
    ex = e["x"] - xs_min + pad
    ey = e["y"] - ys_min + pad
    ew, eh = e["width"], e["height"]

    font_name = pick_font(size, txt)
    c.setFont(font_name, size)
    c.setFillColor(color)

    lines = txt.split("\n")
    line_h = size * 1.25

    total_h = line_h * len(lines)
    if valign == "middle":
        start_y_off = (eh - total_h) / 2
    elif valign == "bottom":
        start_y_off = eh - total_h
    else:
        start_y_off = 0

    for i, line in enumerate(lines):
        # baseline Y in PDF
        baseline_y = height - (ey + start_y_off + (i + 1) * line_h - (line_h - size) / 2) + 2
        tw = c.stringWidth(line, font_name, size)
        if align == "center":
            tx = ex + (ew - tw) / 2
        elif align == "right":
            tx = ex + ew - tw
        else:
            tx = ex
        c.drawString(tx, baseline_y, line)

c.showPage()
c.save()

print(f"OK — PDF generado en {DST}")
print(f"   Dimensiones: {width:.0f} x {height:.0f} pt")
