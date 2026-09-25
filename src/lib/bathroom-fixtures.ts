import type { Room } from './plan-geometry.ts';

type Box = { x: number; y: number; w: number; h: number };
export type BathroomFixture = Box & { kind: 'shower' | 'toilet' | 'basin'; label: string };

/** A canonical bathroom with entry at bottom-left, then rotated to its real door. */
export function bathroomFittings(room: Room) {
  const entry = room.bathroomEntry || 'bottom';
  const sideways = entry === 'left' || entry === 'right';
  const width = sideways ? room.h : room.w, depth = sideways ? room.w : room.h;
  const fixtures: BathroomFixture[] = [
    {kind: 'shower', label: 'Ducha', x: width - 1.02, y: .12, w: .9, h: .9},
    {kind: 'toilet', label: 'Inodoro', x: .2, y: .15, w: .46, h: .72},
    {kind: 'basin', label: 'Lavamanos', x: width - .7, y: depth - .65, w: .55, h: .45},
  ];
  const doorClearance: Box = {x: .15, y: depth - .8, w: .8, h: .8};
  const transform = entry === 'left' ? `translate(${room.w} 0) rotate(90)` : entry === 'right' ? `translate(0 ${room.h}) rotate(-90)` : entry === 'top' ? `translate(${room.w} ${room.h}) rotate(180)` : '';
  return {width, depth, fixtures, doorClearance, transform};
}

export function bathroomFixtureMarkup(room: Room): string {
  const {fixtures, transform} = bathroomFittings(room);
  const items = fixtures.map(f => {
    let shape = '';
    if (f.kind === 'shower') shape = `<rect width="${f.w}" height="${f.h}" rx=".03" fill="#eef1ed"/><path d="M.06 .06L.84 .84M.84 .06L.06 .84" fill="none"/><circle cx=".45" cy=".45" r=".035" fill="#666b64"/>`;
    if (f.kind === 'toilet') shape = '<rect width=".46" height=".22" rx=".025" fill="#fff"/><path d="M.04 .22H.42V.49A.19 .19 0 0 1 .04 .49Z" fill="#fff"/><ellipse cx=".23" cy=".46" rx=".125" ry=".17" fill="none"/>';
    if (f.kind === 'basin') shape = '<rect width=".55" height=".45" rx=".04" fill="#fff"/><ellipse cx=".275" cy=".24" rx=".2" ry=".14" fill="none"/><path d="M.275 .05v.1" fill="none"/>';
    return `<g data-fixture="${f.kind}" transform="translate(${f.x} ${f.y})">${shape}</g>`;
  }).join('');
  return `<g transform="${transform}">${items}</g>`;
}

export function bathroomDetailMarkup(room: Room, mirrored = false): string {
  const {width, depth, fixtures} = bathroomFittings(room);
  const scale = Math.min(254 / width, 205 / depth);
  const left = (360 - width * scale) / 2, top = 48;
  const fmt = (n: number) => n.toFixed(2).replace('.', ',');
  const canonical = {...room, w: width, h: depth, bathroomEntry: 'bottom' as const};
  const items = bathroomFixtureMarkup(canonical);
  const reflect = mirrored ? `translate(${width} 0) scale(-1 1)` : '';
  const labels = fixtures.map(f => {
    const center = f.x + f.w / 2;
    return `<text x="${left + (mirrored ? width - center : center) * scale}" y="${top + (f.y + f.h) * scale + 14}" text-anchor="middle" font-size="11">${f.label}</text>`;
  }).join('');
  return `<g font-family="REM, Arial, sans-serif" fill="#171916">
    <path d="M${left} 37V20M${left + width * scale} 37V20M${left} 27H${left + width * scale}" stroke="#9ca29a" fill="none"/>
    <text x="180" y="17" font-size="13" text-anchor="middle">${fmt(width)} m</text>
    <text x="${left - 18}" y="${top + depth * scale / 2}" transform="rotate(-90 ${left - 18} ${top + depth * scale / 2})" font-size="13" text-anchor="middle">${fmt(depth)} m</text>
    <g transform="translate(${left} ${top}) scale(${scale})" stroke="#666b64" stroke-width="${1.2 / scale}"><g transform="${reflect}">
      <rect width="${width}" height="${depth}" fill="#f5f7f3" stroke="#171916" stroke-width="${3 / scale}"/>${items}
      <path d="M.15 ${depth}h.8" stroke="#fff" stroke-width="${5 / scale}"/>
      <path d="M.15 ${depth}v-.8" fill="none" stroke="#171916"/>
      <path d="M.15 ${depth - .8}a.8 .8 0 0 1 .8 .8" fill="none" stroke="#9ca29a"/>
    </g></g>${labels}
    <text x="180" y="294" text-anchor="middle" font-size="12">${room.access === 'suite' ? 'Acceso desde el dormitorio principal' : 'Acceso desde el pasillo'}</text>
    <text x="180" y="313" text-anchor="middle" font-size="10" fill="#666b64">Vista del baño orientada desde su entrada</text>
  </g>`;
}
