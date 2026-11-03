const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function fechaLarga(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
}

function q4(n) {
  return 'Q' + n.toFixed(4);
}

function lineaCambio(tc) {
  if (!tc?.ayer) return '';
  if (tc.tendencia === 'igual') return ' (igual que ayer)';
  const flecha = tc.tendencia === 'sube' ? '▲' : '▼';
  return ` (${flecha} ${Math.abs(tc.cambio).toFixed(4)} vs. ayer)`;
}

export function seleccionarNoticias(noticias, n = 3) {
  const gt = noticias?.guatemala ?? [];
  const mundo = noticias?.mundo ?? [];
  const lista = [...gt.slice(0, n), ...mundo].slice(0, n);
  return lista;
}

// Texto listo para pegar en WhatsApp: *negritas*, emojis sobrios, enlaces en línea propia
export function textoResumen({ fecha, tipoCambio, noticias, dato, config }) {
  const partes = [];
  partes.push(`*${config.nombre} — ${fechaLarga(fecha)}*`);
  partes.push('');

  if (tipoCambio?.disponible) {
    partes.push(`💵 *Dólar:* ${q4(tipoCambio.valor)}${lineaCambio(tipoCambio)}`);
    partes.push(`Referencia Banguat, ${fechaLarga(tipoCambio.fecha).replace(/^\w+ /, '')}`);
    partes.push('');
  }

  const lista = seleccionarNoticias(noticias);
  if (lista.length) {
    partes.push('📰 *Lo que importa hoy*');
    for (const n of lista) {
      partes.push(`• ${n.titulo} (${n.medio})`);
      partes.push(`  ${n.enlace}`);
    }
    partes.push('');
  }

  if (dato) {
    partes.push(`💡 *${dato.titulo}*`);
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

// Imagen del día en SVG (sin fuentes externas: system-ui) para 1080×1350 (post) y 1080×1920 (estado)
export function svgImagen({ fecha, tipoCambio, noticias, dato, config, formato = '1080x1350' }) {
  const { ancho, alto } = FORMATOS[formato] ?? FORMATOS['1080x1350'];
  const alto_ = alto === 1920;
  const M = 80;
  const W = ancho - M * 2;
  const fuente = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  const colores = { fondo: '#1B4332', fondo2: '#143326', claro: '#FFFFFF', suave: '#B7E4C7', acento: '#F4A261', verde: '#52B788' };
  let y = alto_ ? 200 : 120;
  const partes = [];
  const t = (texto, tam, color, peso = 400, x = M, extra = '') => `<text x="${x}" y="${y}" font-family="${fuente}" font-size="${tam}" font-weight="${peso}" fill="${color}" ${extra}>${escXml(texto)}</text>`;

  partes.push(`<rect width="${ancho}" height="${alto}" fill="${colores.fondo}"/>`);
  partes.push(`<rect x="0" y="${alto - (alto_ ? 260 : 190)}" width="${ancho}" height="${alto_ ? 260 : 190}" fill="${colores.fondo2}"/>`);

  // Logo (quetzal estilizado) + nombre
  partes.push(`<g transform="translate(${M} ${y - 70}) scale(0.19)">
    <circle cx="256" cy="200" r="104" fill="#52B788"/><ellipse cx="256" cy="200" rx="66" ry="74" fill="#1B4332"/><circle cx="256" cy="172" r="30" fill="#52B788"/><circle cx="256" cy="178" r="14" fill="#F4A261"/>
    <path d="M196 152 Q256 118 316 152" stroke="#F4A261" stroke-width="18" stroke-linecap="round" fill="none"/>
    <path d="M196 288 Q168 372 152 440" stroke="#52B788" stroke-width="30" stroke-linecap="round" fill="none"/><path d="M226 300 Q212 380 200 450" stroke="#74C69D" stroke-width="24" stroke-linecap="round" fill="none"/><path d="M256 304 Q256 390 256 460" stroke="#52B788" stroke-width="30" stroke-linecap="round" fill="none"/><path d="M286 300 Q300 380 312 450" stroke="#74C69D" stroke-width="24" stroke-linecap="round" fill="none"/><path d="M316 288 Q344 372 360 440" stroke="#52B788" stroke-width="30" stroke-linecap="round" fill="none"/>
  </g>`);
  y += 0;
  partes.push(t(config.nombre, 56, colores.claro, 700, M + 120));
  y += 56;
  partes.push(t(fechaLarga(fecha), 36, colores.suave, 400, M + 120));
  y += alto_ ? 150 : 110;

  if (tipoCambio?.disponible) {
    partes.push(t('DÓLAR HOY', 30, colores.suave, 600, M, 'letter-spacing="4"'));
    y += 120;
    partes.push(t(q4(tipoCambio.valor), 150, colores.claro, 800));
    y += 52;
    const cambio = lineaCambio(tipoCambio).trim().replace(/^\(|\)$/g, '');
    partes.push(t(`${cambio || 'Referencia Banguat'}${cambio ? ' · Banguat' : ''}`, 34, tipoCambio.tendencia === 'sube' ? colores.acento : colores.verde, 600));
    y += alto_ ? 120 : 90;
  }

  const lista = seleccionarNoticias(noticias);
  if (lista.length) {
    partes.push(t('LO QUE IMPORTA HOY', 30, colores.suave, 600, M, 'letter-spacing="4"'));
    y += 56;
    for (const n of lista) {
      const lineas = envolver(n.titulo, 36, W - 40, 2);
      partes.push(`<circle cx="${M + 10}" cy="${y - 12}" r="7" fill="${colores.acento}"/>`);
      for (const l of lineas) { partes.push(t(l, 36, colores.claro, 500, M + 36)); y += 46; }
      partes.push(t(n.medio, 26, colores.suave, 400, M + 36));
      y += alto_ ? 56 : 44;
    }
    y += alto_ ? 50 : 20;
  }

  const pie = alto - (alto_ ? 260 : 190);
  if (dato && y + 160 < pie) {
    partes.push(t('DATO DEL DÍA', 30, colores.suave, 600, M, 'letter-spacing="4"'));
    y += 54;
    partes.push(t(dato.titulo, 40, colores.acento, 700));
    y += 52;
    const cabe = Math.max(1, Math.floor((pie - y - 20) / 46));
    for (const l of envolver(dato.texto, 34, W, Math.min(cabe, alto_ ? 6 : 4))) { partes.push(t(l, 34, colores.claro, 400)); y += 46; }
  }

  // Pie
  y = alto - (alto_ ? 150 : 110);
  partes.push(t(`hoy.compoundclub.fyi`, 40, colores.verde, 700));
  y += 50;
  partes.push(t(config.patrocinador ? `Te lo trae: ${config.patrocinador}` : 'Tu dinero, explicado · Gratis en el celular', 30, colores.suave, 400));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">${partes.join('\n')}</svg>`;
}
