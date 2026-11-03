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


  // ─── Noticias ───
  function tarjetaNoticia(n) {
    var auto = n.resumen ? '<span class="badge badge--auto">Resumen automático</span>' : '';
    return (
      '<article class="tarjeta noticia">' +
      '<div class="noticia__medio">' + esc(n.medio) + (n.fecha ? ' · ' + fechaCorta(n.fecha.slice(0, 10)) : '') + '</div>' +
      '<h3 class="noticia__titulo"><a href="' + esc(n.enlace) + '" target="_blank" rel="noopener">' + esc(n.titulo) + '</a></h3>' +
      (n.resumen ? '<p class="noticia__resumen">' + esc(n.resumen) + '</p>' : '') +
      (n.afecta ? '<p class="noticia__afecta"><strong>¿Cómo te afecta?</strong> ' + esc(n.afecta) + '</p>' : '') +
      '<div class="noticia__pie">' + auto + '<a class="noticia__leer" href="' + esc(n.enlace) + '" target="_blank" rel="noopener">Leer en ' + esc(n.medio) + ' →</a></div>' +
      '</article>'
    );
  }

  function pintarNoticias(resp) {
    var cont = document.getElementById('noticias-contenido');
    var fecha = document.getElementById('noticias-fecha');
    if (!resp || !resp.disponible) {
      fecha.textContent = '';
      cont.innerHTML = '<div class="pronto"><div class="pronto__icono" aria-hidden="true">📰</div><div class="pronto__titulo">Aún no hay noticias de hoy</div><p class="pronto__desc">Las noticias se preparan cada mañana a las 6:00. Vuelve en un rato.</p></div>';
      return;
    }
    fecha.textContent = 'Resumen del ' + fechaCorta(resp.fecha);
    var html = '';
    if (resp.guatemala && resp.guatemala.length) {
      html += '<h2 class="subtitulo">Guatemala</h2>';
      for (var i = 0; i < resp.guatemala.length; i++) html += tarjetaNoticia(resp.guatemala[i]);
    }
    if (resp.mundo && resp.mundo.length) {
      html += '<h2 class="subtitulo mt-lg">Mundo</h2>';
      for (var j = 0; j < resp.mundo.length; j++) html += tarjetaNoticia(resp.mundo[j]);
    }
    cont.innerHTML = html || '<p class="texto-suave">Hoy no encontramos noticias económicas.</p>';
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
  function riesgoClase(r) { return r.indexOf('alto') >= 0 ? 'alto' : r.indexOf('medio') >= 0 ? 'medio' : 'bajo'; }

  function pintarOpciones(tipos) {
    var html = '';
    for (var i = 0; i < tipos.length; i++) {
      var t = tipos[i];
      html +=
        '<details class="tarjeta opcion">' +
        '<summary class="opcion__cab"><span class="opcion__nombre">' + esc(t.nombre) + '</span><span class="badge badge--riesgo-' + riesgoClase(t.riesgo) + '">Riesgo ' + esc(t.riesgo) + '</span></summary>' +
        '<p class="opcion__que">' + esc(t.queEs) + '</p>' +
        '<dl class="opcion__datos">' +
        '<dt>Desde</dt><dd>' + esc(t.desde) + '</dd>' +
        '<dt>Plazo</dt><dd>' + esc(t.plazo) + '</dd>' +
        '<dt>Riesgo</dt><dd>' + esc(t.riesgoExplicado) + '</dd>' +
        '<dt>Liquidez</dt><dd>' + esc(t.liquidez) + '</dd>' +
        '<dt>Quién supervisa</dt><dd>' + esc(t.supervisa) + '</dd>' +
        '</dl>' +
        '<div class="opcion__pc"><div><strong>A favor</strong><ul>' + t.pros.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>' +
        '<div><strong>En contra</strong><ul>' + t.contras.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div></div>' +
        '</details>';
    }
    document.getElementById('lista-opciones').innerHTML = html;
  }

  function filaTasa(f, colMonto) {
    var tasa = f.tasa === null ? '<span class="tasa tasa--na">Consultar con la entidad</span>' : '<span class="tasa">' + pct(f.tasa) + '</span><span class="tasa__tipo">' + esc(f.tipoTasa || '') + '</span>';
    return (
      '<div class="fila-tasa">' +
      '<div class="fila-tasa__ent"><strong>' + esc(f.entidad) + '</strong><span class="texto-suave">' + esc(f.producto) + (f[colMonto] && f[colMonto] !== '—' ? ' · ' + esc(f[colMonto]) : '') + '</span>' +
      '<span class="fila-tasa__fuente">' + fechaCorta(f.fecha) + ' · <a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.fuente) + '</a></span></div>' +
      '<div class="fila-tasa__val">' + tasa + '</div>' +
      '</div>'
    );
  }

  function pintarTasas(d) {
    document.getElementById('tasas-nota').textContent = d.tasasPlazoFijo.nota;
    var filas = d.tasasPlazoFijo.filas.slice().sort(function (a, b) { return (b.tasa || -1) - (a.tasa || -1); });
    document.getElementById('tabla-plazo-fijo').innerHTML = '<div class="tarjeta tabla-tasas">' + filas.map(function (f) { return filaTasa(f, 'monto'); }).join('') + '</div>';
    document.getElementById('ahorro-nota').textContent = d.tasasAhorro.nota;
    var ah = d.tasasAhorro.filas.slice().sort(function (a, b) { return b.tasa - a.tasa; });
    document.getElementById('tabla-ahorro').innerHTML = '<div class="tarjeta tabla-tasas">' + ah.map(function (f) { return filaTasa(f, 'saldo'); }).join('') + '</div>';
    var ref = d.referencia.tasaPromedioPlazo;
    document.getElementById('isr-nota').innerHTML = esc(d.avisoIsr) + ' Referencia: el promedio de todos los depósitos a plazo del sistema fue ' + pct(ref.valor) + ' en ' + esc(ref.periodo.toLowerCase()) + ' (<a href="' + esc(ref.url) + '" target="_blank" rel="noopener">' + esc(ref.fuente) + '</a>); ' + esc(ref.nota);
  }

  function pintarBonos(b) {
    var plazos = b.plazos.map(function (p) { return '<div class="bono"><span class="bono__plazo">' + p.anios + (p.anios === 1 ? ' año' : ' años') + '</span><span class="bono__tasa">' + pct(p.tasa) + '</span><span class="texto-suave">vence ' + fechaCorta(p.vence) + '</span></div>'; }).join('');
    document.getElementById('card-bonos').innerHTML =
      '<div class="tarjeta">' +
      '<div class="bonos">' + plazos + '</div>' +
      '<dl class="opcion__datos mt-md">' +
      '<dt>Mínimo</dt><dd>' + q(b.minimo) + ', luego múltiplos de ' + q(b.multiplo) + '; máximo ' + q(b.maximoAnual) + ' al año</dd>' +
      '<dt>Intereses</dt><dd>' + esc(b.pagoIntereses) + ', ' + esc(b.impuestos) + '</dd>' +
      '<dt>Cómo se compran</dt><dd>' + esc(b.comoComprar) + '</dd>' +
      '</dl>' +
      '<div class="fuente-dato">Fuente: <a href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(b.fuente) + '</a>, ' + fechaCorta(b.fecha) + '. Las tasas son de la emisión de abril de 2026; cada emisión puede cambiar. Información oficial en <a href="' + esc(b.urlOficial) + '" target="_blank" rel="noopener">minfin.gob.gt</a>.</div>' +
      '</div>';
  }

  function pintarEstafas(n) {
    document.getElementById('lista-estafas').innerHTML = n.senales.map(function (s) {
      return '<div class="tarjeta alerta"><div class="alerta__titulo">' + esc(s.titulo) + '</div><p>' + esc(s.texto) + '</p></div>';
    }).join('');
    document.getElementById('lista-verificar').innerHTML = '<div class="tarjeta"><ol class="verificar">' + n.verificar.map(function (v) {
      return '<li>' + esc(v.texto) + ' <a href="' + esc(v.enlace) + '" target="_blank" rel="noopener">' + esc(v.etiqueta) + ' →</a></li>';
    }).join('') + '</ol></div>';
  }

  // Calculadoras (misma lógica que src/calculadoras.js)
  function num(id) { var v = parseFloat(String(document.getElementById(id).value).replace(',', '.')); return isFinite(v) && v >= 0 ? v : null; }
  function calcAhorro() {
    var a = num('c1-aporte'), t = num('c1-tasa'), m = num('c1-meses'), i = num('c1-inicial');
    var out = document.getElementById('c1-resultado');
    if (a === null || t === null || m === null || i === null || m < 1) { out.textContent = 'Revisa los números.'; return; }
    var r = t / 100 / 12, n = Math.floor(m), f = Math.pow(1 + r, n);
    var total = r === 0 ? i + a * n : i * f + a * ((f - 1) / r);
    var aportado = i + a * n;
    out.innerHTML = '<div class="calc__grande">' + q(total, 2) + '</div><div class="texto-suave">Tú pones ' + q(aportado, 2) + ' y el interés agrega ' + q(total - aportado, 2) + ' en ' + n + ' meses (antes del ISR).</div>';
  }
  function calcPlazo() {
    var m = num('c2-monto'), t = num('c2-tasa'), d = parseInt(document.getElementById('c2-dias').value, 10);
    var out = document.getElementById('c2-resultado');
    if (m === null || t === null) { out.textContent = 'Revisa los números.'; return; }
    var interes = m * (t / 100) * (d / 365), isr = interes * 0.1;
    out.innerHTML = '<div class="calc__grande">' + q(m + interes - isr, 2) + '</div><div class="texto-suave">Interés ' + q(interes, 2) + ' menos 10% de ISR (' + q(isr, 2) + ') = ' + q(interes - isr, 2) + ' netos en ' + d + ' días.</div>';
  }
  function calcInflacion() {
    var m = num('c3-monto'), a = num('c3-anios'), i = num('c3-inflacion');
    var out = document.getElementById('c3-resultado');
    if (m === null || a === null || i === null) { out.textContent = 'Revisa los números.'; return; }
    var real = m / Math.pow(1 + i / 100, a);
    out.innerHTML = '<div class="calc__grande calc__grande--rojo">−' + q(m - real, 2) + '</div><div class="texto-suave">Tus ' + q(m) + ' seguirán siendo ' + q(m) + ', pero comprarán lo que hoy compras con ' + q(real, 2) + '. Pierdes ' + pct((1 - real / m) * 100) + ' de poder de compra en ' + a + (a === 1 ? ' año' : ' años') + '.</div>';
  }
  function calcMeta() {
    var meta = num('c4-meta'), m = num('c4-meses'), t = num('c4-tasa'), i = num('c4-inicial');
    var out = document.getElementById('c4-resultado');
    if (meta === null || m === null || t === null || i === null || m < 1) { out.textContent = 'Revisa los números.'; return; }
    var r = t / 100 / 12, n = Math.floor(m), f = Math.pow(1 + r, n);
    var faltante = meta - i * f;
    if (faltante <= 0) { out.innerHTML = '<div class="calc__grande">Q 0.00 al mes</div><div class="texto-suave">Con lo que ya tienes llegas a la meta.</div>'; return; }
    var aporte = r === 0 ? faltante / n : faltante * r / (f - 1);
    out.innerHTML = '<div class="calc__grande">' + q(aporte, 2) + ' al mes</div><div class="texto-suave">Durante ' + n + ' meses para llegar a ' + q(meta) + '. El interés pone ' + q(meta - i - aporte * n, 2) + '.</div>';
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
    document.getElementById('lista-opciones').innerHTML = '<p class="texto-suave">No pudimos cargar la información.</p>';
  });

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
