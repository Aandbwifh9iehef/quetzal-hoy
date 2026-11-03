import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsearRss, limpiarTexto } from '../src/rss.js';
import { esFinanciera, puntuarFinanciera, quitarDuplicados, similitud, validarResumen, extraerCifras, actualizarNoticias, elegir, neuronasEstimadas, CLAVE_ULTIMO, CLAVE_INDICE, CLAVE_USO } from '../src/noticias.js';

const fx = (n) => readFileSync(new URL(`./fixtures/rss/${n}.xml`, import.meta.url), 'utf8');
const FUENTES = JSON.parse(readFileSync(new URL('../data/fuentes-noticias.json', import.meta.url), 'utf8')).fuentes;
const AHORA = new Date('2026-11-03T12:00:00Z');

function kvFalso(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return {
    async get(k, tipo) { const v = m.get(k) ?? null; return v !== null && tipo === 'json' ? JSON.parse(v) : v; },
    async put(k, v) { m.set(k, v); },
    _m: m
  };
}

const fetchFixtures = async (url) => {
  const f = FUENTES.find((x) => x.url === url);
  if (!f) return { ok: false, status: 404 };
  return { ok: true, text: async () => fx(f.id) };
};

test('parsearRss lee RSS 2.0 de los seis medios: título, enlace, descripción sin HTML y fecha', () => {
  for (const f of FUENTES) {
    const items = parsearRss(fx(f.id));
    assert.ok(items.length >= 5, `${f.id}: ${items.length} items`);
    for (const it of items) {
      assert.ok(it.titulo.length > 5, f.id);
      assert.match(it.enlace, /^https?:\/\//, f.id);
      assert.doesNotMatch(it.descripcion, /<[a-z!/]/i, `${f.id}: HTML en descripción`);
      assert.doesNotMatch(it.descripcion, /CDATA|&lt;|&amp;/, f.id);
      assert.ok(it.descripcion.length <= 401, f.id);
      assert.ok(it.fecha === null || /^\d{4}-\d{2}-\d{2}T/.test(it.fecha), f.id);
    }
  }
});

test('parsearRss también lee Atom y tolera basura', () => {
  const atom = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Sube el dólar</title><link rel="alternate" href="https://ejemplo.com/a"/><summary>Texto &amp; más</summary><published>2026-11-03T10:00:00Z</published></entry></feed>`;
  const [it] = parsearRss(atom);
  assert.equal(it.titulo, 'Sube el dólar');
  assert.equal(it.enlace, 'https://ejemplo.com/a');
  assert.equal(it.descripcion, 'Texto & más');
  assert.deepEqual(parsearRss('<html>caído</html>'), []);
  assert.deepEqual(parsearRss(''), []);
});

test('limpiarTexto quita CDATA, etiquetas y entidades, y recorta', () => {
  assert.equal(limpiarTexto('<![CDATA[<p>Hola &amp; <b>mundo</b></p>]]>'), 'Hola & mundo');
  assert.equal(limpiarTexto('&lt;span&gt;Doble&lt;/span&gt; escapado'), 'Doble escapado');
  assert.ok(limpiarTexto('palabra '.repeat(100), 50).length <= 51);
});

test('el filtro financiero deja pasar economía y descarta deportes/política', () => {
  const lahora = { seccionEconomica: false };
  assert.equal(esFinanciera({ titulo: 'Banguat mantiene la tasa líder en 3.50%', descripcion: '' }, lahora), true);
  assert.equal(esFinanciera({ titulo: 'Sube el precio de la gasolina esta semana', descripcion: 'El MEM publicó los precios de referencia' }, lahora), true);
  assert.equal(esFinanciera({ titulo: 'Joviel Acevedo afirma que el STEG orientará a padres de familia para votar', descripcion: 'El líder del sindicato aseguró' }, lahora), false);
  assert.equal(esFinanciera({ titulo: 'La selección nacional gana su partido amistoso', descripcion: 'Goles al final del encuentro' }, lahora), false);
  assert.ok(puntuarFinanciera({ titulo: 'Cualquier cosa', descripcion: '' }, { seccionEconomica: true }) >= 3);
  assert.equal(esFinanciera({ titulo: 'Fútbol: la Liga Nacional', descripcion: '' }, { seccionEconomica: true }), false);
});

test('quitarDuplicados une la misma noticia en dos medios', () => {
  const items = [
    { titulo: 'Remesas crecen 5.5% y suman US$20 mil millones a septiembre', enlace: 'https://a/1' },
    { titulo: 'Remesas suman US$20 mil millones a septiembre y crecen 5.5%', enlace: 'https://b/2' },
    { titulo: 'Remesas crecen 5.5% y suman US$20 mil millones a septiembre', enlace: 'https://a/1' },
    { titulo: 'El MEM publica precios de combustibles', enlace: 'https://c/3' }
  ];
  const u = quitarDuplicados(items);
  assert.equal(u.length, 2);
  assert.ok(similitud(items[0].titulo, items[1].titulo) >= 0.5);
  assert.ok(similitud(items[0].titulo, items[3].titulo) < 0.2);
});

test('quitarDuplicados detecta la misma noticia con titulares distintos (caso real de la SIB)', () => {
  const u = quitarDuplicados([
    { titulo: 'Juan Carlos Catalán integra nuevo equipo de la SIB: estos son los cinco intendentes designados', enlace: 'https://pl/1' },
    { titulo: 'SIB conforma equipo de intendentes para el período 2026-2030, estos son los cinco profesionales', enlace: 'https://lh/2' },
    { titulo: 'Factura petrolera de Guatemala sube 46.4% y revela un cambio en el consumo de gasolinas', enlace: 'https://pl/3' },
    { titulo: 'Wall Street afronta las midterms: más riesgo regulatorio para la IA', enlace: 'https://ep/4' }
  ]);
  assert.deepEqual(u.map((x) => x.enlace), ['https://pl/1', 'https://pl/3', 'https://ep/4']);
});

test('en Mundo no salen más de 2 noticias del mismo medio', async () => {
  const env = { DATA: kvFalso() };
  const r = await actualizarNoticias(env, { fuentes: FUENTES, fetchFn: fetchFixtures, ai: null, ahora: AHORA });
  const porMedio = {};
  for (const n of r.mundo) porMedio[n.medio] = (porMedio[n.medio] ?? 0) + 1;
  for (const m of Object.keys(porMedio)) assert.ok(porMedio[m] <= 2, m);
  assert.equal(r.mundo.length, 3);
});

test('elegir respeta el tope y el máximo por fuente', () => {
  const items = [];
  for (let i = 0; i < 8; i++) items.push({ titulo: 't' + i, fuente: 'pl', puntos: 10 - i, fecha: null });
  items.push({ titulo: 'otra', fuente: 'rep', puntos: 1, fecha: null });
  const e = elegir(items, 5, 3);
  assert.equal(e.length, 5, 'rellena con sobrantes cuando faltan medios');
  assert.equal(e.filter((x) => x.fuente === 'pl').length, 4);
  assert.ok(e.some((x) => x.fuente === 'rep'), 'el otro medio entra aunque tenga menos puntos');
});

test('validarResumen descarta cifras inventadas, frases de más y textos vacíos', () => {
  const fuente = 'Remesas crecen 5.5% y suman US$20,015.7 millones a septiembre de 2026';
  assert.equal(validarResumen('Las remesas crecieron 5.5% hasta septiembre. Suman US$20,015.7 millones.', 'Si recibes remesas, ese dinero sigue llegando con fuerza.', fuente).ok, true);
  assert.equal(validarResumen('Las remesas crecieron 5.5% y llegaron a 20015.7 millones.', 'Te afecta poco.', fuente).ok, true);
  const inventada = validarResumen('Las remesas crecieron 7% hasta septiembre.', 'Recibes más.', fuente);
  assert.equal(inventada.ok, false);
  assert.match(inventada.motivo, /cifra no presente/);
  assert.equal(validarResumen('Una. Dos. Tres.', 'Afecta.', fuente).ok, false);
  assert.equal(validarResumen('Trump asegura que EE. UU. dejará de pagar. Es un cambio grande.', 'Si dependes de ese dinero, prepárate.', 'Trump asegura que EE. UU. dejará de pagar').ok, true);
  assert.equal(validarResumen('Resumen bien.', 'Una. Dos.', fuente).ok, false);
  assert.equal(validarResumen('', 'x', fuente).ok, false);
  assert.equal(validarResumen(null, null, fuente).ok, false);
  assert.ok(extraerCifras('Q30.69 y 20,015.7').has('30.69'));
});

test('actualizarNoticias con fixtures reales: 5 de Guatemala, 3 del mundo, resúmenes validados y archivo', async () => {
  const env = { DATA: kvFalso() };
  let llamadas = 0;
  const ai = {
    async run(_m, { messages }) {
      llamadas++;
      const titular = /Titular: (.*)/.exec(messages[1].content)[1];
      if (llamadas === 1) return { response: '{"resumen":"Subió 99.9% según nadie.","afecta":"Pagas 77 veces más."}', usage: { prompt_tokens: 300, completion_tokens: 40 } };
      if (llamadas === 2) throw new Error('IA caída');
      return { response: `Claro: {"resumen":"${titular.replace(/"/g, '')}.","afecta":"Conviene estar atento."}`, usage: { prompt_tokens: 300, completion_tokens: 40 } };
    }
  };
  const r = await actualizarNoticias(env, { fuentes: FUENTES, fetchFn: fetchFixtures, ai, ahora: AHORA });
  assert.equal(r.guatemala.length, 5);
  assert.equal(r.mundo.length, 3);
  assert.deepEqual(r.errores, []);
  assert.equal(r.guatemala[0].resumen, null, 'cifras inventadas → solo titular');
  assert.equal(r.guatemala[1].resumen, null, 'IA caída → solo titular');
  assert.ok(r.guatemala[2].resumen, 'resumen válido se conserva');
  assert.equal(r.uso.descartados, 1);
  assert.equal(r.uso.sinIa, 1);
  assert.equal(r.uso.resumenes, 6);
  assert.ok(r.uso.neuronas > 0 && r.uso.neuronas < 200, `neuronas ${r.uso.neuronas}`);
  for (const n of [...r.guatemala, ...r.mundo]) {
    assert.ok(!('descripcion' in n), 'no se guarda la descripción del medio');
    assert.ok(n.medio && n.enlace && n.titulo);
  }
  const medios = new Set(r.guatemala.map((n) => n.medio));
  assert.ok(medios.size >= 2, 'noticias de Guatemala de más de un medio');
  assert.equal((await env.DATA.get(CLAVE_INDICE, 'json'))[0], '2026-11-03');
  assert.equal((await env.DATA.get(CLAVE_ULTIMO, 'json')).fecha, '2026-11-03');
  assert.ok(await env.DATA.get('noticias:2026-11-03'));
  assert.equal((await env.DATA.get(CLAVE_USO, 'json'))[0].neuronas, r.uso.neuronas);
});

test('sin IA y con una fuente caída: solo titulares, sin romper', async () => {
  const env = { DATA: kvFalso({ [CLAVE_INDICE]: JSON.stringify(['2026-11-02']) }) };
  const fetchConCaida = async (url) => (url.includes('prensalibre') ? { ok: false, status: 500 } : fetchFixtures(url));
  const r = await actualizarNoticias(env, { fuentes: FUENTES, fetchFn: fetchConCaida, ai: null, ahora: AHORA });
  assert.ok(r.guatemala.length >= 3);
  assert.ok(r.errores.some((e) => e.startsWith('prensalibre')));
  assert.ok(r.guatemala.every((n) => n.resumen === null));
  assert.equal(r.uso.neuronas, 0);
  assert.deepEqual(await env.DATA.get(CLAVE_INDICE, 'json'), ['2026-11-03', '2026-11-02']);
});

test('estimación de neuronas: 8 noticias al día quedan muy por debajo de 10,000', () => {
  const n = neuronasEstimadas({ entrada: 8 * 350, salida: 8 * 80 });
  assert.ok(n < 300, `${n} neuronas`);
});
