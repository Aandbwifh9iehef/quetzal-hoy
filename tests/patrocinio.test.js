import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aplicarAfiliados, enlaceAfiliado, aplicarPatrocinioCursos, etiquetaPatrocinioCurso, ETIQUETA_PATROCINIO } from '../src/patrocinio.js';
import { sha256Hex, verificarCodigo, cursoBloqueado, premiumPublico } from '../src/premium.js';
import { paginaAnunciate, paginaMediaKit, paginaInvertir, rutasSitemap } from '../src/paginas.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const config = leer('site.config.json');
const inversiones = leer('data/inversiones.json');
const cursos = leer('data/cursos.json').cursos;

test('un afiliado configurado aparece en su fila con rel=sponsored y etiqueta visible; sin config no aparece nada', () => {
  const sin = aplicarAfiliados(inversiones, {});
  assert.ok(sin.tasasPlazoFijo.filas.every((f) => !f.afiliado));
  const con = aplicarAfiliados(inversiones, { 'Banco Azteca': { url: 'https://ejemplo.gt/azteca', texto: 'Abrir cuenta' } });
  const fila = con.tasasPlazoFijo.filas.find((f) => f.entidad === 'Banco Azteca');
  assert.equal(fila.afiliado.url, 'https://ejemplo.gt/azteca');
  const html = enlaceAfiliado(fila.afiliado);
  assert.match(html, /rel="sponsored noopener"/);
  assert.match(html, new RegExp(ETIQUETA_PATROCINIO));
  assert.equal(enlaceAfiliado(null), '');
  assert.equal(enlaceAfiliado({ url: '' }), '');
  // la nota de ayuda en el config no se confunde con una entidad
  const conNota = aplicarAfiliados(inversiones, config.afiliados);
  assert.ok(conNota.tasasPlazoFijo.filas.every((f) => !f.afiliado));
});

test('la página del comparador muestra el enlace patrocinado solo con etiqueta', () => {
  const con = aplicarAfiliados(inversiones, { 'Banco Azteca': { url: 'https://ejemplo.gt/azteca' } });
  const html = paginaInvertir(con, config);
  assert.match(html, /https:\/\/ejemplo\.gt\/azteca/);
  const sponsored = (html.match(/rel="sponsored noopener"/g) ?? []).length;
  const etiquetas = (html.match(new RegExp(ETIQUETA_PATROCINIO, 'g')) ?? []).length;
  assert.equal(sponsored, 1);
  assert.equal(etiquetas, sponsored, 'cada enlace patrocinado lleva su etiqueta');
});

test('patrocinio de curso: etiqueta "Patrocinado por" y rel=sponsored si hay enlace', () => {
  const con = aplicarPatrocinioCursos(cursos, { deudas: { nombre: 'Cooperativa Ejemplo', url: 'https://coop.gt' } });
  assert.equal(con.find((c) => c.id === 'deudas').patrocinio.nombre, 'Cooperativa Ejemplo');
  assert.ok(!con.find((c) => c.id === 'presupuesto').patrocinio);
  const html = etiquetaPatrocinioCurso(con[1].patrocinio);
  assert.match(html, /Patrocinado por/);
  assert.match(html, /rel="sponsored noopener"/);
  assert.equal(etiquetaPatrocinioCurso(null), '');
  assert.ok(aplicarPatrocinioCursos(cursos, config.patrocinioCursos).every((c) => !c.patrocinio), 'la nota del config no patrocina nada');
});

test('premium: códigos por huella, bloqueo solo con cobro activo, API sin hashes', () => {
  const huella = sha256Hex('qh-2026-abcd ');
  assert.equal(huella, sha256Hex('QH-2026-ABCD'), 'no distingue mayúsculas ni espacios');
  assert.equal(verificarCodigo('QH-2026-ABCD', [huella]), true);
  assert.equal(verificarCodigo('otro', [huella]), false);
  assert.equal(verificarCodigo('', [huella]), false);
  const curso = { id: 'deudas', premium: true };
  assert.equal(cursoBloqueado(curso, { activo: false }, {}), false, 'con cobro apagado todo es gratis');
  assert.equal(cursoBloqueado(curso, { activo: true }, {}), true);
  assert.equal(cursoBloqueado(curso, { activo: true }, { deudas: true }), false);
  assert.equal(cursoBloqueado({ id: 'x', premium: false }, { activo: true }, {}), false);
  const pub = premiumPublico({ activo: true, precio: 'Q 49', urlPago: 'https://pago', codigosSha256: [huella] });
  assert.deepEqual(Object.keys(pub).sort(), ['activo', 'contacto', 'precio', 'urlPago']);
  assert.ok(!JSON.stringify(pub).includes(huella));
});

test('Anúnciate y media kit se generan con métricas reales y sin texto roto', () => {
  const metricas = { eventos: { instalacion: 12, curso_iniciado: 30, curso_terminado: 5, compartir: 8, copiar_resumen: 20 }, desde: '2026-11-03', contenido: { indicadores: 6, noticiasPorDia: 8, cursos: 3, lecciones: 15, entidadesTasas: 17 } };
  const a = paginaAnunciate(config, metricas);
  assert.match(a, /<h1[^>]*>Anúnciate en Quetzal Hoy<\/h1>/);
  assert.match(a, /Te lo trae/);
  assert.match(a, /bienestar financiero/i);
  assert.match(a, /12/);
  assert.match(a, /patrocinad/i);
  assert.doesNotMatch(a, /undefined|NaN/);
  const m = paginaMediaKit(config, metricas);
  assert.match(m, /<h1[^>]*>[^<]*Media kit/);
  assert.match(m, /@media print/);
  assert.match(m, /noindex/);
  assert.doesNotMatch(m, /undefined|NaN/);
  const vacio = paginaAnunciate(config, { eventos: {}, desde: '2026-11-03', contenido: metricas.contenido });
  assert.doesNotMatch(vacio, /undefined|NaN/);
  assert.ok(rutasSitemap(cursos).some((r) => r.ruta === '/anunciate'));
});
