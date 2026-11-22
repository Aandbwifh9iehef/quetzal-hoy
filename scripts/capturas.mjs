// Capturas de todas las pantallas a 390 px (claro y oscuro) y Hoy a 1280 px, con Chrome sin ventana.
// Uso: node scripts/capturas.mjs http://localhost:8787 docs/unslop/despues [01-hoy,03-invertir,1280,17]
//      node scripts/capturas.mjs https://hoy.compoundclub.fyi android/capturas play
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = (process.argv[2] ?? 'http://localhost:8788').replace(/\/$/, '');
const PLAY = process.argv[4] === 'play'; // capturas de la ficha de Google Play (390×780 a 2x, tema claro)
const solo = process.argv[4] && !PLAY ? process.argv[4].split(',') : null; // p. ej. 01-hoy,03-invertir
const salida = process.argv[3] ?? 'docs/unslop/despues';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PUERTO = 9333;
const UA_MOVIL = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

const clic = (sel) => `new Promise((r) => { const t = setInterval(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) { clearInterval(t); e.click(); r(1); } }, 100); setTimeout(() => { clearInterval(t); r(0); }, 6000); })`;

const PANTALLAS = [
  { nombre: '01-hoy', ruta: '/' },
  { nombre: '02-noticias', ruta: '/#noticias' },
  { nombre: '03-invertir', ruta: '/#invertir' },
  { nombre: '04-aprende', ruta: '/#aprende' },
  { nombre: '05-curso', ruta: '/#aprende', pasos: [clic('.curso[data-curso="deudas"]')] },
  { nombre: '06-leccion', ruta: '/#aprende', pasos: [clic('.curso[data-curso="deudas"]'), clic('#btn-empezar')] },
  { nombre: '07-acerca', ruta: '/acerca' },
  { nombre: '08-contacto', ruta: '/contacto' },
  { nombre: '09-privacidad', ruta: '/privacidad' },
  { nombre: '10-aviso-legal', ruta: '/aviso-legal' },
  { nombre: '11-404', ruta: '/no-existe-esta-pagina' },
  { nombre: '12-sin-conexion', ruta: '/sin-conexion' },
  { nombre: '13-compartir', ruta: '/compartir' },
  { nombre: '14-tipo-cambio-hoy', ruta: '/tipo-cambio-hoy' },
  { nombre: '15-leccion-web', ruta: '/cursos/deudas/1' },
  { nombre: '16-anunciate', ruta: '/anunciate' }
];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = mkdtempSync(join(tmpdir(), 'capturas-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, '--no-first-run', '--hide-scrollbars', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });

let objetivos;
for (let i = 0; i < 50; i++) {
  try { objetivos = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json(); if (objetivos.some((o) => o.type === 'page')) break; } catch {}
  await esperar(200);
}
const ws = new WebSocket(objetivos.find((o) => o.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pendientes = new Map();
const oyentes = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); }
  if (m.method) oyentes.forEach((f) => f(m));
});
const cdp = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id;
  pendientes.set(n, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
  ws.send(JSON.stringify({ id: n, method, params }));
});
const cargado = () => new Promise((r) => { const f = (m) => { if (m.method === 'Page.loadEventFired') { oyentes.splice(oyentes.indexOf(f), 1); r(); } }; oyentes.push(f); });

await cdp('Page.enable');
await cdp('Runtime.enable');
mkdirSync(salida, { recursive: true });

async function capturar({ nombre, ruta, pasos = [] }, ancho, alto, tema, archivo) {
  const movil = ancho < 900;
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: movil ? 2 : 1, mobile: movil });
  await cdp('Emulation.setUserAgentOverride', { userAgent: movil ? UA_MOVIL : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: tema }] });
  await cdp('Page.navigate', { url: 'about:blank' });
  await esperar(150);
  const listo = cargado();
  await cdp('Page.navigate', { url: base + ruta });
  await Promise.race([listo, esperar(8000)]);
  await esperar(2600);
  for (const p of pasos) { await cdp('Runtime.evaluate', { expression: p, awaitPromise: true }); await esperar(700); }
  await cdp('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
  const { result } = await cdp('Runtime.evaluate', { expression: 'Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)', returnByValue: true });
  const total = Math.min(Math.max(result.value, alto), 15000);
  // Viewport del alto total: así la barra fija queda abajo y no a media imagen
  // Páginas muy largas a escala 1 para no pasar el límite de alto de Chrome
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: total, deviceScaleFactor: movil && total <= 8000 ? 2 : 1, mobile: movil });
  await esperar(500);
  const shot = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
  writeFileSync(join(salida, archivo), Buffer.from(shot.data, 'base64'));
  console.log(`${archivo} (${ancho}×${total})`);
}

async function capturaPlay({ ruta, pasos = [] }, archivo) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 780, deviceScaleFactor: 2, mobile: true });
  await cdp('Emulation.setUserAgentOverride', { userAgent: UA_MOVIL });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const listo = cargado();
  await cdp('Page.navigate', { url: base + ruta });
  await Promise.race([listo, esperar(8000)]);
  await esperar(2600);
  await cdp('Runtime.evaluate', { expression: "document.getElementById('instalar') && (document.getElementById('instalar').hidden = true)" });
  for (const p of pasos) { await cdp('Runtime.evaluate', { expression: p, awaitPromise: true }); await esperar(700); }
  await cdp('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
  await esperar(400);
  const shot = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
  writeFileSync(join(salida, archivo), Buffer.from(shot.data, 'base64'));
  console.log(archivo + ' (780×1560)');
}

if (PLAY) {
  const porNombre = Object.fromEntries(PANTALLAS.map((p) => [p.nombre, p]));
  await capturaPlay(porNombre['01-hoy'], '01-hoy.jpg');
  await capturaPlay(porNombre['02-noticias'], '02-noticias.jpg');
  await capturaPlay(porNombre['03-invertir'], '03-invertir.jpg');
  await capturaPlay(porNombre['04-aprende'], '04-aprende.jpg');
  await capturaPlay(porNombre['06-leccion'], '05-leccion.jpg');
}

for (const tema of PLAY ? [] : ['light', 'dark']) {
  for (const p of PANTALLAS) if (!solo || solo.includes(p.nombre)) await capturar(p, 390, 844, tema, `${p.nombre}-390-${tema === 'light' ? 'claro' : 'oscuro'}.jpg`);
  if (!solo || solo.includes('1280')) await capturar(PANTALLAS[0], 1280, 900, tema, `01-hoy-1280-${tema === 'light' ? 'claro' : 'oscuro'}.jpg`);
}
if (!PLAY && (!solo || solo.includes('17'))) await capturar({ nombre: 'imagen-dia', ruta: '/api/imagen-dia.svg?formato=1080x1350' }, 1080, 1350, 'light', '17-imagen-del-dia-1080x1350.jpg');

ws.close();
chrome.kill();
await esperar(300);
rmSync(perfil, { recursive: true, force: true });
