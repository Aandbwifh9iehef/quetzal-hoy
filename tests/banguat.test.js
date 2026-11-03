import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsearTipoCambioDia, parsearTipoCambioRango, aIso, aBanguat, consultarDia, consultarRango } from '../src/banguat.js';

const fx = (n) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');

test('aIso y aBanguat convierten fechas en ambos sentidos', () => {
  assert.equal(aIso('03/11/2026'), '2026-11-03');
  assert.equal(aIso('basura'), null);
  assert.equal(aBanguat('2026-11-03'), '03/11/2026');
  assert.throws(() => aBanguat('03/11/2026'));
});

test('parsea TipoCambioDia real', () => {
  assert.deepEqual(parsearTipoCambioDia(fx('banguat-dia.xml')), { fecha: '2026-11-03', valor: 7.63621 });
});

test('parsea TipoCambioRango real: 733 días ordenados', () => {
  const datos = parsearTipoCambioRango(fx('banguat-rango-2anios.xml'));
  assert.equal(datos.length, 733);
  assert.deepEqual(datos[0], { fecha: '2024-11-01', valor: 7.72505 });
  assert.equal(datos.at(-1).fecha, '2026-11-03');
  for (let i = 1; i < datos.length; i++) assert.ok(datos[i].fecha > datos[i - 1].fecha);
});

test('respuestas rotas no revientan: devuelven null o lista vacía', () => {
  assert.equal(parsearTipoCambioDia(''), null);
  assert.equal(parsearTipoCambioDia('<VarDolar><fecha>x</fecha><referencia>0</referencia></VarDolar>'), null);
  assert.equal(parsearTipoCambioDia('<html>Error 500</html>'), null);
  assert.deepEqual(parsearTipoCambioRango('<html>caído</html>'), []);
});

test('consultarDia manda SOAP y lanza si Banguat no responde', async () => {
  let pedido;
  const fetchOk = async (url, init) => { pedido = { url, init }; return { ok: true, text: async () => fx('banguat-dia.xml') }; };
  const dato = await consultarDia(fetchOk);
  assert.equal(dato.valor, 7.63621);
  assert.match(pedido.url, /banguat\.gob\.gt/);
  assert.equal(pedido.init.headers.SOAPAction, 'http://www.banguat.gob.gt/variables/ws/TipoCambioDia');
  assert.match(pedido.init.body, /<TipoCambioDia /);

  await assert.rejects(() => consultarDia(async () => ({ ok: false, status: 503 })), /503/);
  await assert.rejects(() => consultarDia(async () => ({ ok: true, text: async () => '<html>' })), /sin dato/);
});

test('consultarRango manda las fechas en formato dd/mm/aaaa', async () => {
  let cuerpo;
  const datos = await consultarRango('2024-11-01', '2026-11-03', async (_u, init) => { cuerpo = init.body; return { ok: true, text: async () => fx('banguat-rango-2anios.xml') }; });
  assert.match(cuerpo, /<fechainit>01\/11\/2024<\/fechainit><fechafin>03\/11\/2026<\/fechafin>/);
  assert.equal(datos.length, 733);
});
