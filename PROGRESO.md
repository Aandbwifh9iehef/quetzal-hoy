# Progreso — Quetzal Hoy

## Siguiente fase: 2 — Tipo de cambio automático

| Fase | Nombre | Estado | Fecha |
|---|---|---|---|
| 1 | Esqueleto, diseño y publicación | Hecha | 3 nov 2026 |
| 2 | Tipo de cambio automático | Pendiente | |
| 3 | Indicadores y dato del día | Pendiente | |
| 4 | Noticias automáticas | Pendiente | |
| 5 | Invertir: comparador y calculadoras | Pendiente | |
| 6 | Aprende: cursos | Pendiente | |
| 7 | Resumen para WhatsApp | Pendiente | |
| 8 | SEO, analítica y pulido | Pendiente | |
| 9 | Listo para ganar dinero | Pendiente | |
| 10 | App en Google Play | Pendiente | |

## Pendientes de Raúl
- **Bloquea la publicación (no la fase 2):** conectar el repo `quetzal-hoy` a Cloudflare Workers
  (Workers & Pages → Create → Import a repository → elegir `quetzal-hoy`; el build detecta
  `wrangler.jsonc` solo) y agregar el dominio personalizado `hoy.compoundclub.fyi` en
  Settings → Domains & Routes del Worker.
- Para la fase 2 hará falta un KV. Claude Code dará los clics exactos en ese momento.

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
