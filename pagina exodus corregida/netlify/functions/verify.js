// ═══════════════════════════════════════════════════════════
//  EXODUS ADMIN — Verificación de Token
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
    return { statusCode: 400, body: JSON.stringify({ valid: false }) };
  }

  const { token } = body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!token || !ADMIN_PASSWORD) {
    return { statusCode: 200, body: JSON.stringify({ valid: false }) };
  }

  try {
    const [payload, firma] = token.split('.');
    if (!payload || !firma) {
      return { statusCode: 200, body: JSON.stringify({ valid: false }) };
    }

    // Verificar firma con ADMIN_PASSWORD como secret
    const firmaEsperada = require('crypto')
      .createHmac('sha256', ADMIN_PASSWORD)
      .update(payload)
      .digest('base64');

    if (firma !== firmaEsperada) {
      return { statusCode: 200, body: JSON.stringify({ valid: false }) };
    }

    // Verificar expiración
    const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (Date.now() > exp) {
      return { statusCode: 200, body: JSON.stringify({ valid: false, expired: true }) };
    }

    return { statusCode: 200, body: JSON.stringify({ valid: true }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ valid: false }) };
  }
};
