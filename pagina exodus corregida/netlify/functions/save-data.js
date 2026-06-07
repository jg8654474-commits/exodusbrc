// ═══════════════════════════════════════════════════════════
//  EXODUS ADMIN — Guardar datos en GitHub
//  Variables de entorno necesarias:
//    GITHUB_TOKEN  → token personal de GitHub (ghp_...)
//    GITHUB_REPO   → usuario/nombre-del-repo
//    ADMIN_PASSWORD → (ya existente)
// ═══════════════════════════════════════════════════════════

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verificar token de sesión antes de permitir guardar
  const crypto = require('crypto');
  const authHeader = event.headers['x-admin-token'] || '';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const GITHUB_TOKEN   = process.env.GITHUB_TOKEN;
  const GITHUB_REPO    = process.env.GITHUB_REPO; // ej: exodusbrc/pagina-exodus-corregida

  if (!ADMIN_PASSWORD || !GITHUB_TOKEN || !GITHUB_REPO) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Variables de entorno no configuradas' })
    };
  }

  // Verificar token de sesión
  try {
    const [payload, firma] = authHeader.split('.');
    if (!payload || !firma) throw new Error('Token inválido');
    const firmaEsperada = crypto
      .createHmac('sha256', ADMIN_PASSWORD)
      .update(payload)
      .digest('base64');
    if (firma !== firmaEsperada) throw new Error('Firma inválida');
    const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (Date.now() > exp) throw new Error('Token expirado');
  } catch(e) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  // Parsear el body con los datos a guardar
  let datos;
  try {
    datos = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const ARCHIVO = 'datos.json';
  const REPO_ENCODED = GITHUB_REPO.split('/').map(p => encodeURIComponent(p)).join('/');
  const API_BASE = `https://api.github.com/repos/${REPO_ENCODED}/contents/${ARCHIVO}`;
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'exodus-admin'
  };

  // 1. Obtener el SHA actual del archivo (necesario para actualizarlo)
  let sha = null;
  try {
    const getRes = await fetch(API_BASE, { headers });
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    }
    // Si es 404, el archivo no existe aún → lo creamos
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Error al leer archivo de GitHub' }) };
  }

  // 2. Codificar los datos en base64
  const contenido = JSON.stringify(datos, null, 2);
  const contenidoB64 = Buffer.from(contenido).toString('base64');

  // 3. Hacer el PUT para crear/actualizar el archivo
  const body = {
    message: `[admin] Actualizar catálogo — ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`,
    content: contenidoB64,
    branch: 'main'
  };
  if (sha) body.sha = sha; // obligatorio para actualizar un archivo existente

  try {
    const putRes = await fetch(API_BASE, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      return {
        statusCode: putRes.status,
        body: JSON.stringify({ error: 'Error de GitHub', detalle: errData.message || putRes.statusText })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, mensaje: 'Catálogo actualizado en GitHub ✅' })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Error al guardar en GitHub', detalle: e.message }) };
  }
};

