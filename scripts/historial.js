// Descarga 2 años de tipo de cambio del Banguat y los guarda en data/tipo-cambio-historial.json
import { writeFileSync } from 'node:fs';
import { consultarRango } from '../src/banguat.js';

const hoy = new Date();
const hace2anios = new Date(hoy);
hace2anios.setUTCFullYear(hoy.getUTCFullYear() - 2);
const iso = (d) => d.toISOString().slice(0, 10);

const datos = await consultarRango(iso(hace2anios), iso(hoy));
if (datos.length < 300) throw new Error(`Solo llegaron ${datos.length} días; algo falló`);

const salida = new URL('../data/tipo-cambio-historial.json', import.meta.url);
writeFileSync(salida, JSON.stringify({ fuente: 'Banco de Guatemala', descargado: hoy.toISOString(), datos }));
console.log(`${datos.length} días guardados (${datos[0].fecha} → ${datos.at(-1).fecha})`);
