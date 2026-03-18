# Sistema Multi-Agente: Lanzamiento Apego Detox

## Arquitectura del sistema

```
ORQUESTADOR (CLAUDE.md)
    │
    ├── Agente DOLOR ──────────── dolor.md
    ├── Agente STORYTELLING ───── storytelling.md
    ├── Agente PRODUCTO ───────── producto.md
    ├── Agente CTA/CONVERSIÓN ── cta-conversion.md
    ├── Agente ESTRUCTURA/GUION  estructura-guion.md
    └── Agente NOTEBOOKML/SLIDES notebookml-slides.md
```

## Documentos de contexto (alimentan a todos los agentes)

```
producto-apego-detox.md   ← Fuente de verdad del producto (NUNCA inventar datos)
dolor-trauma-bonding.md   ← Enciclopedia emocional: 8 pilares del dolor
brand-voice.md            ← Voz de Javier (Walter Riso style)
clase-1-brief.md          ← Brief específico de la Clase 1
```

---

## Para empezar en Claude Code

### Paso 1: Crea la carpeta
```bash
mkdir apego-detox-agent
cd apego-detox-agent
```

### Paso 2: Copia todos estos archivos manteniendo la estructura

### Paso 3: Completa las secciones marcadas [COMPLETAR POR JAVIER]

**Prioridad de llenado:**

| Prioridad | Archivo | Qué completar |
|-----------|---------|---------------|
| 🔴 URGENTE | clase-1-brief.md | Duración del live, plataforma, fecha, rituales |
| 🔴 URGENTE | producto-apego-detox.md | ¿Bonos? ¿Garantía? ¿Cuántas alumnas? |
| 🟡 ALTA | brand-voice.md | Tus frases reales, muletillas, fragmentos de lives |
| 🟡 ALTA | dolor-trauma-bonding.md | Ordenar dolores por frecuencia, agregar faltantes |
| 🟢 MEDIA | storytelling.md | Tus historias reales y metáforas favoritas |

### Paso 4: Abre Claude Code
```bash
claude
```

### Paso 5: Pide la Clase 1
```
"Hazme el guión completo de la Clase 1"
```

El orquestador ejecuta el flujo:
DOLOR → STORYTELLING → PRODUCTO → CTA → ESTRUCTURA/GUION → SLIDES

---

## Otros prompts útiles

```
"Solo dame el mapa de dolor de la Clase 1"
"Genera las slides para la Clase 1"
"Ajusta el CTA del cierre, suena muy vendedor"
"Esto no suena como yo, hazlo más devastador"
"Dame 3 opciones de apertura para la Clase 1"
"¿Qué loop abro para la Clase 2?"
```

---

## Después de la Clase 1

Cuando estés listo para iterar:
- Crea `clase-2-brief.md` con el brief de la Clase 2
- Pide: "Hazme la Clase 2 continuando donde dejamos la Clase 1"
- El sistema recuerda el loop abierto y lo cierra en la Clase 2
