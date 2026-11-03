import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { assetLinks } from '../src/android.js';

const config = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8'));
const HUELLA = 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99';

test('assetlinks: vacío sin huellas; completo con paquete y huella válida', () => {
  assert.deepEqual(assetLinks(config.android), [], 'sin huellas configuradas aún');
  const al = assetLinks({ paquete: 'fyi.compoundclub.hoy', sha256: [HUELLA.toLowerCase(), 'basura'] });
  assert.equal(al.length, 1);
  assert.equal(al[0].target.package_name, 'fyi.compoundclub.hoy');
  assert.deepEqual(al[0].target.sha256_cert_fingerprints, [HUELLA]);
  assert.deepEqual(al[0].relation, ['delegate_permission/common.handle_all_urls']);
});

test('el proyecto TWA y la ficha de Play Store están completos', () => {
  const twa = JSON.parse(readFileSync(new URL('../android/twa-manifest.json', import.meta.url), 'utf8'));
  assert.equal(twa.packageId, config.android.paquete);
  assert.equal(twa.host, config.dominio);
  assert.equal(twa.name, config.nombre);
  assert.match(twa.iconUrl, new RegExp(`^https://${config.dominio}/icons/icon-512\\.png$`));
  assert.ok(twa.shortcuts.length >= 3);
  const ficha = readFileSync(new URL('../android/ficha-play-store.md', import.meta.url), 'utf8');
  const titulo = /## Título[^\n]*\n\n(.+)\n/.exec(ficha)[1].trim();
  const corta = /## Descripción corta[^\n]*\n\n(.+)\n/.exec(ficha)[1].trim();
  assert.ok(titulo.length <= 30, `título ${titulo.length} > 30`);
  assert.ok(corta.length <= 80, `descripción corta ${corta.length} > 80`);
  const larga = /## Descripción completa[^\n]*\n\n([\s\S]*?)\n## /.exec(ficha)[1];
  assert.ok(larga.length > 500 && larga.length <= 4000, `descripción completa ${larga.length}`);
  assert.match(ficha, /privacidad/);
  for (const f of ['README.md', 'declaraciones.md', 'ficha-play-store.md', 'twa-manifest.json', 'grafico-destacado.svg']) {
    assert.ok(existsSync(new URL(`../android/${f}`, import.meta.url)), `falta android/${f}`);
  }
});
