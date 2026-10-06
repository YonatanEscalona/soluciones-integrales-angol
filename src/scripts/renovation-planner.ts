import { emptyRenovation, renovationMessage, renovationStepError, selectedRenovations, renovationFinishes } from '../lib/renovation';

const root = document.querySelector<HTMLElement>('[data-renovation]');
if (root) {
  const get = <T extends Element>(id: string) => root.querySelector<T>(`#${id}`)!;
  const form = get<HTMLFormElement>('renovation-form');
  const spaces = [...root.querySelectorAll<HTMLInputElement>('input[name="renovation-space"]')];
  const jobs = [...root.querySelectorAll<HTMLInputElement>('[data-job-space]')];
  const zones = [...root.querySelectorAll<SVGGElement>('[data-renovation-zone]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-renovation-step]')];
  const steps = [...root.querySelectorAll<HTMLButtonElement>('[data-renovation-go]')];
  const error = get<HTMLElement>('renovation-error');
  const town = get<HTMLInputElement>('renovation-town');
  const area = get<HTMLInputElement>('renovation-area');
  const finish = get<HTMLSelectElement>('renovation-finish');
  const timing = get<HTMLSelectElement>('renovation-timing');
  const notes = get<HTMLTextAreaElement>('renovation-notes');
  const next = get<HTMLButtonElement>('renovation-next');
  const back = get<HTMLButtonElement>('renovation-back');
  const submit = get<HTMLButtonElement>('renovation-submit');
  const fallback = get<HTMLAnchorElement>('renovation-fallback');
  let step = 1;

  function readDraft() {
    const draft = emptyRenovation();
    draft.spaces = spaces.filter(input => input.checked).map(input => input.value);
    jobs.filter(input => input.checked).forEach(input => (draft.jobs[input.dataset.jobSpace!] ??= []).push(input.value));
    return {...draft, finish: finish.value, area: area.value, town: town.value, timing: timing.value, notes: notes.value};
  }
  function render() {
    const draft = readDraft();
    const selected = selectedRenovations(draft);
    root!.dataset.step = String(step);
    panels.forEach(panel => panel.hidden = Number(panel.dataset.renovationStep) !== step);
    steps.forEach(button => {
      button.disabled = false;
      if (Number(button.dataset.renovationGo) === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    root!.querySelectorAll<HTMLElement>('[data-renovation-jobs]').forEach(group => group.hidden = !draft.spaces.includes(group.dataset.renovationJobs!));
    zones.forEach(zone => zone.setAttribute('aria-checked', String(draft.spaces.includes(zone.dataset.renovationZone!))));
    get<HTMLElement>('renovation-count').textContent = selected.length ? `${selected.length} espacio${selected.length === 1 ? '' : 's'} seleccionado${selected.length === 1 ? '' : 's'}` : 'Elige tus espacios';
    const summary = get<HTMLUListElement>('renovation-live-summary');
    summary.replaceChildren();
    if (!selected.length) {
      const item = document.createElement('li');
      item.textContent = 'Los espacios que selecciones aparecerán aquí.';
      summary.append(item);
    }
    const review = get<HTMLElement>('renovation-review');
    const list = document.createElement('dl');
    for (const space of selected) {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = space.label;
      const details = document.createElement('span');
      details.textContent = space.jobs.join(' · ') || 'Trabajos por elegir';
      item.append(name, details);
      summary.append(item);
      const term = document.createElement('dt'), description = document.createElement('dd');
      term.textContent = space.label;
      description.textContent = space.jobs.join(' · ') || 'Trabajos por elegir';
      list.append(term, description);
    }
    const styleTerm = document.createElement('dt'), styleDescription = document.createElement('dd');
    styleTerm.textContent = 'Estilo';
    styleDescription.textContent = renovationFinishes.find(item => item.id === draft.finish)!.label;
    list.append(styleTerm, styleDescription);
    review.replaceChildren(list);
    back.hidden = step === 1;
    next.hidden = step === 3;
    next.disabled = false;
    next.textContent = step === 1 ? 'Elegir trabajos' : 'Revisar mi idea';
    submit.hidden = step !== 3;
    submit.disabled = false;
    get<HTMLElement>('renovation-send-note').hidden = step !== 3;
  }
  function clearFeedback() {
    error.hidden = true;
    error.textContent = '';
    fallback.hidden = true;
    get<HTMLElement>('renovation-status').textContent = '';
  }
  function showStep(value: number, moveFocus = true) {
    step = value;
    render();
    if (moveFocus) get<HTMLElement>(`renovation-step-${step}`).focus();
  }
  function validateSelection(through: number) {
    const issue = renovationStepError(readDraft(), through);
    if (!issue) return true;
    showStep(issue.space ? 2 : 1, false);
    error.textContent = issue.message;
    error.hidden = false;
    const target = issue.space ? jobs.find(input => input.dataset.jobSpace === issue.space)! : spaces[0];
    target.focus();
    error.scrollIntoView({block: 'nearest', behavior: 'instant'});
    return false;
  }
  function goTo(value: number) {
    clearFeedback();
    if (value > step && !validateSelection(value - 1)) return;
    showStep(value);
  }
  steps.forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.renovationGo))));
  back.addEventListener('click', () => goTo(step - 1));
  next.addEventListener('click', () => goTo(step + 1));
  for (const zone of zones) {
    const toggle = () => {
      const input = spaces.find(item => item.value === zone.dataset.renovationZone)!;
      input.checked = !input.checked;
      clearFeedback();
      render();
    };
    zone.addEventListener('click', toggle);
    zone.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggle();
    });
  }
  form.addEventListener('input', event => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.dataset.jobSpace && input.checked) {
      jobs.filter(other => other !== input && other.dataset.jobSpace === input.dataset.jobSpace && (input.value === 'orientacion' || other.value === 'orientacion')).forEach(other => other.checked = false);
    }
    town.setCustomValidity('');
    clearFeedback();
    render();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (step !== 3) { goTo(step + 1); return; }
    clearFeedback();
    if (!validateSelection(2)) return;
    town.setCustomValidity(town.value.trim() ? '' : 'Indica la comuna donde quieres hacer la remodelación.');
    if (!town.reportValidity() || !area.reportValidity()) return;
    const href = `https://wa.me/56935172731?text=${encodeURIComponent(renovationMessage(readDraft()))}`;
    fallback.href = href;
    fallback.hidden = false;
    get<HTMLElement>('renovation-status').textContent = 'Tu idea está preparada. Si WhatsApp no se abre, usa el enlace de abajo.';
    window.open(href, '_blank', 'noopener,noreferrer');
  });
  render();
}
