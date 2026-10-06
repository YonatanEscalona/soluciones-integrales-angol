# Soluciones Integrales Angol

Sitio independiente enfocado en construcción de casas, quinchos, radieres y remodelaciones en todo Chile, con base en Angol, desarrollado con Astro. El sitio general de la empresa sigue en solucionesintegralesangol.cl.

## Desarrollo local

```sh
pnpm install
pnpm dev
```

## Publicación

Cada cambio enviado a `main` genera y publica el sitio en GitHub Pages mediante `.github/workflows/deploy.yml`.

## SEO y contenido

La portada y cuatro páginas de servicios se generan como HTML estático, con títulos y descripciones propios, canonical, datos estructurados y sitemap. Los textos están en `src/data/services.ts`; los datos verificados de contacto, en `src/data/business.ts`.

```sh
pnpm build
pnpm check:seo
```

La comprobación SEO usa Python 3, sin dependencias adicionales. Revisa las páginas generadas en `dist`, sus enlaces, anclas, imágenes, metadatos, JSON-LD y sitemap. No sustituye Search Console, mediciones reales de rendimiento ni validadores externos.

Para un futuro dominio independiente, configurar `SITE_URL` con el origen HTTPS, por ejemplo `https://dominio-elegido.cl`, y `BASE_PATH=/`. Sin estas variables, el build usa la URL actual de GitHub Pages y su subcarpeta. El alojamiento y DNS del nuevo dominio requieren configuración aparte; estas variables solo construyen URLs.

GitHub Pages publica este proyecto bajo `/soluciones-integrales-angol/`. El `robots.txt` generado en esa carpeta no controla los rastreadores del origen: estos consultan `/robots.txt`. El sitemap se puede enviar directamente a Search Console. Al alojar en la raíz de un dominio propio, el archivo generado sí estará en la ubicación adecuada.

Informe y prioridades externas: [docs/seo-audit.md](docs/seo-audit.md).
