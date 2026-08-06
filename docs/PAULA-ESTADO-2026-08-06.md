# PAULA — ESTADO AL 2026-08-06

> Documento de traspaso. Escrito para retomar el trabajo en una conversación nueva.
> Lo de aquí está **verificado contra producción**, no supuesto.

---

## 1. QUÉ ES PAULA HOY

Bot de WhatsApp/Instagram que vende **UN solo producto: Apego Detox, en Skool**, $20 USD/mes
(sube a $40 el 15 de agosto). Corre con `gpt-4.1-mini` vía OpenRouter, en un VPS de Hostinger
con panel EasyPanel.

**El 5 de agosto se retiró la clase del jueves.** Antes había una "escalera": todo el mundo
entraba por la clase (pago único, Hotmart) y solo se subía al programa si ELLA lo pedía con
una de cuatro palabras. Eso escondía el mejor producto detrás de una contraseña que casi
nadie adivinaba. Hoy hay un producto, un link, y **se entra hoy** — sin fecha que esperar,
que es el argumento más fuerte que tiene.

---

## 2. CÓMO VERIFICAR QUE ALGO ENTRÓ

```bash
curl -s "https://paula-bot-marketingdetox.ya3fud.easypanel.host/api/whatsapp/webhook"
```

El campo **`version`** dice qué build corre (sale del `CACHE_BUST` del Dockerfile). Si no
coincide con el último commit, **el despliegue no tomó**. Antes de que existiera ese campo,
este endpoint devolvía lo mismo después de ocho commits y no había forma de saberlo.

**El despliegue NO es automático:** hay que darle a *Implementar* en EasyPanel, servicio
`marketingdetox`. Y hay que **bumpear `CACHE_BUST` en el Dockerfile** en cada cambio, o
Docker reutiliza la capa del `COPY` y arranca con los archivos viejos.

### Leer la base directamente (Supabase, ref `fokqzzyibkkzvxetxwan`)

```bash
URL=$(grep -m1 '^SUPABASE_URL=' .env.local | cut -d= -f2-)
KEY=$(grep -m1 '^SUPABASE_SERVICE_KEY=' .env.local | cut -d= -f2-)
curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/wa_users?select=name,pais,phone,funnel_stage,situacion_resumen&order=last_interaction.desc&limit=5"
```

Y la conversación de una mujer concreta:

```bash
curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/whatsapp_memoria?session_id=eq.<manychat_id>&order=id.asc&select=id,message"
```

**Leer los datos reales es lo que ha encontrado casi todos los fallos de hoy.** Los tests
pasaban en verde mientras producción hacía cosas raras.

---

## 3. HABLAR CON PAULA SIN TOCAR PRODUCCIÓN

Hay un simulador que corre el pipeline COMPLETO (prompt → gpt-4.1-mini → blindaje →
reintento → formato → globos) con el estado en un JSON local:

```bash
MSG="hola" RESET=1 npx vitest run __tests__/_chat-manual.test.ts   # empezar de cero
MSG="tu mensaje" npx vitest run __tests__/_chat-manual.test.ts     # seguir
PAIS="+525512345678" MSG="..." npx vitest run __tests__/_chat-manual.test.ts  # otro país
```

Lo que ella vería queda en `chat-salida.txt`. Enseña también qué recordó y si saltó el
blindaje. **Usa esto en vez de escribirle a producción**: cada mensaje real escribe en la
base y podría llegarle a una mujer de verdad.

---

## 4. LA ARQUITECTURA, EN UNA PÁGINA

| Archivo | Qué manda |
|---|---|
| `lib/whatsapp/programa.ts` | Datos duros: precio, links, horarios, monedas. **Si se puede calcular, se calcula aquí** y se le entrega resuelto al modelo. |
| `content/PAULA-CONOCIMIENTO.md` | Lo único que Paula puede afirmar. Se inyecta entero en cada mensaje. |
| `lib/whatsapp/paula.ts` | El prompt: cómo habla, y el ensamblaje. |
| `lib/whatsapp/guion.ts` | **Por dónde va la venta.** Lee lo que Paula ya dijo y calcula el paso siguiente. |
| `lib/whatsapp/blindaje.ts` | Audita la respuesta ANTES de enviarla. Si inventa, pide reescribir. |
| `lib/whatsapp/formato.ts` | Garantiza la forma: máx 3 globos, 160 chars, cero listas. |
| `lib/whatsapp/moneda.ts` | Tasa de cambio viva, con respaldo y verificación. |

### La regla de oro del proyecto

> **El prompt lo pide; el código lo hace cierto.**

Con `gpt-4.1-mini` una prohibición es una sugerencia. Todo lo que importe de verdad tiene su
candado en código: `formato.ts` (la forma), `quitarVentaEnCrisis`, `dejarSoloJavier`,
`quitarLinkRepetido`, `conversion_inventada`.

### La lección que costó cuatro fallos el mismo día

> **Lo que el modelo tiene delante, lo copia — aunque el texto diga que no lo copie.**

Pasó cuatro veces: una cifra en pesos dentro de un ejemplo, una fecha dentro de una
prohibición, `*25.000*` como ejemplo de negrita, y dos ejemplos que enseñaban a recitar los
cuatro pilares. **Antes de escribir un valor concreto en el prompt o en el documento,
pregúntate si el modelo lo va a copiar.** Hay un test que bloquea las cifras locales.

---

## 5. LO QUE FALTA — POR ORDEN DE LO QUE CUESTA DINERO

### 5.1 Colombia no puede pagar sin tarjeta 🔴

Skool exige tarjeta y Colombia es el mercado más grande. Hoy eso cae a mano en el WhatsApp
de Javier. **Es el cuello de botella más caro que queda.**

### 5.2 El teléfono no llega, y para TikTok no se puede arreglar 🔴

`wa_users.phone` guarda el texto literal `{{phone}}`. **Verificado el 2026-08-06:** el flujo
de WhatsApp (`whatssap histoiras copy copy`, 5.091 envíos) **está bien configurado** — su
cuerpo usa la variable `[Teléfono]` de verdad, no texto a mano.

**Hipótesis pendiente de confirmar:** el literal viene del otro flujo,
`TikTok Live → Paula WhatsApp (v2)` (2.874 ejecuciones). Un contacto de TikTok **no tiene
teléfono**, así que ManyChat no puede resolver la variable. Si es eso, **no tiene arreglo en
el origen** y la solución correcta es la que ya está: que Paula pregunte el país.

👉 **Siguiente paso:** abrir ese flujo en ManyChat → nodo *Acciones* → *Solicitud externa* →
pestaña *Cuerpo*, y mirar si `phone` es una etiqueta azul (variable) o texto escrito a mano.

### 5.3 El nodo `bot_response` sigue en el flujo de WhatsApp 🟡

El flujo tiene todavía un paso *WhatsApp → Enviar mensaje* con `bot_response`. En modo humano
el webhook devuelve `bot_response` vacío y **el mensaje lo manda Paula por la API**. Ese nodo
debería sobrar. Marca 580 enviados / 99,8% entregado, así que está haciendo algo. **Revisar
si está mandando mensajes vacíos o duplicados.**

### 5.4 La garantía de 7 días no aparece en Skool 🟡

Paula la promete en cada precio. Javier dijo el 2026-08-05: *"no la mencionamos, pero no
hagas nada al respecto"*. Queda así por decisión suya.

### 5.5 España a las 3 de la madrugada 🟡

El horario que da Paula es correcto (8 PM Colombia = 3 AM Madrid), pero es inviable como
oferta. Si España es mercado, o hay sesión en otro horario o allí se venden los módulos y la
comunidad, no los talleres.

### 5.6 Cosas menores

- `/apegodetox` todavía vende por Hotmart a $37.97.
- Faltan dos títulos de módulo (la página dice 17, el documento lista 15).
- Confirmar si la comunidad 24/7 es la de Skool, el grupo de WhatsApp, o las dos.

---

## 6. FALLOS REALES ENCONTRADOS HOY (para no repetirlos)

Todos salieron de **mirar producción**, no de los tests:

1. **El precio en otra moneda, inventado.** A una mujer que preguntó en pesos argentinos le
   dijo 5.600 cuando eran 30.000. El bloque solo llevaba la moneda de su teléfono. → Ahora
   van las diez monedas calculadas + `conversion_inventada` en el blindaje.
2. **La hora, mal.** A Vanesa, desde Phoenix, le dijo las 9 PM (hora de Nueva York). Eran las
   6. → `zonaAmbigua` en Estados Unidos: no se afirma hora, se pregunta la ciudad.
3. **"Mucho gusto, Javier Vieira."** Le puso el apellido del psicólogo al nombre de ella.
4. **La mandó con Javier cuando estaba comprando.** Preguntó "¿cómo entro a la clase de
   mañana?" y Paula la escaló. Eso es intención de compra.
5. **Pidió permiso en vez de dar el link.** "Si quieres, te paso el WhatsApp." El blindaje
   solo cazaba preguntas con "¿".
6. **Repetía el mismo guion.** El prompt era idéntico en el turno 2 y en el 9.
7. **`detectarPais('123')` devolvía Estados Unidos**, porque "123" empieza por 1.

---

## 7. ANTES DE SUBIR CUALQUIER CAMBIO

```bash
npx tsc --noEmit          # sin errores
npx vitest run            # 203 pasan, 2 saltados (los dos simuladores manuales)
npx next build            # compila
```

Y bumpear `CACHE_BUST` en el `Dockerfile`.
