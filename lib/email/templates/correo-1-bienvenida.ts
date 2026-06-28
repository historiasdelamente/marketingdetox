// Correo 1 — Bienvenida + entrega del libro + accesos.
// Lo manda Paula (WhatsApp) y la landing /clase-gratis-y-libro vía enviarLibroGratis().
// Diseño: encabezado compacto, tono cálido de mujer a mujer, y los 4 accesos
// (libro · curso grabado · clase en vivo · grupo) en bloques cortos y escaneables.

// Links del embudo (curso gratis YouTube, clase en vivo sábados, comunidad WhatsApp).
const CURSO_LINK = 'https://youtu.be/rm2Kim3CnP8';
const CLASE_VIVO_LINK = 'https://www.youtube.com/live/dcYklKqZ_BI';
const GRUPO_LINK = 'https://chat.whatsapp.com/E0W15Gwuvrx3FlgrRC0I0x';

export interface Correo1Params {
  primerNombre: string;
  urlLibro: string;
  unsubscribeUrl: string;
}

export const CORREO_1_SUBJECT = (primerNombre: string) =>
  `${primerNombre}, tu libro y todo lo que preparé para ti`;

export const CORREO_1_PREHEADER =
  'Tu libro, el curso gratis, la clase en vivo del sábado y el grupo. Todo en orden, sin prisa.';

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Un bloque de "acceso": etiqueta dorada + título + una línea + botón.
function bloque(
  n: string,
  etiqueta: string,
  titulo: string,
  linea: string,
  cta: string,
  url: string,
  color: 'gold' | 'green'
): string {
  const btnBg = color === 'green' ? '#1B8C3D' : '#B8861F';
  return `
        <tr><td style="padding:0 28px 11px;" class="px-inner">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FBF7EE;border:1px solid #EADCBE;border-radius:8px;">
            <tr><td style="padding:12px 16px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0 0 3px;font-family:Arial,sans-serif;font-size:8px;letter-spacing:0.16em;text-transform:uppercase;color:#B8861F;font-weight:bold;">${n} &nbsp;${etiqueta}</p>
              <p style="margin:0 0 8px;font-size:11px;line-height:1.5;color:#1A1410;"><strong style="color:#1A1410;">${titulo}</strong> &mdash; ${linea}</p>
              <a href="${url}" target="_blank" style="display:inline-block;background:${btnBg};color:#FFFFFF;font-family:Arial,sans-serif;font-size:9.5px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;padding:9px 18px;border-radius:5px;" class="cta-mobile">${cta}</a>
            </td></tr>
          </table>
        </td></tr>`;
}

export function correo1BienvenidaHTML(p: Correo1Params): string {
  const primerNombre = escape(p.primerNombre);
  const urlLibro = p.urlLibro;
  const unsubscribeUrl = p.unsubscribeUrl;

  const bloques =
    bloque('1', 'Tu libro', 'Cómo dejar al narcisista', 'descárgalo y léelo cuando estés sola, sin prisa.', 'Descargar el libro', urlLibro, 'gold') +
    bloque('2', 'Tu curso gratis', '10 clases en video', 'son grabadas, las ves a tu ritmo. Empieza por la clase 1.', 'Ver el curso', CURSO_LINK, 'gold') +
    bloque('3', 'Clase en vivo', 'Sábados 11:00 a.m.', 'en directo conmigo, por YouTube (hora Colombia). Te espero.', 'Ir a la clase', CLASE_VIVO_LINK, 'gold') +
    bloque('4', 'El grupo', 'La comunidad', 'no estás sola: ahí te aviso de cada clase y caminamos juntas.', 'Entrar al grupo', GRUPO_LINK, 'green');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es" lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Tu libro y todo lo que preparé para ti</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a { color: #B8861F; }
    @media only screen and (max-width: 480px) {
      .container { width: 100% !important; }
      .px-inner { padding-left: 18px !important; padding-right: 18px !important; }
      .cta-mobile { font-size: 10px !important; padding: 10px 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#F4EFE3;">
  <div style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;">
    ${escape(CORREO_1_PREHEADER)}
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F4EFE3;">
    <tr><td align="center" style="padding:26px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="max-width:600px;width:100%;background:#FFFFFF;box-shadow:0 2px 8px rgba(0,0,0,0.05);">

        <tr><td style="height:4px;line-height:4px;font-size:0;background:#C9A84C;">&nbsp;</td></tr>
        <tr><td class="px-inner" style="padding:14px 28px 0;text-align:center;">
          <p style="margin:0;font-family:Georgia,serif;font-size:7px;letter-spacing:0.34em;color:#B8861F;text-transform:uppercase;font-weight:bold;">Historias de la Mente</p>
        </td></tr>

        <tr><td class="px-inner" style="padding:14px 28px 0;font-family:Georgia,'Times New Roman',serif;color:#1A1410;">
          <p style="margin:0 0 9px;font-size:13px;line-height:1.5;"><strong>Hola, ${primerNombre}.</strong></p>
          <p style="margin:0 0 6px;font-size:11px;line-height:1.6;">Qué valiente fuiste al dar este paso. No tienes que entenderlo todo hoy ni hacerlo de un tirón.</p>
          <p style="margin:0 0 14px;font-size:11px;line-height:1.6;">Te dejé todo aquí, en orden. Ve a tu ritmo 💛</p>
        </td></tr>

        ${bloques}

        <tr><td class="px-inner" style="padding:6px 28px 0;font-family:Georgia,'Times New Roman',serif;color:#1A1410;">
          <p style="margin:0 0 4px;font-size:11px;line-height:1.6;">Empieza por abrir el libro. Lo demás llega solo.</p>
          <p style="margin:0;font-size:11px;line-height:1.6;font-style:italic;color:#5C4A2A;">Estoy contigo en esto.</p>
        </td></tr>
        <tr><td class="px-inner" style="padding:12px 28px 18px;font-family:Georgia,'Times New Roman',serif;">
          <p style="margin:0;font-size:11px;color:#1A1410;">&mdash; Javier Vieira</p>
          <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:7px;letter-spacing:0.2em;color:#6b5a3c;text-transform:uppercase;">Psicólogo Especialista &middot; Historias de la Mente</p>
        </td></tr>

        <tr><td class="px-inner" style="padding:14px 28px;background:#FBF7EE;border-top:1px solid #EFE5CE;font-family:Georgia,'Times New Roman',serif;font-size:8px;line-height:1.6;color:#6b5a3c;text-align:center;">
          Recibes este correo porque pediste el libro &laquo;Cómo dejar al narcisista&raquo; en historiasdelamente.com.<br>
          <a href="${unsubscribeUrl}" style="color:#6b5a3c;text-decoration:underline;">Si prefieres no recibir más correos, cancela aquí</a>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:#B8861F;">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function correo1BienvenidaText(p: Correo1Params): string {
  return `Hola, ${p.primerNombre}.

Qué valiente fuiste al dar este paso. No tienes que entenderlo todo hoy ni hacerlo de un tirón. Te dejé todo aquí, en orden. Ve a tu ritmo.

1) TU LIBRO — "Cómo dejar al narcisista". Descárgalo y léelo cuando estés sola:
${p.urlLibro}

2) TU CURSO GRATIS — 10 clases en video, grabadas, a tu ritmo. Empieza por la clase 1:
${CURSO_LINK}

3) CLASE EN VIVO — sábados 11:00 a.m. (hora Colombia), en directo conmigo por YouTube:
${CLASE_VIVO_LINK}

4) EL GRUPO — la comunidad donde no estás sola y te aviso de cada clase:
${GRUPO_LINK}

Empieza por abrir el libro. Lo demás llega solo. Estoy contigo en esto.

— Javier Vieira
Psicólogo Especialista · Historias de la Mente

---
Recibes este correo porque pediste el libro "Cómo dejar al narcisista" en historiasdelamente.com.
Cancelar suscripción: ${p.unsubscribeUrl}
`;
}
