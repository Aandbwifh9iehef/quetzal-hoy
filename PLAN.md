# Plan por fases — Quetzal Hoy

Cada fase termina publicada y funcionando. Claude Code hace una fase cada vez que Raúl escribe
"siguiente fase". Los criterios de terminado son obligatorios.

---

## Fase 1 — Esqueleto, diseño y publicación
**Objetivo:** la app existe en internet, se instala en el celular y se ve profesional, aunque aún
tenga datos de ejemplo.

Tareas:
- Estructura del proyecto: `wrangler.jsonc`, `package.json` (scripts `dev`, `test`, `deploy`),
  `src/worker.js`, `public/`, `data/`, `tests/`, `site.config.json`, `README.md` en español simple.
- Identidad: nombre desde config, logo SVG simple propio, paleta, tipografía del sistema
  (sin fuentes externas, por velocidad).
- Las 4 pestañas (Hoy, Noticias, Invertir, Aprende) con navegación inferior y contenido de ejemplo
  marcado claramente como "Próximamente".
- Páginas: Acerca de, Contacto (correo `CompundClub@proton.me` hasta que Raúl diga otro),
  Privacidad, Aviso legal ("información educativa, no es asesoría financiera").
- PWA: manifest, íconos (192 y 512 px, generados desde el SVG), service worker, botón
  "Instalar app" cuando el navegador lo permita, página sin conexión.
- 404 propio. Etiquetas meta, Open Graph con imagen propia, `robots.txt`, `sitemap.xml`.
- Pruebas base con `node:test`.

Criterios de terminado:
- [ ] `npm test` pasa.
- [ ] Capturas a 390 px de las 4 pestañas y páginas legales se ven bien, en español, sin errores en consola.
- [ ] Lighthouse (o revisión equivalente) en móvil: PWA instalable, rendimiento ≥ 90.
- [ ] Todo publicado en `main`.

Lo que tendrá que hacer Raúl (Claude Code debe darle los pasos exactos):
1. En Cloudflare → Workers → crear Worker desde el repo `quetzal-hoy` (como hizo con Compound Club).
2. Agregar el dominio personalizado `hoy.compoundclub.fyi` al Worker.

---

## Fase 2 — Tipo de cambio automático
**Objetivo:** el tipo de cambio se actualiza solo todos los días sin que nadie haga nada.

Tareas:
- Cliente del servicio web del Banguat (SOAP por HTTPS; métodos `TipoCambioDia` y
  `TipoCambioRango` en `https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx` — verificar que
  sigan así; si cambió, adaptar).
- Cron en el Worker: 2 veces al día (6:30 y 12:30 hora de Guatemala = 12:30 y 18:30 UTC).
  Guarda el dato del día e historial en KV (`DATA`). Reintenta con calma si falla; si sigue fallando,
  conserva el último dato.
- Carga inicial del historial de los últimos 2 años (con `TipoCambioRango`, una sola vez).
- Endpoint `/api/tipo-cambio` (JSON, con caché de 1 hora).
- Pantalla Hoy: tarjeta grande con el tipo de cambio, cambio vs. ayer (sube/baja con flecha),
  gráfica SVG 7 días / 1 mes / 1 año, fuente, fecha y nota oficial.
- Convertidor rápido USD ⇄ GTQ (útil para remesas).
- Fixtures de respuestas reales del Banguat en `tests/fixtures/` y pruebas del parseo.

Criterios de terminado:
- [ ] Pruebas del parseo y del cron pasan (incluido el caso "Banguat no respondió").
- [ ] La pantalla Hoy muestra dato real (o de fixture si el entorno no tiene internet, dicho en el reporte).
- [ ] La gráfica funciona en los 3 rangos y en modo oscuro.

Lo que tendrá que hacer Raúl: si hace falta crear el KV a mano, Claude Code le da los clics exactos
y el ID que debe pegar (o lo pone él mismo en `wrangler.jsonc` si Raúl le pasa el ID).

---

## Fase 3 — Indicadores y "dato del día"
**Objetivo:** la pantalla Hoy cuenta qué está pasando con la economía de Guatemala.

Tareas:
- `data/indicadores.json` con: tasa líder de política monetaria, inflación interanual, remesas del
  último mes y acumulado del año, precios de referencia de combustibles, canasta básica alimentaria.
  Cada uno con valor, fecha, fuente y enlace (Banguat, INE, MEM). Llenarlo con datos reales y
  actuales buscándolos en las fuentes oficiales.
- Script `npm run indicadores` que intenta actualizar automáticamente los que tengan fuente
  automatizable; los demás quedan con su fecha visible. Indicador con más de 45 días sin actualizar
  se marca "dato de <mes>".
- Tarjetas de indicadores en Hoy, cada una con "¿Qué significa esto?" desplegable en 2 frases.
- "Dato del día": se arma con **plantillas y cálculos sobre datos reales** (no con IA libre).
  Ej.: poder de compra de Q100 hoy vs. hace 5 años según inflación; cuánto suman las remesas del año
  en quetzales. Mínimo 15 plantillas que roten.

Criterios de terminado:
- [ ] Todos los indicadores tienen fuente y fecha reales.
- [ ] Pruebas de los cálculos del "dato del día" pasan.
- [ ] Capturas de Hoy completas a 390 px, claro y oscuro.

---

## Fase 4 — Noticias automáticas explicadas
**Objetivo:** cada mañana hay 5 noticias de Guatemala y 3 del mundo, explicadas en sencillo, solas.

Tareas:
- Elegir 4–6 fuentes con RSS público y confiable (medios guatemaltecos de economía, Banguat,
  y 1–2 internacionales en español). Revisar que sus términos no prohíban enlazar/titular.
  Documentar las fuentes en `data/fuentes-noticias.json`.
- Cron diario 6:00 Guatemala: lee los RSS, filtra lo financiero/económico, quita duplicados y elige
  las más relevantes (reglas simples de palabras clave + IA para clasificar).
- Workers AI genera para cada una: resumen ≤ 2 frases y "¿Cómo te afecta?" 1 frase, **solo con la
  información del título y descripción del RSS** (ver reglas en CLAUDE.md). Validación automática:
  si el resumen menciona cifras que no están en el RSS, se descarta y se muestra solo el titular.
- Pestaña Noticias: lista Guatemala / Mundo, enlace a la nota original con nombre del medio,
  etiqueta pequeña "Resumen automático".
- Archivo de los últimos 30 días.
- Medir neuronas usadas por día y dejarlo en un log; muy por debajo de 10,000.

Criterios de terminado:
- [ ] Pruebas con RSS de fixture: filtra, quita duplicados y descarta resúmenes con cifras inventadas.
- [ ] Ningún texto de medio copiado más allá del titular.
- [ ] Captura de Noticias con contenido real o de fixture.

---

## Fase 5 — Invertir: comparador y calculadoras
**Objetivo:** que la gente entienda sus opciones reales en Guatemala y no caiga en estafas.

Tareas:
- `data/inversiones.json`: tipos de opciones disponibles en Guatemala (cuentas de ahorro,
  depósitos a plazo fijo, cooperativas, bonos del Estado para personas, fondos de inversión,
  seguros con ahorro). Para cada tipo: qué es, desde cuánto, plazo, riesgo (bajo/medio/alto
  explicado), liquidez, quién lo supervisa, pros y contras.
- Tabla de tasas de depósito a plazo de los principales bancos y algunas cooperativas, **con fecha y
  fuente de cada tasa**, buscadas en fuentes públicas. Si una tasa no es pública, no inventarla:
  "Consultar con la entidad".
- Calculadoras (reusar lógica de Compound Club, en quetzales): ahorro mensual con interés compuesto,
  plazo fijo, "cuánto pierdo por inflación si lo guardo en casa", meta de ahorro.
- Sección "Esto NO es inversión": pirámides, "ganancias garantizadas", esquemas por WhatsApp,
  cómo verificar si una entidad está autorizada (enlaces a la Superintendencia de Bancos y al
  Registro del Mercado de Valores y Mercancías).
- Aviso legal visible en cada página de esta pestaña.

Criterios de terminado:
- [ ] Pruebas de las calculadoras con casos conocidos pasan.
- [ ] Toda tasa tiene fecha y fuente; ninguna frase recomienda una opción específica a la persona.
- [ ] Capturas a 390 px.

---

## Fase 6 — Aprende: cursos
**Objetivo:** cursos cortos listos, con texto completo y lugar para los videos.

Tareas:
- Sistema de cursos desde `data/cursos.json`: curso → lecciones (título, duración, texto de la
  lección, video opcional por ID de YouTube no listado, 3 preguntas de repaso).
- Progreso guardado en el celular (localStorage, con try/catch), barra de avance, "continuar donde
  te quedaste".
- 3 cursos completos de 5 lecciones cada uno, adaptando las guías de Compound Club:
  1. "Tu primer presupuesto"  2. "Sal de deudas"  3. "Empieza a invertir con poco".
- Para cada lección, el **guion del video** (3–4 min, lenguaje hablado) en `guiones/`.
  Mientras no haya video, la lección se ve completa en texto.
- Marcar en config qué cursos serán "Premium" más adelante (todos gratis por ahora).

Criterios de terminado:
- [ ] 15 lecciones con texto, preguntas y guion.
- [ ] El progreso se guarda y no rompe si localStorage falla.
- [ ] Capturas de curso y lección.

Lo que tendrá que hacer Raúl: grabar o producir los videos y pasar los IDs de YouTube
(o pedir en otra sesión que se produzcan con IA).

---

## Fase 7 — Resumen diario para WhatsApp y redes
**Objetivo:** cada mañana Raúl comparte el resumen en 1 minuto, sin pensar.

Tareas:
- Página `/compartir` (no enlazada en el menú): texto del resumen del día listo para WhatsApp
  (tipo de cambio, 3 noticias con enlace, dato del día, enlace a la app) con botón "Copiar".
- Imagen del día generada automáticamente (SVG → PNG en el Worker o en el navegador), formato
  1080×1350 y 1080×1920 (estado de WhatsApp / historia), con botón "Descargar".
- Botón "Compartir" en cada noticia y en el tipo de cambio (Web Share API).
- Espacio para patrocinador en el resumen ("Te lo trae: …") que sale de `site.config.json`
  y no aparece si está vacío.

Criterios de terminado:
- [ ] El texto copiado se ve bien pegado en WhatsApp (prueba de formato con fixture).
- [ ] Las imágenes se generan sin errores en ambos tamaños.

Lo que tendrá que hacer Raúl: crear el Canal de WhatsApp (Claude Code le da los pasos y la
descripción del canal) y pegar el resumen cada mañana.

---

## Fase 8 — SEO, analítica y pulido
Tareas:
- Páginas indexables por cada indicador ("tipo de cambio hoy Guatemala", "tasa líder Guatemala"),
  cursos y comparador; datos estructurados donde apliquen; sitemap completo.
- Cloudflare Web Analytics y eventos simples (instalaciones, cursos iniciados/terminados, clics a afiliados).
- Revisión completa de accesibilidad, ortografía, enlaces rotos y rendimiento.
- Página de "Novedades" con lo que se agregó en cada fase.

Criterios de terminado:
- [ ] Sin enlaces rotos (script de verificación).
- [ ] Rendimiento móvil ≥ 90 en todas las páginas principales.

Lo que tendrá que hacer Raúl: agregar el subdominio en Google Search Console, activar Web Analytics
(pasos exactos).

---

## Fase 9 — Listo para ganar dinero
Tareas:
- Página "Anúnciate" con propuesta para bancos, cooperativas, remesadoras y aseguradoras:
  patrocinio del resumen diario, patrocinio de un curso, enlaces de afiliado. Con métricas reales
  tomadas de la analítica.
- Media kit en una página imprimible (PDF desde el navegador).
- Sistema de afiliados desde `site.config.json`: enlaces marcados `rel="sponsored"` y etiqueta
  "Enlace patrocinado" visible.
- Propuesta de cursos para empresas ("bienestar financiero para empleados").
- Investigar y documentar en `docs/pagos.md` cómo cobrar cursos premium en Guatemala
  (pasarelas que operen en Guatemala, comisiones, requisitos) y dejar el flujo listo para activar.

Criterios de terminado:
- [ ] Ningún patrocinio aparece sin la etiqueta de "patrocinado".
- [ ] Media kit imprimible sin cortes.

---

## Fase 10 — App en Google Play
Tareas:
- Empaquetar la PWA como app Android (Trusted Web Activity con Bubblewrap), con `assetlinks.json`
  publicado en el sitio.
- Textos de la ficha de Play Store, capturas, política de privacidad, y la declaración de
  funciones financieras que pide Google.
- Documentar cómo publicar actualizaciones (normalmente no hace falta: la app usa la web).

Lo que tendrá que hacer Raúl: crear la cuenta de desarrollador de Google Play (pago único) y subir
el archivo que genere Claude Code, siguiendo los pasos exactos.
