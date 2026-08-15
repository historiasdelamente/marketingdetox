# PAULA — ESTADO AL 2026-08-15

> Documento de traspaso. Escrito para retomar el trabajo en una conversación nueva.
> Sustituye a `PAULA-ESTADO-2026-08-06.md` en todo lo que se contradiga; lo de allí que no
> aparezca aquí (arquitectura de archivos, cómo leer Supabase, el simulador) sigue vigente.

---

## 1. QUÉ CAMBIÓ EN ESTAS 24 HORAS

Paula pasó de `gpt-4.1-mini` a **`google/gemini-3.7-flash`** y su sistema conversacional se
**reconstruyó entero**. El sistema viejo (v1) sigue en el código, intacto y funcional, detrás
de un interruptor.

**El número que lo justificó:** 21 de 29 conversaciones de agosto recibieron el mismo bloque
de viñetas **byte-idéntico**, y **107 links entregados produjeron 1 compradora registrada**.

Javier, 2026-08-14: *"las últimas conversaciones son exactamente iguales (…) no te guíes por
el guion que tienes ahí: debes reconstruirlo (…) que escribas en un lenguaje humano"*.

---

## 2. ESTADO EXACTO AHORA MISMO

| Cosa | Valor |
|---|---|
| Commit desplegado | `d51256e` |
| `version` del endpoint | `2026-08-15-revert-a-b8a08e1` |
| Modelo | `google/gemini-3.7-flash` (principal y extractor) |
| `PAULA_PROMPT` | `v2` — **el sistema nuevo está ENCENDIDO** |
| `PAULA_MAX_TOKENS` | `3000` |
| Producción y GitHub | sincronizados |

**Variables en EasyPanel — no se tocan.** `PAULA_PROMPT` no lleva versiones de código: es un
interruptor de dos posiciones. `v2` = sistema nuevo; borrar la línea = vuelve el v1 intacto.
La versión del código va en `CACHE_BUST` del Dockerfile y se ve en el campo `version` del
endpoint.

```bash
curl -s "https://paula-bot-marketingdetox.ya3fud.easypanel.host/api/whatsapp/webhook"
```

⚠️ **El despliegue NO es automático.** Hay que darle a *Implementar* en EasyPanel, servicio
`marketingdetox`, y **bumpear `CACHE_BUST`** en cada cambio o Docker reutiliza la capa vieja.

---

## 3. LA ARQUITECTURA V2 — «CUATRO HECHOS, CERO LIBRETO»

**La inversión:** el v1 decidía QUÉ decir (cascada de 9 ramas en `bloqueGuion`, folleto
ensamblado, 10 saludos sembrados) y el modelo rellenaba. El v2 entrega **HECHOS** y el modelo
decide leyendo el último mensaje de ella.

| Archivo | Qué hace |
|---|---|
| `lib/whatsapp/prompt-v2.ts` | El prompt de principios (~12k) + el ensamblador. **El corazón.** |
| `lib/whatsapp/pendiente.ts` | 📮 «le pediste el correo y llegó otra cosa» (caso Alejandra) |
| `lib/whatsapp/entrada.ts` | Higiene: placeholders, audios-como-URL → transcriptor, imágenes |
| `content/PAULA-CONOCIMIENTO-V2.md` | Lo que puede afirmar (**borrador, falta firma de Javier**) |

Los cuatro hechos que recibe el modelo: **📊 DATOS** (precio, monedas, links, horarios en la
hora de ella, y el bloque 💳 de seguridad del pago: Skool + Stripe) · **🧾/🔁** (ya-dicho y
sus últimos mensajes) · **📮 PENDIENTE** · **⚠️ crisis/handoff** (lo único que es orden).

**Las dos pruebas que matan el guion**, dentro del prompt: la *del dedo* (señala en SU mensaje
la palabra de la que sale tu frase) y la *de la otra mujer* (si le sirve a otra, se rehace).

**`[SILENCIO]`:** el modelo puede pedir no responder; el código concede solo con doble
condición (monosílabo/emoji + el turno anterior de Paula no preguntó nada).

**Fusible de tamaño:** test en `paula-v2-contrato.test.ts`, techo 20.500. Para añadir algo al
prompt hay que borrar algo. **Se mide, no se estima** — el techo estuvo mal calibrado por
medir con historial corto (19.6k) cuando el test usa el largo de Jennifer (20.071).

---

## 4. LO QUE SE ARREGLÓ ADEMÁS (activo con o sin el flag)

- **Cron de recordatorios NEUTRALIZADO** (`RECORDATORIOS_V1`): su copy mandaba *"¿Qué es lo
  que te detiene hoy?"* — la pregunta del freno que Javier prohibió el 2026-08-09.
- **Handoff por terapia**, que **no estaba implementado**: de 18 formas verosímiles de pedir
  terapia pasaban 5; ahora 17, con 0 falsos positivos sobre preguntas de producto.
- **`linkJavier(motivo)`**: el wa.me dice a qué viene (terapia / pago / compra), en vez del
  texto genérico para las cinco razones.
- **`PROBLEMA_PAGO_RE`** amplía «no me deja seguir/avanzar» — así se perdió María del Pilar,
  la compra más caliente del mes.
- **`formato.ts`**: la raya de prosa ya no se lee como viñeta, una viñeta con link/cifra/hora
  no se tira en silencio, y la lista no se suelda con la prosa (el ladrillo de 433 chars).
- **Extractor**: `max_tokens` 300→1000 y timeout 12→20s (con Gemini el JSON salía cortado y
  `extraerDatos` devolvía null **en silencio**). Historial 20→40.
- **Candado `javier_a_toda_hora`**: la comunidad está 24/7, Javier no.

---

## 5. LO PENDIENTE, POR ORDEN

### 5.1 La motivación antes del precio — HECHA Y REVERTIDA 🔴

Javier, 2026-08-15: *"el objetivo es VENDER Apego Detox, y si están interesadas, la terapia.
Pero de forma amable, DAR BENEFICIOS (…) no des el precio sin antes hacer una motivación
real"*.

Se diseñó (workflow de 14 agentes), se implementó, se probó contra Gemini y se desplegó como
`53d4fb3`. **Javier pidió revertirlo y se revirtió** (`d51256e`) sin decir qué le disgustó.

**El trabajo NO se perdió: `git cherry-pick 53d4fb3` lo reaplica.** Lo que traía:
- Beneficio vs catálogo por **gramática** (si delante cabe «el programa incluye», es catálogo)
- **Restar antes que sumar** (no la detiene que le falte contenido: la detiene lo que entrar
  le cuesta — exponerse, esperar, quedar amarrada)
- Los cuatro casos del precio cerrados, incluido el que Javier vetó implícitamente
- Absorbía MODO CONSERJE y TERAPIA en la sección del programa

⚠️ **Hallazgo del estudio que sigue siendo válido pase lo que pase:** el precio prematuro no
ocurrió ni una vez en agosto (solo 3 de 29 oyeron un número). El fracaso real es el simétrico:
**tres mujeres llegaron al sí y ninguna supo cuánto costaba** — Magda («ya mismo lo hago»),
María del Pilar («ya voy a entrar»), Sandra («reuniré el dinero»). Ninguna compró.

**Lo primero al retomar: preguntarle a Javier qué vio que no le gustó.**

### 5.2 Firma de `PAULA-CONOCIMIENTO-V2.md` 🟡

Es su documento y está como borrador. Dos decisiones suyas dentro: muere el método de
objeciones con «¿es solo eso lo que te detiene?» (era la pregunta prohibida servida al
modelo), y el tratamiento del precio.

### 5.3 El follow-up a 24h — la fuga más cara 🔴

**0 de 29 conversaciones tuvieron reintento tras el silencio.** El cron existe
(`app/api/cron/recordatorios-apego/route.ts`, con flags en Supabase y ventana de 24h) pero
está apagado por su copy prohibido. La reescritura: UN solo toque, redactado por el modelo con
una frase literal de ella. **No se enciende sin OK explícito de Javier** (`RECORDATORIOS_V2`).

### 5.4 El conserje del checkout 🟡

Magda y María del Pilar, las dos más calientes del mes, **se perdieron creando la cuenta en
Skool** y nadie las siguió. Parte está hecho (`PROBLEMA_PAGO_RE` ampliado); falta que el
sistema persiga activamente el «¿entraste?».

### 5.5 Precio de la consulta individual — SIN DEFINIR 🟡

Paula ya le dice a la gente que Javier atiende citas. El precio no existe en el sistema, así
que cuando preguntan, la respuesta la improvisa él cada vez.

### 5.6 Borrado del v1 🟢

A +7 días de v2 estable: cascada de `bloqueGuion`, `estilo()`, `bloqueIntencion`, los 10
saludos, el folleto ensamblado, `unTurnoDeEscucha`, y el flag `PAULA_PROMPT`.

### 5.7 Javier interviene y Paula no lo ve 🟡

**Sus mensajes NUNCA llegan al sistema** (verificado: 0 en 400 mensajes entrantes). Escribe
desde el WhatsApp de Paula y ManyChat no dispara el webhook. Consecuencia: Paula sigue
vendiendo encima de él, y lee las respuestas que la mujer le da a él como si fueran para ella.
No hay pausa ni tercer tipo de mensaje en todo el código. Falta: auto-pausa tras handoff, o un
botón de silencio por conversación.

---

## 6. CÓMO VERIFICAR CUALQUIER CAMBIO

```bash
npx tsc --noEmit && npx vitest run && npx next build   # 465 tests, 3 saltados
```

**El simulador** corre el pipeline real contra Gemini real sin tocar producción:

```bash
$env:PAULA_PROMPT="v2"; $env:RESET="1"; $env:MSG="Hola"; npx vitest run __tests__/_chat-manual.test.ts
$env:MSG="tu mensaje"; npx vitest run __tests__/_chat-manual.test.ts
```

Lo que ella vería queda en `chat-salida.txt`. **Guiones de muertes reales** que deben pasar:
el «🙏🙏» de Jennifer (calidez, cero datos; al segundo monosílabo, silencio) · «Alejandra
campos» tras pedirle el correo · «cuánto cuesta?» en el mensaje 2 · «no me deja seguir» ·
«me da miedo poner mi tarjeta» · «quisiera formar parte del grupo» como primer mensaje.

**Leer la base es lo que ha encontrado casi todos los fallos.** Los tests pasaban en verde
mientras producción hacía cosas raras.

---

## 7. LAS TRES LECCIONES QUE COSTARON DINERO

1. **Lo que el modelo tiene delante, lo copia.** Toda frase de ejemplo se convirtió en el
   guion. En el prompt v2 solo hay instrucciones de cómo decidir, jamás qué escribir.
2. **El número se mide, no se estima.** El fusible se calibró con un historial corto y estuvo
   en rojo sin que se notara. Lo mismo con `PAULA_MAX_TOKENS`: bajarlo «para ahorrar» es un
   error — es un techo, no una compra, y los modelos que razonan gastan parte de él pensando.
3. **Leer la base, no los tests.** Las 29 transcripciones de agosto encontraron lo que 465
   tests en verde no vieron.
