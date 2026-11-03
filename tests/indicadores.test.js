import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsearRemesas, resumirRemesas, anotarAntiguedad, diasDesde } from '../src/indicadores.js';

const html = new TextDecoder('latin1').decode(readFileSync(new URL('./fixtures/banguat-remesas.htm', import.meta.url)));
const indicadores = JSON.parse(readFileSync(new URL('../data/indicadores.json', import.meta.url), 'utf8'));

test('parsea la tabla real de remesas del Banguat', () => {
  const t = parsearRemesas(html);
  assert.equal(t['2026'][9], 2240.8);
  assert.equal(t['2026'][1], 1954.7);
  assert.equal(t['2026'][10], undefined);
  assert.equal(t['2025'].total, 25530.2);
  assert.equal(t['2002'][1], 83.2);
});

test('resumirRemesas calcula acumulados del año y del anterior', () => {
  const r = resumirRemesas(parsearRemesas(html), 2026);
  assert.equal(r.mes, 9);
  assert.equal(r.periodo, 'Septiembre 2026');
  assert.equal(r.valor, 2240.8);
  assert.ok(Math.abs(r.acumuladoAnio - 20015.7) < 0.2);
  assert.ok(Math.abs(r.acumuladoAnioAnterior - 18968.4) < 0.2);
  assert.equal(r.totalAnioAnterior, 25530.2);
  assert.equal(resumirRemesas(parsearRemesas(html), 1999), null);
});

test('HTML roto no revienta', () => {
  assert.equal(parsearRemesas('<html>caído</html>'), null);
  assert.equal(parsearRemesas(''), null);
});

test('todos los indicadores tienen valor, fecha, fuente, url y significado', () => {
  for (const [clave, ind] of Object.entries(indicadores.indicadores)) {
    assert.equal(typeof ind.valor, 'number', clave);
    assert.match(ind.fecha, /^\d{4}-\d{2}-\d{2}$/, clave);
    assert.ok(ind.fuente.length > 3, clave);
    assert.match(ind.url, /^https:\/\//, clave);
    assert.ok(ind.significado.length > 40, clave);
  }
});

test('anotarAntiguedad marca "dato de <mes>" pasados 45 días', () => {
  const a = anotarAntiguedad(indicadores.indicadores, '2026-11-03');
  assert.equal(a.combustibles.viejo, false);
  assert.equal(a.combustibles.etiqueta, null);
  assert.equal(a['tasa-lider'].viejo, false);
  const b = anotarAntiguedad(indicadores.indicadores, '2026-12-20');
  assert.equal(b.inflacion.viejo, true);
  assert.equal(b.inflacion.etiqueta, 'dato de septiembre');
  assert.equal(b['tasa-lider'].etiqueta, 'dato de septiembre');
  assert.equal(diasDesde('2026-10-01', '2026-11-03'), 33);
});
