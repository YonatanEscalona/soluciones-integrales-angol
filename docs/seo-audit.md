# Auditoría SEO y captación de consultas

Fecha: 6 de octubre de 2026.

Sitio revisado: https://yonatanescalona.github.io/soluciones-integrales-angol/

## Objetivo y alcance

Captar solicitudes para construir casas y realizar trabajos residenciales relacionados en todo Chile. La acción principal es cotizar por WhatsApp al +56 9 3517 2731.

Actualización de cobertura confirmada por el usuario el 6 de octubre de 2026: Soluciones Integrales trabaja en todo Chile y se traslada al lugar del proyecto. Angol es su base, no un límite de atención. Se ajustaron portada, servicios, preguntas frecuentes, contacto, metadatos y `areaServed` al país Chile. Las rutas ya publicadas que contienen `-angol` se conservan para mantener los enlaces y canonicals; su contenido comunica cobertura nacional.

El usuario confirmó que esta web es independiente de solucionesintegralesangol.cl, que seguirá mostrando servicios generales. No es una migración: esta publicación conserva sus URLs y canonicals propios. Ambas representan la misma empresa; no se presenta una segunda empresa ficticia.

Se aplicó la skill `seo-audit`. El alcance incluye rastreo, contenido estático, metadatos, SEO local, datos estructurados, búsquedas con IA y facilidad para iniciar una cotización. No se dispuso de Search Console, Perfil de Empresa, analítica ni datos de contratos; por tanto, no se atribuyen pérdidas de tráfico, mejoras porcentuales de conversión ni posiciones en Google.

## Resumen

La versión inicial tenía una portada liviana y contacto visible, pero concentraba todos los servicios en una sola URL. Faltaban sitemap y datos estructurados. Las mejoras publicadas dan a cada servicio una página útil, conectan la información con la cotización y mantienen el diseño negro, amarillo y blanco, la familia REM y los planificadores existentes.

El trabajo técnico deja cinco páginas rastreables. Conseguir consultas y contratos también dependerá de la demanda, la zona, las pruebas reales de trabajos, la reputación del negocio y la respuesta comercial. Indexación, menciones en asistentes y contratación no se pueden garantizar desde el código.

## Hallazgos y correcciones

| Prioridad | Evidencia inicial | Impacto | Cambio realizado |
|---|---|---|---|
| Alta | Una sola URL para casas, radieres, quinchos y remodelaciones | Poca información específica para quien busca un servicio concreto | Cuatro páginas estáticas con alcance, preparación de la cotización y dudas propias de cada servicio |
| Alta | El sitemap del proyecto respondía 404 | Faltaba una lista explícita de URLs para enviar a los buscadores | `sitemap.xml` con las cinco URLs canónicas |
| Alta | El navegador renderizado no encontraba scripts JSON-LD | La relación entre empresa, web y servicios no estaba descrita mediante datos estructurados | `GeneralContractor`, `WebSite`, `WebPage`, y `Service` y `BreadcrumbList` en las páginas correspondientes |
| Media | El canonical dependía de `Astro.url.href` | Riesgo de incluir parámetros o fragmentos al reutilizar el layout | URL canónica absoluta basada en la ruta; sin parámetros ni fragmentos |
| Media | El `main` solo contenía el hero; los servicios estaban fuera | Estructura de navegación asistida incompleta | Todo el contenido principal queda dentro de un único `main` |
| Media | Poca explicación de los datos necesarios para cotizar | El visitante podía iniciar una conversación sin información suficiente | Guías, preguntas frecuentes y mensajes de WhatsApp específicos para cada servicio |
| Media | No había enlaces a páginas propias de servicio | Los servicios no tenían destinos internos descriptivos | Enlaces desde la portada, navegación entre servicios y rutas de navegación visibles |
| Media | No había un archivo de rastreo preparado para un futuro dominio propio | Faltaba configuración reutilizable al publicar en raíz | Endpoint `robots.txt`; limitación de GitHub Pages documentada abajo |

### Lo que ya estaba bien

- HTTPS, HTML estático y contenido principal accesible sin ejecutar JavaScript.
- Imagen principal WebP de aproximadamente 126 KiB, con dimensiones, carga prioritaria y decodificación asíncrona.
- Fotografías de la galería con dimensiones y carga diferida.
- Teléfono, correo y dirección visibles; botón de WhatsApp y formularios existentes.
- Galería que identifica modelos referenciales y fotografías del portafolio. Esa distinción se conserva.
- Formularios que preparan una solicitud; el visitante revisa y envía el mensaje en WhatsApp.

## Arquitectura y contenido

| URL relativa | Intención principal | Acción de la página |
|---|---|---|
| `/` | Presentación de la constructora y orientación para elegir un proyecto | Ver servicios, planificar y cotizar |
| `/servicios/construccion-casas-angol/` | Construcción de casas tradicionales, modulares y alcance llave en mano | Cotizar una casa o preparar una distribución orientativa |
| `/servicios/radieres-angol/` | Construcción de radieres, condiciones del terreno y datos para cotizar | Enviar medidas, uso y comuna |
| `/servicios/quinchos-angol/` | Construcción de quinchos, base, cubierta y equipamiento | Cotizar el proyecto o planificar una mejora existente |
| `/servicios/remodelaciones-angol/` | Mejoras de viviendas, cocinas, baños, interiores y terrazas | Seleccionar espacios y trabajos, y solicitar presupuesto |

Las rutas se publican bajo `/soluciones-integrales-angol/`. No se crearon páginas repetidas para cada comuna, reseñas ficticias, precios automáticos, acreditaciones no comprobadas ni cantidades de obras inventadas. Las páginas tienen títulos y descripciones propios, un H1 y enlaces de retorno. La portada conserva el titular y la imagen aprobados.

El contenido responde a dudas de presupuesto sin fijar especificaciones constructivas universales. El alcance llave en mano, las exclusiones, la factibilidad y los documentos necesarios se revisan para cada proyecto. Las páginas de servicio añaden información al sitio general y no copian sus textos.

### Datos del negocio

Contacto contrastado con la web original de la empresa:

- Nombre: Soluciones Integrales.
- Teléfono y WhatsApp: +56 9 3517 2731.
- Correo: mauricioeazocar@gmail.com.
- Dirección: Cerro Negro #1388, Angol, La Araucanía, Chile.

`src/data/business.ts` centraliza los datos usados por las nuevas páginas y el marcado. La dirección permanece en Angol y `areaServed` identifica el país Chile. El `sameAs` enlaza con el sitio general para relacionar las dos publicaciones con la misma empresa. No se añadieron horarios ni valoraciones al JSON-LD.

## SEO para buscadores con IA

El enfoque aplicado a ChatGPT Search, AI Overviews y otros sistemas de respuesta consiste en contenido legible, preguntas concretas con respuestas visibles, identidad de empresa consistente, enlaces internos y páginas rastreables. Los datos estructurados describen los mismos servicios y contactos que ve el visitante.

Google indica que no se necesitan archivos especiales ni un schema exclusivo para sus funciones de IA. No se añadió `llms.txt` como supuesto requisito de posicionamiento ni se ofrecieron herramientas que envíen presupuestos en nombre del visitante. Las preguntas frecuentes son contenido útil; no se promete que produzcan resultados enriquecidos.

No se detectó una restricción deliberada para OAI-SearchBot. La ausencia de bloqueos facilita el acceso, pero no demuestra que un asistente haya rastreado, citado o recomendado el negocio. Las políticas de rastreo para búsquedas y entrenamiento son controles distintos.

## Rastreo, indexación y dominio

La portada respondía 200. `/robots.txt` en la raíz de `yonatanescalona.github.io` respondía 404, lo que no constituye por sí mismo un bloqueo de rastreo. Los buscadores consultan ese archivo en la raíz del origen: un archivo dentro de `/soluciones-integrales-angol/` no puede controlar todo el host.

El proyecto genera su propio archivo como preparación para un futuro dominio independiente. Mientras siga en GitHub Pages con subcarpeta, enviar directamente este sitemap a Search Console:

https://yonatanescalona.github.io/soluciones-integrales-angol/sitemap.xml

Una búsqueda pública `site:` no aportó evidencia suficiente para confirmar indexación. La fuente adecuada será Inspección de URLs e Indexación de páginas en Search Console. El marcado y un sitemap no equivalen a una solicitud de indexación ejecutada ni aseguran que Google seleccione todas las páginas.

### Si se decide usar un dominio propio

1. Elegir un dominio para esta web de casas, separado del sitio general.
2. Configurar alojamiento, HTTPS y DNS del dominio elegido.
3. En el build, usar `SITE_URL=https://dominio-elegido.cl` y `BASE_PATH=/`.
4. Verificar canonicals, recursos, sitemap y robots en la raíz del dominio.
5. Redirigir las URLs antiguas si el alojamiento lo permite; evitar mantener indefinidamente dos copias indexables de esta misma web.
6. Verificar el nuevo dominio en Search Console y actualizar los enlaces externos pertinentes.

No se cambió el DNS ni la indexación de solucionesintegralesangol.cl. Un dominio independiente puede facilitar la identificación comercial de esta web; no se presenta como una mejora garantizada de ranking.

## Acciones externas pendientes

| Prioridad | Acción | Cómo comprobarla |
|---|---|---|
| Alta | Verificar una propiedad de prefijo de URL en Search Console para la publicación actual y enviar el sitemap | Estado de lectura del sitemap, inspección de portada y servicios, y URLs indexadas |
| Alta | Revisar el Perfil de Empresa existente: categoría, servicios, zona real, contacto y destino web apropiado | Datos coherentes con la operación y acceso confirmado por el propietario |
| Alta | Publicar casos de casas reales con autorización: fotos, localidad, alcance y explicación del trabajo | Cada caso tiene evidencias del negocio; los modelos referenciales siguen identificados |
| Alta | Registrar consultas y seguimiento comercial | Fecha, servicio, comuna, origen declarado, consulta válida, presupuesto y contrato; separar clics de ventas |
| Media | Verificar Bing Webmaster Tools y enviar el sitemap | Estado del sitemap, rastreo e indexación en Bing |
| Media | Solicitar reseñas a clientes reales y responderlas | Reseñas auténticas en el perfil existente; sin textos ni puntuaciones inventados |
| Media | Medir rendimiento móvil con PageSpeed Insights y, cuando existan datos, Core Web Vitals | Identificar problemas concretos antes de añadir más optimizaciones |

No crear un segundo Perfil de Empresa solo por tener otra web del mismo negocio. El propietario debe decidir qué destino web y servicios representan mejor la operación real. No sustituir los datos del perfil sin su acceso y criterio.

### Medición propuesta

No se instaló una etiqueta de analítica sin una propiedad real. Para una implementación posterior, distinguir al menos:

- `click_whatsapp`: intención de abrir una conversación, no mensaje enviado ni venta.
- `quote_prepared`: solicitud preparada desde el formulario.
- `planner_shared`: idea de casa o remodelación preparada para compartir.
- Resultado comercial confirmado fuera de la web: consulta calificada, presupuesto emitido y contrato.

Los eventos no deben contener nombres, teléfonos, correos, notas del proyecto ni el texto completo del mensaje de WhatsApp. Comenzar con una línea base y comparar consultas útiles por servicio y dispositivo; no atribuir a SEO todas las visitas directas o conversaciones.

## Verificación y límites

- Build estático de Astro: cinco páginas, sitemap y robots generados correctamente.
- `npm run check:seo`: revisa el HTML generado, títulos y descripciones únicos, un H1 y un `main`, canonicals HTTPS, robots, JSON-LD, sitemap, imágenes, enlaces y anclas internas.
- JSON-LD confirmado también en el DOM renderizado del navegador, no solo mediante descarga HTML.
- Revisión visual en escritorio y en anchos de 390 y 320 px: sin desbordamiento horizontal en las vistas revisadas.
- Preguntas frecuentes probadas mediante apertura real; navegación entre servicios y acceso al modo de remodelación desde su página verificados.
- Contacto de WhatsApp y mensajes prellenados comprobados en los enlaces. No se enviaron mensajes comerciales de prueba al cliente.
- No se dispone de una validación externa de resultados enriquecidos; el chequeo local confirma estructura JSON y referencias, no elegibilidad en Google.
- PageSpeed Insights respondió 429 en esta sesión. No se reporta una puntuación de Lighthouse ni Core Web Vitals de campo.
- No se midieron cambios de tráfico, posiciones o contratos; requieren datos posteriores a la publicación.

## Fuentes

- [Google: funciones de IA y el sitio web](https://developers.google.com/search/docs/appearance/ai-features).
- [Google: datos estructurados de negocios locales](https://developers.google.com/search/docs/appearance/structured-data/local-business).
- [Google: crear y enviar un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- [Google: introducción a robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro).
- [Google: mejorar el posicionamiento local](https://support.google.com/business/answer/7091?hl=es).
- [OpenAI: rastreadores y bots](https://developers.openai.com/api/docs/bots).
- [Schema.org: GeneralContractor](https://schema.org/GeneralContractor).
- [Soluciones Integrales: datos públicos del negocio](https://solucionesintegralesangol.cl/).
