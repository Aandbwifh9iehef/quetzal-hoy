# Quetzal Hoy

App web instalable en el celular con información financiera de Guatemala: tipo de cambio del día,
indicadores, noticias explicadas en sencillo, comparador de inversiones y cursos cortos.

Vive en **https://hoy.compoundclub.fyi**.

## Cómo está hecha

- Cloudflare Workers: el Worker sirve los archivos de `public/` y corre tareas automáticas (cron).
- HTML, CSS y JavaScript sin frameworks, para que cargue rápido con datos móviles.
- Los textos y colores de la app salen de `site.config.json`.

## Comandos

```bash
npm test          # pruebas automáticas
npm run dev       # correr en la computadora (http://localhost:8787)
npm run deploy    # publicar a mano (normalmente no hace falta: cada push a main publica solo)
```

## Carpetas

- `public/` — las páginas, estilos, íconos y service worker.
- `src/` — el Worker y la lógica de datos.
- `data/` — datos editoriales en JSON (cursos, inversiones, indicadores).
- `tests/` — pruebas con `node:test`.
- `PLAN.md` — las fases del proyecto. `PROGRESO.md` — en qué fase vamos.
