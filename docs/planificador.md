# Planificador de casa, remodelación y solicitud de presupuesto

Extensión de la página existente, confirmada por el usuario como «plano 2D editable». El planificador aparece en `#planifica`, con los modos «Construir una casa» y «Mejorar o remodelar»; `#remodela` abre el segundo. El formulario completo de presupuesto y contacto aparece en `#contacto`. La sección de servicios incorpora construcción llave en mano, cuyo alcance se acuerda para cada presupuesto, y un acceso al planificador de remodelación.

## Continuidad visual

Se conservan el hero, su fotografía y la identidad existente: negro (`#171916` / `#0d0f0d`), amarillo (`#f3bd1c`), blanco y REM. Los componentes reutilizan los tokens `--ink`, `--ink-raised`, `--paper`, `--muted`, `--line` y `--yellow`; los controles heredan la tipografía de la página. El SVG declara REM con fuente de sistema de respaldo. En la exportación PNG puede usarse ese respaldo si REM no está disponible.

El planificador presenta opciones y dibujo en dos columnas. Hasta 700 px, con JavaScript, muestra un panel a la vez mediante «Personalizar» y «Ver plano»; comienza en el plano. Los controles muestran foco visible y estado activo; los mensajes se anuncian mediante regiones de estado. Esta ampliación no establece un sistema visual nuevo.

## Interacciones

- Configurar una casa de un piso: superficie interior de 48–180 m², 1–4 dormitorios, 1–2 baños, cocina abierta o cerrada, terraza opcional e inversión horizontal. Elegir «Compacta» (`compacta`, ambientes agrupados) o «Lateral» (`longitudinal`, dormitorios a un lado). El mínimo de superficie aumenta según la combinación; la terraza queda fuera de los m² interiores.
- Con dos baños, elegir ambos compartidos desde el pasillo o uno compartido y otro en suite, con acceso exclusivo desde el dormitorio principal. Un único baño siempre es compartido. Elegir tamaño «Estándar» o «Más amplios» para los baños. Con varios dormitorios, elegir reparto equilibrado o mayor espacio para el principal; con uno solo, este control se oculta y la prioridad se normaliza a `equilibrada`.
- Alternar «Con muebles» y «Solo distribución», y activar o desactivar «Ver medidas». Con el lápiz desactivado, seleccionar un ambiente con clic, toque o teclado (Enter/Espacio) para consultar ancho, largo y superficie aproximados. La circulación no es seleccionable.
- Al seleccionar un baño aparece un detalle ampliado de ducha, inodoro y lavamanos, orientado desde su entrada. «Invertir distribución» refleja también su geometría y mantiene legibles las etiquetas. El botón «Personalizar» del ambiente lleva al control de baños, dormitorios o superficie correspondiente; modifica las preferencias de la casa, no un recinto mediante arrastre.
- Activar «Dibujar» para agregar trazos con mouse o dedo. «Deshacer trazo» retira el último; «Borrar trazos» conserva la distribución. Son anotaciones sobre una distribución generada: no se arrastran muros ni habitaciones.
- En móvil, alternar «Personalizar» y «Ver plano» conserva los cambios; «Ver mi distribución» vuelve al dibujo y mueve el foco al encabezado del panel. «Ampliar plano» permite desplazamiento horizontal y vertical; desactivar el lápiz permite desplazarse sobre él.
- «Descargar imagen» genera un PNG de 2160 × 1860 con la vista y medidas elegidas, trazos y aviso de uso orientativo, sin resaltar el ambiente seleccionado. «Cotizar esta idea» prepara un mensaje de WhatsApp con resumen y enlace recuperable.

## Geometría y representación

`src/lib/plan-geometry.ts` calcula habitaciones, circulación, puertas y ventanas con coordenadas en metros. Las proporciones y medidas proceden de ese modelo; según la combinación aparece espacio flexible o vestidor. Los baños estándar miden 2,40 × 1,90 m y los amplios 2,60 × 2,20 m dentro del modelo orientativo. `src/lib/plan-artwork.ts` genera el SVG; `src/lib/bathroom-fixtures.ts` comparte la disposición de sanitarios entre el plano y el detalle ampliado.

El mínimo parte de 48, 60, 84 o 108 m² para uno, dos, tres o cuatro dormitorios. Añade 12 m² por el segundo baño, 4 m² por baño si se elige tamaño amplio y 4 m² al priorizar el principal únicamente cuando hay más de un dormitorio. Si una nueva selección supera la superficie elegida, se aumenta automáticamente y se informa al visitante. Estas reglas distribuyen el boceto; no son mínimos normativos.

La vista en pantalla ajusta y recorta su `viewBox` alrededor del plano. Los trazos conservan como referencia el lienzo completo de 720 × 620; la entrada del puntero se transforma desde pantalla a esas coordenadas antes de cuantizarse. La exportación utiliza el lienzo completo, con resumen y aviso al pie.

## Enlace de diseño: versión 3

El fragmento `#planifica=<datos>` contiene bytes codificados en Base64 URL-safe, sin relleno. Su cabecera guarda versión `3`, superficie, dormitorios, baños, indicadores y cantidad de trazos. Los indicadores usan `1` para terraza, `2` para inversión, `4` para cocina cerrada, `8` para distribución lateral, `16` para baño en suite, `32` para baños amplios y `64` para prioridad del dormitorio principal. Cada trazo guarda su número de puntos y pares de coordenadas enteras de 0–255.

Se aceptan enlaces v1 y v2 válidos según sus límites originales: v1 usa distribución compacta y v2 conserva la distribución. Ambos reciben baños compartidos estándar y reparto equilibrado. Si su superficie queda bajo el nuevo mínimo, se eleva, se registra `adjustedFrom` y se muestra el cambio al cargar. Los trazos se conservan en sus coordenadas almacenadas; no se adaptan a los nuevos muros. En v3 se rechazan superficies inferiores al mínimo y la combinación de un único baño en suite.

Límites: 24 trazos, 400 puntos totales y 200 por trazo. El decodificador valida versión, rangos, tamaños y contenido completo. Un enlace válido restituye configuración y trazos; no guarda vista de muebles, visibilidad de cotas, ampliación, panel móvil ni ambiente seleccionado. El enlace de diseño no contiene nombres, teléfono, correo ni otros datos del formulario de contacto. No hay guardado en servidor; para recuperar una idea debe conservarse su enlace.

## Presupuesto y límites

El formulario solicita nombre, teléfono, tipo de proyecto y comuna; correo, presupuesto disponible en CLP y descripción son opcionales. Valida los campos, prepara el mensaje y abre WhatsApp para que el visitante lo revise y lo envíe. Ofrece un enlace alternativo si la ventana no se abre. El monto es información aportada por el visitante: no calcula precios. La solicitud del formulario y el enlace del planificador son acciones independientes.

El sitio es estático: no hay backend de recepción ni envío automático de solicitudes. El dibujo es una idea de distribución con medidas aproximadas; no es un plano de arquitectura o construcción ni acredita viabilidad, permisos o cumplimiento normativo. Materiales, partidas y alcance de la construcción llave en mano se definen con el equipo; no se prometen precios ni plazos.

## Mejora o remodelación

`ProjectPlanner.astro` reúne el planificador de casa existente y `RenovationPlanner.astro`. El flujo de remodelación tiene tres pasos:

1. **Espacios:** elegir cocina, baño, dormitorios, estar y comedor, fachada y techo, o terraza. El esquema de ejemplo y la lista de casillas nativas reflejan la misma selección; el esquema también admite Enter/Espacio.
2. **Trabajos:** elegir al menos un trabajo específico o «Necesito orientación» por cada espacio, y un estilo. La orientación sustituye los trabajos marcados para ese espacio; elegir un trabajo retira la orientación.
3. **Tu idea:** revisar espacios, trabajos y estilo; indicar comuna obligatoria y, opcionalmente, superficie a intervenir de 1–500 m², momento deseado y notas. «Cotizar remodelación» prepara el borrador para WhatsApp al +56 9 3517 2731 y ofrece un enlace alternativo. El visitante revisa y envía el mensaje.

Las selecciones se conservan al volver a pasos anteriores y al alternar los dos modos dentro de la página actual. Desmarcar un espacio conserva sus casillas para una posible reselección, pero lo excluye del resumen y del mensaje. `src/lib/renovation.ts` filtra espacios y trabajos según el catálogo; `src/scripts/renovation-planner.ts` coordina pasos, validación, esquema y borrador. `#remodela` solo abre el modo: la remodelación no tiene guardado en servidor, almacenamiento local ni enlace que recupere la idea. El esquema no representa la distribución real de una vivienda ni produce planos de arquitectura, precios o plazos.

La ampliación conserva negro, amarillo, blanco y REM: usa los tokens de la página, botones amarillos, campos con bordes discretos y controles que heredan la fuente. Mantiene la composición de dos columnas en escritorio; hasta 700 px sitúa el esquema antes de los espacios y lo oculta en los pasos de trabajos y revisión. El hero y la galería conservan su contenido y diseño. Esta extensión no define una identidad visual nueva.

La revisión de esta ampliación pasó compilación, TypeScript estricto y las 18 pruebas de lógica del proyecto, incluidas las tres pruebas de remodelación sobre filtrado, requisitos por espacio y contenido del borrador. Se verificaron capturas, desplazamiento y ausencia de desbordamiento horizontal a 320 y 390 px. El recorrido táctil completo y la navegación de vuelta en teléfono quedaron sin verificar por un fallo de entrada del navegador tras abrir WhatsApp.

## Verificación

Fuentes: `PRODUCT.md`, `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/components/HousePlanner.astro`, `src/components/ProjectPlanner.astro`, `src/components/RenovationPlanner.astro`, `src/components/BudgetRequest.astro`, `src/lib/house-plan.ts`, `src/lib/plan-geometry.ts`, `src/lib/plan-artwork.ts`, `src/lib/bathroom-fixtures.ts`, `src/lib/renovation.ts`, `src/scripts/house-planner.ts` y `src/scripts/renovation-planner.ts`.

Desde la raíz del proyecto:

```sh
node --experimental-strip-types --test tests/house-plan.test.ts tests/plan-geometry.test.ts tests/bathroom-fixtures.test.ts tests/renovation.test.ts
pnpm build
```

Las pruebas cubren geometría sin solapamientos, accesos compartidos y en suite, aberturas, prioridad del dormitorio principal, ambas distribuciones, sanitarios sin colisiones con la puerta, enlaces v1/v2/v3 y migración de superficie. La revisión de navegador y exportación PNG se realiza aparte de estas pruebas de lógica.
