// Verifica enlaces internos y externos. Uso: node scripts/enlaces.js [http://localhost:8788]
import { readFileSync } from 'node:fs';

const base = (process.argv[2] ?? 'http://localhost:8788').replace(/\/$/, '');
const UA = 'Mozilla/5.0 (compatible; QuetzalHoy-verificador/1.0; +https://hoy.compoundclub.fyi)';
const cursos = JSON.parse(readFileSync(new URL('../data/cursos.json', import.meta.url), 'utf8')).cursos;
const dominio = 'https://' + JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8')).dominio;

const paginas = ['/', '/acerca', '/contacto', '/privacidad', '/aviso-legal', '/novedades', '/compartir', '/sin-conexion', '/sitemap.xml', '/robots.txt', '/manifest.webmanifest',
  '/tipo-cambio-hoy', '/tasa-lider-guatemala', '/inflacion-guatemala', '/remesas-guatemala', '/precio-gasolina-guatemala', '/canasta-basica-guatemala', '/invertir-en-guatemala', '/cursos'];
for (const c of cursos) { paginas.push(`/cursos/${c.id}`); for (const l of c.lecciones) paginas.push(`/cursos/${c.id}/${l.id}`); }

const internos = new Set(paginas);
const externos = new Set();

function extraer(html, origen) {
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const u = m[1];
    if (u.startsWith('mailto:') || u.startsWith('data:') || u.startsWith('javascript:')) continue;
    if (u.startsWith(base) || u.startsWith(dominio)) { internos.add(u.replace(base, '').replace(dominio, '').split('?')[0] || '/'); continue; }
    if (u.startsWith('http')) externos.add(u);
    else if (u.startsWith('/')) internos.add(u.split('?')[0]);
    else internos.add(new URL(u, base + origen).pathname);
  }
}

// Enlaces en los datos (fuentes) también cuentan
for (const archivo of ['indicadores', 'inversiones', 'fuentes-noticias']) {
  const txt = readFileSync(new URL(`../data/${archivo}.json`, import.meta.url), 'utf8');
  for (const m of txt.matchAll(/"(https?:\/\/[^"\s]+)"/g)) if (!m[1].startsWith(dominio)) externos.add(m[1]);
}

async function pedir(url, timeout = 15000) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
    return { estado: res.status, ok: res.ok, texto: res.headers.get('content-type')?.includes('html') ? await res.text() : '' };
  } catch (e) {
    return { estado: 0, ok: false, error: e.name === 'TimeoutError' ? 'timeout' : e.message };
  }
}

const rotos = [];
const bloqueados = [];
let revisados = 0;

for (const p of paginas) {
  const r = await pedir(base + p);
  revisados++;
  if (!r.ok) { rotos.push(`${p} → ${r.estado || r.error}`); continue; }
  if (r.texto) extraer(r.texto, p);
}
for (const p of internos) {
  if (paginas.includes(p)) continue;
  const r = await pedir(base + p);
  revisados++;
  if (!r.ok) rotos.push(`${p} → ${r.estado || r.error}`);
}
console.log(`Internos: ${internos.size} revisados, ${rotos.length} rotos`);

const lista = [...externos];
const resultados = await Promise.all(lista.map((u) => pedir(u, 20000).then((r) => [u, r])));
for (const [u, r] of resultados) {
  revisados++;
  if (r.ok) continue;
  if ([401, 403, 405, 429, 503].includes(r.estado) || r.error === 'timeout') bloqueados.push(`${u} → ${r.estado || r.error}`);
  else rotos.push(`${u} → ${r.estado || r.error}`);
}
console.log(`Externos: ${lista.length} revisados, ${bloqueados.length} bloquean robots (no se consideran rotos), ${resultados.filter(([, r]) => !r.ok).length - bloqueados.length} rotos`);
if (bloqueados.length) console.log('Bloqueados:\n  ' + bloqueados.join('\n  '));
if (rotos.length) { console.log('ROTOS:\n  ' + rotos.join('\n  ')); process.exit(1); }
console.log(`Todo bien: ${revisados} enlaces.`);
