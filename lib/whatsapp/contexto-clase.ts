// ============================================================================
// CONTEXTO EN VIVO DE PAULA — qué día es hoy, de qué país te escribe ELLA,
// a qué hora le queda la clase y cuánto le cuesta EN SU MONEDA.
//
// POR QUÉ EXISTE: el modelo NO sabe qué día es hoy ni de dónde escribe ella.
// Antes contestaba "faltan dos días" el día equivocado y daba el precio en COP
// a todo el mundo. Aquí TODO se calcula en código y se le entrega ya resuelto
// al prompt: el modelo no calcula nada, solo lee y repite.
//
// Las horas se calculan con zonas IANA reales (Intl), así que el horario de
// verano de Estados Unidos, Chile o España sale bien solo, sin tocar nada.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. LA CLASE — ESTO ES LO ÚNICO QUE SE EDITA PARA LA PRÓXIMA CLASE
// ---------------------------------------------------------------------------

export const CLASE = {
  /** false = Paula vuelve a vender Apego Detox normal (se apaga la campaña). */
  activa: true,

  nombre: 'Recuperando mi Ser',

  /**
   * Instante EXACTO de inicio, en UTC.
   * 2026-07-31T01:00:00Z = jueves 30 de julio de 2026, 8:00 PM hora Colombia.
   * Para la próxima clase: cambiar solo esta línea (Colombia es UTC-5 todo el
   * año, así que 8:00 PM Colombia = 01:00 UTC del día siguiente).
   */
  inicioISO: '2026-07-31T01:00:00Z',

  /** Duración en vivo. Mientras dura, Paula dice "está en vivo ahora". */
  duracionHoras: 3,

  /**
   * ⚠️ CONFIRMAR ANTES DE DESPLEGAR: se mantiene la landing que ya está viva y
   * a la que apuntan los anuncios publicados. Si "Recuperando mi Ser" estrena
   * página propia, cambiar esta línea (y solo esta).
   */
  landing: 'https://historiasdelamente.com/volver-a-mi',

  /** Nequi solo para Colombia. */
  nequi: { numero: '3116329202', monto: '25.000 COP' },

  /** WhatsApp directo de Javier (soporte de acceso, no venta). */
  soporte: '+57 300 1681053',

  /** La clase queda grabada → después de que pase, todavía se puede vender. */
  quedaGrabada: true,
} as const;

/** Precio ancla en dólares. Todo lo demás es su equivalencia local. */
const PRECIO_USD = '7 USD';

// ---------------------------------------------------------------------------
// 2. PAÍSES — indicativo telefónico → zona horaria + moneda
// ---------------------------------------------------------------------------

export type Pais = {
  iso: string;
  nombre: string;
  /** Indicativos SIN el "+". El más largo gana (1809 antes que 1). */
  prefijos: string[];
  /** Zona IANA de referencia. */
  tz: string;
  /** Ciudad que se nombra al dar la hora. */
  ciudad: string;
  /** Precio ya formateado para decirlo tal cual. */
  precio: string;
  /**
   * true  = cifra oficial de la campaña o país que usa dólar (se dice exacta).
   * false = equivalencia aproximada de 7 USD (se dice "unos ...").
   */
  precioExacto: boolean;
  /** Países con más de una zona horaria. */
  zonasExtra?: Array<{ etiqueta: string; tz: string }>;
};

/**
 * Precios locales: Colombia y México son las cifras oficiales de la campaña.
 * El resto son equivalencias aproximadas de 7 USD — Paula las dice como "unos
 * X" y siempre puede apoyarse en los 7 USD, que es lo que realmente cobra la
 * pasarela. Para ajustar una moneda: cambiar el string y ya.
 */
export const PAISES: Pais[] = [
  { iso: 'CO', nombre: 'Colombia', prefijos: ['57'], tz: 'America/Bogota', ciudad: 'Colombia', precio: '25.000 COP', precioExacto: true },
  { iso: 'MX', nombre: 'México', prefijos: ['52'], tz: 'America/Mexico_City', ciudad: 'Ciudad de México', precio: '120 MXN', precioExacto: true,
    zonasExtra: [{ etiqueta: 'Cancún', tz: 'America/Cancun' }, { etiqueta: 'Tijuana', tz: 'America/Tijuana' }] },
  // +1 = Estados Unidos y Canadá. No se puede separar por el indicativo, así
  // que se dan las cuatro zonas y Paula pregunta la ciudad si necesita precisión.
  { iso: 'US', nombre: 'Estados Unidos o Canadá', prefijos: ['1'], tz: 'America/New_York', ciudad: 'Miami / Nueva York', precio: PRECIO_USD, precioExacto: true,
    zonasExtra: [
      { etiqueta: 'Chicago / Houston', tz: 'America/Chicago' },
      { etiqueta: 'Denver', tz: 'America/Denver' },
      { etiqueta: 'Los Ángeles', tz: 'America/Los_Angeles' },
    ] },
  { iso: 'PE', nombre: 'Perú', prefijos: ['51'], tz: 'America/Lima', ciudad: 'Lima', precio: '26 PEN', precioExacto: false },
  { iso: 'EC', nombre: 'Ecuador', prefijos: ['593'], tz: 'America/Guayaquil', ciudad: 'Ecuador', precio: PRECIO_USD, precioExacto: true },
  { iso: 'CL', nombre: 'Chile', prefijos: ['56'], tz: 'America/Santiago', ciudad: 'Santiago', precio: '6.500 CLP', precioExacto: false },
  { iso: 'AR', nombre: 'Argentina', prefijos: ['54'], tz: 'America/Argentina/Buenos_Aires', ciudad: 'Buenos Aires', precio: '9.000 ARS', precioExacto: false },
  { iso: 'VE', nombre: 'Venezuela', prefijos: ['58'], tz: 'America/Caracas', ciudad: 'Caracas', precio: PRECIO_USD, precioExacto: true },
  { iso: 'ES', nombre: 'España', prefijos: ['34'], tz: 'Europe/Madrid', ciudad: 'España', precio: '6,50 EUR', precioExacto: false },
  { iso: 'GT', nombre: 'Guatemala', prefijos: ['502'], tz: 'America/Guatemala', ciudad: 'Guatemala', precio: '54 GTQ', precioExacto: false },
  { iso: 'SV', nombre: 'El Salvador', prefijos: ['503'], tz: 'America/El_Salvador', ciudad: 'El Salvador', precio: PRECIO_USD, precioExacto: true },
  { iso: 'HN', nombre: 'Honduras', prefijos: ['504'], tz: 'America/Tegucigalpa', ciudad: 'Honduras', precio: '180 HNL', precioExacto: false },
  { iso: 'NI', nombre: 'Nicaragua', prefijos: ['505'], tz: 'America/Managua', ciudad: 'Nicaragua', precio: '260 NIO', precioExacto: false },
  { iso: 'CR', nombre: 'Costa Rica', prefijos: ['506'], tz: 'America/Costa_Rica', ciudad: 'Costa Rica', precio: '3.600 CRC', precioExacto: false },
  { iso: 'PA', nombre: 'Panamá', prefijos: ['507'], tz: 'America/Panama', ciudad: 'Panamá', precio: PRECIO_USD, precioExacto: true },
  { iso: 'BO', nombre: 'Bolivia', prefijos: ['591'], tz: 'America/La_Paz', ciudad: 'Bolivia', precio: '48 BOB', precioExacto: false },
  { iso: 'PY', nombre: 'Paraguay', prefijos: ['595'], tz: 'America/Asuncion', ciudad: 'Paraguay', precio: '52.000 PYG', precioExacto: false },
  { iso: 'UY', nombre: 'Uruguay', prefijos: ['598'], tz: 'America/Montevideo', ciudad: 'Uruguay', precio: '280 UYU', precioExacto: false },
  { iso: 'DO', nombre: 'República Dominicana', prefijos: ['1809', '1829', '1849'], tz: 'America/Santo_Domingo', ciudad: 'Santo Domingo', precio: '430 DOP', precioExacto: false },
  { iso: 'PR', nombre: 'Puerto Rico', prefijos: ['1787', '1939'], tz: 'America/Puerto_Rico', ciudad: 'Puerto Rico', precio: PRECIO_USD, precioExacto: true },
  { iso: 'CU', nombre: 'Cuba', prefijos: ['53'], tz: 'America/Havana', ciudad: 'Cuba', precio: PRECIO_USD, precioExacto: true },
  { iso: 'BR', nombre: 'Brasil', prefijos: ['55'], tz: 'America/Sao_Paulo', ciudad: 'São Paulo', precio: '38 BRL', precioExacto: false },
];

/** Se prueba del prefijo más largo al más corto: 1809 (RD) antes que 1 (USA). */
const PREFIJOS_ORDENADOS: Array<{ prefijo: string; pais: Pais }> = PAISES
  .flatMap((pais) => pais.prefijos.map((prefijo) => ({ prefijo, pais })))
  .sort((a, b) => b.prefijo.length - a.prefijo.length);

/**
 * Deduce el país por el indicativo del teléfono.
 *
 * ManyChat manda el número en formato internacional (WhatsApp siempre lo es),
 * así que basta con el prefijo. Si no hay número o no calza ningún indicativo
 * devuelve null: es MEJOR no saber que adivinar mal — un +1 de Miami tiene
 * indicativos de área que arrancan en 3 igual que un celular colombiano, y
 * confundirlos le daría a ella la hora y la moneda equivocadas.
 */
export function detectarPais(telefono?: string | null): Pais | null {
  if (!telefono) return null;
  // Deja solo dígitos y quita el prefijo internacional de marcación (00).
  let n = String(telefono).replace(/\D/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  if (!n) return null;
  const hit = PREFIJOS_ORDENADOS.find(({ prefijo }) => n.startsWith(prefijo));
  return hit ? hit.pais : null;
}

// ---------------------------------------------------------------------------
// 3. FORMATO DE FECHAS Y HORAS
// ---------------------------------------------------------------------------

const TZ_COLOMBIA = 'America/Bogota';

/** "8:00 PM" — ASCII, sin los "p. m." raros de es-CO. */
function hora12(fecha: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(fecha);
}

/** "jueves 30 de julio" (Intl mete una coma que aquí sobra). */
function fechaLarga(fecha: Date, tz: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: tz, weekday: 'long', day: 'numeric', month: 'long',
  }).format(fecha).replace(',', '');
}

/** "2026-07-24" en la zona pedida — para restar días de calendario. */
function fechaISO(fecha: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(fecha);
}

/** Días de calendario entre dos fechas, contados en la zona indicada. */
function diasDeCalendario(desde: Date, hasta: Date, tz: string): number {
  const a = Date.parse(`${fechaISO(desde, tz)}T00:00:00Z`);
  const b = Date.parse(`${fechaISO(hasta, tz)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

// ---------------------------------------------------------------------------
// 4. CUENTA REGRESIVA
// ---------------------------------------------------------------------------

export type EstadoClase = 'futura' | 'en_vivo' | 'pasada';

export type CuentaRegresiva = {
  estado: EstadoClase;
  /** Días de calendario que faltan (0 = hoy, 1 = mañana). Negativo si ya pasó. */
  dias: number;
  /** La frase exacta que Paula debe usar: "faltan 6 días", "es HOY"... */
  frase: string;
};

export function cuentaRegresiva(ahora: Date): CuentaRegresiva {
  const inicio = new Date(CLASE.inicioISO);
  const fin = new Date(inicio.getTime() + CLASE.duracionHoras * 3_600_000);
  const dias = diasDeCalendario(ahora, inicio, TZ_COLOMBIA);

  if (ahora >= fin) {
    const pasaron = Math.abs(dias);
    return {
      estado: 'pasada',
      dias,
      frase: pasaron === 0 ? 'la clase YA TERMINÓ (fue hoy)'
        : pasaron === 1 ? 'la clase YA PASÓ (fue ayer)'
        : `la clase YA PASÓ (hace ${pasaron} días)`,
    };
  }

  if (ahora >= inicio) {
    return { estado: 'en_vivo', dias: 0, frase: 'la clase ESTÁ EN VIVO AHORA MISMO' };
  }

  if (dias >= 2) return { estado: 'futura', dias, frase: `faltan ${dias} días` };
  if (dias === 1) return { estado: 'futura', dias, frase: 'es MAÑANA' };

  // Es hoy y todavía no empieza.
  const minutos = Math.round((inicio.getTime() - ahora.getTime()) / 60_000);
  if (minutos >= 120) return { estado: 'futura', dias: 0, frase: `es HOY, faltan ${Math.floor(minutos / 60)} horas` };
  if (minutos >= 60) return { estado: 'futura', dias: 0, frase: 'es HOY, falta poco más de una hora' };
  return { estado: 'futura', dias: 0, frase: `es HOY, faltan ${minutos} minutos` };
}

// ---------------------------------------------------------------------------
// 5. EL BLOQUE QUE SE LE INYECTA AL PROMPT
// ---------------------------------------------------------------------------

/** "unos 26 PEN (7 USD)" para equivalencias; "120 MXN" para cifras oficiales. */
function precioDe(pais: Pais): string {
  if (pais.precioExacto) return pais.precio;
  return `unos ${pais.precio} (${PRECIO_USD})`;
}

/**
 * Los datos de ELLA ya resueltos, para código que arma texto a mano
 * (recordatorios, plantillas) sin tener que repetir estos cálculos.
 * Sin teléfono cae a dólares y a la hora Colombia, que es la referencia neutra.
 */
export function datosParaElla(telefono?: string | null): {
  pais: Pais | null;
  /** "120 MXN" · "unos 26 PEN (7 USD)" · "7 USD" */
  precio: string;
  /** "7:00 PM (hora de Ciudad de México)" · "8:00 PM hora Colombia" */
  horaClase: string;
  /** "jueves 30 de julio" — en la zona de ella (en España cae al día siguiente). */
  fechaClase: string;
} {
  const inicio = new Date(CLASE.inicioISO);
  const pais = detectarPais(telefono);
  if (!pais) {
    return {
      pais: null,
      precio: PRECIO_USD,
      horaClase: `${hora12(inicio, TZ_COLOMBIA)} hora Colombia`,
      fechaClase: fechaLarga(inicio, TZ_COLOMBIA),
    };
  }
  return {
    pais,
    precio: precioDe(pais),
    horaClase: `${hora12(inicio, pais.tz)} (hora de ${pais.ciudad})`,
    fechaClase: fechaLarga(inicio, pais.tz),
  };
}

/** Tabla compacta de respaldo: sirve si ELLA dice su país en el chat. */
function tablaReferencia(inicio: Date): string {
  return PAISES
    .map((p) => `${p.nombre} ${hora12(inicio, p.tz)} · ${precioDe(p)}`)
    .join(' | ');
}

function bloqueSuPais(pais: Pais | null, ahora: Date, inicio: Date): string {
  if (!pais) {
    return `## 📱 NO SABES DE QUÉ PAÍS TE ESCRIBE
No llegó su número, así que NO sabes dónde está ni en qué moneda paga.
- NUNCA asumas Colombia y NUNCA des el precio en pesos colombianos por defecto.
- Si pregunta la hora o el precio: dile el precio en dólares (${PRECIO_USD}) y, en la MISMA frase, pregúntale con naturalidad desde qué país te escribe para darle su hora exacta.
- En cuanto ella diga su país, usa la tabla de abajo y dale SU hora y SU moneda.`;
  }

  const lineas = [
    `## 📱 ELLA TE ESCRIBE DESDE: ${pais.nombre}`,
    `- Su hora local en este momento: ${hora12(ahora, pais.tz)}.`,
    `- La clase EN SU HORA: ${fechaLarga(inicio, pais.tz)}, ${hora12(inicio, pais.tz)} (hora de ${pais.ciudad}).`,
    `- Su precio: ${precioDe(pais)}.`,
  ];

  if (pais.zonasExtra?.length) {
    const extras = pais.zonasExtra.map((z) => `${z.etiqueta} ${hora12(inicio, z.tz)}`).join(', ');
    lineas.push(`- Ojo, ${pais.nombre} tiene varias zonas horarias: ${extras}. Si necesitas precisión, pregúntale en qué ciudad está.`);
  }

  lineas.push('- Cuando hables de HORA o de PRECIO usa ESTOS valores, no los de Colombia.');
  return lineas.join('\n');
}

/**
 * Bloque de contexto en vivo que se antepone al prompt de Paula.
 * Todo aquí viene calculado: el modelo no suma días ni convierte horas.
 */
export function bloqueContextoVivo(ahora: Date, telefono?: string | null): string {
  const inicio = new Date(CLASE.inicioISO);
  const pais = detectarPais(telefono);
  const cuenta = cuentaRegresiva(ahora);

  const instrucciones = cuenta.estado === 'pasada'
    ? (CLASE.quedaGrabada
      ? `- NO digas que la clase es "el jueves" ni la vendas como si fuera a pasar: ${cuenta.frase}.
- Lo que SÍ vendes ahora es el acceso completo con LA GRABACIÓN de la clase, más todo lo que venía incluido. Dilo claro y sin rodeos: se la puede ver cuando quiera.`
      : `- ${cuenta.frase}. NO la vendas como si fuera a pasar. Avísale que ya pasó y ofrécele avisarle de la próxima.`)
    : cuenta.estado === 'en_vivo'
      ? `- ${cuenta.frase}. Si quiere entrar, que asegure su lugar YA en el link — todavía alcanza, y además queda grabada.`
      : `- Cuando ella pregunte cuánto falta, responde exactamente: "${cuenta.frase}". NO inventes otro número, NO digas otro día.`;

  return `# ⏰ RELOJ Y CALENDARIO — CALCULADO POR EL SISTEMA, ES LA VERDAD
Esto NO lo adivines ni lo calcules tú: ya viene resuelto. Léelo y úsalo tal cual.

- Hoy es ${fechaLarga(ahora, TZ_COLOMBIA)} de ${new Intl.DateTimeFormat('es-CO', { timeZone: TZ_COLOMBIA, year: 'numeric' }).format(ahora)}. En Colombia son las ${hora12(ahora, TZ_COLOMBIA)}.
- La clase "${CLASE.nombre}" es el ${fechaLarga(inicio, TZ_COLOMBIA)}, ${hora12(inicio, TZ_COLOMBIA)} hora Colombia.
- 👉 ${cuenta.frase.toUpperCase()}
${instrucciones}

${bloqueSuPais(pais, ahora, inicio)}

## 🌎 SI ELLA TE DICE SU PAÍS, SACA DE AQUÍ SU HORA Y SU PRECIO
${tablaReferencia(inicio)}
Los precios con "unos" son la equivalencia aproximada de ${PRECIO_USD}; si dudas, di el valor en dólares, que es el que cobra la página.
`;
}
