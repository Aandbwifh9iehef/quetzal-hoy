import CONFIG from '../site.config.json';
import SEMILLA from '../data/tipo-cambio-historial.json';
import { consultarDia } from './banguat.js';
import { CLAVE_HISTORIAL, construirRespuesta, fusionarHistorial, actualizarTipoCambio } from './tipo-cambio.js';
import INDICADORES from '../data/indicadores.json';
import { anotarAntiguedad } from './indicadores.js';
import { construirContexto, datoDelDia } from './dato-del-dia.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(url.pathname, env, ctx);
    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(correrCron(env));
  }
};

async function correrCron(env) {
  if (!env.DATA) {
    console.log('Cron: no hay KV (DATA); nada que guardar');
    return;
  }
  const r = await actualizarTipoCambio(env);
  console.log(r.ok ? `Tipo de cambio ${r.dato.fecha}: ${r.dato.valor}` : `Banguat falló; se conservan ${r.conservado} días`);
}

const CABECERAS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*'
};

async function handleApi(path, env, ctx) {
  if (path === '/api/tipo-cambio') return apiTipoCambio(env, ctx);
  if (path === '/api/indicadores') return apiIndicadores();
  if (path === '/api/dato-del-dia') return apiDatoDelDia(env, ctx);

  if (path === '/api/config') {
    return Response.json(
      { nombre: CONFIG.nombre, tagline: CONFIG.tagline, contacto: CONFIG.contacto, autor: CONFIG.autor },
      { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=86400' } }
    );
  }

  return Response.json({ error: 'Ruta no encontrada' }, { status: 404, headers: CABECERAS });
}

function hoyIso() {
  return new Date().toISOString().slice(0, 10);
}

function apiIndicadores() {
  const cuerpo = {
    actualizado: INDICADORES.actualizado,
    hoy: hoyIso(),
    indicadores: anotarAntiguedad(INDICADORES.indicadores, hoyIso()),
    referencias: INDICADORES.referencias
  };
  return Response.json(cuerpo, { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=3600' } });
}

async function apiDatoDelDia(env, ctx) {
  const tc = await (await apiTipoCambio(env, ctx)).json();
  const hoy = hoyIso();
  const dato = datoDelDia(construirContexto({ indicadores: INDICADORES, tipoCambio: tc.disponible ? tc : null, hoyIso: hoy }), hoy);
  return Response.json({ fecha: hoy, dato }, { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=3600' } });
}

async function apiTipoCambio(env, ctx) {
  const cache = caches.default;
  const claveCache = new Request('https://cache.quetzal-hoy/api/tipo-cambio');
  const enCache = await cache.match(claveCache);
  if (enCache) return enCache;

  let guardado = [];
  let actualizado = null;
  if (env.DATA) {
    guardado = (await env.DATA.get(CLAVE_HISTORIAL, 'json')) ?? [];
    actualizado = await env.DATA.get('tipo-cambio:actualizado');
  }

  let historial = fusionarHistorial(SEMILLA.datos, guardado);

  // Sin KV o con KV vacío: intenta el dato de hoy en vivo para no mostrar uno viejo
  const hoy = new Date().toISOString().slice(0, 10);
  if (historial.at(-1)?.fecha !== hoy && guardado.length === 0) {
    try {
      const dato = await consultarDia();
      historial = fusionarHistorial(historial, [dato]);
      actualizado = new Date().toISOString();
    } catch {
      // se queda el último dato conocido, con su fecha visible
    }
  }

  const cuerpo = construirRespuesta(historial, { actualizado: actualizado ?? SEMILLA.descargado });
  const res = Response.json(cuerpo, { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=3600' } });
  ctx.waitUntil(cache.put(claveCache, res.clone()));
  return res;
}
