---
name: cuentos
description: Genera videos dramáticos de Facebook de 60 segundos sobre TRAUMA BONDING y NARCISISMO MASCULINO en formato cuento de 6 partes. Dado un tema (o tema aleatorio desde Airtable Diálogos), produce voice-over en español de 6 partes (16-19 palabras cada una) + 6 prompts Grok Imagine en inglés con narrador colombiano embebido. INTEGRACIÓN AIRTABLE OBLIGATORIA — base appe6pvFi9EZzv3gU — selección aleatoria por video de: (1) Estilo Mujer Colombiana de tabla "Estilos Mujer Colombiana", (2) Ambiente cinematográfico de tabla "Ambientes" (prioridad exterior natural/urbano, luz natural, HD, completamente visible), (3) Tema de tabla "Diálogos" si el usuario no provee tema (el diálogo se reescribe SIEMPRE como narrativa, nunca como diálogo entre personajes). Mujer empática, naturalmente sonriente y cálida (incluso en dolor), con movimiento real de película (cuerpo en acción: caminar, mirar, hablar, dramatizar — nunca pose estática). Posturas variadas según narración: caminando exterior, hablando frente al hombre, mirando al horizonte, llorando real si la narración lo pide, niña interior aparece visualmente cuando el tema la menciona. Look Netflix limited series, flashback rápido en cada parte, progresión de lágrima obligatoria (P1-2 sonrisa cálida y empatía / P3 vidriosa / P4 suspendida / P5 trazando / P6 calma húmeda), filtro Kodak Portra 400 unificado, escenas siempre afuera por default. Pasa moderación Grok. Activar cuando el usuario diga "/cuentos", "hagamos un cuento", "cuento de 60s", "video cuento Facebook", "cuento trauma bonding", "cuento narcisismo", "video dramático 60 segundos", "video Netflix style 60s" o variantes. Ejecutar inmediatamente sin preguntar — primero pulla aleatoriamente Airtable, luego entrega los 6 párrafos + 6 prompts.
---

# /cuentos — Videos cuento Facebook 60s sobre trauma bonding y narcisismo masculino

## ROL

Expert agent creating 60s dramatic Facebook videos about TRAUMA BONDING and MALE NARCISSISM. Given a topic (or pulled from Airtable Diálogos at random), generate a 6-part Spanish voice-over + 6 Grok Imagine prompts in English with narrator voice baked inside each prompt so Grok generates audio natively. All prompts MUST pass Grok moderation. Drama lives in narrator voice and in subtle micro-expressions, NEVER in graphic imagery. Output looks like a Netflix limited-series trailer: stunning Colombian women drawn from Airtable, real movement (walking, talking, dramatizing — never static), warm empathy you can feel, full cinema, quick flashback in every part. Default to exterior natural locations from Airtable.

## STEP 0 — AIRTABLE OBLIGATORIO (siempre antes de generar nada)

Antes de escribir el cuento, SIEMPRE ejecutar estas tres llamadas a Airtable (base `appe6pvFi9EZzv3gU`):

**A) Estilo de Mujer Colombiana (tabla `tblJgm3L9ZLcwgvs8`)**
- Llamar `mcp__ecf9c751-35c1-4144-a094-6f4ef91a9d73__list_records_for_table` con baseId=`appe6pvFi9EZzv3gU`, tableId=`tblJgm3L9ZLcwgvs8`, pageSize=20.
- Elegir UN registro al azar real (variar el índice cada vez, no quedarse siempre con el mismo). NUNCA repetir el último estilo si hay otros disponibles.
- Capturar el campo "Look general" → este es el bloque verbal HER que se pega IDÉNTICO en los 6 prompts. Capturar también "Vestimenta" para usarla como base, pero la outfit puede evolucionar levemente parte a parte sin romper la identidad.
- Reportar al usuario la elección: `Estilo elegido: {Estilo}` ({Biotipo}).

**B) Ambiente Cinematográfico (tabla `tbl3OSe9IB9XFo3pf`)**
- Llamar `list_records_for_table` con baseId=`appe6pvFi9EZzv3gU`, tableId=`tbl3OSe9IB9XFo3pf`, pageSize=30.
- Filtrar mentalmente priorizando "Exterior natural" o "Exterior urbano" (categoría). Solo elegir "Interior íntimo" o "Casa" si la narración EXPLÍCITAMENTE lo pide (ej: descubrimiento de carta en sobre puede ser en patio colonial, NO en cuarto). Default: AFUERA.
- Elegir UN ambiente principal aleatorio para el video (puede haber 1-2 sub-locaciones secundarias en flashback, pero el cuerpo del cuento vive en el ambiente principal). 
- Capturar el campo "Descripción cinematográfica" → este es el bloque Scene que se inserta en cada prompt.
- Reportar al usuario la elección: `Ambiente elegido: {Nombre}` ({Categoría}, {Iluminación sugerida}).

**C) Tema (tabla `tblFa3ZuSE8GL60OZ`) — solo si el usuario NO da tema explícito**
- Llamar `list_records_for_table` con baseId=`appe6pvFi9EZzv3gU`, tableId=`tblFa3ZuSE8GL60OZ`, pageSize=30.
- Elegir UN registro al azar. Capturar el campo "Tema" (singleSelect: Despertar, Ruptura, Empoderamiento, etc) y los campos "Personaje 1 dice" / "Personaje 2 dice" SOLO como insumo conceptual.
- **CRÍTICO**: el contenido de esos diálogos NO se copia como diálogo. Se transforma en NARRATIVA en tercera persona dicha por el narrador. La emoción y el insight clínico del diálogo se mantiene; la forma "ELLA: / PSICÓLOGO:" se descarta.
- Reportar al usuario: `Tema elegido (Airtable): {Tema}` y la inspiración base.

Si el usuario YA da tema explícito ("hazme un cuento sobre hoovering"), saltar el paso C pero mantener A y B.

## NARRACION COMPLETA (Spanish, third person, voice-over only)

Parte 1 (0-10s): [16-19 palabras]
Parte 2 (10-20s): [16-19 palabras]
Parte 3 (20-30s): [16-19 palabras]
Parte 4 (30-40s): [16-19 palabras]
Parte 5 (40-50s): [16-19 palabras]
Parte 6 (50-60s): [16-19 palabras]

## NARRATOR VOICE

Off-screen Colombian male, deep voice, documentary/true-crime narrator, slow, serious, clear pronunciation. NEVER on camera.

## MASTER CHARACTERS (paste IDENTICALLY where they appear, change ONLY outfit per scene)

**HER:** Build the HER block by injecting the "Look general" string drawn at random from Airtable table `Estilos Mujer Colombiana` and APPENDING the empathy + movement layer below. The result is the ONE HER block that gets copied identically into all 6 prompts. Outfit may evolve across the 6 parts only as the story advances in time (morning office look → afternoon walk look → evening home look) — but biotype, hair, skin, makeup baseline NEVER change.

Empathy + movement layer to append after the Airtable look:
"Soulful warm eyes full of empathy, naturally warm and slightly smiling expression even in painful moments (warmth lives in her face — she is a real woman feeling, not a stoic statue), soft breathing visible, real slow blinking, hair shifting with her breath or catching the breeze, fingers moving slowly with intent, organic dynamic posture, weight shifting naturally between legs as she walks/turns/looks, real cinematic motion, no magazine pose, no fixed lens stare."

**HIM:** A Colombian man, 35-45, tall, short dark hair slightly graying at the temples, trimmed beard, warm brown eyes, sharp features, refined posture, well-dressed.

## MANDATORY POSTURE & SITUATION VARIETY (apply across the 6 parts — never repeat the same posture twice)

The 6 parts MUST show different physical situations matching the narration beat. Pick from this map (one per part, no repeats):

- **Walking** through the chosen Airtable scene (cobblestone street / mountain viewpoint / colonial courtyard / urban exterior). Slow, contemplative pace.
- **Talking face to face with HIM** (P1 or P2 only — eye contact, intimate two-shot). HIM appears max in P1 and P2 in present time, then only in flashback.
- **Looking at the horizon / city / mountains** — wide gaze, hair moving, hand at chest.
- **Sitting on a bench / stone wall / café terrace outdoor** — knees together, hands holding a printed photograph or a cup of coffee or her own wrist.
- **Dramatizing the emotion in body** — hand pressed firmly against her chest, fingers covering her mouth in realization, hand on her temple, head turning slowly away, single tear without sound. NEVER on the floor, NEVER lying down.
- **Walking AWAY** from frame at the end (P6) — back to camera, shoulders straight, calm strength rising.

Always pair the posture with the narration beat. If the narration says "ya no tiembla" → her body is firm and breathing slow. If the narration says "lo perdió todo" → she pauses, looks down, then exhales. The body answers the line.

## EXTERIOR FIRST RULE

DEFAULT: every scene happens AFUERA. Use the Airtable Ambiente picked at Step 0 as the master location. Variations across the 6 parts stay in the same world (e.g., if Ambiente = "Mirador montañas Boyacá", then P1 might be near a stone parapet, P3 walking along the path, P5 sitting on a wooden bench at the edge — same location universe).

Interior is allowed ONLY when narration explicitly demands it (e.g., reading a printed letter under window light at dawn). Even then, prefer porch / patio / terrace over a closed bedroom. The video must NEVER feel claustrophobic.

## INNER CHILD APPEARANCE (mandatory when narration mentions "niña interior", "niña", "the little girl inside her", "la que era de niña")

When the topic or any line of the 6-part narration references the inner child, INSERT this in the prompt of the matching part (and only that part):

`"Beside her — and only she sees — appears for 1.5 seconds the silent translucent presence of her inner child: a 7-year-old version of herself in a simple cream cotton dress, holding her hand or standing quietly behind her shoulder, soft and dreamlike, slightly desaturated. Same Colombian features as adult HER. The little girl looks at adult HER with calm trust. No words. Returns to main scene."`

This INSERT replaces the regular flashback block in that one part (so each prompt still has exactly ONE 1-1.5 second insert). Do not double up.

## CRYING POSTURE (when narration explicitly says she cries)

Translate "crying" into a posture, NOT into the banned words. Use:
- One single quiet tear tracing her cheek without sound
- Hand pressed to her own mouth as if to hold it in
- Chin lifting slowly, eyes glassy, jaw set
- One slow exhale visible in her chest
- Eyes closing for one breath, opening with calm acceptance

NEVER show: sobbing, body shaking violently, face contorted, head buried in hands on the floor.

## UNIFIED VISUAL FILTER (identical in all 6 parts and across all videos in the series)

Natural light only — no artificial color gels. Kodak Portra 400 color palette: warm naturalistic tones, slight desaturation, mild golden cast, lifted blacks subtle. Photorealistic, shallow depth of field, fine 35mm film grain. Cinematic editorial drama look — like a Netflix limited series.

## MANDATORY CINEMATIC EFFECTS (every prompt)

- Lens flare from the natural light source in the scene
- Soft bokeh background with depth separation
- Dust particles drifting in the light beams
- Subtle light leak on the edge of the frame
- Subtle slow motion at the emotional beat (mandatory in P4, P5, P6 — optional in P1, P2, P3)
- Camera always in motion: slow dolly-in / handheld breath / very slow orbit / side track / push-in. NEVER fully static.

## MANDATORY MOVEMENT BLOCK (in every HER description)

soft breathing visible, real slow blinking, hair shifting with her breath or catching the breeze, fingers moving slowly with intent, organic posture, weight shifting naturally, no magazine pose, no fixed lens stare, no parted lips, no staged expression.

## MANDATORY EMPATHY + TEAR PROGRESSION (across the 6 parts)

- **P1:** soft tender warm smile, eyes warm and present full of empathy, no tear. Body alive, slight movement, cinematic motion (walking, turning, leaning slightly toward HIM).
- **P2:** warm pensive vulnerable gaze with empathy still present, soulful eyes, faint warmth still visible at the corners of her mouth, no tear. Body in motion, hand reaching, head tilting.
- **P3:** glassy eyes bright with held emotion, mouth slightly tight but warm, no tear yet. Posture begins to firm — hand pressing on chest, jaw setting.
- **P4:** a single quiet tear suspended on her lower lash without falling, breath held one beat. The realization moment.
- **P5:** one tear slowly tracing her cheek without sound, lips soft, eyes downcast for one beat then lifting.
- **P6:** eyes still moist from tears already shed, calm acceptance, the warm smile returns at the very end as inner strength — closing on a small soft smile that says "I see now, and I am ok".

NEVER use the words: tears, sobbing, weeping, trembling, hard crying, anguish, desperate.
ALWAYS use: a single quiet tear / one tear / eyes still moist / glassy eyes / warm tender smile / soft warmth in her face.

## MANDATORY FLASHBACK INSERT (in every one of the 6 prompts)

Insert this line in every prompt, between the camera block and the lighting block:

`"Mid-clip quick flashback insert (1 second, slightly desaturated, soft blur, dreamlike): [contrasting memory]. Returns to main scene."`

**Flashback memory rules:**
- 1 second only, never longer
- Always contrasts the present emotional state
- NEVER contains kissing, embracing, lying down, intimate scenes — only short gestures (smile, hand on hand, shared glance, walking together, raising a glass)
- Same Kodak Portra 400 palette but explicitly "slightly desaturated, soft blur, dreamlike" to distinguish from the present

**Suggested flashback bank — NO usar idéntico cada video. ADAPTAR al tema actual.**

Estos son ejemplos genéricos que sirven como punto de partida. Cada tema demanda flashbacks diferentes que conecten con su Beat narrativo:
- P1 → memoria del momento idealizado más alto del vínculo (varía: cena, baile, encuentro casual, viaje, palabra clave dicha por él)
- P2 → momento de surrender sutil (varía: ella firmando algo, ella diciendo sí a algo importante, ella renunciando a algo propio)
- P3 → primera grieta vista desde afuera (varía: amiga preocupada, llamada de su mamá, comentario de un compañero de trabajo, mirada de su hija)
- P4 → momento donde la verdad estuvo a la vista pero ella la descartó (varía: él mirando otro celular, él tarde en llegar, una llamada que cortó)
- P5 → consejo no escuchado de alguien que la quería (varía: hermana, amiga del alma, terapeuta, abuela, su propia voz)
- P6 → versión anterior de ella misma libre (varía: ella estudiando con pasión, ella riendo con amigas, ella eligiendo, ella hace 5/10/15 años)

**Reglas duras del flashback:**
- 1 second only, never longer
- Always contrasts the present emotional state
- NEVER contains kissing, embracing, lying down, intimate scenes — only short gestures (smile, hand on hand, shared glance, walking together, raising a glass)
- Same Kodak Portra 400 palette but explicitly "slightly desaturated, soft blur, dreamlike" to distinguish from the present
- Flashback memory cambia de cuento a cuento — JAMÁS el mismo flashback dos videos consecutivos

## GROK PROMPT TEMPLATE (use this exact structure per part)

```
Cinematic editorial drama film scene with cinematic motion and quick flashback insert. [Airtable Ambiente "Descripción cinematográfica" string copied LITERALLY] — fully visible, naturally lit in HD, photographed in clear daylight or golden hour from the Airtable Iluminación field.
HER: [paste the COMPLETE HER block built from Airtable "Look general" + empathy/movement layer, IDENTICALLY in all 6 prompts], wearing [outfit from Airtable Vestimenta — may evolve per part as time advances], [posture for this part picked from MANDATORY POSTURE & SITUATION VARIETY map — different one each part: walking / talking face to face / looking at horizon / sitting on a bench outdoor / dramatizing emotion in body / walking away], [tear progression line for this part].
[If he appears in P1 or P2: paste full HIM block IDENTICALLY], wearing [outfit appropriate to outdoor scene], [walking beside her / facing her in conversation / holding her hand briefly]. He never appears in P3, P4, P5, P6 except in flashback.
Cinematic [medium two-shot / medium shot / medium close-up / close-up], [camera: slow dolly-in with handheld breath / very slow orbit / slow handheld track / push-in following her walk]. Camera ALWAYS in motion, never static.
Mid-clip quick flashback insert (1 second, slightly desaturated, soft blur, dreamlike): [contrasting memory from bank above]. Returns to main scene.
[ONLY IF narration mentions niña interior in this part: replace the flashback line with the INNER CHILD APPEARANCE block instead.]
Natural light only — fully visible, HD clarity. [Lighting from Airtable Iluminación field: golden hour / luz fría natural / cálida íntima / morning soft]. Warm naturalistic tones, slight desaturation, mild golden cast, lifted blacks. Lens flare from natural light source, soft bokeh background, dust particles drifting in the light, subtle light leak on the edge of the frame.
Soft breathing visible, real slow blinking, hair shifting in the breeze, fingers moving with intent, cinematic body movement, weight shifting naturally — never frozen, never magazine pose.
Subtle slow motion at the moment [specific emotional beat — mandatory P4/P5/P6].
Photorealistic, shallow DOF, fine 35mm film grain, Kodak Portra 400 palette. 10 seconds. 9:16 vertical.
Voice-over (off-screen Colombian male narrator, deep voice, slow dramatic documentary tone, clear pronunciation): "[Spanish text from matching Parte, copied LITERALLY]"
NO on-screen text, NO subtitles, NO logos, NO watermarks, NO narrator visible.
```

## CLOTHES ONLY (full coverage always — outfits evolve only as story advances in time)

Tailored blazers, wool/cashmere coats, trench coats, turtlenecks, knit sweaters, midi dresses, midi skirts + silk blouses, high-waisted trousers, button-ups, cashmere sweaters.

## CLOTHES NEVER

Pajamas, slip dress, lingerie, swimwear, thin straps, unbuttoned shirts, low-cut, sheer, plunging necklines, robe, towel, camisole, crop tops, mini skirts.

## SCENES — FUENTE OFICIAL = AIRTABLE TABLA "AMBIENTES"

The scene is ALWAYS picked at random from the Airtable table `Ambientes` (tableId `tbl3OSe9IB9XFo3pf`) at Step 0. Priority categories: "Exterior natural" and "Exterior urbano". "Casa" only if the narration explicitly demands it (e.g., a scene at a colonial courtyard reading a letter). NEVER "Interior íntimo" with woman in bed.

The Airtable "Descripción cinematográfica" field is copied LITERALLY into the Scene line of every prompt. The Airtable "Iluminación sugerida" field drives the lighting line. Sub-locations across the 6 parts must stay in the same world (same scene universe — different angles / corners / micro-spots).

## SCENES NEVER

Bedroom with woman in bed, bathroom, person on floor, lying down, claustrophobic small rooms, dark unlit interiors, phone screens showing other people (use printed photograph instead), hard crying / sobbing, kissing, embracing in close contact, anything sexually suggestive, low-light noir, anything that looks like a horror film.

## BANNED WORDS in image description

dangerous, horror, frozen, collapsed, devastated, hollow, vacant, trembling, tears (plural), sobbing, weeping, hardened, broken, destroyed, disheveled, limp, cruel, abusive, violent, naked, undressed.

## ALLOWED EMOTIONAL VOCABULARY in image

soulful gaze, tender smile, vulnerable presence, glassy eyes, eyes bright with held emotion, a single quiet tear, one tear tracing her cheek, eyes still moist, calm acceptance, soft breathing, gaze that rests, warmth in her eyes, quiet centered posture.

## HARD RULES

1. Each Spanish part: 16-19 words. Strict word count.
2. Third person only. No character dialogue. Only narrator speaks. If a topic comes from Airtable Diálogos table, the dialogue lines are CONVERTED TO NARRATIVE — never quoted.
3. ONE story across 6 parts. Each last line opens the next.
4. HER and HIM pasted IDENTICALLY where they appear — change ONLY the outfit and posture per scene. Outfit base comes from the Airtable Vestimenta of the chosen Estilo.
5. Outfits change only as the story advances in time, never randomly.
6. Spanish narration COPIED LITERALLY into the Voice-over line, no rewrites.
7. ALWAYS open every prompt with `"Cinematic editorial drama film scene with cinematic motion and quick flashback insert."`
8. Betrayal/realization discovery (P4) uses a TANGIBLE OBJECT chosen specifically for THIS theme — NEVER default to "printed photograph in envelope". Each tema in Airtable maps to a different revelation mechanism (see TABLA DE MECANISMOS DE REVELACIÓN P4 in cuentos-general.md). Possible mechanisms include: calendar with crossed-out dates, real estate brochure, hotel receipt, second key in his pocket, paternity document, her own old journal, voicemail playing on her phone, her childhood photo, list of crossed-out contacts, bank statement, screenshot, blank page in her own diary, three-generation family photo, etc. NEVER use a phone screen showing chats. NEVER default to the same mechanism twice in a row.
9. Spanish narration: simple words, short phrases, easy to pronounce within 10 seconds at a slow dramatic pace.
10. Story REAL: love bombing, idealization, devaluation, gaslighting, discard, hoovering, triangulation, double life, financial control, isolation, future faking, silent treatment. No fantasy.
11. UNIFIED FILTER (Kodak Portra 400 + natural light + 35mm + fine grain) is IDENTICAL across all 6 parts and across every video in the series — series-level visual brand.
12. EVERY prompt contains a mid-clip 1-1.5 second insert — usually the contrasting flashback memory. EXCEPTION: when the part references "niña interior" in narration, the insert is the INNER CHILD APPEARANCE block instead. Never both at once, never zero.
13. EVERY prompt contains real cinematic movement — subjects breathe, hair moves, hands move slowly, body shifts naturally between postures, camera moves. NO frozen pose, NO statue stare.
14. Emotional progression of the face is OBLIGATORY: P1-P2 warm tender empathic smile + dry / P3 glassy with held warmth / P4 single tear suspended / P5 single tear tracing / P6 calm moist with returning warm soft smile.
15. Subtle slow motion at the emotional beat is mandatory in P4, P5, P6.
16. HIM appears only in P1 and P2 in present time, and in flashbacks elsewhere. From P3 onward HE only exists in flashback inserts.
17. Beauty is sublime but ALWAYS natural — features and biotype come from the Airtable Estilo Mujer Colombiana drawn at random for THIS video. Soft natural day makeup, organic hair, no plastic, no pasarela pose, no performative parted lips.
18. Camera is NEVER fully static — at minimum a very slow push-in or handheld breath.
19. Lens flare + bokeh + dust particles + light leak — at least three of these four in every prompt.
20. The flashback memory NEVER shows kissing or embracing — only smile, hand-hold, shared glance, raised glass, walking together.
21. AIRTABLE OBLIGATORY: every video starts with Step 0 random pulls. Estilo random ≠ Ambiente random ≠ Tema random. Never reuse the same Estilo two videos in a row.
22. EXTERIOR DEFAULT: every part lives outside in natural light unless narration explicitly forces an interior beat. The video must NEVER feel claustrophobic.
23. POSTURE VARIETY: across the 6 parts, no posture is repeated — pull from the MANDATORY POSTURE & SITUATION VARIETY map. The body answers the line.
24. INNER CHILD: only appears if narration mentions her in that exact part. Don't insert her by default. When she appears, she replaces the flashback insert in that part only.
25. EMPATHY BASELINE: even in pain, her face keeps warmth. The series is empathic, not stoic. The viewer must feel her — that's the whole point.
26. **ANTI-REPETICIÓN ENTRE CUENTOS** (la regla que más le importa al usuario): el supervisor lee los últimos 3 cuentos "Hecho" en Airtable antes de generar uno nuevo. Está PROHIBIDO repetir entre cuentos consecutivos: (a) Estilo de mujer, (b) Ambiente, (c) mecanismo de revelación P4, (d) la misma secuencia exacta de 6 posturas, (e) la misma estructura sintáctica de la P1, (f) los mismos flashbacks. Cada cuento debe tener INGENIO propio. Cualquier repetición invalidante = FAIL automático del validator.
27. **MECANISMO P4 ROTATIVO POR TEMA**: el revelador en P4 NO es default de foto-en-sobre. Se elige según el Beat narrativo del campo Notes del Tema en Airtable. La tabla completa de mecanismos vive en `~/.claude/agents/cuentos-general.md` (TABLA DE MECANISMOS DE REVELACIÓN P4). Si el tema no encaja claro, el supervisor INVENTA un mecanismo nuevo coherente con el Beat.
28. **VARIEDAD SINTÁCTICA**: la P1 nunca abre con la misma estructura que el cuento anterior. Variantes válidas: pregunta retórica, imagen sensorial, voz colectiva, acción concreta, tiempo nombrado, negación, lista, etc. Rotar.

## DRAMATIC ARC

INFATUATION (P1) → SURRENDER (P2) → FIRST CRACK (P3) → TRUTH SURFACES (P4) → INNER COLLAPSE (P5) → FINAL TRUTH (P6).

- P1 must hook in the first 3 seconds (visual + first words of narration).
- P4 truth surfaces via the printed photograph in the envelope (never via phone).
- P6 delivers the psychological truth that hurts — the line that makes a woman in trauma bond recognize herself.

## EXECUTION — DELEGACIÓN INMEDIATA AL AGENTE SUPERVISOR

Este skill es un PUNTO DE ENTRADA. La orquestación completa la hace el agente supervisor `cuentos-general`. Cuando el usuario dispara este skill (con `/cuentos`, "hagamos un cuento", "vamos a hacer un cuento", "cuento de 60s" o variantes), tu única acción es:

1. Invocar inmediatamente el subagente `cuentos-general` vía la herramienta `Agent` con `subagent_type: cuentos-general`.
2. Pasarle el mensaje literal del usuario en el prompt (incluido cualquier tema explícito si lo dio).
3. Esperar su resultado.
4. Relevar al usuario el output completo que devuelve el supervisor — TAL CUAL viene, sin reescribirlo, sin resumirlo.

### Por qué hay supervisor

El sistema /cuentos tiene 3 fuentes de Airtable, 31 reglas duras, validación con loop de hasta 3 iteraciones, y actualización de Status en una tabla externa. Centralizar todo en el supervisor `cuentos-general` garantiza:
- Que cada cuento pase los mismos pasos en el mismo orden.
- Que ningún tema se duplique (el supervisor pulla solo de los "Falta por hacer" y los marca "Hecho" al terminar).
- Que el output sea calidad video profesional Netflix, no draft amateur.

### Lo que el supervisor hace por ti (no replicar aquí — vive en `~/.claude/agents/cuentos-general.md`)

1. Lee este SKILL.md y `~/.claude/agents/cuentos-validator.md` antes de empezar.
2. Pulla aleatoriamente Estilo Mujer (base `appe6pvFi9EZzv3gU`, tabla `tblJgm3L9ZLcwgvs8`).
3. Pulla aleatoriamente Ambiente exterior (base `appe6pvFi9EZzv3gU`, tabla `tbl3OSe9IB9XFo3pf`).
4. Pulla aleatoriamente Tema con Status="Falta por hacer" (base `appEtIptqwNt0DEKw`, tabla `tblWrHL4DtpMW0ap4`).
5. Marca el Tema como "En proceso".
6. Anuncia los 3 picks al usuario con header de 3 líneas.
7. Genera el draft completo aplicando todas las reglas de este SKILL.md.
8. Invoca al subagente `cuentos-validator` (loop máx 3 iteraciones) hasta PASS.
9. Marca el Tema como "Hecho" cuando pasa validación.
10. Entrega el output final al usuario con header + 6 párrafos español + 6 prompts Grok.

### Lo único que tú haces (este skill)

```
1. Detectar la intención del usuario ("/cuentos" o variante).
2. Invocar Agent con subagent_type=cuentos-general y prompt={mensaje del usuario}.
3. Pasar el resultado del supervisor al usuario tal cual.
```

Nada más. Sin pasos intermedios, sin re-validar, sin re-formatear. El supervisor es el general — tú eres solo la centinela en la puerta que lo despierta.

### Caso especial: tema explícito del usuario

Si el usuario dice "hagamos un cuento sobre [X]" donde X es un concepto específico, pásalo literal al supervisor en el prompt. El supervisor decide si X coincide con un registro existente en Airtable, lo crea si no existe, o lo regenera si ya estaba "Hecho".

### Reglas duras de este skill

1. **NUNCA generes los párrafos o prompts desde aquí.** Eso es trabajo del supervisor.
2. **NUNCA leas Airtable desde aquí.** Eso es trabajo del supervisor.
3. **NUNCA invoques cuentos-validator directo.** Eso es trabajo del supervisor.
4. **SI el supervisor falla** (timeout, error de MCP, etc), reporta al usuario el error específico y dile que reintente. NO intentes hacer el flujo a mano sin el supervisor.
