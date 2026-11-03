const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const DIAS_PARA_MARCAR_VIEJO = 45;

function limpiarCelda(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function numero(texto) {
  const n = Number.parseFloat(String(texto).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

// Tabla "Cuadro 1" del Banguat: fila "Mes" con años como columnas, filas Enero..Diciembre y Total
export function parsearRemesas(html) {
  const tabla = /<table[\s\S]*?<\/table>/i.exec(html ?? '');
  if (!tabla) return null;
  const filas = [...tabla[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((f) =>
    [...f[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => limpiarCelda(c[1]))
  );

  // El Cuadro 2 (variaciones %) va en la misma tabla: solo se lee hasta la segunda fila "Mes"
  const inicio = filas.findIndex((f) => f.includes('Mes'));
  if (inicio === -1) return null;
  const cabecera = filas[inicio];
  const colMes = cabecera.indexOf('Mes');
  const anios = {};
  cabecera.forEach((c, i) => { if (/^\d{4}$/.test(c)) anios[c] = i; });

  const porAnio = {};
  for (const anio of Object.keys(anios)) porAnio[anio] = {};
  for (const f of filas.slice(inicio + 1)) {
    if (f.includes('Mes')) break;
    const nombre = f[colMes]?.toLowerCase();
    const idxMes = MESES.indexOf(nombre);
    if (idxMes === -1 && nombre !== 'total') continue;
    for (const [anio, col] of Object.entries(anios)) {
      const v = numero(f[col]);
      if (v !== null) porAnio[anio][idxMes === -1 ? 'total' : idxMes + 1] = v;
    }
  }
  return porAnio;
}

export function resumirRemesas(porAnio, anio) {
  const datos = porAnio?.[String(anio)];
  const previo = porAnio?.[String(anio - 1)];
  if (!datos) return null;
  const meses = Object.keys(datos).filter((k) => k !== 'total').map(Number).sort((a, b) => a - b);
  if (meses.length === 0) return null;
  const ultimoMes = meses[meses.length - 1];
  const suma = (d, hasta) => meses.filter((m) => m <= hasta).reduce((s, m) => s + (d?.[m] ?? 0), 0);
  return {
    mes: ultimoMes,
    periodo: `${MESES[ultimoMes - 1][0].toUpperCase()}${MESES[ultimoMes - 1].slice(1)} ${anio}`,
    valor: datos[ultimoMes],
    mesesAcumulados: ultimoMes,
    acumuladoAnio: Number(suma(datos, ultimoMes).toFixed(1)),
    acumuladoAnioAnterior: previo ? Number(suma(previo, ultimoMes).toFixed(1)) : null,
    totalAnioAnterior: previo?.total ?? null
  };
}

export function diasDesde(iso, hoy) {
  return Math.floor((new Date(hoy + 'T00:00:00Z') - new Date(iso + 'T00:00:00Z')) / 86_400_000);
}

export function mesDeIso(iso) {
  const m = Number(iso.slice(5, 7));
  return MESES[m - 1];
}

// Agrega a cada indicador si está viejo y la etiqueta "dato de <mes>"
export function anotarAntiguedad(indicadores, hoyIso) {
  const salida = {};
  for (const [clave, ind] of Object.entries(indicadores)) {
    const dias = diasDesde(ind.fecha, hoyIso);
    const viejo = dias > DIAS_PARA_MARCAR_VIEJO;
    const mesPeriodo = /^[A-Za-zñ]+ \d{4}$/.test(ind.periodo ?? '') ? ind.periodo.split(' ')[0].toLowerCase() : mesDeIso(ind.fecha);
    salida[clave] = { ...ind, diasDesde: dias, viejo, etiqueta: viejo ? `dato de ${mesPeriodo}` : null };
  }
  return salida;
}
