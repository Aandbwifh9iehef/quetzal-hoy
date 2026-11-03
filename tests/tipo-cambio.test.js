import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fusionarHistorial, serieDesde, construirRespuesta, actualizarTipoCambio, CLAVE_HISTORIAL } from '../src/tipo-cambio.js';

const dia = readFileSync(new URL('./fixtures/banguat-dia.xml', import.meta.url), 'utf8');

function kvFalso(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return {
    async get(k, tipo) { const v = m.get(k) ?? null; return v !== null && tipo === 'json' ? JSON.parse(v) : v; },
    async put(k, v) { m.set(k, v); },
    _m: m
  };
}

test('fusionarHistorial quita duplicados, ordena y prefiere el último valor', () => {
  const r = fusionarHistorial(
    [{ fecha: '2026-11-02', valor: 7.64 }, { fecha: '2026-11-01', valor: 7.65 }],
    [{ fecha: '2026-11-02', valor: 7.63 }, { fecha: 'x', valor: NaN }]
  );
  assert.deepEqual(r, [{ fecha: '2026-11-01', valor: 7.65 }, { fecha: '2026-11-02', valor: 7.63 }]);
});

test('serieDesde recorta por días hacia atrás', () => {
  const h = [];
  for (let i = 0; i < 40; i++) {
    const d = new Date(Date.UTC(2026, 9, 1 + i));
    h.push({ fecha: d.toISOString().slice(0, 10), valor: 7.6 + i / 1000 });
  }
  const s7 = serieDesde(h, '2026-11-09', 7);
  assert.equal(s7.length, 7);
  assert.equal(s7[0].fecha, '2026-11-03');
  assert.equal(s7.at(-1).fecha, '2026-11-09');
});

test('construirRespuesta calcula cambio vs ayer y tendencia', () => {
  const r = construirRespuesta([{ fecha: '2026-11-02', valor: 7.64 }, { fecha: '2026-11-03', valor: 7.63621 }]);
  assert.equal(r.disponible, true);
  assert.equal(r.valor, 7.63621);
  assert.equal(r.ayer.valor, 7.64);
  assert.equal(r.cambio, -0.00379);
  assert.equal(r.tendencia, 'baja');
  assert.equal(r.series['7d'].length, 2);
  assert.equal(r.fuente, 'Banco de Guatemala');
  assert.deepEqual(construirRespuesta([]), { disponible: false });
});

test('cron guarda el dato del día en KV', async () => {
  const env = { DATA: kvFalso({ [CLAVE_HISTORIAL]: JSON.stringify([{ fecha: '2026-11-02', valor: 7.64 }]) }) };
  const r = await actualizarTipoCambio(env, { fetchFn: async () => ({ ok: true, text: async () => dia }), pausaMs: 0 });
  assert.equal(r.ok, true);
  const guardado = await env.DATA.get(CLAVE_HISTORIAL, 'json');
  assert.deepEqual(guardado, [{ fecha: '2026-11-02', valor: 7.64 }, { fecha: '2026-11-03', valor: 7.63621 }]);
  assert.ok(await env.DATA.get('tipo-cambio:actualizado'));
});

test('cron: si Banguat no responde, reintenta y conserva el último dato', async () => {
  const env = { DATA: kvFalso({ [CLAVE_HISTORIAL]: JSON.stringify([{ fecha: '2026-11-02', valor: 7.64 }]) }) };
  let llamadas = 0;
  const r = await actualizarTipoCambio(env, { fetchFn: async () => { llamadas++; throw new Error('timeout'); }, intentos: 3, pausaMs: 0 });
  assert.equal(r.ok, false);
  assert.equal(llamadas, 3);
  assert.deepEqual(await env.DATA.get(CLAVE_HISTORIAL, 'json'), [{ fecha: '2026-11-02', valor: 7.64 }]);
  assert.match(await env.DATA.get('tipo-cambio:ultimo-error'), /timeout/);
});

test('cron: falla una vez y luego funciona', async () => {
  const env = { DATA: kvFalso() };
  let n = 0;
  const r = await actualizarTipoCambio(env, { fetchFn: async () => { if (n++ === 0) throw new Error('x'); return { ok: true, text: async () => dia }; }, pausaMs: 0 });
  assert.equal(r.ok, true);
  assert.equal(r.intentos, 2);
});
