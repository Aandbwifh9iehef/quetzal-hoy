import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { escalaGrafica, cambioPeriodo, graficaSvg, temaNoticia, tarjetaNoticia, contenidoPortada, RANGO_MINIMO } from '../public/render.js';
import { anotarAntiguedad } from '../src/indicadores.js';
import { construirRespuesta } from '../src/tipo-cambio.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const serie = (vals) => vals.map((v, i) => ({ fecha: `2026-11-${String(16 + i).padStart(2, '0')}`, valor: v }));

test('la gráfica nunca muestra un rango menor a Q0.05', () => {
  const s = serie([7.640, 7.641, 7.6435, 7.647]);
  const { min, max } = escalaGrafica(s);
  assert.ok(Math.abs(max - min - RANGO_MINIMO) < 1e-9, `rango ${max - min}`);
  assert.ok(min < 7.640 && max > 7.647, 'los datos quedan dentro');
  const grande = escalaGrafica(serie([7.50, 7.70]));
  assert.ok(grande.max - grande.min > 0.2, 'si el cambio es grande, se respeta');
});

test('cambio del período en texto', () => {
  assert.equal(cambioPeriodo(serie([7.640, 7.647]), '7d'), '+Q 0.007 en 7 días');
  assert.equal(cambioPeriodo(serie([7.70, 7.64]), '1m'), '−Q 0.060 en 1 mes');
  assert.equal(cambioPeriodo(serie([7.6478, 7.6479]), '1a'), 'Sin cambio en 1 año');
  assert.match(graficaSvg(serie([7.640, 7.647]), '7d'), /<p class="grafica__cambio">\+Q 0\.007 en 7 días<\/p>/);
});

test('categoría de noticias por puntos: café y exportaciones es Comercio, no Bancos', () => {
  const cafe = { titulo: '¿Por qué el café desplazó al vestuario en las exportaciones de Guatemala? Banguat y empresarios explican las razones', medio: 'Prensa Libre' };
  assert.equal(temaNoticia(cafe).nombre, 'Comercio');
  assert.equal(temaNoticia({ titulo: 'La Junta Monetaria mantiene la tasa líder en 3.50%', medio: 'Prensa Libre' }).nombre, 'Bancos y crédito');
  assert.equal(temaNoticia({ titulo: 'Gasolinas bajan hasta Q3.82 en Guatemala', medio: 'Prensa Libre' }).nombre, 'Combustibles');
  assert.equal(temaNoticia({ titulo: 'Mujeres son propietarias del 43.3% de las microempresas en Guatemala', medio: 'Prensa Libre' }).nombre, 'Empresas');
  assert.equal(temaNoticia({ titulo: 'El vecino quiere trabajar solo cuatro días a la semana', medio: 'República' }).nombre, 'Empleo');
  assert.equal(temaNoticia({ titulo: 'Algo sin palabras conocidas', medio: 'DW' }).nombre, 'Mundo');
});

test('la tarjeta de noticia muestra resumen y "¿Cómo te afecta?" cuando existen', () => {
  const h = tarjetaNoticia({ titulo: 'T', enlace: 'https://x.gt/a', medio: 'M', fecha: '2026-11-22T10:00:00Z', resumen: 'Dos frases. Bien.', afecta: 'Si ahorras, revisa.' });
  assert.match(h, /<p class="noticia__resumen">Dos frases\. Bien\.<\/p>/);
  assert.match(h, /<strong>¿Cómo te afecta\?<\/strong> Si ahorras, revisa\./);
  assert.match(h, /Resumen automático/);
  const solo = tarjetaNoticia({ titulo: 'T', enlace: 'https://x.gt/a', medio: 'M', resumen: null, afecta: null });
  assert.doesNotMatch(solo, /noticia__resumen|Cómo te afecta|Resumen automático/);
});

test('el contenido de la portada llena Hoy, Noticias e Invertir sin "Cargando"', () => {
  const hoy = '2026-11-22';
  const tipoCambio = construirRespuesta(leer('data/tipo-cambio-historial.json').datos);
  const noticias = { disponible: true, fecha: hoy, guatemala: [{ titulo: 'Gasolinas bajan', enlace: 'https://x.gt', medio: 'Prensa Libre', fecha: hoy, resumen: 'Bajan. Otra.', afecta: 'Si manejas, ahorras.' }], mundo: [] };
  const piezas = contenidoPortada({
    hoy, tipoCambio, noticias,
    indicadores: { indicadores: anotarAntiguedad(leer('data/indicadores.json').indicadores, hoy) },
    dato: { fecha: hoy, dato: { titulo: 'Dato', texto: 'Texto.', fuente: 'Banguat' } },
    inversiones: leer('data/inversiones.json')
  });
  for (const id of ['card-tipo-cambio', 'lista-indicadores', 'card-dato-del-dia', 'noticias-contenido', 'lista-opciones', 'tabla-plazo-fijo', 'tabla-ahorro', 'card-bonos', 'lista-estafas', 'lista-verificar']) {
    assert.ok(piezas[id] && piezas[id].length > 50, `falta ${id}`);
    assert.doesNotMatch(piezas[id], /Cargando|undefined|NaN/, id);
  }
  assert.match(piezas['card-tipo-cambio'], /class="sello"/, 'el dólar lleva su sello');
  assert.match(piezas['noticias-contenido'], /¿Cómo te afecta\?/);
});
