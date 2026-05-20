// ═══════════════════════════════════════════════════════════
//  EXODUS ADMIN — Función de Login
//  Solo necesita: ADMIN_PASSWORD en las variables de entorno
// ═══════════════════════════════════════════════════════════

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request' }) };
  }

  const { password } = body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ADMIN_PASSWORD no configurada en Netlify' })
    };
  }

  if (password !== ADMIN_PASSWORD) {
    await new Promise(r => setTimeout(r, 600)); // dificulta fuerza bruta
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Contraseña incorrecta' })
    };
  }

  // Token firmado con la misma contraseña como secret
  const exp     = Date.now() + 8 * 60 * 60 * 1000; // expira en 8 horas
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64');
  const firma   = require('crypto')
    .createHmac('sha256', ADMIN_PASSWORD)
    .update(payload)
    .digest('base64');
  const token = payload + '.' + firma;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  };
};
