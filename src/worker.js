import CONFIG from '../site.config.json';
import SEMILLA from '../data/tipo-cambio-historial.json';
import { consultarDia } from './banguat.js';
import { CLAVE_HISTORIAL, construirRespuesta, fusionarHistorial, actualizarTipoCambio } from './tipo-cambio.js';
import INDICADORES from '../data/indicadores.json';
import { anotarAntiguedad } from './indicadores.js';
import { construirContexto, datoDelDia } from './dato-del-dia.js';
import FUENTES from '../data/fuentes-noticias.json';
import INVERSIONES from '../data/inversiones.json';
import CURSOS from '../data/cursos.json';
import { textoResumen, svgImagen, FORMATOS } from './compartir.js';
import NOVEDADES from '../data/novedades.json';
import { INDICADORES_SEO, paginaTipoCambio, paginaIndicador, paginaCursos, paginaCurso, paginaLeccion, paginaInvertir, paginaNovedades, paginaAnunciate, paginaMediaKit, rutasSitemap, sitemapXml } from './paginas.js';
import { aplicarAfiliados, aplicarPatrocinioCursos } from './patrocinio.js';
import { premiumPublico } from './premium.js';

const INVERSIONES_PUB = aplicarAfiliados(INVERSIONES, CONFIG.afiliados);
import { actualizarNoticias, CLAVE_ULTIMO, CLAVE_INDICE, CLAVE_USO } from './noticias.js';

const CRON_NOTICIAS = '0 12 * * *';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(url.pathname, env, ctx, url, request);
    const pagina = await paginaSeo(url.pathname, env, ctx);
    if (pagina) return pagina;
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

const HTML = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=900' };
const htmlRes = (h) => new Response(h, { headers: HTML });

async function paginaSeo(path, env, ctx) {
  const ruta = path.replace(/\/$/, '') || '/';
  if (ruta === '/sitemap.xml') {
    return new Response(sitemapXml(rutasSitemap(CURSOS.cursos), CONFIG.dominio, hoyIso()), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
  }
  if (ruta === INDICADORES_SEO['tipo-cambio'].ruta) return htmlRes(paginaTipoCambio(await (await apiTipoCambio(env, ctx)).json(), CONFIG));
  for (const [clave, seo] of Object.entries(INDICADORES_SEO)) {
    if (clave !== 'tipo-cambio' && ruta === seo.ruta) return htmlRes(paginaIndicador(clave, anotarAntiguedad(INDICADORES.indicadores, hoyIso())[clave], CONFIG));
  }
  if (ruta === '/invertir-en-guatemala') return htmlRes(paginaInvertir(INVERSIONES_PUB, CONFIG));
  if (ruta === '/novedades') return htmlRes(paginaNovedades(NOVEDADES, CONFIG));
  if (ruta === '/anunciate') return htmlRes(paginaAnunciate(CONFIG, await metricas(env)));
  if (ruta === '/media-kit') return new Response(paginaMediaKit(CONFIG, await metricas(env)), { headers: { ...HTML, 'Cache-Control': 'no-store' } });
  if (ruta === '/cursos') return htmlRes(paginaCursos(CURSOS.cursos, CONFIG));
  const m = /^\/cursos\/([a-z-]+)(?:\/(\d+))?$/.exec(ruta);
  if (m) {
    const c = CURSOS.cursos.find((x) => x.id === m[1]);
    if (!c) return null;
    if (!m[2]) return htmlRes(paginaCurso(c, CONFIG));
    const l = c.lecciones.find((x) => x.id === m[2]);
    return l ? htmlRes(paginaLeccion(c, l, CONFIG)) : null;
  }
  return null;
}

const EVENTOS_VALIDOS = new Set(['instalacion', 'curso_iniciado', 'curso_terminado', 'clic_afiliado', 'compartir', 'copiar_resumen']);

async function apiEvento(env, request) {
  if (request.method !== 'POST') return Response.json({ error: 'POST' }, { status: 405, headers: CABECERAS });
  const nombre = (await request.text()).trim().slice(0, 40);
  if (!EVENTOS_VALIDOS.has(nombre)) return Response.json({ ok: false }, { status: 400, headers: CABECERAS });
  if (env.DATA) {
    const clave = `eventos:${hoyIso()}`;
    const dia = (await env.DATA.get(clave, 'json')) ?? {};
    dia[nombre] = (dia[nombre] ?? 0) + 1;
    await env.DATA.put(clave, JSON.stringify(dia), { expirationTtl: 400 * 86400 });
  }
  return Response.json({ ok: true }, { headers: { ...CABECERAS, 'Cache-Control': 'no-store' } });
}

async function metricas(env) {
  const ev = await (await apiEventos(env)).json();
  return {
    eventos: ev.totales,
    desde: hoyIso(),
    contenido: { indicadores: Object.keys(INDICADORES.indicadores).length + 1, noticiasPorDia: 8, cursos: CURSOS.cursos.length, lecciones: CURSOS.cursos.reduce((s, c) => s + c.lecciones.length, 0), entidadesTasas: new Set(INVERSIONES.tasasPlazoFijo.filas.map((f) => f.entidad)).size }
  };
}

async function apiEventos(env) {
  const dias = {};
  if (env.DATA) {
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const iso = new Date(d.getTime() - i * 86400_000).toISOString().slice(0, 10);
      const v = await env.DATA.get(`eventos:${iso}`, 'json');
      if (v) dias[iso] = v;
    }
  }
  const totales = {};
  for (const v of Object.values(dias)) for (const [k, n] of Object.entries(v)) totales[k] = (totales[k] ?? 0) + n;
  return Response.json({ dias, totales }, { headers: { ...CABECERAS, 'Cache-Control': 'no-store' } });
}

async function handleApi(path, env, ctx, urlActual, request) {
  if (path === '/api/evento') return apiEvento(env, request);
  if (path === '/api/premium/verificar') return apiPremiumVerificar(request);
  if (path === '/api/eventos') return apiEventos(env);
  if (path === '/api/tipo-cambio') return apiTipoCambio(env, ctx);
  if (path === '/api/indicadores') return apiIndicadores();
  if (path === '/api/dato-del-dia') return apiDatoDelDia(env, ctx);
  if (path === '/api/noticias') return apiNoticias(env, urlActual);
  if (path === '/api/inversiones') return Response.json(INVERSIONES_PUB, { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=3600' } });
  if (path === '/api/cursos') return apiCursos();
  if (path === '/api/resumen') return apiResumen(env, ctx);
  if (path === '/api/imagen-dia.svg') return apiImagenDia(env, ctx, urlActual);
  if (path === '/api/noticias/archivo') return apiArchivoNoticias(env);
  if (path === '/api/noticias/uso') return apiUsoNoticias(env);

  if (path === '/api/config') {
    return Response.json(
      { nombre: CONFIG.nombre, tagline: CONFIG.tagline, contacto: CONFIG.contacto, autor: CONFIG.autor, analytics: CONFIG.analytics || null, patrocinador: CONFIG.patrocinador || null },
      { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=86400' } }
    );
  }

  return Response.json({ error: 'Ruta no encontrada' }, { status: 404, headers: CABECERAS });
}

async function datosDelDia(env, ctx) {
  const tipoCambio = await (await apiTipoCambio(env, ctx)).json();
  const noticias = env.DATA ? await env.DATA.get(CLAVE_ULTIMO, 'json') : null;
  const hoy = hoyIso();
  const dato = datoDelDia(construirContexto({ indicadores: INDICADORES, tipoCambio: tipoCambio.disponible ? tipoCambio : null, hoyIso: hoy }), hoy);
  return { fecha: hoy, tipoCambio, noticias, dato, config: CONFIG };
}

async function apiResumen(env, ctx) {
  const d = await datosDelDia(env, ctx);
  return Response.json({ fecha: d.fecha, texto: textoResumen(d) }, { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=900' } });
}

async function apiImagenDia(env, ctx, url) {
  const formato = FORMATOS[url.searchParams.get('formato')] ? url.searchParams.get('formato') : '1080x1350';
  const d = await datosDelDia(env, ctx);
  return new Response(svgImagen({ ...d, formato }), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900' } });
}

function apiCursos() {
  const cursos = aplicarPatrocinioCursos(CURSOS.cursos, CONFIG.patrocinioCursos).map((c) => ({
    ...c,
    premium: CONFIG.cursosPremium?.includes(c.id) ?? false,
    lecciones: c.lecciones.map((l) => ({ ...l, video: CONFIG.videos?.[`${c.id}-${l.id}`] || l.video || null }))
  }));
  return Response.json({ autor: CURSOS.autor, premium: premiumPublico(CONFIG.premium), cursos }, { headers: { ...CABECERAS, 'Cache-Control': 'public, max-age=3600' } });
}

async function apiPremiumVerificar(request) {
  if (request.method !== 'POST') return Response.json({ error: 'POST' }, { status: 405, headers: CABECERAS });
  const codigo = (await request.text()).trim().toUpperCase().slice(0, 64);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codigo));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const ok = Boolean(codigo) && (CONFIG.premium?.codigosSha256 ?? []).includes(hex);
  return Response.json({ ok }, { status: ok ? 200 : 403, headers: { ...CABECERAS, 'Cache-Control': 'no-store' } });
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
