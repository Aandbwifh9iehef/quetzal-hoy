import { createHash } from 'node:crypto';

// Los códigos de acceso se guardan en site.config.json como SHA-256 (nunca en claro)
export function sha256Hex(texto) {
  return createHash('sha256').update(String(texto).trim().toUpperCase()).digest('hex');
}

export function verificarCodigo(codigo, codigosSha256 = []) {
  if (!codigo || !codigo.trim()) return false;
  return codigosSha256.includes(sha256Hex(codigo));
}

// Un curso solo se bloquea si está marcado premium Y el cobro está activo Y la persona no lo desbloqueó
export function cursoBloqueado(curso, premium = {}, desbloqueados = {}) {
  return Boolean(curso.premium && premium.activo && !desbloqueados[curso.id]);
}

// Lo que el API expone del bloque premium: nunca los hashes
export function premiumPublico(premium = {}) {
  return { activo: Boolean(premium.activo), precio: premium.precio || '', urlPago: premium.urlPago || '', contacto: premium.contacto || '' };
}
