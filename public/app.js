// Al cambio — lógica del navegador. El HTML de Hoy, Noticias e Invertir sale de /render.js, el mismo
// módulo que usa el Worker para mandar la página ya llena (los elementos llegan con data-ssr).
import { esc, q, pct, fechaCorta, ico, graficaSvg, tarjetaTipoCambio, notaConvertidor, textoCambio, indicadoresHtml, datoDelDiaHtml, noticiasHtml, opcionesHtml, tasasHtml, bonosHtml, estafasHtml, verificarHtml } from '/render.js';

(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var yaVino = function (id) { var e = $(id); return Boolean(e && e.hasAttribute('data-ssr')); };
  var json = function (url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };

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
  $('fecha-hoy').textContent = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, function (c) { return c.toUpperCase(); });

  // ─── Analítica (Cloudflare Web Analytics si hay token) y eventos simples ───
  function evento(nombre) {
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('/api/evento', nombre);
      else fetch('/api/evento', { method: 'POST', body: nombre, keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  window.eventoQH = evento;
  json('/api/config').then(function (c) {
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
  function cambiarTab(tab, btn) {
    var secs = document.querySelectorAll('.seccion');
    for (var i = 0; i < secs.length; i++) secs[i].classList.remove('activa');
    var btns = document.querySelectorAll('.nav-btn');
    for (var j = 0; j < btns.length; j++) { btns[j].classList.remove('activo'); btns[j].setAttribute('aria-selected', 'false'); }
    $('tab-' + tab).classList.add('activa');
    btn.classList.add('activo');
    btn.setAttribute('aria-selected', 'true');
    if (history.replaceState) history.replaceState(null, '', tab === 'hoy' ? location.pathname : '#' + tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.cambiarTab = cambiarTab;
  TABS.forEach(function (t) { var b = $('nav-' + t); if (b) b.addEventListener('click', function () { cambiarTab(t, b); }); });
  function abrirDesdeHash() {
    var h = (location.hash || '').replace('#', '');
    if (TABS.indexOf(h) > 0) cambiarTab(h, $('nav-' + h));
  }
  abrirDesdeHash();
  window.addEventListener('hashchange', abrirDesdeHash);

  // ─── Tipo de cambio y convertidor ───
  var tc = null;
  var cardTc = $('card-tipo-cambio');
  cardTc.addEventListener('click', function (e) {
    var rango = e.target.closest('.rango');
    if (rango && tc) {
      var botones = cardTc.querySelectorAll('.rango');
      for (var j = 0; j < botones.length; j++) { botones[j].classList.remove('activo'); botones[j].setAttribute('aria-pressed', 'false'); }
      rango.classList.add('activo');
      rango.setAttribute('aria-pressed', 'true');
      var r = rango.getAttribute('data-r');
      $('grafica-tc').innerHTML = graficaSvg(tc.series[r], r);
      return;
    }
    if (e.target.closest('#btn-compartir-tc') && tc) {
      var cambio = textoCambio(tc);
      compartir('Dólar hoy en Guatemala', 'Dólar hoy: ' + q(tc.valor, 4) + (cambio ? ', ' + cambio.charAt(0).toLowerCase() + cambio.slice(1) : '') + '. Referencia Banguat, ' + fechaCorta(tc.fecha), 'https://hoy.compoundclub.fyi/');
    }
  });

  function iniciarConvertidor(d) {
    var usd = $('usd'), gtq = $('gtq'), tasa = d.valor;
    $('convertidor-nota').textContent = notaConvertidor(d);
    function limpiar(v) { var n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n >= 0 ? n : null; }
    usd.addEventListener('input', function () { var n = limpiar(usd.value); gtq.value = n == null ? '' : (n * tasa).toFixed(2); });
    gtq.addEventListener('input', function () { var n = limpiar(gtq.value); usd.value = n == null ? '' : (n / tasa).toFixed(2); });
    $('btn-swap').addEventListener('click', function () {
      var a = usd.value; usd.value = gtq.value; gtq.value = a;
      usd.dispatchEvent(new Event('input'));
    });
    usd.value = '100';
    usd.dispatchEvent(new Event('input'));
  }

  json('/api/tipo-cambio').then(function (d) {
    tc = d && d.disponible ? d : null;
    if (!yaVino('card-tipo-cambio')) { cardTc.innerHTML = tarjetaTipoCambio(d, new Date().toISOString().slice(0, 10)); cardTc.removeAttribute('aria-busy'); }
    if (tc) iniciarConvertidor(tc);
  }).catch(function () {
    if (!yaVino('card-tipo-cambio')) { cardTc.innerHTML = tarjetaTipoCambio(null); cardTc.removeAttribute('aria-busy'); }
  });

  // ─── Indicadores y dato del día ───
  if (!yaVino('lista-indicadores')) json('/api/indicadores').then(function (r) { $('lista-indicadores').innerHTML = indicadoresHtml(r); }).catch(function () { $('lista-indicadores').innerHTML = indicadoresHtml(null); });
  if (!yaVino('card-dato-del-dia')) json('/api/dato-del-dia').then(function (r) { $('card-dato-del-dia').innerHTML = datoDelDiaHtml(r); }).catch(function () { $('card-dato-del-dia').innerHTML = datoDelDiaHtml(null); });

  // ─── Noticias ───
  $('noticias-contenido').addEventListener('click', function (e) {
    var b = e.target.closest('[data-compartir]');
    if (b) compartir(b.getAttribute('data-titulo'), b.getAttribute('data-titulo') + ' (' + b.getAttribute('data-medio') + ') — vía Al cambio', b.getAttribute('data-enlace'));
  });
  function pintarNoticias(resp) {
    var n = noticiasHtml(resp);
    $('noticias-fecha').textContent = n.fecha;
    $('noticias-contenido').innerHTML = n.contenido;
  }
  function cargarNoticias(fecha) {
    $('noticias-contenido').innerHTML = '<div class="cargando">Cargando noticias…</div>';
    json('/api/noticias' + (fecha ? '?fecha=' + fecha : '')).then(pintarNoticias).catch(function () { pintarNoticias(null); });
  }
  function pintarArchivo(resp) {
    var fechas = (resp && resp.fechas) || [];
    if (fechas.length < 2) return;
    var lista = $('archivo-lista');
    lista.innerHTML = fechas.map(function (f) { return '<button class="archivo__dia" data-f="' + esc(f) + '">' + fechaCorta(f) + '</button>'; }).join('');
    lista.addEventListener('click', function (e) {
      var b = e.target.closest('.archivo__dia');
      if (!b) return;
      cargarNoticias(b.getAttribute('data-f'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('archivo-noticias').hidden = false;
  }
  if (!yaVino('noticias-contenido')) cargarNoticias();
  json('/api/noticias/archivo').then(pintarArchivo).catch(function () {});

  // ─── Invertir ───
  if (!yaVino('lista-opciones')) {
    json('/api/inversiones').then(function (d) {
      var t = tasasHtml(d);
      $('lista-opciones').innerHTML = opcionesHtml(d.tipos);
      $('tasas-nota').innerHTML = t.notaPlazo;
      $('tabla-plazo-fijo').innerHTML = t.plazo;
      $('ahorro-nota').innerHTML = t.notaAhorro;
      $('tabla-ahorro').innerHTML = t.ahorro;
      $('isr-nota').innerHTML = t.isr;
      $('card-bonos').innerHTML = bonosHtml(d.bonos);
      $('lista-estafas').innerHTML = estafasHtml(d.noEsInversion);
      $('lista-verificar').innerHTML = verificarHtml(d.noEsInversion);
    }).catch(function () { $('lista-opciones').innerHTML = '<p class="texto-2">No pudimos cargar la información.</p>'; });
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

  var ICONO_CURSO = { presupuesto: 'billetera', deudas: 'tijeras', invertir: 'brote' };
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
      html += '<button class="tarjeta curso con-icono" data-curso="' + cu.id + '">' + ico(ICONO_CURSO[cu.id] || 'billetera') + '<span class="curso__cuerpo">' +
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
    .catch(function (err) { console.error('Aprende:', err); pintarAprende('<h1 class="titulo-pagina">Aprende</h1><p class="texto-2">No pudimos cargar los cursos. Inténtalo de nuevo con conexión.</p>'); });

  // ─── Instalar: barra pequeña sobre las pestañas, desde la segunda visita ───
  // Nunca tapa el contenido: mientras se ve, la página suma su alto abajo para poder ver todo.
  var CLAVE_VISITAS = 'quetzal-hoy:visitas', CLAVE_CERRADA = 'quetzal-hoy:instalar';
  var barraInstalar = $('instalar'), textoBarra = $('instalar-texto'), btnInstalar = $('btn-instalar');
  var installEvent = null;
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function contarVisita() {
    var n = parseInt(leer(CLAVE_VISITAS) || '0', 10) || 0;
    try { if (!sessionStorage.getItem('quetzal-hoy:sesion')) { sessionStorage.setItem('quetzal-hoy:sesion', '1'); n++; guardar(CLAVE_VISITAS, String(n)); } } catch (e) {}
    return n;
  }
  var visitas = contarVisita();
  function yaInstalada() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true || location.search.indexOf('source=pwa') >= 0 || location.search.indexOf('source=twa') >= 0;
  }
  function sistema() {
    var ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return 'android';
    // iPad con iPadOS se presenta como Mac con pantalla táctil
    if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua) ? 'ios' : 'ios-otro';
    return 'otro';
  }
  function mostrarBarra() {
    if (yaInstalada() || leer(CLAVE_CERRADA) === 'no' || visitas < 2) return;
    var so = sistema();
    if (installEvent) { textoBarra.textContent = 'Instala Al cambio en tu celular'; btnInstalar.hidden = false; }
    else if (so === 'ios') { textoBarra.innerHTML = 'Para instalar: toca Compartir ' + ico('compartirIos') + ' y luego <strong>Agregar a inicio</strong>'; btnInstalar.hidden = true; }
    else if (so === 'ios-otro') { textoBarra.innerHTML = 'Para instalar, abre esta página en <strong>Safari</strong>'; btnInstalar.hidden = true; }
    else if (so === 'android') { textoBarra.innerHTML = 'Para instalar: menú ' + ico('menu') + ' y luego <strong>Instalar app</strong>'; btnInstalar.hidden = true; }
    else return; // en computadora solo se ofrece si el navegador trae el botón de instalar
    barraInstalar.hidden = false;
    document.body.classList.add('con-barra-instalar');
  }
  function ocultarBarra() { barraInstalar.hidden = true; document.body.classList.remove('con-barra-instalar'); }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    mostrarBarra();
  });
  btnInstalar.addEventListener('click', function () {
    if (!installEvent) return;
    installEvent.prompt();
    installEvent.userChoice.then(function (r) { if (r && r.outcome === 'accepted') ocultarBarra(); });
  });
  $('btn-instalar-cerrar').addEventListener('click', function () { ocultarBarra(); guardar(CLAVE_CERRADA, 'no'); });
  window.addEventListener('appinstalled', ocultarBarra);
  if (document.readyState === 'complete') mostrarBarra(); else window.addEventListener('load', mostrarBarra);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();
