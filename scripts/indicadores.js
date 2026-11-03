// Actualiza en data/indicadores.json los indicadores con fuente automatizable (hoy: remesas del Banguat).
// Los demás conservan su valor y fecha; se ven en la app con la fecha visible.
import { readFileSync, writeFileSync } from 'node:fs';
import { parsearRemesas, resumirRemesas } from '../src/indicadores.js';

const ruta = new URL('../data/indicadores.json', import.meta.url);
const datos = JSON.parse(readFileSync(ruta, 'utf8'));
const hoy = new Date().toISOString().slice(0, 10);
const anio = Number(hoy.slice(0, 4));
const cambios = [];

try {
  const res = await fetch(datos.indicadores.remesas.url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = new TextDecoder('latin1').decode(await res.arrayBuffer());
  const resumen = resumirRemesas(parsearRemesas(html), anio) ?? resumirRemesas(parsearRemesas(html), anio - 1);
  if (!resumen) throw new Error('No se pudo leer la tabla');
  const r = datos.indicadores.remesas;
  if (r.periodo !== resumen.periodo || r.valor !== resumen.valor) {
    Object.assign(r, resumen, { fecha: hoy });
    delete r.mes;
    cambios.push(`remesas → ${resumen.periodo}: US$${resumen.valor} millones`);
  }
} catch (err) {
  console.error(`Remesas: no se actualizó (${err.message}); se conserva el dato de ${datos.indicadores.remesas.periodo}`);
}

for (const [clave, ind] of Object.entries(datos.indicadores)) {
  if (!ind.automatico) console.log(`${clave}: manual, dato de ${ind.periodo} (fecha ${ind.fecha})`);
}

if (cambios.length) {
  datos.actualizado = hoy;
  writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n');
  console.log('Actualizado:', cambios.join('; '));
} else {
  console.log('Sin cambios.');
}
