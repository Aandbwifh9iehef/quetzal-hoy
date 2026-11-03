// Digital Asset Links: le dice a Android que la app de Play y el sitio son del mismo dueño
export function assetLinks(android = {}) {
  const huellas = (android.sha256 ?? []).map((h) => h.replace(/\s/g, '').toUpperCase()).filter((h) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(h));
  if (!android.paquete || huellas.length === 0) return [];
  return [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: android.paquete, sha256_cert_fingerprints: huellas }
  }];
}
