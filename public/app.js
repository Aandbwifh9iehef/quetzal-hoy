(function () {
  'use strict';

  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function fechaCorta(iso) {
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' ' + MESES[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }
  function fechaMini(iso) {
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' ' + MESES[parseInt(p[1], 10) - 1];
  }
  function q(n, dec) {
    var p = n.toFixed(dec == null ? 2 : dec).split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return 'Q ' + p.join('.');
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  // Íconos de línea (Lucide, trazo 1.5)
  var ICONOS = {
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
    foco: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
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
    brote: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>'
  };
  // Mosaico: ícono de línea sobre un cuadro de color de la paleta del quetzal
  function mosaico(icono, color) { return '<span class="mosaico mosaico--' + color + '" aria-hidden="true">' + ico(icono) + '</span>'; }
  function ico(n) { return '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[n] + '</svg>'; }

  // Sello: fuente · fecha. El mismo componente para todo dato de la app.
  var CORTOS = { 'Banco de Guatemala': 'Banguat', 'Superintendencia de Bancos': 'SIB', 'Ministerio de Energía y Minas': 'MEM', 'Ministerio de Finanzas': 'Minfin', 'Instituto Nacional de Estadística': 'INE' };
  function fuenteCorta(f) {
    var c = String(f).split(/ \(|, /)[0].trim();
    return CORTOS[c] || c;
  }
  function sello(fuente, fecha, url) {
    var texto = esc(fuenteCorta(fuente)) + (fecha ? ' · ' + esc(fecha) : '');
    var titulo = 'Fuente: ' + esc(fuente) + (fecha ? ', ' + esc(fecha) : '');
    return url
      ? '<a class="sello" href="' + esc(url) + '" target="_blank" rel="noopener" title="' + titulo + '">' + texto + '</a>'
      : '<span class="sello" title="' + titulo + '">' + texto + '</span>';
  }

  // ─── Compartir (Web Share API; si no existe, copia al portapapeles) ───
  function compartir(titulo, texto, url) {
    evento('compartir');
    if (navigator.share) return navigator.share({ title: titulo, text: texto, url: url }).catch(function () {});
    var todo = texto + '\n' + url;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(todo).then(function () { alert('Copiado. Pégalo en WhatsApp.'); });
    else prompt('Copia este texto:', todo);
  }
  window.compartirQH = compartir;

  // ─── Fecha en el encabezado ───
  var hoy = new Date();
  document.getElementById('fecha-hoy').textContent = hoy.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, function (c) { return c.toUpperCase(); });

  // ─── Analítica (Cloudflare Web Analytics si hay token) y eventos simples ───
  function evento(nombre) {
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('/api/evento', nombre);
      else fetch('/api/evento', { method: 'POST', body: nombre, keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  window.eventoQH = evento;
  fetch('/api/config').then(function (r) { return r.json(); }).then(function (c) {
    if (c && c.analytics) {
      var s = document.createElement('script');
      s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      s.setAttribute('data-cf-beacon', JSON.stringify({ token: c.analytics }));
      document.head.appendChild(s);
    }
  }).catch(function () {});
  window.addEventListener('appinstalled', function () { evento('instalacion'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[rel~="sponsored"]');
    if (a) evento('clic_afiliado');
  });

  // ─── Pestañas ───
  var TABS = ['hoy', 'noticias', 'invertir', 'aprende'];
  window.cambiarTab = function (tab, btn) {
    var secs = document.querySelectorAll('.seccion');
    for (var i = 0; i < secs.length; i++) secs[i].classList.remove('activa');
    var btns = document.querySelectorAll('.nav-btn');
    for (var j = 0; j < btns.length; j++) { btns[j].classList.remove('activo'); btns[j].setAttribute('aria-selected', 'false'); }
    document.getElementById('tab-' + tab).classList.add('activa');
    btn.classList.add('activo');
    btn.setAttribute('aria-selected', 'true');
    if (history.replaceState) history.replaceState(null, '', tab === 'hoy' ? location.pathname : '#' + tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  function abrirDesdeHash() {
    var h = (location.hash || '').replace('#', '');
    if (TABS.indexOf(h) > 0) window.cambiarTab(h, document.getElementById('nav-' + h));
  }
  abrirDesdeHash();
  window.addEventListener('hashchange', abrirDesdeHash);

  // ─── Gráfica del dólar: línea fina, rejilla tenue, punto de hoy en acento ───
  function graficaSvg(serie) {
    if (!serie || serie.length < 2) return '<div class="grafica__vacia">Aún no hay suficientes días para la gráfica</div>';
    var min = Infinity, max = -Infinity;
    for (var i = 0; i < serie.length; i++) { min = Math.min(min, serie[i].valor); max = Math.max(max, serie[i].valor); }
    if (max - min < 0.004) { max += 0.002; min -= 0.002; }
    var pad = (max - min) * 0.12; max += pad; min -= pad;
    var dec = max - min < 0.05 ? 3 : 2;
    var pts = [];
    for (var k = 0; k < serie.length; k++) {
      var x = (k / (serie.length - 1)) * 100;
      var y = (1 - (serie[k].valor - min) / (max - min)) * 100;
      pts.push(x.toFixed(2) + ',' + y.toFixed(2));
    }
    var ult = pts[pts.length - 1].split(',');
    var rejilla = '', etiquetas = '';
    for (var g = 0; g < 3; g++) {
      var yy = 15 + g * 35, val = max - (yy / 100) * (max - min);
      rejilla += '<line class="grafica__rejilla" x1="0" x2="100" y1="' + yy + '" y2="' + yy + '"/>';
      etiquetas += '<span style="top:' + yy + '%">' + val.toFixed(dec) + '</span>';
    }
    return (
      '<figure class="grafica" aria-label="Gráfica del tipo de cambio del ' + fechaCorta(serie[0].fecha) + ' al ' + fechaCorta(serie[serie.length - 1].fecha) + '">' +
      '<div class="grafica__area"><div class="grafica__plano">' +
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + rejilla +
      '<polyline class="grafica__linea" points="' + pts.join(' ') + '"/></svg>' +
      '<span class="grafica__punto" style="left:' + ult[0] + '%;top:' + ult[1] + '%"></span></div>' +
      '<div class="grafica__y" aria-hidden="true">' + etiquetas + '</div></div>' +
      '<div class="grafica__x" aria-hidden="true"><span>' + fechaMini(serie[0].fecha) + '</span><span>' + fechaMini(serie[serie.length - 1].fecha) + '</span></div>' +
      '</figure>'
    );
  }

  // ─── Tarjeta de tipo de cambio ───
  function diaAnterior(iso) { var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); }
  function textoCambio(d) {
    if (!d.ayer) return '';
    var contra = d.ayer.fecha === diaAnterior(d.fecha) ? 'ayer' : 'el ' + fechaMini(d.ayer.fecha);
    if (d.tendencia === 'igual') return 'Igual que ' + contra;
    return q(Math.abs(d.cambio), 4) + (d.cambio > 0 ? ' más' : ' menos') + ' que ' + contra;
  }

  function pintarTipoCambio(d) {
    var card = document.getElementById('card-tipo-cambio');
    if (!d || !d.disponible) {
      card.removeAttribute('aria-busy');
      card.innerHTML =
        '<h2 class="etiqueta">Precio del dólar</h2>' +
        '<p class="texto-2 mt-sm">No pudimos cargar el dato. Consúltalo en <a href="https://www.banguat.gob.gt" target="_blank" rel="noopener">banguat.gob.gt</a>.</p>';
      return;
    }
    var cambio = textoCambio(d);
    var esHoy = d.fecha === new Date().toISOString().slice(0, 10);
    var avisoFecha = esHoy ? '' : '<p class="tc__aviso">Último dato disponible: ' + fechaCorta(d.fecha) + '. Aún no hay dato de hoy.</p>';

    card.removeAttribute('aria-busy');
    card.innerHTML =
      '<h2 class="etiqueta">Precio del dólar en quetzales</h2>' +
      '<div class="tc__valor"><span class="tc__moneda">Q</span>' + d.valor.toFixed(4) + '</div>' +
      (cambio ? '<p class="tc__cambio">' + ico(d.tendencia === 'igual' ? 'igual' : d.tendencia) + esc(cambio) + '</p>' : '') +
      avisoFecha +
      '<div class="tc__controles"><div class="segmentos" role="group" aria-label="Periodo de la gráfica">' +
      '<button class="rango activo" data-r="7d" aria-pressed="true">7 días</button>' +
      '<button class="rango" data-r="1m" aria-pressed="false">1 mes</button>' +
      '<button class="rango" data-r="1a" aria-pressed="false">1 año</button></div></div>' +
      '<div id="grafica-tc">' + graficaSvg(d.series['7d']) + '</div>' +
      '<div class="sello-linea">' + sello(d.fuente, fechaCorta(d.fecha), d.fuenteUrl) + '<span class="meta">Referencia. El oficial está en <a href="' + esc(d.fuenteUrl) + '" target="_blank" rel="noopener">banguat.gob.gt</a></span></div>' +
      '<div class="acciones"><button class="btn-secundario" id="btn-compartir-tc">' + ico('compartir') + 'Compartir</button></div>';

    document.getElementById('btn-compartir-tc').addEventListener('click', function () {
      compartir('Dólar hoy en Guatemala', 'Dólar hoy: ' + q(d.valor, 4) + (cambio ? ', ' + cambio.charAt(0).toLowerCase() + cambio.slice(1) : '') + '. Referencia Banguat, ' + fechaCorta(d.fecha), 'https://hoy.compoundclub.fyi/');
    });
    var botones = card.querySelectorAll('.rango');
    for (var i = 0; i < botones.length; i++) {
      botones[i].addEventListener('click', function () {
        for (var j = 0; j < botones.length; j++) { botones[j].classList.remove('activo'); botones[j].setAttribute('aria-pressed', 'false'); }
        this.classList.add('activo');
        this.setAttribute('aria-pressed', 'true');
        document.getElementById('grafica-tc').innerHTML = graficaSvg(d.series[this.getAttribute('data-r')]);
      });
    }

    iniciarConvertidor(d.valor, d.fecha);
  }

  // ─── Convertidor USD ⇄ GTQ ───
  function iniciarConvertidor(tasa, fecha) {
    var card = document.getElementById('card-convertidor');
    var usd = document.getElementById('usd');
    var gtq = document.getElementById('gtq');
    card.hidden = false;
    document.getElementById('convertidor-nota').textContent = 'Con el tipo de cambio de referencia del ' + fechaCorta(fecha) + ' (' + q(tasa, 4) + '). Los bancos y las remesadoras usan su propia tasa.';

    function limpiar(v) { var n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n >= 0 ? n : null; }
    usd.addEventListener('input', function () { var n = limpiar(usd.value); gtq.value = n == null ? '' : (n * tasa).toFixed(2); });
    gtq.addEventListener('input', function () { var n = limpiar(gtq.value); usd.value = n == null ? '' : (n / tasa).toFixed(2); });
    document.getElementById('btn-swap').addEventListener('click', function () {
      var a = usd.value; usd.value = gtq.value; gtq.value = a;
      usd.dispatchEvent(new Event('input'));
    });
    usd.value = '100';
    usd.dispatchEvent(new Event('input'));
  }


  // ─── Indicadores ───
  var ORDEN = ['inflacion', 'tasa-lider', 'remesas', 'combustibles', 'canasta-basica'];
  var MOSAICO_IND = { inflacion: ['tendencia', 'rojo'], 'tasa-lider': ['banco', 'jade'], remesas: ['enviar', 'oro'], combustibles: ['gasolina', 'rojo'], 'canasta-basica': ['canasta', 'oro'] };

  function valorIndicador(clave, d) {
    if (clave === 'inflacion') return d.valor.toFixed(2) + '%';
    if (clave === 'tasa-lider') return d.valor.toFixed(2) + '%';
    if (clave === 'remesas') return 'US$' + d.valor.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (clave === 'combustibles') return q(d.regular, 2);
    if (clave === 'canasta-basica') return q(d.urbana, 2);
    return String(d.valor);
  }

  function detalleIndicador(clave, d) {
    if (clave === 'inflacion') return 'Acumulada en el año: ' + d.acumulada.toFixed(2).replace('-', '−') + '% · del mes: ' + d.mensual.toFixed(2).replace('-', '−') + '%';
    if (clave === 'remesas') return 'Acumulado del año: US$' + d.acumuladoAnio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' millones (' + ((d.acumuladoAnio / d.acumuladoAnioAnterior - 1) * 100).toFixed(1) + '% más que el año pasado)';
    if (clave === 'combustibles') return 'Superior ' + q(d.superior, 2) + ' · Diésel ' + q(d.diesel, 2) + ' por galón';
    if (clave === 'canasta-basica') return 'Área rural: ' + q(d.rural, 2) + ' por persona al mes';
    if (clave === 'tasa-lider') return 'Sin cambios desde febrero de 2026';
    return '';
  }

  function pintarIndicadores(resp) {
    var cont = document.getElementById('lista-indicadores');
    if (!resp || !resp.indicadores) { cont.innerHTML = '<p class="texto-2">No pudimos cargar los indicadores.</p>'; return; }
    var html = '';
    for (var i = 0; i < ORDEN.length; i++) {
      var clave = ORDEN[i];
      var d = resp.indicadores[clave];
      if (!d) continue;
      var periodo = /^[A-Za-zñ]+ \d{4}$/.test(d.periodo) ? d.periodo : '';
      var sub = [periodo, d.unidad === '%' ? '' : d.unidad].filter(Boolean).join(' · ');
      html +=
        '<div class="fila indicador con-mosaico">' + mosaico(MOSAICO_IND[clave][0], MOSAICO_IND[clave][1]) + '<div>' +
        '<div class="fila__cab"><span class="fila__nombre">' + esc(d.nombre) + '</span><span class="fila__valor">' + valorIndicador(clave, d) + '</span></div>' +
        (sub ? '<div class="meta">' + esc(sub) + '</div>' : '') +
        '<p class="fila__detalle">' + esc(detalleIndicador(clave, d)) + '</p>' +
        '<div class="sello-linea">' + sello(d.fuente, fechaCorta(d.fecha), d.url) + (d.viejo ? '<span class="meta">Es el ' + esc(d.etiqueta) + '; aún no hay uno más reciente</span>' : '') + '</div>' +
        '<details class="desplegable"><summary>¿Qué significa esto? ' + ico('abajo') + '</summary><p>' + esc(d.significado) + '</p></details>' +
        '</div></div>';
    }
    cont.innerHTML = '<div class="filas">' + html + '</div>';
  }

  function pintarDatoDelDia(resp) {
    var card = document.getElementById('card-dato-del-dia');
    if (!resp || !resp.dato) { card.innerHTML = '<h2 class="etiqueta">Dato del día</h2><p class="texto-2 mt-sm">Hoy no hay dato disponible</p>'; return; }
    var d = resp.dato;
    card.innerHTML =
      '<div class="dato__cab">' + mosaico('foco', 'oro') + '<h2 class="etiqueta">Dato del día</h2></div>' +
      '<div class="dato__titulo">' + esc(d.titulo) + '</div>' +
      '<p class="dato__texto">' + esc(d.texto) + '</p>' +
      '<div class="sello-linea">' + sello(d.fuente, resp.fecha ? fechaCorta(resp.fecha) : '') + '<span class="meta">Cálculo propio con datos de ' + esc(d.fuente) + '</span></div>';
  }

  fetch('/api/indicadores').then(function (r) { return r.json(); }).then(pintarIndicadores).catch(function () { pintarIndicadores(null); });
  fetch('/api/dato-del-dia').then(function (r) { return r.json(); }).then(pintarDatoDelDia).catch(function () { pintarDatoDelDia(null); });


  // ─── Noticias ───
  // Tema de cada noticia por palabras del titular: un ícono y un color, sin cambiar el contenido
  var TEMAS = [
    ['Combustibles', 'gasolina', 'rojo', /gasolin|diésel|diesel|combustible|petrol|crudo|energ[ií]a|electricidad/i],
    ['Dólar', 'billete', 'jade', /d[oó]lar|tipo de cambio|quetzal|divisa|cambiari/i],
    ['Remesas', 'enviar', 'oro', /remesa|migra|deporta/i],
    ['Bancos', 'banco', 'jade', /banco|sib\b|superintendencia|cr[eé]dito|tarjeta|tasa|banguat|junta monetaria|intendent/i],
    ['Precios', 'carrito', 'rojo', /inflaci|precio|canasta|ipc|costo de vida|tortilla|ma[ií]z/i],
    ['Empleo', 'maletin', 'oro', /empleo|trabajo|salario|sueldo|desempleo|igss|pensi/i],
    ['Impuestos', 'recibo', 'jade', /impuesto|sat\b|tributar|fiscal|presupuesto|deuda p[uú]blica|congreso|minfin/i],
    ['Comercio', 'barco', 'oro', /exportaci|importaci|arancel|comercio|puerto|aduana|tratado|caf[eé]|az[uú]car|banano|cardamomo/i],
    ['Empresas', 'fabrica', 'jade', /empresa|inversi|planta|f[aá]brica|negocio|alianza|expansi|emprend/i],
    ['Mercados', 'mercado', 'jade', /wall street|bolsa|acciones|mercado|fed\b|reserva federal|bce\b|inversor/i],
    ['Tecnología', 'chip', 'oro', /inteligencia artificial|\bia\b|tecnolog|digital|cripto|bitcoin/i],
    ['Vivienda', 'casa', 'rojo', /vivienda|casa|alquiler|hipotec|construcci|ciudad|urban/i],
    ['Salud', 'salud', 'rojo', /salud|vacuna|farmac|hospital|m[eé]dic/i]
  ];
  function temaNoticia(n) {
    var t = n.titulo + ' ' + (n.resumen || '');
    for (var i = 0; i < TEMAS.length; i++) if (TEMAS[i][3].test(t)) return TEMAS[i];
    return n.medio === 'El País' || n.medio === 'DW' ? ['Mundo', 'mundo', 'oro'] : ['Guatemala', 'pin', 'jade'];
  }
  function tarjetaNoticia(n) {
    var tema = temaNoticia(n);
    return (
      '<article class="tarjeta noticia">' +
      '<div class="noticia__cab">' + mosaico(tema[1], tema[2]) + '<div><div class="noticia__tema">' + tema[0] + '</div>' +
      sello(n.medio, n.fecha ? fechaCorta(n.fecha.slice(0, 10)) : '') + '</div></div>' +
      '<h3 class="noticia__titulo"><a href="' + esc(n.enlace) + '" target="_blank" rel="noopener">' + esc(n.titulo) + '</a></h3>' +
      (n.resumen ? '<p class="noticia__resumen">' + esc(n.resumen) + '</p>' : '') +
      (n.afecta ? '<p class="noticia__afecta"><strong>Cómo te afecta:</strong> ' + esc(n.afecta) + '</p>' : '') +
      '<div class="noticia__pie"><span class="meta">' + (n.resumen ? 'Resumen automático' : '') + '</span><span class="noticia__acciones">' +
      '<button class="btn-texto" data-compartir="1" data-titulo="' + esc(n.titulo) + '" data-medio="' + esc(n.medio) + '" data-enlace="' + esc(n.enlace) + '">' + ico('compartir') + 'Compartir</button>' +
      '<a class="btn-texto" href="' + esc(n.enlace) + '" target="_blank" rel="noopener">Leer en ' + esc(n.medio) + ico('externo') + '</a></span></div>' +
      '</article>'
    );
  }

  function pintarNoticias(resp) {
    var cont = document.getElementById('noticias-contenido');
    var fecha = document.getElementById('noticias-fecha');
    if (!resp || !resp.disponible) {
      fecha.textContent = '';
      cont.innerHTML = '<div class="vacio"><h2 class="vacio__titulo">Aún no hay noticias de hoy</h2><p class="vacio__texto">Las noticias se preparan cada mañana a las 6:00. Vuelve en un rato.</p></div>';
      return;
    }
    fecha.textContent = 'Resumen del ' + fechaCorta(resp.fecha);
    var html = '';
    if (resp.guatemala && resp.guatemala.length) {
      html += '<h2 class="titulo-seccion">Guatemala</h2>';
      for (var i = 0; i < resp.guatemala.length; i++) html += tarjetaNoticia(resp.guatemala[i]);
    }
    if (resp.mundo && resp.mundo.length) {
      html += '<h2 class="titulo-seccion">Mundo</h2>';
      for (var j = 0; j < resp.mundo.length; j++) html += tarjetaNoticia(resp.mundo[j]);
    }
    cont.innerHTML = html || '<p class="texto-2">Hoy no encontramos noticias económicas.</p>';
    var bc = cont.querySelectorAll('[data-compartir]');
    for (var k = 0; k < bc.length; k++) bc[k].addEventListener('click', function () {
      compartir(this.getAttribute('data-titulo'), this.getAttribute('data-titulo') + ' (' + this.getAttribute('data-medio') + ') — vía Al cambio', this.getAttribute('data-enlace'));
    });
  }

  function cargarNoticias(fecha) {
    document.getElementById('noticias-contenido').innerHTML = '<div class="cargando">Cargando noticias…</div>';
    fetch('/api/noticias' + (fecha ? '?fecha=' + fecha : ''))
      .then(function (r) { return r.json(); })
      .then(pintarNoticias)
      .catch(function () { pintarNoticias(null); });
  }

  function pintarArchivo(resp) {
    var fechas = (resp && resp.fechas) || [];
    if (fechas.length < 2) return;
    var lista = document.getElementById('archivo-lista');
    var html = '';
    for (var i = 0; i < fechas.length; i++) html += '<button class="archivo__dia" data-f="' + esc(fechas[i]) + '">' + fechaCorta(fechas[i]) + '</button>';
    lista.innerHTML = html;
    var botones = lista.querySelectorAll('.archivo__dia');
    for (var k = 0; k < botones.length; k++) {
      botones[k].addEventListener('click', function () {
        cargarNoticias(this.getAttribute('data-f'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    document.getElementById('archivo-noticias').hidden = false;
  }

  cargarNoticias();
  fetch('/api/noticias/archivo').then(function (r) { return r.json(); }).then(pintarArchivo).catch(function () {});


  // ─── Invertir ───
  function pct(n) { return (Math.round(n * 100) / 100).toFixed(2) + '%'; }

  function pintarOpciones(tipos) {
    var html = '';
    for (var i = 0; i < tipos.length; i++) {
      var t = tipos[i];
      html +=
        '<details class="fila opcion">' +
        '<summary><span class="fila__nombre">' + esc(t.nombre) + '</span><span class="opcion__riesgo"><i class="punto punto--' + (t.riesgo.indexOf('alto') >= 0 ? 'alto' : t.riesgo.indexOf('medio') >= 0 ? 'medio' : 'bajo') + '"></i>Riesgo ' + esc(t.riesgo) + '</span>' + ico('abajo') + '</summary>' +
        '<p class="opcion__que">' + esc(t.queEs) + '</p>' +
        '<dl class="datos">' +
        '<dt>Desde</dt><dd>' + esc(t.desde) + '</dd>' +
        '<dt>Plazo</dt><dd>' + esc(t.plazo) + '</dd>' +
        '<dt>Riesgo</dt><dd>' + esc(t.riesgoExplicado) + '</dd>' +
        '<dt>Liquidez</dt><dd>' + esc(t.liquidez) + '</dd>' +
        '<dt>Quién supervisa</dt><dd>' + esc(t.supervisa) + '</dd>' +
        '</dl>' +
        '<div class="pros-contras"><div><strong>A favor</strong><ul>' + t.pros.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>' +
        '<div><strong>En contra</strong><ul>' + t.contras.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div></div>' +
        '</details>';
    }
    document.getElementById('lista-opciones').innerHTML = '<div class="filas">' + html + '</div>';
  }

  function enlaceAfiliado(a) {
    if (!a || !a.url) return '';
    return '<a class="btn-afiliado" href="' + esc(a.url) + '" target="_blank" rel="sponsored noopener">' + esc(a.texto || 'Abrir cuenta') + ico('externo') + '<span class="eti-patro">Enlace patrocinado</span></a>';
  }
  // Si la "fuente" es una nota y no un nombre, el sello lleva el sitio y la nota va al lado
  function selloTasa(f) {
    if (fuenteCorta(f.fuente).indexOf('.') > 0) return sello(f.fuente, fechaCorta(f.fecha), f.url);
    var sitio = String(f.url).replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    return sello(sitio, fechaCorta(f.fecha), f.url) + '<span class="meta">' + esc(f.fuente) + '</span>';
  }
  function filaTasa(f, colMonto) {
    var tasa = f.tasa === null ? '<span class="tasa tasa--na">Consultar con la entidad</span>' : '<span class="tasa">' + pct(f.tasa) + '</span><span class="tasa__tipo">' + esc(f.tipoTasa || '') + '</span>';
    return (
      '<div class="fila">' +
      '<div class="fila__cab"><span class="fila__nombre">' + esc(f.entidad) + '</span><span class="fila__valor">' + tasa + '</span></div>' +
      '<p class="fila__detalle">' + esc(f.producto) + (f[colMonto] && f[colMonto] !== '—' ? ' · ' + esc(f[colMonto]) : '') + '</p>' +
      '<div class="sello-linea">' + selloTasa(f) + enlaceAfiliado(f.afiliado) + '</div>' +
      '</div>'
    );
  }

  function pintarTasas(d) {
    document.getElementById('tasas-nota').textContent = d.tasasPlazoFijo.nota;
    var filas = d.tasasPlazoFijo.filas.slice().sort(function (a, b) { return (b.tasa || -1) - (a.tasa || -1); });
    document.getElementById('tabla-plazo-fijo').innerHTML = '<div class="filas">' + filas.map(function (f) { return filaTasa(f, 'monto'); }).join('') + '</div>';
    document.getElementById('ahorro-nota').textContent = d.tasasAhorro.nota;
    var ah = d.tasasAhorro.filas.slice().sort(function (a, b) { return b.tasa - a.tasa; });
    document.getElementById('tabla-ahorro').innerHTML = '<div class="filas mt-md">' + ah.map(function (f) { return filaTasa(f, 'saldo'); }).join('') + '</div>';
    var ref = d.referencia.tasaPromedioPlazo;
    document.getElementById('isr-nota').innerHTML = esc(d.avisoIsr) + ' Como referencia, el promedio de todos los depósitos a plazo del sistema fue ' + pct(ref.valor) + ' en ' + esc(ref.periodo.toLowerCase()) + '. ' + esc(ref.nota) +
      '<span class="sello-linea">' + sello(ref.fuente, fechaCorta(ref.fecha), ref.url) + '</span>';
  }

  function pintarBonos(b) {
    var plazos = b.plazos.map(function (p) { return '<div class="bono"><span class="bono__plazo">' + p.anios + (p.anios === 1 ? ' año' : ' años') + '</span><span class="bono__tasa">' + pct(p.tasa) + '</span><span class="bono__vence">vence ' + fechaCorta(p.vence) + '</span></div>'; }).join('');
    document.getElementById('card-bonos').innerHTML =
      '<div class="tarjeta">' +
      '<div class="bonos">' + plazos + '</div>' +
      '<dl class="datos">' +
      '<dt>Mínimo</dt><dd>' + q(b.minimo) + ', luego múltiplos de ' + q(b.multiplo) + '; máximo ' + q(b.maximoAnual) + ' al año</dd>' +
      '<dt>Intereses</dt><dd>' + esc(b.pagoIntereses) + ', ' + esc(b.impuestos) + '</dd>' +
      '<dt>Cómo se compran</dt><dd>' + esc(b.comoComprar) + '</dd>' +
      '</dl>' +
      '<div class="sello-linea">' + sello(b.fuente, fechaCorta(b.fecha), b.url) + '<span class="meta">Tasas de la emisión de abril de 2026; cada emisión puede cambiar. Información oficial en <a href="' + esc(b.urlOficial) + '" target="_blank" rel="noopener">minfin.gob.gt</a></span></div>' +
      '</div>';
  }

  function pintarEstafas(n) {
    document.getElementById('lista-estafas').innerHTML = '<div class="filas">' + n.senales.map(function (s) {
      return '<div class="fila alerta">' + ico('alerta') + '<div><div class="alerta__titulo">' + esc(s.titulo) + '</div><p>' + esc(s.texto) + '</p></div></div>';
    }).join('') + '</div>';
    document.getElementById('lista-verificar').innerHTML = '<div class="tarjeta"><ol class="verificar">' + n.verificar.map(function (v) {
      return '<li>' + esc(v.texto) + ' <a href="' + esc(v.enlace) + '" target="_blank" rel="noopener">' + esc(v.etiqueta) + '</a></li>';
    }).join('') + '</ol></div>';
  }

  // Calculadoras (misma lógica que src/calculadoras.js)
  function num(id) { var v = parseFloat(String(document.getElementById(id).value).replace(',', '.')); return isFinite(v) && v >= 0 ? v : null; }
  // Gráfica de calculadoras: lo que pones en neutro, los intereses en acento
  function columnas(saldos, aportes) {
    var n = saldos.length, pasos = Math.min(n, 12), max = saldos[n - 1] || 1, html = '';
    for (var k = 1; k <= pasos; k++) {
      var idx = Math.round(k / pasos * n) - 1;
      var total = saldos[idx], puesto = Math.min(aportes[idx], total);
      html += '<div class="barras__col"><span class="parte--base" style="height:' + (puesto / max * 100).toFixed(2) + '%"></span><span class="parte--acento" style="height:' + ((total - puesto) / max * 100).toFixed(2) + '%"></span></div>';
    }
    return '<div class="barras" aria-hidden="true">' + html + '</div><div class="barras__eje" aria-hidden="true"><span>mes 1</span><span>mes ' + n + '</span></div>';
  }
  function partida(a, b, claseB) {
    var t = a + b || 1;
    return '<div class="barra-partida" aria-hidden="true"><span class="parte--base" style="width:' + (a / t * 100).toFixed(2) + '%"></span><span class="' + claseB + '" style="width:' + (b / t * 100).toFixed(2) + '%"></span></div>';
  }
  function leyenda(items) {
    return '<div class="leyenda">' + items.map(function (it) { return '<span><i class="' + it[0] + '"></i>' + it[1] + '</span>'; }).join('') + '</div>';
  }
  function serieAhorro(inicial, aporte, r, n) {
    var saldos = [], aportes = [], saldo = inicial;
    for (var m = 1; m <= n; m++) { saldo = saldo * (1 + r) + aporte; saldos.push(saldo); aportes.push(inicial + aporte * m); }
    return { saldos: saldos, aportes: aportes };
  }

  function calcAhorro() {
    var a = num('c1-aporte'), t = num('c1-tasa'), m = num('c1-meses'), i = num('c1-inicial');
    var out = document.getElementById('c1-resultado');
    if (a === null || t === null || m === null || i === null || m < 1) { out.textContent = 'Revisa los números'; return; }
    var r = t / 100 / 12, n = Math.floor(m), f = Math.pow(1 + r, n);
    var total = r === 0 ? i + a * n : i * f + a * ((f - 1) / r);
    var aportado = i + a * n;
    var s = serieAhorro(i, a, r, Math.min(n, 600));
    out.innerHTML = '<div class="calc__grande">' + q(total, 2) + '</div><p class="calc__texto">Tú pones ' + q(aportado, 2) + ' y el interés agrega ' + q(total - aportado, 2) + ' en ' + n + ' meses (antes del ISR).</p>' +
      (n <= 600 ? columnas(s.saldos, s.aportes) : '') + leyenda([['parte--base', 'Lo que pones'], ['parte--acento', 'Intereses']]);
  }
  function calcPlazo() {
    var m = num('c2-monto'), t = num('c2-tasa'), d = parseInt(document.getElementById('c2-dias').value, 10);
    var out = document.getElementById('c2-resultado');
    if (m === null || t === null) { out.textContent = 'Revisa los números'; return; }
    var interes = m * (t / 100) * (d / 365), isr = interes * 0.1;
    out.innerHTML = '<div class="calc__grande">' + q(m + interes - isr, 2) + '</div><p class="calc__texto">Interés ' + q(interes, 2) + ' menos 10% de ISR (' + q(isr, 2) + ') = ' + q(interes - isr, 2) + ' netos en ' + d + ' días.</p>' +
      partida(m, interes - isr, 'parte--acento') + leyenda([['parte--base', 'Tu dinero ' + q(m)], ['parte--acento', 'Interés neto ' + q(interes - isr, 2)]]);
  }
  function calcInflacion() {
    var m = num('c3-monto'), a = num('c3-anios'), i = num('c3-inflacion');
    var out = document.getElementById('c3-resultado');
    if (m === null || a === null || i === null) { out.textContent = 'Revisa los números'; return; }
    var real = m / Math.pow(1 + i / 100, a);
    out.innerHTML = '<div class="calc__grande calc__grande--mal">−' + q(m - real, 2) + '</div><p class="calc__texto">Tus ' + q(m) + ' seguirán siendo ' + q(m) + ', pero comprarán lo que hoy compras con ' + q(real, 2) + '. Pierdes ' + pct((1 - real / m) * 100) + ' de poder de compra en ' + a + (a === 1 ? ' año' : ' años') + '.</p>' +
      partida(real, m - real, 'parte--mal') + leyenda([['parte--base', 'Lo que podrás comprar'], ['parte--mal', 'Lo que pierdes']]);
  }
  function calcMeta() {
    var meta = num('c4-meta'), m = num('c4-meses'), t = num('c4-tasa'), i = num('c4-inicial');
    var out = document.getElementById('c4-resultado');
    if (meta === null || m === null || t === null || i === null || m < 1) { out.textContent = 'Revisa los números'; return; }
    var r = t / 100 / 12, n = Math.floor(m), f = Math.pow(1 + r, n);
    var faltante = meta - i * f;
    if (faltante <= 0) { out.innerHTML = '<div class="calc__grande">Q 0.00 al mes</div><p class="calc__texto">Con lo que ya tienes llegas a la meta.</p>'; return; }
    var aporte = r === 0 ? faltante / n : faltante * r / (f - 1);
    var s = serieAhorro(i, aporte, r, Math.min(n, 600));
    out.innerHTML = '<div class="calc__grande">' + q(aporte, 2) + ' al mes</div><p class="calc__texto">Durante ' + n + ' meses para llegar a ' + q(meta) + '. El interés pone ' + q(meta - i - aporte * n, 2) + '.</p>' +
      (n <= 600 ? columnas(s.saldos, s.aportes) : '') + leyenda([['parte--base', 'Lo que pones'], ['parte--acento', 'Intereses']]);
  }
  var calcs = [['c1', calcAhorro], ['c2', calcPlazo], ['c3', calcInflacion], ['c4', calcMeta]];
  for (var ci = 0; ci < calcs.length; ci++) {
    (function (prefijo, fn) {
      var campos = document.querySelectorAll('[id^="' + prefijo + '-"]');
      for (var k = 0; k < campos.length; k++) { campos[k].addEventListener('input', fn); campos[k].addEventListener('change', fn); }
      fn();
    })(calcs[ci][0], calcs[ci][1]);
  }

  fetch('/api/inversiones').then(function (r) { return r.json(); }).then(function (d) {
    pintarOpciones(d.tipos);
    pintarTasas(d);
    pintarBonos(d.bonos);
    pintarEstafas(d.noEsInversion);
  }).catch(function () {
    document.getElementById('lista-opciones').innerHTML = '<p class="texto-2">No pudimos cargar la información.</p>';
  });


  // ─── Aprende: cursos con progreso en el celular ───
  var CLAVE_PROGRESO = 'quetzal-hoy:progreso';
  var cursosCache = null;
  function leerProgreso() {
    try { var c = localStorage.getItem(CLAVE_PROGRESO); var d = c ? JSON.parse(c) : {}; return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; }
  }
  function guardarProgreso(p) { try { localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(p)); return true; } catch (e) { return false; } }
  function avance(curso, p) {
    var h = 0;
    for (var i = 0; i < curso.lecciones.length; i++) { var l = p[curso.id] && p[curso.id].lecciones && p[curso.id].lecciones[curso.lecciones[i].id]; if (l && l.terminada) h++; }
    return { hechas: h, total: curso.lecciones.length, pct: Math.round(h / curso.lecciones.length * 100) };
  }
  function siguiente(curso, p) {
    var ids = curso.lecciones.map(function (l) { return l.id; });
    var pc = p[curso.id] || {};
    var desde = Math.max(0, pc.ultima ? ids.indexOf(pc.ultima) : 0);
    for (var i = 0; i < ids.length; i++) { var id = ids[(desde + i) % ids.length]; if (!(pc.lecciones && pc.lecciones[id] && pc.lecciones[id].terminada)) return id; }
    return ids[0];
  }
  var premiumCfg = { activo: false };
  function etiquetaPatrocinio(p) {
    if (!p || !p.nombre) return '';
    return '<span class="eti-patro eti-patro--curso">Patrocinado por ' + (p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="sponsored noopener">' + esc(p.nombre) + '</a>' : esc(p.nombre)) + '</span>';
  }
  function desbloqueados() { try { return JSON.parse(localStorage.getItem('quetzal-hoy:premium') || '{}') || {}; } catch (e) { return {}; } }
  function cursoBloqueado(c) { return Boolean(c.premium && premiumCfg.activo && !desbloqueados()[c.id]); }
  function cursoPorId(id) { for (var i = 0; i < cursosCache.length; i++) if (cursosCache[i].id === id) return cursosCache[i]; return null; }
  function leccionPorId(curso, id) { for (var i = 0; i < curso.lecciones.length; i++) if (curso.lecciones[i].id === id) return curso.lecciones[i]; return null; }

  // Texto de lección: ## títulos, - listas, **negritas**, párrafos
  function renderTexto(t) {
    var bloques = t.split(/\n\n+/), html = '';
    for (var i = 0; i < bloques.length; i++) {
      var b = bloques[i].trim();
      if (!b) continue;
      var inl = esc(b).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
      if (b.indexOf('## ') === 0) html += '<h3 class="leccion__h">' + inl.slice(3) + '</h3>';
      else if (/^(- |\d+\. )/.test(b)) {
        var items = b.split('\n'), ol = /^\d+\. /.test(b);
        html += (ol ? '<ol' : '<ul') + ' class="leccion__lista">' + items.map(function (x) { return '<li>' + esc(x.replace(/^(- |\d+\. )/, '')).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') + '</li>'; }).join('') + (ol ? '</ol>' : '</ul>');
      } else html += '<p>' + inl.replace(/\n/g, '<br>') + '</p>';
    }
    return html;
  }

  function barra(a) { return '<div class="progreso" role="progressbar" aria-label="Avance" aria-valuenow="' + a.pct + '" aria-valuemin="0" aria-valuemax="100"><div class="progreso__relleno" style="width:' + a.pct + '%"></div></div>'; }

  var PORTADA = { presupuesto: ['billetera', 'jade'], deudas: ['tijeras', 'rojo'], invertir: ['brote', 'oro'] };
  function vistaCursos() {
    var p = leerProgreso(), html = '<h1 class="titulo-pagina">Aprende</h1><p class="texto-2 mb-md">Cursos cortos y gratuitos. Tu avance se guarda en este celular.</p>';
    var cont = null;
    for (var i = 0; i < cursosCache.length; i++) {
      var c = cursosCache[i], a = avance(c, p), tocado = p[c.id] && p[c.id].ultima;
      if (tocado && a.hechas < a.total && (!cont || a.hechas > cont.a.hechas)) cont = { c: c, a: a, l: siguiente(c, p) };
    }
    if (cont) {
      var lec = leccionPorId(cont.c, cont.l);
      html += '<button class="tarjeta tarjeta--plana continuar" data-curso="' + cont.c.id + '" data-leccion="' + cont.l + '"><span class="continuar__eti">Continuar donde te quedaste</span><span class="continuar__tit">' + esc(cont.c.titulo) + ' · Lección ' + cont.l + ': ' + esc(lec.titulo) + '</span>' + barra(cont.a) + '</button>';
    }
    for (var j = 0; j < cursosCache.length; j++) {
      var cu = cursosCache[j], av = avance(cu, p);
      var pc = PORTADA[cu.id] || ['billetera', 'jade'];
      html += '<button class="tarjeta curso" data-curso="' + cu.id + '">' +
        '<span class="portada portada--' + pc[1] + '" aria-hidden="true">' + ico(pc[0]) + '<span class="portada__num">' + (j + 1) + '</span></span><span class="curso__cuerpo">' +
        '<span class="curso__titulo">' + esc(cu.titulo) + '</span>' +
        '<span class="curso__meta">' + cu.lecciones.length + ' lecciones · ' + esc(cu.nivel.toLowerCase()) + (cu.premium ? ' · premium' : '') + '</span>' +
        '<span class="curso__desc">' + esc(cu.descripcion) + '</span>' + etiquetaPatrocinio(cu.patrocinio) +
        barra(av) + '<span class="curso__avance">' + (av.hechas === av.total ? 'Curso terminado' : av.hechas + ' de ' + av.total + ' lecciones') + '</span></span></button>';
    }
    html += '<p class="texto-2 mt-lg">Por ' + esc(autorCursos) + '. Información educativa, no asesoría financiera.</p>';
    pintarAprende(html);
    var bs = document.querySelectorAll('#aprende-vista [data-curso]');
    for (var k = 0; k < bs.length; k++) bs[k].addEventListener('click', function () {
      var cid = this.getAttribute('data-curso'), lid = this.getAttribute('data-leccion');
      if (lid) vistaLeccion(cid, lid); else vistaCurso(cid);
    });
  }

  function vistaCurso(cid) {
    var c = cursoPorId(cid), p = leerProgreso(), a = avance(c, p);
    var html = '<button class="volver" id="volver-cursos">' + ico('atras') + 'Todos los cursos</button>' +
      '<div class="portada portada--' + (PORTADA[c.id] || ['', 'jade'])[1] + ' curso-cabecera" aria-hidden="true">' + ico((PORTADA[c.id] || ['billetera'])[0]) + '</div>' +
      '<h1 class="titulo-pagina">' + esc(c.titulo) + '</h1><p class="texto-2">' + esc(c.descripcion) + '</p>' + etiquetaPatrocinio(c.patrocinio) +
      '<div class="mt-md">' + barra(a) + '<div class="curso__avance">' + a.hechas + ' de ' + a.total + ' lecciones terminadas</div></div>' +
      '<div class="filas lecciones mt-md">';
    for (var i = 0; i < c.lecciones.length; i++) {
      var l = c.lecciones[i], hecha = p[c.id] && p[c.id].lecciones && p[c.id].lecciones[l.id] && p[c.id].lecciones[l.id].terminada;
      html += '<button class="leccion-item' + (hecha ? ' leccion-item--hecha' : '') + '" data-leccion="' + l.id + '"><span class="leccion-item__num">' + (hecha ? ico('check') + '<span class="visualmente-oculto">Terminada: </span>' : l.id) + '</span><span class="leccion-item__cuerpo"><span class="leccion-item__tit">' + esc(l.titulo) + '</span><span class="meta">' + l.duracion + ' min' + (l.video ? ' · con video' : ' · texto') + '</span></span>' + ico('adelante') + '</button>';
    }
    html += '</div><button class="btn-principal mt-md" id="btn-empezar">' + (a.hechas === 0 ? 'Empezar el curso' : a.hechas === a.total ? 'Repasar desde el inicio' : 'Continuar: lección ' + siguiente(c, p)) + '</button>';
    pintarAprende(html);
    document.getElementById('volver-cursos').addEventListener('click', vistaCursos);
    document.getElementById('btn-empezar').addEventListener('click', function () { vistaLeccion(cid, a.hechas === a.total ? c.lecciones[0].id : siguiente(c, p)); });
    var bs = document.querySelectorAll('#aprende-vista [data-leccion]');
    for (var k = 0; k < bs.length; k++) bs[k].addEventListener('click', function () { vistaLeccion(cid, this.getAttribute('data-leccion')); });
  }

  function vistaBloqueo(c) {
    pintarAprende('<button class="volver" id="volver-curso">' + ico('atras') + esc(c.titulo) + '</button>' +
      '<h1 class="titulo-pagina">' + esc(c.titulo) + '</h1><p class="meta mb-md">Curso premium</p>' +
      '<div class="tarjeta"><p>Este curso es de pago. Incluye las ' + c.lecciones.length + ' lecciones completas, el repaso y tu avance guardado.</p>' +
      (premiumCfg.precio ? '<div class="calc__grande mt-sm">' + esc(premiumCfg.precio) + '</div>' : '') +
      (premiumCfg.urlPago ? '<a class="btn-principal mt-md" href="' + esc(premiumCfg.urlPago) + '" target="_blank" rel="noopener">Pagar y recibir mi código</a>' : '') +
      '<p class="texto-2 mt-md">Al pagar recibes un código por correo o WhatsApp.' + (premiumCfg.contacto ? ' Dudas: ' + esc(premiumCfg.contacto) : '') + '</p></div>' +
      '<div class="tarjeta mt-md"><label class="campo"><span>Ya pagué: escribe tu código</span><input type="text" id="codigo-premium" autocomplete="off" autocapitalize="characters"></label>' +
      '<button class="btn-principal mt-md" id="btn-codigo">Desbloquear</button><div class="texto-2 mt-sm" id="codigo-estado"></div></div>');
    document.getElementById('volver-curso').addEventListener('click', function () { vistaCurso(c.id); });
    document.getElementById('btn-codigo').addEventListener('click', function () {
      var cod = document.getElementById('codigo-premium').value, est = document.getElementById('codigo-estado');
      est.textContent = 'Verificando…';
      fetch('/api/premium/verificar', { method: 'POST', body: cod }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.ok) { var u = desbloqueados(); u[c.id] = true; try { localStorage.setItem('quetzal-hoy:premium', JSON.stringify(u)); } catch (e) {} est.textContent = 'Listo, curso desbloqueado.'; vistaCurso(c.id); }
        else est.textContent = 'Código no válido. Revisa mayúsculas y guiones.';
      }).catch(function () { est.textContent = 'No se pudo verificar. Inténtalo con conexión.'; });
    });
  }

  function vistaLeccion(cid, lid) {
    var c = cursoPorId(cid), l = leccionPorId(c, lid), p = leerProgreso();
    if (cursoBloqueado(c)) { vistaBloqueo(c); return; }
    if (!p[cid] || !p[cid].ultima) evento('curso_iniciado');
    p[cid] = p[cid] || { lecciones: {} }; p[cid].lecciones = p[cid].lecciones || {}; p[cid].ultima = lid; guardarProgreso(p);
    var idx = c.lecciones.indexOf(l), sig = c.lecciones[idx + 1];
    var video = l.video ? '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(l.video) + '" title="Video de la lección" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>' : '';
    var quiz = '<div class="quiz mt-lg"><h2 class="leccion__h">Repaso rápido</h2>';
    for (var i = 0; i < l.preguntas.length; i++) {
      var q = l.preguntas[i];
      quiz += '<fieldset class="quiz__p" data-i="' + i + '"><legend>' + (i + 1) + '. ' + esc(q.p) + '</legend>';
      for (var j = 0; j < q.opciones.length; j++) quiz += '<label class="quiz__op"><input type="radio" name="q' + i + '" value="' + j + '"><span>' + esc(q.opciones[j]) + '</span></label>';
      quiz += '<p class="quiz__exp" hidden></p></fieldset>';
    }
    quiz += '<button class="btn-principal" id="btn-revisar">Revisar respuestas</button><div id="quiz-resultado" class="mt-sm"></div></div>';
    var html = '<button class="volver" id="volver-curso">' + ico('atras') + esc(c.titulo) + '</button>' +
      '<p class="meta">Lección ' + l.id + ' de ' + c.lecciones.length + ' · ' + l.duracion + ' min de lectura</p>' +
      '<h1 class="titulo-pagina mt-sm">' + esc(l.titulo) + '</h1>' + video +
      '<div class="leccion">' + renderTexto(l.texto) + '</div>' + quiz +
      '<div class="leccion__nav mt-lg">' + (sig ? '<button class="btn-secundario" id="btn-siguiente"><span>Siguiente: ' + esc(sig.titulo) + '</span>' + ico('adelante') + '</button>' : '<button class="btn-secundario" id="btn-siguiente">Volver al curso</button>') + '</div>';
    pintarAprende(html);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('volver-curso').addEventListener('click', function () { vistaCurso(cid); });
    document.getElementById('btn-siguiente').addEventListener('click', function () { if (sig) vistaLeccion(cid, sig.id); else vistaCurso(cid); });
    document.getElementById('btn-revisar').addEventListener('click', function () {
      var aciertos = 0, faltan = 0;
      for (var i = 0; i < l.preguntas.length; i++) {
        var sel = document.querySelector('input[name="q' + i + '"]:checked'), fs = document.querySelector('.quiz__p[data-i="' + i + '"]'), exp = fs.querySelector('.quiz__exp');
        if (!sel) { faltan++; continue; }
        var ok = parseInt(sel.value, 10) === l.preguntas[i].respuesta;
        if (ok) aciertos++;
        fs.classList.remove('quiz__p--ok', 'quiz__p--mal'); fs.classList.add(ok ? 'quiz__p--ok' : 'quiz__p--mal');
        exp.innerHTML = ico(ok ? 'check' : 'x') + '<span>' + esc((ok ? 'Correcto. ' : 'La respuesta es: ' + l.preguntas[i].opciones[l.preguntas[i].respuesta] + '. ') + l.preguntas[i].explicacion) + '</span>'; exp.hidden = false;
      }
      var res = document.getElementById('quiz-resultado');
      if (faltan) { res.innerHTML = '<span class="texto-2">Te falta responder ' + faltan + (faltan === 1 ? ' pregunta.' : ' preguntas.') + '</span>'; return; }
      var pr = leerProgreso(); pr[cid] = pr[cid] || { lecciones: {} }; pr[cid].lecciones = pr[cid].lecciones || {};
      pr[cid].lecciones[lid] = { terminada: true, aciertos: aciertos, fecha: new Date().toISOString().slice(0, 10) }; pr[cid].ultima = lid;
      var guardado = guardarProgreso(pr);
      if (avance(c, pr).hechas === c.lecciones.length) evento('curso_terminado');
      res.innerHTML = '<div class="quiz__final">' + aciertos + ' de ' + l.preguntas.length + ' correctas. Lección terminada' + (guardado ? '.' : ' (no se pudo guardar el avance en este celular).') + '</div>';
    });
  }

  var autorCursos = 'Leo Marín';
  function pintarAprende(html) { document.getElementById('aprende-vista').innerHTML = html; }
  fetch('/api/cursos').then(function (r) { return r.json(); }).then(function (d) { cursosCache = d.cursos; premiumCfg = d.premium || premiumCfg; autorCursos = d.autor || autorCursos; vistaCursos(); })
    .catch(function () { pintarAprende('<h1 class="titulo-pagina">Aprende</h1><p class="texto-2">No pudimos cargar los cursos. Inténtalo de nuevo con conexión.</p>'); });

  fetch('/api/tipo-cambio')
    .then(function (r) { return r.json(); })
    .then(pintarTipoCambio)
    .catch(function () { pintarTipoCambio(null); });

  // ─── Instalación: botón automático si el navegador lo ofrece; si no, pasos según el teléfono ───
  var instalar = document.getElementById('instalar');
  var btnInstalar = document.getElementById('btn-instalar');
  var pasosInstalar = document.getElementById('instalar-pasos');
  var installEvent = null;
  function yaInstalada() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true || location.search.indexOf('source=pwa') >= 0 || location.search.indexOf('source=twa') >= 0;
  }
  function instalacionOculta() { try { return localStorage.getItem('quetzal-hoy:instalar') === 'no'; } catch (e) { return false; } }
  function pasosSegunTelefono() {
    var ua = navigator.userAgent || '';
    var iOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (iOS) {
      var safari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
      return (safari ? [] : ['Abre esta página en <strong>Safari</strong> (en otros navegadores de iPhone no se puede instalar).']).concat([
        'Toca el botón <strong>Compartir</strong> ' + ico('compartirIos') + ' (el cuadrado con la flecha hacia arriba, abajo en el centro).',
        'Baja en la lista y toca <strong>"Agregar a pantalla de inicio"</strong>.',
        'Toca <strong>Agregar</strong>. El ícono verde queda en tu pantalla.'
      ]);
    }
    if (/Android/i.test(ua)) {
      var chrome = /Chrome/i.test(ua) && !/EdgA|OPR|SamsungBrowser/i.test(ua);
      return [
        'Toca el menú ' + ico('menu') + ' (los tres puntos, arriba a la derecha' + (chrome ? '' : ' de Chrome') + ').',
        'Toca <strong>"Agregar a pantalla principal"</strong> o <strong>"Instalar app"</strong>.',
        'Confirma con <strong>Instalar</strong>. El ícono verde queda en tu pantalla.'
      ];
    }
    return ['En el celular, abre <strong>hoy.compoundclub.fyi</strong> y usa "Agregar a pantalla de inicio" del menú del navegador.'];
  }
  function mostrarInstalar() {
    if (yaInstalada() || instalacionOculta()) return;
    if (installEvent) { btnInstalar.hidden = false; pasosInstalar.hidden = true; }
    else { pasosInstalar.innerHTML = pasosSegunTelefono().map(function (p) { return '<li>' + p + '</li>'; }).join(''); pasosInstalar.hidden = false; btnInstalar.hidden = true; }
    instalar.hidden = false;
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    mostrarInstalar();
  });
  btnInstalar.addEventListener('click', function () {
    if (!installEvent) return;
    installEvent.prompt();
    installEvent.userChoice.then(function (r) { if (r && r.outcome === 'accepted') instalar.hidden = true; });
  });
  document.getElementById('btn-instalar-cerrar').addEventListener('click', function () {
    instalar.hidden = true;
    try { localStorage.setItem('quetzal-hoy:instalar', 'no'); } catch (e) {}
  });
  window.addEventListener('appinstalled', function () { instalar.hidden = true; });
  // Si en 2 s el navegador no ofreció instalar, mostramos los pasos manuales
  setTimeout(mostrarInstalar, 2000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();
