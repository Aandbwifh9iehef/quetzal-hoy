import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync(new URL('../data/inversiones.json', import.meta.url), 'utf8'));
const FRASES_PROHIBIDAS = /te conviene|te recomendamos|recomendamos|la mejor opción|deberías invertir|(?<!lo )invierte en|mejor inversión|no pierdas la oportunidad|garantizad[oa]s? ganancias/i;

function textos(obj, acumulado = []) {
  if (typeof obj === 'string') acumulado.push(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => textos(x, acumulado));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((x) => textos(x, acumulado));
  return acumulado;
}

test('toda tasa de plazo fijo y de ahorro tiene fecha, fuente y enlace', () => {
  for (const f of [...datos.tasasPlazoFijo.filas, ...datos.tasasAhorro.filas]) {
    assert.match(f.fecha, /^\d{4}-\d{2}-\d{2}$/, f.entidad);
    assert.ok(f.fuente.length > 3, f.entidad);
    assert.match(f.url, /^https:\/\//, f.entidad);
    assert.ok(f.tasa === null || (typeof f.tasa === 'number' && f.tasa > 0 && f.tasa < 20), f.entidad);
  }
  assert.ok(datos.tasasPlazoFijo.filas.some((f) => f.tasa === null), 'las tasas no públicas se marcan como null');
});

test('los bonos tienen plazos con tasa, fecha y fuente', () => {
  assert.equal(datos.bonos.plazos.length, 3);
  for (const p of datos.bonos.plazos) assert.ok(p.tasa > 5 && p.tasa < 8);
  assert.match(datos.bonos.fecha, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(datos.bonos.url, /^https:\/\//);
});

test('los 6 tipos de inversión están completos', () => {
  assert.equal(datos.tipos.length, 6);
  for (const t of datos.tipos) {
    for (const campo of ['nombre', 'queEs', 'desde', 'plazo', 'riesgo', 'riesgoExplicado', 'liquidez', 'supervisa']) assert.ok(t[campo], `${t.id}: falta ${campo}`);
    assert.ok(t.pros.length >= 2 && t.contras.length >= 2, t.id);
    assert.match(t.riesgo, /^(bajo|medio|alto|bajo a medio|medio a alto)$/, t.id);
  }
});

test('ninguna frase recomienda una opción específica a la persona', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const invertir = html.slice(html.indexOf('id="tab-invertir"'), html.indexOf('id="tab-aprende"'));
  for (const t of [...textos(datos), invertir]) {
    assert.doesNotMatch(t, FRASES_PROHIBIDAS, t.slice(0, 80));
  }
});

test('la sección "no es inversión" enlaza a la SIB y al Registro del Mercado de Valores', () => {
  const enlaces = datos.noEsInversion.verificar.map((v) => v.enlace);
  assert.ok(enlaces.some((e) => e.includes('sib.gob.gt')));
  assert.ok(enlaces.some((e) => e.includes('rmvm.gob.gt')));
  assert.ok(datos.noEsInversion.senales.length >= 5);
});
