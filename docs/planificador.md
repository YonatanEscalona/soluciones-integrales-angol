# Planificador de casa y solicitud de presupuesto

Extensión de la página existente, confirmada por el usuario como «plano 2D editable». El planificador aparece en `#planifica`; el formulario completo de presupuesto y contacto, en `#contacto`. La sección de servicios incorpora construcción llave en mano, cuyo alcance se acuerda para cada presupuesto.

## Continuidad visual

Se conservan el hero, su fotografía y la identidad existente: negro (`#171916` / `#0d0f0d`), amarillo (`#f3bd1c`), blanco y REM. Los componentes reutilizan los tokens `--ink`, `--ink-raised`, `--paper`, `--muted`, `--line` y `--yellow`; los controles heredan la tipografía de la página. El SVG declara REM con fuente de sistema de respaldo. En la exportación PNG puede usarse ese respaldo si REM no está disponible.

El planificador presenta opciones y dibujo en dos columnas, apiladas hasta 700 px. Los controles muestran foco visible y estado activo; los mensajes se anuncian mediante regiones de estado. Esta ampliación no establece un sistema visual nuevo.

## Interacciones

- Configurar una casa de un piso: superficie interior de 48–180 m², 1–4 dormitorios, 1–2 baños, cocina abierta o cerrada, terraza opcional e inversión horizontal de la distribución. El mínimo de superficie aumenta según la combinación; la terraza queda fuera de los m² interiores.
- Activar «Dibujar» para agregar trazos con mouse o dedo. «Deshacer trazo» retira el último; «Borrar trazos» conserva la distribución. Son anotaciones sobre una distribución generada: no se arrastran muros ni habitaciones.
- En móvil, «Ampliar plano» permite revisar el dibujo con desplazamiento horizontal. Desactivar el lápiz permite desplazarse sobre él.
- «Descargar imagen» genera un PNG de 1440 × 1240 con distribución, trazos y aviso de uso orientativo. «Cotizar esta idea» prepara un mensaje de WhatsApp con resumen y enlace recuperable.

## Enlace de diseño: versión 1

El fragmento `#planifica=<datos>` contiene bytes codificados en Base64 URL-safe, sin relleno. Su cabecera guarda versión `1`, superficie, dormitorios, baños, indicadores de terraza/inversión/cocina cerrada y cantidad de trazos. Cada trazo guarda su número de puntos y pares de coordenadas enteras de 0–255.

Límites: 24 trazos, 400 puntos totales y 200 por trazo. El decodificador valida versión, rangos, tamaños y contenido completo; rechaza enlaces inválidos. Un enlace válido restituye opciones y trazos y permite seguir editándolos. El enlace de diseño no contiene nombres, teléfono, correo ni otros datos del formulario de contacto. No hay guardado en servidor; para recuperar una idea debe conservarse su enlace.

## Presupuesto y límites

El formulario solicita nombre, teléfono, tipo de proyecto y comuna; correo, presupuesto disponible en CLP y descripción son opcionales. Valida los campos, prepara el mensaje y abre WhatsApp para que el visitante lo revise y lo envíe. Ofrece un enlace alternativo si la ventana no se abre. El monto es información aportada por el visitante: no calcula precios. La solicitud del formulario y el enlace del planificador son acciones independientes.

El sitio es estático: no hay backend de recepción ni envío automático de solicitudes. El dibujo es una idea de distribución con medidas aproximadas; no es un plano de arquitectura o construcción ni acredita viabilidad, permisos o cumplimiento normativo. Materiales, partidas y alcance de la construcción llave en mano se definen con el equipo; no se prometen precios ni plazos.

## Verificación

Fuentes revisadas: `PRODUCT.md`, `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/components/HousePlanner.astro`, `src/components/BudgetRequest.astro`, `src/lib/house-plan.ts` y `src/scripts/house-planner.ts`.

Desde la raíz del proyecto:

```sh
node --experimental-strip-types --test tests/house-plan.test.ts
pnpm build
```

Las cinco pruebas del planificador verifican geometría sin solapamientos, conservación del diseño compartido, longitud compacta, rechazo de datos inválidos y normalización de opciones. Se ejecutaron correctamente al documentar esta extensión. La revisión de navegador y exportación PNG se realiza aparte de estas pruebas de lógica.
