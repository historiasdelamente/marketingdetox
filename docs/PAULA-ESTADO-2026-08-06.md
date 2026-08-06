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

### 5.2 El teléfono no llega — RESUELTO, y no era lo que creíamos ✅

**Confirmado contra la API de ManyChat el 2026-08-06.** La hipótesis de TikTok era falsa: las
mujeres afectadas son contactos de **WhatsApp**, no de TikTok. La causa real es más simple y
sí tiene arreglo en el origen:

> En un contacto de WhatsApp, el campo `phone` de ManyChat **viene vacío**. El número vive en
> otro campo, **`whatsapp_phone`**.

Comprobado en cuatro contactos distintos, todos iguales:

```
1986512047 -> phone=None  whatsapp_phone='+573023499113'
1850882371 -> phone=None  whatsapp_phone='+573152336805'
1915391042 -> phone=None  whatsapp_phone='+573024476320'
 381965484 -> phone=None  whatsapp_phone='+14438571300'
```

Por eso el flujo *parecía* bien configurado: la variable `[Teléfono]` está bien puesta, pero
`[Teléfono]` **es el campo equivocado** para WhatsApp. No estaba mal escrito; estaba mal
elegido.

**Ya no depende del panel.** `telefonoDeManyChat()` (commit `ac0fe49`) pregunta por
`whatsapp_phone` primero, así que Paula lo rescata sola. Si alguien quiere arreglarlo también
en el origen, es cambiar `[Teléfono]` por el campo *WhatsApp Phone* en el cuerpo de la
*Solicitud externa* — pero es opcional, no urgente.

### 5.2-bis El país no se guardaba nunca 🔴 → arreglado

Lo que apareció al tirar de ese hilo, y era más caro que el teléfono:

> De **878 mujeres, 877 tenían `pais` en null.** Y solo **1** tenía un teléfono de verdad
> guardado: 564 filas en null y 313 con el literal `{{phone}}`.

El país se derivaba del teléfono para hablarle **en el turno**, pero no se persistía: solo se
guardaba el que ella dijera en voz alta. Nadie lo dice en voz alta.

Consecuencia directa, en `app/api/cron/recordatorios-apego/route.ts:202`: el recordatorio
hace `paisPorIso(user.pais) ?? detectarPais(user.phone)`. Con las dos columnas vacías, **cada
recordatorio salió con el precio solo en dólares**, sin su equivalente local. Justo lo que
`feedback_paula_precio_moneda_local` dice que no puede faltar.

- **Arreglo:** `paisDeElla()` en `lib/whatsapp/paises.ts` — lo que ella dice manda sobre su
  indicativo (una mexicana con número de Estados Unidos es mexicana), y el número habla
  cuando ella no ha dicho nada. Con test que fija la precedencia.
- **Fichas viejas:** `__tests__/_backfill-pais-manual.test.ts` las repara pidiéndole el
  `whatsapp_phone` a ManyChat. Corre en seco por defecto; escribe con `APLICAR=1`.

**Resultado del backfill, corrido el 2026-08-06:** se repararon **12 fichas de 878** — y están
bien las 12: son **todas** las conversaciones vivas (Colombia 6, Estados Unidos 2, Argentina,
Chile, Costa Rica, Honduras). Las otras 866 devuelven `"status":"deleted"` en ManyChat: el
contacto ya no existe y su número no está en ninguna parte. Las 564 más antiguas no tienen ni
`canal`, y su última interacción va de marzo a julio; ninguna ha escrito en agosto.

> **No es una base de 878 mujeres.** Es una base de ~12 conversaciones vivas y 866 fantasmas.
> A un contacto borrado en ManyChat no se le puede escribir, así que cualquier cuenta de
> alcance que salga de `wa_users` sin filtrar está inflada ~70×.

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
8. **El país no se guardaba en la ficha** (877 de 878 en null), así que los recordatorios
   salían sin el precio en su moneda. Ver 5.2-bis.

### La trampa de contar sin mirar

Al reparar las fichas dimos por hecho que "878 total − 313 con `{{phone}}` = 565 con teléfono
bueno". **Eran 1.** Las otras 564 tenían `phone` en null, que no es lo mismo que tener un
número. Contar por resta inventa datos: si importa, se cuenta la columna de frente.

---

## 7. ANTES DE SUBIR CUALQUIER CAMBIO

```bash
npx tsc --noEmit          # sin errores
npx vitest run            # 207 pasan, 3 saltados (los manuales: 2 simuladores + el backfill)
npx next build            # compila
```

Y bumpear `CACHE_BUST` en el `Dockerfile`.
