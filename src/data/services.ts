export type Service = {
  slug: string;
  name: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  summary: string;
  quote: string;
  image: string;
  imageAlt: string;
  planner: 'planifica' | 'remodela';
  scopeTitle: string;
  scope: {title: string; text: string}[];
  preparation: string[];
  considerations: {title: string; text: string}[];
  questions: {question: string; answer: string}[];
};

export const services: Service[] = [
  {
    slug: 'construccion-casas-angol',
    name: 'Construcción de casas',
    title: 'Construcción de casas en Chile | Soluciones Integrales',
    description: 'Construimos casas tradicionales, modulares y llave en mano en todo Chile. Nos trasladamos a tu comuna. Planifica tu idea y cotiza por WhatsApp.',
    heading: 'Construcción de casas en todo Chile.',
    intro: 'Casas tradicionales y modulares en todo Chile, desde la estructura hasta las terminaciones. Con base en Angol, nos trasladamos a tu comuna y definimos contigo los materiales, la distribución y el alcance de tu proyecto.',
    summary: 'Casas tradicionales, modulares y proyectos llave en mano con un alcance acordado contigo.',
    quote: 'Hola, quiero cotizar la construcción de una casa con Soluciones Integrales. Me gustaría revisar la superficie, los materiales y el alcance del proyecto.',
    image: '/images/servicio-casas.webp',
    imageAlt: 'Imagen ilustrativa de un profesional de construcción para el servicio de casas',
    planner: 'planifica',
    scopeTitle: 'Una casa empieza con decisiones claras.',
    scope: [
      {title: 'Tradicional o modular', text: 'Conversemos sobre el sistema que tienes en mente, la distribución y los materiales. La elección debe considerar el terreno, el uso de la vivienda y las terminaciones que quieres.'},
      {title: 'Estructura y envolvente', text: 'Definimos qué trabajos de bases, estructura, techumbre, revestimientos y aislación incluirá la propuesta. Cada partida debe quedar identificada para poder comparar presupuestos.'},
      {title: 'Terminaciones y coordinación', text: 'Revisamos pisos, revestimientos, puertas, ventanas e instalaciones según el alcance solicitado. La modalidad llave en mano se acuerda para cada proyecto; las exclusiones también deben quedar claras.'},
    ],
    preparation: ['Comuna y ubicación general del terreno, junto con sus condiciones de acceso.', 'Superficie aproximada, cantidad de dormitorios y baños, y tipo de casa que prefieres.', 'Planos disponibles, fotografías del lugar o referencias de distribución y terminaciones.', 'Presupuesto disponible y fecha que tienes en mente, si ya los conoces.'],
    considerations: [
      {title: 'Qué influye en el presupuesto', text: 'La superficie por sí sola no define el valor de una casa. También importan el terreno, los accesos, el sistema constructivo, las instalaciones, los traslados y el nivel de terminaciones. Por eso la cotización se prepara con los datos de tu proyecto.'},
      {title: 'De la idea al proyecto', text: 'El planificador de esta web ayuda a expresar una distribución inicial. Puedes elegir ambientes, marcar ideas y compartir el enlace. Ese dibujo es orientativo: las medidas, la factibilidad, los documentos y las gestiones aplicables deben revisarse antes de ejecutar la obra.'},
    ],
    questions: [
      {question: '¿Construyen casas tradicionales y modulares?', answer: 'Sí, cotizamos casas tradicionales y modulares. Comparte la comuna, los metros cuadrados aproximados y tus referencias para revisar el sistema y el alcance que necesitas.'},
      {question: '¿Qué incluye una construcción llave en mano?', answer: 'El alcance se define en el presupuesto de cada casa. Se acuerdan las partidas de estructura, instalaciones y terminaciones que se ejecutarán, los materiales y las exclusiones. Consulta qué documentos, gestiones y trabajos del terreno quedan incluidos.'},
      {question: '¿Puedo cotizar si todavía no tengo un plano?', answer: 'Puedes iniciar la conversación con una idea de superficie y ambientes. El planificador 2D permite preparar un boceto y compartirlo por WhatsApp. No reemplaza los planos profesionales ni la revisión necesaria para construir.'},
      {question: '¿Tienen un precio fijo por metro cuadrado?', answer: 'Esta web no publica una tarifa fija. El precio depende de las características del terreno, el sistema constructivo, los materiales, las instalaciones y las terminaciones. Solicita un presupuesto con un alcance comparable.'},
    ],
  },
  {
    slug: 'radieres-angol',
    name: 'Construcción de radieres',
    title: 'Construcción de radieres en Chile | Soluciones Integrales',
    description: 'Construcción de radieres en todo Chile. Nos trasladamos a tu comuna y revisamos superficie, uso y condiciones del terreno. Cotiza por WhatsApp.',
    heading: 'Construcción de radieres en todo Chile.',
    intro: 'Construimos radieres en todo Chile y nos trasladamos al lugar de tu proyecto. Comparte las medidas, el uso del espacio y las condiciones de acceso para definir la preparación del terreno y las partidas que necesitas.',
    summary: 'Prepara la base de tu proyecto con una propuesta según el uso y las condiciones del terreno.',
    quote: 'Hola, quiero cotizar un radier con Soluciones Integrales. Quiero revisar las medidas, el uso previsto y las condiciones del terreno.',
    image: '/images/servicio-radieres.webp',
    imageAlt: 'Imagen ilustrativa de trabajos de hormigón para la construcción de un radier',
    planner: 'planifica',
    scopeTitle: 'Definamos la base antes de construir.',
    scope: [
      {title: 'Uso y superficie', text: 'Indica si el radier será para un patio, una terraza, un quincho u otro proyecto. El uso, las cargas previstas y las dimensiones ayudan a determinar qué información técnica hace falta.'},
      {title: 'Preparación del terreno', text: 'Revisamos qué preparación, nivelación, retiro de material o base requiere el lugar. Esas condiciones deben considerarse en el presupuesto, junto con la disponibilidad de acceso para equipos y materiales.'},
      {title: 'Hormigón y terminación', text: 'Se acuerdan las características y la terminación según la evaluación del proyecto. Espesor, refuerzos, pendientes, juntas y detalles no se eligen con una receta universal ni se calculan automáticamente en esta web.'},
    ],
    preparation: ['Largo y ancho aproximados, o un croquis con las medidas.', 'Uso previsto del espacio y cualquier antecedente técnico disponible.', 'Fotos del terreno, desniveles y accesos para materiales y equipos.', 'Comuna y trabajos adicionales que necesitas: retiro, preparación o terminaciones.'],
    considerations: [
      {title: 'El terreno cambia la propuesta', text: 'Dos superficies con los mismos metros cuadrados pueden requerir trabajos distintos. La preparación del suelo, los niveles, el acceso y el traslado de materiales influyen en el alcance y en el costo. Las fotografías permiten iniciar la conversación; puede hacer falta una revisión del lugar.'},
      {title: 'Un radier no resuelve cualquier fundación', text: 'Si el radier forma parte de una vivienda u otra estructura, debe coordinarse con el diseño y los antecedentes técnicos de ese proyecto. Consulta qué elementos de fundación, instalaciones y revisiones corresponden antes de ejecutar.'},
    ],
    questions: [
      {question: '¿Qué datos necesitan para cotizar un radier?', answer: 'Para empezar, indica la comuna, largo y ancho aproximados, uso previsto y condiciones de acceso. Agrega fotos del terreno y señala si necesitas preparación, nivelación o retiro de material.'},
      {question: '¿El presupuesto incluye preparar el terreno?', answer: 'Debe quedar especificado en la propuesta. La preparación depende del estado actual del lugar; consulta qué nivelación, base, retiro de material y traslados se contemplan, además del radier.'},
      {question: '¿Qué espesor necesita mi radier?', answer: 'Depende del uso, las cargas y las condiciones del proyecto. No corresponde fijar un espesor único desde una web. El equipo revisará los antecedentes y la necesidad de una definición técnica antes de cotizar la ejecución.'},
      {question: '¿Pueden cotizar un radier para un quincho?', answer: 'Sí, puedes solicitar ambos servicios. Comparte las dimensiones y el tipo de quincho para revisar la coordinación entre base, estructura, cubierta y terminaciones, con las partidas identificadas.'},
    ],
  },
  {
    slug: 'quinchos-angol',
    name: 'Construcción de quinchos',
    title: 'Construcción de quinchos en Chile | Soluciones Integrales',
    description: 'Construimos quinchos en todo Chile. Nos trasladamos a tu comuna y definimos base, cubierta y terminaciones según tu espacio. Cotiza por WhatsApp.',
    heading: 'Construcción de quinchos en todo Chile.',
    intro: 'Construimos quinchos en todo Chile para cocinar, compartir y disfrutar tu patio. Nos trasladamos a tu comuna y definimos contigo la base, la estructura y las terminaciones según el espacio disponible.',
    summary: 'Quinchos pensados para tu espacio, con base, cubierta y terminaciones por definir.',
    quote: 'Hola, quiero cotizar la construcción de un quincho con Soluciones Integrales. Tengo una idea del espacio y quiero revisar base, cubierta y terminaciones.',
    image: '/images/modelo-quincho-madera.webp',
    imageAlt: 'Modelo referencial de quincho de madera con cubierta metálica y parrilla de ladrillo',
    planner: 'remodela',
    scopeTitle: 'Un quincho según cómo quieres usarlo.',
    scope: [
      {title: 'Abierto o con cerramiento', text: 'Cuéntanos si buscas un espacio abierto, protegido del clima o con cerramientos. La ubicación, la relación con la casa y el uso que imaginas ayudan a revisar la propuesta.'},
      {title: 'Base, estructura y cubierta', text: 'Definimos las partidas necesarias y si se aprovechará una base existente o se cotizará un radier. Materiales, cubierta y evacuación de aguas deben coordinarse con las condiciones del lugar.'},
      {title: 'Equipamiento y terminaciones', text: 'Indica si quieres considerar parrilla, mesón, lavaplatos, iluminación u otros elementos. Cada instalación y terminación debe quedar identificada en el presupuesto, con lo incluido y lo excluido.'},
    ],
    preparation: ['Comuna, dimensiones aproximadas del patio y fotos del lugar.', 'Cantidad de personas o tipo de reuniones que quieres recibir.', 'Referencias de estilo, materiales y si prefieres un espacio abierto o cerrado.', 'Elementos que quieres incluir: cubierta, parrilla, mesón, lavaplatos o iluminación.'],
    considerations: [
      {title: 'Qué define el costo de un quincho', text: 'El tamaño, la base, el tipo de estructura, la cubierta, los cerramientos y el equipamiento cambian la propuesta. Informa si existen conexiones o elementos que quieres conservar para que la evaluación considere esa situación.'},
      {title: 'Revisar la ubicación también importa', text: 'Un quincho debe evaluarse en relación con sus accesos, construcciones cercanas, lluvia, ventilación e instalaciones. Las referencias visuales sirven para explicar lo que imaginas; la factibilidad y los detalles de ejecución se revisan para el lugar real.'},
    ],
    questions: [
      {question: '¿Puedo pedir un quincho con radier y techo?', answer: 'Sí. Puedes solicitar la base, la estructura y la cubierta en una misma conversación. El presupuesto debe detallar las partidas y materiales acordados para que sepas qué incluye la propuesta.'},
      {question: '¿Los quinchos de la galería son obras realizadas?', answer: 'La galería diferencia modelos referenciales y fotografías del portafolio. El quincho mostrado es un modelo referencial para conversar sobre estilo y alcance, no una fotografía de una obra ejecutada por la empresa.'},
      {question: '¿Pueden mejorar un quincho o terraza existente?', answer: 'Puedes solicitar una remodelación. Comparte fotos, medidas y los elementos que quieres conservar o cambiar, para revisar el estado actual, las instalaciones y los trabajos necesarios.'},
      {question: '¿Cómo comienzo si solo tengo una referencia?', answer: 'Envía la imagen, indica la comuna y las dimensiones aproximadas. Cuéntanos cómo quieres usar el espacio y qué equipamiento imaginas. Con esos datos podemos iniciar la revisión del proyecto.'},
    ],
  },
  {
    slug: 'remodelaciones-angol',
    name: 'Remodelaciones de casas',
    title: 'Remodelaciones de casas en Chile | Soluciones Integrales',
    description: 'Remodelaciones de casas, cocinas, baños y terrazas en todo Chile. Nos trasladamos a tu comuna. Planifica los cambios y cotiza por WhatsApp.',
    heading: 'Remodelaciones de casas en todo Chile.',
    intro: 'Remodelamos casas en todo Chile: cocinas, baños, dormitorios, estar, fachadas y terrazas. Nos trasladamos a tu comuna. Cuéntanos qué quieres conservar y cambiar, o prepara tu idea con el planificador interactivo.',
    summary: 'Cocinas, baños, terminaciones y mejoras de los espacios que ya tienes.',
    quote: 'Hola, quiero cotizar una remodelación con Soluciones Integrales. Me gustaría revisar los espacios, trabajos y terminaciones que necesito mejorar.',
    image: '/images/obra-interior-madera-hd.webp',
    imageAlt: 'Interior revestido en madera, fotografía del portafolio de Soluciones Integrales mejorada con IA',
    planner: 'remodela',
    scopeTitle: 'Primero, lo que quieres conservar y cambiar.',
    scope: [
      {title: 'Cocinas y baños', text: 'Revisamos solicitudes de muebles y cubiertas, pisos, revestimientos y artefactos. Las instalaciones de agua, electricidad y ventilación deben evaluarse según el estado actual y los cambios que quieres realizar.'},
      {title: 'Interiores y terminaciones', text: 'Puedes pedir mejoras en pintura, pisos, puertas, ventanas y aislación. Si buscas cambiar la distribución, el equipo debe revisar primero la factibilidad y los antecedentes de la vivienda.'},
      {title: 'Fachadas, techos y terrazas', text: 'Cuéntanos qué necesitas renovar en el exterior, la cubierta o la terraza. Se identifican los trabajos necesarios y los elementos existentes que podrían conservarse después de revisar su estado.'},
    ],
    preparation: ['Espacios a intervenir y los problemas o cambios que quieres resolver.', 'Fotos actuales y medidas aproximadas, si las conoces.', 'Comuna y condiciones de acceso a la vivienda.', 'Qué elementos quieres conservar, referencias de terminaciones y si la casa estará habitada.'],
    considerations: [
      {title: 'Una remodelación depende del estado actual', text: 'Además de la superficie, influyen los trabajos de retiro, la preparación de superficies, las instalaciones y las terminaciones. Las fotografías orientan la primera conversación, pero algunas condiciones solo se confirman al revisar el lugar.'},
      {title: 'Ordenar los cambios facilita cotizar', text: 'El planificador de remodelación permite elegir espacios y trabajos, indicar un estilo y agregar detalles. El resumen abre WhatsApp para que lo revises y lo envíes. Es una solicitud inicial: el equipo debe confirmar las medidas, la factibilidad y el alcance antes de preparar el presupuesto.'},
    ],
    questions: [
      {question: '¿Puedo remodelar solo un baño o una cocina?', answer: 'Sí, puedes presentar una solicitud para un espacio puntual o varios ambientes. Selecciona los espacios y trabajos en el planificador, o escríbenos con fotos y una descripción de lo que quieres cambiar.'},
      {question: '¿El planificador calcula el precio?', answer: 'No. Ordena tu idea, los espacios y los trabajos que quieres solicitar. El presupuesto requiere revisar medidas, estado de las instalaciones, materiales, terminaciones y factibilidad con el equipo.'},
      {question: '¿Qué pasa si no sé qué trabajos necesita mi casa?', answer: 'En cada espacio puedes marcar “Necesito orientación”. Agrega fotos y describe lo que te incomoda o el resultado que buscas. Así la conversación puede partir del problema que necesitas resolver.'},
      {question: '¿Puedo seguir viviendo en la casa durante la obra?', answer: 'Debe revisarse según los ambientes intervenidos, la continuidad de los servicios y las condiciones de seguridad y acceso. Indícalo al solicitar la cotización para considerar etapas y organización; no se garantiza desde la web.'},
    ],
  },
];

export const homeQuestions = [
  {question: '¿Qué servicios puedo cotizar con Soluciones Integrales?', answer: 'Construcción de casas tradicionales y modulares, proyectos llave en mano, radieres, quinchos y remodelaciones. Indica el tipo de proyecto, la comuna y las medidas aproximadas para iniciar la conversación.'},
  {question: '¿Construyen en todo Chile?', answer: 'Sí. Trabajamos en todo Chile y nos trasladamos a la comuna donde esté tu proyecto. Nuestra base está en Angol, La Araucanía. Indícanos la ubicación y las condiciones de acceso para organizar los trabajos y el traslado.'},
  {question: '¿Qué necesito para solicitar un presupuesto?', answer: 'Comparte el servicio que necesitas, comuna, superficie aproximada y una descripción. Si tienes fotografías, planos o referencias, puedes adjuntarlos al conversar por WhatsApp. Si no conoces las medidas, cuéntanos la idea para comenzar.'},
  {question: '¿Cómo se define el precio de una casa, radier o remodelación?', answer: 'Se revisan las dimensiones, el terreno o estado actual, los materiales, las instalaciones, los accesos y las terminaciones. El presupuesto debe detallar las partidas incluidas y las exclusiones; esta web no calcula un precio automático.'},
  {question: '¿Puedo planificar una casa nueva o una remodelación en esta web?', answer: 'Sí. “Construir una casa” permite explorar una distribución 2D orientativa y compartirla. “Mejorar o remodelar” permite elegir espacios y trabajos. Ambos preparan una idea para conversar; no reemplazan una revisión profesional ni un plano constructivo.'},
];
