# Progreso — Quetzal Hoy

## Siguiente fase: 10 — App en Google Play

| Fase | Nombre | Estado | Fecha |
|---|---|---|---|
| 1 | Esqueleto, diseño y publicación | Hecha | 3 nov 2026 |
| 2 | Tipo de cambio automático | Hecha | 3 nov 2026 |
| 3 | Indicadores y dato del día | Hecha | 3 nov 2026 |
| 4 | Noticias automáticas | Hecha | 3 nov 2026 |
| 5 | Invertir: comparador y calculadoras | Hecha | 3 nov 2026 |
| 6 | Aprende: cursos | Hecha | 3 nov 2026 |
| 7 | Resumen para WhatsApp | Hecha | 3 nov 2026 |
| 8 | SEO, analítica y pulido | Hecha | 3 nov 2026 |
| 9 | Listo para ganar dinero | Hecha | 3 nov 2026 |
| 10 | App en Google Play | Pendiente | |

## Pendientes de Raúl
- **Google Search Console (fase 8):** 1) Entra a search.google.com/search-console con tu cuenta de Google.
  2) "Agregar propiedad" → tipo "Prefijo de URL" → escribe https://hoy.compoundclub.fyi → Continuar.
  3) Elige verificación "Proveedor de nombres de dominio" o "Etiqueta HTML"; si es etiqueta HTML, cópiame
  el código y lo pongo en la app. 4) Ya verificado: menú "Sitemaps" → escribe `sitemap.xml` → Enviar.
- **Cloudflare Web Analytics (fase 8):** 1) Cloudflare → Analytics & Logs → Web Analytics → "Add a site".
  2) Hostname: hoy.compoundclub.fyi → "Done". 3) Te mostrará un fragmento con `"token": "xxxx"`: copia solo
  el token. 4) En GitHub, `site.config.json` → `"analytics": ""` → pega el token entre las comillas → Commit.
  Desde ese momento se cuentan visitas sin cookies; los eventos (instalaciones, cursos, compartir) se cuentan
  aparte en `/api/eventos`.
- **Canal de WhatsApp (fase 7):** 1) En WhatsApp → Novedades → Canales → "+" → Crear canal. 2) Nombre:
  "Quetzal Hoy". Descripción sugerida: "Cada mañana, en 1 minuto: el dólar de hoy, 3 noticias
  económicas de Guatemala explicadas en sencillo y un dato para cuidar tu dinero. Gratis. Por Leo
  Marín. App: hoy.compoundclub.fyi". 3) Foto: usa `public/icons/icon-512.png`. 4) Cada mañana abre
  hoy.compoundclub.fyi/compartir, toca "Copiar texto" y pégalo en el canal; si quieres, descarga la
  imagen y súbela como estado. Comparte el enlace del canal en la app cuando lo tengas (dímelo y lo pongo).
- **Videos de los cursos (fase 6, no bloquea nada):** hay 15 guiones en `guiones/` (uno por lección,
  3–4 min, lenguaje hablado). Cuando grabes o produzcas un video, súbelo a YouTube como "no listado"
  y pega su ID en `site.config.json` → `videos`, con la clave `curso-leccion` (p. ej. `"deudas-1":
  "abc123XYZ_-"`). La lección lo mostrará arriba del texto. Mientras no haya video, se ve el texto completo.
- **Bloquea la publicación (no la fase 2):** conectar el repo `quetzal-hoy` a Cloudflare Workers
  (Workers & Pages → Create → Import a repository → elegir `quetzal-hoy`; el build detecta
  `wrangler.jsonc` solo) y agregar el dominio personalizado `hoy.compoundclub.fyi` en
  Settings → Domains & Routes del Worker.
- **Bloquea el deploy desde la fase 2:** crear el KV y pegar su ID en `wrangler.jsonc`:
  1. Cloudflare → Storage & Databases → KV → "Create a namespace" → nombre `quetzal-hoy-data` → Add.
  2. Copiar el ID que aparece junto al nombre.
  3. En GitHub, abrir `wrangler.jsonc`, reemplazar `PEGAR_ID_DEL_KV_AQUI` por ese ID y guardar (Commit changes).
  Sin esto el Worker no se publica. Mientras el KV esté vacío, la app muestra el historial de 2 años
  incluido en el repo y consulta el dato de hoy en vivo, así que no se ve nada roto.

## Decisiones
- 3 nov 2026: nombre de trabajo "Quetzal Hoy", subdominio hoy.compoundclub.fyi. Se puede cambiar en site.config.json.
- 3 nov 2026: empezar como web instalable (PWA) en Cloudflare Workers; app de Play Store al final.
- 3 nov 2026 (fase 1): paleta verde quetzal (`#1B4332` primario, `#52B788` secundario, `#F4A261` acento),
  definida como variables CSS en `public/styles.css`. Logo propio: quetzal estilizado en SVG.
- 3 nov 2026 (fase 1): las rutas se sirven sin `.html` (`/acerca`, `/aviso-legal`…) porque Cloudflare
  Assets redirige `/x.html` → `/x`. Los enlaces internos, el sitemap y el service worker usan esa forma.
- 3 nov 2026 (fase 1): el binding KV queda comentado en `wrangler.jsonc` hasta la fase 2, para que el
  primer deploy no falle por un ID inexistente. `/api/tipo-cambio` responde `{disponible:false}` mientras tanto.
- 3 nov 2026 (fase 1): los PNG de íconos y la imagen Open Graph se generaron desde los SVG con canvas
  del navegador (no hay rasterizador en el entorno). Si se cambia el logo, regenerarlos.
- 3 nov 2026 (fase 1): Lighthouse no se pudo correr en el entorno; se verificó peso total de la
  portada (~23 KB con CSS, SW, manifest y logo) y ausencia de recursos externos, que es lo que
  determina el rendimiento móvil.
- 3 nov 2026 (fase 2): el método `TipoCambioDia` del Banguat devuelve una sola tasa ("referencia"),
  no compra/venta; la app muestra esa tasa de referencia. `TipoCambioRango` sí devuelve compra/venta
  (iguales entre sí); se usa `venta`.
- 3 nov 2026 (fase 2): el historial de 2 años se descargó una vez con `npm run historial` y vive en
  `data/tipo-cambio-historial.json` como semilla incluida en el Worker. El cron (12:30 y 18:30 UTC)
  agrega el dato del día al KV; el API fusiona semilla + KV. Si KV está vacío, consulta el dato de hoy en
  vivo con caché de 1 hora. Si el Banguat falla 3 veces seguidas, se conserva el último dato con su fecha.
- 3 nov 2026 (fase 2): wrangler no está autenticado en esta máquina, por eso el KV lo crea Raúl.
- 3 nov 2026 (fase 3): indicadores en `data/indicadores.json` con valores confirmados en fuentes oficiales
  el 3 nov 2026: tasa líder 3.50% (Banguat, 23 sep), inflación interanual 4.69% y acumulada 4.17% a
  septiembre (INE, publicado en la portada del Banguat), remesas sep 2026 US$2,240.8 M y acumulado
  US$20,015.7 M (tabla del Banguat), combustibles MEM al 2 nov (regular 30.69, superior 33.19, diésel
  41.69), canasta básica INE sep 2026 (urbana Q966.74, rural Q751.58 por persona).
- 3 nov 2026 (fase 3): solo las remesas se actualizan solas (`npm run indicadores` lee la tabla HTML del
  Banguat). Tasa líder, inflación, combustibles y canasta son manuales: el Banguat no tiene API, el INE
  bloquea robots y el MEM devuelve 403 a scripts. Pasados 45 días sin actualizar, la tarjeta muestra
  "dato de <mes>". Hay que revisarlos a mano una vez al mes (o pedirle a Claude Code que lo haga).
- 3 nov 2026 (fase 3): el "dato del día" son 19 plantillas con cálculos sobre los datos reales (sin IA),
  rotan por día del año. Usan como referencia el salario mínimo 2026 (AG 256-2025: Q4,002.28 + Q250) y la
  inflación diciembre/diciembre 2019–2025 del INE, ambos en `data/indicadores.json` → `referencias`.
- 3 nov 2026 (fase 3): la canasta básica enlaza a ine.gob.gt (portada) porque el INE no da enlaces
  estables a cada informe mensual.
- 3 nov 2026 (fase 4): fuentes RSS en `data/fuentes-noticias.json`: Prensa Libre (economía), República
  (economía), La Hora (general, filtrada por palabras clave), Banguat (comunicados), El País (economía) y
  DW (economía). BBC Mundo quedó fuera: su RSS de economía está congelado desde 2014. Soy502, AGN y
  Emisoras Unidas no tienen RSS que funcione.
- 3 nov 2026 (fase 4): cron de noticias a las 12:00 UTC (6:00 Guatemala). Elige 5 de Guatemala y 3 del
  mundo entre lo publicado en las últimas 48 h, con tope blando de 3 por medio (2 en Mundo). Archivo de
  30 días en KV (`noticias:AAAA-MM-DD`, índice en `noticias:indice`) y log de uso en `noticias:uso`
  (visible en `/api/noticias/uso`).
- 3 nov 2026 (fase 4): modelo de Workers AI `@cf/meta/llama-3.1-8b-instruct`; cada resumen usa solo
  titular + descripción del RSS. Validación automática: si el resumen trae una cifra que no está en el
  RSS, tiene más de 2 frases o el "¿Cómo te afecta?" más de 1, se descarta y se muestra solo el titular.
  Estimación: ~8 noticias × ~430 tokens ≈ 120 neuronas/día (límite gratis 10,000). Las neuronas se
  estiman a partir de los tokens con la tabla de precios de Cloudflare, porque la API no las devuelve.
- 3 nov 2026 (fase 4): en la computadora (`npm run dev`) se usa el entorno `local` de `wrangler.jsonc`,
  sin binding de IA, porque la IA obliga a iniciar sesión en Cloudflare. Por eso en local las noticias
  salen solo con titular; los resúmenes aparecerán al publicar. No se pudo probar la IA real desde aquí.
- 3 nov 2026 (fase 5): tasas de plazo fijo y ahorro en `data/inversiones.json`. Fuente principal:
  tasas.gt (comparador que lee los tarifarios PDF que cada banco publica por norma de la SIB; verificado el
  8 sep 2026), más la tabla oficial de Cooperativa Guadalupana (3 nov 2026) y G&T (31 ago 2026). La SIB y
  los sitios de varios bancos bloquean scripts (403), por eso no se citan sus PDF directamente. Banrural no
  publica su tasa de plazo fijo en línea y El Bienestar solo un máximo: quedan como "Consultar con la
  entidad". Las tasas se muestran antes del ISR del 10%.
- 3 nov 2026 (fase 5): Bonos del Tesoro para pequeños inversionistas (AG 26-2026): desde Q5,000, plazos
  1/2/3 años al 6.00/6.125/6.25%, intereses semestrales exentos, vía agentes de bolsa. Datos de la emisión
  de abril 2026 (Prensa Libre, 19 abr 2026); cada emisión puede cambiar.
- 3 nov 2026 (fase 5): las 4 calculadoras usan la misma lógica en `src/calculadoras.js` (probada) y en
  `public/app.js` (para no cargar módulos en el navegador). Plazo fijo con interés simple nominal, como lo
  calculan los bancos de Guatemala; ahorro y meta con capitalización mensual.
- 3 nov 2026 (fase 5): hay una prueba que falla si cualquier texto de Invertir contiene frases de
  recomendación personal ("te conviene", "la mejor opción", etc.).
- 3 nov 2026 (fase 5): revisar las tasas una vez al mes (o cuando Raúl lo pida); la fecha de cada tasa
  es visible en la app.
- 3 nov 2026 (fase 6): cursos en `data/cursos.json` (3 cursos × 5 lecciones, cada una con texto de
  1,500–2,300 caracteres, 3 preguntas de repaso con explicación y guion en `guiones/<curso>-<n>.md`).
  Contenido adaptado de las guías de Compound Club (`compoundclub-finance/src/guides-es.js`) a
  Guatemala: quetzales, Bono 14, IGSS, FOPA, cooperativas MICOOPE, Bonos del Tesoro, prestamistas.
  Los textos de la app usan "tú" (regla de CLAUDE.md); los guiones hablados usan "vos", como se habla
  en Guatemala, y lo indican al inicio.
- 3 nov 2026 (fase 6): el progreso se guarda en localStorage (`quetzal-hoy:progreso`) con try/catch;
  si falla, la app funciona igual y avisa "no se pudo guardar". Una lección cuenta como terminada al
  revisar las 3 preguntas (con cualquier número de aciertos). "Continuar donde te quedaste" elige el
  curso empezado con más avance.
- 3 nov 2026 (fase 6): `site.config.json` → `cursosPremium` (lista de IDs; vacía = todo gratis) y
  `videos` (IDs de YouTube por lección). El API `/api/cursos` aplica ambos.
- 3 nov 2026 (fase 6): la lógica de progreso vive en `src/progreso.js` (probada) y repetida en
  `public/app.js`, igual que las calculadoras, para no cargar módulos en el navegador.
- 3 nov 2026 (fase 7): el resumen (`/api/resumen`) y la imagen (`/api/imagen-dia.svg?formato=1080x1350|1080x1920`)
  se generan en el Worker desde los datos del día (tipo de cambio, 3 noticias —Guatemala primero—, dato
  del día). La imagen es SVG con fuentes del sistema; el PNG se genera en el navegador con canvas porque
  el Worker no puede rasterizar. El ancho de línea se estima a 0.6 em por carácter y se verificó con
  medición real en el navegador.
- 3 nov 2026 (fase 7): el texto de WhatsApp usa *negritas* de WhatsApp y cada enlace va en su propia
  línea para que WhatsApp lo detecte. Hay un fixture `tests/fixtures/resumen-whatsapp.txt` que fija el formato.
- 3 nov 2026 (fase 7): "Compartir" usa la Web Share API (celulares); en computadoras copia el texto
  al portapapeles. `/compartir` no está en el menú ni en el sitemap y lleva `noindex`.
- 3 nov 2026 (fase 7): el patrocinador sale de `site.config.json` → `patrocinador` y
  `patrocinadorUrl`; si está vacío no aparece la línea "Te lo trae".
- 3 nov 2026 (fase 8): las páginas indexables las genera el Worker con datos reales (no son archivos
  estáticos): /tipo-cambio-hoy, /tasa-lider-guatemala, /inflacion-guatemala, /remesas-guatemala,
  /precio-gasolina-guatemala, /canasta-basica-guatemala, /invertir-en-guatemala, /cursos, /cursos/<id>,
  /cursos/<id>/<n>, /novedades. Llevan canonical, Open Graph, migas y JSON-LD (ExchangeRateSpecification,
  Course, Article, BreadcrumbList). El sitemap es dinámico en /sitemap.xml (32 URLs); se borró el estático.
- 3 nov 2026 (fase 8): Web Analytics se activa solo si `site.config.json` → `analytics` tiene token. Los
  eventos simples (instalacion, curso_iniciado, curso_terminado, compartir, copiar_resumen, clic_afiliado)
  se cuentan por día en KV (`eventos:AAAA-MM-DD`) vía `POST /api/evento` y se leen en `/api/eventos`
  (últimos 30 días); servirán para la página Anúnciate de la fase 9.
- 3 nov 2026 (fase 8): Lighthouse móvil en local con Chrome: portada 96/100/100/100 (rendimiento,
  accesibilidad, buenas prácticas, SEO); /tipo-cambio-hoy, /cursos/deudas/1 e /invertir-en-guatemala
  100/95→100/100/100. Se corrigió el salto de diseño (CLS 0.87 → 0.11) reservando altura a las tarjetas
  que cargan datos, y accesibilidad (enlaces subrayados, contraste del botón Instalar, roles ARIA).
- 3 nov 2026 (fase 8): `node scripts/enlaces.js [url]` revisa todos los enlaces internos y externos
  (68 hoy, 0 rotos). MEM, Minfin y SIB devuelven 403 a robots: no están rotos. Las pestañas de la app
  se pueden abrir por enlace: /#noticias, /#invertir, /#aprende.
- 3 nov 2026 (fase 9): patrocinios y afiliados salen de `site.config.json`: `afiliados` (clave = nombre
  exacto de la entidad en `data/inversiones.json`) pone un botón "Abrir cuenta" con `rel="sponsored"` y la
  etiqueta visible "Enlace patrocinado" en la app y en /invertir-en-guatemala; `patrocinioCursos` (clave =
  id del curso) muestra "Patrocinado por X" en la tarjeta y la portada del curso; `patrocinador` ya salía
  en el resumen diario como "Te lo trae". Hay prueba de que cada enlace patrocinado lleva su etiqueta.
- 3 nov 2026 (fase 9): /anunciate (indexable) y /media-kit (noindex, imprimible con botón "Imprimir o
  guardar como PDF" y CSS de impresión A4) leen métricas reales de `/api/eventos` y del contenido. Los
  precios no se inventan: "a convenir" (`anunciate.preciosNota`); contacto `anunciate.correo` y
  `anunciate.whatsapp` (vacío = no se muestra).
- 3 nov 2026 (fase 9): flujo premium listo pero apagado (`premium.activo: false`, todo gratis). Al
  activarlo: precio, link de pago (Recurrente u otra pasarela) y códigos guardados como SHA-256 en
  `premium.codigosSha256`; la persona escribe el código en la app, el Worker lo verifica en
  `/api/premium/verificar` y el curso queda desbloqueado en ese celular. Pasos y comparación de pasarelas
  en `docs/pagos.md` (Recurrente 4.5% por cobro, sin mensualidad, deposita en 24 h hábiles; Stripe no
  opera en Guatemala). Probado en local activándolo temporalmente con un código de prueba y revertido.
- 3 nov 2026 (fase 9): la propuesta de cursos para empresas ("bienestar financiero para empleados") está
  en /anunciate y en el media kit; no hay página aparte.
