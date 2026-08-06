import { describe, it, expect } from "vitest";
import {
  TZ_COLOMBIA,
  detectarPais,
  esTelefonoReal,
  paisDeElla,
  diasDeCalendario,
  fechaISO,
  fechaLarga,
  hora12,
} from "@/lib/whatsapp/paises";

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

// De aquí sale la hora que Paula le dice a ELLA, tanto en el chat (programa.ts)
// como en los recordatorios. Si esto se tuerce, la cita a una hora que no es.
describe("formato de fechas y horas", () => {
  /** La clase de un jueves cualquiera: 6 de agosto de 2026, 8:00 PM Colombia. */
  const CLASE = new Date("2026-08-06T20:00:00-05:00");

  it("da la hora en ASCII, sin los 'p. m.' raros de es-CO", () => {
    expect(hora12(CLASE, TZ_COLOMBIA)).toBe("8:00 PM");
  });

  it("convierte a la zona de ella, con horario de verano incluido", () => {
    expect(hora12(CLASE, "America/Mexico_City")).toBe("7:00 PM");
    expect(hora12(CLASE, "America/Argentina/Buenos_Aires")).toBe("10:00 PM");
    expect(hora12(CLASE, "America/New_York")).toBe("9:00 PM"); // EDT en agosto
    expect(hora12(CLASE, "America/Los_Angeles")).toBe("6:00 PM");
  });

  it("escribe la fecha sin la coma que le mete Intl", () => {
    expect(fechaLarga(CLASE, TZ_COLOMBIA)).toBe("jueves 6 de agosto");
  });

  it("en España la clase cae de madrugada del día siguiente", () => {
    // Sin el día, ella la anota para el jueves y se la pierde.
    expect(hora12(CLASE, "Europe/Madrid")).toBe("3:00 AM");
    expect(fechaLarga(CLASE, "Europe/Madrid")).toBe("viernes 7 de agosto");
    expect(fechaISO(CLASE, "Europe/Madrid")).toBe("2026-08-07");
    expect(fechaISO(CLASE, TZ_COLOMBIA)).toBe("2026-08-06");
  });

  it("cuenta por días de calendario, no por bloques de 24 horas", () => {
    // Faltan ~21 horas, pero en el calendario es mañana: así habla la gente.
    const vispera = new Date("2026-08-05T23:00:00-05:00");
    expect(diasDeCalendario(vispera, CLASE, TZ_COLOMBIA)).toBe(1);
    expect(diasDeCalendario(CLASE, CLASE, TZ_COLOMBIA)).toBe(0);
    expect(diasDeCalendario(CLASE, vispera, TZ_COLOMBIA)).toBe(-1);
  });
});

describe('un telefono de verdad, no un marcador de plantilla', () => {
  it('rechaza el "{{phone}}" que ManyChat manda sin resolver', () => {
    // FALLO REAL VISTO EN PRODUCCION el 2026-08-06: `wa_users.phone` tenia
    // decenas de filas con el texto literal "{{phone}}". La Solicitud externa
    // de ManyChat enviaba el marcador en vez del numero, asi que Paula no sabia
    // de que pais era NINGUNA mujer y casi nunca daba el precio en su moneda.
    for (const basura of ['{{phone}}', '', 'null', '-', '123']) {
      expect(esTelefonoReal(basura), basura + ' no es un telefono').toBe(false);
      // Lo importante: de la basura nunca sale un pais inventado.
      expect(detectarPais(basura)).toBeNull();
    }

    for (const bueno of ['+573001112233', '573001112233', '+52 55 1234 5678']) {
      expect(esTelefonoReal(bueno), bueno + ' si es un telefono').toBe(true);
    }
  });
});

describe('el pais que se guarda en su ficha', () => {
  // FALLO REAL VISTO EN PRODUCCION el 2026-08-06: 877 de 878 filas de
  // `wa_users` tenian `pais` en null, y 565 de ellas SI tenian un telefono
  // bueno guardado. El pais se derivaba del telefono para hablarle en el
  // turno, pero solo se persistia cuando ella lo decia en voz alta. Sin pais
  // en la fila, los recordatorios no saben ni su moneda ni su hora.
  it('lo saca del telefono cuando ella no lo ha dicho', () => {
    expect(paisDeElla(null, '+573023499113')).toBe('CO');
    expect(paisDeElla(null, '+5215512345678')).toBe('MX');
    expect(paisDeElla('', '+34612345678')).toBe('ES');
  });

  it('lo que ella dice manda sobre su indicativo', () => {
    // Una mexicana con numero de Estados Unidos es mexicana.
    expect(paisDeElla('MX', '+13055551234')).toBe('MX');
    expect(paisDeElla('CO', '+34612345678')).toBe('CO');
  });

  it('no inventa pais a partir de basura', () => {
    for (const basura of ['{{phone}}', '', 'null', '-', '123']) {
      expect(paisDeElla(null, basura), basura).toBeNull();
    }
    // Ni de un ISO que el modelo se saque de la manga.
    expect(paisDeElla('LATAM', null)).toBeNull();
    expect(paisDeElla('Sudamerica', '')).toBeNull();
  });

  it('un ISO inventado no tapa el telefono bueno', () => {
    expect(paisDeElla('LATAM', '+573023499113')).toBe('CO');
  });
});
