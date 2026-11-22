# Diseño de Al cambio

Fuente única de verdad del diseño. Los valores viven en `public/styles.css` (`:root`). Si algo no está
aquí, no se inventa: se usa lo que hay o se agrega aquí primero.

Base de la Fase U (guiada por unslop de Damir Sokolovsky, @heydamir, CC BY 4.0). Desde la Fase 11 la app
se llama **Al cambio** y usa la paleta **Quetzal vivo**, que Raúl pidió porque la anterior se veía plana.

## Dirección

- **Producto.** App gratis para que cualquier guatemalteco sepa cada mañana a cómo está el dólar, qué
  pasa con la economía y aprenda a manejar su dinero desde un celular sencillo.
- **Nombre.** Al cambio: como se pregunta en Guatemala "¿a cómo está el cambio?".
- **Carácter.** Exacto, cercano, con orgullo chapín. Vivo, no chillón.
- **Mundo.** El quetzal y su billete: plumaje verde jade, pecho rojo, dorado de las monedas, papel crema
  y la roseta (guilloché) de los billetes.
- **Momentos.**
  1. La tarjeta del dólar, en verde jade: cifra grande crema con números tabulares, gráfica de línea
     crema, el punto de hoy en dorado y la roseta de billete al 12% en la esquina.
  2. Las gráficas de las calculadoras: lo que tú pones en neutro, los intereses en acento. Lo que se
     pierde por inflación, en rojo (es un resultado de verdad malo).
  La tarjeta del dólar es lo **único con color fuerte** en Hoy (corrección del 22 nov 2026, después
  de revisar la app en vivo: los mosaicos de color, el fondo dorado del dato del día y las portadas
  de color de los cursos se veían como restos de plantilla y se quitaron). La cabecera es neutra, con
  el logo en color.
- **Firma.** El sello: `Banguat · 22 nov 2026`, en letra monoespaciada, borde fino, radio 4 y color
  apagado. Es el mismo componente en toda la app para la fuente y la fecha de cada dato. Nada más
  tiene ese aspecto.

## Tokens

### Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--fondo` | `#f7f4ec` | `#0c1411` | Fondo de página (papel crema) |
| `--superficie` | `#ffffff` | `#14201a` | Tarjetas, barra inferior |
| `--superficie-2` | `#efeadd` | `#1c2a23` | Pasos internos: segmentos, campos |
| `--linea` / `--linea-fuerte` | tinta al 10% / 20% | crema al 10% / 20% | Bordes y separadores |
| `--texto` | `#14211b` | `#ecf1ee` | Texto principal |
| `--texto-2` | `#46534c` | `#b4c0b9` | Texto secundario |
| `--texto-3` | `#5b6660` | `#93a199` | Metadatos, sellos, ejes |
| `--acento` | `#0b7552` | `#3ccf93` | Jade: acción principal, selección, intereses |
| `--acento-suave` | `#dcefe5` | `#173a2c` | Pestaña activa |
| `--tarjeta-dolar` | `#0a6b4b` | `#0d3a2a` | Tarjeta del dólar (el único bloque de color fuerte) |
| `--crema` | `#f7f4ec` | `#f7f4ec` | Texto sobre la tarjeta del dólar (al 85% para lo secundario) |
| `--rojo` | `#c62d3a` | `#ff6b72` | Punto rojo del logo (pecho del quetzal) |
| `--oro` | `#e9a81b` | `#f4bf45` | Punto de hoy en la gráfica, pluma del logo, punto de riesgo medio |
| `--mal` | `#b8293a` | `#ff7a80` | Errores y resultados malos de verdad (pérdida por inflación, respuesta incorrecta) |
| `--bien` | = acento | = acento | Resultados buenos de verdad |

Contraste comprobado (WCAG AA ≥ 4.5:1) en claro y oscuro para: los tres textos, el acento y `--mal`
sobre las tres superficies; crema sobre la tarjeta del dólar (secundario al 85%); jade sobre
`--acento-suave`; botón principal.

El rojo y el verde **no** se usan para decir si el dólar subió o bajó: flecha y "Q 0.0116 más que ayer"
en texto secundario. El rojo de marca vive solo en el logo; como color de significado marca pérdidas y errores.

### Tipografía

- Familia: **Figtree** (variable 400–600), subconjunto latino, 20 KB, autoalojada en
  `public/fonts/figtree-latin.woff2` con `font-display: swap`. Sin pedidos a Google.
- Sello y ejes: `ui-monospace` del sistema.
- Todos los números con `font-variant-numeric: tabular-nums`.
- Pesos: 400 (texto), 500 (títulos, valores), 600 (nombre de la app y negritas). Nada de 700+.
- Sin cursiva (los `<em>` se ven en peso 500) y sin etiquetas en mayúsculas.

| Token | Tamaño | Uso |
|---|---|---|
| `--t-meta` | 13 px | Sellos, metadatos, ejes. Nada es más pequeño |
| `--t-2` | 15 px | Texto secundario |
| `--t-cuerpo` | 16 px | Texto normal |
| `--t-tarjeta` | 18 px | Títulos de tarjeta, valores de filas |
| `--t-seccion` | 22 px | Títulos de sección |
| `--t-pagina` | 28 px (32 en escritorio) | Título de pantalla |
| `--t-cifra` | 28 px | Resultado de calculadoras |
| `--t-tc` | 52 px | Cifra del dólar |

### Espacio, radios y movimiento

- Escala de 4: `--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 20 · `--s6` 24 · `--s8` 32 ·
  `--s10` 40 · `--s12` 48 · `--s16` 64.
- Radios: `--r-sello` 4 (sello y piezas dentro de tarjetas) · `--r-control` 8 (botones, campos) ·
  `--r-tarjeta` 12.
- Toque mínimo `--toque` 44 px. Barra inferior `--barra` 64 px + área segura.
- Curva única `--curva` `cubic-bezier(0.22, 1, 0.36, 1)`; `--rapido` 150 ms para respuesta,
  `--entrada` 360 ms para la entrada de una pestaña (aparece y sube 4 px). Con
  `prefers-reduced-motion` todo es instantáneo.

### Layout

- Primero móvil (360–430 px): márgenes de 16 px, una columna.
- Desde 900 px: ancho máximo 1120 px; Hoy e Invertir a dos columnas (7/5); la navegación sube a la
  cabecera y la barra inferior desaparece. Noticias y Aprende quedan en una columna de lectura.
- Lecturas largas (lecciones, páginas legales): máximo 680 px.

## Componentes

- **Sello** (`.sello`): fuente corta · fecha (`Banguat · 22 nov 2026`). Mono 13 px, borde
  `--linea-fuerte`, radio 4, color `--texto-3`. Si hay enlace a la fuente, el sello es el enlace (con
  área de toque ampliada). La fuente completa va en el `title`. Las notas largas ("Cálculo propio con
  datos de Banguat") van al lado en `.meta`, nunca dentro del sello. En JS: `sello(fuente, fecha, url)`
  en `public/app.js` y en `src/paginas.js`.
- **Cabecera** (`.cabecera`): neutra, sobre el fondo; logo en color y nombre en texto. En escritorio
  lleva las cuatro pestañas (la activa en jade sobre `--acento-suave`).
- **Tarjeta** (`.tarjeta`): `--superficie`, borde `--linea`, radio 12, relleno 16 (20 en escritorio).
  Sin sombra. Variantes: `.tarjeta--tc` (jade, texto crema) y `.tarjeta--plana` (`--superficie-2`,
  "Continuar donde te quedaste"). El dato del día es una tarjeta normal.
- **Ícono en columna** (`.con-icono`): ícono de línea de 20 px, sin fondo, en su propia columna a la
  izquierda (indicadores en `--texto-2`, cursos en acento). En noticias va en línea con el tema y el sello.
- **Punto de riesgo** (`.punto--bajo|medio|alto`): 8 px en jade, dorado o rojo junto a "Riesgo …".
- **Botón principal** (`.btn-principal`): fondo acento, 48 px de alto, radio 8, peso 500. Uno por
  pantalla o por bloque.
- **Botón secundario** (`.btn-secundario`): transparente con borde `--linea-fuerte`. Para Compartir,
  Ahora no, Siguiente lección, Reintentar.
- **Botón de texto** (`.btn-texto`): enlaces de acción dentro de tarjetas (Compartir, Leer en…).
- **Fila** (`.filas` > `.fila`): listas dentro de una sola tarjeta con separadores finos:
  indicadores, opciones, tasas, señales de estafa, lecciones. Nombre a la izquierda, valor a la
  derecha alineado.
- **Barra inferior** (`.nav-inferior`): 4 pestañas con ícono de 22 px y texto de 13 px; la activa en
  jade con una pastilla `--acento-suave` detrás del ícono.
- **Gráfica del dólar** (`graficaSvg` en `public/render.js`): línea crema de 2 px, rejilla de 3 líneas,
  etiquetas en mono 13 px, punto de hoy dorado. El eje nunca muestra menos de **Q0.05** para no
  exagerar cambios chicos, y arriba de la gráfica va el cambio del período en texto
  ("+Q 0.007 en 7 días").
- **Barra de instalar** (`.barra-instalar`): una línea fija encima de las pestañas, desde la segunda
  visita, con botón "Instalar" (Android con el aviso del navegador) o instrucciones cortas (iPhone:
  Compartir › Agregar a inicio; Android sin aviso: menú ⋮ › Instalar app). Mientras se ve, la página
  suma su alto abajo para que nunca tape contenido. La X la oculta para siempre.
- **Gráfica de calculadora**: columnas (hasta 12) o barra partida; neutro = lo que pones, acento =
  intereses, `--mal` = lo que pierdes. Siempre con leyenda.
- **Aviso legal** (`.aviso-legal`): texto secundario con línea fina arriba al final de cada sección;
  variante `--arriba` en `--superficie-2` al inicio de Invertir.
- **Estado vacío** (`.vacio`): título, una frase y como máximo un botón secundario. Sin íconos.

Íconos: Lucide, trazo 1.5, en línea (sin librería). 22 px en la navegación, 20 px en columnas de
íconos, 18 px en todo lo demás.

Marca: el nombre (de `site.config.json`) en Figtree 600 y una C de "cambio" con el punto rojo del pecho del
quetzal y la punta dorada de la pluma. Los íconos y la imagen para redes se generan con `node scripts/iconos.mjs`.

## Sí y no

Sí:
- Fuente y fecha de cada dato en un sello.
- Un solo bloque de color fuerte en Hoy: la tarjeta del dólar.
- El HTML de Hoy, Noticias e Invertir sale de `public/render.js`: lo usa el Worker para mandar la
  portada ya llena (SEO) y el navegador para actualizar. No dupliques ese HTML en otro lado.
- Frases en tipo oración, sin punto final en títulos, botones y etiquetas.
- Comparaciones con referencia en palabras: "Q 0.0116 más que ayer", "más que el 3 nov".

No:
- Degradados, brillos, sombras de color, manchas de color.
- Emojis en la interfaz (tampoco en el resumen de WhatsApp).
- Etiquetas en mayúsculas, pesos 700+, cursivas.
- Pastillas para todo: el sello es lo único con borde y texto pequeño (la pestaña activa es la excepción).
- Rojo o verde para el dólar.
- Exclamaciones, saludos, palabras de moda, cifras que no se pueden comprobar.
- Animaciones en bucle o con rebote; escalas al pasar el mouse.

## Antes de cada reporte

Toda pantalla nueva o cambiada pasa la checklist de `.claude/skills/unslop/SKILL.md`. Capturas con
`node scripts/capturas.mjs http://localhost:8787 <carpeta>` (390 px claro y oscuro, Hoy a 1280 px).
