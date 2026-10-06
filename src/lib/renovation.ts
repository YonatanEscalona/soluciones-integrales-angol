export const renovationSpaces = [
  {id: 'cocina', label: 'Cocina', jobs: [
    {id: 'muebles', label: 'Muebles y cubiertas'}, {id: 'pisos', label: 'Pisos y revestimientos'},
    {id: 'gasfiteria', label: 'Gasfitería'}, {id: 'electricidad', label: 'Electricidad e iluminación'},
  ]},
  {id: 'bano', label: 'Baño', jobs: [
    {id: 'artefactos', label: 'Ducha y artefactos'}, {id: 'pisos', label: 'Pisos y revestimientos'},
    {id: 'gasfiteria', label: 'Gasfitería'}, {id: 'ventilacion', label: 'Ventilación'},
  ]},
  {id: 'dormitorios', label: 'Dormitorios', jobs: [
    {id: 'pisos', label: 'Renovar pisos'}, {id: 'pintura', label: 'Pintura y terminaciones'},
    {id: 'ventanas', label: 'Puertas y ventanas'}, {id: 'aislacion', label: 'Mejorar aislación'},
  ]},
  {id: 'estar', label: 'Estar y comedor', jobs: [
    {id: 'pisos', label: 'Renovar pisos'}, {id: 'pintura', label: 'Pintura y terminaciones'},
    {id: 'electricidad', label: 'Electricidad e iluminación'}, {id: 'distribucion', label: 'Evaluar nueva distribución'},
  ]},
  {id: 'exterior', label: 'Fachada y techo', jobs: [
    {id: 'fachada', label: 'Renovar fachada'}, {id: 'techumbre', label: 'Revisar o renovar techumbre'},
    {id: 'aislacion', label: 'Mejorar aislación'}, {id: 'pintura', label: 'Pintura exterior'},
  ]},
  {id: 'terraza', label: 'Terraza', jobs: [
    {id: 'pisos', label: 'Renovar piso'}, {id: 'cubierta', label: 'Agregar cubierta'},
    {id: 'cerramiento', label: 'Evaluar cerramiento'}, {id: 'terminaciones', label: 'Mejorar terminaciones'},
  ]},
] as const;

export const renovationFinishes = [
  {id: 'actual', label: 'Mantener el estilo actual'},
  {id: 'madera', label: 'Cálido, con madera'},
  {id: 'claro', label: 'Claro y neutro'},
  {id: 'definir', label: 'Quiero orientación'},
] as const;
export const renovationTimings = [
  {id: 'explorando', label: 'Estoy explorando'},
  {id: 'pronto', label: 'Me gustaría empezar pronto'},
  {id: 'meses', label: 'En los próximos meses'},
] as const;
export type RenovationDraft = {
  spaces: string[];
  jobs: Record<string, string[]>;
  finish: string;
  area: string;
  town: string;
  timing: string;
  notes: string;
};
export const emptyRenovation = (): RenovationDraft => ({spaces: [], jobs: {}, finish: 'definir', area: '', town: '', timing: 'explorando', notes: ''});
export function renovationTasks(id: string) {
  const space = renovationSpaces.find(item => item.id === id);
  return space ? [...space.jobs, {id: 'orientacion', label: 'Necesito orientación'}] : [];
}

/** The catalogue is the authority: hidden or unknown work never enters the quote. */
export function selectedRenovations(draft: RenovationDraft) {
  return renovationSpaces.filter(space => draft.spaces.includes(space.id)).map(space => ({
    id: space.id, label: space.label,
    jobs: renovationTasks(space.id).filter(job => draft.jobs[space.id]?.includes(job.id)).map(job => job.label),
  }));
}
export function renovationStepError(draft: RenovationDraft, step: number) {
  const selected = selectedRenovations(draft);
  if (!selected.length) return {message: 'Elige al menos un espacio que quieras mejorar.', space: ''};
  if (step >= 2) {
    const incomplete = selected.find(space => !space.jobs.length);
    if (incomplete) return {message: `Marca al menos un trabajo en ${incomplete.label.toLocaleLowerCase('es-CL')}. También puedes elegir “Necesito orientación”.`, space: incomplete.id};
  }
  return null;
}
export function renovationMessage(draft: RenovationDraft): string {
  const selected = selectedRenovations(draft);
  const finish = renovationFinishes.find(item => item.id === draft.finish)?.label || 'Quiero orientación';
  const timing = renovationTimings.find(item => item.id === draft.timing)?.label || 'Estoy explorando';
  const area = Number(draft.area);
  return [
    'Hola, quiero cotizar una mejora o remodelación con Soluciones Integrales.', '',
    'Estos son los espacios y trabajos que tengo en mente:',
    ...selected.map(space => `• ${space.label}: ${space.jobs.join(', ') || 'Necesito orientación'}.`),
    '', `Estilo: ${finish}.`,
    `Superficie aproximada a intervenir: ${draft.area && area >= 1 && area <= 500 ? `${area} m²` : 'Por confirmar'}.`,
    `Comuna: ${draft.town.trim().slice(0, 80).replace(/[\r\n]+/g, ' ')}.`,
    `Cuándo: ${timing}.`,
    ...(draft.notes.trim() ? ['', `Mi idea: ${draft.notes.trim().slice(0, 600)}`] : []),
    '', 'Me gustaría revisar las medidas, la factibilidad y el presupuesto con su equipo.',
  ].join('\n');
}
