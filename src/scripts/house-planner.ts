import { createRooms, decodePlan, defaultConfig, encodePlan, MAX_POINTS, MAX_STROKES, minimumArea, normalizeConfig, planMarkup, planSummary, strokeMarkup, type PlanState } from '../lib/house-plan';

const root = document.querySelector<HTMLElement>('[data-house-planner]');
if (root) {
  root.querySelector('form')?.addEventListener('submit', event => event.preventDefault());
  const get = <T extends Element>(id: string) => root.querySelector<T>(`#${id}`)!;
  const area = get<HTMLInputElement>('plan-area');
  const bedrooms = get<HTMLSelectElement>('plan-bedrooms');
  const bathrooms = get<HTMLSelectElement>('plan-bathrooms');
  const kitchen = get<HTMLSelectElement>('plan-kitchen');
  const terrace = get<HTMLInputElement>('plan-terrace');
  const mirror = get<HTMLButtonElement>('plan-mirror');
  const pen = get<HTMLButtonElement>('plan-pen');
  const undo = get<HTMLButtonElement>('plan-undo');
  const clear = get<HTMLButtonElement>('plan-clear');
  const board = get<HTMLElement>('plan-board');
  const strokeGroup = get<SVGGElement>('plan-strokes');
  const status = get<HTMLElement>('plan-status');
  let state: PlanState = {config: {...defaultConfig}, strokes: []};
  let drawing = false;
  let activePointer: number | null = null;

  function syncShare() {
    const url = new URL(location.pathname, location.origin);
    url.hash = `planifica=${encodePlan(state)}`;
    const summary = planSummary(state.config);
    get<HTMLAnchorElement>('plan-whatsapp').href = `https://wa.me/56935172731?text=${encodeURIComponent(`Hola, quiero cotizar una casa con Soluciones Integrales. Esta es mi idea inicial: ${summary}.\n\nPuedes ver mi distribución${state.strokes.length ? ' y mis trazos' : ''} aquí:\n${url.href}`)}`;
    get<HTMLElement>('plan-summary').textContent = summary;
    undo.disabled = clear.disabled = state.strokes.length === 0;
  }
  function render() {
    const c = state.config;
    area.min = String(minimumArea(c.bedrooms, c.bathrooms));
    area.value = String(c.area);
    area.setAttribute('aria-valuetext', `${c.area} metros cuadrados`);
    bedrooms.value = String(c.bedrooms);
    bathrooms.value = String(c.bathrooms);
    kitchen.value = c.kitchen;
    terrace.checked = c.terrace;
    mirror.setAttribute('aria-pressed', String(c.mirrored));
    get<HTMLElement>('plan-area-value').textContent = `${c.area} m²`;
    get<HTMLElement>('plan-area-help').textContent = `Desde ${area.min} m² para esta combinación orientativa.`;
    get<HTMLElement>('plan-count').textContent = `${c.bedrooms} dormitorio${c.bedrooms > 1 ? 's' : ''} · ${c.bathrooms} baño${c.bathrooms > 1 ? 's' : ''}`;
    get<SVGGElement>('plan-geometry').innerHTML = planMarkup(c);
    get<SVGDescElement>('plan-svg-description').textContent = `${planSummary(c)}. ${createRooms(c).map(r => `${r.label}: ${r.area.toFixed(1)} m²`).join('. ')}.`;
    strokeGroup.innerHTML = strokeMarkup(state.strokes);
    syncShare();
  }
  function updateOptions() {
    const requestedArea = Number(area.value);
    state.config = normalizeConfig({area: requestedArea, bedrooms: Number(bedrooms.value), bathrooms: Number(bathrooms.value), kitchen: kitchen.value === 'cerrada' ? 'cerrada' : 'abierta', terrace: terrace.checked, mirrored: state.config.mirrored});
    status.textContent = state.config.area > requestedArea ? `Ajustamos la superficie a ${state.config.area} m² para distribuir los ambientes que elegiste.` : '';
    render();
  }
  for (const input of [area, bedrooms, bathrooms, kitchen, terrace]) input.addEventListener('input', updateOptions);
  mirror.addEventListener('click', () => {state.config.mirrored = !state.config.mirrored; render();});
  pen.addEventListener('click', () => {
    drawing = !drawing;
    pen.setAttribute('aria-pressed', String(drawing));
    board.classList.toggle('is-drawing', drawing);
    get<HTMLElement>('drawing-help').textContent = drawing ? 'Lápiz activo. Dibuja sobre el plano; pulsa “Dibujar” para volver a desplazarte.' : board.classList.contains('is-zoomed') ? 'Plano ampliado. Desliza a los lados para ver todos los ambientes.' : 'Activa “Dibujar” para marcar ideas con el dedo o el mouse.';
  });
  get<HTMLButtonElement>('plan-zoom').addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const zoomed = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(zoomed));
    button.textContent = zoomed ? 'Ajustar plano' : 'Ampliar plano';
    board.classList.toggle('is-zoomed', zoomed);
    get<HTMLElement>('drawing-help').textContent = zoomed ? 'Plano ampliado. Desactiva el lápiz para deslizarte a los lados.' : drawing ? 'Lápiz activo. Dibuja sobre el plano; pulsa “Dibujar” para volver a desplazarte.' : 'Activa “Dibujar” para marcar ideas con el dedo o el mouse.';
  });
  const pointCount = () => state.strokes.reduce((sum, s) => sum + s.length / 2, 0);
  const point = (event: PointerEvent) => {
    const bounds = board.getBoundingClientRect();
    return [Math.round(Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)) * 255), Math.round(Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)) * 255)];
  };
  board.addEventListener('pointerdown', (event) => {
    if (!drawing || !event.isPrimary || event.button !== 0) return;
    if (state.strokes.length >= MAX_STROKES || pointCount() >= MAX_POINTS - 1) {status.textContent = 'Llegaste al límite de trazos. Deshaz o borra algunos para seguir dibujando.'; return;}
    event.preventDefault();
    activePointer = event.pointerId;
    board.setPointerCapture(event.pointerId);
    state.strokes.push(point(event));
    status.textContent = '';
  });
  board.addEventListener('pointermove', (event) => {
    if (activePointer !== event.pointerId) return;
    const stroke = state.strokes.at(-1)!;
    const [x, y] = point(event);
    if (Math.hypot(x - stroke[stroke.length - 2], y - stroke[stroke.length - 1]) < 3) return;
    if (pointCount() >= MAX_POINTS || stroke.length / 2 >= 200) {status.textContent = 'Trazo completo. Puedes deshacerlo o continuar con otro.'; return;}
    stroke.push(x, y);
    strokeGroup.innerHTML = strokeMarkup(state.strokes);
  });
  const finishStroke = (event: PointerEvent) => {
    if (activePointer !== event.pointerId) return;
    const last = state.strokes.at(-1)!;
    if (last.length < 4) state.strokes.pop();
    activePointer = null;
    if (board.hasPointerCapture(event.pointerId)) board.releasePointerCapture(event.pointerId);
    strokeGroup.innerHTML = strokeMarkup(state.strokes);
    syncShare();
  };
  board.addEventListener('pointerup', finishStroke);
  board.addEventListener('pointercancel', finishStroke);
  undo.addEventListener('click', () => {state.strokes.pop(); render(); status.textContent = 'Último trazo eliminado.';});
  clear.addEventListener('click', () => {state.strokes = []; render(); status.textContent = 'Trazos borrados. Tu distribución se conserva.';});

  get<HTMLButtonElement>('plan-download').addEventListener('click', async () => {
    const button = get<HTMLButtonElement>('plan-download');
    button.disabled = true;
    try {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1240" viewBox="0 0 720 620"><rect width="720" height="620" fill="#fff"/>${planMarkup(state.config)}${strokeMarkup(state.strokes)}</svg>`;
      const svgUrl = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
      try {
        const image = new Image();
        image.src = svgUrl;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 1440; canvas.height = 1240;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        context.drawImage(image, 0, 0);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Export failed')), 'image/png'));
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url; link.download = `mi-casa-${state.config.area}m2-soluciones-integrales.png`;
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        status.textContent = 'Imagen preparada. Puedes adjuntarla al conversar por WhatsApp.';
      } finally {URL.revokeObjectURL(svgUrl);}
    } catch {status.textContent = 'No pudimos descargar la imagen. “Cotizar esta idea” comparte un enlace con tu diseño.';}
    finally {button.disabled = false;}
  });
  function loadSharedDesign() {
    if (!location.hash.startsWith('#planifica=')) return;
    const shared = decodePlan(location.hash.slice(11));
    if (!shared) { status.textContent = 'No pudimos abrir ese diseño. Puedes crear una nueva idea con estas opciones.'; return; }
    if (activePointer !== null && board.hasPointerCapture(activePointer)) board.releasePointerCapture(activePointer);
    activePointer = null;
    drawing = false;
    pen.setAttribute('aria-pressed', 'false');
    board.classList.remove('is-drawing');
    board.classList.remove('is-zoomed');
    get<HTMLButtonElement>('plan-zoom').setAttribute('aria-pressed', 'false');
    get<HTMLButtonElement>('plan-zoom').textContent = 'Ampliar plano';
    get<HTMLElement>('drawing-help').textContent = 'Activa “Dibujar” para marcar ideas con el dedo o el mouse.';
    state = shared;
    render();
    status.textContent = 'Diseño compartido cargado. Puedes revisarlo o seguir ajustándolo.';
    requestAnimationFrame(() => root!.closest('section')?.scrollIntoView({behavior: 'instant'}));
  }
  render();
  loadSharedDesign();
  window.addEventListener('hashchange', loadSharedDesign);
}
