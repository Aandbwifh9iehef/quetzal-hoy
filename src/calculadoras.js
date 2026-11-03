export const ISR_INTERESES = 0.10;

const redondear = (n) => Math.round(n * 100) / 100;

function validar(...valores) {
  return valores.every((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0);
}

// Ahorro mensual con interés compuesto (capitalización mensual, aporte al final de cada mes)
export function ahorroMensual({ aporte, tasaAnual, meses, inicial = 0 }) {
  if (!validar(aporte, tasaAnual, meses, inicial) || meses < 1) return null;
  const r = tasaAnual / 100 / 12;
  const n = Math.floor(meses);
  const factor = Math.pow(1 + r, n);
  const total = r === 0 ? inicial + aporte * n : inicial * factor + aporte * ((factor - 1) / r);
  const aportado = inicial + aporte * n;
  return { total: redondear(total), aportado: redondear(aportado), intereses: redondear(total - aportado) };
}

// Plazo fijo con interés simple nominal anual (como lo calculan los bancos en Guatemala), ISR 10% sobre intereses
export function plazoFijo({ monto, tasaAnual, dias, isr = ISR_INTERESES }) {
  if (!validar(monto, tasaAnual, dias) || dias < 1) return null;
  const interes = monto * (tasaAnual / 100) * (dias / 365);
  const impuesto = interes * isr;
  const neto = interes - impuesto;
  return { interes: redondear(interes), isr: redondear(impuesto), neto: redondear(neto), total: redondear(monto + neto) };
}

// Cuánto poder de compra pierde un monto guardado en casa, según la inflación anual
export function perdidaInflacion({ monto, inflacionAnual, anios }) {
  if (!validar(monto, inflacionAnual, anios)) return null;
  const valorReal = monto / Math.pow(1 + inflacionAnual / 100, anios);
  return { valorReal: redondear(valorReal), perdida: redondear(monto - valorReal), porcentaje: redondear((1 - valorReal / monto) * 100) };
}

// Aporte mensual necesario para llegar a una meta (interés compuesto mensual)
export function metaAhorro({ meta, meses, tasaAnual, inicial = 0 }) {
  if (!validar(meta, meses, tasaAnual, inicial) || meses < 1) return null;
  const r = tasaAnual / 100 / 12;
  const n = Math.floor(meses);
  const factor = Math.pow(1 + r, n);
  const faltante = meta - inicial * factor;
  if (faltante <= 0) return { aporte: 0, totalAportado: redondear(inicial), intereses: redondear(inicial * factor - inicial) };
  const aporte = r === 0 ? faltante / n : faltante * r / (factor - 1);
  const totalAportado = inicial + aporte * n;
  return { aporte: redondear(aporte), totalAportado: redondear(totalAportado), intereses: redondear(meta - totalAportado) };
}
