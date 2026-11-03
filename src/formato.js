const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatearQuetzales(valor, decimales = 2) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return '—';
  const partes = valor.toFixed(decimales).split('.');
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'Q ' + partes.join('.');
}

export function formatearFecha(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function diasDesde(fecha, hoy = new Date()) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((hoy - d) / 86_400_000);
}
