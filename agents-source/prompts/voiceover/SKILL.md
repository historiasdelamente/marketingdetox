---
name: voiceover-psicologico
description: "Genera guiones de voiceover psicológico de alto impacto emocional para lives diarios. Activar cuando el usuario pida: voiceover, guión para live, script psicológico, contenido de narcisismo, apego, trauma, TEPT, sanación emocional, o cualquier pedido de guión de contenido psicológico para redes sociales."
argument-hint: "[número de tema 1-45 O tema libre en lenguaje natural]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Voiceover Psicológico

> Generar voiceover: $ARGUMENTS

Generador de guiones de voiceover en **3 partes de ~12,500 caracteres cada una** (37,500 caracteres totales) con estilo fusión **Marian Rojas Estapé + Walter Riso**.

**Audiencia objetivo:** Mujeres que atraviesan abuso narcisista, vínculo traumático, problemas de apego, TEPT, y procesos de sanación emocional.

**Tono:** Una amiga psicóloga que te dice la verdad con amor.

---

## Base de conocimiento

Antes de generar cualquier voiceover, el agente puede consultar los PDFs de:
```
../base_conocimiento/
├── APEGO/               ← 12 PDFs (estilos, trauma bond, amor romántico, somática)
├── NARCICISMO/          ← 9 PDFs (Freud, Kohut, Jung, DSM-5, tipos clínicos)
├── LA NIÑA INTERIOR/    ← 16 PDFs + libro (heridas, reparentalización, límites)
├── RECUPERACION DESPUES DEL ABUSO/ ← 3 PDFs (identidad, autoestima, nueva vida)
└── talleres_apego/      ← 5 PDFs (trauma bonding, regulación, partes, duelo, futuro)
```

Usar los PDFs relevantes al tema para incluir conceptos clínicos reales, no genéricos.

Adicionalmente, para técnicas validadas y metáforas terapéuticas:
→ content/BASE-CONOCIMIENTO-TALLERES.md (índice de 224+ técnicas)
→ content/research-terapias-tercera-generacion.md (ACT, DBT, CFT, MBCT)
→ content/research-metaforas-tecnicas-somaticas.md (metáforas, IFS, Gestalt, Polyvagal)
→ content/research-trauma-recovery-narcissistic-abuse-techniques.md (narcisismo, C-PTSD)
→ content/research-tecnicas-corporales-transformacionales.md (técnicas corporales)

---

## Temas Disponibles

| # | Tema |
|---|------|
| 1 | Cómo Detectar a un Narcisista |
| 2 | El Vínculo Traumático: Por Qué Vuelves |
| 3 | Apego Ansioso y Narcisismo |
| 4 | TEPT Complejo en Relaciones |
| 5 | La Niña Interior Herida |
| 6 | Personas Vitamina vs Personas Tóxicas |
| 7 | Gaslighting: La Manipulación Invisible |
| 8 | Love Bombing: La Trampa del Amor Perfecto |
| 9 | Codependencia Emocional |
| 10 | El Ciclo del Abuso Narcisista |
| 11 | Desintoxicación Emocional |
| 12 | La Dependencia Emocional: Amar o Depender |
| 13 | Reconstruir la Autoestima Después del Abuso |
| 14 | Reparentalización: Ser Tu Propia Madre |
| 15 | Contacto Cero: El Acto de Amor Propio Más Difícil |
| 16 | Las 5 Heridas de la Infancia |
| 17 | Apego Evitativo y Miedo a la Intimidad |
| 18 | El Perfeccionismo Como Herida |
| 19 | El Hoovering: Cuando el Narcisista Regresa |
| 20 | Trauma Intergeneracional |
| 21 | Flying Monkeys y Triangulación |
| 22 | El Duelo por la Relación que Nunca Existió |
| 23 | Límites Sanos: El Acto de Amor Propio |
| 24 | La Disonancia Cognitiva en el Abuso |
| 25 | Narcisismo Encubierto vs Abierto |
| 26 | Síndrome de Estocolmo en Relaciones |
| 27 | La Cortisol Addiction en Relaciones Tóxicas |
| 28 | Etapas de la Recuperación del Trauma |
| 29 | Ansiedad de Separación en Adultos |
| 30 | La Regulación del Sistema Nervioso |
| 31 | Madres Narcisistas: La Herida que Nadie Nombra |
| 32 | La Bioquímica de la Adicción: Por Qué Tu Cuerpo No Te Deja Soltar |
| 33 | La Vergüenza: El Combustible Oculto del Abuso |
| 34 | Trauma Intergeneracional: Lo Que Tu Abuela No Pudo Sanar |
| 35 | Co-parentalidad con un Narcisista |
| 36 | La Nueva Supply: Cuando Lo Ves "Feliz" con Otra |
| 37 | Cuando Lo "Normal" Se Siente Aburrido: El Amor Sano Después del Abuso |

---

## Cómo Usar Este Skill

### Opción A: Tema del Banco (número 1-45)
```
/voiceover-psicologico 7
```
Genera el voiceover del tema 7 (Gaslighting) usando su ángulo, hook y arco emocional predefinido.

### Opción B: Tema Libre
```
/voiceover-psicologico El síndrome de la buena chica
```
Genera un voiceover sobre un tema personalizado, siguiendo la misma estructura y estilo.

### Opción C: Sin Argumento
```
/voiceover-psicologico
```
Muestra la tabla de temas y pregunta al usuario cuál quiere generar.

---

## Proceso de Generación

Seguir estos pasos EN ORDEN. No saltar ningún paso.

### Paso 1: Cargar Referencia de Estilo
```
Leer: ${CLAUDE_SKILL_DIR}/references/style-guide.md
```
Absorber las reglas de fusión Marian + Riso, el ratio 60/40, los patrones de alternancia, la voz del narrador, y las palabras prohibidas/permitidas.

### Paso 2: Cargar Estructura
```
Leer: ${CLAUDE_SKILL_DIR}/references/voiceover-structure.md
```
Absorber el template de 3 partes, la distribución de caracteres por sección, los tipos de gancho, oleadas emocionales, y el checklist de calidad.

### Paso 3: Cargar Técnicas Emocionales
```
Leer: ${CLAUDE_SKILL_DIR}/references/emotional-techniques.md
```
Absorber los ganchos disponibles, transiciones, metáforas, cierres, y el sistema de variabilidad.

### Paso 4: Cargar Tema (si es numerado)
```
Leer: ${CLAUDE_SKILL_DIR}/references/topic-bank.md
```
Buscar el tema por número. Usar su ángulo, conceptos clave, dirección del hook, arco emocional, y temas relacionados como guía.

---

### Paso 5: Generar Parte 1
Escribir **PARTE 1: GANCHO + SETUP EMOCIONAL** (~12,500 caracteres).

### Paso 5.1: AGENTE ORTOGRÁFICO — Parte 1
Revisar TODO el texto generado y corregir:
- **Tildes**: corazón, emoción, relación, también, después, través, según, más, está, aquí, así, difícil, fácil, psicológico, científico, bioquímica, etc.
- **Signos de apertura**: ¿pregunta? y ¡exclamación! — SIEMPRE incluir el signo de apertura
- **Puntuación**: comas antes de "pero", "sino", "aunque"; puntos en oraciones largas; dos puntos antes de enumeraciones
- **Concordancia**: género y número (la dolor → el dolor, las mujeres necesitan → correcto)
- **NO cambiar estilo ni tono** — solo corrección ortográfica y gramatical
- Llevar un conteo de correcciones realizadas para el reporte final

### Paso 5.2: AGENTE VERIFICADOR DE CARACTERES — Parte 1
Contar caracteres del contenido del voiceover (SIN metadata, SIN notas de producción).
- **Rango objetivo**: 12,000 - 13,000 caracteres (sweet spot)
- Si **< 11,000**: expandir secciones débiles — agregar más detalles sensoriales, ampliar la historia, agregar un concepto neurocientífico adicional, profundizar las oleadas emocionales
- Si **> 13,500**: comprimir sin perder esencia — eliminar repeticiones, fusionar párrafos redundantes, acortar transiciones
- Actualizar el campo **Caracteres** en la metadata con el conteo exacto final

### Paso 5.3: AGENTE REVISOR EMOCIONAL — Parte 1
Este es el agente MÁS IMPORTANTE. Aplicar los 5 tests de impacto emocional:

**TEST 1 — Escalofrío** (mínimo 2 momentos por parte):
- ¿Hay al menos 1 frase que genere nudo en la garganta?
- ¿Hay al menos 1 momento de "esa soy yo" (identificación visceral)?
- ¿Hay al menos 1 frase que dé ganas de compartir inmediatamente?
Si falta: REESCRIBIR las secciones débiles. Agregar detalles que golpeen. Usar el "tú" directo.

**TEST 2 — Especificidad** (lo genérico NO emociona):
- Reemplazar TODA descripción vaga por detalles sensoriales concretos
- "se sentía mal" → "sentía esa presión en el pecho que no la dejaba respirar, esa sensación de tener una piedra en el estómago que no se iba ni de día ni de noche"
- "él la trataba mal" → "él le revisaba el teléfono cada noche, le preguntaba con quién hablaba, por qué se tardó diez minutos más en el supermercado"
- Las historias DEBEN tener detalles que se vean, se oigan, se huelan, se sientan en el cuerpo

**TEST 3 — Oleada Emocional**:
- ¿Hay mínimo 2 ciclos de tensión → alivio?
- ¿La tensión SUBE progresivamente (no es plana)?
- ¿El alivio se siente GANADO, no regalado?
Si es plano: agregar un pico de confrontación (frase Riso) seguido de un abrazo neurocientífico (frase Marian)

**TEST 4 — Frases Memorables**:
- ¿Hay al menos 1 frase "tuiteable" (corta, potente, compartible, menos de 140 caracteres)?
- Ejemplo: "El amor que mereces no te hace llorar a las 3 de la mañana."
Si no hay: crear una. Debe ser de esas que alguien captura en screenshot y comparte.

**TEST 5 — Anti-Genericidad**:
- Eliminar TODA frase que suene a autoayuda genérica de Instagram
- Eliminar: "todo pasa por algo", "eres más fuerte de lo que crees", "mereces ser feliz"
- Cada frase debe sentirse como dicha por alguien que HA VIVIDO esto, no que lo leyó en un libro
- La voz debe sonar a amiga psicóloga que ha llorado contigo, no a póster motivacional
Si encuentra frases genéricas: REESCRIBIRLAS con sangre, con verdad, con especificidad

**Si el revisor encuentra deficiencias en CUALQUIER test**: reescribir las secciones débiles ANTES de guardar.

### Paso 5.4: Guardar Parte 1
Solo DESPUÉS de pasar los 3 agentes, guardar en archivo temporal:
```
output/voiceover-[tema-en-kebab-case]-parte-1.md
```

---

### Paso 6: Generar Parte 2
Escribir **PARTE 2: CONFRONTACIÓN + EXPLORACIÓN PROFUNDA** (~12,500 caracteres).

### Paso 6.1: AGENTE ORTOGRÁFICO — Parte 2
(Mismo protocolo que Paso 5.1)

### Paso 6.2: AGENTE VERIFICADOR DE CARACTERES — Parte 2
(Mismo protocolo que Paso 5.2)

### Paso 6.3: AGENTE REVISOR EMOCIONAL — Parte 2
(Mismos 5 tests que Paso 5.3)

**Adicional para Parte 2**: Verificar que la reconexión con Parte 1 NO es un resumen sino una reconexión emocional. El punto de giro al final DEBE sentirse como un antes y después — el momento donde la oyente dice "ya entendí".

### Paso 6.4: Guardar Parte 2
Solo DESPUÉS de pasar los 3 agentes:
```
output/voiceover-[tema-en-kebab-case]-parte-2.md
```

---

### Paso 7: Generar Parte 3
Escribir **PARTE 3: RESOLUCIÓN + LLAMADO A LA ACCIÓN** (~12,500 caracteres).

### Paso 7.1: AGENTE ORTOGRÁFICO — Parte 3
(Mismo protocolo que Paso 5.1)

### Paso 7.2: AGENTE VERIFICADOR DE CARACTERES — Parte 3
(Mismo protocolo que Paso 5.2)

### Paso 7.3: AGENTE REVISOR EMOCIONAL — Parte 3
(Mismos 5 tests que Paso 5.3)

**Adicional para Parte 3**:
- Las herramientas prácticas deben sentirse HACIBLES HOY, no teóricas
- La historia de transformación NO debe ser mágica — debe mostrar el proceso real con recaídas
- El cierre debe ser LA FRASE MÁS PODEROSA de todo el voiceover
- El callback al gancho de la Parte 1 debe cerrar el círculo emocional
- La última línea debe dejar a la oyente con ganas de actuar Y con ganas de volver mañana

### Paso 7.4: Guardar Parte 3
Solo DESPUÉS de pasar los 3 agentes:
```
output/voiceover-[tema-en-kebab-case]-parte-3.md
```

---

### Paso 8: Generar PDF Final
Ejecutar el script Python para combinar las 3 partes en un solo documento PDF formateado:
```bash
python "${CLAUDE_SKILL_DIR}/scripts/create_pdf.py" \
  "output/voiceover-[tema]-parte-1.md" \
  "output/voiceover-[tema]-parte-2.md" \
  "output/voiceover-[tema]-parte-3.md" \
  --tema "[Nombre del Tema]" \
  --output "output/voiceover-[tema-en-kebab-case].pdf"
```

Después de crear el PDF exitosamente, **eliminar los 3 archivos .md temporales**.

---

### Paso 9: Resumen Final + Reporte de Calidad
Mostrar al usuario:

**Resumen de Generación:**
- Tema generado
- Conteo de caracteres de cada parte (post-revisión)
- Duración estimada total (a 140 palabras/minuto)
- Ubicación del archivo PDF generado

**Reporte Ortográfico:**
- Cantidad de correcciones realizadas por parte

**Reporte de Caracteres:**
- Conteo final por parte y si se ajustó (expandió/comprimió)

**Reporte Emocional:**
- Cuántos "momentos escalofrío" tiene cada parte
- Las 3 frases más potentes de todo el voiceover (las que harían que alguien tome screenshot)
- Puntuación emocional general: 1-5 (5 = masterpiece, 3 = bueno, 1 = hay que rehacer)

---

## Reglas Inquebrantables

### Contenido
- SIEMPRE generar contenido 100% ORIGINAL — nunca copiar de fuentes existentes
- SIEMPRE escribir en español neutro latinoamericano (tuteo, no voseo ni usteo)
- SIEMPRE mantener el conteo entre 11,000 y 13,500 caracteres por parte
- SIEMPRE variar ganchos, historias y metáforas — consultar el sistema de rotación en emotional-techniques.md
- SIEMPRE incluir al menos 1 concepto neurocientífico por parte (explicado en lenguaje cotidiano)
- SIEMPRE incluir al menos 1 frase tipo Riso contundente por parte
- SIEMPRE incluir al menos 2 oleadas de tensión/alivio por parte

### Estilo
- SIEMPRE seguir el ratio Marian/Riso según el tipo de tema (ver calibración en style-guide.md)
- SIEMPRE mantener el tono "amiga psicóloga que te dice la verdad con amor"
- NUNCA usar positivismo tóxico ("todo pasa por algo", "eres fuerte", "solo piensa positivo")
- NUNCA culpar a la víctima — confrontar el patrón, no a la persona
- NUNCA diagnosticar — educar y acompañar ("existe un patrón llamado X" en vez de "eres X")
- NUNCA minimizar el dolor ("hay gente que está peor", "no es para tanto")
- NUNCA usar lenguaje clínico sin traducirlo inmediatamente al cotidiano

### Formato
- SIEMPRE generar cada parte por separado y guardarla en archivo antes de continuar
- SIEMPRE incluir metadata en cada archivo (tema, conteo de caracteres, duración estimada, hashtags, título sugerido)
- SIEMPRE incluir notas de producción al final (pausas, cambios de tono, momentos de énfasis)
- Los nombres de personajes en historias deben ser comunes y variados (Ana, Laura, Sofía, María, Camila, Valentina, etc.)
- Las historias son SIEMPRE ficticias/compuestas — nunca basadas en personas reales

### Calidad (3 Agentes)
- SIEMPRE pasar los 3 agentes (ortográfico, caracteres, emocional) por CADA parte antes de guardar
- El agente ortográfico corrige tildes, puntuación y concordancia sin tocar el estilo
- El agente de caracteres ajusta al rango 12,000-13,000
- El agente emocional aplica los 5 tests: escalofrío, especificidad, oleada, frases memorables, anti-genericidad
- Si CUALQUIER test falla, reescribir la sección débil antes de guardar
- El gancho de la Parte 1 DEBE enganchar en las primeras 3 frases — es lo más importante de todo el voiceover
- El cierre de la Parte 3 DEBE dejar una frase memorable que el oyente se lleve consigo

---

## Formato de Salida

### Archivos temporales (.md)
Cada parte se guarda primero como .md con este formato para que el script pueda procesarla:

```markdown
# [TÍTULO DEL VOICEOVER] - Parte [1|2|3]

**Tema:** [nombre del tema]
**Parte:** [1|2|3] de 3
**Caracteres:** [conteo exacto]
**Palabras:** [conteo exacto]
**Duración estimada:** [minutos] minutos
**Hashtags sugeridos:** #SanaciónEmocional #[tema1] #[tema2] #[tema3] #HistoriasDeLaMente
**Título sugerido para el live:** [título atractivo y emocional]

---

[CONTENIDO DEL VOICEOVER]

---

*Notas de producción:*
- [Indicaciones de pausa entre secciones]
- [Cambios de tono sugeridos: cálido → firme → esperanzador]
- [Momentos de énfasis especial]
- [Sugerencia de música de fondo si aplica]
```

### Documento final (.pdf)
El script `create_pdf.py` combina las 3 partes en un solo documento PDF con:
- Portada con título, tema, fecha, duración total y hashtags
- Cada parte con encabezado, metadata y contenido formateado
- Saltos de página entre partes
- Notas de producción al final de cada parte (itálica, gris)
- Tipografía legible, interlineado 1.5, márgenes amplios

El archivo final se guarda como: `output/voiceover-[tema-en-kebab-case].pdf`
