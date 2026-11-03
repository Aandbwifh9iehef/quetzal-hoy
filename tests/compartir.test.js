import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { textoResumen, svgImagen, envolver, fechaLarga, seleccionarNoticias, FORMATOS } from '../src/compartir.js';

const config = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8'));
const tipoCambio = { disponible: true, fecha: '2026-11-03', valor: 7.63621, ayer: { fecha: '2026-11-02', valor: 7.64187 }, cambio: -0.00566, tendencia: 'baja' };
const noticias = {
  guatemala: [
    { titulo: 'Factura petrolera de Guatemala sube 46.4% y revela un cambio en el consumo de gasolinas', enlace: 'https://www.prensalibre.com/a', medio: 'Prensa Libre' },
    { titulo: 'Gasolinas bajan hasta Q3.82 en Guatemala', enlace: 'https://www.prensalibre.com/b', medio: 'Prensa Libre' }
  ],
  mundo: [
    { titulo: 'Wall Street afronta las midterms', enlace: 'https://elpais.com/c', medio: 'El País' },
    { titulo: 'BioNTech dice adiós a sus fundadores', enlace: 'https://dw.com/d', medio: 'DW' }
  ]
};
const dato = { titulo: 'Q1,000 debajo del colchón', texto: 'Si guardas Q1,000 en casa durante un año con la inflación actual (4.69%), al final compran lo que hoy compras con Q 955.20.' };
const datos = { fecha: '2026-11-03', tipoCambio, noticias, dato, config: { ...config, patrocinador: '' } };

test('fechaLarga y selección de noticias (hasta 3: Guatemala primero, luego mundo)', () => {
  assert.equal(fechaLarga('2026-11-03'), 'martes 3 de noviembre');
  const s = seleccionarNoticias(noticias);
  assert.equal(s.length, 3);
  assert.equal(s[2].medio, 'El País');
  assert.deepEqual(seleccionarNoticias(null), []);
});

test('el texto para WhatsApp tiene el formato esperado (fixture)', () => {
  const texto = textoResumen(datos);
  const esperado = readFileSync(new URL('./fixtures/resumen-whatsapp.txt', import.meta.url), 'utf8');
  assert.equal(texto, esperado);
});

test('el texto usa negritas de WhatsApp, enlaces en línea propia y nada roto', () => {
  const texto = textoResumen(datos);
  assert.match(texto, /^\*Quetzal Hoy — martes 3 de noviembre\*\n/);
  assert.match(texto, /💵 \*Dólar:\* Q7\.6362 \(▼ 0\.0057 vs\. ayer\)/);
  assert.match(texto, /\n  https:\/\/www\.prensalibre\.com\/a\n/);
  assert.match(texto, /Más en https:\/\/hoy\.compoundclub\.fyi\n$/);
  assert.doesNotMatch(texto, /undefined|null|NaN|\*\*/);
  assert.doesNotMatch(texto, /Te lo trae/, 'sin patrocinador no aparece la línea');
  for (const linea of texto.split('\n')) assert.ok(linea.length <= 160, `línea larga: ${linea}`);
});

test('con patrocinador aparece "Te lo trae"; sin datos de hoy no revienta', () => {
  const con = textoResumen({ ...datos, config: { ...config, patrocinador: 'Banco Ejemplo', patrocinadorUrl: 'https://ejemplo.gt' } });
  assert.match(con, /Te lo trae: Banco Ejemplo · https:\/\/ejemplo\.gt/);
  const vacio = textoResumen({ fecha: '2026-11-03', tipoCambio: { disponible: false }, noticias: null, dato: null, config });
  assert.match(vacio, /^\*Quetzal Hoy — martes 3 de noviembre\*\n\nMás en/);
  assert.doesNotMatch(vacio, /Dólar|📰|💡/);
});

test('envolver corta por palabras y limita líneas', () => {
  const l = envolver('uno dos tres cuatro cinco seis siete ocho nueve diez', 40, 300, 2);
  assert.equal(l.length, 2);
  assert.match(l[1], /…$/);
  for (const x of envolver('palabra '.repeat(20), 38, 920, 3)) assert.ok(x.length <= 46);
  assert.deepEqual(envolver('', 30, 500), []);
});

test('la imagen SVG se genera en los dos tamaños y contiene los datos', () => {
  for (const f of Object.keys(FORMATOS)) {
    const svg = svgImagen({ ...datos, formato: f });
    assert.match(svg, new RegExp(`^<svg [^>]*width="${FORMATOS[f].ancho}" height="${FORMATOS[f].alto}"`));
    assert.match(svg, /Q7\.6362/);
    assert.match(svg, /DÓLAR HOY/);
    assert.match(svg, /LO QUE IMPORTA HOY/);
    assert.match(svg, /DATO DEL DÍA/);
    assert.match(svg, /hoy\.compoundclub\.fyi/);
    assert.doesNotMatch(svg, /undefined|NaN/);
    assert.doesNotMatch(svg, /<text[^>]*>[^<]*&(?!amp;|lt;|gt;|quot;)/, 'ampersands escapados');
    // ninguna línea de texto se sale del ancho (y máximo por debajo del pie)
    const pie = FORMATOS[f].alto - (FORMATOS[f].alto === 1920 ? 260 : 190);
    const ys = [...svg.matchAll(/<text x="\d+" y="(\d+)"/g)].map((m) => Number(m[1]));
    const contenido = ys.filter((v) => v < pie - 1);
    const pieYs = ys.filter((v) => v >= pie);
    assert.equal(pieYs.length, 2, `el pie tiene 2 líneas en ${f}`);
    assert.ok(Math.max(...contenido) <= pie - 20, `el contenido no invade el pie en ${f}`);
    for (const m of svg.matchAll(/font-size="(\d+)"[^>]*>([^<]*)</g)) {
      const tam = Number(m[1]); const txt = m[2];
      if (tam <= 40) assert.ok(txt.length * tam * 0.6 <= 1080 - 80, `línea demasiado larga en ${f}: ${txt}`);
    }
  }
  const conPatro = svgImagen({ ...datos, config: { ...config, patrocinador: 'Banco Ejemplo' } });
  assert.match(conPatro, /Te lo trae: Banco Ejemplo/);
  assert.match(svgImagen({ ...datos, noticias: { guatemala: [{ titulo: 'Tom & Jerry <b>', enlace: 'x', medio: 'M' }], mundo: [] } }), /Tom &amp; Jerry &lt;b&gt;/);
});
