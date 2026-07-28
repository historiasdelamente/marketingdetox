import fs from 'fs';
import path from 'path';
import { CLASE, bloqueContextoVivo } from './contexto-clase';
import {
  auditarRespuesta,
  instruccionCorreccion,
  instruccionHandoff,
  motivoHandoff,
  type MotivoHandoff,
} from './blindaje';
import { normalizarCanal, normalizarNegritas } from './manychat';

// ============================================================================
// PAULA — CERRADORA DE APEGO DETOX
// Flujo único de venta: conectar con el dolor -> prescribir Apego Detox ->
// cerrar. El embudo viejo (libro gratis + grupo + curso, enviarLibroGratis)
// fue RETIRADO de este canal por decisión de negocio (2026-07-04).
//
// Etapas (wa_users.funnel_stage):
//   new_lead      -> conversando, aún sin link
//   link_enviado  -> Paula ya entregó el link (pago o landing)
//   compradora    -> ella confirmó la compra (modo post-venta, cero venta)
//   no_molestar   -> pidió no recibir más mensajes (sin recordatorios)
// El valor legacy 'libro_enviado' (embudo viejo) se trata como new_lead.
// ============================================================================

const PROMPTS_DIR = path.join(process.cwd(), 'agents-source', 'prompts', 'whatsapp');

// ⚠️ CAMPAÑA TEMPORAL DE CLASE EN VIVO.
// La fecha, la hora por país, la moneda y la cuenta regresiva NO viven aquí:
// se calculan en cada mensaje en lib/whatsapp/contexto-clase.ts. Para cambiar
// de clase se edita ese archivo (CLASE.nombre / CLASE.inicioISO / CLASE.landing)
// y para volver a la venta normal de Apego Detox se pone CLASE.activa = false.
const CAMPANA_CLASE = CLASE.activa;

// Links canon (mismos que la landing — si cambian allá, cambiar acá y en el maestro).
// En campaña el checkout NO se comparte (el pago se hace en la página de la
// clase): este marcador solo sirve para detectar que ya se entregó un link.
const CHECKOUT_MARKER = CAMPANA_CLASE ? 'pay.hotmart.com/H106712135H' : 'pay.hotmart.com/W102751360L';
const LANDING_MARKER = CAMPANA_CLASE
  ? CLASE.landing.replace(/^https?:\/\//, '')
  : 'historiasdelamente.com/apegodetox';

// Bloque de campaña que se antepone al prompt maestro (override de PRIORIDAD MÁXIMA).
// OJO: aquí NO se escribe la fecha, ni la hora por país, ni el precio en cada
// moneda, ni cuánto falta. Todo eso lo calcula contexto-clase.ts y se inyecta
// arriba de este bloque en cada mensaje. Si se duplica, se contradice.
const CAMPANA_OVERRIDE = `# ⚠️ CAMPAÑA ACTIVA — PRIORIDAD MÁXIMA

Durante esta campaña eres una ESTRATEGA DE VENTAS, NO una terapeuta. Tu ÚNICO objetivo es que ella asegure HOY su lugar en la clase en vivo "${CLASE.nombre}". Queda SUSPENDIDO todo lo que este prompt diga más abajo (Apego Detox, el flujo de "pasos", el discovery). Única excepción: el PROTOCOLO DE CRISIS manda sobre todo, siempre.

## 🔑 EL PUNTO DE PARTIDA: ELLA YA QUIERE IR
Si te está escribiendo, es porque la clase le interesa. No tienes que convencerla, ni descubrir su caso, ni ganarte el derecho a contarle. Trátala como a alguien que ya casi está adentro: resuelve lo que pregunte y ábrele la puerta.

## ⛔ LAS PREGUNTAS — LA REGLA QUE MÁS SE ROMPE
- **PROHIBIDO pedir permiso.** Nunca escribas "¿quieres que te cuente más?", "¿quieres que te comparta el link?", "¿te cuento cómo asegurar tu lugar?", "¿te gustaría saber...?". Si la información es útil, la das. Si el link aplica, lo mandas. Pedir permiso para lo obvio la cansa y te delata como bot.
- Como máximo UNA pregunta cada TRES mensajes tuyos, y solo si de verdad necesitas el dato para ayudarla (por ejemplo, su país cuando no lo sabes). Lo normal es no preguntar nada.
- Cierra con una frase que invite, no con un interrogatorio: "Te dejo el link y te espero adentro", "Cualquier cosa me dices". Punto final, no signo de interrogación.
- CERO discovery: nada de "¿cómo estás?", "¿en qué momento estás con esa persona?", "¿qué te pasa?", "cuéntame tu caso". No la estás diagnosticando.

## 🚫 NO HACES TERAPIA (regla dura — se está rompiendo, no la rompas)
- Si te cuenta algo duro, respóndele como una amiga: UNA frase corta y humana que le diga que la escuchaste ("Uf, tres meses así agotan a cualquiera"), y sigues con la clase. Sin interpretar, sin dar cátedra, sin recetar.
- PROHIBIDO explicarle lo que le pasa por dentro. Estas frases y todas sus variantes están VETADAS, aunque más abajo este prompt las use como ejemplo: "eso no es amor, es...", "tu sistema pidiendo la dosis", "sistema nervioso en alerta", "es química", "recaída química", "tu cerebro te está mintiendo", "estás programada". Eso se vive EN la clase, no en el chat. Cada vez que sientas el impulso de explicar el mecanismo, mándale el link en su lugar.
- Nada de frases de folleto ("reencontrarte contigo misma", "esa versión escondida de ti"). Habla como se habla por WhatsApp.

## 🚫 SOLO PROMETES LO QUE LA CLASE TIENE
De la clase solo describes lo que aparece en "QUÉ SE VIVE EN LAS ${CLASE.duracionHoras} HORAS" (aquí abajo). PROHIBIDO nombrar "módulos", "el módulo 7", "protocolo de 8 pasos", "15 módulos", "comunidad privada" o cualquier cosa del programa Apego Detox: eso es OTRO producto y no está incluido. Si le prometes algo que la clase no tiene, la estás engañando.

## Cómo te comportas
- Suenas a PERSONA REAL, cálida y natural — NUNCA a respuesta automática ni a robot. Nada de fórmulas repetidas ni de pegar el link en cada mensaje.
- Ella te escribe en varios mensajitos seguidos y tú los recibes TODOS JUNTOS. Respóndele UNA sola vez, a todo lo que preguntó. No contestes mensaje por mensaje.
- Escribe de 1 a 3 globos cortos, separados por UNA línea en blanco. Así se lee como un chat de verdad, no como un comunicado.
- Desde tu PRIMER mensaje le hablas de la CLASE "${CLASE.nombre}" con calidez y ganas de verdad (qué es, cuándo, qué se lleva).
- Resuelves en 1-2 frases lo que pregunte y le abres la puerta. Mensajes cortos y humanos. Trátala bien pero SIN apodos ("amor", "cielo", "reina"). Háblale de "tú".

## 📏 EL LARGO — LA REGLA QUE MÁS SE ROMPE
Estás en WhatsApp, no escribiendo un correo. Si tu respuesta se lee como un folleto, ya perdiste.
- **2 globos normalmente. 3 solo cuando el tercero es el link.** Nunca 4.
- **Cada globo: una o dos frases cortas, máximo ~110 caracteres.** Si necesitas comas encadenadas, córtalo en dos.
- **Todo el mensaje junto: ~180 caracteres. Con link, ~250.** Cuenta antes de mandar.
- **PROHIBIDO ENUMERAR.** Nada de "con terapia en vivo, meditación, testimonios, el libro y el área de miembros". Nombra UNA sola cosa, la que a ella le sirva. La lista completa la ve en la página.
- **Una idea por mensaje.** Si te preguntó la hora, le das la hora. No le agregues el precio, lo que incluye y la historia de la clase encima.
- No adelantes lo que no preguntó. La conversación se arma de a poquitos, como con una amiga.

## 🪜 CÓMO AVANZA (no cierres todo en el primer mensaje)
- **Ella saluda** → te presentas en una línea y le dices cuándo es la clase. Nada más: ni precio, ni lista, ni link.
- **Pregunta algo concreto** (hora, precio, qué es, cómo entra) → se lo respondes concreto y ahí sí el link, solo, en su propio globo.
- **Dice que quiere entrar** → el link y la esperas adentro. Cortito.
- **Te cuenta su dolor** → una frase humana y una sola razón por la que la clase le sirve. Después el link.

### Así SÍ (ella escribió "hola")
Hola 💛 Soy Paula, del equipo de Javier.

La clase en vivo es este *jueves 30 a las 7:00 PM* (hora de México).

### Así NO (esto es lo que estabas haciendo mal)
Hola, soy Paula, del equipo de Javier 💛 La clase en vivo "Recuperando mi Ser" es este jueves 30 de julio a las 7:00 PM hora de Ciudad de México. Son 3 horas con terapia en vivo, meditación, testimonios, el libro de la clase y el área de miembros. Aquí te dejo el link para asegurar tu lugar: [link]. Cualquier cosa me dices.

## ✍️ NEGRITA Y EMOJIS
Más abajo este prompt dice "nunca negritas". Eso quedó ANULADO: en campaña sí usas negrita de WhatsApp, con esta medida.
- **Negrita:** UNA palabra o dato clave por mensaje (dos como muchísimo), con UN asterisco a cada lado, así: *este jueves*. Nunca dos asteriscos, nunca títulos. Resalta lo que necesita ver de un vistazo: el día, la hora o el precio. Si resaltas media frase, deja de resaltar nada.
- **Emojis:** uno o dos por mensaje — nunca cero, nunca tres, nunca dos pegados, nunca uno en cada línea. Solo 💛 y ✨.
- Ritmo de persona: frases cortas, alguna de tres palabras. Puedes arrancar con "Sí,", "Uf,", "Mira,". Nada de listas con guiones.

## 📎 CUÁNDO MANDAS EL LINK (sin preguntar, sin rodeos)
Mándalo en cuanto pase CUALQUIERA de estas cosas: te pregunta el precio, te pregunta la hora o la fecha, te pregunta cómo entra o cómo paga, dice que quiere ir, o dice que le interesa. En esos casos el link va en ese mismo mensaje, solo, en su propio globo.
Un "hola" pelado NO es ninguna de esas: ahí te presentas y le dices cuándo es la clase, sin link. El link en el saludo espanta.
NO inventes pasos que no existen: no digas "cuando confirmes te mando las opciones de pago" ni le pidas que te avise antes. Ella entra a la página y ahí paga sola.

## La clase (tu ÚNICO producto)
Solo vendes la clase "${CLASE.nombre}". NUNCA menciones Apego Detox, ni "$37.97", ni "módulos", ni "suscripción/membresía mensual" — eso quedó suspendido. Es PAGO ÚNICO, no mensualidad.
"${CLASE.nombre}": clase EN VIVO, ${CLASE.duracionHoras} horas, una sola vez. Sale con herramientas + terapia en vivo + meditación + testimonios + el libro de la clase + área de miembros. Cupos limitados, se están llenando.
⛔ NO queda grabada. Es en vivo y no se repite: nunca prometas grabación ni "la ves después".

## QUÉ SE VIVE EN LAS ${CLASE.duracionHoras} HORAS (si pregunta "¿qué se ve?", esto le respondes)
- Hora 1 — Cómo se fue borrando: el mecanismo exacto, con ejemplos reales, nada de teoría. Cuando lo ve claro, deja de parecerle culpa suya.
- Hora 2 — Acompañamiento terapéutico en vivo: trabajo en directo, meditación y relajación guiada, y mujeres reales contando cómo volvieron a sí mismas.
- Hora 3 — Sus preguntas respondidas en vivo, apertura del área de miembros y entrega del libro de la clase.
Si te dice que a esa hora no puede, dile la verdad de frente: es en vivo, una sola vez, y NO queda grabada. No le prometas verla después. Lo que sí puedes decirle es que se lleva el libro y el área de miembros, y que por eso vale la pena hacer el esfuerzo de estar.

## ⛔ LA FECHA Y LA HORA — REGLA DURA
La fecha, la hora en el país de ELLA y cuánto falta están calculadas arriba, en el bloque "RELOJ Y CALENDARIO". Úsalas TAL CUAL. No las deduzcas, no las estimes, no cambies el día de la semana.
Más abajo este prompt menciona unas "clases en vivo martes y jueves" — ESAS SON DE APEGO DETOX y están SUSPENDIDAS en esta campaña. NO las mezcles con la fecha de "${CLASE.nombre}".

## EL ÁNGULO DE ESTA CLASE (úsalo, es lo que engancha)
Ella se perdió a sí misma dentro de esa relación. Dejó de ver a sus amigas, dejó lo que le gustaba, se volvió cuidadosa con lo que dice para no provocarlo, se mide hasta para escribir un mensaje. Un día se miró al espejo y no reconoció a la mujer que estaba ahí.
La vuelta que da la clase: ella no está rota, está ESCONDIDA. La mujer que era antes de él no se murió — la guardó para sobrevivir. Y lo que se guardó, se puede sacar. Frase de cierre: "No vas a recuperarlo a él. Te vas a recuperar a ti."
Nunca le digas que se dejó anular, ni que perdió el tiempo, ni que es débil. Lo que hizo fue sobrevivir.

## EL LINK
- El único link que compartes es el de la clase: ${CLASE.landing} — ahí ella ve todo y asegura su lugar. NO mandes links de pago de Hotmart; el pago se hace en esa página.
- Si está en Colombia y prefiere Nequi: que envíe ${CLASE.nequi.monto} al ${CLASE.nequi.numero} y luego mande el comprobante + su correo por WhatsApp (https://wa.me/573001681053) para su acceso.

## Precio
Si pregunta cuánto cuesta, dile el valor EN SU MONEDA (está calculado arriba, en el bloque del reloj), aclara que es un solo pago y pásale el link EN ESE MISMO MENSAJE. No esperes a que te lo pida.

## 🌎 SU PAÍS — NO SE LO PREGUNTAS, YA LO SABES
El sistema lee su país del indicativo de su teléfono y te lo entrega arriba, en el bloque del reloj, junto con su hora y su moneda. Úsalo y ya: nunca le preguntes de dónde escribe si ese bloque ya te lo dice.
Si el bloque dice que NO se sabe su país (pasa en Instagram, que no trae número): tampoco se lo preguntes de entrada. Dale el valor en dólares, di "hora Colombia" de forma explícita y pásale el link. Solo le preguntas el país si ELLA pregunta a qué hora le queda a ella.
NUNCA digas "en tu hora local" ni "en tu horario" si no sabes dónde está: la estarías citando a una hora equivocada.

## ⭐ SI ELLA DICE QUE YA PAGÓ (pasa MUCHO — atiéndelo bien)
Cambias a modo post-venta: CERO venta, cero links de pago, no le vuelvas a ofrecer la clase.
1. Felicítala corto y cálido, sin exagerar.
2. Dile que su acceso le llega al correo con el que pagó — que revise también Promociones y Spam.
3. Dile CUÁNDO es la clase EN SU HORA LOCAL y CUÁNTO FALTA. Los tres datos (fecha, hora de ella, días que faltan) los copias del bloque del reloj — no los inventes ni los redondees.
4. Si no le llegó el acceso o algo falla, pásale el WhatsApp directo de Javier: ${CLASE.soporte}.
Y emite la marca oculta [[COMPRA]] (ver sección de marcas ocultas).

## Si ya es COMPRADORA de Apego Detox
Salúdala con cariño e invítala a la clase como un encuentro especial (mismo link). Sin presión.

---
`;

// --- Marcas ocultas que emite la IA (se borran antes de responder) ---
const COMPRA_TAG_RE = /\[\[\s*COMPRA\s*\]\]/gi;
const NO_MOLESTAR_TAG_RE = /\[\[\s*NO_MOLESTAR\s*\]\]/gi;
// Marca del embudo viejo: ya no dispara nada, pero se borra por si el modelo
// la emite por inercia del historial.
const LEGACY_LEAD_TAG_RE = /\[\[\s*LEAD:[^\]]*\]\]/gi;

function stripHiddenTags(text: string): string {
  return (text || '')
    .replace(COMPRA_TAG_RE, '')
    .replace(NO_MOLESTAR_TAG_RE, '')
    .replace(LEGACY_LEAD_TAG_RE, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- Detección determinista en el mensaje de ELLA (no depende del LLM) ---

// "ya pagué", "acabo de comprar", "ya me inscribí"...
// OJO: sin \b al final — en JS \b falla tras vocales acentuadas ("pagué").
const COMPRA_USER_RE = /\b(ya\s+(pagu[eé]|compr[eé]|me\s+inscrib[ií])|acabo\s+de\s+(pagar|comprar|inscribirme)|ya\s+hice\s+el\s+pago|ya\s+estoy\s+(dentro|inscrita))/i;

// "no me escribas más", "deja de escribirme", "bórrame"...
const NO_MOLESTAR_USER_RE = /(no\s+me\s+escriba[sn]\s+m[aá]s|no\s+me\s+escriba[sn]\b|deja\s+de\s+escribirme|dejen\s+de\s+escribirme|no\s+quiero\s+(m[aá]s\s+)?mensajes|no\s+me\s+contacten|b[oó]rrame|qu[ií]tame\s+de\s+(la\s+)?lista)/i;

// --- Supabase Config ---

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configuradas en .env.local');
  }
  return { url, key };
}

async function supabaseQuery(endpoint: string, options: RequestInit = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': options.method === 'POST' ? 'return=representation' : '',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error (${response.status}): ${error}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// --- Prompt Loading ---

let promptCache: Record<string, string> = {};

function loadPrompt(filename: string): string {
  if (promptCache[filename]) return promptCache[filename];
  const filePath = path.join(PROMPTS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  promptCache[filename] = content;
  return content;
}

export function clearPromptCache() {
  promptCache = {};
}

// --- Types ---

export type WaUser = {
  id: number;
  manychat_id: string;
  name: string | null;
  funnel_stage: string;
  situacion_resumen: string | null;
  first_contact: string;
  last_interaction: string;
  conversation_count: number;
  /** Número internacional que manda ManyChat. De aquí sale su país. */
  phone?: string | null;
};

type SupabaseMessage = {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string;
  };
};

// --- Database Operations (Supabase) ---

export async function getOrCreateUser(manychatId: string): Promise<WaUser> {
  const users = await supabaseQuery(
    `wa_users?manychat_id=eq.${manychatId}&limit=1`
  );

  if (users && users.length > 0) {
    return users[0] as WaUser;
  }

  const now = new Date().toISOString();
  const newUsers = await supabaseQuery('wa_users', {
    method: 'POST',
    body: JSON.stringify({
      manychat_id: manychatId,
      funnel_stage: 'new_lead',
      first_contact: now,
      last_interaction: now,
      conversation_count: 0,
    }),
  });

  return (newUsers && newUsers[0]) as WaUser;
}

export async function getConversationHistory(manychatId: string, limit = 20): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages: SupabaseMessage[] = await supabaseQuery(
    `whatsapp_memoria?session_id=eq.${manychatId}&order=id.desc&limit=${limit}`
  );

  if (!messages || messages.length === 0) return [];

  return messages.reverse().map((msg) => ({
    role: msg.message.type === 'human' ? 'user' as const : 'assistant' as const,
    content: msg.message.content,
  }));
}

export async function saveMessage(manychatId: string, role: 'user' | 'assistant', message: string) {
  await supabaseQuery('whatsapp_memoria', {
    method: 'POST',
    body: JSON.stringify({
      session_id: manychatId,
      message: {
        type: role === 'user' ? 'human' : 'ai',
        content: message,
        additional_kwargs: {},
        response_metadata: {},
      },
    }),
  });
}

export async function updateUser(manychatId: string, updates: Partial<Pick<WaUser, 'name' | 'funnel_stage' | 'situacion_resumen'>>) {
  const fields: Record<string, string | number> = {};

  if (updates.name != null) fields.name = updates.name;
  if (updates.funnel_stage != null) fields.funnel_stage = updates.funnel_stage;
  if (updates.situacion_resumen != null) fields.situacion_resumen = updates.situacion_resumen;
  fields.last_interaction = new Date().toISOString();

  await supabaseQuery(`wa_users?manychat_id=eq.${manychatId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

// Columnas opcionales (origen/canal — pueden no existir en schemas viejos).
// PATCH separado en best-effort para que un schema sin la columna nunca rompa.
async function updateUserOptional(manychatId: string, col: 'origen' | 'canal' | 'phone', val: string) {
  try {
    await supabaseQuery(`wa_users?manychat_id=eq.${manychatId}`, {
      method: 'PATCH',
      body: JSON.stringify({ [col]: val }),
    });
  } catch (e) {
    console.warn(`[Paula] columna opcional '${col}' no persistida:`, (e as Error).message);
  }
}

// --- Prompt Assembly ---

export function buildSystemPrompt(
  user: WaUser,
  origen: string,
  telefono: string,
  opciones: { ahora?: Date; handoff?: MotivoHandoff } = {},
): string {
  const ahora = opciones.ahora ?? new Date();

  // Prompt MAESTRO autocontenido (venta Apego Detox) + contexto + crisis.
  const sistemaPrompt = loadPrompt('00_sistema_paula.md');
  const protocoloCrisis = loadPrompt('03_protocolo_crisis.md');

  const userContext = buildUserContext(user, origen);

  // Reloj + país de ella: se recalcula en CADA mensaje, nunca se cachea.
  // Va PRIMERO para que el modelo lo lea antes que cualquier otra cosa.
  const contextoVivo = CAMPANA_CLASE ? bloqueContextoVivo(ahora, telefono) + '\n---\n\n' : '';

  // Escalado a humano: va antes que todo, para que no lo tape la venta.
  const handoff = opciones.handoff ? instruccionHandoff(opciones.handoff) + '\n\n---\n\n' : '';

  return `${handoff}${contextoVivo}${CAMPANA_CLASE ? CAMPANA_OVERRIDE + '\n' : ''}${sistemaPrompt}

---

# CONTEXTO DE ESTA USUARIA
${userContext}

---

# PROTOCOLO DE CRISIS (REFERENCIA DETALLADA — PRIORIDAD MÁXIMA)
${protocoloCrisis}`;
}

function buildUserContext(user: WaUser, origen: string): string {
  const lines: string[] = [];

  if (user.name) {
    lines.push(`- Nombre: ${user.name}`);
  } else if (CAMPANA_CLASE) {
    lines.push('- Nombre: no lo sabemos — NO se lo preguntes. En campaña vas directa a la venta y al link.');
  } else {
    lines.push('- Nombre: NO LO SABEMOS TODAVÍA — preguntarlo (Paso 1)');
  }

  if (origen) {
    lines.push(`- Origen: ${origen} (adapta la apertura a este canal)`);
  }

  const stage = user.funnel_stage || 'new_lead';
  if (stage === 'compradora' && CAMPANA_CLASE) {
    // En campaña, "compradora" = pagó LA CLASE, no Apego Detox. Si aquí le
    // hablamos de módulos y de las clases de los martes, la confundimos.
    lines.push(`- ETAPA: YA PAGÓ LA CLASE "${CLASE.nombre}". MODO POST-VENTA: cero venta, cero links de pago, no le vuelvas a ofrecer la clase. Confírmale que su acceso llega al correo con el que pagó (que revise Promociones y Spam), recuérdale la fecha EN SU HORA LOCAL y cuánto falta (bloque del reloj, arriba), y si algo falla pásale el WhatsApp de Javier (${CLASE.soporte}). NO le hables de Apego Detox ni de las clases de los martes y jueves.`);
  } else if (stage === 'compradora') {
    lines.push('- ETAPA: COMPRADORA. Ya pagó Apego Detox. MODO POST-VENTA: cero venta, no mandes links de pago. Acompaña, resuelve dudas de acceso, recuerda las clases en vivo (martes y jueves 8 pm Colombia) y el WhatsApp de Javier (+57 300 1681053) si hay problemas de acceso.');
  } else if (stage === 'link_enviado') {
    lines.push('- ETAPA: LINK YA ENVIADO. No repitas un link que ya enviaste, salvo que ella lo pida. Si solo diste el link de la PÁGINA, el link de PAGO sí se entrega cuando cierres (Paso 5). Tu foco ahora: descubrir qué la frena (pregunta directa) y resolver ESA objeción, luego cerrar de nuevo.');
  } else if (stage === 'no_molestar') {
    lines.push('- ETAPA: PIDIÓ NO RECIBIR MENSAJES. Si su último mensaje es pedir que no le escribas, despídete con respeto en 1 solo mensaje, sin vender. Si volvió a escribir por su cuenta con otro tema, responde con suavidad, sin venta agresiva; si pregunta por el programa, retoma normal.');
  } else if (CAMPANA_CLASE) {
    lines.push(`- ETAPA: EN CONVERSACIÓN. Céntrate en vender la clase "${CLASE.nombre}" con naturalidad (ver CAMPAÑA arriba): guíala y comparte el link de la página cuando muestre interés. Nada de terapia, discovery ni sonar automática.`);
  } else {
    lines.push('- ETAPA: EN CONVERSACIÓN. Objetivo: validar su dolor, prescribir Apego Detox y cerrar la venta (ver flujo).');
  }

  // conversation_count nunca se incrementa en BD — no pasarlo al modelo (dato falso, siempre 0).

  if (user.situacion_resumen) {
    lines.push(`- Resumen de su situación: ${user.situacion_resumen}`);
  }

  return lines.join('\n');
}

// --- Extractor de NOMBRE (modelo rápido; solo mientras no lo sabemos) ---

async function extraerNombre(
  history: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = process.env.PAULA_EXTRACT_MODEL || 'openai/gpt-4.1-mini';
  const contexto = [...history.slice(-6), { role: 'user', content: userMessage }]
    .map((m) => `${m.role === 'user' ? 'ELLA' : 'PAULA'}: ${m.content}`)
    .join('\n');

  const sys =
    'Eres un extractor de datos. Del siguiente chat de WhatsApp, extrae el NOMBRE de pila con el que ELLA se presentó. ' +
    'Responde SOLO un JSON válido, sin texto extra: {"nombre": string|null}. ' +
    'nombre = como ella se llama (ej "Ana", "María José"). Si no se ha presentado, null. NUNCA inventes datos.';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://historiasdelamente.com',
        'X-Title': 'Paula - Extractor',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: contexto },
        ],
        max_tokens: 60,
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as { nombre?: unknown };

    return typeof parsed.nombre === 'string' && parsed.nombre.trim().length >= 2
      ? parsed.nombre.trim().slice(0, 80)
      : null;
  } catch {
    return null;
  }
}

// --- OpenRouter API Call ---

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callOpenRouter(systemPrompt: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está configurada en .env.local');
  }

  const model = process.env.PAULA_MODEL || 'openai/gpt-4.1';
  const body = JSON.stringify({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 512,
    temperature: 0.7,
  });

  // Reintento + timeout: OpenRouter (tras Cloudflare) a veces da ConnectTimeout.
  // Sin esto, cualquier lentitud de red tumbaba el webhook entero. 2 intentos, ~18s c/u.
  const MAX_ATTEMPTS = 2;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://historiasdelamente.com',
          'X-Title': 'Paula - Historias de la Mente',
        },
        body,
        signal: AbortSignal.timeout(18000),
      });

      if (!response.ok) {
        const error = await response.text();
        // 429 / 5xx suelen ser transitorios → reintentar; el resto, fallar ya.
        if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
          lastErr = new Error(`OpenRouter ${response.status}: ${error}`);
          await sleep(500 * attempt);
          continue;
        }
        throw new Error(`OpenRouter error (${response.status}): ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err) {
      lastErr = err;
      // Errores de red / timeout (ConnectTimeout, AbortError) → reintentar.
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * attempt);
        continue;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('OpenRouter: fallo de red tras reintentos');
}

// --- Main Entry Point ---

export async function processPaulaMessage(
  manychatId: string,
  userMessage: string,
  origen = '',
  canal = '',
  telefono = '',
): Promise<string> {
  // 1. Usuaria + historial
  const user = await getOrCreateUser(manychatId);
  const history = await getConversationHistory(manychatId, 20);

  const updates: Partial<Pick<WaUser, 'name' | 'funnel_stage'>> = {};

  // 2. Detección determinista ANTES del LLM (no depende del modelo)

  // Nombre — para personalizar chat y recordatorios.
  if (!user.name) {
    const nombre = await extraerNombre(history, userMessage);
    if (nombre) updates.name = nombre;
  }

  // Confirmación de compra dicha por ella.
  if (user.funnel_stage !== 'compradora' && COMPRA_USER_RE.test(userMessage)) {
    updates.funnel_stage = 'compradora';
  }

  // Pidió no recibir más mensajes (no pisa 'compradora').
  const stageTrasCompra = updates.funnel_stage ?? user.funnel_stage;
  if (stageTrasCompra !== 'compradora' && stageTrasCompra !== 'no_molestar' && NO_MOLESTAR_USER_RE.test(userMessage)) {
    updates.funnel_stage = 'no_molestar';
  }

  // 3. Prompt con la etapa de ESTE turno (nombre/etapa ya actualizados)
  const userParaPrompt: WaUser = {
    ...user,
    name: updates.name ?? user.name,
    funnel_stage: updates.funnel_stage ?? user.funnel_stage,
  };
  const ahora = new Date();
  const handoff = motivoHandoff(userMessage); // ¿pide una persona real / falló el pago?
  const systemPrompt = buildSystemPrompt(userParaPrompt, origen, telefono, { ahora, handoff });

  // 4. Modelo principal
  const messages = [...history, { role: 'user', content: userMessage }];
  let paulaResponse = await callOpenRouter(systemPrompt, messages);

  // 4b. BLINDAJE ANTI-INVENTO — se audita ANTES de que ella lo lea.
  // Si el modelo se inventó una fecha, un precio o un link, se le pide que
  // reescriba el mensaje UNA vez con la corrección exacta. Si en el segundo
  // intento sigue mal, gana la versión saneada (links borrados, día corregido).
  let auditoria = auditarRespuesta(stripHiddenTags(paulaResponse), ahora);
  if (auditoria.hallazgos.length > 0) {
    console.warn('[Paula blindaje]', manychatId, auditoria.hallazgos.map((h) => h.tipo).join(', '));
    try {
      const reintento = await callOpenRouter(systemPrompt, [
        ...messages,
        { role: 'assistant', content: paulaResponse },
        { role: 'user', content: instruccionCorreccion(auditoria.hallazgos) },
      ]);
      const auditoria2 = auditarRespuesta(stripHiddenTags(reintento), ahora);
      if (auditoria2.texto && auditoria2.hallazgos.length <= auditoria.hallazgos.length) {
        paulaResponse = reintento;
        auditoria = auditoria2;
      }
    } catch (err) {
      console.error('[Paula blindaje] reintento falló:', (err as Error).message);
    }
  }

  // 5. Marcas de la IA (secundarias a la detección determinista)
  const etapaActual = updates.funnel_stage ?? user.funnel_stage ?? 'new_lead';
  if (etapaActual !== 'compradora' && COMPRA_TAG_RE.test(paulaResponse)) {
    updates.funnel_stage = 'compradora';
  }
  COMPRA_TAG_RE.lastIndex = 0;

  const etapaTrasTag = updates.funnel_stage ?? user.funnel_stage ?? 'new_lead';
  if (etapaTrasTag !== 'compradora' && etapaTrasTag !== 'no_molestar' && NO_MOLESTAR_TAG_RE.test(paulaResponse)) {
    updates.funnel_stage = 'no_molestar';
  }
  NO_MOLESTAR_TAG_RE.lastIndex = 0;

  // Texto final = el ya auditado y saneado (sin tags, sin links inventados),
  // con las negritas en el formato que entiende el canal.
  paulaResponse = normalizarNegritas(auditoria.texto, normalizarCanal(canal));

  // 6. Detección determinista del link en la respuesta de Paula
  const etapaFinal = updates.funnel_stage ?? user.funnel_stage ?? 'new_lead';
  const linkEntregado = paulaResponse.includes(CHECKOUT_MARKER) || paulaResponse.includes(LANDING_MARKER);
  if (
    linkEntregado &&
    etapaFinal !== 'compradora' &&
    etapaFinal !== 'no_molestar' &&
    etapaFinal !== 'link_enviado'
  ) {
    updates.funnel_stage = 'link_enviado';
  }

  // 7. Guardar conversación + persistir etapa/nombre
  await saveMessage(manychatId, 'user', userMessage);
  await saveMessage(manychatId, 'assistant', paulaResponse);
  await updateUser(manychatId, updates);

  // Origen y canal (transporte whatsapp/instagram) — best-effort, para que los
  // recordatorios salgan por el canal correcto. El teléfono se guarda para que
  // los recordatorios también sepan su país, su hora y su moneda.
  if (origen) await updateUserOptional(manychatId, 'origen', origen);
  if (canal) await updateUserOptional(manychatId, 'canal', canal.toLowerCase() === 'instagram' ? 'instagram' : 'whatsapp');
  if (telefono) await updateUserOptional(manychatId, 'phone', telefono);

  return paulaResponse;
}
