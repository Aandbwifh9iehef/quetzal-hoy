// Páginas HTML servidas por el Worker (indexables): indicadores, cursos, comparador, novedades
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function fechaCorta(iso) {
  const p = String(iso).slice(0, 10).split('-');
  return `${Number(p[2])} ${MESES[Number(p[1]) - 1]} ${p[0]}`;
}

const q = (n, d = 2) => {
  const p = Number(n).toFixed(d).split('.');
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'Q ' + p.join('.');
};

// Mismo mini-markdown que usa la app: ## títulos, listas, **negritas**, párrafos
export function renderTexto(t) {
  const inl = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return String(t).split(/\n\n+/).map((b) => b.trim()).filter(Boolean).map((b) => {
    if (b.startsWith('## ')) return `<h2>${inl(b.slice(3))}</h2>`;
    if (/^(- |\d+\. )/.test(b)) {
      const ol = /^\d+\. /.test(b);
      return `<${ol ? 'ol' : 'ul'}>${b.split('\n').map((x) => `<li>${inl(x.replace(/^(- |\d+\. )/, ''))}</li>`).join('')}</${ol ? 'ol' : 'ul'}>`;
    }
    return `<p>${inl(b).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

export const ETIQUETA_PATROCINIO = 'Enlace patrocinado';

// Todo enlace patrocinado lleva rel="sponsored" y la etiqueta visible, sin excepción
export function enlaceAfiliado(afiliado) {
  if (!afiliado?.url) return '';
  return `<a class="btn-afiliado" href="${esc(afiliado.url)}" target="_blank" rel="sponsored noopener">${esc(afiliado.texto || 'Abrir cuenta')} ↗ <span class="eti-patro">${ETIQUETA_PATROCINIO}</span></a>`;
}

export function etiquetaPatrocinioCurso(patrocinio) {
  if (!patrocinio?.nombre) return '';
  const nombre = patrocinio.url ? `<a href="${esc(patrocinio.url)}" target="_blank" rel="sponsored noopener">${esc(patrocinio.nombre)}</a>` : esc(patrocinio.nombre);
  return `<span class="eti-patro eti-patro--curso">Patrocinado por ${nombre}</span>`;
}

export function plantilla({ titulo, descripcion, ruta, cuerpo, jsonLd = [], noindex = false, config, migas = [] }) {
  const url = `https://${config.dominio}${ruta}`;
  const ld = [
    ...jsonLd,
    migas.length ? { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: config.nombre, item: `https://${config.dominio}/` }, ...migas.map((m, i) => ({ '@type': 'ListItem', position: i + 2, name: m.nombre, item: `https://${config.dominio}${m.ruta}` }))] } : null
  ].filter(Boolean);
  return `<!doctype html>
<html lang="es-GT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(titulo)} — ${esc(config.nombre)}</title>
  <meta name="description" content="${esc(descripcion)}">
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${esc(config.nombre)}">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(descripcion)}">
  <meta property="og:image" content="https://${esc(config.dominio)}/og-image.png">
  <meta property="og:url" content="${esc(url)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#1B4332" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0F1923" media="(prefers-color-scheme: dark)">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" type="image/svg+xml" href="/icon.svg">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
  <link rel="stylesheet" href="/styles.css">
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ')}
</head>
<body>
<a class="saltar" href="#contenido">Ir al contenido</a>
<div id="app">
  <header class="header">
    <a class="header__logo" href="/">
      <img src="/icon.svg" alt="" width="32" height="32">
      <span class="marca">${esc(config.nombre).replace(/ (\S+)$/, ' <em>$1</em>')}</span>
    </a>
  </header>
  <div class="tejido" aria-hidden="true"></div>
  <main class="pagina-estatica" id="contenido">
    ${migas.length ? `<nav class="migas" aria-label="Ruta"><a href="/">Inicio</a>${migas.map((m) => ` › <a href="${esc(m.ruta)}">${esc(m.nombre)}</a>`).join('')}</nav>` : ''}
    ${cuerpo}
    <div class="aviso-legal mt-lg">Información educativa, no asesoría financiera. Cada dato muestra su fuente y fecha. <a href="/aviso-legal">Aviso legal</a>.</div>
    <p class="mt-md"><a href="/">← Abrir la app</a></p>
  </main>
  <nav class="footer-links" aria-label="Páginas de la app">
    <a href="/acerca">Acerca de</a>
    <a href="/novedades">Novedades</a>
    <a href="/privacidad">Privacidad</a>
    <a href="/aviso-legal">Aviso legal</a>
    <a href="/contacto">Contacto</a>
    <a href="/anunciate">Anúnciate</a>
  </nav>
  <nav class="nav-inferior" aria-label="Navegación principal">
    <a class="nav-btn" href="/#hoy">Hoy</a>
    <a class="nav-btn" href="/#noticias">Noticias</a>
    <a class="nav-btn" href="/#invertir">Invertir</a>
    <a class="nav-btn" href="/#aprende">Aprende</a>
  </nav>
</div>
${config.analytics ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${esc(config.analytics)}"}'></script>` : ''}
</body>
</html>`;
}

export const INDICADORES_SEO = {
  'tipo-cambio': { ruta: '/tipo-cambio-hoy', titulo: 'Tipo de cambio del dólar hoy en Guatemala' },
  'tasa-lider': { ruta: '/tasa-lider-guatemala', titulo: 'Tasa líder de política monetaria en Guatemala' },
  inflacion: { ruta: '/inflacion-guatemala', titulo: 'Inflación en Guatemala hoy' },
  remesas: { ruta: '/remesas-guatemala', titulo: 'Remesas familiares en Guatemala' },
  combustibles: { ruta: '/precio-gasolina-guatemala', titulo: 'Precio de la gasolina y el diésel en Guatemala' },
  'canasta-basica': { ruta: '/canasta-basica-guatemala', titulo: 'Canasta básica alimentaria en Guatemala' }
};

function fuenteHtml(ind) {
  return `<p class="fuente-dato">Fuente: <a href="${esc(ind.url)}" target="_blank" rel="noopener">${esc(ind.fuente)}</a>, ${fechaCorta(ind.fecha)}.${ind.viejo ? ` <strong>Dato de ${esc(ind.etiqueta.replace('dato de ', ''))}</strong>; aún no hay uno más reciente.` : ''}</p>`;
}

export function paginaTipoCambio(tc, config) {
  const seo = INDICADORES_SEO['tipo-cambio'];
  const hoy = tc?.disponible;
  const cuerpo = hoy
    ? `<h1>${esc(seo.titulo)}</h1>
<p class="lede">Hoy, ${fechaCorta(tc.fecha)}, el tipo de cambio de referencia del Banco de Guatemala es <strong>${q(tc.valor, 4)} por dólar</strong>${tc.ayer ? ` (${tc.tendencia === 'sube' ? 'sube' : tc.tendencia === 'baja' ? 'baja' : 'igual'} ${Math.abs(tc.cambio).toFixed(4)} frente a ayer, ${q(tc.ayer.valor, 4)})` : ''}.</p>
<div class="tarjeta"><div class="tarjeta__titulo">Dólar hoy</div><div class="tarjeta__valor">${q(tc.valor, 4)}</div><div class="tarjeta__sub">por 1 dólar · ${fechaCorta(tc.fecha)}</div></div>
<h2>¿Qué significa?</h2>
<p>Es el precio de referencia al que se cambia un dólar por quetzales. Lo publica cada día el Banco de Guatemala. Los bancos y las remesadoras usan su propia tasa de compra y venta, que suele ser un poco distinta. $100 de remesa equivalen hoy a unos ${q(100 * tc.valor)}.</p>
<h2>Últimos 7 días</h2>
<table class="tabla"><thead><tr><th>Fecha</th><th>Q por dólar</th></tr></thead><tbody>${(tc.series?.['7d'] ?? []).slice().reverse().map((d) => `<tr><td>${fechaCorta(d.fecha)}</td><td>${d.valor.toFixed(4)}</td></tr>`).join('')}</tbody></table>
<p class="fuente-dato">Fuente: Banco de Guatemala, ${fechaCorta(tc.fecha)}. Dato de referencia; el oficial se consulta en <a href="https://www.banguat.gob.gt" target="_blank" rel="noopener">banguat.gob.gt</a>.</p>
<p class="mt-md"><a href="/#hoy" class="btn-enlace">Ver la gráfica de 1 año y el convertidor en la app →</a></p>`
    : `<h1>${esc(seo.titulo)}</h1><p>El dato de hoy no está disponible en este momento. Consúltalo en <a href="https://www.banguat.gob.gt" target="_blank" rel="noopener">banguat.gob.gt</a>.</p>`;
  const jsonLd = hoy ? [{
    '@context': 'https://schema.org', '@type': 'ExchangeRateSpecification', currency: 'USD',
    currentExchangeRate: { '@type': 'UnitPriceSpecification', price: tc.valor, priceCurrency: 'GTQ' },
    name: 'Tipo de cambio de referencia USD/GTQ', validFrom: tc.fecha, provider: { '@type': 'Organization', name: 'Banco de Guatemala', url: 'https://www.banguat.gob.gt' }
  }] : [];
  return plantilla({ titulo: seo.titulo, descripcion: hoy ? `Tipo de cambio de referencia del Banguat: ${q(tc.valor, 4)} por dólar (${fechaCorta(tc.fecha)}). Historial, gráfica y convertidor.` : 'Tipo de cambio del dólar en Guatemala según el Banco de Guatemala.', ruta: seo.ruta, cuerpo, jsonLd, config, migas: [{ nombre: 'Tipo de cambio', ruta: seo.ruta }] });
}

const VALOR_IND = {
  'tasa-lider': (i) => `${i.valor.toFixed(2)}%`,
  inflacion: (i) => `${i.valor.toFixed(2)}%`,
  remesas: (i) => `US$${i.valor.toLocaleString('en-US')} millones`,
  combustibles: (i) => `${q(i.regular)} el galón de regular`,
  'canasta-basica': (i) => `${q(i.urbana)} por persona al mes`
};

const DETALLE_IND = {
  'tasa-lider': (i) => `<p>La Junta Monetaria fija esta tasa varias veces al año. Sirve de guía para lo que cobran los bancos por prestar y lo que pagan por los depósitos. Cuando sube, el crédito se encarece; cuando baja, pasa lo contrario.</p>`,
  inflacion: (i) => `<p>En los últimos 12 meses los precios subieron <strong>${i.valor.toFixed(2)}%</strong>. En lo que va del año, ${i.acumulada.toFixed(2)}%; en el último mes, ${i.mensual.toFixed(2)}%. La meta del Banco de Guatemala es 4% (entre 3% y 5%). Q1,000 guardados sin interés durante un año con esta inflación compran lo que hoy compran ${q(1000 / (1 + i.valor / 100))}.</p>`,
  remesas: (i) => `<p>En ${esc(i.periodo.toLowerCase())} entraron <strong>US$${i.valor.toLocaleString('en-US')} millones</strong>. Acumulado del año: US$${i.acumuladoAnio.toLocaleString('en-US')} millones, ${((i.acumuladoAnio / i.acumuladoAnioAnterior - 1) * 100).toFixed(1)}% más que en el mismo período del año anterior (US$${i.acumuladoAnioAnterior.toLocaleString('en-US')} millones). Todo el año pasado sumó US$${i.totalAnioAnterior.toLocaleString('en-US')} millones.</p>`,
  combustibles: (i) => `<table class="tabla"><thead><tr><th>Combustible</th><th>Q por galón</th></tr></thead><tbody><tr><td>Gasolina superior</td><td>${i.superior.toFixed(2)}</td></tr><tr><td>Gasolina regular</td><td>${i.regular.toFixed(2)}</td></tr><tr><td>Diésel</td><td>${i.diesel.toFixed(2)}</td></tr></tbody></table><p>Son precios de referencia para autoservicio en el área metropolitana. Cada gasolinera fija su precio. Un tanque de 10 galones de regular cuesta ${q(10 * i.regular)}.</p>`,
  'canasta-basica': (i) => `<p>Costo mínimo de la alimentación de una persona durante un mes: <strong>${q(i.urbana)}</strong> en el área urbana y ${q(i.rural)} en la rural. Una familia urbana de 4 necesita ${q(4 * i.urbana)} al mes solo en comida.</p>`
};

export function paginaIndicador(clave, ind, config) {
  const seo = INDICADORES_SEO[clave];
  const cuerpo = `<h1>${esc(seo.titulo)}</h1>
<p class="lede">${esc(ind.nombre)}: <strong>${VALOR_IND[clave](ind)}</strong> (${esc(ind.periodo)}).</p>
${DETALLE_IND[clave](ind)}
<h2>¿Qué significa esto?</h2>
<p>${esc(ind.significado)}</p>
${fuenteHtml(ind)}
<p class="mt-md"><a href="/#hoy" class="btn-enlace">Ver todos los indicadores de hoy en la app →</a></p>`;
  return plantilla({ titulo: seo.titulo, descripcion: `${ind.nombre} en Guatemala: ${VALOR_IND[clave](ind)} (${ind.periodo}). Qué significa para tu bolsillo, con fuente y fecha.`, ruta: seo.ruta, cuerpo, config, migas: [{ nombre: ind.nombre, ruta: seo.ruta }] });
}

export function paginaCursos(cursos, config) {
  const cuerpo = `<h1>Cursos gratis de finanzas personales en Guatemala</h1>
<p class="lede">Tres cursos cortos, de cinco lecciones cada uno, para ordenar tu dinero sin palabras complicadas. Escritos por ${esc(config.autor)}.</p>
${cursos.map((c) => `<div class="tarjeta mt-md"><h2 class="sin-margen"><a href="/cursos/${esc(c.id)}">${c.icono} ${esc(c.titulo)}</a></h2><p>${esc(c.descripcion)}</p><ol class="lista-compacta">${c.lecciones.map((l) => `<li><a href="/cursos/${esc(c.id)}/${esc(l.id)}">${esc(l.titulo)}</a> <span class="texto-suave">· ${l.duracion} min</span></li>`).join('')}</ol></div>`).join('')}
<p class="mt-md"><a href="/#aprende" class="btn-enlace">Hacer los cursos en la app (guarda tu avance) →</a></p>`;
  const jsonLd = [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: cursos.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://${config.dominio}/cursos/${c.id}`, name: c.titulo })) }];
  return plantilla({ titulo: 'Cursos gratis de finanzas personales', descripcion: 'Tu primer presupuesto, Sal de deudas y Empieza a invertir con poco: tres cursos gratuitos y cortos para guatemaltecos.', ruta: '/cursos', cuerpo, jsonLd, config, migas: [{ nombre: 'Cursos', ruta: '/cursos' }] });
}

function cursoLd(c, config) {
  return { '@context': 'https://schema.org', '@type': 'Course', name: c.titulo, description: c.descripcion, url: `https://${config.dominio}/cursos/${c.id}`, inLanguage: 'es', isAccessibleForFree: true, provider: { '@type': 'Organization', name: config.nombre, url: `https://${config.dominio}/` }, author: { '@type': 'Person', name: config.autor }, hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${c.lecciones.reduce((s, l) => s + l.duracion, 0)}M` } };
}

export function paginaCurso(c, config) {
  const cuerpo = `<h1>${c.icono} ${esc(c.titulo)}</h1>
<p class="lede">${esc(c.descripcion)}</p>
<p class="texto-suave">${c.lecciones.length} lecciones · ${c.lecciones.reduce((s, l) => s + l.duracion, 0)} minutos en total · Gratis · Por ${esc(config.autor)}</p>
<ol class="lecciones-lista">${c.lecciones.map((l) => `<li><a href="/cursos/${esc(c.id)}/${esc(l.id)}"><strong>${esc(l.titulo)}</strong></a><br><span class="texto-suave">${l.duracion} min · ${esc(l.texto.split('\n')[0].slice(0, 140))}…</span></li>`).join('')}</ol>
<p class="mt-md"><a href="/#aprende" class="btn-enlace">Empezar en la app (guarda tu avance y tiene repaso) →</a></p>`;
  return plantilla({ titulo: `${c.titulo} — curso gratis`, descripcion: c.descripcion, ruta: `/cursos/${c.id}`, cuerpo, jsonLd: [cursoLd(c, config)], config, migas: [{ nombre: 'Cursos', ruta: '/cursos' }, { nombre: c.titulo, ruta: `/cursos/${c.id}` }] });
}

export function paginaLeccion(c, l, config) {
  const idx = c.lecciones.indexOf(l);
  const ant = c.lecciones[idx - 1], sig = c.lecciones[idx + 1];
  const cuerpo = `<p class="texto-suave">${esc(c.titulo)} · Lección ${esc(l.id)} de ${c.lecciones.length} · ${l.duracion} min</p>
<h1>${esc(l.titulo)}</h1>
<article class="leccion">${renderTexto(l.texto)}</article>
<h2>Repaso</h2>
<p>Esta lección termina con ${l.preguntas.length} preguntas de repaso. Respóndelas en la app para guardar tu avance.</p>
<p><a href="/#aprende" class="btn-enlace">Hacer el repaso en la app →</a></p>
<nav class="leccion-nav mt-lg" aria-label="Lecciones">${ant ? `<a href="/cursos/${esc(c.id)}/${esc(ant.id)}">← ${esc(ant.titulo)}</a>` : '<span></span>'}${sig ? `<a href="/cursos/${esc(c.id)}/${esc(sig.id)}">${esc(sig.titulo)} →</a>` : `<a href="/cursos/${esc(c.id)}">Volver al curso</a>`}</nav>`;
  const jsonLd = [{ '@context': 'https://schema.org', '@type': 'Article', headline: l.titulo, isPartOf: { '@type': 'Course', name: c.titulo }, author: { '@type': 'Person', name: config.autor }, publisher: { '@type': 'Organization', name: config.nombre }, inLanguage: 'es', isAccessibleForFree: true, url: `https://${config.dominio}/cursos/${c.id}/${l.id}` }];
  return plantilla({ titulo: `${l.titulo} — ${c.titulo}`, descripcion: l.texto.split('\n')[0].slice(0, 155), ruta: `/cursos/${c.id}/${l.id}`, cuerpo, jsonLd, config, migas: [{ nombre: 'Cursos', ruta: '/cursos' }, { nombre: c.titulo, ruta: `/cursos/${c.id}` }, { nombre: `Lección ${l.id}`, ruta: `/cursos/${c.id}/${l.id}` }] });
}

export function paginaInvertir(inv, config) {
  const filas = inv.tasasPlazoFijo.filas.slice().sort((a, b) => (b.tasa ?? -1) - (a.tasa ?? -1));
  const cuerpo = `<h1>Tasas de plazo fijo en Guatemala: bancos y cooperativas</h1>
<p class="lede">${esc(inv.tasasPlazoFijo.nota)}</p>
<table class="tabla"><thead><tr><th>Entidad</th><th>Producto</th><th>Tasa anual</th><th>Fecha y fuente</th></tr></thead><tbody>${filas.map((f) => `<tr><td><strong>${esc(f.entidad)}</strong></td><td>${esc(f.producto)}${f.monto && f.monto !== '—' ? `<br><span class="texto-suave">${esc(f.monto)}</span>` : ''}</td><td>${f.tasa === null ? '<span class="texto-suave">Consultar con la entidad</span>' : `<strong>${f.tasa.toFixed(2)}%</strong> <span class="texto-suave">${esc(f.tipoTasa)}</span>`}</td><td class="texto-suave">${fechaCorta(f.fecha)}<br><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.fuente)}</a>${f.afiliado ? '<br>' + enlaceAfiliado(f.afiliado) : ''}</td></tr>`).join('')}</tbody></table>
<p class="texto-suave">${esc(inv.avisoIsr)}</p>
<h2>Bonos del Tesoro para personas</h2>
<p>Desde ${q(inv.bonos.minimo, 0)} y hasta ${q(inv.bonos.maximoAnual, 0)} al año: ${inv.bonos.plazos.map((p) => `${p.anios} ${p.anios === 1 ? 'año' : 'años'} al ${p.tasa}%`).join(', ')}; intereses ${esc(inv.bonos.pagoIntereses)}, ${esc(inv.bonos.impuestos)}. <span class="texto-suave">Fuente: <a href="${esc(inv.bonos.url)}" target="_blank" rel="noopener">${esc(inv.bonos.fuente)}</a>, ${fechaCorta(inv.bonos.fecha)}.</span></p>
<h2>Las opciones, explicadas</h2>
${inv.tipos.map((t) => `<h3>${esc(t.nombre)}</h3><p>${esc(t.queEs)} <span class="texto-suave">Riesgo ${esc(t.riesgo)} · ${esc(t.liquidez.toLowerCase())} · supervisa: ${esc(t.supervisa)}.</span></p>`).join('')}
<p class="mt-md"><a href="/#invertir" class="btn-enlace">Comparar, usar las calculadoras y ver cómo evitar estafas en la app →</a></p>`;
  return plantilla({ titulo: 'Tasas de plazo fijo y opciones para invertir en Guatemala', descripcion: 'Comparación de tasas de depósito a plazo de bancos y cooperativas de Guatemala con fecha y fuente, Bonos del Tesoro para personas y las opciones explicadas sin jerga.', ruta: '/invertir-en-guatemala', cuerpo, config, migas: [{ nombre: 'Invertir', ruta: '/invertir-en-guatemala' }] });
}

export function paginaNovedades(novedades, config) {
  const cuerpo = `<h1>Novedades</h1>
<p class="lede">Lo que hemos agregado a ${esc(config.nombre)}, de lo más reciente a lo más antiguo.</p>
${novedades.slice().reverse().map((n) => `<div class="tarjeta mt-md"><div class="tarjeta__titulo">${fechaCorta(n.fecha)}</div><h2 class="sin-margen">${esc(n.titulo)}</h2><ul class="lista-compacta">${n.cambios.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>`).join('')}`;
  return plantilla({ titulo: 'Novedades', descripcion: `Historial de lo que se ha agregado a ${config.nombre}.`, ruta: '/novedades', cuerpo, config, migas: [{ nombre: 'Novedades', ruta: '/novedades' }] });
}

export function rutasSitemap(cursos) {
  const fijas = [
    { ruta: '/', prioridad: '1.0', freq: 'daily' },
    ...Object.values(INDICADORES_SEO).map((s) => ({ ruta: s.ruta, prioridad: '0.9', freq: 'daily' })),
    { ruta: '/invertir-en-guatemala', prioridad: '0.8', freq: 'weekly' },
    { ruta: '/cursos', prioridad: '0.8', freq: 'monthly' },
    { ruta: '/novedades', prioridad: '0.4', freq: 'monthly' },
    { ruta: '/anunciate', prioridad: '0.5', freq: 'monthly' },
    { ruta: '/acerca', prioridad: '0.5', freq: 'monthly' },
    { ruta: '/contacto', prioridad: '0.4', freq: 'monthly' },
    { ruta: '/privacidad', prioridad: '0.3', freq: 'yearly' },
    { ruta: '/aviso-legal', prioridad: '0.3', freq: 'yearly' }
  ];
  for (const c of cursos) {
    fijas.push({ ruta: `/cursos/${c.id}`, prioridad: '0.7', freq: 'monthly' });
    for (const l of c.lecciones) fijas.push({ ruta: `/cursos/${c.id}/${l.id}`, prioridad: '0.6', freq: 'monthly' });
  }
  return fijas;
}

export function sitemapXml(rutas, dominio, hoy) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rutas.map((r) => `  <url><loc>https://${dominio}${r.ruta}</loc><lastmod>${hoy}</lastmod><changefreq>${r.freq}</changefreq><priority>${r.prioridad}</priority></url>`).join('\n')}\n</urlset>\n`;
}

function num(n) { return Number(n ?? 0).toLocaleString('en-US'); }

function bloqueMetricas(m) {
  const e = m.eventos ?? {};
  return `<div class="metricas">
<div class="metrica"><span class="metrica__n">${num(m.contenido.noticiasPorDia)}</span><span>noticias explicadas cada día</span></div>
<div class="metrica"><span class="metrica__n">${num(m.contenido.indicadores)}</span><span>indicadores con fuente</span></div>
<div class="metrica"><span class="metrica__n">${num(m.contenido.lecciones)}</span><span>lecciones en ${num(m.contenido.cursos)} cursos</span></div>
<div class="metrica"><span class="metrica__n">${num(m.contenido.entidadesTasas)}</span><span>bancos y cooperativas comparados</span></div>
<div class="metrica"><span class="metrica__n">${num(e.instalacion)}</span><span>instalaciones en el celular</span></div>
<div class="metrica"><span class="metrica__n">${num(e.curso_iniciado)}</span><span>cursos empezados</span></div>
<div class="metrica"><span class="metrica__n">${num(e.curso_terminado)}</span><span>cursos terminados</span></div>
<div class="metrica"><span class="metrica__n">${num((e.compartir ?? 0) + (e.copiar_resumen ?? 0))}</span><span>veces compartido</span></div>
</div>
<p class="texto-suave">Cifras reales medidas por la app desde el ${fechaCorta(m.desde)} (últimos 30 días para instalaciones, cursos y compartidos). Las visitas se miden con Cloudflare Web Analytics, sin cookies.</p>`;
}

export function paginaAnunciate(config, metricas) {
  const correo = config.anunciate?.correo || config.contacto;
  const cuerpo = `<h1>Anúnciate en ${esc(config.nombre)}</h1>
<p class="lede">${esc(config.nombre)} es la app gratuita de información financiera para guatemaltecos comunes: el dólar de hoy, los indicadores que mueven la economía, noticias explicadas en sencillo, comparación de opciones para invertir y cursos de finanzas personales. Todo desde el celular, en español de Guatemala.</p>
<h2>A quién llegas</h2>
<p>Personas que quieren entender su dinero: quien recibe remesas, quien está pagando una tarjeta, quien busca dónde poner sus primeros Q5,000, quien quiere aprender a hacer un presupuesto. Audiencia en Guatemala, mayoritariamente desde celular.</p>
<h2>Lo que mide la app</h2>
${bloqueMetricas(metricas)}
<h2>Formas de participar</h2>
<div class="tarjeta mt-md"><h3 class="sin-margen">1. Patrocinio del resumen diario</h3><p>Cada mañana se comparte en WhatsApp y redes un resumen con el dólar, 3 noticias y un dato del día. Tu marca aparece al final como <strong>"Te lo trae: [tu marca]"</strong>, en el texto y en la imagen del día.</p></div>
<div class="tarjeta mt-md"><h3 class="sin-margen">2. Patrocinio de un curso</h3><p>Tres cursos de cinco lecciones: <em>Tu primer presupuesto</em>, <em>Sal de deudas</em> y <em>Empieza a invertir con poco</em>. Tu marca aparece como <strong>"Patrocinado por [tu marca]"</strong> en la portada del curso y en cada lección.</p></div>
<div class="tarjeta mt-md"><h3 class="sin-margen">3. Enlace de afiliado en el comparador</h3><p>En la tabla de tasas de plazo fijo y ahorro, junto a tu entidad, un botón <strong>"Abrir cuenta"</strong> hacia tu página. Tu tasa sigue mostrándose con su fecha y fuente, igual que las demás.</p></div>
<div class="tarjeta mt-md"><h3 class="sin-margen">4. Bienestar financiero para empleados</h3><p>Los tres cursos, adaptados para tu empresa o cooperativa: sesión de arranque, acceso para tu equipo, seguimiento de avance y un cierre con preguntas. Ideal para bancos, remesadoras, aseguradoras, call centers y maquilas que quieren reducir el estrés financiero de su gente.</p></div>
<h2>Nuestras reglas (no son negociables)</h2>
<ul>
<li>Todo patrocinio y todo enlace de afiliado lleva una etiqueta visible: <strong>"Patrocinado"</strong> o <strong>"Enlace patrocinado"</strong>.</li>
<li>Los datos no cambian por un patrocinio: las tasas, fechas y fuentes se muestran igual para todas las entidades.</li>
<li>Nunca recomendamos una opción específica a la persona ni prometemos rendimientos.</li>
<li>No aceptamos pirámides, "inversiones" con ganancia garantizada, cripto especulativa ni prestamistas informales.</li>
</ul>
<h2>Precios</h2>
<p>${esc(config.anunciate?.preciosNota || 'Precios a convenir según alcance y duración.')} Pide el <a href="/media-kit">media kit en PDF</a>.</p>
<h2>Hablemos</h2>
<div class="tarjeta"><p>Escribe a <a href="mailto:${esc(correo)}"><strong>${esc(correo)}</strong></a>${config.anunciate?.whatsapp ? ` o por WhatsApp al <a href="https://wa.me/${esc(config.anunciate.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener">${esc(config.anunciate.whatsapp)}</a>` : ''}. Respondemos en pocos días.</p></div>`;
  return plantilla({ titulo: 'Anúnciate', descripcion: `Patrocinios y enlaces de afiliado en ${config.nombre}: resumen diario, cursos, comparador y bienestar financiero para empleados. Siempre etiquetados, con métricas reales.`, ruta: '/anunciate', cuerpo, config, migas: [{ nombre: 'Anúnciate', ruta: '/anunciate' }] });
}

export function paginaMediaKit(config, metricas) {
  const correo = config.anunciate?.correo || config.contacto;
  const e = metricas.eventos ?? {};
  const html = `<!doctype html>
<html lang="es-GT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Media kit — ${esc(config.nombre)}</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" type="image/svg+xml" href="/icon.svg">
  <link rel="stylesheet" href="/styles.css">
  <style>
    .mk { max-width: 720px; margin: 0 auto; padding: 24px 16px 80px; color: #1A1A2E; background: #fff; }
    .mk h1 { font-size: 1.8rem; margin: 0 0 4px; color: #1B4332; }
    .mk h2 { font-size: 1.1rem; margin: 20px 0 6px; color: #1B4332; border-bottom: 2px solid #52B788; padding-bottom: 4px; }
    .mk p, .mk li { font-size: 0.92rem; color: #1A1A2E; }
    .mk__cab { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
    .mk__cab img { width: 56px; height: 56px; border-radius: 12px; }
    .mk .metricas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0; }
    .mk .metrica { border: 1px solid #E2E8F0; border-radius: 10px; padding: 8px; text-align: center; font-size: 0.72rem; display: flex; flex-direction: column; gap: 2px; }
    .mk .metrica__n { font-size: 1.3rem; font-weight: 800; color: #1B4332; }
    .mk table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .mk th, .mk td { text-align: left; padding: 6px; border-bottom: 1px solid #E2E8F0; vertical-align: top; }
    .mk__pie { margin-top: 24px; font-size: 0.8rem; color: #5A6480; }
    .mk__btn { display: inline-block; margin: 12px 0; padding: 12px 18px; background: #1B4332; color: #fff; border-radius: 10px; font-weight: 700; border: 0; cursor: pointer; }
    @media (max-width: 600px) { .mk .metricas { grid-template-columns: repeat(2, 1fr); } }
    @media print {
      @page { size: A4; margin: 14mm; }
      html, body { background: #fff !important; color: #000; }
      .mk { padding: 0; max-width: none; }
      .mk__btn, .no-imprimir { display: none !important; }
      .mk .metricas { grid-template-columns: repeat(4, 1fr); }
      .tarjeta, .mk .metrica, table, h2 { break-inside: avoid; page-break-inside: avoid; }
      a { color: #000; text-decoration: none; }
    }
  </style>
</head>
<body>
<main class="mk">
  <div class="mk__cab"><img src="/icons/icon-192.png" alt=""><div><h1>${esc(config.nombre)} · Media kit</h1><div>${esc(config.tagline)} · hoy.compoundclub.fyi</div></div></div>
  <button class="mk__btn" onclick="window.print()">Imprimir o guardar como PDF</button>
  <h2>Qué es</h2>
  <p>App web gratuita e instalable en el celular con información financiera para guatemaltecos comunes: tipo de cambio del día (Banguat), ${num(metricas.contenido.indicadores)} indicadores con fuente y fecha, ${num(metricas.contenido.noticiasPorDia)} noticias económicas explicadas cada mañana, comparador de opciones para invertir (${num(metricas.contenido.entidadesTasas)} bancos y cooperativas) con calculadoras, y ${num(metricas.contenido.cursos)} cursos de finanzas personales (${num(metricas.contenido.lecciones)} lecciones). Todo en español de Guatemala, sin jerga. Autor: ${esc(config.autor)}.</p>
  <h2>Audiencia</h2>
  <p>Personas en Guatemala que quieren entender su dinero: receptores de remesas, quienes pagan tarjetas o préstamos, ahorradores que buscan dónde poner sus primeros quetzales, y gente que quiere aprender a presupuestar. Uso mayoritario desde celular con datos móviles; la app pesa menos de 100 KB.</p>
  <h2>Cifras (medidas por la app, al ${fechaCorta(metricas.desde)})</h2>
  ${bloqueMetricas(metricas).replace(/<p class="texto-suave">[\s\S]*<\/p>/, '')}
  <p>Instalaciones, cursos y compartidos son de los últimos 30 días. Visitas: Cloudflare Web Analytics (se adjunta captura a pedido).</p>
  <h2>Formatos</h2>
  <table><thead><tr><th>Formato</th><th>Dónde aparece</th><th>Etiqueta</th></tr></thead><tbody>
  <tr><td><strong>Patrocinio del resumen diario</strong></td><td>Texto de WhatsApp e imagen del día, cada mañana</td><td>"Te lo trae: [marca]"</td></tr>
  <tr><td><strong>Patrocinio de un curso</strong></td><td>Portada del curso y sus 5 lecciones</td><td>"Patrocinado por [marca]"</td></tr>
  <tr><td><strong>Enlace de afiliado</strong></td><td>Botón "Abrir cuenta" junto a tu tasa en el comparador</td><td>"Enlace patrocinado"</td></tr>
  <tr><td><strong>Bienestar financiero para empleados</strong></td><td>Cursos adaptados para tu empresa, con seguimiento</td><td>Programa cerrado</td></tr>
  </tbody></table>
  <h2>Reglas</h2>
  <ul><li>Todo patrocinio lleva etiqueta visible. Los datos (tasas, fechas, fuentes) no cambian por un patrocinio.</li><li>Nunca recomendamos una opción a la persona ni prometemos rendimientos.</li><li>No aceptamos pirámides, ganancias garantizadas, cripto especulativa ni prestamistas informales.</li></ul>
  <h2>Precios y contacto</h2>
  <p>${esc(config.anunciate?.preciosNota || 'Precios a convenir según alcance y duración.')} Escribe a <strong>${esc(correo)}</strong>${config.anunciate?.whatsapp ? ` o por WhatsApp al ${esc(config.anunciate.whatsapp)}` : ''}.</p>
  <p class="mk__pie">${esc(config.nombre)} · hoy.compoundclub.fyi · Información educativa, no asesoría financiera. Media kit generado el ${fechaCorta(metricas.desde)}.</p>
  <p class="no-imprimir"><a href="/anunciate">← Volver a Anúnciate</a></p>
</main>
</body>
</html>`;
  return html;
}
