---
name: premium-live
description: "Genera una conferencia PREMIUM LIVE completa: (1) investigación EXTERNA verificada en literatura científica, (2) un documento de 2 horas para hablar de corrido con 14 movimientos, y (3) un deck de 8 láminas ilustradas a lápiz con prompts para Gemini/Nano Banana. Es el formato de conferencia presencial u online de Historias de la Mente — NO es /live-experto (TikTok), NO es un taller, NO es una clase. Activar cuando el usuario diga '/premium-live', 'hagamos un premium live', 'una conferencia de 2 horas sobre X', 'premium live de X', 'conferencia para presentar', o pida un documento largo con diapositivas para exponer. El usuario suele dar solo el tema."
---

# PREMIUM LIVE

> Formato propio de Historias de la Mente. Nació el 2026-08-15 con "Cómo se detecta al psicópata".
> Marca: Historias de la Mente · Javier Vieira, **Psicólogo Especialista**.

---

## 🔁 REGLA DE ORO — LEER ANTES DE ESCRIBIR NADA

Este directorio es la **única fuente de verdad** del formato. Antes de generar cualquier Premium Live:

1. Lee **`estilo-documento.md`** completo — el ADN de escritura del documento de 2 horas.
2. Lee **`estilo-laminas.md`** completo — el ADN visual de las 8 láminas.
3. Lee **`registro-premium-lives.md`** — qué temas y qué columnas vertebrales ya se usaron, para no repetir.

**Nunca generes de memoria.** Si el usuario cambia algo del formato, **actualiza primero estos
archivos** (con fecha) y después genera.

---

## QUÉ ENTREGA — SIEMPRE TRES ARCHIVOS

| # | Archivo | Ruta |
|---|---------|------|
| 1 | La investigación | `content/research-{tema}-{año}.md` |
| 2 | La conferencia de 2h | `output/{tema}-premium-live.md` |
| 3 | Las 8 láminas | `output/prompts-gemini-premium-live-{tema}.md` |

Y además: **indexar la investigación** como entrada nueva en `content/BASE-CONOCIMIENTO-TALLERES.md`,
y **anotar el tema** en `registro-premium-lives.md`.

Nombres en kebab-case, sin acentos, fechas ISO.

---

## EL FLUJO — 5 PASOS, SIN PREGUNTAR

### Paso 1 · Investigación EXTERNA

**Regla dura: se investiga por fuera, en literatura científica real (WebSearch/WebFetch). NO se arma
recombinando la base interna.** La base interna se usa después, solo para indexar lo nuevo.

Busca hasta tener, como mínimo:
- El **texto fundacional** del tema (quién lo describió primero y qué dijo).
- El **instrumento o modelo** con el que se mide hoy.
- **Un hallazgo de laboratorio que contradiga el sentido común** del nicho. Este es el corazón de la
  conferencia: sin él, el Premium Live es un resumen de internet.
- **Números de impacto en víctimas** (muestra, porcentajes, revista, año).
- **Lo que la evidencia NO sostiene** — la sección más importante para la credibilidad.

Escribe el research con: regla del documento · advertencia de encuadre · secciones temáticas ·
**SEMILLAS propias numeradas** (derivaciones del canal, declaradas como pensamiento nuestro, jamás
como hallazgo científico) · sección "lo que la evidencia NO sostiene" · índice de semillas · fuentes
con enlaces.

### Paso 2 · Elegir la columna vertebral

**No repitas la arquitectura de un Premium Live anterior** (mira el registro). La columna vertebral
**sale de la investigación**, no de una plantilla. Ejemplos:

- Las tres fases de un modelo publicado (evaluación → manipulación → abandono).
- Los sistemas que fallan, uno por bloque.
- El recorrido de un instrumento clínico, faceta por faceta.
- Un antes / un durante / un después medidos.

Regla: si el documento anterior contaba **la cronología de ella**, este cuenta **la operación de él**
—o al revés—. La estructura tiene que sentirse distinta desde el índice.

### Paso 3 · Escribir el documento de 2 horas

Sigue **`estilo-documento.md`** al pie de la letra. 14 movimientos en 3 bloques + apertura + cierre +
anexo de detectores + nota de manejo. ~10.000-11.000 palabras.

### Paso 4 · Escribir las 8 láminas

Sigue **`estilo-laminas.md`** al pie de la letra. **Siempre 8: 5 de conferencia + 3 de Apego Detox**,
en ese orden. Las 3 de Apego Detox son fijas (el camino · la compañía · la tribu) y solo se les
cambia el bloque de "mientras está proyectada, tú dices" para que enganche con el tema del día.

### Paso 5 · Archivar

- Entrada nueva en `content/BASE-CONOCIMIENTO-TALLERES.md` (numerada, con los datos citables).
- Línea nueva en `registro-premium-lives.md`.
- Avisar al usuario los tres archivos con rutas clicables.

---

## REGLAS DURAS DEL FORMATO

1. **Investigación externa, siempre.** Nunca recombinar la base interna para producir un Premium Live.
2. **Todo dato es citable al aire** con autor, año y revista. Lo que no está verificado no entra.
3. **Las derivaciones propias se declaran como SEMILLA** — pensamiento del canal, nunca hallazgo científico.
4. **Encuadre obligatorio al abrir y al cerrar:** el diagnóstico no se pone desde una silla. Se enseña
   a leer patrones, no a etiquetar personas. Nadie diagnostica a una expareja ni al aire.
5. **Nunca decir:** "no sienten nada" · "se les ve en la cara" · "eso se cura con amor" · ningún
   pronóstico sobre una persona concreta · ningún diagnóstico a distancia.
6. **Nunca negar la contingencia del abuso.** Prohibido "nada de lo que hacías servía". Lo que ella
   hacía **sí tenía efecto** — el problema es sobre qué actuaba (la máscara, no la persona).
7. **"Psicólogo Especialista"**, nunca "psicólogo clínico". **COLPSIC jamás aparece** en ningún output.
8. **Las 3 láminas finales son siempre Apego Detox**, en la paleta cálida reservada al cierre.
9. **Ortografía perfecta**, tildes incluidas, en documento y en láminas.

---

## LO QUE PREMIUM LIVE **NO** ES

| No confundir con | Diferencia |
|---|---|
| `/live-experto` | Ese es guion de TikTok de 2h, voz de hermana, sin diapositivas. Premium Live es conferencia con deck y con investigación citable. |
| Talleres | Los talleres son CERO teoría, todo vivencial. Premium Live **sí** lleva datos, porque su fuerza es la evidencia. |
| Clases de Apego Detox | Esas van dentro del programa. Premium Live es la puerta de entrada: termina vendiendo. |
| `/voiceover-psicologico` | Ese es texto para narrar en video corto. |

---

## PLANTILLA DE ARRANQUE

Cuando el usuario diga el tema, arranca sin preguntar:

```
PREMIUM LIVE — {tema}
1. Investigando por fuera (literatura externa)…
2. Columna vertebral elegida: {la que salga de la investigación, distinta a las del registro}
3. Documento de 2h — 14 movimientos
4. Deck de 8 láminas
5. Archivado en la base
```
