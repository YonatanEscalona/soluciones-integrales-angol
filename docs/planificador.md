# Planificador de casa y solicitud de presupuesto

Extensión de la página existente, confirmada por el usuario como «plano 2D editable». El planificador aparece en `#planifica`; el formulario completo de presupuesto y contacto, en `#contacto`. La sección de servicios incorpora construcción llave en mano, cuyo alcance se acuerda para cada presupuesto.

## Continuidad visual

Se conservan el hero, su fotografía y la identidad existente: negro (`#171916` / `#0d0f0d`), amarillo (`#f3bd1c`), blanco y REM. Los componentes reutilizan los tokens `--ink`, `--ink-raised`, `--paper`, `--muted`, `--line` y `--yellow`; los controles heredan la tipografía de la página. El SVG declara REM con fuente de sistema de respaldo. En la exportación PNG puede usarse ese respaldo si REM no está disponible.

El planificador presenta opciones y dibujo en dos columnas, apiladas hasta 700 px. Los controles muestran foco visible y estado activo; los mensajes se anuncian mediante regiones de estado. Esta ampliación no establece un sistema visual nuevo.

## Interacciones

- Configurar una casa de un piso: superficie interior de 48–180 m², 1–4 dormitorios, 1–2 baños, cocina abierta o cerrada, terraza opcional e inversión horizontal. Elegir «Compacta» (`compacta`, ambientes agrupados) o «Lateral» (`longitudinal`, dormitorios a un lado). El mínimo de superficie aumenta según la combinación; la terraza queda fuera de los m² interiores.
- Alternar «Con muebles» y «Solo distribución», y activar o desactivar «Ver medidas». Con el lápiz desactivado, seleccionar un ambiente con clic, toque o teclado (Enter/Espacio) para consultar ancho, largo y superficie aproximados. La circulación no es seleccionable.
- Activar «Dibujar» para agregar trazos con mouse o dedo. «Deshacer trazo» retira el último; «Borrar trazos» conserva la distribución. Son anotaciones sobre una distribución generada: no se arrastran muros ni habitaciones.
- En móvil, «Ampliar plano» permite revisar el dibujo con desplazamiento horizontal y vertical. Desactivar el lápiz permite desplazarse sobre él.
- «Descargar imagen» genera un PNG de 2160 × 1860 con la vista y medidas elegidas, trazos y aviso de uso orientativo, sin resaltar el ambiente seleccionado. «Cotizar esta idea» prepara un mensaje de WhatsApp con resumen y enlace recuperable.

## Geometría y representación

`src/lib/plan-geometry.ts` calcula habitaciones, circulación, puertas y ventanas con coordenadas en metros. Las proporciones del dibujo y las dimensiones mostradas proceden de ese modelo; según la combinación puede aparecer espacio flexible o vestidor. `src/lib/plan-artwork.ts` transforma la geometría a SVG e incorpora muebles, cotas, etiquetas y selección.

La vista en pantalla ajusta y recorta su `viewBox` alrededor del plano. Los trazos conservan como referencia el lienzo completo de 720 × 620; la entrada del puntero se transforma desde pantalla a esas coordenadas antes de cuantizarse. La exportación utiliza el lienzo completo, con resumen y aviso al pie.

## Enlace de diseño: versión 2

El fragmento `#planifica=<datos>` contiene bytes codificados en Base64 URL-safe, sin relleno. Su cabecera guarda versión `2`, superficie, dormitorios, baños, indicadores y cantidad de trazos. Los indicadores usan los valores `1` para terraza, `2` para inversión, `4` para cocina cerrada y `8` para distribución lateral. Cada trazo guarda su número de puntos y pares de coordenadas enteras de 0–255. El decodificador también acepta la versión `1` y la interpreta como distribución compacta.

Límites: 24 trazos, 400 puntos totales y 200 por trazo. El decodificador valida versión, rangos, tamaños y contenido completo; rechaza enlaces inválidos. Un enlace válido restituye configuración y trazos; no guarda vista de muebles, visibilidad de cotas, ampliación ni ambiente seleccionado. El enlace de diseño no contiene nombres, teléfono, correo ni otros datos del formulario de contacto. No hay guardado en servidor; para recuperar una idea debe conservarse su enlace.

## Presupuesto y límites

El formulario solicita nombre, teléfono, tipo de proyecto y comuna; correo, presupuesto disponible en CLP y descripción son opcionales. Valida los campos, prepara el mensaje y abre WhatsApp para que el visitante lo revise y lo envíe. Ofrece un enlace alternativo si la ventana no se abre. El monto es información aportada por el visitante: no calcula precios. La solicitud del formulario y el enlace del planificador son acciones independientes.

El sitio es estático: no hay backend de recepción ni envío automático de solicitudes. El dibujo es una idea de distribución con medidas aproximadas; no es un plano de arquitectura o construcción ni acredita viabilidad, permisos o cumplimiento normativo. Materiales, partidas y alcance de la construcción llave en mano se definen con el equipo; no se prometen precios ni plazos.

## Verificación

Fuentes: `PRODUCT.md`, `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/components/HousePlanner.astro`, `src/components/BudgetRequest.astro`, `src/lib/house-plan.ts`, `src/lib/plan-geometry.ts`, `src/lib/plan-artwork.ts` y `src/scripts/house-planner.ts`.

Desde la raíz del proyecto:

```sh
node --experimental-strip-types --test tests/house-plan.test.ts tests/plan-geometry.test.ts
pnpm build
```

Las pruebas cubren geometría sin solapamientos, accesos y aberturas, proporciones, las dos distribuciones, recuperación de enlaces v1/v2, longitud compacta y rechazo de datos inválidos. La revisión de navegador y exportación PNG se realiza aparte de estas pruebas de lógica.
