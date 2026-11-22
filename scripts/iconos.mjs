// Genera el logo, los íconos de la app y la imagen para redes (og-image) con Chrome sin ventana.
// Uso: node scripts/iconos.mjs   (colores de DISENO.md: verde hondo #06422f, crema #f7f4ec, rojo #c62d3a, oro #e9a81b)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const raiz = new URL('..', import.meta.url).pathname;
const config = JSON.parse(readFileSync(join(raiz, 'site.config.json'), 'utf8'));
const ACENTO = '#0b7552';
const HONDO = '#06422f';
const PAPEL = '#f7f4ec';
const TINTA = '#14211b';
const TINTA_2 = '#46534c';
const ROJO = '#c62d3a';
const ORO = '#e9a81b';

// La marca de Al cambio: una C de "cambio" con el pecho rojo del quetzal y la punta dorada de la pluma.
const signo = (color, transform) => `<g fill="none" stroke-linecap="round"${transform ? ` transform="${transform}"` : ''}><path d="M26.5 9.5A12 12 0 1 0 26.5 22.5" stroke="${color}" stroke-width="4.2"/><path d="M26.5 22.5c1.4 2.4 2.6 3.7 4 4.4" stroke="${ORO}" stroke-width="2.2"/><circle cx="16" cy="16" r="3.6" fill="${ROJO}" stroke="none"/></g>`;

const iconoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${HONDO}"/>${signo(PAPEL, 'translate(4.5 4) scale(.75)')}</svg>\n`;
writeFileSync(join(raiz, 'public/icon.svg'), iconoSvg);

const tmp = mkdtempSync(join(tmpdir(), 'iconos-'));
const fuente = join(raiz, 'public/fonts/figtree-latin.woff2');
function render(nombre, ancho, alto, html) {
  const archivo = join(tmp, nombre.replace(/\//g, '-') + '.html');
  writeFileSync(archivo, `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:Figtree;src:url('file://${fuente}') format('woff2');font-weight:400 600}html,body{margin:0;width:${ancho}px;height:${alto}px;overflow:hidden}</style></head><body>${html}</body></html>`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${ancho},${alto}`, `--screenshot=${join(raiz, 'public', nombre)}`, 'file://' + archivo], { stdio: 'ignore' });
  console.log('public/' + nombre);
}

const cuadrado = (lado, escala) => `<svg width="${lado}" height="${lado}" viewBox="0 0 32 32"><rect width="32" height="32" fill="${HONDO}"/>${signo(PAPEL, `translate(${16 - 16 * escala + 0.6} ${16 - 16 * escala}) scale(${escala})`)}</svg>`;
render('icons/icon-192.png', 192, 192, cuadrado(192, 0.72));
render('icons/icon-512.png', 512, 512, cuadrado(512, 0.72));
render('icons/icon-512-maskable.png', 512, 512, cuadrado(512, 0.55));

render('og-image.png', 1200, 630, `
<div style="box-sizing:border-box;width:1200px;height:630px;background:${HONDO};padding:84px 96px;font-family:Figtree;color:${PAPEL};display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
  <div style="position:absolute;right:-140px;top:-140px;width:560px;height:560px;opacity:.10;background:${PAPEL};-webkit-mask:url('file://${join(raiz, 'public/guilloche.svg')}') center/contain no-repeat"></div>
  <div style="display:flex;align-items:center;gap:28px;position:relative">
    <svg width="112" height="112" viewBox="0 0 32 32">${signo(PAPEL)}</svg>
    <div style="font-size:84px;font-weight:600;letter-spacing:-0.01em">${config.nombre}</div>
  </div>
  <div style="font-size:46px;line-height:1.28;font-weight:400;max-width:960px;position:relative">¿A cómo está el cambio? El dólar de hoy, la economía explicada y cursos para tu dinero</div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid rgba(247,244,236,.25);padding-top:28px;font-size:32px;position:relative">
    <span style="color:${ORO};font-weight:600">${config.dominio}</span>
    <span>Gratis, desde el celular</span>
  </div>
</div>`);

// Gráfico destacado de Google Play (1024×500)
const destacado = `
<div style="box-sizing:border-box;width:1024px;height:500px;background:${HONDO};padding:72px 80px;font-family:Figtree;color:${PAPEL};display:flex;flex-direction:column;justify-content:center;gap:28px;position:relative;overflow:hidden">
  <div style="position:absolute;right:-120px;top:-120px;width:460px;height:460px;opacity:.10;background:${PAPEL};-webkit-mask:url('file://${join(raiz, 'public/guilloche.svg')}') center/contain no-repeat"></div>
  <div style="display:flex;align-items:center;gap:24px;position:relative">
    <svg width="96" height="96" viewBox="0 0 32 32">${signo(PAPEL)}</svg>
    <div style="font-size:76px;font-weight:600;letter-spacing:-0.01em">${config.nombre}</div>
  </div>
  <div style="font-size:38px;line-height:1.3;max-width:840px;position:relative">¿A cómo está el cambio? El dólar de hoy y tu dinero, explicado</div>
</div>`;
const rutaDestacado = join(tmp, 'destacado.html');
writeFileSync(rutaDestacado, `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:Figtree;src:url('file://${fuente}') format('woff2');font-weight:400 600}html,body{margin:0;width:1024px;height:500px;overflow:hidden}</style></head><body>${destacado}</body></html>`);
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1024,500', `--screenshot=${join(raiz, 'android/grafico-destacado.png')}`, 'file://' + rutaDestacado], { stdio: 'ignore' });
console.log('android/grafico-destacado.png');

rmSync(tmp, { recursive: true, force: true });
