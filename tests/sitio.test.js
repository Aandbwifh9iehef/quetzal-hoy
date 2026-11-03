import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname;
const publico = join(raiz, 'public');
const config = JSON.parse(readFileSync(join(raiz, 'site.config.json'), 'utf8'));

test('site.config.json tiene lo mínimo', () => {
  assert.equal(config.nombre, 'Quetzal Hoy');
  assert.match(config.contacto, /@/);
  assert.equal(config.autor, 'Leo Marín');
});

test('manifest es válido y apunta a íconos que existen', () => {
  const m = JSON.parse(readFileSync(join(publico, 'manifest.webmanifest'), 'utf8'));
  assert.equal(m.short_name, config.nombre);
  assert.equal(m.display, 'standalone');
  assert.equal(m.lang, 'es-GT');
  for (const icono of m.icons) {
    assert.ok(existsSync(join(publico, icono.src)), `falta ${icono.src}`);
  }
});

test('los PNG de íconos tienen el tamaño declarado', () => {
  const tam = (archivo) => {
    const b = readFileSync(join(publico, 'icons', archivo));
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  };
  assert.deepEqual(tam('icon-192.png'), [192, 192]);
  assert.deepEqual(tam('icon-512.png'), [512, 512]);
  assert.deepEqual(tam('icon-512-maskable.png'), [512, 512]);
});

test('todas las páginas HTML están en español y enlazan los estilos', () => {
  const paginas = readdirSync(publico).filter((f) => f.endsWith('.html'));
  assert.ok(paginas.length >= 7);
  for (const p of paginas) {
    const html = readFileSync(join(publico, p), 'utf8');
    assert.match(html, /<html lang="es-GT">/, `${p} sin lang es-GT`);
    assert.match(html, /\/styles\.css/, `${p} sin styles.css`);
    assert.match(html, /<meta name="viewport"/, `${p} sin viewport`);
  }
});

test('index tiene las 4 pestañas, el service worker y Open Graph', () => {
  const html = readFileSync(join(publico, 'index.html'), 'utf8');
  for (const t of ['Hoy', 'Noticias', 'Invertir', 'Aprende']) {
    assert.match(html, new RegExp(`id="tab-${t.toLowerCase()}"`), `falta pestaña ${t}`);
  }
  assert.match(html, /<script src="\/app\.js">/);
  const app = readFileSync(join(publico, 'app.js'), 'utf8');
  assert.match(app, /serviceWorker\.register\('\/sw\.js'\)/);
  assert.match(html, /property="og:image" content="\/og-image\.png"/);
  assert.ok(existsSync(join(publico, 'og-image.png')));
});

test('la página principal pesa menos de 150 KB sin imágenes', () => {
  const peso = ['index.html', 'styles.css', 'sw.js', 'manifest.webmanifest']
    .reduce((s, f) => s + readFileSync(join(publico, f)).length, 0);
  assert.ok(peso < 150 * 1024, `pesa ${peso} bytes`);
});

test('sitemap y robots apuntan al dominio configurado', () => {
  const sitemap = readFileSync(join(publico, 'sitemap.xml'), 'utf8');
  const robots = readFileSync(join(publico, 'robots.txt'), 'utf8');
  assert.match(sitemap, new RegExp(`https://${config.dominio}/`));
  assert.match(robots, new RegExp(`https://${config.dominio}/sitemap.xml`));
});
