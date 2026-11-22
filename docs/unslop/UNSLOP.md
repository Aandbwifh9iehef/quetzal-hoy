# Fase U — Rediseño con Unslop (quitarle la cara de IA a la app)

> Para Claude Code. Raúl dijo que la app "se ve muy IA" y que no va a revisar el trabajo.
> Esta fase se hace UNA vez, antes de seguir con la siguiente fase pendiente del plan.
> Herramienta: la skill **unslop** de Damir Sokolovsky (@heydamir), https://github.com/heydamir/unslop,
> licencia CC BY 4.0 (se puede usar y copiar con crédito).

## 0. Registrar la fase (lo primero)
1. En `PLAN.md`, agrega una sección "Fase U — Rediseño con Unslop" con un resumen de este archivo
   y un enlace a él. No cambies la numeración de las demás fases.
2. En `PROGRESO.md`, agrega la fila `U | Rediseño con Unslop | En curso | <fecha>` y pon
   "Siguiente fase: U". Al terminar, márcala como hecha y devuelve "Siguiente fase" a la que
   estaba pendiente antes.
3. En `CLAUDE.md`, sustituye la sección "## Diseño" por la del punto 8 de este archivo.

Desde aquí, el protocolo normal de `CLAUDE.md` aplica (verificar, commit, push, reporte).

## 1. Instalar la skill dentro del repo
Que quede en el repo para que funcione en cualquier sesión futura, también en la nube:

```bash
git clone --depth 1 https://github.com/heydamir/unslop /tmp/unslop
mkdir -p .claude/skills
cp -r /tmp/unslop/skills/unslop .claude/skills/unslop
cp /tmp/unslop/LICENSE .claude/skills/unslop/LICENSE
```

- Haz commit de `.claude/skills/unslop/` completo (incluye `references/` y `scripts/`).
- En `README.md` agrega: "Rediseño guiado por unslop de Damir Sokolovsky (@heydamir),
  CC BY 4.0 — https://github.com/heydamir/unslop".
- Antes de tocar nada, lee completos `.claude/skills/unslop/SKILL.md` y sus
  `references/` (`signs.md`, `tokens.md`, `visuals.md`, `refs.md`, `effects.md`; mira también las
  imágenes de `references/refs/`).

## 2. Permiso ya dado: no te detengas
La skill, en su paso 4, pide mostrar la auditoría y la dirección y esperar respuesta. **Aquí no:**
Raúl ya aprobó la dirección del punto 5 y pidió no tener que revisar. Úsala tal cual. Si la
auditoría muestra algo que la contradiga de verdad, afínala lo mínimo y anótalo en
`PROGRESO.md` → Decisiones. Lo mismo con cualquier otra pregunta que la skill haría: decide y anota.

Frases que no se pueden comprobar (ej. "miles de usuarios", "la más confiable"): quítalas y
lístalas en el reporte.

## 3. Alcance
Todas las pantallas que **ya existen** en la app. Revisa el código para saber cuáles, por ejemplo:
Hoy, Noticias, Invertir (comparador, calculadoras, "Esto NO es inversión"), Aprende (curso y
lección), Acerca de, Contacto, Privacidad, Aviso legal, 404, página sin conexión, `/compartir`,
imagen del día, logo, íconos del manifest, favicon e imagen Open Graph.
No construyas nada de fases futuras. No cambies qué hace la app, sus datos, ni el orden de sus
secciones. Las reglas de contenido de `CLAUDE.md` (fuente y fecha en cada dato, avisos legales,
"Resumen automático" en noticias) se mantienen: se rediseñan, no se quitan.

## 4. Antes
1. Corre la app local y toma capturas a 390 px de ancho, modo claro y oscuro, de cada pantalla,
   más Hoy a 1280 px. Guárdalas en `docs/unslop/antes/`.
2. Haz la auditoría con `signs.md`: una línea por señal con dónde está.
   Guárdala en `docs/unslop/auditoria.md`.
3. Decide el nivel (fuerte, leve o nada) como dice la skill. Si sale "leve", usa el modo pulido
   pero corrige todo lo que la auditoría encontró.

## 5. Dirección (aprobada)
- **Producto.** App gratis para que cualquier guatemalteco sepa cada mañana a cómo está el dólar,
  qué pasa con la economía y aprenda a manejar su dinero, desde un celular sencillo.
- **Carácter.** Exacto, sereno, cercano.
- **Mundo.** El billete de quetzal y la libreta de ahorro: papel, tinta verde de grabado, el sello
  con la fecha que pone el banco, la boleta de depósito.
- **Momentos.**
  1. La tarjeta del tipo de cambio en Hoy: la cifra grande en números tabulares y la gráfica del
     período dibujada con cuidado (línea fina, el punto de hoy en el acento, rejilla tenue con
     etiquetas pequeñas). Solo dentro de esta tarjeta se permite un fondo muy tenue de líneas finas
     tipo guilloché de billete, hecho en SVG; si en las capturas se ve como adorno, quítalo.
  2. La gráfica de las calculadoras de Invertir: lo que pones tú en neutro, lo que ganas en
     intereses en el acento.
- **Firma.** El **sello de fuente y fecha**: cada dato lleva un sello pequeño
  ("Banguat · 22 nov 2026") en letra mono, borde fino, radio 4, color apagado. Es el mismo
  componente en toda la app, y nada más usa ese aspecto. Sale directo de la regla de
  contenido "cada número con fuente y fecha".

## 6. Decisiones de sistema (para no adivinar)
- **Superficies:** rampa *graphite* de `tokens.md`, claro y oscuro (es una app: el color va en el
  contenido, no en los fondos).
- **Acento:** verde tinta del billete. Punto de partida: `#1d6b4f` en claro y `#5fbf94` en oscuro.
  Verifica contraste 4.5:1 como texto y con texto encima; ajusta si no llega.
- **Subidas y bajadas del tipo de cambio sin rojo ni verde.** Que suba el dólar es bueno para
  quien recibe remesas y malo para quien compra cosas importadas. Usa flecha y texto
  ("Q0.02 más que ayer") en color secundario. El rojo y verde semánticos quedan solo para errores
  y para resultados que sí son buenos o malos (ej. lo que se pierde por inflación).
- **Tipografía:** una sola familia de la fila "cálida y cercana" de `tokens.md`
  (Figtree o Instrument Sans), **autoalojada** en woff2 con subconjunto latino, máximo 40 KB en
  total, `font-display: swap`. Nada de pedir fuentes a Google. El sello usa `ui-monospace` del
  sistema. Cifras con `font-variant-numeric: tabular-nums`. Anota en Decisiones que esto
  reemplaza "tipografía del sistema".
- **Tamaños (ganan sobre `tokens.md`, por el público):** cuerpo 16 px, texto secundario 15,
  sello y metadatos 13 como mínimo, nada por debajo de 13. Cifra del tipo de cambio 48 a 56.
- **Móvil primero:** se diseña a 360–430 px. Margen de página 16–20. Barra inferior de 56–64 px
  más el área segura del teléfono, 4 pestañas con ícono y texto. Todo lo tocable mide al menos
  44 px. En la barra inferior los íconos pueden ser de 22 px; en el resto, 18.
  En pantallas de 900 px o más, no dejes la app como tira angosta: Hoy e Invertir pasan a 2
  columnas, ancho máximo 1120.
- **Íconos:** lucide, trazo 1.5, pegados como SVG en línea solo los que se usan (sin librería).
- **Textos en español** con las reglas de copy de la skill: sin signos de exclamación, sin emojis,
  sin saludos tipo "Hola 👋", sin punto final en títulos, botones y etiquetas, mayúscula solo
  inicial, nada de "potencia", "desbloquea", "revoluciona" ni "con IA" de adorno.
  "Resumen automático" se queda como texto discreto.
- **Logo:** el nombre (desde `site.config.json`) en la familia elegida, más una marca simple de un
  color si hace falta. Regenera favicon, íconos 192/512 y la imagen Open Graph desde el logo nuevo.
  Sin degradados ni brillos.
- **Movimiento:** curva y duraciones de `tokens.md`; respeta `prefers-reduced-motion`.
- **Peso:** página principal < 150 KB sin contar imágenes ni la fuente.
- **Service worker:** sube la versión del caché para que los usuarios reciban el diseño nuevo.

## 7. Hacer el trabajo
Las 9 pasadas de la skill, en orden y sobre todas las pantallas: espaciado, color, íconos, textos,
tipografía, layout, detalles, visuales y movimiento. Todos los valores salen de variables CSS en
`src/styles.css` (o donde estén los estilos), no escritos sueltos en cada pantalla.

## 8. Dejarlo fijo para las fases siguientes
1. Escribe `DISENO.md`: la dirección, los tokens (colores claro/oscuro, escala de tipo, espaciado,
   radios, movimiento), los componentes (sello, tarjeta, botón primario y secundario, fila,
   barra inferior, gráfica, aviso legal) y una lista corta de "sí / no".
2. Sustituye "## Diseño" en `CLAUDE.md` por:

```
## Diseño
- Sigue `DISENO.md`. No inventes colores, tamaños ni componentes nuevos si ya existe uno.
- Toda pantalla nueva o cambiada, en cualquier fase, pasa la checklist de
  `.claude/skills/unslop/SKILL.md` antes del reporte. Si algo se ve hecho por IA, se corrige en la
  misma fase. Inclúyelo en "Verifiqué".
- Primero móvil (360–430 px), texto mínimo 16 px (13 en sellos y metadatos), todo lo tocable ≥ 44 px.
- Nada de logos, fotos ni marcas de bancos o medios (solo sus nombres en texto).
```

## 9. Verificar (todo obligatorio)
- [ ] `npm test` pasa (el rediseño no rompió ningún cálculo ni parseo).
- [ ] Capturas después en `docs/unslop/despues/` (mismas pantallas y tamaños que el "antes").
      Míralas una por una contra `auditoria.md`: no queda ninguna señal.
- [ ] La checklist completa del final de `SKILL.md` se cumple, incluida la prueba de plantilla
      (si cambias el nombre por el de otra app, ¿todavía encaja? Si sí, empuja la dirección).
- [ ] Contraste AA en claro y oscuro. Sin errores en consola. Rendimiento móvil ≥ 90.
- [ ] Cada dato sigue mostrando fuente y fecha (ahora con el sello). Avisos legales intactos.
- [ ] Publicado en `main` y comprobado en la URL en vivo.

## 10. Antes y después para redes (si se puede)
Si en el entorno hay Playwright y ffmpeg, haz el video "story" de la skill sobre la pantalla Hoy
(`docs/unslop/historia.mp4`, cuadrado, unos 10 segundos, con el crédito "unslop by @heydamir").
Si no se puede, haz una imagen antes/después lado a lado de Hoy en `docs/unslop/antes-despues.png`.
Raúl lo puede subir a Instagram o al canal de WhatsApp.

## 11. Cerrar
Commit `Fase U: rediseño con Unslop`, push, actualiza `PROGRESO.md` y responde con el reporte
normal de `CLAUDE.md`, agregando en "Qué hay nuevo" el enlace a `docs/unslop/` en GitHub para ver
el antes y después.
