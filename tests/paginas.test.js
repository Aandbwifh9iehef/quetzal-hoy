import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { paginaTipoCambio, paginaIndicador, paginaCursos, paginaCurso, paginaLeccion, paginaInvertir, paginaNovedades, rutasSitemap, sitemapXml, renderTexto, INDICADORES_SEO } from '../src/paginas.js';
import { anotarAntiguedad } from '../src/indicadores.js';
import { construirRespuesta } from '../src/tipo-cambio.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const config = leer('site.config.json');
const indicadores = anotarAntiguedad(leer('data/indicadores.json').indicadores, '2026-11-03');
const cursos = leer('data/cursos.json').cursos;
const inversiones = leer('data/inversiones.json');
const novedades = leer('data/novedades.json');
const tc = construirRespuesta(leer('data/tipo-cambio-historial.json').datos);

function revisar(html, ruta) {
  assert.match(html, /^<!doctype html>\n<html lang="es-GT">/, ruta);
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${ruta}: un solo h1`);
  assert.match(html, new RegExp(`<link rel="canonical" href="https://${config.dominio}${ruta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), `${ruta}: canonical`);
  assert.match(html, /<meta name="description" content="[^"]{30,}">/, `${ruta}: descripción`);
  assert.doesNotMatch(html, /undefined|NaN|\[object/, `${ruta}: texto roto`);
  assert.match(html, /Aviso legal/, ruta);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const ld = JSON.parse(m[1]);
    assert.ok(ld['@type'], `${ruta}: JSON-LD con @type`);
  }
}

test('las páginas de indicadores se generan con datos reales, fuente y JSON-LD', () => {
  const html = paginaTipoCambio(tc, config);
  revisar(html, INDICADORES_SEO['tipo-cambio'].ruta);
  assert.match(html, /Q 7\.6362 por dólar/);
  assert.match(html, /"@type":"ExchangeRateSpecification"/);
  assert.match(html, /"price":7\.63621/);
  for (const clave of ['tasa-lider', 'inflacion', 'remesas', 'combustibles', 'canasta-basica']) {
    const h = paginaIndicador(clave, indicadores[clave], config);
    revisar(h, INDICADORES_SEO[clave].ruta);
    assert.match(h, new RegExp(`href="${indicadores[clave].url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${clave}: enlace a la fuente`);
  }
  assert.match(paginaIndicador('inflacion', indicadores.inflacion, config), /4\.69%/);
  const vieja = paginaIndicador('inflacion', anotarAntiguedad(leer('data/indicadores.json').indicadores, '2027-01-15').inflacion, config);
  assert.match(vieja, /Dato de septiembre/);
  revisar(paginaTipoCambio({ disponible: false }, config), INDICADORES_SEO['tipo-cambio'].ruta);
});

test('cursos, lecciones, comparador y novedades', () => {
  revisar(paginaCursos(cursos, config), '/cursos');
  for (const c of cursos) {
    const h = paginaCurso(c, config);
    revisar(h, `/cursos/${c.id}`);
    assert.match(h, /"@type":"Course"/);
    for (const l of c.lecciones) {
      const hl = paginaLeccion(c, l, config);
      revisar(hl, `/cursos/${c.id}/${l.id}`);
      assert.match(hl, /<article class="leccion">/);
      assert.ok(hl.length > 3000, `${c.id}/${l.id}: lección completa`);
    }
  }
  const inv = paginaInvertir(inversiones, config);
  revisar(inv, '/invertir-en-guatemala');
  assert.match(inv, /Consultar con la entidad/);
  assert.match(inv, /6\.25%/);
  revisar(paginaNovedades(novedades, config), '/novedades');
});

test('renderTexto convierte el mini-markdown y escapa HTML', () => {
  const h = renderTexto('## Título\n\nHola **mundo** <b>x</b>\n\n- uno\n- dos\n\n1. a\n2. b');
  assert.match(h, /<h2>Título<\/h2>/);
  assert.match(h, /<strong>mundo<\/strong> &lt;b&gt;x&lt;\/b&gt;/);
  assert.match(h, /<ul><li>uno<\/li><li>dos<\/li><\/ul>/);
  assert.match(h, /<ol><li>a<\/li><li>b<\/li><\/ol>/);
});

test('el sitemap incluye portada, indicadores, comparador, cursos y las 15 lecciones', () => {
  const rutas = rutasSitemap(cursos);
  const xml = sitemapXml(rutas, config.dominio, '2026-11-03');
  assert.equal(rutas.length, 14 + 3 + 15, 'portada + 6 indicadores + comparador + cursos + novedades + 4 legales + 3 cursos + 15 lecciones');
  for (const r of ['/', '/tipo-cambio-hoy', '/inflacion-guatemala', '/invertir-en-guatemala', '/cursos', '/cursos/deudas/5', '/novedades']) {
    assert.match(xml, new RegExp(`<loc>https://${config.dominio}${r.replace(/\//g, '\\/')}</loc>`), r);
  }
  assert.doesNotMatch(xml, /compartir|\.html/);
  assert.equal(new Set(rutas.map((r) => r.ruta)).size, rutas.length, 'sin rutas repetidas');
});
