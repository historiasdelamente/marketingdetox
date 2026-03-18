# Comandos Rápidos — Sistema de Lanzamiento

## Comandos de generación

### /clase1
Ejecuta el flujo completo de los 7 agentes para la Clase 1.
Produce: guión final + slides.
Flujo: DOLOR → STORYTELLING → PRODUCTO → CTA → ESTRUCTURA/GUION → SLIDES → VALIDACIÓN DE VOZ.

### /clase2
Igual que /clase1 pero para la Clase 2. Requiere que la Clase 1 ya exista.
Continúa el loop abierto de la clase anterior.

### /clase3
Igual que /clase1 pero para la Clase 3. Requiere que las Clases 1 y 2 ya existan.

---

## Comandos por agente individual

### /dolor
Ejecuta solo el agente DOLOR.
Produce: mapa emocional con puntos de dolor, curva de intensidad y detonadores.
Útil cuando quieres ver el mapa antes de generar todo.

### /storytelling
Ejecuta solo el agente STORYTELLING.
Requiere: que /dolor se haya ejecutado antes (necesita el mapa emocional).
Produce: historias, metáforas y momentos de quiebre.

### /producto
Ejecuta solo el agente PRODUCTO.
Produce: puntos de producto conectados a los dolores. Solo datos reales.

### /cta
Ejecuta solo el agente CTA/CONVERSIÓN.
Produce: mapa de CTAs con timing, tipo y frase exacta.

### /guion
Ejecuta solo el agente ESTRUCTURA/GUION.
Requiere: que DOLOR, STORYTELLING, PRODUCTO y CTA se hayan ejecutado.
Produce: guión final ensamblado listo para leer en vivo.

### /slides
Ejecuta el agente NOTEBOOKML/SLIDES (sistema híbrido).
Requiere: que /guion se haya ejecutado (necesita el guión final).
Produce: (1) 4 prompts listos para pegar en NotebookLM, (2) 5 prompts de imagen para Canva/ChatGPT.
Flujo: NotebookLM para estructura/texto + Canva/IA para imágenes hiperrealistas.

---

## Comandos de ajuste

### /ajustar [sección]
Modifica una sección específica del guión ya generado.
Ejemplos:
- `/ajustar apertura` → Rehace solo la apertura
- `/ajustar cta cierre` → Rehace solo el CTA de cierre
- `/ajustar minuto 15` → Rehace el bloque que cae en el minuto 15

### /mas-dolor
Sube la intensidad emocional del guión. Más golpes, más crudeza, más detonadores.

### /mas-suave
Baja la intensidad. Más validación, más abrazo, menos confrontación.

### /mas-ciencia
Agrega más frameworks clínicos y explicaciones neurocientíficas.

### /mas-historias
Agrega más bloques narrativos y metáforas.

### /mas-corto
Reduce el guión. Elimina lo que sobra sin perder la curva emocional.

### /mas-largo
Expande el guión. Agrega profundidad donde hay espacio.

---

## Comandos de validación

### /validar
Ejecuta el skill de VALIDACIÓN DE VOZ sobre el último contenido generado.
Revisa: ¿suena a Javier? ¿Los datos son reales? ¿La curva emocional funciona?
Devuelve: lista de lo que pasa y lo que no pasa el filtro.

### /revisar [archivo]
Valida un archivo específico.
Ejemplo: `/revisar guion-clase-1.md`

---

## Comandos de utilidad

### /status
Muestra qué se ha generado y qué falta para la clase actual.

### /estructura
Muestra la estructura de carpetas y archivos del proyecto.

### /reset
Limpia los outputs generados para empezar de cero.
