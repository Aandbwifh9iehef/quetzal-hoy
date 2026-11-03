import { consultarDia } from './banguat.js';

export const CLAVE_HISTORIAL = 'tipo-cambio:historial';
export const DIAS_GUARDADOS = 800;

export function fusionarHistorial(...listas) {
  const porFecha = new Map();
  for (const lista of listas) {
    for (const d of lista ?? []) {
      if (d?.fecha && Number.isFinite(d.valor)) porFecha.set(d.fecha, d.valor);
    }
  }
  return [...porFecha.entries()]
    .map(([fecha, valor]) => ({ fecha, valor }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-DIAS_GUARDADOS);
}

function restarDias(iso, dias) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

export function serieDesde(historial, fechaFin, dias) {
  const inicio = restarDias(fechaFin, dias);
  return historial.filter((d) => d.fecha > inicio && d.fecha <= fechaFin);
}

export function construirRespuesta(historial, { actualizado = null } = {}) {
  const lista = fusionarHistorial(historial);
  if (lista.length === 0) return { disponible: false };

  const hoy = lista[lista.length - 1];
  const ayer = lista.length > 1 ? lista[lista.length - 2] : null;
  const cambio = ayer ? Number((hoy.valor - ayer.valor).toFixed(5)) : 0;

  return {
    disponible: true,
    fecha: hoy.fecha,
    valor: hoy.valor,
    ayer: ayer ? { fecha: ayer.fecha, valor: ayer.valor } : null,
    cambio,
    tendencia: cambio > 0 ? 'sube' : cambio < 0 ? 'baja' : 'igual',
    series: {
      '7d': serieDesde(lista, hoy.fecha, 7),
      '1m': serieDesde(lista, hoy.fecha, 30),
      '1a': serieDesde(lista, hoy.fecha, 365)
    },
    fuente: 'Banco de Guatemala',
    fuenteUrl: 'https://www.banguat.gob.gt',
    actualizado
  };
}

async function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function actualizarTipoCambio(env, { fetchFn = fetch, intentos = 3, pausaMs = 3000, ahora = new Date() } = {}) {
  const guardado = (await env.DATA.get(CLAVE_HISTORIAL, 'json')) ?? [];
  let ultimoError = null;

  for (let i = 1; i <= intentos; i++) {
    try {
      const dato = await consultarDia(fetchFn);
      const historial = fusionarHistorial(guardado, [dato]);
      await env.DATA.put(CLAVE_HISTORIAL, JSON.stringify(historial));
      await env.DATA.put('tipo-cambio:actualizado', ahora.toISOString());
      return { ok: true, dato, intentos: i };
    } catch (err) {
      ultimoError = err;
      if (i < intentos) await esperar(pausaMs);
    }
  }

  await env.DATA.put('tipo-cambio:ultimo-error', JSON.stringify({ fecha: ahora.toISOString(), mensaje: String(ultimoError?.message ?? ultimoError) }));
  return { ok: false, error: ultimoError, conservado: guardado.length };
}
