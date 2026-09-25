import { createPlanGeometry, minimumPlanArea } from './plan-geometry.ts';
import { createPlanArtwork, type PlanView } from './plan-artwork.ts';
export type PlanConfig = {
  area: number;
  bedrooms: number;
  bathrooms: number;
  kitchen: 'abierta' | 'cerrada';
  terrace: boolean;
  mirrored: boolean;
  layout: 'compacta' | 'longitudinal';
  bathroomMode: 'compartidos' | 'suite';
  bathroomSize: 'estandar' | 'amplio';
  bedroomPriority: 'equilibrada' | 'principal';
};
export type PlanState = { config: PlanConfig; strokes: number[][]; adjustedFrom?: number };
export const defaultConfig: PlanConfig = { area: 96, bedrooms: 3, bathrooms: 2, kitchen: 'abierta', terrace: true, mirrored: false, layout: 'compacta', bathroomMode: 'compartidos', bathroomSize: 'estandar', bedroomPriority: 'equilibrada' };
export const MAX_POINTS = 400;
export const MAX_STROKES = 24;
export const minimumArea = (bedrooms: number, bathrooms: number, preferences: Partial<PlanConfig> = {}) => minimumPlanArea({...preferences, bedrooms, bathrooms});
export function normalizeConfig(value: Partial<PlanConfig>): PlanConfig {
  const integer = (n: unknown, fallback: number, min: number, max: number) => typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
  const bedrooms = integer(value.bedrooms, 3, 1, 4);
  const bathrooms = integer(value.bathrooms, 2, 1, 2);
  const preferences = {
    bathroomMode: bathrooms === 2 && value.bathroomMode === 'suite' ? 'suite' as const : 'compartidos' as const,
    bathroomSize: value.bathroomSize === 'amplio' ? 'amplio' as const : 'estandar' as const,
    bedroomPriority: bedrooms > 1 && value.bedroomPriority === 'principal' ? 'principal' as const : 'equilibrada' as const,
  };
  return {
    area: Math.max(minimumArea(bedrooms, bathrooms, preferences), integer(value.area, 96, 48, 180)),
    bedrooms, bathrooms,
    ...preferences,
    kitchen: value.kitchen === 'cerrada' ? 'cerrada' : 'abierta',
    terrace: typeof value.terrace === 'boolean' ? value.terrace : true,
    mirrored: value.mirrored === true,
    layout: value.layout === 'longitudinal' ? 'longitudinal' : 'compacta',
  };
}

// Compact, versioned links contain only the design, never contact information.
export function encodePlan(state: PlanState): string {
  const c = normalizeConfig(state.config);
  let available = MAX_POINTS;
  const strokes = state.strokes.slice(0, MAX_STROKES).map(stroke => {
    const points = Math.min(available, Math.floor(stroke.length / 2), 200);
    available -= points;
    return stroke.slice(0, points * 2).map(n => Math.min(255, Math.max(0, Math.round(n))));
  }).filter(stroke => stroke.length >= 4);
  const bytes = [3, c.area, c.bedrooms, c.bathrooms, (c.terrace ? 1 : 0) | (c.mirrored ? 2 : 0) | (c.kitchen === 'cerrada' ? 4 : 0) | (c.layout === 'longitudinal' ? 8 : 0) | (c.bathroomMode === 'suite' ? 16 : 0) | (c.bathroomSize === 'amplio' ? 32 : 0) | (c.bedroomPriority === 'principal' ? 64 : 0), strokes.length];
  for (const stroke of strokes) bytes.push(stroke.length / 2, ...stroke);
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function decodePlan(encoded: string): PlanState | null {
  try {
    if (!/^[\w-]{8,1200}$/.test(encoded)) return null;
    const bytes = Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
    if (![1, 2, 3].includes(bytes[0]) || bytes[1] < 48 || bytes[1] > 180 || bytes[2] < 1 || bytes[2] > 4 || bytes[3] < 1 || bytes[3] > 2 || bytes[4] > (bytes[0] === 1 ? 7 : bytes[0] === 2 ? 15 : 127) || bytes[5] > MAX_STROKES) return null;
    if (bytes[0] < 3 && bytes[1] < Math.max(48, bytes[2] * 24 + (bytes[3] - 1) * 12)) return null;
    if (bytes[0] === 3 && bytes[3] === 1 && bytes[4] & 16) return null;
    const config = normalizeConfig({area: bytes[1], bedrooms: bytes[2], bathrooms: bytes[3], terrace: !!(bytes[4] & 1), mirrored: !!(bytes[4] & 2), kitchen: bytes[4] & 4 ? 'cerrada' : 'abierta', layout: bytes[4] & 8 ? 'longitudinal' : 'compacta', bathroomMode: bytes[4] & 16 ? 'suite' : 'compartidos', bathroomSize: bytes[4] & 32 ? 'amplio' : 'estandar', bedroomPriority: bytes[4] & 64 ? 'principal' : 'equilibrada'});
    if (bytes[0] === 3 && config.area !== bytes[1]) return null;
    const strokes: number[][] = [];
    let offset = 6, count = 0;
    for (let i = 0; i < bytes[5]; i++) {
      const points = bytes[offset++];
      if (!points || points < 2 || points > 200 || offset + points * 2 > bytes.length) return null;
      count += points;
      if (count > MAX_POINTS) return null;
      strokes.push(bytes.slice(offset, offset + points * 2));
      offset += points * 2;
    }
    return offset === bytes.length ? {config, strokes, ...(config.area !== bytes[1] ? {adjustedFrom: bytes[1]} : {})} : null;
  } catch { return null; }
}

export function createRooms(input: PlanConfig) {
  const c = normalizeConfig(input);
  const model = createPlanGeometry(c);
  return model.rooms.map(r => ({...r, x: c.mirrored ? 1 - (r.x + r.w) / model.width : r.x / model.width, y: r.y / model.depth, w: r.w / model.width, h: r.h / model.depth}));
}

export function strokeMarkup(strokes: number[][]): string {
  return strokes.map(stroke => {
    const points = [];
    for (let i = 0; i < stroke.length; i += 2) points.push(`${(stroke[i] / 255 * 720).toFixed(1)},${(stroke[i + 1] / 255 * 620).toFixed(1)}`);
    return `<polyline points="${points.join(' ')}" fill="none" stroke="#171916" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
}

export function planMarkup(input: PlanConfig, view?: PlanView): string {
  return createPlanArtwork(normalizeConfig(input), view);
}

export function planSummary(config: PlanConfig): string {
  const c = normalizeConfig(config);
  return `${c.area} m² interiores · distribución ${c.layout === 'longitudinal' ? 'lateral' : 'compacta'} · ${c.bedrooms} dormitorio${c.bedrooms > 1 ? 's' : ''}${c.bedroomPriority === 'principal' ? ', principal más amplio' : ''} · ${c.bathrooms} baño${c.bathrooms > 1 ? 's' : ''}${c.bathroomMode === 'suite' ? ', uno en suite' : ', acceso compartido'}${c.bathroomSize === 'amplio' ? ', tamaño amplio' : ''} · cocina ${c.kitchen}${c.terrace ? ' · con terraza exterior' : ''}`;
}
