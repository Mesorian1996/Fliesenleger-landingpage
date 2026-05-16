/**
 * Cloudflare Worker — Limani Contact Form
 * Receives JSON POST from frontend, sends via Resend API.
 *
 * Deploy:  wrangler deploy
 * Secret:  wrangler secret put RESEND_API_KEY  (NEVER store in this file)
 */

// ─── Design System ───────────────────────────────────────────────────────────
const BRAND = {
  primary:     '#0c1b2e',
  accent:      '#e8922a',
  bg:          '#faf8f5',
  cardBg:      '#ffffff',
  border:      '#e5e0d8',
  textHeading: '#0c1b2e',
  textBody:    '#4a3f35',
  textMuted:   '#7a6a5a',
  darkBg:      '#1a1a1a',
  darkCard:    '#2a2a2a',
  darkBorder:  '#3a3a3a',
  darkText:    '#f0ede8',
  fontSans:    '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSerif:   'Georgia, "Times New Roman", Times, serif',
  company:     'Limani Fliesenleger',
  addr:        'E7 13 · 68159 Mannheim',
  url:         'https://www.limani-fliesenleger.de',
  recipient:   'kontakt@limani-fliesenleger.de',
  sender:      'kontakt@mydigitalworks.de',
};

const FIELD_LABELS = {
  vorname:       'Vorname',
  nachname:      'Nachname',
  name:          'Name',
  email:         'E-Mail',
  telefon:       'Telefon',
  nachricht:     'Nachricht',
  message:       'Nachricht',
  // Funnel fields
  leistung:      'Gewünschte Leistung',
  flaeche:       'Fläche',
  zeitrahmen:    'Zeitrahmen',
  material:      'Material',
  rueckbau:      'Rückbau',
  anmerkung:     'Anmerkung',
};

const ALLOWED_ORIGINS = [
  'https://www.limani-fliesenleger.de',
  'https://limani-fliesenleger.de',
];

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin);

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    // Parse body — JSON or FormData
    let data = {};
    const contentType = request.headers.get('Content-Type') || '';
    try {
      if (contentType.includes('application/json')) {
        data = await request.json();
      } else {
        const fd = await request.formData();
        fd.forEach((value, key) => { data[key] = String(value); });
      }
    } catch {
      return jsonError(400, 'Invalid request body', corsHeaders);
    }

    // Normalize keys to lowercase
    data = Object.fromEntries(Object.entries(data).map(([k, v]) => [k.toLowerCase(), v]));

    // Honeypot
    if (data._gotcha) {
      return jsonOk(corsHeaders);
    }

    // Basic validation
    if (!data.email && !data.telefon) {
      return jsonError(400, 'Email oder Telefon erforderlich', corsHeaders);
    }

    // Build sender name
    const senderName = [data.vorname, data.nachname].filter(Boolean).join(' ')
      || data.name || 'Unbekannte Person';

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${BRAND.company} <${BRAND.sender}>`,
        to: [BRAND.recipient],
        reply_to: data.email || undefined,
        subject: `Neue Anfrage von ${senderName}`,
        html: buildHtml(data, senderName),
        text: buildText(data, senderName),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return jsonError(500, 'Email konnte nicht gesendet werden', corsHeaders);
    }

    return jsonOk(corsHeaders);
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function jsonOk(headers) {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function jsonError(status, message, headers) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function esc(str) {
  return String(str || '–')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Plain Text ───────────────────────────────────────────────────────────────
function buildText(data, senderName) {
  const lines = [
    `Neue Anfrage — ${BRAND.company}`,
    '─'.repeat(40),
    '',
  ];
  const skipKeys = ['_gotcha', '_csrf'];
  for (const [key, value] of Object.entries(data)) {
    if (skipKeys.includes(key)) continue;
    const label = FIELD_LABELS[key] || key;
    lines.push(`${label}: ${value || '–'}`);
  }
  lines.push('', '─'.repeat(40), BRAND.addr, BRAND.url);
  return lines.join('\n');
}

// ─── HTML Email ───────────────────────────────────────────────────────────────
function buildHtml(data, senderName) {
  const b = BRAND;
  const skipKeys = ['_gotcha', '_csrf'];

  const fieldRows = Object.entries(data)
    .filter(([key]) => !skipKeys.includes(key))
    .map(([key, value]) => {
      const label = FIELD_LABELS[key] || key;
      const val = esc(value);
      return `
        <tr style="border-bottom:1px solid ${b.border};">
          <td style="padding:12px 0;">
            <div style="font-family:${b.fontSans};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${b.textMuted};margin-bottom:4px;">${label}</div>
            <div style="font-family:${b.fontSans};font-size:15px;color:${b.textHeading};line-height:1.5;">${val}</div>
          </td>
        </tr>`;
    }).join('');

  const replyTo = esc(data.email || '');

  return `<!DOCTYPE html>
<html lang="de" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    @media(prefers-color-scheme:dark){
      body,.email-bg{background-color:${b.darkBg}!important}
      .email-card{background-color:${b.darkCard}!important;border-color:${b.darkBorder}!important}
      .fv{color:${b.darkText}!important}
      .fl{color:#888!important}
      .fr{border-color:${b.darkBorder}!important}
      .ft{color:#666!important}
      .div{background-color:${b.darkBorder}!important}
    }
    @media screen and(max-width:620px){
      .ec{width:100%!important}
      .eh,.ek{padding-left:24px!important;padding-right:24px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${b.bg};">
<div style="display:none;max-height:0;overflow:hidden;">Neue Anfrage von ${esc(senderName)} &#8203;&zwnj;&#8203;</div>
<table class="email-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${b.bg};min-height:100vh;">
  <tr><td align="center" style="padding:40px 16px 60px;">
    <table class="ec" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <!-- Header -->
      <tr>
        <td class="eh" style="background-color:${b.primary};padding:28px 40px 24px;border-radius:14px 14px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="vertical-align:middle;">
              <div style="font-family:${b.fontSerif};font-size:17px;color:${b.accent};letter-spacing:0.14em;text-transform:uppercase;">${b.company}</div>
              <div style="font-family:${b.fontSans};font-size:11px;color:rgba(255,255,255,0.45);margin-top:5px;">Neue Anfrage eingegangen</div>
            </td>
            <td align="right" style="vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="42" height="42" style="background-color:${b.accent};border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="font-size:18px;line-height:42px;color:${b.primary};">✉</span>
                </td>
              </tr></table>
            </td>
          </tr></table>
        </td>
      </tr>
      <!-- Accent bar -->
      <tr><td style="height:3px;background:linear-gradient(to right,${b.accent},${b.accent}88,transparent);"></td></tr>
      <!-- Card -->
      <tr>
        <td class="ek email-card" style="background-color:${b.cardBg};padding:36px 40px 32px;border:1px solid ${b.border};border-top:none;border-radius:0 0 14px 14px;">
          <p style="margin:0 0 28px;font-family:${b.fontSans};font-size:14px;color:${b.textBody};line-height:1.7;">
            Eine neue Anfrage ist über das Kontaktformular eingegangen:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${fieldRows}</table>
          <div style="height:28px;"></div>
          <div class="div" style="height:1px;background-color:${b.border};margin-bottom:28px;"></div>
          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" border="0"><tr><td>
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="mailto:${replyTo}" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="50%" strokecolor="${b.accent}" fillcolor="${b.accent}">
              <w:anchorlock/><center style="color:${b.primary};font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;">Direkt antworten</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="mailto:${replyTo}" style="display:inline-block;padding:13px 28px;background-color:${b.accent};color:${b.primary};font-family:${b.fontSans};font-size:13px;font-weight:700;text-decoration:none;border-radius:100px;letter-spacing:0.03em;">
              Direkt antworten
            </a>
            <!--<![endif]-->
          </td></tr></table>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:24px 0 0;text-align:center;">
          <p class="ft" style="margin:0;font-family:${b.fontSans};font-size:11px;color:${b.textMuted};line-height:1.8;">
            Automatisch generiert &middot; <strong style="color:${b.textBody};">${b.company}</strong> &middot; ${b.addr}
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
