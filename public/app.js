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
  document.getElementById('fecha-hoy').textContent = hoy.toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' });

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
      '<div class="rangos" role="group" aria-label="Rango de la gráfica">' +
      '<button class="rango activo" data-r="7d">7 días</button>' +
      '<button class="rango" data-r="1m">1 mes</button>' +
      '<button class="rango" data-r="1a">1 año</button></div>' +
      '<div id="grafica-tc">' + graficaSvg(d.series['7d']) + '</div>' +
      '<div class="fuente-dato">Fuente: ' + esc(d.fuente) + ', ' + fechaCorta(d.fecha) + '. Dato de referencia; el oficial está en <a href="' + esc(d.fuenteUrl) + '" target="_blank" rel="noopener">banguat.gob.gt</a>.</div>' +
      '<button class="btn-compartir" id="btn-compartir-tc">Compartir ↗</button>';

    document.getElementById('btn-compartir-tc').addEventListener('click', function () {
      compartir('Dólar hoy en Guatemala', 'Dólar hoy: ' + q(d.valor, 4) + (d.ayer ? ' (' + flecha + ' ' + Math.abs(d.cambio).toFixed(4) + ' vs. ayer)' : '') + ' · Referencia Banguat, ' + fechaCorta(d.fecha), 'https://hoy.compoundclub.fyi/');
    });
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
  var ICONO = { inflacion: '📈', 'tasa-lider': '🏦', remesas: '💸', combustibles: '⛽', 'canasta-basica': '🧺' };

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
        '<div class="tarjeta indicador indicador--' + clave + '">' +
        '<div class="indicador__fila"><div class="indicador__izq"><span class="indicador__icono" aria-hidden="true">' + (ICONO[clave] || '•') + '</span><div>' +
        '<div class="tarjeta__titulo">' + esc(d.nombre) + '</div>' +
        '<div class="indicador__valor">' + valorIndicador(clave, d) + '</div>' +
        (d.unidad === '%' ? '' : '<div class="tarjeta__sub">' + esc(d.unidad) + '</div>') +
        '</div></div>' +
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
      '<div class="dato__cab"><span class="dato__icono" aria-hidden="true">💡</span><div class="tarjeta__titulo">Dato del día</div></div>' +
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
      '<div class="noticia__pie">' + auto + '<span class="noticia__acciones"><button class="btn-compartir btn-compartir--mini" data-compartir="1" data-titulo="' + esc(n.titulo) + '" data-medio="' + esc(n.medio) + '" data-enlace="' + esc(n.enlace) + '">Compartir ↗</button><a class="noticia__leer" href="' + esc(n.enlace) + '" target="_blank" rel="noopener">Leer en ' + esc(n.medio) + ' →</a></span></div>' +
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
    var bc = cont.querySelectorAll('[data-compartir]');
    for (var k = 0; k < bc.length; k++) bc[k].addEventListener('click', function () {
      compartir(this.getAttribute('data-titulo'), this.getAttribute('data-titulo') + ' (' + this.getAttribute('data-medio') + ') — vía Quetzal Hoy', this.getAttribute('data-enlace'));
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

  function enlaceAfiliado(a) {
    if (!a || !a.url) return '';
    return '<a class="btn-afiliado" href="' + esc(a.url) + '" target="_blank" rel="sponsored noopener">' + esc(a.texto || 'Abrir cuenta') + ' ↗ <span class="eti-patro">Enlace patrocinado</span></a>';
  }
  function filaTasa(f, colMonto) {
    var tasa = f.tasa === null ? '<span class="tasa tasa--na">Consultar con la entidad</span>' : '<span class="tasa">' + pct(f.tasa) + '</span><span class="tasa__tipo">' + esc(f.tipoTasa || '') + '</span>';
    return (
      '<div class="fila-tasa">' +
      '<div class="fila-tasa__ent"><strong>' + esc(f.entidad) + '</strong><span class="texto-suave">' + esc(f.producto) + (f[colMonto] && f[colMonto] !== '—' ? ' · ' + esc(f[colMonto]) : '') + '</span>' +
      '<span class="fila-tasa__fuente">' + fechaCorta(f.fecha) + ' · <a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.fuente) + '</a></span>' + enlaceAfiliado(f.afiliado) + '</div>' +
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

  function barra(a) { return '<div class="barra" role="progressbar" aria-valuenow="' + a.pct + '" aria-valuemin="0" aria-valuemax="100"><div class="barra__relleno" style="width:' + a.pct + '%"></div></div>'; }

  function vistaCursos() {
    var p = leerProgreso(), html = '<h1 class="seccion-titulo">Aprende</h1><p class="texto-suave mb-md">Cursos cortos y gratuitos. Tu avance se guarda en este celular.</p>';
    var cont = null;
    for (var i = 0; i < cursosCache.length; i++) {
      var c = cursosCache[i], a = avance(c, p), tocado = p[c.id] && p[c.id].ultima;
      if (tocado && a.hechas < a.total && (!cont || a.hechas > cont.a.hechas)) cont = { c: c, a: a, l: siguiente(c, p) };
    }
    if (cont) {
      var lec = leccionPorId(cont.c, cont.l);
      html += '<button class="continuar" data-curso="' + cont.c.id + '" data-leccion="' + cont.l + '"><span class="continuar__eti">Continuar donde te quedaste</span><span class="continuar__tit">' + esc(cont.c.titulo) + ' · Lección ' + cont.l + ': ' + esc(lec.titulo) + '</span>' + barra(cont.a) + '</button>';
    }
    for (var j = 0; j < cursosCache.length; j++) {
      var cu = cursosCache[j], av = avance(cu, p);
      html += '<button class="tarjeta curso" data-curso="' + cu.id + '">' +
        '<div class="curso__cab"><span class="curso__icono" aria-hidden="true">' + cu.icono + '</span><div><div class="curso__titulo">' + esc(cu.titulo) + (cu.premium ? ' <span class="badge badge--nuevo">Premium</span>' : '') + '</div><div class="texto-suave">' + cu.lecciones.length + ' lecciones · ' + cu.nivel + '</div></div></div>' +
        '<p class="curso__desc">' + esc(cu.descripcion) + '</p>' + etiquetaPatrocinio(cu.patrocinio) +
        barra(av) + '<div class="texto-suave curso__avance">' + (av.hechas === av.total ? '✓ Curso terminado' : av.hechas + ' de ' + av.total + ' lecciones') + '</div></button>';
    }
    html += '<p class="texto-suave mt-lg texto-centro">Por ' + esc(autorCursos) + '. Información educativa, no asesoría financiera.</p>';
    pintarAprende(html);
    var bs = document.querySelectorAll('#aprende-vista [data-curso]');
    for (var k = 0; k < bs.length; k++) bs[k].addEventListener('click', function () {
      var cid = this.getAttribute('data-curso'), lid = this.getAttribute('data-leccion');
      if (lid) vistaLeccion(cid, lid); else vistaCurso(cid);
    });
  }

  function vistaCurso(cid) {
    var c = cursoPorId(cid), p = leerProgreso(), a = avance(c, p);
    var html = '<button class="volver" id="volver-cursos">← Todos los cursos</button>' +
      '<h1 class="seccion-titulo"><span aria-hidden="true">' + c.icono + '</span> ' + esc(c.titulo) + '</h1><p class="texto-suave">' + esc(c.descripcion) + '</p>' + etiquetaPatrocinio(c.patrocinio) +
      '<div class="mt-md">' + barra(a) + '<div class="texto-suave curso__avance">' + a.hechas + ' de ' + a.total + ' lecciones terminadas</div></div>' +
      '<div class="lecciones mt-md">';
    for (var i = 0; i < c.lecciones.length; i++) {
      var l = c.lecciones[i], hecha = p[c.id] && p[c.id].lecciones && p[c.id].lecciones[l.id] && p[c.id].lecciones[l.id].terminada;
      html += '<button class="tarjeta leccion-item' + (hecha ? ' leccion-item--hecha' : '') + '" data-leccion="' + l.id + '"><span class="leccion-item__num">' + (hecha ? '✓' : l.id) + '</span><span class="leccion-item__cuerpo"><span class="leccion-item__tit">' + esc(l.titulo) + '</span><span class="texto-suave">' + l.duracion + ' min' + (l.video ? ' · con video' : ' · texto') + '</span></span></button>';
    }
    html += '</div><button class="btn-principal mt-md" id="btn-empezar">' + (a.hechas === 0 ? 'Empezar el curso' : a.hechas === a.total ? 'Repasar desde el inicio' : 'Continuar: lección ' + siguiente(c, p)) + '</button>';
    pintarAprende(html);
    document.getElementById('volver-cursos').addEventListener('click', vistaCursos);
    document.getElementById('btn-empezar').addEventListener('click', function () { vistaLeccion(cid, a.hechas === a.total ? c.lecciones[0].id : siguiente(c, p)); });
    var bs = document.querySelectorAll('#aprende-vista [data-leccion]');
    for (var k = 0; k < bs.length; k++) bs[k].addEventListener('click', function () { vistaLeccion(cid, this.getAttribute('data-leccion')); });
  }

  function vistaBloqueo(c) {
    pintarAprende('<button class="volver" id="volver-curso">← ' + esc(c.titulo) + '</button>' +
      '<h1 class="seccion-titulo">' + esc(c.titulo) + ' <span class="badge badge--nuevo">Premium</span></h1>' +
      '<div class="tarjeta"><p>Este curso es de pago. Incluye las ' + c.lecciones.length + ' lecciones completas, el repaso y tu avance guardado.</p>' +
      (premiumCfg.precio ? '<div class="calc__grande mt-sm">' + esc(premiumCfg.precio) + '</div>' : '') +
      (premiumCfg.urlPago ? '<a class="btn-principal mt-md" style="display:block;text-align:center" href="' + esc(premiumCfg.urlPago) + '" target="_blank" rel="noopener">Pagar y recibir mi código</a>' : '') +
      '<p class="texto-suave mt-md">Al pagar recibes un código por correo o WhatsApp.' + (premiumCfg.contacto ? ' Dudas: ' + esc(premiumCfg.contacto) : '') + '</p></div>' +
      '<div class="tarjeta mt-md"><label class="campo"><span>Ya pagué: escribe tu código</span><input type="text" id="codigo-premium" autocomplete="off" autocapitalize="characters"></label>' +
      '<button class="btn-principal mt-sm" id="btn-codigo">Desbloquear</button><div class="texto-suave mt-sm" id="codigo-estado"></div></div>');
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
    var quiz = '<div class="quiz mt-lg"><h3 class="leccion__h">Repaso rápido</h3>';
    for (var i = 0; i < l.preguntas.length; i++) {
      var q = l.preguntas[i];
      quiz += '<fieldset class="quiz__p" data-i="' + i + '"><legend>' + (i + 1) + '. ' + esc(q.p) + '</legend>';
      for (var j = 0; j < q.opciones.length; j++) quiz += '<label class="quiz__op"><input type="radio" name="q' + i + '" value="' + j + '"><span>' + esc(q.opciones[j]) + '</span></label>';
      quiz += '<p class="quiz__exp" hidden></p></fieldset>';
    }
    quiz += '<button class="btn-principal" id="btn-revisar">Revisar respuestas</button><div id="quiz-resultado" class="mt-sm"></div></div>';
    var html = '<button class="volver" id="volver-curso">← ' + esc(c.titulo) + '</button>' +
      '<div class="texto-suave">Lección ' + l.id + ' de ' + c.lecciones.length + ' · ' + l.duracion + ' min de lectura</div>' +
      '<h1 class="seccion-titulo">' + esc(l.titulo) + '</h1>' + video +
      '<div class="leccion">' + renderTexto(l.texto) + '</div>' + quiz +
      '<div class="leccion__nav mt-lg">' + (sig ? '<button class="btn-principal" id="btn-siguiente">Siguiente: ' + esc(sig.titulo) + ' →</button>' : '<button class="btn-principal" id="btn-siguiente">Volver al curso</button>') + '</div>';
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
        exp.textContent = (ok ? '✓ Correcto. ' : '✗ La respuesta es: ' + l.preguntas[i].opciones[l.preguntas[i].respuesta] + '. ') + l.preguntas[i].explicacion; exp.hidden = false;
      }
      var res = document.getElementById('quiz-resultado');
      if (faltan) { res.innerHTML = '<span class="texto-suave">Te falta responder ' + faltan + (faltan === 1 ? ' pregunta.' : ' preguntas.') + '</span>'; return; }
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
    .catch(function () { pintarAprende('<h1 class="seccion-titulo">Aprende</h1><p class="texto-suave">No pudimos cargar los cursos. Inténtalo de nuevo con conexión.</p>'); });

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
