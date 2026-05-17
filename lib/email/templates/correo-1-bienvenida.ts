export interface Correo1Params {
  primerNombre: string;
  urlLibro: string;
  unsubscribeUrl: string;
}

export const CORREO_1_SUBJECT = (primerNombre: string) =>
  `${primerNombre}, llegó tu libro`;

export const CORREO_1_PREHEADER =
  'Lo que escribí para las mujeres que ya leyeron todo y nada las sacó.';

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function correo1BienvenidaHTML(p: Correo1Params): string {
  const primerNombre = escape(p.primerNombre);
  const urlLibro = p.urlLibro;
  const unsubscribeUrl = p.unsubscribeUrl;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es" lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Cómo Dejar al Narcisista — Tu libro</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>table, td, div, h1, p { font-family: Georgia, 'Times New Roman', serif !important; }</style>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    a { color: #B8861F; text-decoration: underline; }
    a:hover { color: #8B6515; }
    @media only screen and (max-width: 480px) {
      .container { width: 100% !important; }
      .px-outer { padding-left: 12px !important; padding-right: 12px !important; }
      .px-inner { padding-left: 22px !important; padding-right: 22px !important; }
      .py-hero { padding-top: 22px !important; padding-bottom: 6px !important; }
      .h1-mobile { font-size: 17px !important; line-height: 1.3 !important; }
      .body-mobile { font-size: 13px !important; line-height: 1.65 !important; }
      .cta-mobile { font-size: 11px !important; padding: 12px 22px !important; letter-spacing: 0.12em !important; }
      .footer-mobile { font-size: 10px !important; line-height: 1.65 !important; }
      .pd-mobile { font-size: 12px !important; }
      .signature-mobile { font-size: 13px !important; }
    }
    :root { color-scheme: light only; supported-color-schemes: light only; }
  </style>
</head>
<body style="margin:0;padding:0;background:#F4EFE3;">
  <div style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;">
    ${escape(CORREO_1_PREHEADER)}
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F4EFE3;">
    <tr><td align="center" class="px-outer" style="padding:32px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="max-width:600px;width:100%;background:#FFFFFF;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <tr><td style="height:6px;line-height:6px;font-size:0;background:#C9A84C;">&nbsp;</td></tr>
        <tr><td class="px-inner py-hero" style="padding:28px 36px 4px;text-align:center;">
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:9px;letter-spacing:0.35em;color:#B8861F;text-transform:uppercase;font-weight:bold;">Historias de la Mente</p>
        </td></tr>
        <tr><td class="px-inner" style="padding:4px 36px 14px;text-align:center;">
          <h1 class="h1-mobile" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.28;color:#1A1410;font-weight:bold;letter-spacing:-0.005em;">${primerNombre}, llegó tu libro</h1>
        </td></tr>
        <tr><td align="center" style="padding:2px 36px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:32px;border-top:1px solid #B8861F;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        </td></tr>
        <tr><td class="px-inner body-mobile" style="padding:0 36px;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.7;color:#1A1410;">
          <p style="margin:0 0 14px;">Hola, ${primerNombre}.</p>
          <p style="margin:0 0 14px;">Quiero que esto sea lo primero que leas hoy.</p>
          <p style="margin:0 0 14px;">Antes de cualquier cosa, gracias por dejarme entrar. Sé exactamente quién está abriendo este correo.</p>
          <p style="margin:0 0 14px;">Una mujer que lleva meses, quizás años, cargando algo que ya no puede soltar sola. Una mujer brillante. Profesional. Madre, hija, hermana, jefa. Una mujer que cualquiera mira y piensa <em>"esa lo tiene todo"</em>. Y que por dentro se levanta a las tres de la mañana a revisar el celular.</p>
          <p style="margin:0 0 24px;">No me equivoco, ¿cierto?</p>
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:9.5px;letter-spacing:0.28em;color:#B8861F;text-transform:uppercase;font-weight:bold;">Tu primer regalo</p>
          <p style="margin:0 0 14px;"><strong style="color:#1A1410;">Cómo Dejar al Narcisista</strong> — Por Javier Vieira. Léelo cuando estés sola. No con prisa. No con la cabeza en otra cosa. Hay capítulos que vas a querer subrayar. Hazlo.</p>
        </td></tr>
        <tr><td align="center" style="padding:8px 36px 24px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${urlLibro}" style="height:42px;v-text-anchor:middle;width:200px;" arcsize="8%" stroke="f" fillcolor="#B8861F">
            <w:anchorlock/>
            <center style="color:#FFFFFF;font-family:Georgia,serif;font-size:12px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;">Abrir mi libro</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${urlLibro}" class="cta-mobile" style="display:inline-block;background:#B8861F;color:#FFFFFF;font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;padding:13px 30px;border-radius:2px;">Abrir mi libro</a>
          <!--<![endif]-->
        </td></tr>
        <tr><td class="px-inner body-mobile" style="padding:0 36px;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.7;color:#1A1410;">
          <p style="margin:0 0 14px;">Una sola cosa antes de que cierres este correo:</p>
          <p style="margin:0 0 14px;">Lo que tienes no es falta de fuerza, ${primerNombre}. Es exceso de armadura.</p>
          <p style="margin:0 0 24px;">Y la armadura se quita despacio.</p>
          <p style="margin:0 0 4px;">Bienvenida.</p>
        </td></tr>
        <tr><td class="px-inner signature-mobile" style="padding:4px 36px 24px;font-family:Georgia,'Times New Roman',serif;">
          <p style="margin:0;font-size:14px;color:#1A1410;">— Javier Vieira</p>
          <p style="margin:3px 0 0;font-size:9px;letter-spacing:0.22em;color:#6b5a3c;text-transform:uppercase;">Psicólogo Especialista &middot; Historias de la Mente</p>
        </td></tr>
        <tr><td class="px-inner" style="padding:0 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid #EFE5CE;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        </td></tr>
        <tr><td class="px-inner pd-mobile" style="padding:18px 36px 28px;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.65;color:#5C4A2A;font-style:italic;">
          <strong style="color:#B8861F;font-style:normal;font-weight:bold;letter-spacing:0.12em;font-size:11px;">PD.</strong> En las próximas 24 horas te voy a escribir otra vez. Voy a contarte exactamente qué está pasando dentro de tu cuerpo cuando piensas en él a las tres de la mañana. No es lo que crees. Y entenderlo va a soltar algo.
        </td></tr>
        <tr><td class="px-inner footer-mobile" style="padding:22px 36px 26px;background:#FBF7EE;border-top:1px solid #EFE5CE;font-family:Georgia,'Times New Roman',serif;font-size:10px;line-height:1.7;color:#6b5a3c;text-align:center;">
          Recibes este correo porque pediste el libro "Cómo Dejar al Narcisista" y la clase gratis en historiasdelamente.com.<br><br>
          <strong style="color:#1A1410;font-weight:bold;">Historias de la Mente</strong> &middot; Javier Vieira, Psicólogo Especialista<br>
          Calle 10, Barrio El Poblado &middot; Medellín, Colombia<br>
          <a href="mailto:info@historiasdelamente.com" style="color:#6b5a3c;text-decoration:underline;">info@historiasdelamente.com</a><br><br>
          <a href="${unsubscribeUrl}" style="color:#6b5a3c;text-decoration:underline;">Si prefieres no recibir más correos, cancela aquí</a>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:#B8861F;">&nbsp;</td></tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;"><tr><td style="padding:14px 0;text-align:center;font-family:Georgia,serif;font-size:9px;letter-spacing:0.2em;color:#8B7842;text-transform:uppercase;">historiasdelamente.com</td></tr></table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function correo1BienvenidaText(p: Correo1Params): string {
  return `Hola, ${p.primerNombre}.

Quiero que esto sea lo primero que leas hoy.

Antes de cualquier cosa, gracias por dejarme entrar. Sé exactamente quién está abriendo este correo.

Una mujer que lleva meses, quizás años, cargando algo que ya no puede soltar sola. Una mujer brillante. Profesional. Madre, hija, hermana, jefa. Una mujer que cualquiera mira y piensa "esa lo tiene todo". Y que por dentro se levanta a las tres de la mañana a revisar el celular.

No me equivoco, ¿cierto?

TU PRIMER REGALO
Cómo Dejar al Narcisista — Por Javier Vieira. Léelo cuando estés sola. No con prisa. No con la cabeza en otra cosa.

Abrir mi libro: ${p.urlLibro}

Una sola cosa antes de que cierres este correo:

Lo que tienes no es falta de fuerza, ${p.primerNombre}. Es exceso de armadura.

Y la armadura se quita despacio.

Bienvenida.

— Javier Vieira
Psicólogo Especialista · Historias de la Mente

PD. En las próximas 24 horas te voy a escribir otra vez. Voy a contarte exactamente qué está pasando dentro de tu cuerpo cuando piensas en él a las tres de la mañana. No es lo que crees. Y entenderlo va a soltar algo.

---
Recibes este correo porque pediste el libro "Cómo Dejar al Narcisista" y la clase gratis en historiasdelamente.com.

Historias de la Mente · Javier Vieira, Psicólogo Especialista
Calle 10, Barrio El Poblado · Medellín, Colombia
info@historiasdelamente.com

Cancelar suscripción: ${p.unsubscribeUrl}
`;
}
