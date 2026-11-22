# Auditoría unslop — Quetzal Hoy (22 nov 2026)

Hecha con `.claude/skills/unslop/references/signs.md` sobre las capturas de `docs/unslop/antes/`
(390 px claro y oscuro, Hoy a 1280 px) y el código (`public/styles.css`, `public/app.js`,
`public/*.html`, `src/paginas.js`, `src/compartir.js`).

## Superficies y color
- Degradados de un tono a otro en superficies: cabecera (`.header`, verde oscuro → verde), tarjeta del dólar (`.tarjeta--tc`), botones (`.btn-principal`, `.continuar`, `#btn-instalar` naranja → rojo), portadas de noticias por tema (`.noticia__portada`, 15 combinaciones de color), portadas de cursos (`.curso__portada`), dato del día (`.tarjeta--dato`), bonos (`.bono`), "¿Cómo te afecta?" (`.noticia__afecta`), barra de avance (`.barra__relleno` verde → naranja), barrita de los subtítulos (`.subtitulo::before`)
- Mancha radial de color detrás del contenido: `.tarjeta--tc::before` (radial verde)
- Sombras de color: tarjeta del dólar (verde 0.28), botón principal (verde), tarjeta de instalar (naranja), ícono del dato del día (naranja)
- Resaltador de color bajo los títulos (`.resaltado`, degradado naranja bajo "Guatemala", "explicadas")
- Borde de color fuerte: tarjeta de instalar (2 px naranja)
- Fondos teñidos de verde en vez de neutros: `--c-fondo #F3F6F2` claro y `#0B1510` oscuro, tarjetas `#15221B`
- Todo resaltado a la vez: verde, naranja, rojo, morado, azul en una misma pantalla; nada destaca
- Subidas y bajadas del dólar en verde/naranja (`.tc__cambio--baja/--sube`), justo lo que la dirección pide evitar

## Tipografía
- Títulos en peso 800: `.seccion-titulo`, `.marca`, `.dato__titulo`, `.curso__titulo`, `.indicador__valor`, `.noticia__titulo`
- Etiquetas en mayúsculas con espaciado ancho: `.tarjeta__titulo` ("TIPO DE CAMBIO DEL DÓLAR", "INFLACIÓN INTERANUAL"), `.noticias__fecha` ("RESUMEN DEL 3 NOV 2026"), `.noticia__medio`, `.noticia__tema` ("COMBUSTIBLES"), `.badge`, `.opcion__datos dt`, `.tabla th`, imagen del día ("DÓLAR HOY", "LO QUE IMPORTA HOY")
- Demasiados tamaños: de 0.65 rem a 2.7 rem, con textos de 10–12 px (badges, sellos de fuente, ejes de la gráfica, pie de las tarjetas) por debajo del mínimo de 13 px
- Espaciado negativo en texto pequeño o mediano: `.subtitulo` (-0.02em a 18 px), `.noticia__titulo` (-0.015em), `.curso__titulo`
- Cifras sin `tabular-nums` en tasas de la tabla, calculadoras y convertidor; formatos mezclados ("Q 7.6478", "+0.0116 vs. ayer (7.6362)" sin Q, "$2,241 M")
- Tipografía del sistema sin elegir (ninguna familia decidida para el carácter)

## Íconos
- Emojis como íconos: indicadores (📈 🏦 💸 ⛽ 🧺), dato del día (💡), portadas de noticias (⛽ 💵 💸 🏦 🛒 👷 🧾 🚢 🏭 📈 🤖 🏠 💊 🌎 🇬🇹), cursos (📝 🔓 🌱, también en las páginas web de cursos), 404 (🔍), sin conexión (📵), pasos de instalar (⎙), resumen de WhatsApp (💵 📰 💡)
- Íconos de muchos colores y tamaños (emojis a color de 18 a 48 px junto a íconos de línea de 22 px)
- Logo: quetzal de dos colores con ojo naranja y plumas en dos tonos; en la cabecera, otro tamaño y otro estilo que en el ícono de la app

## Espaciado
- Valores sueltos fuera de la escala de 4: 6, 10, 14, 18, 3/9, 2/8 px en paddings y márgenes (`.badge`, `.header__fecha`, `.noticia__medio`, `.instalar`, `.rango`, `.btn-compartir`…)
- Rellenos distintos en tarjetas hermanas: tarjetas 16 px, noticias 0 + cuerpo 16, cursos 0 + márgenes laterales, tabla de tasas 4/16
- Franja vacía grande dentro de la tarjeta del dólar (`min-height: 470px`) cuando la gráfica no carga, muy visible a 1280 px
- Hueco grande antes del pie (`.footer-links` con 20 px + espacio de la barra)

## Textos
- Punto final en etiquetas y textos cortos: "Fuente: Banco de Guatemala, 22 nov 2026.", "Calculado con datos de Banguat.", "Sin cambios desde febrero de 2026" (bien), "Hoy no hay dato disponible.", "Revisa los números."
- Cambio del dólar sin decir qué compara en palabras: "▲ +0.0116 vs. ayer (7.6362)"
- Afirmaciones que no se pueden comprobar: "Cada año miles de guatemaltecos pierden sus ahorros en «negocios»…" (Invertir); "Audiencia en Guatemala, mayoritariamente desde celular" (Anúnciate); "Uso mayoritario desde celular con datos móviles" (media kit)
- Etiqueta "Resumen automático" como pastilla con borde, más llamativa que el contenido
- Mayúsculas de título en la fecha de la cabecera ("Dom, 22 Nov")

## Componentes
- Pastillas por todos lados: fecha en la cabecera, medio y tema en cada noticia, "Septiembre 2026", "dato de septiembre", "Riesgo bajo", "Resumen automático", botones "Compartir", pestañas de Invertir
- Badges de color para riesgo (verde, naranja, rojo) y para antigüedad (rojo)
- La fuente y fecha de cada dato se ve distinta en cada lugar (línea con borde superior, texto suelto, pie de tabla, texto con "Fuente:"): no hay un componente
- Gráfica del dólar con área rellena y línea gruesa, sin rejilla ni etiquetas de valor; el punto de hoy en naranja sobre verde
- Todas las tarjetas iguales en la columna; nada es más importante que lo demás salvo el bloque verde

## Visuales
- Relleno decorativo: franja de "tejido" de triángulos bajo la cabecera y en cada portada; quetzal gigante como marca de agua en la tarjeta del dólar; portadas de color por tema en cada noticia y cada curso
- Imagen del día con fondo verde, franja de tejido y títulos en mayúsculas

## Movimiento
- `transition` de `transform` en todas las tarjetas tocables y escala al presionar tarjetas grandes (cursos, lecciones)
- Sin curva ni duraciones comunes; cada regla con su propio tiempo
- El spinner de "Cargando" gira en bucle (aceptable: indica carga real)

## Layout
- En pantallas anchas la app queda como tira angosta de 600 px en el centro y la barra inferior se estira de borde a borde (captura a 1280 px)
- Pestañas de Invertir con barra de desplazamiento visible

## Nivel
**Fuerte.** Hay señales en todos los grupos: color, tipografía, íconos, textos, componentes y visuales.
Se aplica el proceso completo de 9 pasadas con la dirección aprobada en `UNSLOP.md`.

---
Auditoría hecha con unslop de Damir Sokolovsky (@heydamir), CC BY 4.0.
