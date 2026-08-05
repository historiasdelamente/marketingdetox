import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { auditarRespuesta, instruccionCorreccion, motivoHandoff, quitarVentaEnCrisis } from "@/lib/whatsapp/blindaje";
import { aplicarFormato } from "@/lib/whatsapp/formato";
import { normalizarNegritas, partirEnGlobos } from "@/lib/whatsapp/manychat";


// Dos instantes de referencia. Ya no hay fecha de clase que cuadrar: el
// programa se vende igual cualquier día, porque se entra HOY.
const LUNES_27 = new Date("2026-07-27T15:00:00Z"); // 10:00 AM Colombia
const VIERNES_31 = new Date("2026-07-31T15:00:00Z");

/** Un solo producto desde el 2026-08-05: siempre se audita en modo 'apego'. */
const auditarClase = (texto: string, ahora: Date) => auditarRespuesta(texto, ahora, "apego");

const SKOOL = "https://www.skool.com/historias-de-la-mente-4978/about";

describe("blindaje anti-invento — Apego Detox en Skool", () => {
  it("deja el link de Skool perfecto, escriba el modelo lo que escriba", () => {
    const casos = [
      "Entras aquí: www.skool.com/historias-de-la-mente-4978/about",   // sin https
      "Entras aquí: https://www.skool.com/historias-de-la-mente-4978/about.",  // punto pegado
      "Entras aquí: https://www.skool.com/historias-de-la-mente-4978/about/",  // barra de más
      "Entras aquí: (https://www.skool.com/historias-de-la-mente-4978/about)", // entre paréntesis
    ];
    for (const caso of casos) {
      const { texto } = auditarClase(caso, LUNES_27);
      expect(texto).toContain(SKOOL);
      // Y sin basura pegada que rompa el clic.
      expect(texto).not.toMatch(/about[.)]/);
    }
  });

  it("borra un link que Paula se inventó", () => {
    const { texto, hallazgos } = auditarClase(
      `Entra aquí ${SKOOL} y también a https://bit.ly/abc123`,
      LUNES_27,
    );
    expect(texto).toContain("skool.com/historias-de-la-mente-4978");
    expect(texto).not.toContain("bit.ly");
    expect(hallazgos.map((h) => h.tipo)).toContain("link_inventado");
  });

  it("no molesta cuando la respuesta está bien", () => {
    const { hallazgos } = auditarClase(
      `Son $20 USD al mes, con 7 días de garantía. Entras aquí: ${SKOOL}`,
      LUNES_27,
    );
    expect(hallazgos).toHaveLength(0);
  });

  it("no la deja hacer terapia por chat", () => {
    const { hallazgos } = auditarClase(
      "Eso que sientes no es amor, es tu sistema nervioso pidiendo la dosis",
      LUNES_27,
    );
    expect(hallazgos.map((h) => h.tipo)).toContain("psicoeducacion");

    // Acompañar sin explicar sí está permitido.
    const ok = auditarClase("Uf, tres meses así agotan a cualquiera.", LUNES_27);
    expect(ok.hallazgos).toHaveLength(0);
  });

  it("la forma canónica anti-terapia pasa limpia", () => {
    // Te escuché → eso se trabaja adentro → ahí hay más mujeres como ella.
    // Si el blindaje marcara esto, Paula no podría decir lo único que debe.
    const { hallazgos } = auditarClase(
      "Te entiendo. Eso es justo lo que se trabaja adentro, y ahí no vas a estar sola.",
      LUNES_27,
    );
    expect(hallazgos).toHaveLength(0);
  });

  it("un número de módulos que ella no va a encontrar se marca", () => {
    expect(
      auditarClase("Son 9 módulos", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("modulos_inventados");
    // 17 es el número real de la página de Skool.
    expect(
      auditarClase("Son 17 módulos de terapia guiada", LUNES_27).hallazgos.map((h) => h.tipo),
    ).not.toContain("modulos_inventados");
  });

  it("es suscripción: vendérselo como pago único se marca", () => {
    expect(
      auditarClase("Son 20 dólares, un solo pago", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("pago_unico");
    expect(
      auditarClase("¡Corre, queda el último cupo!", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("urgencia_falsa");
  });

  it("un precio en dólares que no es el de hoy se marca", () => {
    expect(
      auditarClase("Son $37.97 al mes", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("precio_falso");
  });

  it("la cifra en moneda local NO se confunde con un precio falso", () => {
    // Es el falso positivo que habría quemado el reintento en cada cierre: la
    // conversión es aproximada por diseño, y el único número que tiene que
    // cuadrar exacto es el dólar.
    const { hallazgos } = auditarClase(
      "Son $20 USD al mes, unos 80.000 pesos. Tienes 7 días de garantía.",
      LUNES_27,
    );
    expect(hallazgos.map((h) => h.tipo)).not.toContain("precio_falso");
  });

  it("la instrucción de corrección le dice el precio y la plataforma correctos", () => {
    const { hallazgos } = auditarClase("Son $37.97 al mes", LUNES_27);
    const correccion = instruccionCorreccion(hallazgos, "apego", LUNES_27);
    expect(correccion).toContain("$20 USD al mes");
    expect(correccion).toMatch(/7 días de garantía/);
  });

  it("no la deja escribir un folleto", () => {
    const folleto =
      "Hola, soy Paula, del equipo de Javier. Apego Detox es la plataforma para salir del apego emocional: tiene 17 modulos de terapia guiada paso a paso, cuatro horas de talleres en vivo cada semana con Javier, una comunidad activa a toda hora, meditaciones y ejercicios para el cuerpo, mas el super bonus con PDFs de trabajo. Aqui te dejo el link para que entres hoy mismo.";
    const { hallazgos } = auditarClase(folleto, LUNES_27);
    expect(hallazgos.map((h) => h.tipo)).toContain("demasiado_largo");
  });

  it("el link no cuenta para el largo (se ve como tarjeta, no como texto)", () => {
    const corto = `Perfecto, aquí entras:\n\n${SKOOL}\n\nTe espero adentro 💛`;
    expect(auditarClase(corto, LUNES_27).hallazgos).toHaveLength(0);
  });

  it("detecta cuándo hay que pasarla con una persona", () => {
    expect(motivoHandoff("quiero hablar con una persona")).toBe("pide_humano");
    expect(motivoHandoff("esto es un bot?")).toBe("pide_humano");
    expect(motivoHandoff("el link no me deja pagar")).toBe("problema_pago");
    expect(motivoHandoff("hola, vi el video")).toBeNull();
  });
});

describe("negritas por canal", () => {
  it("convierte el markdown del modelo al formato de WhatsApp", () => {
    expect(normalizarNegritas("Es este **jueves 30**", "whatsapp")).toBe("Es este *jueves 30*");
    expect(normalizarNegritas("Cuesta __25.000 COP__", "whatsapp")).toBe("Cuesta *25.000 COP*");
  });

  it("en Instagram no deja asteriscos sueltos (allá no hay negrita)", () => {
    expect(normalizarNegritas("Es este **jueves 30** a las *8 PM*", "instagram")).toBe(
      "Es este jueves 30 a las 8 PM",
    );
  });

  it("de la tercera negrita en adelante quita el resaltado, no el texto", () => {
    const r = normalizarNegritas("*uno* y *dos* y *tres* y *cuatro*", "whatsapp");
    expect(r).toBe("*uno* y *dos* y tres y cuatro");
    expect((r.match(/\*[^*]+\*/g) || []).length).toBe(2);
  });

  it("no toca un mensaje que ya viene bien", () => {
    const ok = "Es este *jueves 30 de julio* 💛";
    expect(normalizarNegritas(ok, "whatsapp")).toBe(ok);
  });
});

describe("globos de WhatsApp", () => {
  it("respeta las líneas en blanco del modelo", () => {
    expect(partirEnGlobos("Hola, qué gusto.\n\nLa clase es el jueves.")).toEqual([
      "Hola, qué gusto.",
      "La clase es el jueves.",
    ]);
  });

  it("un marcador raro en el texto no se convierte en link", () => {
    // El enmascarado interno de URLs no puede tocar texto normal.
    const conNumeros = "Son 3 horas y 2 sorpresas, este *jueves 30* 💛";
    expect(normalizarNegritas(conNumeros, "whatsapp")).toBe(conNumeros);
  });

  it("no mutila un link con guiones bajos ni con asteriscos", () => {
    const raro = "Entra aquí: https://historiasdelamente.com/a__b__c*d";
    expect(normalizarNegritas(raro, "whatsapp")).toContain("/a__b__c*d");
    expect(normalizarNegritas(raro, "instagram")).toContain("/a__b__c*d");
  });

  it("NUNCA parte un link en dos (el punto de .com no es fin de frase)", () => {
    const largo =
      "Uf, la clase es en vivo y solo se hace una vez, este jueves 30 de julio a las 8:00 PM hora Colombia. " +
      "Si a esa hora no puedes, te aviso: no se repite. Aquí te dejo el link para que asegures tu lugar hoy: " +
      "https://historiasdelamente.com/volver-a-mi 💛";

    const globos = partirEnGlobos(largo);
    const conLink = globos.filter((g) => g.includes("historiasdelamente"));
    expect(conLink).toHaveLength(1);
    expect(conLink[0]).toContain("https://historiasdelamente.com/volver-a-mi");
    globos.forEach((g) => expect(g).not.toMatch(/^com\//));
  });

  it("saca el link a su propio globo", () => {
    const globos = partirEnGlobos(
      "Te cuento: son tres horas en vivo y te llevas la grabación completa https://historiasdelamente.com/volver-a-mi",
    );
    expect(globos).toHaveLength(2);
    expect(globos[1]).toBe("https://historiasdelamente.com/volver-a-mi");
  });

  it("aunque haya que recortar globos, el link NUNCA se pierde", () => {
    const parrafos = [
      "Primero esto que te cuento.",
      "Después esto otro.",
      "Y también esto.",
      "Y esto de acá.",
      "Y una cosa más.",
      "Y otra más todavía.",
      "Y ya la última.",
      "https://historiasdelamente.com/volver-a-mi",
    ].join("\n\n");

    const globos = partirEnGlobos(parrafos);
    expect(globos.length).toBeLessThanOrEqual(7);
    expect(globos.some((g) => g.includes("https://historiasdelamente.com/volver-a-mi"))).toBe(true);
  });

  it("el precio NUNCA se parte en dos globos por el punto de los miles", () => {
    // Salió en producción: "Vale 25." / "000 COP". Ella lee un precio que no
    // existe justo en el mensaje que tenía que cerrar la venta.
    const largo =
      "La clase es este jueves con Javier Vieira y dura tres horas completas en vivo. " +
      "Vale 25.000 COP pago único, y también te llevas el libro con ejercicios. " +
      "Es un espacio para trabajar, no para escuchar.";

    const globos = partirEnGlobos(largo);
    expect(globos.length).toBeGreaterThan(1); // se partió, pero bien
    expect(globos.some((g) => g.includes("25.000 COP"))).toBe(true);
    globos.forEach((g) => expect(g).not.toMatch(/\b25\.$|^000\b/));
  });

  it("con DOS links, el recorte no se traga el segundo", () => {
    // El caso real: Paula cierra por Nequi (WhatsApp de Javier) y además le
    // deja la página para pagar con tarjeta. Antes bastaba con que sobreviviera
    // el primero, y la mujer se quedaba sin la página donde pagar.
    const parrafos = [
      "Perfecto, te cuento cómo.",
      "Mandas el pago por Nequi al número de Javier Vieira.",
      "Después le pasas el comprobante y tu correo por aquí:",
      "https://wa.me/573001681053",
      "Si prefieres tarjeta, es en esta página.",
      "Y ahí mismo apartas tu lugar.",
      "Cualquier cosa me dices.",
      "Aquí sigo si necesitas algo.",
      "https://historiasdelamente.com/volver-a-mi",
    ].join("\n\n");

    const globos = partirEnGlobos(parrafos);
    expect(globos.length).toBeLessThanOrEqual(7);
    expect(globos.some((g) => g.includes("https://wa.me/573001681053"))).toBe(true);
    expect(globos.some((g) => g.includes("https://historiasdelamente.com/volver-a-mi"))).toBe(true);
  });

  it("parte por frases un párrafo demasiado largo", () => {
    const largo = "Frase de relleno bastante larga para probar el corte. ".repeat(12);
    const globos = partirEnGlobos(largo);
    expect(globos.length).toBeGreaterThan(1);
    globos.forEach((g) => expect(g.length).toBeLessThanOrEqual(340));
  });
});

// ---------------------------------------------------------------------------
// El corazón del pedido: esperar 10 segundos y responder UNA vez.
// ---------------------------------------------------------------------------

const procesarMock = vi.fn();
const responderMock = vi.fn();

vi.mock("@/lib/whatsapp/paula", () => ({
  processPaulaMessage: (...args: unknown[]) => procesarMock(...args),
}));

vi.mock("@/lib/whatsapp/manychat", async () => {
  const actual = await vi.importActual<typeof import("@/lib/whatsapp/manychat")>(
    "@/lib/whatsapp/manychat",
  );
  return {
    ...actual,
    responderComoHumana: (...args: unknown[]) => responderMock(...args),
  };
});

describe("buffer de 10 segundos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    procesarMock.mockReset().mockResolvedValue("Claro, es este jueves 💛");
    responderMock.mockReset().mockResolvedValue(1);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("junta los mensajitos en ráfaga y responde UNA sola vez", async () => {
    const { encolarMensaje } = await import("@/lib/whatsapp/buffer");

    encolarMensaje({ manychatId: "111", texto: "hola", telefono: "+521234567890" });
    await vi.advanceTimersByTimeAsync(2000);
    encolarMensaje({ manychatId: "111", texto: "vi el video" });
    await vi.advanceTimersByTimeAsync(3000);
    encolarMensaje({ manychatId: "111", texto: "es este jueves?" });

    // A los 9 s del último mensaje todavía no contestó: sigue esperándola.
    await vi.advanceTimersByTimeAsync(9000);
    expect(procesarMock).not.toHaveBeenCalled();

    // Pasados los 10 s de silencio, responde una vez con todo junto.
    await vi.advanceTimersByTimeAsync(1500);
    expect(procesarMock).toHaveBeenCalledTimes(1);
    expect(procesarMock.mock.calls[0][1]).toBe("hola\nvi el video\nes este jueves?");
    // Y su teléfono viaja hasta Paula, para darle SU hora y SU moneda.
    expect(procesarMock.mock.calls[0][4]).toBe("+521234567890");
    expect(responderMock).toHaveBeenCalledTimes(1);
  });

  it("no mezcla a dos mujeres distintas", async () => {
    const { encolarMensaje } = await import("@/lib/whatsapp/buffer");

    encolarMensaje({ manychatId: "222", texto: "cuánto vale" });
    encolarMensaje({ manychatId: "333", texto: "a qué hora es" });
    await vi.advanceTimersByTimeAsync(11000);

    expect(procesarMock).toHaveBeenCalledTimes(2);
    const mensajes = procesarMock.mock.calls.map((c) => c[1]).sort();
    expect(mensajes).toEqual(["a qué hora es", "cuánto vale"]);
  });

  it("no se queda esperando para siempre si ella no para de escribir", async () => {
    const { encolarMensaje } = await import("@/lib/whatsapp/buffer");

    for (let i = 0; i < 10; i++) {
      encolarMensaje({ manychatId: "444", texto: `mensaje ${i}` });
      await vi.advanceTimersByTimeAsync(6000); // escribe cada 6 s, nunca calla 10
    }
    // El tope de 30 s ya la obligó a contestar.
    expect(procesarMock).toHaveBeenCalled();
  });

  it("si ella escribe mientras Paula piensa, no se pierde ese mensaje", async () => {
    const { encolarMensaje } = await import("@/lib/whatsapp/buffer");

    let liberar: (v: string) => void = () => {};
    procesarMock.mockImplementationOnce(
      () => new Promise<string>((res) => { liberar = res; }),
    );

    encolarMensaje({ manychatId: "555", texto: "hola" });
    await vi.advanceTimersByTimeAsync(10500);
    expect(procesarMock).toHaveBeenCalledTimes(1);

    // Llega mientras el primer turno sigue en el aire.
    encolarMensaje({ manychatId: "555", texto: "ah y una cosa más" });
    liberar("respuesta 1");
    await vi.advanceTimersByTimeAsync(11000);

    expect(procesarMock).toHaveBeenCalledTimes(2);
    expect(procesarMock.mock.calls[1][1]).toBe("ah y una cosa más");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LAS LISTAS NO EXISTEN — 2026-08-03
//
// Hasta esta fecha estos mismos tests comprobaban lo CONTRARIO: que la lista de
// viñetas llegara entera y en un solo globo. Javier la mandó eliminar porque en
// el chat real hace justo lo que no se veía en la prueba — *"le estás haciendo
// como si fuera un flyer a las personas"*. Una mujer que acaba de contar que
// lleva nueve años con alguien no recibe una lista: recibe una frase.
//
// Lo que se prueba aquí es la GARANTÍA POR CÓDIGO. Se ha pedido por prompt
// muchas veces y el modelo siempre volvió a la lista; ahora `formato.ts` la
// borra después de que él escribe, así que ya no depende de que obedezca.
// ═══════════════════════════════════════════════════════════════════════════

describe("ninguna lista llega al chat", () => {
  it("de una lista de cuatro dolores queda UNA frase, sin el bullet", () => {
    const texto = [
      "Esta clase es para ti si te pasa algo de esto:",
      "• Quieres dejarlo, y a los tres días ya le estás contestando",
      "• No duermes bien, y cuando duermes te despiertas pensando en él",
      "• Tienes una angustia en el pecho que no se te quita con nada",
    ].join("\n");

    const salida = aplicarFormato(texto);

    expect(salida).not.toContain("•");
    // La primera se cose a la frase que abría la lista, en minúscula.
    expect(salida).toContain("Esta clase es para ti si te pasa algo de esto: quieres dejarlo");
    // Las otras dos se van: pegarlas todas sería el mismo folleto en prosa.
    expect(salida).not.toContain("No duermes bien");
    expect(salida).not.toContain("angustia en el pecho");
  });

  it("una viñeta suelta se vuelve frase, sin perder el resto del mensaje", () => {
    const texto = [
      "Uf, nueve años.",
      "- Pides perdón por cosas que no hiciste",
      "https://historiasdelamente.com/volver-a-mi",
    ].join("\n");

    const salida = aplicarFormato(texto);
    expect(salida).toContain("Pides perdón por cosas que no hiciste.");
    expect(salida).not.toMatch(/^\s*-\s/m);
    expect(salida).toContain("https://historiasdelamente.com/volver-a-mi");
  });

  it("también mata las listas numeradas", () => {
    const salida = aplicarFormato("Son dos pasos:\n1. Mandas el pago\n2. Mandas el comprobante");
    expect(salida).not.toMatch(/^\s*\d+[.)]\s/m);
    expect(salida).toContain("Son dos pasos: mandas el pago.");
  });

  it("el blindaje marca la lista para que el modelo la reescriba", () => {
    // El código la arregla igual, pero se gasta el reintento en que la escriba
    // él: una frase escogida por el modelo siempre queda mejor que la que
    // salva el código a la fuerza.
    const conLista = "Esto es para ti si:\n• No duermes\n• Lloras sin saber por qué";
    expect(auditarClase(conLista, LUNES_27).hallazgos.map((h) => h.tipo)).toContain("vinetas");
  });

  it("un mensaje en prosa no dispara nada", () => {
    const enProsa = [
      "Uf, nueve años pidiendo perdón por cosas que ni hiciste.",
      "",
      "Eso es justo lo que se trabaja adentro. Son $20 USD al mes, unos 80.000 pesos.",
      "",
      SKOOL,
    ].join("\n");

    expect(auditarClase(enProsa, LUNES_27).hallazgos).toHaveLength(0);
  });
});

describe("máximo tres globos, y el link es uno de los tres", () => {
  it("baja de cuatro globos a tres FUSIONANDO, sin perder una frase", () => {
    // ⚠️ Antes esto recortaba por el final, y la auditoría contra el modelo
    // real enseñó lo que costaba: el cierre por Nequi salía sin la frase que
    // explica por qué son DOS números distintos — justo la que evita que ella
    // lea "estafa" y cierre el chat. Lo último que escribe el modelo no es
    // siempre el relleno, así que ya no se tira nada: se junta.
    const cuatro = [
      "Uf, nueve años.",
      "Es este jueves a las 8. Son 25.000, pago único.",
      "https://historiasdelamente.com/volver-a-mi",
      "Ahí la ves completa ✨",
    ].join("\n\n");

    const globos = partirEnGlobos(aplicarFormato(cuatro));
    expect(globos).toHaveLength(3);
    expect(globos).toContain("https://historiasdelamente.com/volver-a-mi");
    // Las dos frases de texto viajan juntas en un globo, y no se pierde ninguna.
    const todo = globos.join(" ");
    expect(todo).toContain("Uf, nueve años.");
    expect(todo).toContain("Son 25.000, pago único.");
    expect(todo).toContain("Ahí la ves completa");
  });

  it("un link en mitad de la frase no deja una preposición colgando", () => {
    // Salió en la auditoría real contra el modelo: *"le envías el comprobante y
    // tu correo por WhatsApp a para que te dé acceso"*. Al aislar la URL, el
    // "a" que la anunciaba se quedó pegado a lo que venía después.
    const globos = partirEnGlobos(
      "Luego le envías el comprobante y tu correo a https://wa.me/573001681053 para que te dé acceso.",
    );

    expect(globos).toEqual([
      "Luego le envías el comprobante y tu correo para que te dé acceso.",
      "https://wa.me/573001681053",
    ]);
  });

  it("pero el link al final de la frase se queda donde estaba", () => {
    const globos = partirEnGlobos("Aquí aseguras tu lugar:\n\nhttps://historiasdelamente.com/volver-a-mi");
    expect(globos.at(-1)).toContain("historiasdelamente.com/volver-a-mi");
    expect(globos.join(" ")).toContain("Aquí aseguras tu lugar");
  });

  it("con varios links, el texto se junta y cada link conserva su globo", () => {
    // El caso del handoff: ella no tiene tarjeta, así que va el WhatsApp de
    // Javier además del link del programa. Ninguna de las dos cosas se cae.
    const conDosLinks = [
      "Son $20 USD al mes, unos 80.000 pesos.",
      "Si no tienes tarjeta, escríbele a Javier Vieira y él te lo resuelve.",
      "https://wa.me/573001681053",
      "Y si sí la tienes, entras directo aquí:",
      SKOOL,
    ].join("\n\n");

    const globos = partirEnGlobos(aplicarFormato(conDosLinks));
    expect(globos).toHaveLength(3);

    const todo = globos.join(" ");
    expect(todo).toContain("$20 USD al mes");
    expect(globos.some((g) => g.includes("wa.me/573001681053"))).toBe(true);
    expect(globos.some((g) => g.includes("skool.com"))).toBe(true);
  });

  it("recortar NUNCA se come el link, aunque venga de último", () => {
    const conLinkAlFinal = [
      "Uf, nueve años.",
      "Eso exacto es lo que se trabaja adentro.",
      "Y no vas a estar sola: la comunidad está activa a cualquier hora.",
      "Son $20 al mes.",
      SKOOL,
    ].join("\n\n");

    const globos = partirEnGlobos(aplicarFormato(conLinkAlFinal));
    expect(globos.length).toBeLessThanOrEqual(3);
    expect(globos).toContain(SKOOL);
  });

  it("el blindaje marca los mensajes de más de tres globos", () => {
    const cinco = [
      "Hola, soy Paula.",
      "Trabajo con Javier Vieira.",
      "El programa se llama Apego Detox.",
      "Son 20 dólares.",
      "Te espero 💛",
    ].join("\n\n");

    expect(auditarClase(cinco, LUNES_27).hallazgos.map((h) => h.tipo)).toContain("demasiado_largo");
  });
});

describe("pedir permiso disfrazado de cortesía", () => {
  it("caza el '¿Quieres?' suelto al final", () => {
    // Salió en una auditoría real: "…te mando el link de la página. ¿Quieres?".
    // Es la misma pedida de permiso, sin nombrar lo que va a mandar, así que
    // se le escapaba al patrón viejo.
    expect(
      auditarClase("Si prefieres tarjeta te mando el link. ¿Quieres?", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("pide_permiso");
    expect(
      auditarClase("Te lo dejo aquí. ¿Te parece?", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("pide_permiso");
  });

  it("pero deja pasar las preguntas de cierre, que sí empujan", () => {
    for (const ok of [
      "¿Quieres entrar el jueves?",
      "¿Te espero el jueves?",
      "¿Pagas por Nequi o con tarjeta?",
    ]) {
      expect(auditarClase(ok, LUNES_27).hallazgos.map((h) => h.tipo)).not.toContain("pide_permiso");
    }
  });
});

describe("crisis — la venta se para por código, no por buena voluntad", () => {
  it("detecta violencia e ideación antes que cualquier motivo comercial", () => {
    expect(motivoHandoff("me pega cuando toma")).toBe("crisis");
    expect(motivoHandoff("le tengo miedo, me amenaza")).toBe("crisis");
    expect(motivoHandoff("ya no quiero vivir")).toBe("crisis");
    // Gana incluso a un cierre feliz en el mismo mensaje.
    expect(motivoHandoff("ya pagué pero anoche me golpeó")).toBe("crisis");
  });

  it("no confunde el dolor normal con una crisis", () => {
    for (const normal of [
      "me duele mucho todo esto",
      "estoy cansada de llorar",
      "y si no me funciona?",
      "quiero dejarlo pero no puedo",
    ]) {
      expect(motivoHandoff(normal)).not.toBe("crisis");
    }
  });

  it("en crisis no sale ni un link de venta, ni un precio, ni una viñeta", () => {
    const conVenta = [
      "Lo que me cuentas es serio 💛",
      "• No duermes bien, y cuando duermes te despiertas pensando en él",
      "Son 25.000, pago único.",
      "https://historiasdelamente.com/volver-a-mi",
      "En Colombia llama al 155, es gratis y atienden 24 horas.",
      "Si estás en peligro ahora, marca 123.",
    ].join("\n");

    const limpio = quitarVentaEnCrisis(conVenta);

    expect(limpio).not.toContain("historiasdelamente.com/volver-a-mi");
    expect(limpio).not.toContain("25.000");
    expect(limpio).not.toContain("•");
    // Y lo que sí necesita se queda intacto.
    expect(limpio).toContain("155");
    expect(limpio).toContain("123");
    expect(limpio).toContain("Lo que me cuentas es serio");
  });
});

describe("'él' es el hombre de ella, nunca Javier", () => {
  it("convierte 'en vivo con él' en 'con Javier Vieira'", () => {
    const { texto } = auditarClase("Es este jueves a las 8, en vivo con él, tres horas.", LUNES_27);
    expect(texto).toContain("con Javier Vieira");
    expect(texto).not.toMatch(/con él/i);
  });

  it("no toca el 'él' que sí es el hombre de ella", () => {
    const { texto } = auditarClase("Te despiertas pensando en él y le revisas los estados.", LUNES_27);
    expect(texto).toContain("pensando en él");
  });

  it("NUNCA toca el 'él' de una viñeta — ahí él siempre es el marido", () => {
    // Salió en una auditoría real con la versión bruta de esta reparación:
    // "• Ya no sabes qué te gusta a ti sin consultarlo con él" se convirtió en
    // "…con Javier Vieira", que es el revés exacto del error que se arregla.
    const lista = [
      "Esta clase es para ti si te pasa algo de esto:",
      "• Ya no sabes qué te gusta a ti sin consultarlo con él",
      "• Pides perdón por cosas que no hiciste, con tal de que no se enoje",
    ].join("\n");

    const { texto } = auditarClase(lista, LUNES_27);
    expect(texto).toContain("consultarlo con él");
    expect(texto).not.toContain("consultarlo con Javier");
  });

  it("sí desambigua cuando el 'él' es quien da la clase", () => {
    for (const caso of [
      "Es este jueves a las 8, en vivo con él, tres horas.",
      "La clase es con él, este jueves.",
    ]) {
      const { texto } = auditarClase(caso, LUNES_27);
      expect(texto).toContain("Javier Vieira");
    }
  });
});
