export const CLAVE_PROGRESO = 'quetzal-hoy:progreso';

// `almacen` es localStorage o algo con getItem/setItem; cualquier fallo se trata como "sin progreso"
export function leerProgreso(almacen) {
  try {
    const crudo = almacen?.getItem(CLAVE_PROGRESO);
    const datos = crudo ? JSON.parse(crudo) : {};
    return datos && typeof datos === 'object' ? datos : {};
  } catch {
    return {};
  }
}

export function guardarProgreso(almacen, progreso) {
  try {
    almacen?.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
    return true;
  } catch {
    return false;
  }
}

export function marcarLeccion(progreso, cursoId, leccionId, { aciertos = null } = {}) {
  const copia = { ...progreso, [cursoId]: { ...(progreso[cursoId] ?? {}), lecciones: { ...(progreso[cursoId]?.lecciones ?? {}) } } };
  copia[cursoId].lecciones[leccionId] = { terminada: true, aciertos, fecha: new Date().toISOString().slice(0, 10) };
  copia[cursoId].ultima = leccionId;
  return copia;
}

export function marcarVista(progreso, cursoId, leccionId) {
  const copia = { ...progreso, [cursoId]: { ...(progreso[cursoId] ?? {}), lecciones: { ...(progreso[cursoId]?.lecciones ?? {}) } } };
  copia[cursoId].ultima = leccionId;
  return copia;
}

export function avanceCurso(curso, progreso) {
  const hechas = curso.lecciones.filter((l) => progreso[curso.id]?.lecciones?.[l.id]?.terminada).length;
  return { hechas, total: curso.lecciones.length, porcentaje: Math.round((hechas / curso.lecciones.length) * 100) };
}

// Siguiente lección pendiente a partir de la última vista; si todas están hechas, la primera
export function siguienteLeccion(curso, progreso) {
  const p = progreso[curso.id];
  const ids = curso.lecciones.map((l) => l.id);
  const desde = Math.max(0, p?.ultima ? ids.indexOf(p.ultima) : 0);
  for (let i = 0; i < ids.length; i++) {
    const id = ids[(desde + i) % ids.length];
    if (!p?.lecciones?.[id]?.terminada) return id;
  }
  return ids[0];
}

export function cursoParaContinuar(cursos, progreso) {
  let mejor = null;
  for (const c of cursos) {
    const a = avanceCurso(c, progreso);
    const tocado = Boolean(progreso[c.id]?.ultima);
    if (tocado && a.hechas < a.total) {
      if (!mejor || a.hechas > mejor.avance.hechas) mejor = { curso: c, avance: a, leccion: siguienteLeccion(c, progreso) };
    }
  }
  return mejor;
}
