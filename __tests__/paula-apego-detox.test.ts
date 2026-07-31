import { describe, it, expect } from 'vitest';

import {
  auditarRespuesta,
  instruccionCorreccion,
  instruccionHandoff,
  motivoHandoff,
} from '@/lib/whatsapp/blindaje';
import { APEGO, proximoEncuentro } from '@/lib/whatsapp/apego-detox';
import { buildSystemPrompt } from '@/lib/whatsapp/paula';

// Viernes 31 de julio de 2026, 10:00 AM Colombia: la clase en vivo ya se dictó
// y Paula volvió a su producto de siempre.
const VIERNES_31 = new Date('2026-07-31T15:00:00Z');

// ---------------------------------------------------------------------------
// El modo que está VIVO hoy: Paula cerrando ventas de Apego Detox.
// ---------------------------------------------------------------------------

describe("blindaje — modo cerradora de Apego Detox", () => {
  const auditar = (texto: string) => auditarRespuesta(texto, VIERNES_31, "apego");

  it("no marca como error lo que AHORA es la verdad", () => {
    // Con las reglas de la campaña puestas, cada uno de estos mensajes
    // disparaba un reintento inútil: el precio, la mensualidad y el propio
    // nombre del programa estaban prohibidos.
    const buenos = [
      "Son *$37.97 USD al mes* y cancelas cuando quieras 💛",
      "En Apego Detox hay un módulo entero para eso, el 7 ✨",
      "Adentro tienes la comunidad y dos encuentros en vivo con Javier 💛",
    ];
    for (const bueno of buenos) {
      expect(auditar(bueno).hallazgos).toHaveLength(0);
    }
  });

  it("deja los tres links perfectos, escriba el modelo lo que escriba", () => {
    expect(auditar("Mírala aquí: historiasdelamente.com/apegodetox").texto).toContain(APEGO.landing);
    expect(auditar("Entras aquí: www.historiasdelamente.com/apegodetox/").texto).toContain(APEGO.landing);
    // Sin el ?bid= el link pierde la atribución de la venta: se restituye.
    expect(auditar("Este es el pago: https://pay.hotmart.com/W102751360L").texto).toContain(APEGO.checkout);
    expect(auditar("Escríbele: wa.me/573001681053").texto).toContain(APEGO.whatsappJavier);
  });

  it("convierte el número suelto de Javier en un link clicable", () => {
    // Un número escrito a mano no se puede tocar desde WhatsApp.
    for (const caso of ["Escríbele al +57 300 1681053", "Su WhatsApp es 3001681053"]) {
      const { texto } = auditar(caso);
      expect(texto).toContain(APEGO.whatsappJavier);
      expect(texto).not.toMatch(/\b300\s?168\s?1053\b/);
    }
    // Y no se lleva por delante un precio ni el link que ya estaba bien.
    expect(auditar("Son $37.97 al mes").texto).toContain("$37.97");
    expect(auditar(`Aquí: ${APEGO.whatsappJavier}`).texto).toContain(APEGO.whatsappJavier);
  });

  it("no deja inventar otro precio ni vender la suscripción como pago único", () => {
    expect(auditar("Son $25 al mes").hallazgos.map((h) => h.tipo)).toContain("precio_falso");
    expect(auditar("Son $37.97, un solo pago").hallazgos.map((h) => h.tipo)).toContain("pago_unico");
    // El reencuadre honesto NO es un precio inventado.
    expect(auditar("Sale a poco más de un dólar al día 💛").hallazgos).toHaveLength(0);
  });

  it("los encuentros son martes y jueves — cualquier otro día se marca", () => {
    expect(
      auditar("Las sesiones en vivo son los lunes y miércoles").hallazgos.map((h) => h.tipo),
    ).toContain("dia_encuentro_equivocado");

    // Pero decir qué día es HOY junto al próximo encuentro es correcto.
    const ok = auditar("Hoy es viernes y el próximo encuentro con Javier es el martes 💛");
    expect(ok.hallazgos).toHaveLength(0);
  });

  it("no promete nada gratis (ese embudo se retiró)", () => {
    expect(auditar("Te regalo el libro 💛").hallazgos.map((h) => h.tipo)).toContain("promesa_gratis");
    expect(auditar("Tienes un mes gratis para probarlo").hallazgos.map((h) => h.tipo)).toContain("promesa_gratis");
  });

  it("sigue sin dejarla hacer terapia por chat, pero el titular de la marca sí pasa", () => {
    expect(
      auditar("Eso es tu sistema nervioso pidiendo la dosis").hallazgos.map((h) => h.tipo),
    ).toContain("psicoeducacion");
    expect(auditar("No estás rota. Estás programada 💛").hallazgos).toHaveLength(0);
  });

  it("deja pasar los testimonios en video de alumnas reales", () => {
    const { texto, hallazgos } = auditar(
      `Mira a Danna, alumna del programa: https://${APEGO.testimoniosHost}/danna+testimonio.mp4`,
    );
    expect(texto).toContain(APEGO.testimoniosHost);
    expect(hallazgos).toHaveLength(0);
  });

  it("cuando pide a Javier, la instrucción trae el link clicable y prohíbe vender", () => {
    expect(motivoHandoff("quiero hablar con Javier")).toBe("pide_humano");
    expect(motivoHandoff("me pasas el número de Javier?")).toBe("pide_humano");
    expect(motivoHandoff("quiero una cita con Javier")).toBe("pide_humano");
    expect(motivoHandoff("hacen terapia individual?")).toBe("pide_humano");
    // Contarle algo a Paula NO es pedir un humano.
    expect(motivoHandoff("quiero hablar contigo de lo que me pasa")).toBeNull();

    const instruccion = instruccionHandoff("pide_humano", "apego");
    expect(instruccion).toContain(APEGO.whatsappJavier);
    expect(instruccion).toContain("Nada de venta");
  });

  it("no deja prometer un número de módulos que ella no va a encontrar", () => {
    // El prompt maestro trae un ejemplo con "los 15 módulos completos" y el
    // modelo lo copiaba literal. En la página hay 9 + el Súper Bonus.
    expect(
      auditar("Hoy mismo te llegan los 15 módulos completos").hallazgos.map((h) => h.tipo),
    ).toContain("modulos_inventados");
    expect(auditar("En la página ves los 9 módulos y el Súper Bonus 💛").hallazgos).toHaveLength(0);
  });

  it("no la deja pedir permiso para lo obvio", () => {
    for (const caso of ["¿Quieres que te cuente más?", "¿Te comparto el link?"]) {
      expect(auditar(caso).hallazgos.map((h) => h.tipo)).toContain("pide_permiso");
    }
    // Invitar no es pedir permiso.
    expect(auditar("Te espero adentro 💛").hallazgos).toHaveLength(0);
  });

  it("una objeción de venta NO es un problema de pago", () => {
    // Este falso positivo la sacaba del embudo: preguntaba si le serviría y
    // Paula la mandaba con Javier en vez de resolverle la duda.
    expect(motivoHandoff("y si no me funciona? ya intenté de todo")).toBeNull();
    expect(motivoHandoff("no sé si esto me sirve a mí")).toBeNull();

    // Un fallo de verdad sí escala.
    expect(motivoHandoff("el link no me deja pagar")).toBe("problema_pago");
    expect(motivoHandoff("la página no carga")).toBe("problema_pago");
    expect(motivoHandoff("ya pagué y no me llegó el acceso")).toBe("problema_pago");
  });

  it("la corrección le dice al modelo el precio y los días reales", () => {
    const { hallazgos } = auditar("Son $19 al mes, un solo pago, y las sesiones son los lunes");
    const texto = instruccionCorreccion(hallazgos, "apego");
    expect(texto).toContain("$37.97 USD al mes");
    expect(texto).toContain("martes y jueves");
  });

  it("el folleto sigue prohibido: esto es WhatsApp", () => {
    const folleto =
      "Hola, soy Paula, del equipo de Javier. Apego Detox trae 9 modulos de trabajo psicologico profundo, dos encuentros en vivo con Javier cada semana por Google Meet, la comunidad de mujeres en WhatsApp donde nadie te juzga, el Super Bonus con PDFs y ejercicios, acceso permanente al material y acompanamiento para cuando llegue la noche dificil. Todo eso por $37.97 al mes con 7 dias de garantia.";
    expect(auditar(folleto).hallazgos.map((h) => h.tipo)).toContain("demasiado_largo");
  });
});

describe("reloj de los encuentros en vivo con Javier", () => {
  it("apunta siempre al próximo martes o jueves, nunca a otro día", () => {
    // Viernes 31 de julio → el próximo es el martes.
    expect(proximoEncuentro(VIERNES_31).fecha).toBe("martes 4 de agosto");

    // Martes por la mañana → es HOY, no dentro de una semana.
    const martesTemprano = proximoEncuentro(new Date("2026-08-04T15:00:00Z"));
    expect(martesTemprano.frase).toBe("es HOY");
    expect(martesTemprano.enVivo).toBe(false);

    // 8:30 PM del martes: está ocurriendo.
    expect(proximoEncuentro(new Date("2026-08-05T01:30:00Z")).enVivo).toBe(true);

    // Cuando termina, pasa al jueves. No se queda vendiendo el que ya pasó.
    expect(proximoEncuentro(new Date("2026-08-05T03:30:00Z")).fecha).toBe("jueves 6 de agosto");
  });
});

// ---------------------------------------------------------------------------
// El prompt que de verdad recibe el modelo en cada mensaje.
// ---------------------------------------------------------------------------

describe("prompt de Paula en modo Apego Detox", () => {
  const usuaria = {
    id: 1,
    manychat_id: "999",
    name: null,
    funnel_stage: "new_lead",
    situacion_resumen: null,
    first_contact: "",
    last_interaction: "",
    conversation_count: 0,
  };

  // Un número de México: de ahí salen su hora y su zona, sin preguntarle nada.
  const prompt = buildSystemPrompt(usuaria, "tiktok_live", "+521234567890", { ahora: VIERNES_31 });

  it("manda las reglas de cerradora, no las de la campaña de la clase", () => {
    expect(prompt).toContain("MODO CERRADORA DE APEGO DETOX");
    expect(prompt).not.toContain("CAMPAÑA ACTIVA");
  });

  it("lleva las tres reglas que pidió el cliente", () => {
    // 1. Contestar lo que ella escribió.
    expect(prompt).toContain("LEE LO QUE ELLA ESCRIBIÓ");
    // 2. Cortar la terapia y pasarla a Apego Detox.
    expect(prompt).toContain("NO HACES TERAPIA");
    // 3. Si quiere a Javier, el link clicable.
    expect(prompt).toContain(APEGO.whatsappJavier);
  });

  it("vende la comunidad y los dos encuentros con Javier", () => {
    expect(prompt).toContain("No va a estar sola nunca más");
    expect(prompt).toContain("Dos encuentros en vivo con Javier");
  });

  it("le entrega el reloj resuelto: no calcula ni adivina", () => {
    expect(prompt).toContain("martes 4 de agosto"); // el próximo encuentro
    expect(prompt).toContain("ELLA TE ESCRIBE DESDE: México");
    expect(prompt).toContain(APEGO.precioFrase);
  });

  it("no vende la clase que ya se dictó", () => {
    expect(prompt).toContain("YA SE DICTÓ");
  });
});

