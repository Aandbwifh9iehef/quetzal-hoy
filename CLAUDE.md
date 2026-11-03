# Quetzal Hoy — instrucciones para Claude Code

> Nombre de trabajo: **Quetzal Hoy** (se puede cambiar en `site.config.json`; nunca escribas el nombre a mano en el código).

## Qué es
Una app web instalable en el celular (PWA) de información financiera centrada en Guatemala:
tipo de cambio del día, indicadores, noticias explicadas en lenguaje sencillo, comparador de
opciones de inversión, calculadoras y cursos en video. Público: guatemaltecos comunes, desde el
celular, muchos con datos móviles limitados. Todo en español de Guatemala.

## Quién es el dueño y cómo trabaja
- El dueño es **Raúl**. **No revisa código.** Solo escribe "siguiente fase" y espera que todo quede
  funcionando y publicado.
- Por eso tú eres responsable de verificar tu propio trabajo antes de decir que terminaste.
- Si algo necesita sí o sí una acción de Raúl (una cuenta, un pago, un clic en un panel), hazlo
  al final del reporte con pasos numerados, exactos y cortos, como para alguien sin experiencia técnica.

## Protocolo cuando Raúl dice "siguiente fase" (o "sigue", "continúa", "fase X")
1. Lee `PROGRESO.md` para saber cuál es la siguiente fase pendiente, y `PLAN.md` para sus tareas.
2. Si la fase anterior dejó "Pendientes de Raúl" que bloquean esta fase y él no los ha confirmado,
   recuérdaselos y detente. Si no bloquean, sigue.
3. Haz TODAS las tareas de la fase. No hagas tareas de fases futuras.
4. Verifica cada "Criterio de terminado" de la fase (ver "Cómo verificar"). Si uno falla, arréglalo
   y vuelve a verificar. No pases a reportar con criterios fallando.
5. Haz commit con mensaje claro en español (`Fase N: ...`) y push a `main`
   (cada push a `main` se despliega solo en Cloudflare una vez conectado en la fase 1).
6. Actualiza `PROGRESO.md`: marca la fase como hecha, fecha, decisiones tomadas y pendientes de Raúl.
   Haz commit y push de ese cambio también.
7. Responde con el reporte (formato abajo).

## Autonomía
- **No hagas preguntas** salvo que de verdad no puedas avanzar. Toma la decisión más razonable,
  anótala en `PROGRESO.md` → "Decisiones" y sigue.
- Nunca borres datos ni historial (KV, archivos de datos) sin que Raúl lo pida.
- Nunca pongas claves, tokens ni secretos en el repo. Si hacen falta, usa secretos de Cloudflare
  y dile a Raúl exactamente dónde pegarlos.
- Si una fase es demasiado grande para una sola sesión, termina una parte que funcione completa,
  publícala, y en `PROGRESO.md` deja la fase como "en curso" con lo que falta.

## Reporte final (siempre este formato, corto, sin jerga)
```
✅ Fase N terminada: <nombre>
Qué hay nuevo: <2-4 líneas que entienda cualquiera>
Míralo aquí: <URL>
Verifiqué: <lista corta de lo que comprobaste>
Lo que tienes que hacer tú: <pasos numerados, o "Nada. Cuando quieras, escribe: siguiente fase">
```

## Stack técnico (no cambiarlo sin anotarlo en Decisiones)
- **Cloudflare Workers** con static assets + manejador `scheduled` (cron) en el mismo Worker.
  Worker: `quetzal-hoy`. Configuración en `wrangler.jsonc`.
- HTML, CSS y JavaScript **sin frameworks ni dependencias de runtime**. Debe cargar rápido en
  celulares baratos y con 3G. Meta: página principal < 150 KB sin contar imágenes.
- Datos que cambian (tipo de cambio, noticias, indicadores): **Workers KV** (binding `DATA`).
  Datos editoriales (cursos, opciones de inversión, indicadores mensuales): archivos JSON en `data/`.
- IA: **Workers AI** (binding `AI`), solo para resumir noticias. Plan gratis: 10,000 neuronas al día;
  diseña para quedar muy por debajo.
- Gráficas: SVG generado a mano (sin librerías).
- PWA: `manifest.webmanifest` + service worker con caché para que lo último visto funcione sin internet.
- Dominio: subdominio `hoy.compoundclub.fyi` (el dominio ya es de Raúl, está en Cloudflare).
  También responde en `*.workers.dev`.
- Analítica: Cloudflare Web Analytics (sin cookies).

## Reglas de contenido (obligatorias)
- **Números siempre de una fuente**, nunca inventados ni generados por IA. Cada dato muestra su
  fuente y su fecha ("Fuente: Banguat, 3 nov 2026"). Si un dato no se pudo actualizar, muestra el
  último con su fecha, nunca un número viejo como si fuera de hoy.
- Tipo de cambio: el oficial es el que publica el Banco de Guatemala en banguat.gob.gt. El servicio
  web del Banguat no es "servicio oficial de información"; muestra la nota
  "Dato de referencia del Banco de Guatemala. Consulta el oficial en banguat.gob.gt".
- **Noticias:** nunca copiar textos de medios. Solo: titular, resumen propio de máximo 2 frases,
  "¿Cómo te afecta?" de 1 frase y enlace visible a la nota original con el nombre del medio.
  La IA solo puede usar la información del título y la descripción del RSS; si no alcanza para un
  resumen fiel, se muestra solo el titular y el enlace. Nada de imágenes de los medios.
- **Inversiones:** información y comparación, **nunca recomendación personal** ("te conviene X").
  Siempre: tasas con fecha y fuente, "verifica las condiciones con la entidad antes de invertir" y
  aviso legal enlazado. Nunca prometer rendimientos.
- Sin promesas de hacerse rico, sin cripto especulativo, sin "señales" de trading.
- Tono: cercano, claro, de "vos/tú" consistente (usar **tú**), frases cortas, cero jerga sin explicar.
- Autor declarado: **Leo Marín** (seudónimo, igual que en Compound Club). Sin credenciales inventadas.
- Las guías en español de Compound Club (repo `Aandbwifh9iehef/compoundclub-finance`, carpeta
  `src/guides-es.js`) se pueden reutilizar y adaptar como base de cursos.

## Diseño
- Primero móvil (360–430 px de ancho). Botones grandes, texto mínimo 16 px, alto contraste.
- Modo claro y oscuro (según el sistema).
- Navegación inferior fija con 4 pestañas: **Hoy**, **Noticias**, **Invertir**, **Aprende**.
- Paleta y logo propios definidos en la fase 1 en `src/styles.css` como variables CSS.
  Nada de logos, fotos ni marcas de bancos o medios (solo sus nombres en texto).

## Cómo verificar (antes de cada reporte)
1. Pruebas automáticas: `npm test` (node:test, sin dependencias extra) para toda la lógica de datos
   (parseo del Banguat, del RSS, cálculos de las calculadoras, formato de fechas y quetzales).
2. Correr local con `npx wrangler dev` y abrir las páginas con Playwright a 390 px de ancho:
   tomar captura de cada página tocada y **mirarlas** (que no haya nada roto, cortado ni en inglés),
   revisar que la consola no tenga errores.
3. Después del push, comprobar la URL publicada (si el entorno no puede salir a internet, dilo en
   "Verifiqué" y verifica con datos de prueba guardados en `tests/fixtures/`).
4. Si el entorno no puede llegar a banguat.gob.gt u otras fuentes, usa fixtures con respuestas
   reales de ejemplo y deja el código listo; dilo en el reporte.

## Archivos clave
- `PLAN.md` — las fases y sus criterios. No lo cambies salvo para corregir algo imposible
  (y anótalo en Decisiones).
- `PROGRESO.md` — estado actual. Siempre actualizado al terminar.
- `site.config.json` — nombre, dominio, colores, patrocinador, enlaces de afiliado, IDs de video.
