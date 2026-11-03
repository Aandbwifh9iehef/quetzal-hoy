import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatearQuetzales, formatearFecha, diasDesde } from '../src/formato.js';

test('formatearQuetzales separa miles y usa dos decimales', () => {
  assert.equal(formatearQuetzales(7.7325), 'Q 7.73');
  assert.equal(formatearQuetzales(1234567.5), 'Q 1,234,567.50');
  assert.equal(formatearQuetzales(0), 'Q 0.00');
});

test('formatearQuetzales respeta decimales pedidos y rechaza basura', () => {
  assert.equal(formatearQuetzales(7.7325, 4), 'Q 7.7325');
  assert.equal(formatearQuetzales(NaN), '—');
  assert.equal(formatearQuetzales('7'), '—');
});

test('formatearFecha devuelve "3 nov 2026" en español', () => {
  assert.equal(formatearFecha('2026-11-03T12:00:00Z'), '3 nov 2026');
  assert.equal(formatearFecha(new Date(Date.UTC(2025, 0, 15))), '15 ene 2025');
  assert.equal(formatearFecha('no es fecha'), '—');
});

test('diasDesde cuenta días completos', () => {
  const hoy = new Date('2026-11-03T12:00:00Z');
  assert.equal(diasDesde('2026-11-01T12:00:00Z', hoy), 2);
  assert.equal(diasDesde('2026-09-01T12:00:00Z', hoy), 63);
  assert.equal(diasDesde('x', hoy), null);
});
