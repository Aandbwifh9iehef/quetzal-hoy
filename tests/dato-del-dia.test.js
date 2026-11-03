import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PLANTILLAS, construirContexto, todosLosDatos, datoDelDia, factorInflacion } from '../src/dato-del-dia.js';
import { construirRespuesta } from '../src/tipo-cambio.js';

const indicadores = JSON.parse(readFileSync(new URL('../data/indicadores.json', import.meta.url), 'utf8'));
const historial = JSON.parse(readFileSync(new URL('../data/tipo-cambio-historial.json', import.meta.url), 'utf8')).datos;
const tipoCambio = construirRespuesta(historial);
const ctx = construirContexto({ indicadores, tipoCambio, hoyIso: '2026-11-03' });

test('hay al menos 15 plantillas y todas producen texto con números', () => {
  assert.ok(PLANTILLAS.length >= 15);
  const datos = todosLosDatos(ctx);
  assert.ok(datos.length >= 15, `solo ${datos.length} plantillas dieron resultado`);
  for (const d of datos) {
    assert.ok(d.titulo.length > 3, d.id);
    assert.match(d.texto, /\d/, d.id);
    assert.ok(d.fuente.length > 2, d.id);
    assert.doesNotMatch(d.texto, /NaN|undefined|null/, d.id);
  }
});

test('la rotación es determinista y cambia de día', () => {
  const a = datoDelDia(ctx, '2026-11-03');
  const b = datoDelDia(ctx, '2026-11-03');
  const c = datoDelDia(ctx, '2026-11-04');
  assert.equal(a.id, b.id);
  assert.notEqual(a.id, c.id);
});

test('factorInflacion compone dic/dic y la acumulada del año', () => {
  const f = factorInflacion({ 2024: 10, 2025: 10 }, 5, 2024, 2026);
  assert.ok(Math.abs(f - 1.1 * 1.1 * 1.05) < 1e-9);
  assert.equal(factorInflacion({ 2025: 10 }, 0, 2024, 2026), null);
});

test('cálculos conocidos: Q1,000 en casa y comida para 4', () => {
  const datos = Object.fromEntries(todosLosDatos(ctx).map((d) => [d.id, d]));
  // 1000 / 1.0469 = 955.20 → pierde 44.80
  assert.match(datos['guardar-en-casa'].texto, /Q 955\.20/);
  assert.match(datos['guardar-en-casa'].texto, /Q 44\.80/);
  // 966.74 × 4 = 3,866.96 ; sueldo 4,252.28 → 91%
  assert.match(datos['canasta-familia-4'].texto, /Q 3,866\.96/);
  assert.match(datos['canasta-familia-4'].texto, /91%/);
  // 10 galones regular = 306.90
  assert.match(datos['tanque-gasolina'].texto, /Q 306\.90/);
  // tasa real 3.50 - 4.69 = -1.19 → pierde
  assert.match(datos['tasa-lider-vs-inflacion'].texto, /pierde 1\.19%/);
});

test('si faltan datos de tipo de cambio, siguen saliendo plantillas sin romper', () => {
  const sinTc = construirContexto({ indicadores, tipoCambio: null, hoyIso: '2026-11-03' });
  const datos = todosLosDatos(sinTc);
  assert.ok(datos.length >= 8);
  for (const d of datos) assert.doesNotMatch(d.texto, /NaN|undefined/, d.id);
});
