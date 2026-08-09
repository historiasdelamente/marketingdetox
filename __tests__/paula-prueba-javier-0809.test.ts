import { describe, it, expect } from 'vitest';

import { quitarLinkRepetido, quitarPreguntaDeFreno, auditarRespuesta } from '@/lib/whatsapp/blindaje';
import { PREGUNTA_FRENO, preguntaQueIncluye, tandaDeVinetas } from '@/lib/whatsapp/guion';
import { APEGO_DETOX } from '@/lib/whatsapp/programa';

/**
 * LA PRUEBA DE JAVIER — 2026-08-09, contra producción (session 1677801738).
 *
 * Un solo mensaje de Paula (el 12148) juntó TRES fallos, y el turno anterior
 * (12146) el cuarto. Cada test de aquí es una frase TEXTUAL de esa conversación:
 * si alguno falla, el bot volvió a romper una regla que ya rompió en vivo.
 *
 *   12146  «aquí estoy lista para contarte todo sobre el programa cuando me
 *           digas» — ella pidió información y la puso a pedirla OTRA VEZ.
 *   12148  «¿Hay algo en particular que te haga dudar de entrar?» — la pregunta
 *           del freno, en subjuntivo, que el regex no conocía.
 *   12148  «Puedes ingresar aquí 👉» y NINGÚN link debajo — el candado borró el
 *           link y dejó el anuncio huérfano (infinitivo + manito, invisibles
 *           para ANUNCIA_LINK).
 *   12148  la presentación salió en chorrero — «Cuéntame» y «podrías darme
 *           información del programa» no abrían la tanda de viñetas.
 */
describe('la prueba de Javier del 2026-08-09', () => {
  describe('la pregunta del freno no existe, en ninguna conjugación', () => {
    const variantes = [
      '¿Hay algo en particular que te haga dudar de entrar?', // ← la textual
      '¿Hay algo que te frene?',
      '¿Qué te está haciendo dudar?',
      '¿Hay algo en particular que te detenga?',
      '¿Qué es lo que más te hace dudar?',
      '¿Hay algo que te preocupe de entrar?',
      '¿Qué dudas tienes?',
    ];

    for (const v of variantes) {
      it(`caza «${v}»`, () => {
        expect(PREGUNTA_FRENO.test(v)).toBe(true);
      });

      it(`la corta de un mensaje que sí sirve: «${v.slice(0, 30)}…»`, () => {
        const limpio = quitarPreguntaDeFreno(`Apego Detox trae 17 módulos y comunidad. ${v}`);
        expect(limpio).toContain('17 módulos');
        expect(limpio).not.toContain('dudar');
        expect(limpio).not.toContain('frene');
      });
    }

    it('no caza preguntas legítimas de ella o sobre logística', () => {
      for (const legitima of [
        '¿Quieres entrar el jueves?',
        'Te espero adentro.',
        '¿A qué correo te la mando?',
      ]) {
        expect(PREGUNTA_FRENO.test(legitima)).toBe(false);
      }
    });
  });

  describe('el anuncio del link nunca queda huérfano — versión manito', () => {
    it('el mensaje textual del 12148: si el link se va, el «Puedes ingresar aquí 👉» se va con él', () => {
      const original = `Vas a entender por qué sigues pensando en él y recuperar tu paz. Puedes ingresar aquí 👉\n${APEGO_DETOX.landing}`;
      const limpio = quitarLinkRepetido(original);
      expect(limpio).not.toContain('ingresar aquí');
      expect(limpio).not.toMatch(/👉\s*$/u);
      expect(limpio).toContain('recuperar tu paz');
    });

    it('«Te dejo el acceso por aquí 👉» tampoco sobrevive sin su link', () => {
      const original = `Eso se trabaja adentro. Te dejo el acceso por aquí 👉\n${APEGO_DETOX.checkout}`;
      const limpio = quitarLinkRepetido(original);
      expect(limpio).not.toContain('acceso por aquí');
      expect(limpio).toContain('Eso se trabaja adentro');
    });
  });

  describe('pedir información del programa abre la presentación', () => {
    const pidiendo = [
      'Cuéntame', // ← el textual
      'Gracias podrías darme información del programa antes de la csrtila'.replace('csrtila', 'cartilla'),
      'dame información del programa',
      'quiero saber más',
      'háblame del programa',
      'qué hacen en el programa',
    ];

    for (const p of pidiendo) {
      it(`«${p}» pide la presentación`, () => {
        expect(preguntaQueIncluye(p)).toBe(true);
      });
    }

    it('y abre la tanda 1 aunque Paula ya haya hablado del programa en prosa', () => {
      // En la conversación real sabeQueEs era true (prosa vieja) y por eso la
      // llave 2 no abría. La llave 1 —ella lo pide— manda sobre ese estado.
      const historial = [
        { role: 'user' as const, content: 'Ya lo dejé' },
        {
          role: 'assistant' as const,
          content: 'Eso se trabaja adentro con talleres en vivo y comunidad.',
        },
      ];
      expect(tandaDeVinetas(historial, 'Cuéntame', null)).toBe(1);
    });
  });

  describe('el precio colombiano no enciende la alarma de la clase vieja', () => {
    it('«unos 125.000 COP» NO es el «25.000» de la clase retirada', () => {
      // Encontrado repitiendo esta conversación en el simulador: la alarma
      // saltaba DENTRO del precio correcto y quemaba un reintento entero
      // (doble costo y latencia) en cada mensaje de precio de Colombia.
      const { hallazgos } = auditarRespuesta(
        'Son $40 USD al mes, unos 125.000 COP. Es suscripción mensual y la cancelas cuando quieras.',
        new Date('2026-08-09T15:00:00Z'),
      );
      expect(hallazgos.map((h) => h.tipo)).not.toContain('producto_retirado');
    });

    it('pero el 25.000 de verdad —la clase vieja— sigue prohibido', () => {
      const { hallazgos } = auditarRespuesta(
        'La clase cuesta 25.000 pesos y es este jueves.',
        new Date('2026-08-09T15:00:00Z'),
      );
      expect(hallazgos.map((h) => h.tipo)).toContain('producto_retirado');
    });
  });

  describe('«cuando me digas» es aplazar, y aplazar está prohibido', () => {
    it('el mensaje textual del 12146 dispara pide_permiso', () => {
      const { hallazgos } = auditarRespuesta(
        'Con mucho gusto, aquí estoy lista para contarte todo sobre el programa cuando me digas. 💛',
        new Date('2026-08-09T15:00:00Z'),
      );
      expect(hallazgos.map((h) => h.tipo)).toContain('pide_permiso');
    });
  });
});
