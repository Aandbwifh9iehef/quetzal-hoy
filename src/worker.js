import CONFIG from '../site.config.json';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApi(url.pathname, env);
    }

    // Serve static assets
    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    // Fase 2: actualizar tipo de cambio
    // Fase 4: actualizar noticias
    console.log(`Cron ejecutado: ${event.cron} — ${new Date().toISOString()}`);
  }
};

async function handleApi(path, env) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600'
  };

  if (path === '/api/tipo-cambio') {
    const data = await env.DATA?.get('tipo-cambio', 'json');
    if (!data) {
      return Response.json({ disponible: false }, { headers: { ...headers, 'Cache-Control': 'no-store' } });
    }
    return Response.json({ disponible: true, ...data }, { headers });
  }

  if (path === '/api/noticias') {
    const data = await env.DATA?.get('noticias', 'json');
    if (!data) {
      return Response.json({ noticias: [] }, { headers });
    }
    return Response.json(data, { headers });
  }

  if (path === '/api/config') {
    return Response.json({
      nombre: CONFIG.nombre,
      tagline: CONFIG.tagline,
      contacto: CONFIG.contacto,
      autor: CONFIG.autor
    }, { headers });
  }

  return Response.json({ error: 'Ruta no encontrada' }, { status: 404, headers });
}
