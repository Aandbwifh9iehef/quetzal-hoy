import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ahorroMensual, plazoFijo, perdidaInflacion, metaAhorro } from '../src/calculadoras.js';

test('ahorroMensual: sin interés es suma simple; con 12% anual coincide con la fórmula conocida', () => {
  assert.deepEqual(ahorroMensual({ aporte: 100, tasaAnual: 0, meses: 12 }), { total: 1200, aportado: 1200, intereses: 0 });
  // 1,000 al mes, 1% mensual, 12 meses → 12,682.50
  const r = ahorroMensual({ aporte: 1000, tasaAnual: 12, meses: 12 });
  assert.equal(r.total, 12682.5);
  assert.equal(r.aportado, 12000);
  assert.equal(r.intereses, 682.5);
  // con capital inicial de 10,000 al 6% por 24 meses
  const c = ahorroMensual({ aporte: 0, tasaAnual: 6, meses: 24, inicial: 10000 });
  assert.equal(c.total, 11271.6);
});

test('plazoFijo: Q10,000 al 6% por 365 días → Q600 de interés, Q60 de ISR, Q540 netos', () => {
  assert.deepEqual(plazoFijo({ monto: 10000, tasaAnual: 6, dias: 365 }), { interes: 600, isr: 60, neto: 540, total: 10540 });
  const medio = plazoFijo({ monto: 10000, tasaAnual: 6, dias: 180 });
  assert.equal(medio.interes, 295.89);
  assert.equal(plazoFijo({ monto: 10000, tasaAnual: 6, dias: 365, isr: 0 }).neto, 600);
});

test('perdidaInflacion: Q1,000 con 4.69% un año valen Q955.20 (pierden Q44.80)', () => {
  const r = perdidaInflacion({ monto: 1000, inflacionAnual: 4.69, anios: 1 });
  assert.equal(r.valorReal, 955.2);
  assert.equal(r.perdida, 44.8);
  assert.equal(r.porcentaje, 4.48);
  assert.equal(perdidaInflacion({ monto: 1000, inflacionAnual: 0, anios: 5 }).perdida, 0);
});

test('metaAhorro es la inversa de ahorroMensual', () => {
  assert.equal(metaAhorro({ meta: 12000, meses: 12, tasaAnual: 0 }).aporte, 1000);
  const m = metaAhorro({ meta: 12682.5, meses: 12, tasaAnual: 12 });
  assert.equal(m.aporte, 1000);
  assert.equal(m.intereses, 682.5);
  // si el capital inicial ya cubre la meta, no hace falta aportar
  assert.equal(metaAhorro({ meta: 5000, meses: 12, tasaAnual: 5, inicial: 6000 }).aporte, 0);
});

test('entradas inválidas devuelven null en vez de NaN', () => {
  assert.equal(ahorroMensual({ aporte: -5, tasaAnual: 5, meses: 12 }), null);
  assert.equal(ahorroMensual({ aporte: 100, tasaAnual: 5, meses: 0 }), null);
  assert.equal(plazoFijo({ monto: NaN, tasaAnual: 5, dias: 365 }), null);
  assert.equal(perdidaInflacion({ monto: '1000', inflacionAnual: 5, anios: 1 }), null);
  assert.equal(metaAhorro({ meta: 1000, meses: 12, tasaAnual: Infinity }), null);
});
