import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { leerProgreso, guardarProgreso, marcarLeccion, marcarVista, avanceCurso, siguienteLeccion, cursoParaContinuar } from '../src/progreso.js';

const datos = JSON.parse(readFileSync(new URL('../data/cursos.json', import.meta.url), 'utf8'));
const FRASES_PROHIBIDAS = /te conviene|te recomendamos|la mejor opción para ti|deberías invertir en|hazte rico|(?<!se )duplica tu dinero/i;

test('hay 3 cursos con 5 lecciones completas cada uno (15 lecciones)', () => {
  assert.equal(datos.cursos.length, 3);
  assert.deepEqual(datos.cursos.map((c) => c.id), ['presupuesto', 'deudas', 'invertir']);
  let total = 0;
  for (const c of datos.cursos) {
    assert.equal(c.lecciones.length, 5, c.id);
    assert.equal(c.premium, false, 'todos gratis por ahora');
    for (const l of c.lecciones) {
      total++;
      assert.ok(l.titulo.length > 5, `${c.id}/${l.id}`);
      assert.ok(l.duracion >= 3 && l.duracion <= 5, `${c.id}/${l.id} duración`);
      assert.ok(l.texto.length >= 1500, `${c.id}/${l.id}: texto corto (${l.texto.length})`);
      assert.equal(l.preguntas.length, 3, `${c.id}/${l.id}: 3 preguntas`);
      for (const q of l.preguntas) {
        assert.ok(q.opciones.length >= 3, `${c.id}/${l.id}: opciones`);
        assert.ok(q.respuesta >= 0 && q.respuesta < q.opciones.length, `${c.id}/${l.id}: respuesta válida`);
        assert.ok(q.explicacion.length > 10, `${c.id}/${l.id}: explicación`);
      }
      assert.ok(l.video === null || /^[\w-]{11}$/.test(l.video), `${c.id}/${l.id}: video`);
    }
  }
  assert.equal(total, 15);
});

test('cada lección tiene su guion de video en guiones/', () => {
  for (const c of datos.cursos) {
    for (const l of c.lecciones) {
      const ruta = new URL(`../guiones/${c.id}-${l.id}.md`, import.meta.url);
      assert.ok(existsSync(ruta), `falta guiones/${c.id}-${l.id}.md`);
      const g = readFileSync(ruta, 'utf8');
      assert.ok(g.length >= 1800, `guion ${c.id}-${l.id} muy corto (${g.length})`);
      assert.match(g, new RegExp(l.titulo.slice(0, 15).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `guion ${c.id}-${l.id} sin el título`);
    }
  }
});

test('ningún texto recomienda inversiones concretas ni promete riqueza', () => {
  for (const c of datos.cursos) for (const l of c.lecciones) {
    assert.doesNotMatch(l.texto, FRASES_PROHIBIDAS, `${c.id}/${l.id}`);
    const g = readFileSync(new URL(`../guiones/${c.id}-${l.id}.md`, import.meta.url), 'utf8');
    assert.doesNotMatch(g, FRASES_PROHIBIDAS, `guion ${c.id}-${l.id}`);
  }
});

function almacenFalso() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
}

test('el progreso se guarda, se lee y calcula el avance', () => {
  const a = almacenFalso();
  const curso = datos.cursos[0];
  let p = leerProgreso(a);
  assert.deepEqual(p, {});
  p = marcarLeccion(p, curso.id, '1', { aciertos: 3 });
  p = marcarLeccion(p, curso.id, '2', { aciertos: 2 });
  assert.equal(guardarProgreso(a, p), true);
  const leido = leerProgreso(a);
  assert.deepEqual(avanceCurso(curso, leido), { hechas: 2, total: 5, porcentaje: 40 });
  assert.equal(siguienteLeccion(curso, leido), '3');
  assert.equal(leido[curso.id].lecciones['1'].aciertos, 3);
});

test('"continuar donde te quedaste" elige el curso empezado y su siguiente lección', () => {
  let p = {};
  assert.equal(cursoParaContinuar(datos.cursos, p), null);
  p = marcarVista(p, 'deudas', '3');
  const c = cursoParaContinuar(datos.cursos, p);
  assert.equal(c.curso.id, 'deudas');
  assert.equal(c.leccion, '3');
  p = marcarLeccion(p, 'deudas', '3');
  assert.equal(cursoParaContinuar(datos.cursos, p).leccion, '4');
  for (const id of ['1', '2', '4', '5']) p = marcarLeccion(p, 'deudas', id);
  assert.equal(cursoParaContinuar(datos.cursos, p), null, 'curso terminado ya no se ofrece');
});

test('si localStorage falla o tiene basura, no rompe', () => {
  const roto = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('lleno'); } };
  assert.deepEqual(leerProgreso(roto), {});
  assert.equal(guardarProgreso(roto, { x: 1 }), false);
  assert.deepEqual(leerProgreso({ getItem: () => '{no es json' }), {});
  assert.deepEqual(leerProgreso({ getItem: () => '"texto"' }), {});
  assert.deepEqual(leerProgreso(undefined), {});
  assert.equal(avanceCurso(datos.cursos[1], {}).porcentaje, 0);
  assert.equal(siguienteLeccion(datos.cursos[1], {}), '1');
});
