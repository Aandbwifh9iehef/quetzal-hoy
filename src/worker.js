import CONFIG from '../site.config.json';
import SEMILLA from '../data/tipo-cambio-historial.json';
import { consultarDia } from './banguat.js';
import { CLAVE_HISTORIAL, construirRespuesta, fusionarHistorial, actualizarTipoCambio } from './tipo-cambio.js';
import INDICADORES from '../data/indicadores.json';
import { anotarAntiguedad } from './indicadores.js';
import { construirContexto, datoDelDia } from './dato-del-dia.js';
import FUENTES from '../data/fuentes-noticias.json';
import { actualizarNoticias, CLAVE_ULTIMO, CLAVE_INDICE, CLAVE_USO } from './noticias.js';

const CRON_NOTICIAS = '0 12 * * *';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(url.pathname, env, ctx, url);
    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(correrCron(event.cron, env));
  }
};

async function correrCron(cron, env) {
  if (!env.DATA) {
    console.log('Cron: no hay KV (DATA); nada que guardar');
    return;
  }
  if (cron === CRON_NOTICIAS) {
    const r = await actualizarNoticias(env, { fuentes: FUENTES.fuentes, ai: env.AI });
    console.log(`Noticias ${r.fecha}: ${r.guatemala.length} GT + ${r.mundo.length} mundo, ${r.uso.resumenes} resúmenes, ~${r.uso.neuronas} neuronas` + (r.errores.length ? `; errores: ${r.errores.join(' | ')}` : ''));
    return;
  }
  const r = await actualizarTipoCambio(env);
  console.log(r.ok ? `Tipo de cambio ${r.dato.fecha}: ${r.dato.valor}` : `Banguat falló; se conservan ${r.conservado} días`);
}

const CABECERAS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*'
};

async function apiNoticias(env, url) {
  const headers = { ...CABECERAS, 'Cache-Control': 'public, max-age=900' };
  if (!env.DATA) return Response.json({ disponible: false }, { headers });
  const fecha = url.searchParams.get('fecha');
  const clave = /^\d{4}-\d{2}-\d{2}$/.test(fecha ?? '') ? `noticias:${fecha}` : CLAVE_ULTIMO;
  const datos = await env.DATA.get(clave, 'json');
  if (!datos) return Response.json({ disponible: false }, { headers });
  const { errores, ...publico } = datos;
  return Response.json({ disponible: true, ...publico }, { headers });
}

async function apiArchivoNoticias(env) {
  const fechas = env.DATA ? (await env.DATA.get(CLAVE_INDICE, 'json')) ?? [] : [];
  return Response.json({ fechas }, { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=900' } });
}

async function apiUsoNoticias(env) {
  const uso = env.DATA ? (await env.DATA.get(CLAVE_USO, 'json')) ?? [] : [];
  return Response.json({ limiteDiario: 10000, uso }, { headers: { ...CABECERAS, 'Cache-Control': 'no-store' } });
}

async function handleApi(path, env, ctx, urlActual) {
  if (path === '/api/tipo-cambio') return apiTipoCambio(env, ctx);
  if (path === '/api/indicadores') return apiIndicadores();
  if (path === '/api/dato-del-dia') return apiDatoDelDia(env, ctx);
  if (path === '/api/noticias') return apiNoticias(env, urlActual);
  if (path === '/api/noticias/archivo') return apiArchivoNoticias(env);
  if (path === '/api/noticias/uso') return apiUsoNoticias(env);

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
