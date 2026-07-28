# Paula humana — espera de 10 segundos, globos y blindaje

Guía corta de qué cambió, qué hay que tocar en ManyChat y cómo mantenerlo.

---

## 1. El problema que se resolvió

Las mujeres escriben como se habla, en ráfaga:

> hola
> vi el video
> es este jueves?
> cuánto vale

Paula contestaba **cuatro veces**, una por mensaje. Se notaba el robot a un kilómetro.

Ahora Paula **espera 10 segundos** a que ella termine, junta los cuatro mensajes en uno solo, y responde **una sola vez** a todo — en 2 o 3 globos, con la pausa que tomaría escribirlos.

---

## 2. Por qué hubo que cambiar la arquitectura

La "Solicitud externa" de ManyChat **se cae a los 10 segundos** ([límite documentado, no configurable](https://community.manychat.com/ideas/webhook-10-second-timeout-limit-7425)).

Esperar 10 s + pensar la respuesta (3-6 s) **no cabe** en esos 10 s. Por eso el flujo se invirtió:

| Antes (modo clásico) | Ahora (modo humano) |
|---|---|
| ManyChat pregunta → Paula piensa → responde en la misma petición | ManyChat avisa → el webhook contesta vacío en milisegundos → Paula responde **por su cuenta** vía la API de ManyChat |
| Sin espera posible | Espera 10 s, junta mensajes, responde en globos |

El token que hace posible el empujón (`MANYCHAT_API_TOKEN`) **ya estaba configurado** — es el mismo que usan los recordatorios de venta.

---

## 3. ⚠️ EL ÚNICO CAMBIO QUE HAY QUE HACER EN MANYCHAT

En el flujo `whatssap historias`:

1. **Deja el nodo de "Solicitud externa"** apuntando a `POST https://<tu-host>/api/whatsapp/webhook` (igual que hoy).
2. **BORRA el nodo que enviaba `{{bot_response}}`** justo después.

Ese segundo paso es obligatorio: ahora el mensaje lo manda Paula por la API. Si dejas el nodo, ManyChat intentará enviar un texto vacío.

El body de la solicitud externa, completo:

```json
{
  "user_id": "{{Id de contacto}}",
  "user_message": "{{Última entrada de texto}}",
  "phone": "{{Teléfono}}",
  "audio_url": "{{URL del archivo adjunto}}"
}
```

- `phone` es lo que le permite a Paula darle a cada mujer **su hora local y su moneda**. Sin él no asume Colombia: da dólares y dice "hora Colombia" explícito, sin preguntarle nada.
- `audio_url` es opcional, solo si quieres que Paula **oiga las notas de voz**.

> El "delay de 3 segundos" que hoy tienes configurado en ManyChat ya no hace falta: la espera y las pausas las maneja Paula.

---

## 4. Cómo comprobar que quedó bien

Abre en el navegador `https://<tu-host>/api/whatsapp/webhook` (GET). Debe decir:

```json
{
  "modo": "humano (buffer + globos)",
  "clase": { "nombre": "Recuperando mi Ser", "activa": true, "estado": "futura", "cuenta": "faltan 3 días" },
  "buffer": { "espera_ms": 10000, "conversaciones_en_espera": 0 }
}
```

Si dice `"modo": "clasico (respuesta sincrona)"` es que falta `MANYCHAT_API_TOKEN` en las variables de entorno del servicio.

Después, escríbele por WhatsApp tres mensajitos seguidos. Debe contestar **una sola vez**, unos 12-13 segundos después del último.

---

## 5. Ajustes (variables de entorno, todas opcionales)

| Variable | Por defecto | Para qué |
|---|---|---|
| `PAULA_ESPERA_MS` | `10000` | Milisegundos de silencio que espera a que ella termine de escribir |
| `PAULA_MAX_ESPERA_MS` | `30000` | Tope: aunque siga escribiendo, contesta a los 30 s |
| `PAULA_MODO` | — | `sync` fuerza el modo clásico (útil para depurar) |
| `GROQ_API_KEY` | — | Activa la transcripción de notas de voz (la opción más barata) |
| `OPENAI_API_KEY` | — | Alternativa para transcribir, si no usas Groq |

---

## 6. Lo que Paula sabe de la clase (y por qué ya no se inventa fechas)

Todos los datos duros viven en **un solo archivo**: [`lib/whatsapp/contexto-clase.ts`](../lib/whatsapp/contexto-clase.ts). Nombre, instante de inicio, landing, Nequi, soporte, y la tabla de países con su zona horaria y su moneda.

Ese archivo le entrega a Paula, en cada mensaje, el reloj **ya resuelto**: qué día es hoy, cuánto falta (*"faltan 3 días"*), a qué hora le queda la clase **a ella** y cuánto le cuesta **en su moneda**. El modelo no calcula nada — solo lee y repite.

### El blindaje anti-invento

En [`lib/whatsapp/blindaje.ts`](../lib/whatsapp/blindaje.ts), montado encima de ese mismo archivo (ni una fecha escrita a mano). Antes de que ella lea nada, se revisa:

| Se detecta | Qué pasa |
|---|---|
| Un link que no existe | Se borra |
| "martes 30 de julio" | Se corrige solo a "jueves" |
| Una fecha que no es la de la clase | Se le pide al modelo que reescriba |
| Prometer la clase como futura cuando ya pasó | Se le pide que reescriba (puede vender la grabación, no la fecha) |
| "$37.97 al mes" (otro producto) | Se le pide que reescriba |
| "último cupo" (escasez falsa) | Se le pide que reescriba |
| Ponerse a hacer terapia ("no es amor, es tu sistema nervioso...") | Se le pide que reescriba |
| Prometer módulos o el protocolo de 8 pasos (eso es Apego Detox, no la clase) | Se le pide que reescriba |
| **Prometer la grabación** — la clase NO se graba | Se le pide que reescriba. Decir que *no* existe sí se permite |

Si en el segundo intento sigue mal, sale la versión saneada. Prefiere quedarse corta antes que prometerle a una mujer algo que no existe.

### Para la próxima edición de la clase

Se tocan **dos archivos** y nada más:

1. `desing_web/src/config/claseEnVivo.ts` (la página)
2. `marketingdetox/lib/whatsapp/contexto-clase.ts` (Paula) — `CLASE.nombre`, `CLASE.inicioISO` y `CLASE.landing`

Para apagar la campaña y volver a vender Apego Detox: `CLASE.activa = false`.

**`CLASE.quedaGrabada`** (hoy en `false`): la clase es en vivo, una sola vez, y no se entrega grabación. Con ese flag en `false`, Paula no puede prometerla (lo bloquea el blindaje) y, cuando la clase pasa, deja de venderse — no hay nada que entregar. Si una edición futura sí se graba, se pone `true` y todo vuelve solo.

---

## 6.b El tono: cercana, sin interrogar, sin hacer terapia

Auditado con conversaciones reales contra el modelo (`openai/gpt-4.1-mini`). Antes del ajuste, **6 de cada 8 respuestas terminaban en una pregunta de permiso** — "¿quieres que te cuente más?", "¿quieres que te comparta el link?" — y ante un "quiero entrar a la clase" respondía con un párrafo de venta en vez del link.

Las reglas que lo corrigen viven en el bloque de campaña de [`lib/whatsapp/paula.ts`](../lib/whatsapp/paula.ts):

1. **Ella ya quiere ir.** No hay que convencerla ni descubrir su caso. Se le resuelve y se le abre la puerta.
2. **Prohibido pedir permiso.** Si la información sirve, se da. Si el link aplica, se manda.
3. **Máximo una pregunta cada tres mensajes**, y solo si el dato hace falta (su país). Lo normal es no preguntar.
4. **Cierra invitando, no interrogando:** "Te espero adentro", "Cualquier cosa me dices".
5. **No hace terapia.** Ante algo duro: una frase humana ("Uf, tres meses así agotan a cualquiera") y sigue con la clase. Nada de explicar mecanismos.
6. **Solo promete lo que la clase tiene.** Módulos, protocolo de 8 pasos y comunidad privada son de Apego Detox, no de la clase.

Resultado tras el ajuste, en las mismas 8 respuestas: **0 preguntas, 0 psicoeducación, 0 contenido de otro producto**, y el link entregado siempre que correspondía.

### El largo: 2 globos, no un folleto

El error más caro de un bot de WhatsApp es contestar como si escribiera un correo. Paula llegó a responder un simple "hola" con **441 caracteres en 4 globos**: fecha, hora, precio, todo lo que incluye y el link, de una. Tres fallas de diseño:

1. **Disparaba todo el inventario en el turno 1.** Un humano responde lo que le preguntaron y para.
2. **Enumeraba** — "con terapia en vivo, meditación, testimonios, el libro y la grabación". Nadie escribe listas por WhatsApp.
3. **Globos de 150+ caracteres**, cuando un mensaje real de chat anda entre 30 y 70.

Ahora el largo está acotado en tres capas, para que no dependa de que el modelo se acuerde:

| Capa | Qué hace |
|---|---|
| Prompt | 2 globos (3 si el tercero es el link), ~110 caracteres por globo, prohibido enumerar, una idea por mensaje |
| Escalera de conversación | Un "hola" se responde con presentación + cuándo es la clase. **Sin link, sin precio, sin lista.** El link entra cuando ella pregunta algo concreto o dice que quiere entrar |
| [`blindaje.ts`](../lib/whatsapp/blindaje.ts) | Si pasa de 300 caracteres (sin contar el link) o de 3 globos, le pide reescribirlo más corto. No trunca: pide comprimir |

El link no cuenta para el largo: en WhatsApp se ve como una tarjeta, no como texto.

Resultado con el mismo "hola": **2 globos, 141 caracteres.**

```
Hola 💛 Soy Paula, del equipo de Javier.

La clase en vivo "Recuperando mi Ser" es *este jueves 30 a las 7:00 PM* (hora de Ciudad de México).
```

Las pausas de tecleo también se recalibraron: la fórmula estaba pensada para párrafos y dejaba 6 segundos entre frases de una línea. Ahora ~60 caracteres salen en 2 segundos, que es lo que tarda alguien escribiendo en el celular.

### El formato del mensaje

- **Negrita en el dato clave** (el día, la hora o el precio), una por mensaje, dos como máximo.
  WhatsApp usa `*palabra*` con UN asterisco, no el `**palabra**` de markdown. El modelo escribe markdown por costumbre, así que [`normalizarNegritas()`](../lib/whatsapp/manychat.ts) lo convierte antes de enviar y recorta de la tercera en adelante.
  **Instagram no tiene negrita**: allá los asteriscos se verían literales, así que se quitan del todo. Por eso la conversión depende del canal.
- **Uno o dos emojis por mensaje** (solo 💛 y ✨), separados entre sí — nunca dos pegados ni uno por línea.
- **Su país no se pregunta: se lee del teléfono.** `detectarPais()` saca la zona horaria y la moneda del indicativo. Con un `+54` responde "10:00 PM en Argentina, unos 9.000 ARS" sin preguntar nada. Solo cuando ManyChat no manda `phone` (Instagram) usa dólares y hora Colombia explícita — y ni ahí pregunta de entrada.

---

## 7. Desplegar

```bash
git add -A && git commit -m "feat(paula): espera de 10s, globos humanos y blindaje anti-invento" && git push origin master
```

Luego bumpear `CACHE_BUST` en el `Dockerfile` y dar **Implementar** en el panel.

---

## 8. Mapa contra el bot de referencia (ForjaBots)

| Función | Estado |
|---|---|
| Espera y junta los mensajes en ráfaga | ✅ nuevo |
| Responde en globos con pausas humanas | ✅ nuevo |
| Blindaje anti-invento (precios, fechas, links) | ✅ nuevo |
| Contexto completo de la clase del jueves | ✅ nuevo |
| Handoff a persona real | ✅ nuevo |
| Oído: transcribe notas de voz | ✅ nuevo (falta la key de Groq) |
| Cazador de ventas (rescata chats fríos) | ✅ ya existía (`/api/cron/recordatorios-apego`) |
| Voz de marca | ✅ ya existía |
| Cobros (Hotmart + Nequi) | ✅ ya existía |
| Analista IA que califica cada conversación 1-5★ | ⬜ pendiente |
| Reporte automático cada noche | ⬜ pendiente |
| Encuesta de satisfacción | ⬜ pendiente |
| Multi-idioma | ⬜ no aplica (audiencia hispanohablante) |
