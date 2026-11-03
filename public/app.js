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

  // ─── Fecha en el encabezado ───
  var hoy = new Date();
  document.getElementById('fecha-hoy').textContent = hoy.toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' });

  // ─── Pestañas ───
  window.cambiarTab = function (tab, btn) {
    var secs = document.querySelectorAll('.seccion');
    for (var i = 0; i < secs.length; i++) secs[i].classList.remove('activa');
    var btns = document.querySelectorAll('.nav-btn');
    for (var j = 0; j < btns.length; j++) { btns[j].classList.remove('activo'); btns[j].setAttribute('aria-selected', 'false'); }
    document.getElementById('tab-' + tab).classList.add('activa');
    btn.classList.add('activo');
    btn.setAttribute('aria-selected', 'true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Gráfica SVG ───
  function graficaSvg(serie) {
    var W = 320, H = 120, PX = 4, PY = 10;
    if (!serie || serie.length < 2) return '<p class="texto-suave">Sin datos suficientes para la gráfica.</p>';
    var min = Infinity, max = -Infinity;
    for (var i = 0; i < serie.length; i++) { min = Math.min(min, serie[i].valor); max = Math.max(max, serie[i].valor); }
    if (max - min < 0.01) { max += 0.005; min -= 0.005; }
    var pts = [];
    for (var k = 0; k < serie.length; k++) {
      var x = PX + (k / (serie.length - 1)) * (W - PX * 2);
      var y = PY + (1 - (serie[k].valor - min) / (max - min)) * (H - PY * 2);
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    var linea = pts.join(' ');
    var area = 'M' + pts[0] + ' L' + pts.join(' L') + ' L' + (W - PX) + ',' + H + ' L' + PX + ',' + H + ' Z';
    var ultimo = pts[pts.length - 1].split(',');
    return (
      '<svg class="grafica" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfica del tipo de cambio">' +
      '<path class="grafica__area" d="' + area + '"/>' +
      '<polyline class="grafica__linea" points="' + linea + '"/>' +
      '<circle class="grafica__punto" cx="' + ultimo[0] + '" cy="' + ultimo[1] + '" r="3.5"/>' +
      '</svg>' +
      '<div class="grafica__ejes"><span>' + fechaMini(serie[0].fecha) + '</span>' +
      '<span>mín ' + min.toFixed(2) + ' · máx ' + max.toFixed(2) + '</span>' +
      '<span>' + fechaMini(serie[serie.length - 1].fecha) + '</span></div>'
    );
  }

  // ─── Tarjeta de tipo de cambio ───
  function pintarTipoCambio(d) {
    var card = document.getElementById('card-tipo-cambio');
    if (!d || !d.disponible) {
      card.innerHTML =
        '<div class="tarjeta__titulo">Tipo de cambio del dólar</div>' +
        '<p class="texto-suave mt-sm">No pudimos cargar el dato. Consúltalo en <a href="https://www.banguat.gob.gt" target="_blank" rel="noopener">banguat.gob.gt</a>.</p>';
      return;
    }
    var flecha = d.tendencia === 'sube' ? '▲' : d.tendencia === 'baja' ? '▼' : '=';
    var textoCambio = d.ayer
      ? (d.tendencia === 'igual' ? 'Igual que ayer' : (d.cambio > 0 ? '+' : '') + d.cambio.toFixed(4) + ' vs. ayer (' + d.ayer.valor.toFixed(4) + ')')
      : '';
    var esHoy = d.fecha === new Date().toISOString().slice(0, 10);
    var avisoFecha = esHoy ? '' : '<p class="aviso-viejo">Último dato disponible: ' + fechaCorta(d.fecha) + '. Aún no hay dato de hoy.</p>';

    card.innerHTML =
      '<div class="tarjeta__titulo">Tipo de cambio del dólar</div>' +
      '<div class="tc__fila"><div class="tarjeta__valor">' + q(d.valor, 4) + '</div>' +
      '<div class="tc__cambio tc__cambio--' + d.tendencia + '">' + flecha + ' ' + esc(textoCambio) + '</div></div>' +
      '<div class="tarjeta__sub">por 1 dólar · ' + fechaCorta(d.fecha) + '</div>' +
      avisoFecha +
      '<div class="rangos" role="tablist" aria-label="Rango de la gráfica">' +
      '<button class="rango activo" data-r="7d">7 días</button>' +
      '<button class="rango" data-r="1m">1 mes</button>' +
      '<button class="rango" data-r="1a">1 año</button></div>' +
      '<div id="grafica-tc">' + graficaSvg(d.series['7d']) + '</div>' +
      '<div class="fuente-dato">Fuente: ' + esc(d.fuente) + ', ' + fechaCorta(d.fecha) + '. Dato de referencia; el oficial está en <a href="' + esc(d.fuenteUrl) + '" target="_blank" rel="noopener">banguat.gob.gt</a>.</div>';

    var botones = card.querySelectorAll('.rango');
    for (var i = 0; i < botones.length; i++) {
      botones[i].addEventListener('click', function () {
        for (var j = 0; j < botones.length; j++) botones[j].classList.remove('activo');
        this.classList.add('activo');
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
    document.getElementById('convertidor-nota').textContent = 'Con el tipo de cambio de referencia del ' + fechaCorta(fecha) + ' (' + q(tasa, 4) + '). Los bancos y remesadoras usan su propia tasa; puede variar.';

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

  function valorIndicador(clave, d) {
    if (clave === 'inflacion') return d.valor.toFixed(2) + '%';
    if (clave === 'tasa-lider') return d.valor.toFixed(2) + '%';
    if (clave === 'remesas') return '$' + d.valor.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' M';
    if (clave === 'combustibles') return q(d.regular, 2);
    if (clave === 'canasta-basica') return q(d.urbana, 2);
    return String(d.valor);
  }

  function detalleIndicador(clave, d) {
    if (clave === 'inflacion') return 'Acumulada en el año: ' + d.acumulada.toFixed(2) + '% · del mes: ' + d.mensual.toFixed(2) + '%';
    if (clave === 'remesas') return 'Acumulado del año: $' + d.acumuladoAnio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' millones (' + ((d.acumuladoAnio / d.acumuladoAnioAnterior - 1) * 100).toFixed(1) + '% más que el año pasado)';
    if (clave === 'combustibles') return 'Superior ' + q(d.superior, 2) + ' · Diésel ' + q(d.diesel, 2) + ' por galón';
    if (clave === 'canasta-basica') return 'Área rural: ' + q(d.rural, 2) + ' por persona al mes';
    if (clave === 'tasa-lider') return 'Sin cambios desde febrero de 2026';
    return '';
  }

  function pintarIndicadores(resp) {
    var cont = document.getElementById('lista-indicadores');
    if (!resp || !resp.indicadores) { cont.innerHTML = '<p class="texto-suave">No pudimos cargar los indicadores.</p>'; return; }
    var html = '';
    for (var i = 0; i < ORDEN.length; i++) {
      var clave = ORDEN[i];
      var d = resp.indicadores[clave];
      if (!d) continue;
      html +=
        '<div class="tarjeta indicador">' +
        '<div class="indicador__fila"><div>' +
        '<div class="tarjeta__titulo">' + esc(d.nombre) + '</div>' +
        '<div class="indicador__valor">' + valorIndicador(clave, d) + '</div>' +
        (d.unidad === '%' ? '' : '<div class="tarjeta__sub">' + esc(d.unidad) + '</div>') +
        '</div>' +
        (d.viejo ? '<span class="badge badge--viejo">' + esc(d.etiqueta) + '</span>' : '<span class="badge badge--periodo">' + esc(/^[A-Za-zñ]+ \d{4}$/.test(d.periodo) ? d.periodo : fechaCorta(d.fecha)) + '</span>') +
        '</div>' +
        '<p class="indicador__detalle">' + esc(detalleIndicador(clave, d)) + '</p>' +
        '<details class="significa"><summary>¿Qué significa esto?</summary><p>' + esc(d.significado) + '</p></details>' +
        '<div class="fuente-dato">Fuente: <a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.fuente) + '</a>, ' + fechaCorta(d.fecha) + '.</div>' +
        '</div>';
    }
    cont.innerHTML = html;
  }

  function pintarDatoDelDia(resp) {
    var card = document.getElementById('card-dato-del-dia');
    if (!resp || !resp.dato) { card.innerHTML = '<div class="tarjeta__titulo">Dato del día</div><p class="texto-suave">Hoy no hay dato disponible.</p>'; return; }
    var d = resp.dato;
    card.innerHTML =
      '<div class="tarjeta__titulo">Dato del día</div>' +
      '<div class="dato__titulo">' + esc(d.titulo) + '</div>' +
      '<p class="dato__texto">' + esc(d.texto) + '</p>' +
      '<div class="fuente-dato">Calculado con datos de ' + esc(d.fuente) + '.</div>';
  }

  fetch('/api/indicadores').then(function (r) { return r.json(); }).then(pintarIndicadores).catch(function () { pintarIndicadores(null); });
  fetch('/api/dato-del-dia').then(function (r) { return r.json(); }).then(pintarDatoDelDia).catch(function () { pintarDatoDelDia(null); });

  fetch('/api/tipo-cambio')
    .then(function (r) { return r.json(); })
    .then(pintarTipoCambio)
    .catch(function () { pintarTipoCambio(null); });

  // ─── PWA: botón de instalación ───
  var installEvent = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    var btn = document.getElementById('btn-instalar');
    btn.classList.add('visible');
    btn.addEventListener('click', function () {
      installEvent.prompt();
      installEvent.userChoice.then(function () { btn.classList.remove('visible'); });
    });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();
