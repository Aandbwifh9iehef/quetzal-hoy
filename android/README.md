# Quetzal Hoy en Google Play

La app de Play es una "Trusted Web Activity" (TWA): un envoltorio Android que abre la web publicada en
`hoy.compoundclub.fyi` a pantalla completa, sin barra de navegador. Toda la app vive en la web, así que
**las actualizaciones no pasan por Play**: lo que se publique en `main` lo ven los usuarios de la app al instante.

Requisito previo: la web debe estar publicada en https://hoy.compoundclub.fyi (fase 2, pasos de Cloudflare).

## Ruta recomendada: PWABuilder (sin instalar nada)

1. Entra a https://www.pwabuilder.com y pega `https://hoy.compoundclub.fyi` → **Start**.
2. Cuando termine el análisis, pulsa **Package for stores** → **Android** → **Generate package**.
3. En el formulario deja los valores que trae del manifest y revisa:
   - Package ID: `fyi.compoundclub.hoy`
   - App name: `Quetzal Hoy` · Launcher name: `Quetzal Hoy`
   - Version: `1.0.0.0` · Version code: `1`
   - Display mode: `Standalone` · Status bar color: `#1B4332`
   - Signing key: **Create new** (PWABuilder crea la llave de firma por ti).
4. Pulsa **Download** y guarda el `.zip`. Dentro vienen:
   - `app-release-bundle.aab` → este es el archivo que se sube a Play.
   - `signing.keystore` y `signing-key-info.txt` (contraseñas) → **guárdalos fuera del repo**, en un lugar seguro
     (una carpeta en Documentos y una copia en tu nube). Si los pierdes, no podrás actualizar la app en Play.
   - `assetlinks.json` → ábrelo y copia la huella que aparece en `sha256_cert_fingerprints`
     (tiene la forma `AB:CD:EF:...`, 32 pares).
5. En GitHub → `site.config.json` → `android` → `sha256`: pega la huella entre las comillas, así:
   `"sha256": ["AB:CD:EF:..."]` → Commit. En 1–2 minutos
   https://hoy.compoundclub.fyi/.well-known/assetlinks.json mostrará esa huella. Sin este paso, Android abre
   la app con barra de navegador arriba.
6. Si más adelante Play Console te muestra **otra** huella en "Integridad de la app → Firma de apps de Play"
   (porque Google vuelve a firmar la app), agrégala también a la lista: `"sha256": ["huella1", "huella2"]`.

## Ruta avanzada: Bubblewrap (línea de comandos)

Solo si se quiere controlar todo a mano. Necesita JDK 17 y Android SDK (Bubblewrap ofrece instalarlos).

```bash
npm i -g @bubblewrap/cli
cd android
bubblewrap init --manifest https://hoy.compoundclub.fyi/manifest.webmanifest   # o usa el twa-manifest.json de esta carpeta
bubblewrap build        # crea app-release-bundle.aab y android.keystore
bubblewrap fingerprint list   # huella SHA-256 → site.config.json → android.sha256
```

`twa-manifest.json` ya está configurado (paquete, colores, atajos a las 4 pestañas). El `android.keystore`
no debe subirse al repo (está en `.gitignore`).

## Subir a Google Play (lo hace Raúl)

1. Cuenta de desarrollador: https://play.google.com/console → pago único de US$25 → verificación de identidad
   (puede tardar unos días). Como desarrollador individual, Google pide además una prueba cerrada con al menos
   12 personas durante 14 días antes de poder publicar; prepara una lista de amigos/familia con cuenta de Google.
2. **Crear app** → nombre `Quetzal Hoy` → idioma español (Guatemala) → "App" → "Gratis".
3. **Configuración de la app** (panel izquierdo): completa cada punto con `declaraciones.md`
   (política de privacidad, acceso a la app, anuncios, clasificación de contenido, público objetivo,
   seguridad de datos, funciones financieras, app gubernamental, noticias).
4. **Ficha de Play Store principal**: copia título, descripciones, categoría y correo de `ficha-play-store.md`;
   sube el ícono `public/icons/icon-512.png`, el gráfico destacado `android/grafico-destacado.png` (1024×500)
   y las capturas de `android/capturas/`.
5. **Pruebas → Prueba cerrada** → crear versión → subir `app-release-bundle.aab` → agregar testers → publicar.
   Pasados 14 días con 12 testers, solicita acceso a producción.
6. **Producción** → crear versión → subir el mismo `.aab` → revisar → publicar. Google revisa en 1–7 días.

## Actualizaciones

- Cambios de contenido, datos, diseño o funciones: **no hace falta tocar Play**; se publican con la web.
- Solo hay que subir un nuevo `.aab` si cambia el ícono, el nombre, los colores de arranque, los atajos o la
  configuración de Android. En ese caso: PWABuilder de nuevo con la **misma** llave (`signing.keystore`, "Use
  mine"), subiendo `Version code` a 2, 3, …; en Play Console → Producción → crear versión → subir.
- Si Chrome en el teléfono es muy viejo, la app abre como pestaña personalizada (con barra); es normal.
