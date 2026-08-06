import { describe, expect, it } from 'vitest';

import { analizarConversacion, bloqueGuion, type Turno } from '@/lib/whatsapp/guion';

const ella = (content: string): Turno => ({ role: 'user', content });
const paula = (content: string): Turno => ({ role: 'assistant', content });

const SKOOL = 'https://www.skool.com/historias-de-la-mente-4978/about';

describe('el guion de venta — para que Paula deje de repetirse', () => {
  it('en el primer turno no hay guion: manda el bloque de entrada', () => {
    expect(bloqueGuion([])).toBe('');
    expect(bloqueGuion([ella('hola')])).toBe('');
  });

  it('lee de sus propios mensajes qué le ha contado ya', () => {
    const e = analizarConversacion([
      ella('hola'),
      paula('Hola, soy Paula.'),
      ella('llevo 9 años'),
      paula(`Adentro hay talleres en vivo y una comunidad a cualquier hora.\n\n${SKOOL}`),
    ]);
    expect(e.turnos).toBe(2);
    expect(e.sabeQueEs).toBe(true);
    expect(e.tieneLink).toBe(true);
    expect(e.sabePrecio).toBe(false);
  });

  it('si todavía no sabe qué es, el paso es contárselo', () => {
    const g = bloqueGuion([ella('hola'), paula('Hola, soy Paula. ¿Cómo te llamas?')]);
    expect(g).toMatch(/CONTARLE QUÉ ES/);
    expect(g).toMatch(/Todavía no le has dado nada del programa/);
  });

  it('si ya sabe qué es pero no tiene link, el paso es el link', () => {
    const g = bloqueGuion([
      ella('cuéntame'),
      paula('Adentro tienes talleres en vivo cada semana y la comunidad.'),
    ]);
    expect(g).toMatch(/DARLE EL LINK/);
    expect(g).toMatch(/YA LE DISTE: qué hay adentro/);
  });

  it('con el link entregado y una objeción, el paso es esa objeción', () => {
    const g = bloqueGuion([
      paula(`Adentro hay talleres y comunidad.\n\n${SKOOL}`),
      ella('me interesa pero no tengo plata ahorita'),
    ]);
    expect(g).toMatch(/TRABAJAR SU OBJECIÓN: dinero/);
    expect(g).toMatch(/un ángulo que NO hayas usado/);
  });

  it('cuando ya lo sabe todo, el paso es cerrar o soltar — no repetir la oferta', () => {
    const g = bloqueGuion([
      paula(`Son $20 al mes con garantía de 7 días. Adentro hay talleres y comunidad.\n\n${SKOOL}`),
      ella('ok'),
    ]);
    expect(g).toMatch(/CERRAR O SOLTAR/);
    expect(g).toMatch(/repetir la oferta ahora la aleja/);
  });

  it('le pone delante sus dos últimos mensajes con la prohibición de repetirlos', () => {
    const g = bloqueGuion([
      paula('Primera cosa que dijo.'),
      ella('ajá'),
      paula('Segunda cosa que dijo.'),
      ella('ya'),
      paula('Tercera cosa que dijo.'),
    ]);
    expect(g).toMatch(/ESTO YA SE LO DIJISTE/);
    expect(g).toContain('Segunda cosa que dijo.');
    expect(g).toContain('Tercera cosa que dijo.');
    // La primera ya no: solo las dos últimas, para no inflar el prompt.
    expect(g).not.toContain('Primera cosa que dijo.');
    expect(g).toMatch(/Ni con las mismas palabras ni con sinónimos/);
  });

  it('cuenta los turnos de PAULA, no los de ella', () => {
    const g = bloqueGuion([ella('a'), paula('b'), ella('c'), paula('d'), ella('e')]);
    expect(g).toMatch(/Llevas \*\*2 mensajes\*\*/);
  });

  it('acumula las objeciones que ella fue poniendo, y trabaja la última', () => {
    const e = analizarConversacion([
      ella('está muy caro'),
      paula('...'),
      ella('además no tengo tiempo'),
    ]);
    expect(e.objeciones).toEqual(['dinero', 'tiempo']);
  });
});
