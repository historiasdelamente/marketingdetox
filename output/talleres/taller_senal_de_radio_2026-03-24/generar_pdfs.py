# -*- coding: utf-8 -*-
"""
Genera los 2 PDFs profesionales del Taller "La Señal de Radio"
- taller_completo_instructor.pdf
- cuaderno_participante.pdf
"""

from fpdf import FPDF
import os

OUTPUT_DIR = r"C:\Users\jivca\OneDrive\Documentos\documentos_hechos\taller apego detox"

# ═══════════════════════════════════════════════════════
# COLORES
# ═══════════════════════════════════════════════════════
GOLD = (201, 168, 76)       # #C9A84C
DARK_GOLD = (160, 130, 50)
LIGHT_GOLD = (255, 248, 220)  # fondo suave
BLACK = (30, 30, 30)
DARK_GRAY = (60, 60, 60)
MEDIUM_GRAY = (120, 120, 120)
WHITE = (255, 255, 255)
CREAM = (252, 250, 243)


FONTS_DIR = "C:/Windows/Fonts"


def sanitize(text):
    """Replace problematic Unicode chars with safe equivalents"""
    replacements = {
        '\u2014': '-',   # em dash
        '\u2013': '-',   # en dash
        '\u2018': "'",   # left single quote
        '\u2019': "'",   # right single quote
        '\u201c': '"',   # left double quote
        '\u201d': '"',   # right double quote
        '\u2026': '...',  # ellipsis
        '\u2022': '-',   # bullet
        '\u00ab': '"',   # left guillemet
        '\u00bb': '"',   # right guillemet
        '\u2192': '->',  # arrow
        '\u2550': '=',   # box drawing
        '\u2551': '|',
        '\u2591': '',
        '\u2588': '#',
        '\u2591': '.',
        chr(8226): '-',  # bullet
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


class TallerPDF(FPDF):
    """PDF base con estilo Historias de la Mente"""

    def __init__(self, title_text="", subtitle_text=""):
        super().__init__()
        self.title_text = title_text
        self.subtitle_text = subtitle_text
        self.set_auto_page_break(auto=True, margin=25)
        # Register Unicode TTF fonts
        self.add_font("Arial", "", os.path.join(FONTS_DIR, "arial.ttf"))
        self.add_font("Arial", "B", os.path.join(FONTS_DIR, "arialbd.ttf"))
        self.add_font("Arial", "I", os.path.join(FONTS_DIR, "ariali.ttf"))
        self.add_font("Arial", "BI", os.path.join(FONTS_DIR, "arialbi.ttf"))

    def header(self):
        if self.page_no() == 1:
            return
        # Línea dorada superior
        self.set_draw_color(*GOLD)
        self.set_line_width(0.8)
        self.line(15, 10, self.w - 15, 10)
        # Texto header
        self.set_font("Arial", "I", 8)
        self.set_text_color(*MEDIUM_GRAY)
        self.set_y(12)
        self.cell(0, 5, "Historias de la Mente  |  Apego Detox", align="C")
        self.ln(8)

    def footer(self):
        self.set_y(-20)
        self.set_draw_color(*GOLD)
        self.set_line_width(0.5)
        self.line(15, self.get_y(), self.w - 15, self.get_y())
        self.ln(3)
        self.set_font("Arial", "I", 8)
        self.set_text_color(*MEDIUM_GRAY)
        self.cell(0, 5, f"Página {self.page_no()}", align="C")

    def cover_page(self, title, subtitle, extra_lines=None):
        self.add_page()
        # Fondo dorado en la parte superior
        self.set_fill_color(*GOLD)
        self.rect(0, 0, self.w, 120, "F")

        # Título
        self.set_y(35)
        self.set_font("Arial", "B", 28)
        self.set_text_color(*WHITE)
        self.multi_cell(0, 12, title, align="C")

        # Línea decorativa
        self.set_y(self.get_y() + 5)
        self.set_draw_color(*WHITE)
        self.set_line_width(0.5)
        mid = self.w / 2
        self.line(mid - 40, self.get_y(), mid + 40, self.get_y())

        # Subtítulo
        self.set_y(self.get_y() + 8)
        self.set_font("Arial", "", 14)
        self.set_text_color(255, 255, 230)
        self.multi_cell(0, 7, subtitle, align="C")

        # Sección inferior
        self.set_y(140)
        self.set_text_color(*DARK_GRAY)
        self.set_font("Arial", "B", 13)
        self.cell(0, 8, "HISTORIAS DE LA MENTE", align="C")
        self.ln(10)
        self.set_font("Arial", "", 11)
        self.cell(0, 7, "Apego Detox", align="C")
        self.ln(15)

        if extra_lines:
            self.set_font("Arial", "", 10)
            self.set_text_color(*MEDIUM_GRAY)
            for line in extra_lines:
                self.cell(0, 6, line, align="C")
                self.ln(6)

    def gold_heading(self, text, level=1):
        """Encabezado con fondo dorado"""
        text = sanitize(text)
        if level == 1:
            self.ln(6)
            self.set_fill_color(*GOLD)
            self.set_text_color(*WHITE)
            self.set_font("Arial", "B", 14)
            self.cell(0, 10, f"  {text}", fill=True, new_x="LMARGIN", new_y="NEXT")
            self.ln(4)
        elif level == 2:
            self.ln(4)
            self.set_draw_color(*GOLD)
            self.set_line_width(0.6)
            y = self.get_y()
            self.line(15, y, self.w - 15, y)
            self.ln(3)
            self.set_text_color(*DARK_GOLD)
            self.set_font("Arial", "B", 12)
            self.cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
            self.ln(2)
        elif level == 3:
            self.ln(3)
            self.set_text_color(*GOLD)
            self.set_font("Arial", "B", 11)
            self.cell(0, 6, text, new_x="LMARGIN", new_y="NEXT")
            self.ln(2)

    def body_text(self, text):
        self.set_font("Arial", "", 10)
        self.set_text_color(*DARK_GRAY)
        self.multi_cell(0, 5.5, sanitize(text))
        self.ln(2)

    def bold_text(self, text):
        self.set_font("Arial", "B", 10)
        self.set_text_color(*BLACK)
        self.multi_cell(0, 5.5, sanitize(text))
        self.ln(1)

    def italic_text(self, text):
        self.set_font("Arial", "I", 10)
        self.set_text_color(*MEDIUM_GRAY)
        self.multi_cell(0, 5.5, sanitize(text))
        self.ln(2)

    def quote_box(self, text):
        """Caja de cita con borde dorado izquierdo"""
        text = sanitize(text)
        self.ln(2)
        x = self.get_x()
        y = self.get_y()
        self.set_fill_color(*LIGHT_GOLD)
        self.set_draw_color(*GOLD)
        self.set_font("Arial", "I", 10)
        w = self.w - 40
        lines = self.multi_cell(w, 5.5, text, dry_run=True, output="LINES")
        h = len(lines) * 5.5 + 8
        if self.get_y() + h > self.h - 30:
            self.add_page()
            y = self.get_y()
        self.set_fill_color(*LIGHT_GOLD)
        self.rect(18, y, self.w - 36, h, "F")
        self.set_draw_color(*GOLD)
        self.set_line_width(1.5)
        self.line(18, y, 18, y + h)
        self.set_xy(24, y + 4)
        self.set_text_color(*DARK_GRAY)
        self.set_font("Arial", "I", 10)
        self.multi_cell(self.w - 48, 5.5, text)
        self.set_y(y + h + 4)

    def info_box(self, text):
        """Caja de informacion con fondo crema"""
        text = sanitize(text)
        self.ln(2)
        y = self.get_y()
        self.set_font("Arial", "", 10)
        w = self.w - 36
        lines = self.multi_cell(w, 5.5, text, dry_run=True, output="LINES")
        h = len(lines) * 5.5 + 8
        if self.get_y() + h > self.h - 30:
            self.add_page()
            y = self.get_y()
        self.set_fill_color(*CREAM)
        self.rect(18, y, self.w - 36, h, "F")
        self.set_draw_color(*GOLD)
        self.set_line_width(0.3)
        self.rect(18, y, self.w - 36, h, "D")
        self.set_xy(22, y + 4)
        self.set_text_color(*DARK_GRAY)
        self.multi_cell(self.w - 44, 5.5, text)
        self.set_y(y + h + 4)

    def voice_instruction(self, text):
        """Instruccion de voz en cursiva gris con corchetes"""
        self.set_font("Arial", "I", 9)
        self.set_text_color(150, 130, 80)
        self.multi_cell(0, 5, sanitize(text))
        self.ln(2)

    def dialogue(self, text):
        """Texto de dialogo/guion - lo que dice el psicologo"""
        self.set_font("Arial", "", 10.5)
        self.set_text_color(*BLACK)
        self.multi_cell(0, 6, sanitize(text))
        self.ln(3)

    def simple_table(self, headers, rows, col_widths=None):
        """Tabla simple con encabezados dorados"""
        if col_widths is None:
            w = (self.w - 30) / len(headers)
            col_widths = [w] * len(headers)
        # Header
        self.set_fill_color(*GOLD)
        self.set_text_color(*WHITE)
        self.set_font("Arial", "B", 9)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, sanitize(f" {h}"), fill=True, border=1)
        self.ln()
        # Rows
        self.set_text_color(*DARK_GRAY)
        self.set_font("Arial", "", 9)
        for j, row in enumerate(rows):
            bg = LIGHT_GOLD if j % 2 == 0 else WHITE
            self.set_fill_color(*bg)
            max_h = 7
            for i, cell in enumerate(row):
                self.cell(col_widths[i], max_h, sanitize(f" {cell}"), fill=True, border=1)
            self.ln()
        self.ln(4)

    def bullet(self, text, indent=20):
        """Bullet point"""
        self.set_x(indent)
        self.set_font("Arial", "", 10)
        self.set_text_color(*DARK_GRAY)
        self.cell(5, 5.5, "-")
        self.multi_cell(self.w - indent - 20, 5.5, sanitize(text))
        self.ln(1)

    def numbered_item(self, number, text, indent=20):
        self.set_x(indent)
        self.set_font("Arial", "B", 10)
        self.set_text_color(*GOLD)
        self.cell(8, 5.5, f"{number}.")
        self.set_font("Arial", "", 10)
        self.set_text_color(*DARK_GRAY)
        self.multi_cell(self.w - indent - 28, 5.5, sanitize(text))
        self.ln(1)

    def separator(self):
        self.ln(3)
        mid = self.w / 2
        self.set_draw_color(*GOLD)
        self.set_line_width(0.3)
        self.line(mid - 30, self.get_y(), mid + 30, self.get_y())
        self.ln(5)

    def write_lines(self, count=3, width=None):
        """Líneas para escribir (cuaderno participante)"""
        if width is None:
            width = self.w - 40
        self.set_draw_color(200, 200, 200)
        self.set_line_width(0.3)
        for _ in range(count):
            y = self.get_y()
            self.line(20, y, 20 + width, y)
            self.ln(8)


# ═══════════════════════════════════════════════════════
# PDF 1: TALLER COMPLETO INSTRUCTOR
# ═══════════════════════════════════════════════════════
def generate_instructor_pdf():
    pdf = TallerPDF()

    # --- PORTADA ---
    pdf.cover_page(
        "LA SEÑAL DE RADIO",
        "Confundes intensidad con intimidad\nEl apego ansioso no ama más, sufre más",
        [
            "Taller Vivencial  |  120 minutos  |  Google Meet",
            "Módulo 2: Duelo y Desintoxicación  |  Fase 2",
            "",
            "GUIÓN COMPLETO DEL INSTRUCTOR",
        ]
    )

    # --- PÁGINA INFO ---
    pdf.add_page()
    pdf.gold_heading("INFORMACIÓN GENERAL")

    pdf.simple_table(
        ["Campo", "Detalle"],
        [
            ["Módulo", "2 — Duelo y Desintoxicación"],
            ["Fase de sanación", "2 (ya fuera pero enganchada)"],
            ["Duración", "120 minutos (2 horas)"],
            ["Formato", "Google Meet en vivo"],
            ["Enfoque", "Mix completo (emocional + psicoeducativo + vivencial)"],
            ["Metáfora central", "La señal de radio"],
            ["Calibración", "65% Marian Rojas Estapé / 35% Walter Riso"],
        ],
        col_widths=[50, 130]
    )

    pdf.gold_heading("OBJETIVOS", level=2)
    pdf.body_text("Al finalizar esta sesión, las participantes:")
    pdf.numbered_item(1, "Cognitivo: Entenderán la diferencia neurobiológica entre intensidad e intimidad, y cómo el apego ansioso distorsiona la lectura de señales emocionales.")
    pdf.numbered_item(2, "Emocional: Conectarán con el origen infantil de su patrón de apego y validarán su dolor sin culpa.")
    pdf.numbered_item(3, "Conductual: Practicarán identificar cuándo buscan «la estática» vs. conexión real, con herramienta concreta para la semana.")

    pdf.gold_heading("FRAMEWORKS PSICOLÓGICOS", level=2)
    pdf.numbered_item(1, "Neurociencia — Cortisol/dopamina vs. oxitocina/serotonina + Teoría Polivagal (Porges)")
    pdf.numbered_item(2, "Teoría del Apego — Bowlby/Ainsworth: apego ansioso, cuidador inconsistente")
    pdf.numbered_item(3, "Esquemas Maladaptativos — Jeffrey Young: abandono + privación emocional")
    pdf.numbered_item(4, "ACT — Steven Hayes: fusión y defusión cognitiva, yo observador")

    pdf.gold_heading("MATERIALES Y PREPARACIÓN", level=2)
    for item in [
        "Conexión estable a internet",
        "Espacio privado y tranquilo (avisar que puede haber llanto)",
        "Cuaderno/hojas + lapicero",
        "Pañuelos",
        "Agua",
    ]:
        pdf.bullet(item)

    pdf.gold_heading("ESTRUCTURA DEL TALLER", level=2)
    pdf.simple_table(
        ["Bloque", "Nombre", "Duración", "Acumulado"],
        [
            ["1", "LA HISTORIA", "20 min", "0:20"],
            ["2", "EL ESPEJO", "25 min", "0:45"],
            ["3", "EL QUIEBRE", "30 min", "1:15"],
            ["4", "LA GRIETA", "30 min", "1:45"],
            ["5", "EL ANCLA", "15 min", "2:00"],
        ],
        col_widths=[20, 60, 40, 40]
    )

    # ═══════════════════════════════════════════
    # BLOQUE 1
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.gold_heading('BLOQUE 1: LA HISTORIA — "La estación que nunca elegiste" (20 min)')

    pdf.gold_heading("Apertura (3 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Directo. Sin «hola, ¿cómo están?». Arranca con fuerza pero con calidez. Tono de alguien que sabe exactamente lo que sientes.]")

    pdf.dialogue("Mira, necesito que pares todo lo que estás haciendo. Si estás en el carro, estaciona. Si estás cocinando, apaga la estufa. Si estás en la cama a las 11 de la noche con el teléfono porque es lo único que te distrae de pensar en él... quédate ahí. Pero escúchame.\n\nHoy te voy a decir algo que probablemente nadie te ha dicho. Y te va a doler. Pero ese dolor va a ser diferente al que sientes hace meses. Porque este dolor tiene salida.\n\nHoy vamos a hablar de por qué confundes la tormenta con pasión. De por qué el silencio te asusta más que los gritos. De por qué cuando alguien te trata bien... se siente raro. Como si algo estuviera mal. Como si faltara algo.")

    pdf.voice_instruction("[PAUSA — 3 segundos]")

    pdf.dialogue("Y vamos a hablar de algo que tal vez ya intuyes pero nadie te ha nombrado: que tu forma de amar — esa que tú crees que es generosa, que es profunda, que es «demasiada» — no es amor excesivo. Es miedo excesivo. Y hoy vas a entender la diferencia.")

    pdf.gold_heading("Acuerdos del espacio (1 min)", level=2)
    pdf.dialogue("Antes de empezar, tres acuerdos:\nUno — lo que se dice aquí, queda aquí. Este es un espacio sagrado.\nDos — no hay respuestas correctas o incorrectas. Pueden participar por chat o por voz, como se sientan más cómodas.\nTres — si en algún momento se sienten abrumadas, tienen permiso de apagar la cámara y respirar. Eso no es huir. Es cuidarte.")

    pdf.gold_heading("Grounding — Respiración 4-7-8 (3 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN: Bajar la voz. Ritmo lento. Que se sienta como un abrazo auditivo.]")

    pdf.dialogue("Vamos a empezar aterrizando. Porque sé que muchas de ustedes llegaron aquí con el cuerpo apretado. Con la mandíbula tensa. Con esa sensación en el pecho que llevan cargando hace semanas. Meses. Tal vez años.\n\nPongan una mano en el pecho. Sientan su corazón. Está ahí. Sigue latiendo. A pesar de todo lo que les ha pasado, sigue ahí.\n\nInhalen por la nariz contando hasta cuatro. Uno... dos... tres... cuatro.\nSostengan el aire contando hasta siete. Uno... dos... tres... cuatro... cinco... seis... siete.\nExhalen por la boca contando hasta ocho. Lento. Todo ese aire que está de más. Sáquenlo.\n\nUna vez más.")

    pdf.voice_instruction("[Repetir el ciclo 2 veces más]")

    pdf.dialogue("Bien. Ahora sientan sus pies en el piso. Están aquí. En el presente. No en el pasado con él. No en el futuro imaginando qué va a pasar. Aquí. Ahora.")

    pdf.gold_heading("Contexto Fase 2 (1 min)", level=2)
    pdf.dialogue("Antes de seguir, quiero nombrar algo. Muchas de ustedes ya salieron. Ya dieron el paso. Ya no están en esa relación. Y eso requirió un coraje que no se han dado el crédito de reconocer.\n\nPero salir... no es lo mismo que soltar. Y ahí es donde están muchas: fuera de la relación pero con el cuerpo todavía adentro. Todavía checkeando su última conexión. Todavía con el estómago apretado cuando ven su foto en redes. Todavía contando los días.\n\nEso no significa que fallaste. Significa que tu sistema nervioso necesita tiempo para entender que ya no estás en peligro. Y hoy le vamos a enseñar.")

    pdf.gold_heading("Historia principal: Valeria (5 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Contar como si estuvieras contando la historia de una amiga. Sin prisas. Con pausas. Que la puedan ver en su mente.]")

    pdf.dialogue("Valeria tenía 32 años cuando entendió.\n\nEstaba sentada en la cocina de Daniel. Daniel era un hombre tranquilo. De esos que te hacen el desayuno sin pedirte nada a cambio. De esos que te preguntan cómo dormiste y se quedan escuchando la respuesta. De esos que cuando dices «estoy bien» y no lo estás, te miran y dicen: «No me tienes que mentir a mí.»\n\nY mientras Daniel le servía café, Valeria pensó algo que le daba vergüenza admitir: «No siento nada.»\n\nNo estaba triste. No estaba enojada. No estaba emocionada. Estaba... tranquila. Y para Valeria, tranquila se sentía vacía. Tranquila se sentía como que algo faltaba. Tranquila se sentía aburrida.")

    pdf.voice_instruction("[PAUSA]")

    pdf.dialogue("Tres semanas después, dejó a Daniel. Le dijo: «Eres increíble, pero no siento esa conexión.»\n\nDos meses después estaba con Sebastián. Sebastián la hacía reír hasta las lágrimas un día y llorar hasta las 4 de la mañana al siguiente. Con Sebastián sentía TODO. El pecho apretado. Las manos temblando. La montaña rusa completa. Cuando Sebastián no le contestaba el teléfono, Valeria sentía que el mundo se acababa. Cuando le contestaba, sentía que el mundo volvía a girar.\n\n«Esto sí es amor», pensó Valeria. «Esto sí es intenso. Esto sí es real.»")

    pdf.voice_instruction("[PAUSA — dejar que resuene]")

    pdf.dialogue("Nueve meses después, sentada en el piso de su baño a las 3 de la mañana, con el teléfono en la mano esperando un mensaje que no llegaba, con el estómago cerrado y las manos temblando, Valeria entendió algo que le cambió la vida.\n\nLo que ella llamaba «no sentir nada» con Daniel... era paz.\nY lo que ella llamaba «sentirlo todo» con Sebastián... era cortisol.\n\nNo era que Daniel fuera aburrido. Es que su cuerpo no sabía leer la calma. Toda su vida había confundido la turbulencia con pasión. La ansiedad con conexión. La intensidad con intimidad.")

    pdf.gold_heading("Introducción de la metáfora: La señal de radio (3 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Transición suave. De la historia de Valeria a la metáfora. Como quien conecta los puntos.]")

    pdf.dialogue("Lo que le pasó a Valeria tiene una explicación. Y quiero que la entiendan con una imagen.\n\nImaginen que cada una de ustedes tiene una radio interna. Una radio que sintoniza las relaciones que tienen. Desde que eran niñas, esa radio se fue calibrando. Y dependiendo de lo que vivieron en casa — si el amor era consistente o intermitente, si mamá o papá estaban o no estaban, si el cariño venía con gritos o con calma — esa radio se quedó sintonizada en una frecuencia específica.\n\nAlgunas de ustedes — muchas de ustedes — se quedaron sintonizadas en una frecuencia de estática. De interferencia. De ruido. De drama. De subir y bajar. De «me quiere, no me quiere». De montaña rusa.\n\nY cuando pasan por una estación clara — una relación tranquila, un hombre que les contesta a tiempo, que no las deja en visto, que no las hace adivinar — ¿saben qué hacen?\n\nCambian de canal.\n\nPorque «no suena a nada». Porque la música limpia les parece aburrida. Porque su radio no reconoce esa señal. Porque toda su vida lo que les sonó a amor fue ruido.")

    pdf.voice_instruction("[PAUSA]")

    pdf.dialogue("Hoy vamos a entender por qué tu radio está en esa frecuencia. Y más importante: vamos a empezar a recalibrarla.")

    pdf.gold_heading("Primera pregunta-grieta (1 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN: Pregunta al chat. No esperar muchas respuestas — es para que procesen internamente.]")

    pdf.dialogue("Antes de seguir, quiero hacerles una pregunta. Pueden responder en el chat o solo pensarla en silencio.\n\n¿Cuántas veces dejaron ir algo bueno... porque no les hacía sentir esas «mariposas»?")

    pdf.voice_instruction("[Esperar 30 segundos. Leer 2-3 respuestas. Validar: «Gracias por su honestidad. Eso que acaban de nombrar es exactamente de lo que vamos a hablar.»]")

    # ═══════════════════════════════════════════
    # BLOQUE 2
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.gold_heading('BLOQUE 2: EL ESPEJO — "Confundes intensidad con intimidad" (25 min)')

    pdf.gold_heading("Neurociencia: Las mariposas son cortisol (8 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Tono Marian — cálido, explicativo, como una amiga doctora que te explica sin hacerte sentir tonta.]")

    pdf.dialogue("Vamos a hablar de ciencia por un momento. Pero ciencia que se siente en el cuerpo.\n\nCuando tú dices «siento mariposas en el estómago», ¿sabes qué está pasando realmente? Tu cuerpo está liberando cortisol. Cortisol es la hormona del estrés. La misma que se libera cuando estás en peligro. La misma que se libera antes de un examen importante o cuando casi te atropella un carro.\n\nJunto con el cortisol viene la adrenalina. Y la dopamina — la hormona del placer anticipatorio. La misma que se libera cuando un adicto está a punto de recibir su dosis.\n\nEsa combinación — cortisol, adrenalina, dopamina — es lo que tú llamas «química». Es lo que tú llamas «conexión». Es lo que tú llamas «nunca sentí esto con nadie».")

    pdf.voice_instruction("[PAUSA]")

    pdf.dialogue("Ahora escucha esto. Cuando estás en una relación segura — cuando alguien te trata con consistencia, con respeto, con calma — tu cuerpo libera oxitocina y serotonina. Oxitocina es la hormona del vínculo seguro. Serotonina es la hormona de la estabilidad emocional.\n\n¿Y sabes qué se siente? Calma. Tranquilidad. Seguridad.\n\nY para un cerebro que creció con intermitencia — donde el amor venía y se iba, donde nunca sabías si hoy era un día bueno o un día malo — esa calma se siente como NADA. Porque tu cerebro está acostumbrado a la montaña rusa. Y cuando la montaña rusa para... entra el pánico.\n\nEso le pasó a Valeria con Daniel. No es que no sentía nada. Es que su cuerpo no sabía qué hacer con la seguridad.")

    pdf.gold_heading("Teoría Polivagal — Por qué la calma se siente vacía (7 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN: Clave para Fase 2. Ellas ya salieron y sienten un vacío enorme. Esto les explica por qué.]")

    pdf.dialogue("Hay un neurocientífico llamado Stephen Porges que descubrió algo que les va a volar la cabeza. Se llama la teoría polivagal. Y en simple dice esto:\n\nTu sistema nervioso tiene tres modos. Tres velocidades.\n\nModo uno: Ventral vagal. Es cuando te sientes segura, conectada, en calma. Tu cuerpo está relajado. Puedes pensar con claridad. Puedes sentir sin ahogarte.\n\nModo dos: Simpático. Es el modo de pelear o huir. Tu corazón se acelera. Tus músculos se tensan. Tu cerebro deja de pensar y empieza a reaccionar.\n\nModo tres: Dorsal vagal. Es el apagón. La disociación. Cuando el dolor es tanto que tu cuerpo se desconecta.")

    pdf.voice_instruction("[PAUSA]")

    pdf.dialogue("Muchas de ustedes vivieron MESES — algunas AÑOS — alternando entre modo dos y modo tres. Entre la pelea y el apagón. Entre la ansiedad y el entumecimiento. Eso era su normalidad.\n\nY ahora que salieron... están empezando a experimentar el modo uno. La ventral vagal. La calma.\n\n¿Y saben qué les pasa? Les da miedo. Se siente raro. Se siente vacío. Como si algo estuviera mal.\n\nNo falta nada. Lo que pasa es que tu sistema nervioso no reconoce la seguridad. Es como si tu radio, que llevaba años en estática, de pronto captara una estación limpia. Y tu primera reacción es: «Esto no suena a nada. Déjame volver a la estática.»\n\nEso que sientes ahora — ese vacío, esa inquietud, esas ganas de volver a lo que conoces aunque te destruía — no es que lo extrañas. Es que tu sistema nervioso extraña la activación. Y confunde la activación con conexión.")

    pdf.gold_heading("Ráfaga de preguntas (3 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Aquí entra Riso. Directo. Sin pausa entre preguntas. Cada pregunta es un golpe.]")

    pdf.dialogue("Déjame preguntarte algo.\n\n¿Cuántas veces dijiste «nunca sentí esto con nadie»... justo antes de que todo se fuera al carajo? ¿Cuántas veces la relación que te trataba bien te pareció «aburrida»? ¿Cuántas veces confundiste las mariposas en el estómago con amor... cuando en realidad era tu cuerpo diciéndote PELIGRO? ¿Cuántas veces rechazaste al que te daba paz porque «no sentías chispa»? ¿Cuántas veces elegiste al que te quitaba el sueño... literalmente?")

    pdf.voice_instruction("[PAUSA — 5 segundos de silencio]")

    pdf.dialogue("Lo que tú llamas «chispa» tiene otro nombre. Se llama activación del sistema nervioso simpático. Y no es amor. Es tu cuerpo reconociendo un patrón de peligro que le resulta familiar.")

    pdf.gold_heading("Ejercicio breve + pregunta de chat (4 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN: Ejercicio rápido de escritura. 2 minutos. Luego compartir en chat.]")

    pdf.dialogue("Quiero que agarren su cuaderno. Dos minutos. Nada más.\n\nEscriban tres momentos «intensos» que vivieron con él. Los que ustedes llamarían «los más apasionados». Los más «fuertes».\n\nAhora miren lo que escribieron. Y pregúntense: ¿eso era conexión? ¿O era cortisol?\n\nEn el chat, respondan: ¿Qué te hizo sentir más viva... y qué te dejó más rota?")

    pdf.voice_instruction("[Leer 3-4 respuestas. Validar: «Miren lo que están descubriendo juntas. Eso requiere mucho coraje.»]")

    # ═══════════════════════════════════════════
    # BLOQUE 3
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.gold_heading('BLOQUE 3: EL QUIEBRE — "El apego ansioso no ama más, sufre más" (30 min)')

    pdf.gold_heading("Transición (2 min)", level=2)
    pdf.dialogue("Ya entendieron la primera parte: que su cuerpo confunde intensidad con intimidad. Que sus mariposas son cortisol. Que la calma se siente vacía porque su sistema nervioso no la reconoce.\n\nAhora vamos más profundo. Porque esto no empezó con él. Esto empezó mucho antes. Esto empezó cuando eras una niña.")

    pdf.gold_heading("Bowlby — La niña que aprendió a gritar (8 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: La voz baja. Se vuelve íntima. Como si estuvieras sentada al lado de ella.]")

    pdf.dialogue("Había una niña — muchas de ustedes van a reconocerla — que nunca sabía si mamá iba a abrazarla o a gritarle. O si papá iba a llegar contento o furioso. O si hoy era un día donde la querían o un día donde la ignoraban.\n\nEsa niña aprendió algo muy temprano: el amor es impredecible. A veces viene, a veces no. Y la única forma de conseguirlo es estar pendiente. Vigilar. Leer el aire. Escuchar los pasos en el pasillo para saber qué noche le tocaba.\n\nJohn Bowlby, el padre de la teoría del apego, le puso nombre a esto: apego ansioso. No porque la niña fuera «ansiosa». Sino porque el amor que le dieron fue ANSIOSO. Inconsistente. A veces sí, a veces no.")

    pdf.voice_instruction("[PAUSA]")

    pdf.dialogue("Esa niña creció. Se enamoró. Y sin saberlo, buscó exactamente lo mismo: alguien impredecible. Alguien que a veces la hacía sentir la mujer más importante del mundo y a veces la hacía sentir invisible.\n\nNo lo eligió porque fuera masoquista. Lo eligió porque su radio estaba sintonizada en esa frecuencia desde que tenía 5 años.")

    pdf.gold_heading("Esquemas de Young — La cadena del pensamiento (7 min)", level=2)

    pdf.dialogue("Jeffrey Young desarrolló algo llamado esquemas maladaptativos. Son los lentes rotos con los que ves el mundo.\n\nEl apego ansioso instala dos esquemas que te destruyen la vida:\n\nEsquema de abandono: «Las personas que amo me van a dejar.» No importa cuánta evidencia tengas de que no es así. El esquema está ahí, gritando en el fondo.\n\nEsquema de privación emocional: «Mis necesidades emocionales nunca van a ser satisfechas.» Así que te acostumbraste a dar todo esperando que algún día alguien te dé lo mismo.")

    pdf.voice_instruction("[PAUSA]")

    pdf.dialogue("¿Quieren saber cómo se ve esto en la vida real? Así:\n\nÉl no contesta en 5 minutos.\nTu cerebro dice: «No me quiere.»\nLuego dice: «Me va a dejar.»\nLuego dice: «Me voy a quedar sola.»\nLuego dice: «No valgo nada.»\n\nCinco minutos. Cuatro pensamientos. Ninguno es la realidad. Pero tu cuerpo los procesa como si lo fueran.")

    pdf.gold_heading("La historia de Camila — El monitoreo (3 min)", level=2)

    pdf.dialogue("Les voy a contar algo que me escribió una mujer. La voy a llamar Camila.\n\nCamila llevaba 4 meses fuera de la relación. Cuatro meses. Ya no vivían juntos. Ya no se hablaban. En teoría, estaba «libre».\n\nPero todas las noches, antes de dormir, Camila hacía lo mismo: abría Instagram. Buscaba su perfil. Veía su última historia. Analizaba cada detalle. ¿Quién le dio like? ¿Esa mujer de la foto quién es? ¿Está sonriendo? ¿Está mejor sin mí?\n\nUn día me escribió: «Sé que me hace daño. Sé que no debería. Pero es como si mi dedo se moviera solo. Como si mi cuerpo lo necesitara.»\n\nCamila no stalkeaba por amor. Stalkeaba por abstinencia. Su cerebro necesitaba la dosis de activación. Y cuando no la tenía en vivo, la buscaba en digital.\n\n¿Les suena familiar?")

    pdf.gold_heading("ACT — Defusión cognitiva (5 min)", level=2)

    pdf.dialogue("Steven Hayes describe algo que se llama fusión cognitiva. Es cuando un pensamiento te atrapa y lo vives como si fuera un hecho.\n\n«Soy demasiado.» Eso no es un hecho. Es un pensamiento.\n«Nadie me va a querer como yo quiero que me quieran.» Tampoco es un hecho.\n\nLa defusión es poner distancia:\n\n«Soy demasiado» versus «Estoy teniendo el pensamiento de que soy demasiado.»\n\n¿Sienten la diferencia? En la primera, tú ERES eso. En la segunda, tú OBSERVAS eso. Y la que observa — esa parte de ti que puede mirar el pensamiento sin ser el pensamiento — esa parte nunca se rompió.")

    pdf.gold_heading("Confrontación directa + Mantra (3 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Aquí entra Riso fuerte. Pero con amor, no con desprecio.]")

    pdf.dialogue("Ya saliste. Ya diste el paso más difícil. Pero sigues monitoreando. Sigues checkeando si vio tu historia. Sigues contando los días.\n\nEso no es amor. Es vigilancia. Es tu sistema nervioso que todavía está en esa frecuencia.")

    pdf.quote_box("Estar pendiente no es lo mismo que estar presente.\nEstar pendiente no es lo mismo que estar presente.\nESTAR PENDIENTE NO ES LO MISMO QUE ESTAR PRESENTE.")

    pdf.dialogue("Cada vez que abres su perfil, le estás diciendo a tu cerebro: «Sigue buscando la estática.» Cada vez que relees un mensaje viejo, le estás diciendo a tu sistema nervioso: «Quédate en esta frecuencia.»\n\nPero los pasos no van a sonar diferente. Porque no son sus pasos los que necesitas escuchar. Son los tuyos. Los tuyos caminando en otra dirección. Los tuyos caminando hacia ti.")

    pdf.gold_heading("Microcuento: Los pasos en el pasillo (2 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Suave. Lento. Que lo sientan en el cuerpo.]")

    pdf.dialogue("Había una niña que dormía con la puerta entreabierta. No porque tuviera miedo a la oscuridad. Sino porque necesitaba escuchar los pasos.\n\nSi los pasos eran suaves, podía respirar. Si los pasos eran pesados, se tensaba. Si no había pasos — si el silencio se estiraba demasiado — el pánico era peor que cualquier ruido.\n\nEsa niña creció. Y cambió los pasos por el teléfono. La puerta entreabierta por WhatsApp. El silencio del pasillo por el «visto» sin respuesta.\n\nLa misma niña. La misma espera. La misma sensación de que si no escucha algo — lo que sea — se va a morir de angustia.\n\n¿La reconocen?")

    pdf.gold_heading("Pregunta-grieta (2 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN: Pregunta sola. Sin respuesta. Silencio.]")

    pdf.dialogue("Les voy a hacer una pregunta. No quiero que la respondan en el chat. No quiero que la respondan en voz alta. Quiero que se la pregunten a ustedes mismas. En silencio.")

    pdf.quote_box("¿Cómo era el amor en tu casa cuando eras niña?")

    pdf.voice_instruction("[Silencio — 15 segundos completos]")

    pdf.dialogue("Lo que sea que sintieron al escuchar esa pregunta... ahí está la respuesta. No necesitan palabras. Su cuerpo ya contestó.")

    # ═══════════════════════════════════════════
    # BLOQUE 4
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.gold_heading('BLOQUE 4: LA GRIETA — Ejercicio vivencial doble (30 min)')

    pdf.gold_heading("Transición al ejercicio (2 min)", level=2)
    pdf.dialogue("Ya hablamos con la cabeza. Ya entendieron la ciencia. Ahora necesitamos hablar con el corazón. Y con el cuerpo.\n\nVamos a hacer dos ejercicios. Si en algún momento necesitan parar, está bien. Pueden apagar la cámara. Pueden simplemente respirar. No hay obligación de escribir. No hay obligación de compartir. Estamos juntas en esto.")

    pdf.gold_heading('Ejercicio 1: "La carta a la estación ruidosa" (12 min)', level=2)
    pdf.voice_instruction("[INSTRUCCIÓN: Poner cronómetro en pantalla si es posible. Música suave de fondo opcional.]")

    pdf.dialogue("Agarren su cuaderno. Vamos a escribir una carta. Pero no le van a escribir a él. No.\n\nLe van a escribir a LA FRECUENCIA. A esa estación ruidosa que las mantuvo enganchadas. A la estática. Al patrón. A esa forma de amar que aprendieron cuando eran niñas.")

    pdf.quote_box("«Querida estática...\nTe conozco desde que era niña.\nFuiste lo primero que mi radio captó.\nY durante mucho tiempo creí que eras música.»")

    pdf.dialogue("Ahora sigan ustedes. Díganle lo que necesiten decirle. Lo que les quitó. Lo que les hizo creer. Por qué la escucharon tanto tiempo. Y si quieren — si pueden — díganle que están listas para cambiar de frecuencia.\n\nTienen 8 minutos. No corrijan. No tachen. No piensen. Solo escriban.")

    pdf.voice_instruction("[Timer: 8 minutos. Silencio o música ambiental muy suave.]")
    pdf.voice_instruction("[A los 7 minutos]: «Un minuto más. Si necesitan cerrar la carta, cierren con una frase.»")

    pdf.gold_heading("Compartir voluntario (5 min)", level=2)
    pdf.dialogue("¿Alguien quiere compartir una frase de su carta? No tiene que ser toda. Una frase. La que les dolió más escribir. O la que les hizo sentir más libres.\n\nPueden hacerlo por chat o por voz.")

    pdf.voice_instruction("[Esperar con paciencia. Si hay silencio: «También pueden escribir en el chat una palabra. Solo una. La que describe lo que sienten ahora.»]")
    pdf.voice_instruction("[Leer 3-4 respuestas. Validar cada una: «Gracias por tu valentía.» / «Eso que acabas de nombrar es enorme.»]")

    pdf.gold_heading("Micro-regulación somática (1 min)", level=2)
    pdf.dialogue("Antes del segundo ejercicio, vamos a aterrizar. Pongan las dos manos en el pecho. Sientan su corazón. Tres respiraciones profundas conmigo.\n\nBien. Están aquí. Están a salvo.")

    pdf.gold_heading('Ejercicio 2: "Sintonizando la nueva frecuencia" — Visualización guiada (10 min)', level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Muy suave. Ritmo hipnótico. Que cierren los ojos.]")

    pdf.dialogue("Cierren los ojos. Si no se sienten cómodas cerrándolos, miren un punto fijo. Pueden apagar la cámara si quieren.\n\nImaginen que están sentadas frente a una radio antigua. De esas con la perilla que giras. La radio está encendida. Y suena la estática. Ese ruido que conocen tan bien. Ese zumbido de ansiedad. De espera. De «¿me querrá o no me querrá?».")

    pdf.voice_instruction("[PAUSA — 5 segundos]")

    pdf.dialogue("Ahora imaginen que ponen la mano en la perilla. Y empiezan a girar. Despacito. Sin prisa. Un milímetro a la vez.\n\nLa estática empieza a bajar. Se mezcla con otra cosa. Con algo que al principio no reconocen.\n\nSigan girando.")

    pdf.voice_instruction("[PAUSA]")

    pdf.dialogue("Y de pronto, entre la estática, aparece algo. Una melodía. Suave. Limpia. Sin interferencia. No es euforia. No es montaña rusa. Es algo que se siente como... llegar a casa. Como sentarse en un sillón después de caminar mucho. Como un abrazo que no pide nada a cambio.\n\nEsa estación siempre estuvo ahí. Solo que tu radio nunca la había captado.\n\nAhora quiero que imaginen cómo se siente una relación en esa frecuencia.\n\nEs alguien que contesta sin hacerte esperar a propósito. Es alguien que dice «estoy aquí» y lo demuestra con hechos. Es alguien al lado de quien puedes estar en silencio... y el silencio no se siente como amenaza. Se siente como compañía.\n\nNo hay mariposas. Hay algo mejor. Hay tierra firme.")

    pdf.voice_instruction("[Silencio — 15 segundos]")

    pdf.dialogue("Ahora, lentamente, vuelvan a este espacio. Abran los ojos cuando estén listas. Muevan los dedos. Sientan sus pies en el piso.")

    pdf.voice_instruction("[Esperar que abran los ojos. No apurar.]")

    pdf.dialogue("Eso que acaban de sentir — esa calma que probablemente se sintió rara — eso es lo que vamos a aprender a reconocer. No va a ser de un día para otro. Pero ya la sintieron una vez. Y eso es todo lo que necesitamos.")

    # ═══════════════════════════════════════════
    # BLOQUE 5
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.gold_heading('BLOQUE 5: EL ANCLA — Cierre (15 min)')

    pdf.gold_heading("Proyección visual de futuro (5 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Cinematográfica. No motivacional. Que lo puedan VER en su mente.]")

    pdf.dialogue("Imaginen que pasan 6 meses. Seis meses desde hoy.\n\nTe levantas un sábado. No hay ansiedad en el pecho. No hay teléfono que revisar antes de abrir los ojos. Te levantas... y simplemente te levantas.\n\nTe haces un café. No porque necesites distraerte del dolor. Sino porque te gusta el café. Así de simple. Así de normal. Así de hermoso.\n\nSales a caminar. Y mientras caminas, no estás pensando en él. No estás repasando la última conversación. Estás caminando. Sintiendo el sol. Oyendo los pájaros. Presente. Ahí. En tu vida.\n\nY de pronto te das cuenta de algo: el silencio ya no te asusta. El silencio se siente como compañía. Como ese espacio que antes estaba lleno de estática... ahora tiene música. Una melodía que solo tú puedes escuchar. Suave. Tuya.\n\nY sonríes. No porque todo esté perfecto. Sino porque por primera vez en mucho tiempo, estás en paz con lo que es.")

    pdf.gold_heading("Cierre con metáfora (3 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Firme pero cálida. Como un ancla.]")

    pdf.dialogue("Hoy no te pido que cambies de frecuencia de golpe. No funciona así. Tu radio lleva años en esa estática. No se recalibra en dos horas.\n\nLo que sí te pido es esto: que reconozcas que hay otras estaciones. Que la música limpia existe. Que la paz no es aburrimiento — es lo que tu cuerpo merece sentir después de tanto ruido.\n\nHoy escuchaste una melodía nueva. Quizás por un segundo. Quizás por un minuto. Pero la escuchaste. Y eso es suficiente para hoy.")

    pdf.gold_heading("Ejercicio para casa (2 min)", level=2)

    pdf.info_box("TAREA DE LA SEMANA\n\nCada vez que sientas la urgencia — de contactar, de stalkear, de revisar su perfil, de releer mensajes viejos — para. Respira. Y pregúntate:\n\n«¿Estoy buscando conexión... o estoy buscando la estática?»\n\nNo te juzgues por la respuesta. Solo nómbrala. Porque nombrar es el primer paso para soltar.")

    pdf.gold_heading("CTA al siguiente taller (2 min)", level=2)
    pdf.dialogue("Lo que hicimos hoy fue abrir una puerta. Entendieron que su radio está descalibrada. Entendieron de dónde viene. Sintieron por un momento cómo suena otra frecuencia.\n\nEn el próximo taller vamos a ir más profundo. Vamos a trabajar directamente con esa niña que aprendió a escuchar la estática. Vamos a entender qué necesita para soltar. Y vamos a darle herramientas concretas.\n\nSi hoy sentiste algo, si algo de lo que dijimos te movió, no dejes que ese movimiento se apague. Nos vemos en la próxima sesión.")

    pdf.gold_heading("Mantra final + despedida (1 min)", level=2)
    pdf.voice_instruction("[INSTRUCCIÓN DE VOZ: Lento. Con peso. Como quien graba algo en piedra.]")

    pdf.dialogue("Antes de irme, quiero que repitan algo conmigo. En voz alta si pueden. En silencio si no.")

    pdf.quote_box("Merezco una frecuencia que no me lastime.\nMerezco una frecuencia que no me lastime.\nMEREZCO UNA FRECUENCIA QUE NO ME LASTIME.")

    pdf.dialogue("Gracias por estar aquí. Lo que hicieron hoy — quedarse, sentir, escribir, escuchar — requiere un coraje que todavía no se reconocen. Pero yo lo veo. Y quiero que sepan: la frecuencia que merecen existe. Y ya la están buscando.\n\nCuídense. Nos vemos pronto.")

    # ═══════════════════════════════════════════
    # NOTAS PARA EL PSICÓLOGO
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.gold_heading("NOTAS PARA EL PSICÓLOGO")

    pdf.gold_heading("Manejo emocional", level=2)

    pdf.bold_text("Si alguien llora:")
    pdf.bullet("No detener. Decir: «Tus lágrimas son bienvenidas aquí»")
    pdf.bullet("Si es muy intenso: «¿Necesitas un momento? Puedes apagar tu cámara y respirar»")
    pdf.bullet("Ofrecer el ejercicio de grounding de apertura")

    pdf.bold_text("Si alguien se desregula (temblor, respiración agitada, disociación):")
    pdf.bullet("Guiar grounding grupal: «Vamos todas a poner los pies en el piso...»")
    pdf.bullet("Si es individual: «¿Puedes decirme 3 cosas que ves a tu alrededor?»")
    pdf.bullet("Si no responde: escribir en privado por chat")

    pdf.bold_text("Si alguien revela abuso activo o ideación suicida:")
    pdf.bullet("No ignorar. Decir: «Gracias por confiar en este espacio»")
    pdf.bullet("Después de la sesión, contactar en privado")
    pdf.bullet("Proporcionar línea de crisis del país correspondiente")

    pdf.gold_heading("Manejo de grupo", level=2)

    pdf.bold_text("Si hay mucho silencio:")
    pdf.bullet("Reformular la pregunta con ejemplo personal")
    pdf.bullet("Pasar a preguntas de chat")
    pdf.bullet("Recordar: el silencio después de una pregunta fuerte es procesamiento")

    pdf.bold_text("Si alguien monopoliza:")
    pdf.bullet("«Gracias por compartir, [nombre]. ¿Alguien más quiere aportar?»")

    pdf.bold_text("Si alguien dice «pero yo lo sigo amando»:")
    pdf.bullet("NO invalidar. Decir: «Lo que sientes es real. Y lo que vamos a descubrir juntas es QUÉ parte de ti lo siente y POR QUÉ.»")

    pdf.gold_heading("Buffer de tiempos", level=2)
    pdf.body_text("Si algún bloque se extiende, reducir Bloque 4 (compartir menos personas) o Bloque 5 (acortar proyección de futuro).")

    pdf.gold_heading("Recursos de emergencia", level=2)
    pdf.bullet("Línea de violencia de género: [según país — personalizar antes del taller]")
    pdf.bullet("Línea de crisis emocional: [según país]")
    pdf.bullet("Si estás en peligro físico: llamar al número de emergencias local")

    # Guardar
    path = os.path.join(OUTPUT_DIR, "taller_completo_instructor.pdf")
    pdf.output(path)
    print(f"PDF generado: {path}")
    return path


# ═══════════════════════════════════════════════════════
# PDF 2: CUADERNO DE PARTICIPANTE
# ═══════════════════════════════════════════════════════
def generate_participant_pdf():
    pdf = TallerPDF()

    # --- PORTADA ---
    pdf.cover_page(
        "LA SEÑAL DE RADIO",
        "Cuaderno de Participante",
        [
            "Taller Vivencial  |  Apego Detox",
            "",
            "Historias de la Mente",
            "Psicólogo especialista",
        ]
    )

    # --- PÁGINA 1: BIENVENIDA + ANTES DE EMPEZAR ---
    pdf.add_page()
    pdf.gold_heading("BIENVENIDA")
    pdf.body_text("Este cuaderno es tuyo. Es un espacio privado para escribir lo que necesites durante el taller. No hay respuestas correctas o incorrectas. No lo va a leer nadie más que tú. Escribe sin filtro, sin corregir, sin censurar. Aquí no hay juicio.")

    pdf.separator()

    pdf.gold_heading("ANTES DE EMPEZAR", level=2)
    pdf.quote_box("Respira. Estás aquí. Eso ya es un acto de valentía.\n\nPon una mano en el pecho. Siente tu corazón. Sigue latiendo. A pesar de todo lo que has pasado, sigue ahí.")

    pdf.separator()

    pdf.gold_heading("REFLEXIÓN DE APERTURA", level=2)
    pdf.quote_box("¿Cuántas veces dejaste ir algo bueno porque no te hacía sentir esas «mariposas»?")
    pdf.ln(3)
    pdf.body_text("Escribe lo que venga. Sin pensar mucho:")
    pdf.write_lines(5)

    # --- PÁGINA 2: LO QUE APRENDÍ ---
    pdf.add_page()
    pdf.gold_heading("LO QUE APRENDÍ HOY")

    pdf.gold_heading("Intensidad vs. Intimidad", level=2)
    pdf.body_text('Las "mariposas" no siempre son amor. A veces son cortisol — la hormona del estrés.')

    pdf.simple_table(
        ["Lo que sientes", "Lo que crees", "Lo que realmente es"],
        [
            ["Mariposas", "Amor, química", "Cortisol + adrenalina"],
            ["Calma, tranquilidad", "Aburrimiento", "Oxitocina + serotonina"],
            ["Ansiedad si no contesta", "Lo amas mucho", "Sistema nervioso en alerta"],
            ["Alivio cuando contesta", "Amor", "Dopamina de supervivencia"],
        ],
        col_widths=[50, 55, 55]
    )

    pdf.quote_box("Las relaciones sanas no se sienten como una montaña rusa. Se sienten como tierra firme. Y si la tierra firme te parece aburrida, no es porque sea aburrida — es porque tu sistema nervioso está adicto a la turbulencia.")

    pdf.gold_heading("La Señal de Radio", level=2)
    pdf.body_text("Tu forma de amar se calibró en tu infancia. Dependiendo de cómo fue el amor en tu casa, tu «radio interna» se quedó sintonizada en una frecuencia.")

    pdf.info_box("ESTACIÓN RUIDOSA = Relaciones intensas, intermitentes, ansiosas\n\nESTACIÓN CLARA = Relaciones estables, consistentes, seguras\n\nSi toda tu vida escuchaste estática, la música limpia te parece «aburrida». No es que sea aburrida. Es que tu radio no la reconoce.\n\nLA BUENA NOTICIA: La radio se puede recalibrar.")

    pdf.gold_heading("El Apego Ansioso", level=2)
    pdf.bold_text("No es que ames más que los demás. Es que temes más.")

    pdf.gold_heading("De dónde viene:", level=3)
    pdf.body_text("Un cuidador que a veces estaba y a veces no. Amor inconsistente. La niña aprendió: «Si grito más fuerte, quizá viene.»")

    pdf.gold_heading("Cómo se ve en adulta:", level=3)
    pdf.bullet("Necesidad constante de validación")
    pdf.bullet("Terror al abandono")
    pdf.bullet("Monitorear todo (mensajes, redes, última conexión)")
    pdf.bullet("Dar todo esperando recibir migajas")
    pdf.bullet("Confundir estar pendiente con estar presente")

    pdf.gold_heading("La cadena del pensamiento:", level=3)
    pdf.info_box("No contesta en 5 min\n→ «No me quiere»\n→ «Me va a dejar»\n→ «Voy a estar sola»\n→ «No valgo nada»\n\n5 minutos. 4 pensamientos. Ninguno es la realidad.")

    pdf.gold_heading("La herramienta (Defusión):", level=3)
    pdf.body_text("En vez de «Soy demasiado», practica decir:")
    pdf.quote_box("«Estoy teniendo el pensamiento de que soy demasiado.»\n\nEsa distancia entre tú y el pensamiento es tu libertad.")

    # --- PÁGINA 3: EJERCICIOS ---
    pdf.add_page()
    pdf.gold_heading("EJERCICIO 1: CARTA A LA ESTACIÓN RUIDOSA")
    pdf.body_text("No le escribes a él. Le escribes al PATRÓN. A esa frecuencia que te mantuvo enganchada.")

    pdf.quote_box("Querida estática...\nTe conozco desde que era niña.\nFuiste lo primero que mi radio captó.\nY durante mucho tiempo creí que eras música.")

    pdf.ln(3)
    pdf.bold_text("Sigue tú:")
    pdf.write_lines(18)

    pdf.add_page()
    pdf.gold_heading("EJERCICIO 2: MI DETECTOR DE FRECUENCIAS")
    pdf.body_text("Tres momentos «intensos» que viví con él:")

    pdf.bold_text("1.")
    pdf.write_lines(2)
    pdf.bold_text("2.")
    pdf.write_lines(2)
    pdf.bold_text("3.")
    pdf.write_lines(2)

    pdf.ln(3)
    pdf.bold_text("Ahora pregúntate por cada uno: ¿eso era conexión o era cortisol?")
    pdf.ln(3)
    pdf.bold_text("1.")
    pdf.write_lines(2)
    pdf.bold_text("2.")
    pdf.write_lines(2)
    pdf.bold_text("3.")
    pdf.write_lines(2)

    # --- PÁGINA 4: HERRAMIENTA PARA CASA ---
    pdf.add_page()
    pdf.gold_heading("HERRAMIENTA PARA LLEVAR A CASA")

    pdf.gold_heading("El Detector de Frecuencias", level=2)
    pdf.body_text("Esta semana, cada vez que sientas la urgencia de contactar, stalkear, o releer mensajes viejos, completa este registro:")

    pdf.simple_table(
        ["Fecha/Hora", "¿Qué sentí?", "¿Qué hice?", "¿Conexión o estática?"],
        [
            ["", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
            ["", "", "", ""],
        ],
        col_widths=[35, 45, 45, 45]
    )

    pdf.info_box("No te juzgues por la respuesta. Solo nómbrala.\nNombrar es el primer paso para soltar.")

    pdf.separator()

    pdf.gold_heading("FRASES PARA RECORDAR")

    pdf.quote_box("No sientes más. Temes más. Y confundes el miedo con profundidad.")
    pdf.quote_box("Estar pendiente no es lo mismo que estar presente.")
    pdf.quote_box("Esa calma que se siente rara no es vacío. Es tu cuerpo aprendiendo a leer la seguridad.")
    pdf.quote_box("Tu radio lleva años en estática. No se recalibra en un día. Pero cada vez que reconoces la estática, giras la perilla un milímetro.")
    pdf.quote_box("Merezco una frecuencia que no me lastime.")

    pdf.separator()

    pdf.gold_heading("MI COMPROMISO DE ESTA SEMANA")
    pdf.body_text("Escribe una cosa — solo una — que vas a hacer diferente esta semana:")
    pdf.write_lines(4)

    pdf.separator()

    # Cierre
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(*MEDIUM_GRAY)
    pdf.cell(0, 6, "Historias de la Mente  |  Apego Detox", align="C")
    pdf.ln(5)
    pdf.cell(0, 6, "Psicólogo especialista", align="C")
    pdf.ln(5)
    pdf.cell(0, 5, "Este material es para uso personal de la participante. No distribuir.", align="C")

    # Guardar
    path = os.path.join(OUTPUT_DIR, "cuaderno_participante.pdf")
    pdf.output(path)
    print(f"PDF generado: {path}")
    return path


# ═══════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════
if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generate_instructor_pdf()
    generate_participant_pdf()
    print("\nOK - Los 2 PDFs fueron generados exitosamente.")
    print(f"  Ubicación: {OUTPUT_DIR}")
