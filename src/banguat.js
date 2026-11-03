export const BANGUAT_URL = 'https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx';
const NS = 'http://www.banguat.gob.gt/variables/ws/';

function sobre(cuerpo) {
  return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${cuerpo}</soap:Body></soap:Envelope>`;
}

async function llamar(metodo, cuerpo, fetchFn = fetch) {
  const res = await fetchFn(BANGUAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: NS + metodo },
    body: sobre(cuerpo),
    signal: AbortSignal.timeout(20_000)
  });
  if (!res.ok) throw new Error(`Banguat respondió ${res.status}`);
  return res.text();
}

// "03/11/2026" → "2026-11-03"
export function aIso(ddmmaaaa) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmaaaa?.trim() ?? '');
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// "2026-11-03" → "03/11/2026"
export function aBanguat(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Fecha inválida: ${iso}`);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function etiqueta(xml, nombre) {
  const m = new RegExp(`<${nombre}>([^<]*)</${nombre}>`).exec(xml);
  return m ? m[1].trim() : null;
}

function numero(texto) {
  const n = Number.parseFloat(texto);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parsearTipoCambioDia(xml) {
  const bloque = /<VarDolar>([\s\S]*?)<\/VarDolar>/.exec(xml ?? '');
  if (!bloque) return null;
  const fecha = aIso(etiqueta(bloque[1], 'fecha'));
  const valor = numero(etiqueta(bloque[1], 'referencia'));
  if (!fecha || !valor) return null;
  return { fecha, valor };
}

export function parsearTipoCambioRango(xml) {
  const salida = [];
  const re = /<Var>([\s\S]*?)<\/Var>/g;
  let m;
  while ((m = re.exec(xml ?? ''))) {
    if (etiqueta(m[1], 'moneda') !== '2') continue;
    const fecha = aIso(etiqueta(m[1], 'fecha'));
    const valor = numero(etiqueta(m[1], 'venta')) ?? numero(etiqueta(m[1], 'compra'));
    if (fecha && valor) salida.push({ fecha, valor });
  }
  return salida.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function consultarDia(fetchFn) {
  const xml = await llamar('TipoCambioDia', `<TipoCambioDia xmlns="${NS}" />`, fetchFn);
  const dato = parsearTipoCambioDia(xml);
  if (!dato) throw new Error('Respuesta del Banguat sin dato del día');
  return dato;
}

export async function consultarRango(desdeIso, hastaIso, fetchFn) {
  const xml = await llamar(
    'TipoCambioRango',
    `<TipoCambioRango xmlns="${NS}"><fechainit>${aBanguat(desdeIso)}</fechainit><fechafin>${aBanguat(hastaIso)}</fechafin></TipoCambioRango>`,
    fetchFn
  );
  return parsearTipoCambioRango(xml);
}
