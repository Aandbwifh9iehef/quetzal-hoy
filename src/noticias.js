import { parsearRss } from './rss.js';

export const MODELO_IA = '@cf/meta/llama-3.1-8b-instruct';
// Estimación de neuronas por token según la tabla de precios de Workers AI para este modelo
// (US$0.282 / M tokens de entrada y US$0.827 / M de salida; 1,000 neuronas = US$0.011).
export const NEURONAS_POR_TOKEN = { entrada: 0.02564, salida: 0.07518 };
export const CLAVE_ULTIMO = 'noticias:ultimo';
export const CLAVE_INDICE = 'noticias:indice';
export const CLAVE_USO = 'noticias:uso';
export const DIAS_ARCHIVO = 30;
export const CUOTA = { guatemala: 5, mundo: 3 };

const CLAVES = [
  [3, ['econom', 'quetzal', 'dólar', 'dolar', 'tipo de cambio', 'remesa', 'inflaci', 'banguat', 'impuesto', 'tributar', ' sat ', 'salario', 'sueldo', 'canasta básica', 'combustible', 'gasolina', 'diésel', 'diesel', 'banco', 'bancari', 'crédito', 'credito', 'préstamo', 'prestamo', 'tasa de interés', 'tasa líder', 'inversi', 'bolsa', ' pib', 'exportaci', 'importaci', 'arancel', 'deuda', 'presupuesto', 'desempleo', 'empleo', 'igss', 'pensi', 'ahorro', 'finanz', 'fiscal', 'petróleo', 'petroleo', 'reserva federal', ' fed ', 'recesión', 'superintendencia de bancos', ' sib', 'cooperativa', 'hipoteca', 'tarifa', 'junta monetaria', 'política monetaria', 'fondo monetario', ' fmi', 'banco mundial', 'bce ', 'wall street', 'mercado', 'precio']],
  [2, ['empresa', 'comercio', 'industria', 'producci', 'crecimiento', 'vivienda', 'energía', 'electricidad', 'turismo', 'agricult', 'café', 'azúcar', 'cardamomo', 'banano', 'minería', 'contrato', 'licitaci', 'inversionista', 'consumidor', 'aduana', 'puerto', 'migra', 'cripto', 'bitcoin', 'nearshoring', 'zona franca', 'tratado', 'plan de pensiones', 'jubilaci', 'factura', 'cobro', 'pago']],
  [-6, ['fútbol', 'futbol', 'selección nacional', 'liga nacional', 'horóscopo', 'farándula', 'concierto', 'miss universo', 'partido amistoso', 'mundial de', 'champions', 'nfl', 'nba', 'béisbol']]
];

export function puntuarFinanciera(item, fuente = {}) {
  const t = ` ${item.titulo} ${item.descripcion ?? ''} `.toLowerCase();
  let puntos = fuente.seccionEconomica ? 3 : 0;
  for (const [peso, lista] of CLAVES) {
    for (const k of lista) {
      if (t.includes(k)) puntos += peso;
    }
  }
  return puntos;
}

export function esFinanciera(item, fuente = {}) {
  return puntuarFinanciera(item, fuente) >= 3;
}

const VACIAS = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'del', 'por', 'con', 'para', 'un', 'una', 'que', 'se', 'su', 'sus', 'al', 'lo', 'es', 'más', 'mas', 'como', 'este', 'esta', 'tras', 'sobre', 'ante', 'hasta', 'desde', 'entre', 'sin', 'ya', 'no', 'estos', 'estas', 'son', 'ser', 'hay', 'cómo', 'como', 'qué', 'quien', 'quién', 'nuevo', 'nueva']);

export function palabrasClave(titulo) {
  return new Set(
    titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').split(/\s+/).filter((p) => p.length > 2 && !VACIAS.has(p))
  );
}

export function similitud(a, b) {
  const A = palabrasClave(a), B = palabrasClave(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const p of A) if (B.has(p)) inter++;
  return inter / (A.size + B.size - inter);
}

function palabrasComunes(a, b) {
  const B = palabrasClave(b);
  let n = 0;
  for (const p of palabrasClave(a)) if (B.has(p)) n++;
  return n;
}

// Misma noticia si los titulares se parecen mucho, o si comparten varias palabras concretas
export function esMismaNoticia(a, b) {
  if (a.enlace === b.enlace) return true;
  const sim = similitud(a.titulo, b.titulo);
  return sim >= 0.5 || (sim >= 0.25 && palabrasComunes(a.titulo, b.titulo) >= 3);
}

export function quitarDuplicados(items) {
  const salida = [];
  for (const it of items) {
    if (!salida.some((s) => esMismaNoticia(s, it))) salida.push(it);
  }
  return salida;
}

// Primero reparte entre medios (tope por fuente); si aún faltan, rellena con lo mejor que quede
export function elegir(items, n, maxPorFuente = 3) {
  const ordenados = [...items].sort((a, b) => (b.puntos - a.puntos) || ((b.fecha ?? '').localeCompare(a.fecha ?? '')));
  const porFuente = {};
  const salida = [];
  const sobrantes = [];
  for (const it of ordenados) {
    porFuente[it.fuente] = (porFuente[it.fuente] ?? 0) + 1;
    if (salida.length < n && porFuente[it.fuente] <= maxPorFuente) salida.push(it);
    else sobrantes.push(it);
  }
  for (const it of sobrantes) {
    if (salida.length >= n) break;
    salida.push(it);
  }
  return salida;
}

// Cada cifra se guarda con sus dos lecturas posibles ("20,015.7" → 20015.7 o 20.0157)
export function variantesCifra(texto) {
  const limpio = texto.replace(/[.,]$/, '');
  return [limpio.replace(/,/g, ''), limpio.replace(/\./g, '').replace(/,/g, '.')];
}

export function extraerCifras(texto) {
  const cifras = new Set();
  for (const m of (texto ?? '').matchAll(/\d[\d.,]*/g)) for (const v of variantesCifra(m[0])) cifras.add(v);
  return cifras;
}

// Cuenta puntos finales reales; ignora abreviaturas como "EE. UU." o "Q4.5"
function contarFrases(t) {
  const n = (t.match(/[a-záéíóúñ0-9%)»”"'][.!?]+(?=\s+[A-ZÁÉÍÓÚÑ¿¡“"]|\s*$)/g) ?? []).length;
  return n || (t.trim() ? 1 : 0);
}

export function validarResumen(resumen, afecta, textoFuente) {
  if (!resumen || typeof resumen !== 'string' || !afecta || typeof afecta !== 'string') return { ok: false, motivo: 'vacío' };
  resumen = resumen.trim(); afecta = afecta.trim();
  if (resumen.length > 320 || afecta.length > 200) return { ok: false, motivo: 'muy largo' };
  if (contarFrases(resumen) > 2) return { ok: false, motivo: 'resumen con más de 2 frases' };
  if (contarFrases(afecta) > 1) return { ok: false, motivo: '"cómo te afecta" con más de 1 frase' };
  const permitidas = extraerCifras(textoFuente);
  for (const m of (resumen + ' ' + afecta).matchAll(/\d[\d.,]*/g)) {
    if (!variantesCifra(m[0]).some((v) => permitidas.has(v))) return { ok: false, motivo: `cifra no presente en la fuente: ${m[0]}` };
  }
  return { ok: true };
}

export function construirPrompt(item) {
  return [
    {
      role: 'system',
      content:
        'Eres un redactor de noticias económicas para gente común de Guatemala. Escribes en español sencillo, de tú, frases cortas, sin jerga. ' +
        'Usas SOLO la información del titular y la descripción que te dan. No inventes cifras, nombres ni causas. Si no hay suficiente información, deja los campos vacíos. ' +
        'Responde únicamente con un JSON de esta forma: {"resumen": "máximo 2 frases", "afecta": "1 frase que empieza con un verbo o con \'Si...\' explicando cómo afecta a una persona común"}.'
    },
    { role: 'user', content: `Titular: ${item.titulo}\nDescripción: ${item.descripcion || '(sin descripción)'}` }
  ];
}

function extraerJson(texto) {
  const m = /\{[\s\S]*\}/.exec(texto ?? '');
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

export async function generarResumen(ai, item) {
  const respuesta = await ai.run(MODELO_IA, { messages: construirPrompt(item), max_tokens: 200, temperature: 0.2 });
  const uso = { entrada: respuesta?.usage?.prompt_tokens ?? 0, salida: respuesta?.usage?.completion_tokens ?? 0 };
  const json = extraerJson(respuesta?.response);
  const val = validarResumen(json?.resumen, json?.afecta, `${item.titulo} ${item.descripcion}`);
  return { ok: val.ok, motivo: val.motivo, resumen: val.ok ? json.resumen.trim() : null, afecta: val.ok ? json.afecta.trim() : null, uso };
}

export function neuronasEstimadas(uso) {
  return Math.round(uso.entrada * NEURONAS_POR_TOKEN.entrada + uso.salida * NEURONAS_POR_TOKEN.salida);
}

async function leerFuente(fuente, fetchFn) {
  const res = await fetchFn(fuente.url, { headers: { 'User-Agent': 'Mozilla/5.0 QuetzalHoy/1.0 (+https://hoy.compoundclub.fyi)' }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parsearRss(await res.text());
}

export async function recolectar(fuentes, fetchFn, ahora) {
  const limite = ahora.getTime() - 48 * 3600_000;
  const items = [];
  const errores = [];
  for (const f of fuentes) {
    try {
      const lista = await leerFuente(f, fetchFn);
      for (const it of lista) {
        if (it.fecha && Date.parse(it.fecha) < limite) continue;
        const puntos = puntuarFinanciera(it, f);
        if (puntos < 3) continue;
        items.push({ ...it, fuente: f.id, medio: f.nombre, region: f.region, puntos });
      }
    } catch (err) {
      errores.push(`${f.id}: ${err.message}`);
    }
  }
  return { items, errores };
}

export async function actualizarNoticias(env, { fuentes, fetchFn = fetch, ai = env.AI, ahora = new Date() }) {
  const hoy = ahora.toISOString().slice(0, 10);
  const { items, errores } = await recolectar(fuentes, fetchFn, ahora);
  const unicos = quitarDuplicados(items);
  const elegidas = {
    guatemala: elegir(unicos.filter((i) => i.region === 'guatemala'), CUOTA.guatemala),
    mundo: elegir(unicos.filter((i) => i.region === 'mundo'), CUOTA.mundo, 2)
  };

  const uso = { entrada: 0, salida: 0, resumenes: 0, descartados: 0, sinIa: 0 };
  const salida = { fecha: hoy, generado: ahora.toISOString(), guatemala: [], mundo: [] };
  for (const region of ['guatemala', 'mundo']) {
    for (const it of elegidas[region]) {
      const noticia = { titulo: it.titulo, enlace: it.enlace, medio: it.medio, fecha: it.fecha, resumen: null, afecta: null };
      if (ai) {
        try {
          const r = await generarResumen(ai, it);
          uso.entrada += r.uso.entrada; uso.salida += r.uso.salida;
          if (r.ok) { noticia.resumen = r.resumen; noticia.afecta = r.afecta; uso.resumenes++; }
          else uso.descartados++;
        } catch {
          uso.sinIa++;
        }
      } else {
        uso.sinIa++;
      }
      salida[region].push(noticia);
    }
  }
  uso.neuronas = neuronasEstimadas(uso);
  salida.uso = uso;
  salida.errores = errores;

  const indice = ((await env.DATA.get(CLAVE_INDICE, 'json')) ?? []).filter((d) => d !== hoy);
  indice.unshift(hoy);
  const indiceFinal = indice.slice(0, DIAS_ARCHIVO);
  await env.DATA.put(`noticias:${hoy}`, JSON.stringify(salida), { expirationTtl: (DIAS_ARCHIVO + 2) * 86400 });
  await env.DATA.put(CLAVE_ULTIMO, JSON.stringify(salida));
  await env.DATA.put(CLAVE_INDICE, JSON.stringify(indiceFinal));
  const log = ((await env.DATA.get(CLAVE_USO, 'json')) ?? []).filter((u) => u.fecha !== hoy);
  log.unshift({ fecha: hoy, ...uso });
  await env.DATA.put(CLAVE_USO, JSON.stringify(log.slice(0, DIAS_ARCHIVO)));

  return salida;
}
