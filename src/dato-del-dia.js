import { formatearQuetzales } from './formato.js';

const q = (n, d = 0) => formatearQuetzales(n, d);
const usd = (n, d = 0) => '$' + n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const pct = (n, d = 1) => n.toFixed(d).replace('.', '.') + '%';
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const mes = (periodo) => (periodo ?? '').split(' ')[0].toLowerCase();

// Factor acumulado de inflación desde el 1 de enero de `desde` hasta hoy (usa dic/dic + acumulada del año en curso)
export function factorInflacion(inflacionAnual, acumuladaAnioActual, desde, anioActual) {
  let f = 1;
  for (let a = desde; a < anioActual; a++) {
    const v = inflacionAnual[String(a)];
    if (v == null) return null;
    f *= 1 + v / 100;
  }
  return f * (1 + (acumuladaAnioActual ?? 0) / 100);
}

// Cada plantilla recibe el contexto y devuelve { titulo, texto, fuente } o null si falta un dato
export const PLANTILLAS = [
  {
    id: 'poder-compra-5-anios',
    fn: ({ ind, ref, anio }) => {
      const f = factorInflacion(ref['inflacion-anual'].valores, ind.inflacion.acumulada, anio - 5, anio);
      if (!f) return null;
      return {
        titulo: `Q100 de hace 5 años`,
        texto: `Lo que comprabas con Q100 en enero de ${anio - 5} hoy cuesta ${q(100 * f, 2)}. Los precios han subido ${pct((f - 1) * 100)} desde entonces.`,
        fuente: 'INE, inflación de diciembre a diciembre'
      };
    }
  },
  {
    id: 'remesas-anio-quetzales',
    fn: ({ ind, tc }) => {
      if (!tc.valor) return null;
      const r = ind.remesas;
      const total = r.acumuladoAnio * 1e6 * tc.valor;
      return {
        titulo: 'Las remesas del año, en quetzales',
        texto: `De enero a ${mes(r.periodo)} entraron ${usd(r.acumuladoAnio)} millones en remesas. Al tipo de cambio de hoy son unos ${q(total / 1e9, 1).replace('Q ', 'Q ')} mil millones.`,
        fuente: 'Banguat'
      };
    }
  },
  {
    id: 'remesas-por-dia',
    fn: ({ ind }) => {
      const r = ind.remesas;
      const dias = r.mesesAcumulados * 30.4;
      return {
        titulo: 'Remesas cada día',
        texto: `En lo que va del año entran en promedio ${usd((r.acumuladoAnio / dias))} millones de dólares en remesas cada día.`,
        fuente: 'Banguat'
      };
    }
  },
  {
    id: 'remesas-por-segundo',
    fn: ({ ind }) => {
      const r = ind.remesas;
      const porSeg = (r.valor * 1e6) / (30 * 86400);
      return {
        titulo: 'Remesas cada segundo',
        texto: `En ${mes(r.periodo)} llegaron ${usd(r.valor)} millones en remesas: unos ${usd(porSeg)} cada segundo, día y noche.`,
        fuente: 'Banguat'
      };
    }
  },
  {
    id: 'remesas-vs-anio-pasado',
    fn: ({ ind }) => {
      const r = ind.remesas;
      if (!r.acumuladoAnioAnterior) return null;
      const var_ = (r.acumuladoAnio / r.acumuladoAnioAnterior - 1) * 100;
      return {
        titulo: 'Remesas: este año vs. el pasado',
        texto: `Hasta ${mes(r.periodo)}, las remesas ${var_ >= 0 ? 'crecieron' : 'cayeron'} ${pct(Math.abs(var_))} frente al mismo período del año pasado (${usd(r.acumuladoAnio)} millones contra ${usd(r.acumuladoAnioAnterior)} millones).`,
        fuente: 'Banguat'
      };
    }
  },
  {
    id: 'remesa-100-dolares-hace-un-anio',
    fn: ({ tc }) => {
      if (!tc.hace1anio) return null;
      const hoy = 100 * tc.valor, antes = 100 * tc.hace1anio.valor;
      const dif = hoy - antes;
      return {
        titulo: 'Una remesa de $100',
        texto: `Hoy $100 se cambian por ${q(hoy, 2)}. Hace un año eran ${q(antes, 2)}: ${dif >= 0 ? 'ganas' : 'recibes'} ${q(Math.abs(dif), 2)} ${dif >= 0 ? 'más' : 'menos'} por la misma remesa.`,
        fuente: 'Banguat, tipo de cambio de referencia'
      };
    }
  },
  {
    id: 'canasta-familia-4',
    fn: ({ ind, ref }) => {
      const c = ind['canasta-basica'];
      const s = ref['salario-minimo'];
      const familia = c.urbana * 4;
      const sueldo = s.valor + (s.bonificacion ?? 0);
      return {
        titulo: 'Comida para una familia de 4',
        texto: `Solo en alimentos, una familia urbana de 4 personas necesita ${q(familia, 2)} al mes. Eso es el ${pct((familia / sueldo) * 100, 0)} de un salario mínimo con bonificación (${q(sueldo, 2)}).`,
        fuente: 'INE y Acuerdo Gubernativo 256-2025'
      };
    }
  },
  {
    id: 'salario-minimo-en-dolares',
    fn: ({ ref, tc }) => {
      if (!tc.valor) return null;
      const s = ref['salario-minimo'];
      const sueldo = s.valor + (s.bonificacion ?? 0);
      return {
        titulo: 'El salario mínimo en dólares',
        texto: `El salario mínimo con bonificación (${q(sueldo, 2)}) equivale hoy a ${usd(sueldo / tc.valor)} al mes, al tipo de cambio de referencia.`,
        fuente: 'Acuerdo Gubernativo 256-2025 y Banguat'
      };
    }
  },
  {
    id: 'tanque-gasolina',
    fn: ({ ind, tc }) => {
      if (!tc.valor) return null;
      const c = ind.combustibles;
      const tanque = 10 * c.regular;
      return {
        titulo: 'Llenar el tanque',
        texto: `Un tanque de 10 galones de gasolina regular cuesta ${q(tanque, 2)} con el precio de referencia (${usd(tanque / tc.valor)}). Con superior serían ${q(10 * c.superior, 2)}.`,
        fuente: 'MEM y Banguat'
      };
    }
  },
  {
    id: 'superior-vs-regular',
    fn: ({ ind }) => {
      const c = ind.combustibles;
      const dif = c.superior - c.regular;
      return {
        titulo: 'Superior o regular',
        texto: `La gasolina superior cuesta ${q(dif, 2)} más por galón que la regular. Si cargas 40 galones al mes, la diferencia son ${q(dif * 40, 2)} mensuales o ${q(dif * 480, 2)} al año.`,
        fuente: 'MEM'
      };
    }
  },
  {
    id: 'diesel-vs-regular',
    fn: ({ ind }) => {
      const c = ind.combustibles;
      return {
        titulo: 'El diésel y el transporte',
        texto: `El diésel está en ${q(c.diesel, 2)} por galón, ${q(c.diesel - c.regular, 2)} más que la gasolina regular. Como camiones y buses usan diésel, su precio se nota en el pasaje y en la comida.`,
        fuente: 'MEM'
      };
    }
  },
  {
    id: 'inflacion-vs-meta',
    fn: ({ ind, ref }) => {
      const i = ind.inflacion.valor;
      const m = ref['meta-inflacion'];
      const estado = i > m.valor + m.margen ? 'arriba del rango' : i < m.valor - m.margen ? 'abajo del rango' : 'dentro del rango';
      return {
        titulo: 'La inflación y su meta',
        texto: `La inflación de ${mes(ind.inflacion.periodo)} fue ${pct(i, 2)}. La meta del Banguat es ${m.valor}% con un margen de ±${m.margen}%, así que está ${estado}.`,
        fuente: 'INE y Banguat'
      };
    }
  },
  {
    id: 'tasa-lider-vs-inflacion',
    fn: ({ ind }) => {
      const real = ind['tasa-lider'].valor - ind.inflacion.valor;
      return {
        titulo: 'Tasa líder contra inflación',
        texto: `La tasa líder es ${pct(ind['tasa-lider'].valor, 2)} y la inflación ${pct(ind.inflacion.valor, 2)}. Un ahorro que rinda igual que la tasa líder ${real < 0 ? 'pierde' : 'gana'} ${pct(Math.abs(real), 2)} de poder de compra al año.`,
        fuente: 'Banguat e INE'
      };
    }
  },
  {
    id: 'guardar-en-casa',
    fn: ({ ind }) => {
      const perdida = 1000 - 1000 / (1 + ind.inflacion.valor / 100);
      return {
        titulo: 'Q1,000 debajo del colchón',
        texto: `Si guardas Q1,000 en casa durante un año con la inflación actual (${pct(ind.inflacion.valor, 2)}), al final compran lo que hoy compras con ${q(1000 - perdida, 2)}. Pierdes ${q(perdida, 2)} sin que nadie te los quite.`,
        fuente: 'INE'
      };
    }
  },
  {
    id: 'inflacion-acumulada-anio',
    fn: ({ ind, anio }) => {
      const a = ind.inflacion.acumulada;
      if (a == null) return null;
      return {
        titulo: 'Lo que subieron los precios este año',
        texto: `De enero a ${mes(ind.inflacion.periodo)} de ${anio} los precios subieron ${pct(a, 2)}. Q1,000 de enero hoy compran lo mismo que ${q(1000 / (1 + a / 100), 2)}.`,
        fuente: 'INE'
      };
    }
  },
  {
    id: 'rango-dolar-anio',
    fn: ({ tc }) => {
      if (!tc.serie1a || tc.serie1a.length < 30) return null;
      let min = tc.serie1a[0], max = tc.serie1a[0];
      for (const d of tc.serie1a) { if (d.valor < min.valor) min = d; if (d.valor > max.valor) max = d; }
      return {
        titulo: 'El dólar en el último año',
        texto: `En los últimos 12 meses el dólar se movió entre ${q(min.valor, 4)} (${fechaCorta(min.fecha)}) y ${q(max.valor, 4)} (${fechaCorta(max.fecha)}). Hoy está en ${q(tc.valor, 4)}.`,
        fuente: 'Banguat'
      };
    }
  },
  {
    id: 'canasta-rural-vs-urbana',
    fn: ({ ind }) => {
      const c = ind['canasta-basica'];
      return {
        titulo: 'Comer en el campo y en la ciudad',
        texto: `La canasta básica de alimentos cuesta ${q(c.urbana, 2)} por persona al mes en el área urbana y ${q(c.rural, 2)} en la rural: ${pct((c.urbana / c.rural - 1) * 100, 0)} de diferencia.`,
        fuente: 'INE'
      };
    }
  },
  {
    id: 'ahorrar-10-por-ciento',
    fn: ({ ref }) => {
      const s = ref['salario-minimo'];
      const sueldo = s.valor + (s.bonificacion ?? 0);
      const mensual = sueldo * 0.1;
      return {
        titulo: 'Ahorrar el 10%',
        texto: `Guardar el 10% de un salario mínimo con bonificación son ${q(mensual, 2)} al mes. En un año juntas ${q(mensual * 12, 2)} sin contar intereses.`,
        fuente: 'Acuerdo Gubernativo 256-2025'
      };
    }
  },
  {
    id: 'remesas-anio-pasado-total',
    fn: ({ ind, tc }) => {
      const r = ind.remesas;
      if (!r.totalAnioAnterior || !tc.valor) return null;
      return {
        titulo: 'Las remesas de todo un año',
        texto: `En todo el año pasado llegaron ${usd(r.totalAnioAnterior)} millones en remesas. Al tipo de cambio de hoy son más de ${q(Math.floor((r.totalAnioAnterior * tc.valor) / 1000))} mil millones.`,
        fuente: 'Banguat'
      };
    }
  }
];

function fechaCorta(iso) {
  const p = iso.split('-');
  return `${Number(p[2])} ${MESES[Number(p[1]) - 1].slice(0, 3)}`;
}

function diaDelAnio(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86_400_000);
}

export function construirContexto({ indicadores, tipoCambio, hoyIso }) {
  const serie1a = tipoCambio?.series?.['1a'] ?? [];
  return {
    ind: indicadores.indicadores,
    ref: indicadores.referencias,
    anio: Number(hoyIso.slice(0, 4)),
    tc: {
      valor: tipoCambio?.valor,
      fecha: tipoCambio?.fecha,
      serie1a,
      hace1anio: serie1a.length ? serie1a[0] : null
    }
  };
}

export function todosLosDatos(ctx) {
  const salida = [];
  for (const p of PLANTILLAS) {
    try {
      const r = p.fn(ctx);
      if (r && !/NaN|undefined|null/.test(r.texto)) salida.push({ id: p.id, ...r });
    } catch {
      // una plantilla sin datos no rompe las demás
    }
  }
  return salida;
}

export function datoDelDia(ctx, hoyIso) {
  const lista = todosLosDatos(ctx);
  if (lista.length === 0) return null;
  return lista[diaDelAnio(hoyIso) % lista.length];
}
