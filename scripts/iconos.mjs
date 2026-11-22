// Genera el logo, los íconos de la app y la imagen para redes (og-image) con Chrome sin ventana.
// Uso: node scripts/iconos.mjs   (los colores salen de DISENO.md: acento #1d6b4f, papel #f4f4f0)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const raiz = new URL('..', import.meta.url).pathname;
const config = JSON.parse(readFileSync(join(raiz, 'site.config.json'), 'utf8'));
const ACENTO = '#1d6b4f';
const PAPEL = '#f4f4f0';
const TINTA = '#17201b';
const TINTA_2 = '#47504b';

// La marca: una Q con la cola larga del quetzal. Un solo color.
export const SIGNO = '<circle cx="13" cy="13" r="9" stroke-width="3"/><path d="M17 21.2c2.6 4 6.5 7 12 8" stroke-width="3"/><path d="M20.3 18.6c2.4 3 5.4 5 9.7 5.6" stroke-width="2"/>';
const signo = (color, transform) => `<g fill="none" stroke="${color}" stroke-linecap="round"${transform ? ` transform="${transform}"` : ''}>${SIGNO}</g>`;

const iconoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${ACENTO}"/>${signo('#fff', 'translate(4 4) scale(.75)')}</svg>\n`;
writeFileSync(join(raiz, 'public/icon.svg'), iconoSvg);

const tmp = mkdtempSync(join(tmpdir(), 'iconos-'));
const fuente = join(raiz, 'public/fonts/figtree-latin.woff2');
function render(nombre, ancho, alto, html) {
  const archivo = join(tmp, nombre.replace(/\//g, '-') + '.html');
  writeFileSync(archivo, `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:Figtree;src:url('file://${fuente}') format('woff2');font-weight:400 600}html,body{margin:0;width:${ancho}px;height:${alto}px;overflow:hidden}</style></head><body>${html}</body></html>`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${ancho},${alto}`, `--screenshot=${join(raiz, 'public', nombre)}`, 'file://' + archivo], { stdio: 'ignore' });
  console.log('public/' + nombre);
}

const cuadrado = (lado, escala) => `<svg width="${lado}" height="${lado}" viewBox="0 0 32 32"><rect width="32" height="32" fill="${ACENTO}"/>${signo('#fff', `translate(${16 - 16 * escala} ${16 - 16 * escala}) scale(${escala})`)}</svg>`;
render('icons/icon-192.png', 192, 192, cuadrado(192, 0.72));
render('icons/icon-512.png', 512, 512, cuadrado(512, 0.72));
render('icons/icon-512-maskable.png', 512, 512, cuadrado(512, 0.55));

render('og-image.png', 1200, 630, `
<div style="box-sizing:border-box;width:1200px;height:630px;background:${PAPEL};padding:88px 96px;font-family:Figtree;color:${TINTA};display:flex;flex-direction:column;justify-content:space-between">
  <div style="display:flex;align-items:center;gap:28px">
    <svg width="104" height="104" viewBox="0 0 32 32">${signo(ACENTO)}</svg>
    <div style="font-size:76px;font-weight:600;letter-spacing:-0.01em">${config.nombre}</div>
  </div>
  <div style="font-size:44px;line-height:1.3;font-weight:400;color:${TINTA_2};max-width:940px">El dólar de hoy, la economía de Guatemala explicada y cursos para manejar tu dinero</div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid rgba(23,32,27,.12);padding-top:28px;font-size:32px">
    <span style="color:${ACENTO};font-weight:600">${config.dominio}</span>
    <span style="color:${TINTA_2}">Gratis, desde el celular</span>
  </div>
</div>`);

// Gráfico destacado de Google Play (1024×500)
const destacado = `
<div style="box-sizing:border-box;width:1024px;height:500px;background:${PAPEL};padding:72px 80px;font-family:Figtree;color:${TINTA};display:flex;flex-direction:column;justify-content:center;gap:28px">
  <div style="display:flex;align-items:center;gap:24px">
    <svg width="88" height="88" viewBox="0 0 32 32">${signo(ACENTO)}</svg>
    <div style="font-size:68px;font-weight:600;letter-spacing:-0.01em">${config.nombre}</div>
  </div>
  <div style="font-size:36px;line-height:1.3;color:${TINTA_2};max-width:820px">El dólar de hoy, la economía explicada y cursos para manejar tu dinero</div>
</div>`;
const rutaDestacado = join(tmp, 'destacado.html');
writeFileSync(rutaDestacado, `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:Figtree;src:url('file://${fuente}') format('woff2');font-weight:400 600}html,body{margin:0;width:1024px;height:500px;overflow:hidden}</style></head><body>${destacado}</body></html>`);
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1024,500', `--screenshot=${join(raiz, 'android/grafico-destacado.png')}`, 'file://' + rutaDestacado], { stdio: 'ignore' });
console.log('android/grafico-destacado.png');

rmSync(tmp, { recursive: true, force: true });
