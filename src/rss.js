const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ntilde: 'ñ', Ntilde: 'Ñ', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', uuml: 'ü', iquest: '¿', iexcl: '¡', laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };

export function decodificarEntidades(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => ENTIDADES[n] ?? m);
}

export function limpiarTexto(s, max = 400) {
  if (!s) return '';
  let t = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  t = decodificarEntidades(t);
  t = t.replace(/<[^>]+>/g, ' ');
  t = decodificarEntidades(t); // descripciones con HTML doblemente escapado (Banguat)
  t = t.replace(/\s+/g, ' ').trim();
  if (t.length > max) t = t.slice(0, max).replace(/\s+\S*$/, '') + '…';
  return t;
}

function etiqueta(bloque, nombre) {
  const m = new RegExp(`<${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)</${nombre}>`, 'i').exec(bloque);
  return m ? m[1] : null;
}

function fechaIso(texto) {
  if (!texto) return null;
  const t = Date.parse(limpiarTexto(texto));
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

function enlaceDe(bloque, atom) {
  if (atom) {
    const alt = /<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i.exec(bloque) ?? /<link[^>]*href="([^"]+)"/i.exec(bloque);
    return alt ? decodificarEntidades(alt[1].trim()) : null;
  }
  const l = etiqueta(bloque, 'link');
  return l ? limpiarTexto(l, 2000).replace(/…$/, '') : null;
}

export function parsearRss(xml) {
  if (!xml) return [];
  const atom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const bloques = [...xml.matchAll(atom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi)].map((m) => m[0]);
  const salida = [];
  for (const b of bloques) {
    const titulo = limpiarTexto(etiqueta(b, 'title'), 300);
    const enlace = enlaceDe(b, atom);
    if (!titulo || !enlace || !/^https?:\/\//.test(enlace)) continue;
    const descripcion = limpiarTexto(etiqueta(b, 'description') ?? etiqueta(b, 'summary') ?? '', 400);
    const fecha = fechaIso(etiqueta(b, 'pubDate') ?? etiqueta(b, 'published') ?? etiqueta(b, 'updated') ?? etiqueta(b, 'dc:date'));
    salida.push({ titulo, enlace, descripcion, fecha });
  }
  return salida;
}
