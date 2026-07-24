import { describe, it, expect } from "vitest";
import {
  CLASE,
  PAISES,
  detectarPais,
  cuentaRegresiva,
  bloqueContextoVivo,
  datosParaElla,
} from "@/lib/whatsapp/contexto-clase";

// La clase: jueves 30 de julio de 2026, 8:00 PM Colombia (= 01:00 UTC del 31).
const INICIO = new Date(CLASE.inicioISO);

/** Momento concreto en hora Colombia (UTC-5, sin horario de verano). */
function colombia(dia: number, hora: number, minuto = 0): Date {
  return new Date(Date.UTC(2026, 6, dia, hora + 5, minuto));
}

describe("detectarPais", () => {
  it("detecta el país por el indicativo", () => {
    expect(detectarPais("+573116329202")?.iso).toBe("CO");
    expect(detectarPais("+5215512345678")?.iso).toBe("MX");
    expect(detectarPais("+34612345678")?.iso).toBe("ES");
    expect(detectarPais("+5491123456789")?.iso).toBe("AR");
  });

  it("acepta el número con espacios, guiones o sin el +", () => {
    expect(detectarPais("57 311 632 9202")?.iso).toBe("CO");
    expect(detectarPais("+57-311-6329202")?.iso).toBe("CO");
    expect(detectarPais("00573116329202")?.iso).toBe("CO");
  });

  it("prefiere el prefijo más largo: +1809 es Dominicana, no Estados Unidos", () => {
    expect(detectarPais("+18095551234")?.iso).toBe("DO");
    expect(detectarPais("+17875551234")?.iso).toBe("PR");
    expect(detectarPais("+13055551234")?.iso).toBe("US");
  });

  it("devuelve null cuando no hay número o el indicativo no existe", () => {
    expect(detectarPais("")).toBeNull();
    expect(detectarPais(null)).toBeNull();
    expect(detectarPais(undefined)).toBeNull();
    expect(detectarPais("+9995551234")).toBeNull();
  });

  it("no adivina país con un número sin indicativo (evita confundir Miami con Colombia)", () => {
    // 305 es indicativo de área de Miami y también arranca en 3 como un celular
    // colombiano: sin código de país, no se asume nada.
    expect(detectarPais("3055551234")?.iso).not.toBe("CO");
  });
});

describe("cuentaRegresiva", () => {
  it("cuenta los días que faltan", () => {
    // Viernes 24 de julio, 5:47 PM Colombia → la clase es el jueves 30.
    const r = cuentaRegresiva(colombia(24, 17, 47));
    expect(r.estado).toBe("futura");
    expect(r.dias).toBe(6);
    expect(r.frase).toBe("faltan 6 días");
  });

  it("dice 'es MAÑANA' la víspera", () => {
    const r = cuentaRegresiva(colombia(29, 22, 0));
    expect(r.dias).toBe(1);
    expect(r.frase).toBe("es MAÑANA");
  });

  it("dice 'es HOY' con las horas que faltan el mismo día", () => {
    const r = cuentaRegresiva(colombia(30, 14, 0));
    expect(r.estado).toBe("futura");
    expect(r.dias).toBe(0);
    expect(r.frase).toBe("es HOY, faltan 6 horas");
  });

  it("cuenta en minutos cuando falta menos de una hora", () => {
    const r = cuentaRegresiva(colombia(30, 19, 30));
    expect(r.frase).toBe("es HOY, faltan 30 minutos");
  });

  it("detecta que la clase está en vivo", () => {
    const r = cuentaRegresiva(colombia(30, 21, 0));
    expect(r.estado).toBe("en_vivo");
    expect(r.frase).toContain("EN VIVO");
  });

  it("detecta que la clase ya pasó", () => {
    expect(cuentaRegresiva(colombia(30, 23, 30)).estado).toBe("pasada");
    expect(cuentaRegresiva(colombia(31, 10, 0)).frase).toContain("YA PASÓ");
    expect(cuentaRegresiva(colombia(2 + 30, 10, 0)).estado).toBe("pasada");
  });

  it("cuenta por días de calendario, no por bloques de 24 horas", () => {
    // Faltan ~21 horas, pero en el calendario es mañana: así habla la gente.
    expect(cuentaRegresiva(colombia(29, 23, 0)).frase).toBe("es MAÑANA");
  });
});

describe("bloqueContextoVivo", () => {
  const ahora = colombia(24, 17, 47);

  it("le da al prompt la fecha de hoy y la cuenta regresiva ya resuelta", () => {
    const b = bloqueContextoVivo(ahora, "+573116329202");
    expect(b).toContain("viernes 24 de julio");
    expect(b).toContain("jueves 30 de julio");
    expect(b).toContain("faltan 6 días");
  });

  it("da la hora y la moneda del país de ella, no las de Colombia", () => {
    const mx = bloqueContextoVivo(ahora, "+5215512345678");
    expect(mx).toContain("ELLA TE ESCRIBE DESDE: México");
    expect(mx).toContain("7:00 PM"); // 8 PM Colombia = 7 PM CDMX
    expect(mx).toContain("120 MXN");

    const ar = bloqueContextoVivo(ahora, "+5491123456789");
    expect(ar).toContain("10:00 PM"); // Buenos Aires
    expect(ar).toContain("9.000 ARS");
  });

  it("respeta el horario de verano de Estados Unidos y España", () => {
    const us = bloqueContextoVivo(ahora, "+13055551234");
    expect(us).toContain("9:00 PM"); // EDT en julio
    expect(us).toContain("6:00 PM"); // Los Ángeles, en las zonas extra

    // En Madrid la clase cae de madrugada del día siguiente.
    const es = bloqueContextoVivo(ahora, "+34612345678");
    expect(es).toContain("viernes 31 de julio");
    expect(es).toContain("3:00 AM");
  });

  it("cuando no sabe el país, no asume Colombia y manda preguntar", () => {
    const b = bloqueContextoVivo(ahora, "");
    expect(b).toContain("NO SABES DE QUÉ PAÍS");
    expect(b).toContain("NUNCA asumas Colombia");
    expect(b).toContain("7 USD");
  });

  it("siempre incluye la tabla de respaldo por si ella dice su país en el chat", () => {
    const b = bloqueContextoVivo(ahora, "+573116329202");
    for (const pais of PAISES) {
      expect(b).toContain(pais.nombre);
    }
  });

  it("después de la clase deja de venderla en futuro y ofrece la grabación", () => {
    const b = bloqueContextoVivo(new Date(INICIO.getTime() + 26 * 3_600_000), "+573116329202");
    expect(b).toContain("YA PASÓ");
    expect(b).toContain("GRABACIÓN");
  });
});

// Lo que usan los recordatorios para armar el texto sin recalcular nada.
describe("datosParaElla", () => {
  it("resuelve país, hora local y moneda desde el teléfono", () => {
    const mx = datosParaElla("+5215512345678");
    expect(mx.pais?.iso).toBe("MX");
    expect(mx.horaClase).toBe("7:00 PM (hora de Ciudad de México)");
    expect(mx.precio).toBe("120 MXN");
    expect(mx.fechaClase).toBe("jueves 30 de julio");
  });

  it("marca como aproximadas las monedas que no son cifra oficial", () => {
    expect(datosParaElla("+51987654321").precio).toBe("unos 26 PEN (7 USD)");
  });

  it("sin teléfono cae a dólares y hora Colombia, nunca a pesos colombianos", () => {
    const d = datosParaElla(null);
    expect(d.pais).toBeNull();
    expect(d.precio).toBe("7 USD");
    expect(d.horaClase).toBe("8:00 PM hora Colombia");
    expect(d.precio).not.toContain("COP");
  });
});
