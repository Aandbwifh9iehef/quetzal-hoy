const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function fechaLarga(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function q4(n) {
  return 'Q ' + n.toFixed(4);
}

function fechaMini(iso) {
  const p = String(iso).slice(0, 10).split('-');
  return `${Number(p[2])} ${MESES_CORTOS[Number(p[1]) - 1]}`;
}

// "Q 0.0057 menos que ayer": el cambio en palabras, sin colores ni flechas
export function textoCambio(tc) {
  if (!tc?.ayer) return '';
  const previo = new Date(tc.fecha + 'T12:00:00Z');
  previo.setUTCDate(previo.getUTCDate() - 1);
  const contra = tc.ayer.fecha === previo.toISOString().slice(0, 10) ? 'ayer' : `el ${fechaMini(tc.ayer.fecha)}`;
  if (tc.tendencia === 'igual') return `igual que ${contra}`;
  return `${q4(Math.abs(tc.cambio))} ${tc.cambio > 0 ? 'más' : 'menos'} que ${contra}`;
}

export function seleccionarNoticias(noticias, n = 3) {
  const gt = noticias?.guatemala ?? [];
  const mundo = noticias?.mundo ?? [];
  const lista = [...gt.slice(0, n), ...mundo].slice(0, n);
  return lista;
}

// Texto listo para pegar en WhatsApp: *negritas*, sin emojis, enlaces en línea propia
export function textoResumen({ fecha, tipoCambio, noticias, dato, config }) {
  const partes = [];
  partes.push(`*${config.nombre} — ${fechaLarga(fecha)}*`);
  partes.push('');

  if (tipoCambio?.disponible) {
    const cambio = textoCambio(tipoCambio);
    partes.push(`*Dólar:* ${q4(tipoCambio.valor)}${cambio ? `, ${cambio}` : ''}`);
    partes.push(`Referencia Banguat, ${fechaLarga(tipoCambio.fecha).replace(/^\w+ /, '')}`);
    partes.push('');
  }

  const lista = seleccionarNoticias(noticias);
  if (lista.length) {
    partes.push('*Lo que importa hoy*');
    for (const n of lista) {
      partes.push(`• ${n.titulo} (${n.medio})`);
      partes.push(`  ${n.enlace}`);
    }
    partes.push('');
  }

  if (dato) {
    partes.push(`*${dato.titulo}*`);
    partes.push(dato.texto);
    partes.push('');
  }

  partes.push(`Más en https://${config.dominio}`);
  if (config.patrocinador) {
    partes.push(`Te lo trae: ${config.patrocinador}${config.patrocinadorUrl ? ' · ' + config.patrocinadorUrl : ''}`);
  }
  return partes.join('\n').trim() + '\n';
}

function escXml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Corta un texto en líneas que quepan en `anchoPx` con una fuente de `tamano` px (ancho medio ≈ 0.6 em, conservador)
export function envolver(texto, tamano, anchoPx, maxLineas = 3) {
  const maxChars = Math.max(8, Math.floor(anchoPx / (tamano * 0.6)));
  const palabras = String(texto).split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? actual + ' ' + p : p;
    if (prueba.length <= maxChars) actual = prueba;
    else {
      if (actual) lineas.push(actual);
      actual = p.length > maxChars ? p.slice(0, maxChars - 1) + '…' : p;
    }
  }
  if (actual) lineas.push(actual);
  if (lineas.length > maxLineas) {
    const corte = lineas.slice(0, maxLineas);
    corte[maxLineas - 1] = corte[maxLineas - 1].replace(/\s+\S*$/, '') + '…';
    return corte;
  }
  return lineas;
}

export const FORMATOS = {
  '1080x1350': { ancho: 1080, alto: 1350 },
  '1080x1920': { ancho: 1080, alto: 1920 }
};

// Imagen del día en SVG para 1080×1350 (post) y 1080×1920 (estado).
// Cabecera verde y papel crema, como la app. Sin fuentes externas: si Figtree no está, usa la del sistema.
// Marca: C de "cambio" con el pecho rojo y la punta dorada del quetzal
const signo = (color) => `<path d="M26.5 9.5A12 12 0 1 0 26.5 22.5" stroke="${color}" stroke-width="4.2"/><path d="M26.5 22.5c1.4 2.4 2.6 3.7 4 4.4" stroke="#e9a81b" stroke-width="2.2"/><circle cx="16" cy="16" r="3.6" fill="#c62d3a" stroke="none"/>`;

export function svgImagen({ fecha, tipoCambio, noticias, dato, config, formato = '1080x1350' }) {
  const { ancho, alto } = FORMATOS[formato] ?? FORMATOS['1080x1350'];
  const alto_ = alto === 1920;
  const M = 80;
  const W = ancho - M * 2;
  const fuente = 'Figtree, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  const mono = 'ui-monospace, SF Mono, Menlo, Consolas, monospace';
  const c = { papel: '#f7f4ec', tinta: '#14211b', tinta2: '#46534c', tinta3: '#5b6660', linea: '#dcd7ca', acento: '#0b7552', hondo: '#06422f', crema: '#f7f4ec', crema2: '#cfd9d3', oro: '#e9a81b' };
  let y = alto_ ? 200 : 120;
  const partes = [];
  const t = (texto, tam, color, peso = 400, x = M, extra = '') => `<text x="${x}" y="${y}" font-family="${fuente}" font-size="${tam}" font-weight="${peso}" fill="${color}" ${extra}>${escXml(texto)}</text>`;
  const pie = alto - (alto_ ? 260 : 190);

  partes.push(`<rect width="${ancho}" height="${alto}" fill="${c.papel}"/>`);
  // Cabecera verde con la marca, el nombre y la fecha
  partes.push(`<rect width="${ancho}" height="${y + 84}" fill="${c.hondo}"/>`);
  partes.push(`<g transform="translate(${M} ${y - 54}) scale(2.3)" fill="none" stroke-linecap="round">${signo(c.crema)}</g>`);
  partes.push(t(config.nombre, 52, c.crema, 600, M + 96));
  y += 50;
  partes.push(t(fechaLarga(fecha).replace(/^./, (l) => l.toUpperCase()), 34, c.crema2, 400, M + 96));
  y += alto_ ? 150 : 96;

  if (tipoCambio?.disponible) {
    partes.push(t('Precio del dólar en quetzales', 34, c.tinta2, 500));
    y += 136;
    partes.push(t(tipoCambio.valor.toFixed(4), 156, c.tinta, 500, M + 70, 'letter-spacing="-3"'));
    partes.push(t('Q', 76, c.tinta2, 400));
    y += 58;
    const cambio = textoCambio(tipoCambio);
    if (cambio) { partes.push(t(cambio.replace(/^./, (l) => l.toUpperCase()), 34, c.tinta2, 400)); y += 30; }
    // Sello: fuente · fecha
    const sello = `Banguat · ${fechaMini(tipoCambio.fecha)} ${tipoCambio.fecha.slice(0, 4)}`;
    const anchoSello = Math.round(sello.length * 28 * 0.62) + 32;
    partes.push(`<rect x="${M}" y="${y}" width="${anchoSello}" height="50" rx="6" fill="none" stroke="${c.tinta3}" stroke-width="2"/>`);
    y += 35;
    partes.push(`<text x="${M + 16}" y="${y}" font-family="${mono}" font-size="28" fill="${c.tinta3}">${escXml(sello)}</text>`);
    y += alto_ ? 140 : 80;
  }

  const lista = seleccionarNoticias(noticias);
  if (lista.length) {
    partes.push(`<rect x="${M}" y="${y - 44}" width="${W}" height="2" fill="${c.linea}"/>`);
    partes.push(t('Lo que importa hoy', 34, c.tinta2, 500));
    y += 56;
    for (const n of lista) {
      const lineas = envolver(n.titulo, 36, W - 40, 2);
      partes.push(`<rect x="${M}" y="${y - 22}" width="10" height="10" fill="${c.oro}"/>`);
      for (const l of lineas) { partes.push(t(l, 36, c.tinta, 500, M + 36)); y += 46; }
      partes.push(t(n.medio, 26, c.tinta3, 400, M + 36));
      y += alto_ ? 60 : 40;
    }
    y += alto_ ? 50 : 16;
  }

  if (dato && y + 160 < pie) {
    partes.push(`<rect x="${M}" y="${y - 44}" width="${W}" height="2" fill="${c.linea}"/>`);
    partes.push(t('Dato del día', 34, c.tinta2, 500));
    y += 54;
    partes.push(t(dato.titulo, 40, c.tinta, 600));
    y += 52;
    const cabe = Math.max(1, Math.floor((pie - y - 20) / 46));
    for (const l of envolver(dato.texto, 34, W, Math.min(cabe, alto_ ? 6 : 4))) { partes.push(t(l, 34, c.tinta2, 400)); y += 46; }
  }

  // Pie
  partes.push(`<rect x="${M}" y="${pie + 10}" width="${W}" height="2" fill="${c.linea}"/>`);
  y = alto - (alto_ ? 150 : 110);
  partes.push(t(config.dominio, 40, c.acento, 600));
  y += 50;
  partes.push(t(config.patrocinador ? `Te lo trae: ${config.patrocinador}` : 'Tu dinero, explicado · Gratis en el celular', 30, c.tinta2, 400));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">${partes.join('\n')}</svg>`;
}
