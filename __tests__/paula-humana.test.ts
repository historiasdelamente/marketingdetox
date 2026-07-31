import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { auditarRespuesta, instruccionCorreccion, motivoHandoff } from "@/lib/whatsapp/blindaje";
import { normalizarNegritas, partirEnGlobos } from "@/lib/whatsapp/manychat";

// La clase configurada en contexto-clase.ts: jueves 30 jul 2026, 8 PM Colombia.
const LUNES_27 = new Date("2026-07-27T15:00:00Z"); // 10:00 AM Colombia
const VIERNES_31 = new Date("2026-07-31T15:00:00Z"); // la clase ya pasó

// La campaña de la clase está APAGADA en producción (CLASE.activa = false), así
// que el modo por defecto es 'apego'. Estas pruebas piden 'clase' explícito.
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

  it("bloquea el precio de otro producto y la urgencia falsa", () => {
    expect(
      auditarClase("Son $37.97 al mes", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("precio_prohibido");
    expect(
      auditarClase("¡Corre, queda el último cupo!", LUNES_27).hallazgos.map((h) => h.tipo),
    ).toContain("urgencia_falsa");
  });

  it("cuando la clase ya pasó, no deja prometerla como futura", () => {
    const { hallazgos } = auditarClase("Es este jueves, no te lo pierdas", VIERNES_31);
    expect(hallazgos.map((h) => h.tipo)).toContain("clase_caducada");

    // Pero sí puede nombrar la fecha real para decirle que ya se dictó.
    const ok = auditarClase(
      "La clase fue el jueves 30 de julio 💛 Te aviso apenas Javier abra la próxima.",
      VIERNES_31,
    );
    expect(ok.hallazgos).toHaveLength(0);
  });

  it("la instrucción de corrección le dice al modelo la fecha correcta", () => {
    const { hallazgos } = auditarClase("La clase es el martes 30 de julio", LUNES_27);
    expect(instruccionCorreccion(hallazgos, "clase")).toContain("jueves 30 de julio");
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
      "https://historiasdelamente.com/volver-a-mi",
    ].join("\n\n");

    const globos = partirEnGlobos(parrafos);
    expect(globos.length).toBeLessThanOrEqual(5);
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
