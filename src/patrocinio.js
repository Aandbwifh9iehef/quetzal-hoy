export { ETIQUETA_PATROCINIO, enlaceAfiliado, etiquetaPatrocinioCurso } from './paginas.js';

// Agrega a cada fila de tasas el enlace de afiliado configurado (clave = nombre de la entidad)
export function aplicarAfiliados(inversiones, afiliados = {}) {
  const conAfiliado = (f) => {
    const a = afiliados[f.entidad];
    return a?.url ? { ...f, afiliado: { url: a.url, texto: a.texto || 'Abrir cuenta' } } : f;
  };
  return {
    ...inversiones,
    tasasPlazoFijo: { ...inversiones.tasasPlazoFijo, filas: inversiones.tasasPlazoFijo.filas.map(conAfiliado) },
    tasasAhorro: { ...inversiones.tasasAhorro, filas: inversiones.tasasAhorro.filas.map(conAfiliado) }
  };
}

export function aplicarPatrocinioCursos(cursos, patrocinios = {}) {
  return cursos.map((c) => {
    const p = patrocinios[c.id];
    return p?.nombre ? { ...c, patrocinio: { nombre: p.nombre, url: p.url || null } } : c;
  });
}

