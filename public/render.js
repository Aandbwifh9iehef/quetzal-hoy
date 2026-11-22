// HTML de Hoy, Noticias e Invertir. Lo usan el Worker (para que la página llegue con contenido y
// Google la lea) y el navegador (para actualizar sin recargar). Mismas funciones = mismo resultado.

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaCorta(iso) {
  const p = String(iso).slice(0, 10).split('-');
  return `${parseInt(p[2], 10)} ${MESES[parseInt(p[1], 10) - 1]} ${p[0]}`;
}
export function fechaMini(iso) {
  const p = String(iso).slice(0, 10).split('-');
  return `${parseInt(p[2], 10)} ${MESES[parseInt(p[1], 10) - 1]}`;
}
export function q(n, dec = 2) {
  const p = n.toFixed(dec).split('.');
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'Q ' + p.join('.');
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
export const pct = (n) => (Math.round(n * 100) / 100).toFixed(2) + '%';
const conSigno = (n, dec) => (n < 0 ? '−' : '') + Math.abs(n).toFixed(dec);

// Íconos de línea (Lucide, trazo 1.5)
export const ICONOS = {
  sube: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  baja: '<path d="m7 7 10 10"/><path d="M17 7v10H7"/>',
  igual: '<path d="M5 12h14"/>',
  compartir: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
  externo: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  atras: '<path d="m15 18-6-6 6-6"/>',
  adelante: '<path d="m9 18 6-6-6-6"/>',
  abajo: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  compartirIos: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  menu: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  tendencia: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  banco: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M12 2 20 7H4z"/>',
  enviar: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  gasolina: '<path d="M3 22h12"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
  canasta: '<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
  billete: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  carrito: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  maletin: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  recibo: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  barco: '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/>',
  fabrica: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
  mercado: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  chip: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  casa: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  salud: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  mundo: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  billetera: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  tijeras: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  brote: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  campo: '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/>'
};
export const ico = (n) => `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n]}</svg>`;

// Sello: fuente · fecha. El mismo componente para todo dato de la app.
const CORTOS = { 'Banco de Guatemala': 'Banguat', 'Superintendencia de Bancos': 'SIB', 'Ministerio de Energía y Minas': 'MEM', 'Ministerio de Finanzas': 'Minfin', 'Instituto Nacional de Estadística': 'INE' };
export function fuenteCorta(f) {
  const c = String(f).split(/ \(|, /)[0].trim();
  return CORTOS[c] || c;
}
export function sello(fuente, fecha, url) {
  const texto = esc(fuenteCorta(fuente)) + (fecha ? ' · ' + esc(fecha) : '');
  const titulo = 'Fuente: ' + esc(fuente) + (fecha ? ', ' + esc(fecha) : '');
  return url
    ? `<a class="sello" href="${esc(url)}" target="_blank" rel="noopener" title="${titulo}">${texto}</a>`
    : `<span class="sello" title="${titulo}">${texto}</span>`;
}

// ─── Dólar ───
export const PERIODOS = { '7d': 'en 7 días', '1m': 'en 1 mes', '1a': 'en 1 año' };
export const RANGO_MINIMO = 0.05; // Q: el eje nunca muestra menos que esto, para no exagerar cambios chicos

export function cambioPeriodo(serie, periodo) {
  if (!serie || serie.length < 2) return '';
  const d = serie.at(-1).valor - serie[0].valor;
  if (Math.abs(d) < 0.0005) return `Sin cambio ${PERIODOS[periodo]}`;
  return `${d > 0 ? '+' : '−'}${q(Math.abs(d), 3)} ${PERIODOS[periodo]}`;
}

export function escalaGrafica(serie) {
  let min = Math.min(...serie.map((s) => s.valor));
  let max = Math.max(...serie.map((s) => s.valor));
  if (max - min < RANGO_MINIMO) {
    const centro = (max + min) / 2;
    min = centro - RANGO_MINIMO / 2; max = centro + RANGO_MINIMO / 2;
  } else {
    const pad = (max - min) * 0.1; min -= pad; max += pad;
  }
  return { min, max };
}

export function graficaSvg(serie, periodo = '7d') {
  if (!serie || serie.length < 2) return '<div class="grafica__vacia">Aún no hay suficientes días para la gráfica</div>';
  const { min, max } = escalaGrafica(serie);
  const dec = max - min <= 0.1 ? 3 : 2;
  const pts = serie.map((s, k) => `${((k / (serie.length - 1)) * 100).toFixed(2)},${((1 - (s.valor - min) / (max - min)) * 100).toFixed(2)}`);
  const ult = pts.at(-1).split(',');
  let rejilla = '', etiquetas = '';
  for (let g = 0; g < 3; g++) {
    const yy = 15 + g * 35, val = max - (yy / 100) * (max - min);
    rejilla += `<line class="grafica__rejilla" x1="0" x2="100" y1="${yy}" y2="${yy}"/>`;
    etiquetas += `<span style="top:${yy}%">${val.toFixed(dec)}</span>`;
  }
  return (
    `<p class="grafica__cambio">${cambioPeriodo(serie, periodo)}</p>` +
    `<figure class="grafica" aria-label="Gráfica del tipo de cambio del ${fechaCorta(serie[0].fecha)} al ${fechaCorta(serie.at(-1).fecha)}">` +
    '<div class="grafica__area"><div class="grafica__plano">' +
    `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${rejilla}<polyline class="grafica__linea" points="${pts.join(' ')}"/></svg>` +
    `<span class="grafica__punto" style="left:${ult[0]}%;top:${ult[1]}%"></span></div>` +
    `<div class="grafica__y" aria-hidden="true">${etiquetas}</div></div>` +
    `<div class="grafica__x" aria-hidden="true"><span>${fechaMini(serie[0].fecha)}</span><span>${fechaMini(serie.at(-1).fecha)}</span></div>` +
    '</figure>'
  );
}

function diaAnterior(iso) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); }
export function textoCambio(d) {
  if (!d.ayer) return '';
  const contra = d.ayer.fecha === diaAnterior(d.fecha) ? 'ayer' : 'el ' + fechaMini(d.ayer.fecha);
  if (d.tendencia === 'igual') return 'Igual que ' + contra;
  return q(Math.abs(d.cambio), 4) + (d.cambio > 0 ? ' más' : ' menos') + ' que ' + contra;
}

export function tarjetaTipoCambio(d, hoy) {
  if (!d || !d.disponible) {
    return '<h2 class="etiqueta">Precio del dólar</h2><p class="texto-2 mt-sm">No pudimos cargar el dato. Consúltalo en <a href="https://www.banguat.gob.gt" target="_blank" rel="noopener">banguat.gob.gt</a>.</p>';
  }
  const cambio = textoCambio(d);
  const aviso = d.fecha === hoy ? '' : `<p class="tc__aviso">Último dato disponible: ${fechaCorta(d.fecha)}. Aún no hay dato de hoy.</p>`;
  return (
    '<h2 class="etiqueta">Precio del dólar en quetzales</h2>' +
    `<div class="tc__valor"><span class="tc__moneda">Q</span>${d.valor.toFixed(4)}</div>` +
    (cambio ? `<p class="tc__cambio">${ico(d.tendencia === 'igual' ? 'igual' : d.tendencia)}${esc(cambio)}</p>` : '') +
    aviso +
    '<div class="tc__controles"><div class="segmentos" role="group" aria-label="Periodo de la gráfica">' +
    '<button class="rango activo" data-r="7d" aria-pressed="true">7 días</button>' +
    '<button class="rango" data-r="1m" aria-pressed="false">1 mes</button>' +
    '<button class="rango" data-r="1a" aria-pressed="false">1 año</button></div></div>' +
    `<div id="grafica-tc">${graficaSvg(d.series?.['7d'], '7d')}</div>` +
    `<div class="sello-linea">${sello(d.fuente, fechaCorta(d.fecha), d.fuenteUrl)}<span class="meta">Referencia. El oficial está en <a href="${esc(d.fuenteUrl)}" target="_blank" rel="noopener">banguat.gob.gt</a></span></div>` +
    `<div class="acciones"><button class="btn-secundario" id="btn-compartir-tc">${ico('compartir')}Compartir</button></div>`
  );
}

export function notaConvertidor(d) {
  return `Con el tipo de cambio de referencia del ${fechaCorta(d.fecha)} (${q(d.valor, 4)}). Los bancos y las remesadoras usan su propia tasa.`;
}

// ─── Indicadores y dato del día ───
const ORDEN = ['inflacion', 'tasa-lider', 'remesas', 'combustibles', 'canasta-basica'];
const ICONO_IND = { inflacion: 'tendencia', 'tasa-lider': 'banco', remesas: 'enviar', combustibles: 'gasolina', 'canasta-basica': 'canasta' };
const miles = (n) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function valorIndicador(clave, d) {
  if (clave === 'inflacion' || clave === 'tasa-lider') return conSigno(d.valor, 2) + '%';
  if (clave === 'remesas') return 'US$' + miles(d.valor);
  if (clave === 'combustibles') return q(d.regular);
  if (clave === 'canasta-basica') return q(d.urbana);
  return String(d.valor);
}
function detalleIndicador(clave, d) {
  if (clave === 'inflacion') return `Acumulada en el año: ${conSigno(d.acumulada, 2)}% · del mes: ${conSigno(d.mensual, 2)}%`;
  if (clave === 'remesas') return `Acumulado del año: US$${miles(d.acumuladoAnio)} millones (${((d.acumuladoAnio / d.acumuladoAnioAnterior - 1) * 100).toFixed(1)}% más que el año pasado)`;
  if (clave === 'combustibles') return `Superior ${q(d.superior)} · Diésel ${q(d.diesel)} por galón`;
  if (clave === 'canasta-basica') return `Área rural: ${q(d.rural)} por persona al mes`;
  if (clave === 'tasa-lider') return 'Sin cambios desde febrero de 2026';
  return '';
}

export function indicadoresHtml(resp) {
  if (!resp || !resp.indicadores) return '<p class="texto-2">No pudimos cargar los indicadores.</p>';
  let html = '';
  for (const clave of ORDEN) {
    const d = resp.indicadores[clave];
    if (!d) continue;
    const periodo = /^[A-Za-zñ]+ \d{4}$/.test(d.periodo) ? d.periodo : '';
    const sub = [periodo, d.unidad === '%' ? '' : d.unidad].filter(Boolean).join(' · ');
    html +=
      `<div class="fila indicador con-icono">${ico(ICONO_IND[clave])}<div>` +
      `<div class="fila__cab"><span class="fila__nombre">${esc(d.nombre)}</span><span class="fila__valor">${valorIndicador(clave, d)}</span></div>` +
      (sub ? `<div class="meta">${esc(sub)}</div>` : '') +
      `<p class="fila__detalle">${esc(detalleIndicador(clave, d))}</p>` +
      `<div class="sello-linea">${sello(d.fuente, fechaCorta(d.fecha), d.url)}${d.viejo ? `<span class="meta">Es el ${esc(d.etiqueta)}; aún no hay uno más reciente</span>` : ''}</div>` +
      `<details class="desplegable"><summary>¿Qué significa esto? ${ico('abajo')}</summary><p>${esc(d.significado)}</p></details>` +
      '</div></div>';
  }
  return `<div class="filas">${html}</div>`;
}

export function datoDelDiaHtml(resp) {
  if (!resp || !resp.dato) return '<h2 class="etiqueta">Dato del día</h2><p class="texto-2 mt-sm">Hoy no hay dato disponible</p>';
  const d = resp.dato;
  return (
    '<h2 class="etiqueta">Dato del día</h2>' +
    `<div class="dato__titulo">${esc(d.titulo)}</div>` +
    `<p class="dato__texto">${esc(d.texto)}</p>` +
    `<div class="sello-linea">${sello(d.fuente, resp.fecha ? fechaCorta(resp.fecha) : '')}<span class="meta">Cálculo propio con datos de ${esc(d.fuente)}</span></div>`
  );
}

// ─── Noticias ───
// Tema por puntos: cada palabra en el titular vale 2 y en el resumen 1; gana el tema con más puntos.
// Antes ganaba el primer tema de la lista que coincidiera y, por ejemplo, "café ... Banguat explica"
// salía como Bancos. Mencionar al Banguat como fuente ya no cuenta como tema de bancos.
export const TEMAS = [
  ['Comercio', 'barco', ['exportaci', 'importaci', 'arancel', 'comercio exterior', 'puerto', 'aduana', 'tratado', 'café', 'cafe', 'azúcar', 'banano', 'cardamomo', 'vestuario', 'maquila']],
  ['Combustibles', 'gasolina', ['gasolin', 'diésel', 'diesel', 'combustible', 'petróleo', 'petrolera', 'crudo', 'gas propano']],
  ['Energía', 'gasolina', ['energía', 'electricidad', 'tarifa eléctrica', 'hidroeléctrica']],
  ['Dólar', 'billete', ['dólar', 'dolar', 'tipo de cambio', 'divisa', 'cambiari']],
  ['Remesas', 'enviar', ['remesa', 'migrante', 'deportad']],
  ['Bancos y crédito', 'banco', ['banco', 'bancari', 'superintendencia de bancos', ' sib', 'crédito', 'credito', 'préstamo', 'prestamo', 'tarjeta de crédito', 'tasa de interés', 'tasa líder', 'junta monetaria', 'intendente']],
  ['Precios', 'carrito', ['inflaci', 'precio', 'canasta', 'ipc', 'costo de vida', 'tortilla', 'maíz']],
  ['Empleo', 'maletin', ['empleo', 'trabajo', 'trabajar', 'salario', 'sueldo', 'desempleo', 'igss', 'pensión', 'pensiones', 'jornada', 'laboral']],
  ['Impuestos y gobierno', 'recibo', ['impuesto', ' sat ', 'tributar', 'fiscal', 'presupuesto', 'deuda pública', 'congreso', 'minfin']],
  ['Empresas', 'fabrica', ['empresa', 'microempresa', 'emprend', 'planta', 'fábrica', 'industria', 'negocio', 'pyme', 'productiv']],
  ['Mercados', 'mercado', ['wall street', 'bolsa', 'acciones', 'reserva federal', ' fed ', ' bce ', 'inversor', 'mercados']],
  ['Tecnología', 'chip', ['inteligencia artificial', ' ia ', 'tecnolog', 'digital', 'cripto', 'bitcoin']],
  ['Vivienda', 'casa', ['vivienda', 'alquiler', 'hipotec', 'inmobiliari', 'ladrillo']],
  ['Agro', 'campo', ['agrícola', 'agricult', 'cosecha', 'productores', 'ganader']],
  ['Salud', 'salud', ['salud', 'vacuna', 'farmac', 'hospital', 'médic']]
];
export function temaNoticia(n) {
  const titulo = ` ${n.titulo} `.toLowerCase();
  const resumen = ` ${n.resumen ?? ''} ${n.afecta ?? ''} `.toLowerCase();
  let mejor = null, puntos = 0;
  for (const tema of TEMAS) {
    let p = 0;
    for (const k of tema[2]) { if (titulo.includes(k)) p += 2; if (resumen.includes(k)) p += 1; }
    if (p > puntos) { mejor = tema; puntos = p; }
  }
  if (mejor) return { nombre: mejor[0], icono: mejor[1] };
  return n.medio === 'El País' || n.medio === 'DW' ? { nombre: 'Mundo', icono: 'mundo' } : { nombre: 'Guatemala', icono: 'pin' };
}

export function tarjetaNoticia(n) {
  const tema = temaNoticia(n);
  return (
    '<article class="tarjeta noticia">' +
    `<div class="noticia__cab">${ico(tema.icono)}<span class="noticia__tema">${tema.nombre}</span>${sello(n.medio, n.fecha ? fechaCorta(n.fecha.slice(0, 10)) : '')}</div>` +
    `<h3 class="noticia__titulo"><a href="${esc(n.enlace)}" target="_blank" rel="noopener">${esc(n.titulo)}</a></h3>` +
    (n.resumen ? `<p class="noticia__resumen">${esc(n.resumen)}</p>` : '') +
    (n.afecta ? `<p class="noticia__afecta"><strong>¿Cómo te afecta?</strong> ${esc(n.afecta)}</p>` : '') +
    `<div class="noticia__pie"><span class="meta">${n.resumen ? 'Resumen automático' : ''}</span><span class="noticia__acciones">` +
    `<button class="btn-texto" data-compartir="1" data-titulo="${esc(n.titulo)}" data-medio="${esc(n.medio)}" data-enlace="${esc(n.enlace)}">${ico('compartir')}Compartir</button>` +
    `<a class="btn-texto" href="${esc(n.enlace)}" target="_blank" rel="noopener">Leer en ${esc(n.medio)}${ico('externo')}</a></span></div>` +
    '</article>'
  );
}

export function noticiasHtml(resp) {
  if (!resp || !resp.disponible) {
    return { fecha: '', contenido: '<div class="vacio"><h2 class="vacio__titulo">Aún no hay noticias de hoy</h2><p class="vacio__texto">Las noticias se preparan cada mañana a las 6:00. Vuelve en un rato.</p></div>' };
  }
  let html = '';
  if (resp.guatemala?.length) html += '<h2 class="titulo-seccion">Guatemala</h2>' + resp.guatemala.map(tarjetaNoticia).join('');
  if (resp.mundo?.length) html += '<h2 class="titulo-seccion">Mundo</h2>' + resp.mundo.map(tarjetaNoticia).join('');
  return { fecha: 'Resumen del ' + fechaCorta(resp.fecha), contenido: html || '<p class="texto-2">Hoy no encontramos noticias económicas.</p>' };
}

// ─── Invertir ───
export function opcionesHtml(tipos) {
  const nivel = (r) => (r.includes('alto') ? 'alto' : r.includes('medio') ? 'medio' : 'bajo');
  const lista = (xs) => xs.map((p) => `<li>${esc(p)}</li>`).join('');
  return '<div class="filas">' + tipos.map((t) =>
    '<details class="fila opcion">' +
    `<summary><span class="fila__nombre">${esc(t.nombre)}</span><span class="opcion__riesgo"><i class="punto punto--${nivel(t.riesgo)}"></i>Riesgo ${esc(t.riesgo)}</span>${ico('abajo')}</summary>` +
    `<p class="opcion__que">${esc(t.queEs)}</p>` +
    `<dl class="datos"><dt>Desde</dt><dd>${esc(t.desde)}</dd><dt>Plazo</dt><dd>${esc(t.plazo)}</dd><dt>Riesgo</dt><dd>${esc(t.riesgoExplicado)}</dd><dt>Liquidez</dt><dd>${esc(t.liquidez)}</dd><dt>Quién supervisa</dt><dd>${esc(t.supervisa)}</dd></dl>` +
    `<div class="pros-contras"><div><strong>A favor</strong><ul>${lista(t.pros)}</ul></div><div><strong>En contra</strong><ul>${lista(t.contras)}</ul></div></div>` +
    '</details>'
  ).join('') + '</div>';
}

function enlaceAfiliado(a) {
  if (!a || !a.url) return '';
  return `<a class="btn-afiliado" href="${esc(a.url)}" target="_blank" rel="sponsored noopener">${esc(a.texto || 'Abrir cuenta')}${ico('externo')}<span class="eti-patro">Enlace patrocinado</span></a>`;
}
// Si la "fuente" es una nota y no un nombre, el sello lleva el sitio y la nota va al lado
function selloTasa(f) {
  if (fuenteCorta(f.fuente).includes('.')) return sello(f.fuente, fechaCorta(f.fecha), f.url);
  const sitio = String(f.url).replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  return sello(sitio, fechaCorta(f.fecha), f.url) + `<span class="meta">${esc(f.fuente)}</span>`;
}
function filaTasa(f, colMonto) {
  const tasa = f.tasa === null ? '<span class="tasa tasa--na">Consultar con la entidad</span>' : `<span class="tasa">${pct(f.tasa)}</span><span class="tasa__tipo">${esc(f.tipoTasa || '')}</span>`;
  return (
    '<div class="fila">' +
    `<div class="fila__cab"><span class="fila__nombre">${esc(f.entidad)}</span><span class="fila__valor">${tasa}</span></div>` +
    `<p class="fila__detalle">${esc(f.producto)}${f[colMonto] && f[colMonto] !== '—' ? ' · ' + esc(f[colMonto]) : ''}</p>` +
    `<div class="sello-linea">${selloTasa(f)}${enlaceAfiliado(f.afiliado)}</div>` +
    '</div>'
  );
}

export function tasasHtml(d) {
  const plazo = d.tasasPlazoFijo.filas.slice().sort((a, b) => (b.tasa ?? -1) - (a.tasa ?? -1));
  const ahorro = d.tasasAhorro.filas.slice().sort((a, b) => b.tasa - a.tasa);
  const ref = d.referencia.tasaPromedioPlazo;
  return {
    notaPlazo: esc(d.tasasPlazoFijo.nota),
    plazo: '<div class="filas">' + plazo.map((f) => filaTasa(f, 'monto')).join('') + '</div>',
    notaAhorro: esc(d.tasasAhorro.nota),
    ahorro: '<div class="filas mt-md">' + ahorro.map((f) => filaTasa(f, 'saldo')).join('') + '</div>',
    isr: `${esc(d.avisoIsr)} Como referencia, el promedio de todos los depósitos a plazo del sistema fue ${pct(ref.valor)} en ${esc(ref.periodo.toLowerCase())}. ${esc(ref.nota)}<span class="sello-linea">${sello(ref.fuente, fechaCorta(ref.fecha), ref.url)}</span>`
  };
}

export function bonosHtml(b) {
  const plazos = b.plazos.map((p) => `<div class="bono"><span class="bono__plazo">${p.anios}${p.anios === 1 ? ' año' : ' años'}</span><span class="bono__tasa">${pct(p.tasa)}</span><span class="bono__vence">vence ${fechaCorta(p.vence)}</span></div>`).join('');
  return (
    '<div class="tarjeta">' +
    `<div class="bonos">${plazos}</div>` +
    `<dl class="datos"><dt>Mínimo</dt><dd>${q(b.minimo)}, luego múltiplos de ${q(b.multiplo)}; máximo ${q(b.maximoAnual)} al año</dd><dt>Intereses</dt><dd>${esc(b.pagoIntereses)}, ${esc(b.impuestos)}</dd><dt>Cómo se compran</dt><dd>${esc(b.comoComprar)}</dd></dl>` +
    `<div class="sello-linea">${sello(b.fuente, fechaCorta(b.fecha), b.url)}<span class="meta">Tasas de la emisión de abril de 2026; cada emisión puede cambiar. Información oficial en <a href="${esc(b.urlOficial)}" target="_blank" rel="noopener">minfin.gob.gt</a></span></div>` +
    '</div>'
  );
}

export function estafasHtml(n) {
  return '<div class="filas">' + n.senales.map((s) => `<div class="fila alerta">${ico('alerta')}<div><div class="alerta__titulo">${esc(s.titulo)}</div><p>${esc(s.texto)}</p></div></div>`).join('') + '</div>';
}
export function verificarHtml(n) {
  return '<div class="tarjeta"><ol class="verificar">' + n.verificar.map((v) => `<li>${esc(v.texto)} <a href="${esc(v.enlace)}" target="_blank" rel="noopener">${esc(v.etiqueta)}</a></li>`).join('') + '</ol></div>';
}

// Todo lo que el Worker mete en index.html, por id del elemento
export function contenidoPortada({ tipoCambio, indicadores, dato, noticias, inversiones, hoy }) {
  const piezas = {};
  if (tipoCambio?.disponible) {
    piezas['card-tipo-cambio'] = tarjetaTipoCambio(tipoCambio, hoy);
    piezas['convertidor-nota'] = esc(notaConvertidor(tipoCambio));
  }
  if (indicadores) piezas['lista-indicadores'] = indicadoresHtml(indicadores);
  if (dato) piezas['card-dato-del-dia'] = datoDelDiaHtml(dato);
  if (noticias) {
    const n = noticiasHtml(noticias);
    piezas['noticias-fecha'] = esc(n.fecha);
    piezas['noticias-contenido'] = n.contenido;
  }
  if (inversiones) {
    const t = tasasHtml(inversiones);
    piezas['lista-opciones'] = opcionesHtml(inversiones.tipos);
    piezas['tasas-nota'] = t.notaPlazo;
    piezas['tabla-plazo-fijo'] = t.plazo;
    piezas['ahorro-nota'] = t.notaAhorro;
    piezas['tabla-ahorro'] = t.ahorro;
    piezas['isr-nota'] = t.isr;
    piezas['card-bonos'] = bonosHtml(inversiones.bonos);
    piezas['lista-estafas'] = estafasHtml(inversiones.noEsInversion);
    piezas['lista-verificar'] = verificarHtml(inversiones.noEsInversion);
  }
  return piezas;
}
