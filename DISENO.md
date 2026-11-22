# Diseño de Quetzal Hoy

Fuente única de verdad del diseño. Los valores viven en `public/styles.css` (`:root`). Si algo no está
aquí, no se inventa: se usa lo que hay o se agrega aquí primero.

Rediseño de la Fase U, guiado por unslop de Damir Sokolovsky (@heydamir), CC BY 4.0.

## Dirección

- **Producto.** App gratis para que cualquier guatemalteco sepa cada mañana a cómo está el dólar, qué
  pasa con la economía y aprenda a manejar su dinero desde un celular sencillo.
- **Carácter.** Exacto, sereno, cercano.
- **Mundo.** El billete de quetzal y la libreta de ahorro: papel, tinta verde de grabado, sello con
  fecha, boleta de depósito.
- **Momentos.**
  1. La tarjeta del dólar: cifra grande con números tabulares, gráfica de línea fina, el punto de hoy
     en el color de acento y una rejilla tenue con etiquetas pequeñas. Lleva un guilloché (roseta de
     billete) muy tenue en la esquina; es el único lugar donde aparece.
  2. Las gráficas de las calculadoras: lo que tú pones en neutro, los intereses en acento. Lo que se
     pierde por inflación, en rojo (es un resultado de verdad malo).
- **Firma.** El sello: `Banguat · 22 nov 2026`, en letra monoespaciada, borde fino, radio 4 y color
  apagado. Es el mismo componente en toda la app para la fuente y la fecha de cada dato. Nada más
  tiene ese aspecto.

## Tokens

### Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--fondo` | `#f4f4f0` | `#111412` | Fondo de página (papel) |
| `--superficie` | `#ffffff` | `#191d1b` | Tarjetas, barra inferior |
| `--superficie-2` | `#ebebe5` | `#232826` | Pasos internos: avisos, bonos, segmentos |
| `--linea` | tinta al 10% | blanco al 10% | Bordes finos y separadores |
| `--linea-fuerte` | tinta al 20% | blanco al 20% | Bordes de controles y del sello |
| `--texto` | `#17201b` | `#e9edeb` | Texto principal |
| `--texto-2` | `#47504b` | `#b5bdb9` | Texto secundario |
| `--texto-3` | `#5c6560` | `#98a19c` | Metadatos, sellos, ejes |
| `--acento` | `#1d6b4f` | `#5fbf94` | Acción principal, selección, punto de hoy, intereses |
| `--acento-texto` | `#ffffff` | `#0d1a13` | Texto sobre el acento |
| `--mal` | `#a3302a` | `#f08b81` | Solo errores y resultados malos de verdad (pérdida por inflación, respuesta incorrecta) |
| `--bien` | = acento | = acento | Solo resultados buenos de verdad (respuesta correcta) |

Contraste comprobado (WCAG AA ≥ 4.5:1) para los tres textos, el acento y `--mal` sobre las tres
superficies, y para el botón principal, en claro y en oscuro.

Las subidas y bajadas del dólar **no** llevan rojo ni verde: flecha y "Q 0.0116 más que ayer" en
`--texto-2`.

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
- **Tarjeta** (`.tarjeta`): `--superficie`, borde `--linea`, radio 12, relleno 16 (20 en escritorio).
  Sin sombra. Variante `.tarjeta--plana` en `--superficie-2` para "Continuar donde te quedaste".
- **Botón principal** (`.btn-principal`): fondo acento, 48 px de alto, radio 8, peso 500. Uno por
  pantalla o por bloque.
- **Botón secundario** (`.btn-secundario`): transparente con borde `--linea-fuerte`. Para Compartir,
  Ahora no, Siguiente lección, Reintentar.
- **Botón de texto** (`.btn-texto`): enlaces de acción dentro de tarjetas (Compartir, Leer en…).
- **Fila** (`.filas` > `.fila`): listas dentro de una sola tarjeta con separadores finos:
  indicadores, opciones, tasas, señales de estafa, lecciones. Nombre a la izquierda, valor a la
  derecha alineado.
- **Barra inferior** (`.nav-inferior`): 4 pestañas con ícono de 22 px y texto de 13 px; la activa en
  acento.
- **Gráfica del dólar** (`graficaSvg`): línea de 1.5 px en `--texto-2`, rejilla de 3 líneas en
  `--linea`, etiquetas en mono 13 px, punto de hoy en acento con anillo del color de la tarjeta.
- **Gráfica de calculadora**: columnas (hasta 12) o barra partida; neutro = lo que pones, acento =
  intereses, `--mal` = lo que pierdes. Siempre con leyenda.
- **Aviso legal** (`.aviso-legal`): texto secundario con línea fina arriba al final de cada sección;
  variante `--arriba` en `--superficie-2` al inicio de Invertir.
- **Estado vacío** (`.vacio`): título, una frase y como máximo un botón secundario. Sin íconos.

Íconos: Lucide, trazo 1.5, en línea (sin librería). 22 px en la navegación, 18 px en todo lo demás.

Marca: el nombre (de `site.config.json`) en Figtree 600 y una Q con la cola larga del quetzal, en un
solo color. Los íconos y la imagen para redes se generan con `node scripts/iconos.mjs`.

## Sí y no

Sí:
- Fuente y fecha de cada dato en un sello.
- Un acento usado poco: acción principal, selección, punto de hoy, intereses.
- Frases en tipo oración, sin punto final en títulos, botones y etiquetas.
- Comparaciones con referencia en palabras: "Q 0.0116 más que ayer", "más que el 3 nov".

No:
- Degradados, brillos, sombras de color, manchas de color, fondos teñidos.
- Emojis en la interfaz (tampoco en el resumen de WhatsApp).
- Etiquetas en mayúsculas, pesos 700+, cursivas.
- Pastillas para todo: el sello es lo único con borde y texto pequeño.
- Rojo o verde para el dólar.
- Exclamaciones, saludos, palabras de moda, cifras que no se pueden comprobar.
- Animaciones en bucle o con rebote; escalas al pasar el mouse.

## Antes de cada reporte

Toda pantalla nueva o cambiada pasa la checklist de `.claude/skills/unslop/SKILL.md`. Capturas con
`node scripts/capturas.mjs http://localhost:8787 <carpeta>` (390 px claro y oscuro, Hoy a 1280 px).
