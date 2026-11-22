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
  3. Bloques de color con sentido: cabecera verde hondo en todas las páginas, dato del día en dorado,
     portadas de los cursos (jade, rojo, dorado) y mosaicos de color con íconos de línea en indicadores y
     noticias.
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
| `--acento-suave` | `#dcefe5` | `#173a2c` | Fondo de mosaicos jade, bonos, pestaña activa |
| `--hondo` | `#06422f` | `#0d3a2a` | Cabecera de todas las páginas |
| `--tarjeta-dolar` | `#0a6b4b` | `#0d3a2a` | Tarjeta del dólar |
| `--crema` | `#f7f4ec` | `#f7f4ec` | Texto sobre verde (al 85% para lo secundario) |
| `--rojo` | `#c62d3a` | `#ff6b72` | Pecho del quetzal: punto del logo |
| `--rojo-hondo` | `#b8293a` | `#b8293a` | Portada roja con texto crema |
| `--rojo-suave` | `#fbe3e3` | `#3a1c1f` | Fondo de mosaicos rojos |
| `--oro` | `#e9a81b` | `#f4bf45` | Dorado: punto de hoy, pluma del logo, portada dorada |
| `--oro-texto` | `#7a5200` | `#f4bf45` | Texto dorado sobre `--oro-suave` |
| `--oro-suave` | `#fbeac0` | `#2e2614` | Dato del día, aviso de Invertir, mosaicos dorados |
| `--mal` | `#b8293a` | `#ff7a80` | Errores y resultados malos de verdad (pérdida por inflación, respuesta incorrecta) |
| `--bien` | = acento | = acento | Resultados buenos de verdad |

Contraste comprobado (WCAG AA ≥ 4.5:1) en claro y oscuro para: los tres textos, el acento y `--mal`
sobre las tres superficies; crema sobre la cabecera y la tarjeta del dólar (secundario al 85%); texto y
enlaces sobre `--oro-suave`; jade sobre `--acento-suave`; crema sobre `--rojo-hondo`; verde hondo sobre
`--oro`; botón principal.

El rojo y el verde **no** se usan para decir si el dólar subió o bajó: flecha y "Q 0.0116 más que ayer"
en texto secundario. El rojo de marca vive en el logo, la portada de "Sal de deudas" y los mosaicos de
temas como combustibles o precios; como color de significado solo marca pérdidas y errores.

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
- **Cabecera** (`.cabecera`): banda `--hondo` a todo lo ancho con la marca en crema; en escritorio
  lleva también las cuatro pestañas (la activa en fondo crema).
- **Tarjeta** (`.tarjeta`): `--superficie`, borde `--linea`, radio 12, relleno 16 (20 en escritorio).
  Sin sombra. Variantes: `.tarjeta--tc` (jade, texto crema), `.tarjeta--dato` (dorado suave),
  `.tarjeta--plana` (`--superficie-2`, "Continuar donde te quedaste").
- **Mosaico** (`.mosaico--jade|rojo|oro`): cuadro de 40 px, radio 8, con un ícono de línea de 20 px en
  el color fuerte sobre su tono suave. Indicadores, temas de noticias y dato del día.
- **Portada de curso** (`.portada--jade|rojo|oro`): franja de 88 px con un ícono de línea de 44 px y el
  número del curso. Presupuesto en jade, deudas en rojo, invertir en dorado.
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
- **Gráfica del dólar** (`graficaSvg`): línea de 1.5 px en `--texto-2`, rejilla de 3 líneas en
  `--linea`, etiquetas en mono 13 px, punto de hoy en acento con anillo del color de la tarjeta.
- **Gráfica de calculadora**: columnas (hasta 12) o barra partida; neutro = lo que pones, acento =
  intereses, `--mal` = lo que pierdes. Siempre con leyenda.
- **Aviso legal** (`.aviso-legal`): texto secundario con línea fina arriba al final de cada sección;
  variante `--arriba` en `--superficie-2` al inicio de Invertir.
- **Estado vacío** (`.vacio`): título, una frase y como máximo un botón secundario. Sin íconos.

Íconos: Lucide, trazo 1.5, en línea (sin librería). 22 px en la navegación, 20 px dentro de mosaicos,
44 px en portadas de cursos, 18 px en todo lo demás.

Marca: el nombre (de `site.config.json`) en Figtree 600 y una C de "cambio" con el punto rojo del pecho del
quetzal y la punta dorada de la pluma. Los íconos y la imagen para redes se generan con `node scripts/iconos.mjs`.

## Sí y no

Sí:
- Fuente y fecha de cada dato en un sello.
- Color en bloques con sentido: cabecera, tarjeta del dólar, dato del día, portadas y mosaicos.
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
