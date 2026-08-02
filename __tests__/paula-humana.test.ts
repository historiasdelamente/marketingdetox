import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { auditarRespuesta, instruccionCorreccion, motivoHandoff, quitarVentaEnCrisis } from "@/lib/whatsapp/blindaje";
import { normalizarNegritas, partirEnGlobos } from "@/lib/whatsapp/manychat";


// La clase es TODOS los jueves, 8 PM Colombia, y la fecha la calcula
// `proximaClase()` de programa.ts. Desde el lunes 27 el jueves es el 30 de
// julio; desde el viernes 31, el 6 de agosto.
const LUNES_27 = new Date("2026-07-27T15:00:00Z"); // 10:00 AM Colombia
const VIERNES_31 = new Date("2026-07-31T15:00:00Z"); // la del 30 ya se dictó

// El blindaje audita con reglas OPUESTAS según lo que se esté vendiendo, y su
// modo por defecto es 'apego'. Estas pruebas piden 'clase' explícito.
const auditarClase = (texto: string, ahora: Date) => auditarRespuesta(texto, ahora, "clase");

describe("blindaje anti-invento — campaña de clase en vivo", () => {
  it("deja el link de la clase perfecto, escriba el modelo lo que escriba", () => {
    const CANON = "https://historiasdelamente.com/volver-a-mi";
    const casos = [
      "Entra aquí: historiasdelamente.com/volver-a-mi",           // sin https
      "Entra aquí: www.historiasdelamente.com/volver-a-mi",       // con www
      "Entra aquí: https://historiasdelamente.com/volver-a-mi.",  // punto pegado
      "Entra aquí: https://historiasdelamente.com/volver-a-mi/",  // barra de más
      "Entra aquí: (https://historiasdelamente.com/volver-a-mi)", // entre paréntesis
    ];
    for (const caso of casos) {
      const { texto } = auditarClase(caso, LUNES_27);
      expect(texto).toContain(CANON);
      // Y sin basura pegada que rompa el clic.
      expect(texto).not.toMatch(/volver-a-mi[./)]/);
    }
  });

  it("borra un link que Paula se inventó", () => {
    const { texto, hallazgos } = auditarClase(
      "Entra aquí https://historiasdelamente.com/volver-a-mi y también a https://bit.ly/abc123",
      LUNES_27,
    );
    expect(texto).toContain("historiasdelamente.com/volver-a-mi");
    expect(texto).not.toContain("bit.ly");
    expect(hallazgos.map((h) => h.tipo)).toContain("link_inventado");
  });

  it("corrige el día de la semana equivocado", () => {
    const { texto, hallazgos } = auditarClase("La clase es el martes 30 de julio", LUNES_27);
    expect(texto).toBe("La clase es el jueves 30 de julio");
    expect(hallazgos[0].tipo).toBe("dia_equivocado");
  });

  it("marca una fecha que no es la de la clase", () => {
    const { hallazgos } = auditarClase("Nos vemos el 6 de agosto", LUNES_27);
    expect(hallazgos.map((h) => h.tipo)).toContain("fecha_inventada");
  });

  it("no molesta cuando la respuesta está bien", () => {
    const { hallazgos } = auditarClase(
      "La clase es el jueves 30 de julio a las 8:00 PM. Entras aquí: https://historiasdelamente.com/volver-a-mi",
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

  it("no deja prometer contenido de Apego Detox como si viniera con la clase", () => {
    expect(
      auditarClase("Hay un módulo 7 con el protocolo de 8 pasos", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("contenido_de_otro_producto");
  });

  it("la clase es pago único: una mensualidad aquí es de otro producto", () => {
    expect(
      auditarClase("Son $37.97 al mes", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("mensualidad_en_clase");
    expect(
      auditarClase("¡Corre, queda el último cupo!", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("urgencia_falsa");
  });

  it("la clase ya no caduca: es todos los jueves y la fecha rueda sola", () => {
    // Antes esto era un error ('clase_caducada') porque la clase era una sola y
    // ya se había dictado. Ahora siempre hay un jueves por delante.
    const { hallazgos } = auditarClase("Es este jueves, no te lo pierdas", VIERNES_31);
    expect(hallazgos).toHaveLength(0);

    // El viernes 31, el próximo jueves es el 6 de agosto: cualquier otra fecha
    // que el modelo escriba se marca como inventada.
    expect(
      auditarClase("La clase es el 30 de julio", VIERNES_31).hallazgos.map((h) => h.tipo),
    ).toContain("fecha_inventada");
  });

  it("la instrucción de corrección le dice al modelo la fecha correcta", () => {
    // El lunes 27, el próximo jueves es el 30 de julio.
    const { hallazgos } = auditarClase("La clase es el martes 30 de julio", LUNES_27);
    expect(instruccionCorreccion(hallazgos, "clase", LUNES_27)).toContain("jueves 30 de julio");
  });

  it("no deja prometer una grabación que no existe", () => {
    const casos = [
      "Si no puedes en vivo, te queda la grabación",
      "No te preocupes, la ves después",
      "Queda grabada en tu área de miembros",
    ];
    for (const caso of casos) {
      expect(auditarClase(caso, LUNES_27).hallazgos.map((h) => h.tipo)).toContain(
        "grabacion_inexistente",
      );
    }

    // Decirle la VERDAD sí pasa — si no, Paula no podría ni negarlo.
    const verdades = [
      "Es en vivo y una sola vez, por eso vale la pena hacer el esfuerzo de estar 💛",
      "No, la clase no queda grabada: es en vivo y solo se da una vez.",
      "Si a esa hora no puedes, te aviso: no se repite ni queda grabada.",
    ];
    for (const v of verdades) {
      expect(auditarClase(v, LUNES_27).hallazgos).toHaveLength(0);
    }

    // Pero una negación de otra cosa no sirve de coartada.
    expect(
      auditarClase("No te preocupes, queda grabada", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("grabacion_inexistente");
  });

  it("no la deja escribir un folleto", () => {
    const folleto =
      "Hola, soy Paula, del equipo de Javier. La clase en vivo Recuperando mi Ser es este jueves 30 de julio a las 7:00 PM hora de Ciudad de Mexico. Son 3 horas con terapia en vivo, meditacion, testimonios, el libro de la clase, el area de miembros y la grabacion por si no puedes conectarte en ese momento. Aqui te dejo el link para asegurar tu lugar.";
    const { hallazgos } = auditarClase(folleto, LUNES_27);
    expect(hallazgos.map((h) => h.tipo)).toContain("demasiado_largo");
  });

  it("el link no cuenta para el largo (se ve como tarjeta, no como texto)", () => {
    const corto = "Perfecto, aquí aseguras tu lugar:\n\nhttps://historiasdelamente.com/volver-a-mi\n\nTe espero adentro 💛";
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

describe("la lista de dolores llega como UNA sola lista", () => {
  it("las viñetas no se rompen en un mensaje por línea", () => {
    // Es lo que hace que ella se reconozca y se quede. Si sale como cinco
    // mensajes de WhatsApp seguidos deja de ser una lista y es una ráfaga.
    const texto = [
      "Hola 💛 Soy Paula, trabajo con Javier Vieira.",
      "Esta clase es para ti si te pasa algo de esto:",
      "• Quieres dejarlo, y a los tres días ya le estás contestando",
      "• No duermes bien, y cuando duermes te despiertas pensando en él",
      "• Tienes una angustia en el pecho que no se te quita con nada",
      "Es este jueves a las 8. Son 25.000, pago único.",
      "https://historiasdelamente.com/volver-a-mi",
    ].join("\n");

    const globos = partirEnGlobos(texto);
    const conVinetas = globos.filter((g) => g.includes("•"));

    expect(conVinetas).toHaveLength(1);
    // La frase que abre la lista viaja pegada a ella, no suelta.
    expect(conVinetas[0]).toContain("Esta clase es para ti si");
    expect(conVinetas[0].split("\n").filter((l) => l.startsWith("•"))).toHaveLength(3);
    // Y el link sigue teniendo su propio globo.
    expect(globos).toContain("https://historiasdelamente.com/volver-a-mi");
  });

  it("una viñeta nunca se pega al globo del link", () => {
    const texto = "https://historiasdelamente.com/volver-a-mi\n• Quieres dejarlo de verdad";
    const globos = partirEnGlobos(texto);
    expect(globos).toContain("https://historiasdelamente.com/volver-a-mi");
    expect(globos.some((g) => g.startsWith("•"))).toBe(true);
  });

  it("el primer mensaje con lista completa pasa el blindaje", () => {
    const mensaje = [
      "Hola 💛 Soy Paula, trabajo con Javier Vieira, Psicólogo Especialista.",
      "",
      "Esta clase es para ti si te pasa algo de esto:",
      "• Quieres dejarlo, y a los tres días ya le estás contestando",
      "• No duermes bien, y cuando duermes te despiertas pensando en él",
      "• Revisas su última conexión, sus estados, con quién habla",
      "• Tienes una angustia en el pecho que no se te quita con nada",
      "",
      "Es este jueves a las 8, en vivo con él. Son 25.000, pago único.",
      "",
      "https://historiasdelamente.com/volver-a-mi",
      "",
      "Ahí la ves completa ✨",
    ].join("\n");

    expect(auditarClase(mensaje, LUNES_27).hallazgos).toHaveLength(0);
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
