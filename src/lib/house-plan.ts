export type PlanConfig = {
  area: number;
  bedrooms: number;
  bathrooms: number;
  kitchen: 'abierta' | 'cerrada';
  terrace: boolean;
  mirrored: boolean;
};
export type PlanState = { config: PlanConfig; strokes: number[][] };
export const defaultConfig: PlanConfig = { area: 96, bedrooms: 3, bathrooms: 2, kitchen: 'abierta', terrace: true, mirrored: false };
export const MAX_POINTS = 400;
export const MAX_STROKES = 24;
export const minimumArea = (bedrooms: number, bathrooms: number) => Math.max(48, bedrooms * 24 + (bathrooms - 1) * 12);
export function normalizeConfig(value: Partial<PlanConfig>): PlanConfig {
  const integer = (n: unknown, fallback: number, min: number, max: number) => typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
  const bedrooms = integer(value.bedrooms, 3, 1, 4);
  const bathrooms = integer(value.bathrooms, 2, 1, 2);
  return {
    area: Math.max(minimumArea(bedrooms, bathrooms), integer(value.area, 96, 48, 180)),
    bedrooms, bathrooms,
    kitchen: value.kitchen === 'cerrada' ? 'cerrada' : 'abierta',
    terrace: typeof value.terrace === 'boolean' ? value.terrace : true,
    mirrored: value.mirrored === true,
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
  const bytes = [1, c.area, c.bedrooms, c.bathrooms, (c.terrace ? 1 : 0) | (c.mirrored ? 2 : 0) | (c.kitchen === 'cerrada' ? 4 : 0), strokes.length];
  for (const stroke of strokes) bytes.push(stroke.length / 2, ...stroke);
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function decodePlan(encoded: string): PlanState | null {
  try {
    if (!/^[\w-]{8,1200}$/.test(encoded)) return null;
    const bytes = Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
    if (bytes[0] !== 1 || bytes[1] < 48 || bytes[1] > 180 || bytes[2] < 1 || bytes[2] > 4 || bytes[3] < 1 || bytes[3] > 2 || bytes[4] > 7 || bytes[5] > MAX_STROKES) return null;
    const config = normalizeConfig({area: bytes[1], bedrooms: bytes[2], bathrooms: bytes[3], terrace: !!(bytes[4] & 1), mirrored: !!(bytes[4] & 2), kitchen: bytes[4] & 4 ? 'cerrada' : 'abierta'});
    if (config.area !== bytes[1]) return null;
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
    return offset === bytes.length ? {config, strokes} : null;
  } catch { return null; }
}

export function createRooms(input: PlanConfig) {
  const c = normalizeConfig(input);
  const rooms: {label: string; short: string; x: number; y: number; w: number; h: number; area: number; kind: string}[] = [];
  const add = (label: string, short: string, x: number, y: number, w: number, h: number, kind: string) => rooms.push({label, short, x: c.mirrored ? 1 - x - w : x, y, w, h, area: c.area * w * h, kind});
  const slots = Math.max(2, c.bedrooms);
  for (let i = 0; i < slots; i++) {
    const bedroom = i < c.bedrooms;
    add(bedroom ? `Dormitorio ${i + 1}` : 'Espacio flexible', bedroom ? `D${i + 1}` : 'Flexible', i / slots, 0, 1 / slots, .43, bedroom ? 'bedroom' : 'flex');
  }
  add('Circulación', 'Paso', 0, .43, 1, .09, 'hall');
  const kitchenWidth = c.bathrooms === 2 ? .22 : .28;
  const bathWidth = (1 - .5 - kitchenWidth) / c.bathrooms;
  add('Estar y comedor', 'Estar · comedor', 0, .52, .5, .48, 'living');
  add(`Cocina ${c.kitchen}`, 'Cocina', .5, .52, kitchenWidth, .48, 'kitchen');
  for (let i = 0; i < c.bathrooms; i++) add(`Baño ${i + 1}`, `B${i + 1}`, .5 + kitchenWidth + i * bathWidth, .52, bathWidth, .48, 'bathroom');
  return rooms;
}

export function strokeMarkup(strokes: number[][]): string {
  return strokes.map(stroke => {
    const points = [];
    for (let i = 0; i < stroke.length; i += 2) points.push(`${(stroke[i] / 255 * 720).toFixed(1)},${(stroke[i + 1] / 255 * 620).toFixed(1)}`);
    return `<polyline points="${points.join(' ')}" fill="none" stroke="#171916" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
}

export function planMarkup(input: PlanConfig): string {
  const c = normalizeConfig(input);
  const width = Math.sqrt(c.area * 1.4).toFixed(1).replace('.', ',');
  const depth = Math.sqrt(c.area / 1.4).toFixed(1).replace('.', ',');
  const openings: string[] = [];
  const roomMarkup = createRooms(c).map(r => {
    const x = 80 + r.x * 560, y = 86 + r.y * 400, w = r.w * 560, h = r.h * 400;
    let furniture = '';
    if (r.kind === 'bedroom') furniture = `<rect x="${x + 14}" y="${y + 14}" width="${Math.min(w - 28, 68)}" height="57" rx="2" fill="none" stroke="#999e98" stroke-width="1.5"/><path d="M${x + 14} ${y + 30}h${Math.min(w - 28, 68)}" stroke="#999e98"/>`;
    if (r.kind === 'kitchen') furniture = `<path d="M${x + 10} ${y + 10}h${w - 20}v19h-${w - 39}v25h-19Z" fill="#e8e9e7" stroke="#999e98"/>`;
    if (r.kind === 'living') furniture = `<rect x="${x + 20}" y="${y + 18}" width="100" height="32" rx="5" fill="#e8e9e7" stroke="#999e98"/><rect x="${x + 48}" y="${y + 61}" width="45" height="24" rx="3" fill="none" stroke="#999e98"/>`;
    const hall = r.kind === 'hall';
    const labelY = hall ? y + h / 2 + 6 : r.kind === 'bedroom' || r.kind === 'flex' ? y + h - 49 : y + h - 35;
    const opening = r.kind === 'bedroom' || r.kind === 'flex' ? `<path d="M${x + w - 44} ${y + h}h28" stroke="#fff" stroke-width="5"/><path d="M${x + w - 44} ${y + h}v-28q28 0 28 28" fill="none" stroke="#999e98" stroke-width="1.5"/>` : !hall ? `<path d="M${x + w / 2 - 14} ${y}h28" stroke="#fff" stroke-width="5"/><path d="M${x + w / 2 - 14} ${y}v28q28 0 28-28" fill="none" stroke="#999e98" stroke-width="1.5"/>` : '';
    const window = r.kind === 'bedroom' ? `<path d="M${x + w / 2 - 24} ${y}h48" stroke="#fff" stroke-width="5"/><path d="M${x + w / 2 - 24} ${y}h48" stroke="#f3bd1c" stroke-width="3"/>` : '';
    const kitchenOpening = r.kind === 'kitchen' && c.kitchen === 'abierta' ? `<path d="M${c.mirrored ? x + w : x} ${y + 4}v${h - 8}" stroke="#fff" stroke-width="5"/>` : '';
    openings.push(opening, window, kitchenOpening);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${hall ? '#f3f4f2' : '#fff'}" stroke="#171916" stroke-width="2"/>${furniture}<text x="${x + w / 2}" y="${labelY}" text-anchor="middle" font-size="${hall ? 16 : r.kind === 'living' ? 22 : 24}" font-weight="600">${r.short}</text>${hall ? '' : `<text x="${x + w / 2}" y="${labelY + 23}" text-anchor="middle" fill="#555954" font-size="17">${r.area.toFixed(1).replace('.', ',')} m²</text>`}`;
  }).join('');
  const entrance = c.mirrored ? 460 : 230;
  return `<g font-family="REM, Arial, sans-serif" fill="#171916"><path d="M80 63V45H640V63M80 53H640" fill="none" stroke="#8c918a"/><text x="360" y="34" text-anchor="middle" font-size="20">${width} m aprox.</text><path d="M57 86H40V486H57M48 86V486" fill="none" stroke="#8c918a"/><text x="26" y="286" transform="rotate(-90 26 286)" text-anchor="middle" font-size="20">${depth} m aprox.</text>${roomMarkup}<rect x="80" y="86" width="560" height="400" fill="none" stroke="#171916" stroke-width="4"/>${openings.join('')}<path d="M${entrance} 486h38" stroke="#fff" stroke-width="6"/><path d="M${entrance} 486v-38q38 0 38 38" fill="none" stroke="#555954" stroke-width="1.5"/>${c.terrace ? '<rect x="80" y="502" width="560" height="62" rx="3" fill="#f3bd1c"/><text x="360" y="540" text-anchor="middle" font-size="22" font-weight="600">Terraza exterior · opcional</text>' : '<text x="360" y="531" text-anchor="middle" font-size="19">Acceso principal</text>'}<text x="360" y="599" text-anchor="middle" font-size="16" fill="#555954">Soluciones Integrales · Idea de distribución, no plano constructivo</text></g>`;
}

export function planSummary(config: PlanConfig): string {
  const c = normalizeConfig(config);
  return `${c.area} m² interiores · ${c.bedrooms} dormitorio${c.bedrooms > 1 ? 's' : ''} · ${c.bathrooms} baño${c.bathrooms > 1 ? 's' : ''} · cocina ${c.kitchen}${c.terrace ? ' · con terraza exterior' : ''}`;
}
