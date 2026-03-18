# Sistema de Talleres v2 — Guia de Uso
## Historias de la Mente

---

## FUENTE MAESTRA

**CLAUDE.md** (en la raiz del proyecto) contiene la guia completa del sistema:
- Estructura obligatoria de 5 fases (90 minutos)
- Reglas de tono y voz de Javier
- Banco de metaforas por categoria (A/B/C/D)
- Tabla de traduccion ciencia -> lenguaje emocional
- Protocolo de crisis
- Formato de los 3 documentos de entrega
- Banco de talleres completados

**Todo agente debe leer CLAUDE.md antes de generar contenido.**

---

## Que cambio (v1 → v2)

| v1 (17 agentes) | v2 (7 agentes) |
|-----------------|-----------------|
| Agentes genericos que no leian los documentos | Agente Investigador que LEE los PDFs reales |
| Estructura formulaica (bienvenida → grounding → teoria → ejercicio → cierre) | Estructura de 3 partes narrativas como los talleres reales |
| Contenido generico y repetitivo | Contenido extraido de 738 paginas de base de conocimiento |
| Sin vinetas clinicas | Minimo 4 vinetas clinicas por taller |
| Talleres de 3-5 paginas | Talleres de 12-15 paginas |
| Metaforas superficiales | Metafora central desarrollada en todo el taller |

## Los 8 agentes

| # | Agente | Que hace |
|---|--------|----------|
| 01 | Director | Recibe tema, ofrece opciones, coordina pipeline |
| 02 | Investigador | LEE los PDFs con leer_pdf.py, extrae contenido real |
| 03 | Arquitecto | Disena esqueleto de 5 fases con arco emocional (ver CLAUDE.md) |
| 04 | Escritor | Escribe el taller de 12-15 paginas al nivel de los existentes |
| **04b** | **Alquimista Emocional** | **Transforma el taller: quita la bata blanca, pone microcuentos, metaforas corporales, dialogos internos y preguntas-grieta. Convierte ciencia en piel** |
| 05 | Vinetas | Genera 4-6 vinetas clinicas realistas |
| 06 | Interaccion | Disena ejercicios en vivo y preguntas de discusion para Meet |
| 07 | Cuaderno | Genera el cuaderno de participante (PDF separado) |

## Herramientas

```bash
# Leer un PDF completo
python herramientas/leer_pdf.py "APEGO/DOC8_Vinculacion_Traumatica_Trauma_Bond.pdf"

# Leer paginas especificas
python herramientas/leer_pdf.py "talleres_apego/taller1_trauma_bonding.pdf" 3 7

# Buscar un termino en las 738 paginas
python herramientas/leer_pdf.py --buscar "ventana de tolerancia"

# Ver indice completo
python herramientas/leer_pdf.py --indice
```

## Pipeline

```
1. Usuaria: "Quiero taller sobre [TEMA]"
2. Director ofrece opciones (enfoque, documentos, metafora)
3. Usuaria elige
4. Investigador lee los documentos reales → genera Brief
5. Arquitecto disena esqueleto de 5 fases (Historia/Espejo/Quiebre/Grieta/Ancla)
6. Escritor escribe 12-15 paginas
6b. Alquimista Emocional transforma el tono: microcuentos, metaforas corporales, dialogos internos, preguntas-grieta
7. Vinetas genera vinetas clinicas → se insertan
8. Interaccion genera ejercicios y preguntas → se insertan
9. Cuaderno genera PDF de participante
10. Resultado: 2 archivos .md listos para PDF
```

## Base de conocimiento (769 paginas)

| Carpeta | Archivos | Paginas | Contenido |
|---------|----------|---------|-----------|
| APEGO | 12 | 153 | Teoria del apego, neurociencia, trauma bond, cuerpo, espiritualidad |
| LA NINA INTERIOR | 15 + libro | 378 | Heridas, reparentalizacion, tecnicas, programa 12 semanas |
| NARCICISMO | 9 | 96 | Freud, Jung, Kernberg, tipos clinicos, relaciones, cultura |
| RECUPERACION | 4 | 41 | Identidad, autoestima, nueva vida, relaciones sanas |
| talleres_apego | 5 | 70 | LOS 5 TALLERES MODELO — estandar de calidad |
| **tono-emocional** | **3** | **31** | **LA VOZ DE JAVIER EN LIVES — estandar de tono emocional. Scripts de voiceover reales con el tono visceral, directo, confrontativo y amoroso que debe tener cada taller. LECTURA OBLIGATORIA para el Alquimista Emocional** |

## 5 talleres existentes (el estandar)

| # | Taller | Metafora central | Estructura |
|---|--------|-----------------|------------|
| 1 | Trauma bonding | El iman roto | 3 partes: explicacion → cuerpo → herramientas |
| 2 | Regulacion interna | Los 3 pisos del sistema nervioso | 3 partes: psicoeducacion → tecnicas somaticas → plan |
| 3 | Partes internas | El comite interno (IFS) | 3 partes: metaforas de partes → dialogo → integracion |
| 4 | Limites, duelo, recaidas | El desmonte | 3 partes: psicoeducacion → limites → plan recaidas |
| 5 | Vision y futuro | El viaje | 3 partes: revision → diseno de vida → cierre del programa |

## Ideas de talleres NUEVOS

Talleres que NO existen y se generan cruzando documentos:

| Taller nuevo | Fuentes |
|-------------|---------|
| Por que repito el patron | APEGO/DOC4 + DOC6 + NINA/Doc4 |
| La sombra del amor (Jung) | APEGO/DOC5 + DOC7 + NARCICISMO/Doc3 |
| El narcisista que no parecia narcisista | NARCICISMO/Doc6 + Doc9 |
| Pensar lo que sientes (mentalizacion) | APEGO/DOC10 + NINA/Doc10 |
| El perdon que no traiciona | APEGO/DOC12 + NINA/Doc13 + NARCICISMO/Doc4 |
| Los 18 lentes rotos (esquemas de Young) | APEGO/DOC4 + NINA/Doc6 |
| Ser la madre que no tuviste | NINA/Doc7 + Doc2 + RECUPERACION/DOC1 |
| Esto si soy yo (identidad) | RECUPERACION/DOC1 + DOC2 + NINA/Doc14 |
| Tus partes en la recaida | taller3 + NINA/Doc12 + taller4 |
| Amor o trauma disfrazado | APEGO/DOC7 + DOC8 + NARCICISMO/Doc9 |
| El mapa de tu herida | NINA/Doc6 + Doc3 + APEGO/DOC6 |
| El cuerpo como hogar | APEGO/DOC11 + NINA/Doc9 + taller2 |

## Donde se guarda todo

```
tallerespecial/
├── agentes_v2/          ← 7 agentes + esta guia
│   ├── 01_director.md
│   ├── 02_investigador.md
│   ├── 03_arquitecto.md
│   ├── 04_escritor.md
│   ├── 04b_alquimista_emocional.md
│   ├── 05_vinetas.md
│   ├── 06_interaccion.md
│   ├── 07_cuaderno.md
│   └── GUIA_USO.md
├── herramientas/        ← script para leer PDFs
│   └── leer_pdf.py
├── salida_talleres/     ← talleres generados
│   └── taller_[tema]_[fecha]/
│       ├── taller_completo.md
│       └── cuaderno_participante.md
└── agentes/             ← version anterior (v1, se puede archivar)
```
