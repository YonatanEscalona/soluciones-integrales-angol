import { createPlanGeometry, type GeometryConfig, type Room } from './plan-geometry.ts';

export type PlanView = { furniture?: boolean; dimensions?: boolean; selectedRoom?: string };
type ArtworkConfig = GeometryConfig & { terrace: boolean; mirrored: boolean };
const ink = '#171916', muted = '#666b64', line = '#9ca29a', yellow = '#f3bd1c';
const n = (value: number) => Number(value.toFixed(3));
const metres = (value: number) => value.toFixed(2).replace('.', ',');

function furniture(r: Room, scale: number, width: number) {
  const rect = (x: number, y: number, w: number, h: number, fill = '#fff', radius = .04) => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${radius}" fill="${fill}"/>`;
  const path = (d: string) => `<path d="${d}" fill="none"/>`;
  let shapes = '';
  if (r.kind === 'bedroom') {
    const double = r.id === 'bed-1', bw = double ? 1.5 : 1.05;
    const bh = Math.min(1.95, r.h - .9);
    const bx = r.x < width / 2 ? .32 : r.w - bw - .32;
    shapes += rect(bx, .25, bw, bh, '#f0f1ee', .06);
    shapes += rect(bx + .07, .33, bw - .14, .4, '#fff', .06);
    if (double) shapes += path(`M${bx + bw / 2} .33v.4`);
    shapes += rect(bx + .05, .84, bw - .1, Math.max(.1, bh - .68), '#fff', .03);
    shapes += path(`M${bx + .05} 1.02h${bw - .1}`);
    if (double && r.w > 3.2) shapes += rect(bx - .22, .3, .18, .38, '#e7e9e4');
    const closetW = Math.min(1.6, r.w - bw - .85);
    if (closetW > .65) {
      const cx = r.x < width / 2 ? r.w - closetW - .18 : .18;
      shapes += rect(cx, .2, closetW, .52, '#e9ebe6');
      shapes += path(`M${cx + closetW / 2} .2v.52`);
    }
  } else if (r.kind === 'living') {
    const vertical = r.h > r.w;
    shapes += rect(.3, .35, vertical ? 2.15 : .85, vertical ? .85 : Math.min(2.15, r.h - .65), '#e4e7e1', .12);
    if (vertical) shapes += path('M.46 .52h1.83M1.36 .55v.5');
    else shapes += path(`M.46 .51v${Math.min(1.82, r.h - .97)}M.46 1.4h.5`);
    shapes += rect(vertical ? .85 : 1.4, vertical ? 1.6 : .95, vertical ? .95 : .65, vertical ? .6 : 1.05, '#fff', .12);
    const tx = vertical ? r.w / 2 - .45 : r.w - 1.55, ty = vertical ? Math.max(2.6, r.h * .55) : .65;
    if (r.w > 3 && r.h > 2.9) {
      shapes += rect(tx, ty, .86, 1.4, '#fff', .12);
      for (const cy of [ty + .12, ty + .88]) shapes += rect(tx - .38, cy, .32, .4, '#f1f2ef', .07) + rect(tx + .92, cy, .32, .4, '#f1f2ef', .07);
      shapes += `<circle cx="${tx + .43}" cy="${ty + .7}" r=".12" fill="#e4e7e1"/>`;
    }
  } else if (r.kind === 'kitchen') {
    shapes += rect(.17, .17, r.w - .34, .6, '#f0f1ee');
    shapes += rect(r.w - .77, .77, .6, Math.max(.2, Math.min(r.h - 1.0, 2.1)), '#f0f1ee');
    shapes += rect(.35, .27, .58, .38, '#fff', .08);
    shapes += `<circle cx=".64" cy=".46" r=".04" fill="${line}"/>`;
    const hx = Math.max(1.12, r.w - 1.55);
    shapes += rect(hx, .22, .6, .5, '#fff');
    for (const x of [hx + .16, hx + .44]) for (const y of [.35, .59]) shapes += `<circle cx="${x}" cy="${y}" r=".075" fill="none"/>`;
    if (r.h > 3.8 && r.w > 3.1) shapes += rect(.6, 1.55, 1.5, .65, '#e9ebe6');
  } else if (r.kind === 'bathroom') {
    const sx = r.w - .96, showerH = Math.min(.9, r.h - .24);
    shapes += rect(sx, .12, .84, showerH, '#f4f5f2');
    shapes += path(`M${sx + .05} .17l.74 ${showerH - .1}m0 -${showerH - .1}l-.74 ${showerH - .1}`);
    shapes += rect(sx - .83, .14, .52, .24, '#fff');
    shapes += `<ellipse cx="${sx - .57}" cy=".57" rx=".24" ry=".3" fill="#fff"/><ellipse cx="${sx - .57}" cy=".58" rx=".15" ry=".21" fill="none"/>`;
    if (r.w > 3.4) shapes += rect(.18, .14, .6, .42, '#fff', .06) + `<ellipse cx=".48" cy=".35" rx=".21" ry=".13" fill="none"/>`;
  } else if (r.kind === 'flex') {
    if (r.label === 'Vestidor') {
      shapes += rect(r.w - .65, .18, .48, r.h - .36, '#e9ebe6');
      for (let y = .5; y < r.h - .25; y += .55) shapes += path(`M${r.w - .65} ${y}h.48`);
    } else {
      shapes += rect(.22, .2, Math.min(1.5, r.w - .5), .55, '#f1f2ef');
      if (r.h > 1.6) shapes += rect(.65, .9, .45, .45, '#fff', .08);
    }
  }
  return `<g transform="translate(${n(r.x)} ${n(r.y)})" stroke="${line}" stroke-width="${n(1 / scale)}" stroke-linejoin="round"><defs><clipPath id="furniture-${r.id}"><rect width="${n(r.w)}" height="${n(r.h)}"/></clipPath></defs><g clip-path="url(#furniture-${r.id})">${shapes}</g></g>`;
}

export function planViewBox(c: ArtworkConfig): string {
  const {width, depth} = createPlanGeometry(c);
  const scale = Math.min(576 / width, 440 / (depth + (c.terrace ? 1.55 : 0)));
  const drawingWidth = width * scale;
  return `${n(Math.max(0, (720 - drawingWidth) / 2 - 63))} 17 ${n(Math.min(720, drawingWidth + 90))} 522`;
}

export function createPlanArtwork(c: ArtworkConfig, view: PlanView = {}) {
  const model = createPlanGeometry(c);
  const {width, depth, rooms, openings} = model;
  const furnished = view.furniture !== false, dimensions = view.dimensions !== false;
  const terraceDepth = c.terrace ? 1.55 : 0;
  const scale = Math.min(576 / width, 440 / (depth + terraceDepth));
  const x0 = (720 - width * scale) / 2, y0 = 79;
  const px = (x: number) => n(x0 + (c.mirrored ? width - x : x) * scale);
  const py = (y: number) => n(y0 + y * scale);
  const rects = rooms.map(r => `<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.h)}" fill="${r.kind === 'hall' ? '#fff' : r.kind === 'bathroom' || r.kind === 'kitchen' ? '#f0f2ee' : '#f8f9f6'}"/>`).join('');
  const walls = rooms.map(r => `<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.h)}" fill="none" stroke="${ink}" stroke-width="${n(3.3 / scale)}"/>`).join('');
  const aperture = openings.map(o => {
    const x = n(o.x), y = n(o.y), length = n(o.length), horizontal = o.axis === 'x';
    const segment = `M${x} ${y}${horizontal ? 'h' : 'v'}${length}`;
    let markup = `<path d="${segment}" stroke="#fff" stroke-width="${n(7 / scale)}"/>`;
    if (o.kind === 'window') {
      const offset = .035;
      markup += `<path d="${segment}" stroke="${yellow}" stroke-width="${n(1.8 / scale)}"/><path d="M${n(x + (horizontal ? 0 : offset))} ${n(y + (horizontal ? offset : 0))}${horizontal ? 'h' : 'v'}${length}M${n(x - (horizontal ? 0 : offset))} ${n(y - (horizontal ? offset : 0))}${horizontal ? 'h' : 'v'}${length}" stroke="${muted}" stroke-width="${n(.8 / scale)}"/>`;
    } else if (o.kind === 'door') {
      const direction = o.swing || 1;
      const openX = horizontal ? x : x + length * direction, openY = horizontal ? y + length * direction : y;
      const shutX = horizontal ? x + length : x, shutY = horizontal ? y : y + length;
      const sweep = horizontal ? direction > 0 ? 0 : 1 : direction > 0 ? 1 : 0;
      markup += `<path d="M${x} ${y}L${n(openX)} ${n(openY)}" stroke="${ink}" stroke-width="${n(1.4 / scale)}"/><path d="M${n(openX)} ${n(openY)}A${length} ${length} 0 0 ${sweep} ${n(shutX)} ${n(shutY)}" stroke="${line}" stroke-width="${n(.9 / scale)}" fill="none"/>`;
    }
    return markup;
  }).join('');
  const living = rooms.find(r => r.kind === 'living')!;
  const terraceWidth = c.layout === 'longitudinal' ? living.w : width * .64;
  const terrace = c.terrace ? `<rect x="0" y="${n(depth + .18)}" width="${n(terraceWidth)}" height="1.3" fill="#f5f5f1" stroke="${line}" stroke-width="${n(.8 / scale)}"/>${Array.from({length: 7}, (_, i) => `<path d="M0 ${n(depth + .27 + i * .18)}h${n(terraceWidth)}" stroke="#d7dbd2" stroke-width="${n(.6 / scale)}"/>`).join('')}` : '';
  const transform = `translate(${n(x0)} ${y0}) scale(${n(scale)})${c.mirrored ? ` translate(${n(width)} 0) scale(-1 1)` : ''}`;
  const labels = rooms.map(r => {
    if (r.kind === 'hall') return '';
    const narrow = r.w * scale < 105;
    const compact = r.kind === 'bathroom' || r.h * scale < 75 || r.w * scale < 75;
    const label = r.kind === 'bedroom' ? narrow ? r.short : r.label : r.label === 'Vestidor' && r.w * scale < 75 ? 'Vest.' : r.short;
    const fontSize = Math.min(compact ? 12 : 14, Math.max(9, (r.w * scale - 10) / (label.length * .58)));
    const cx = px(r.x + r.w / 2);
    const labelRoomOffset = furnished ? Math.min(r.h * .77, r.h - (!compact && dimensions ? 40 : 23) / scale) : r.h / 2 - 5 / scale;
    const cy = py(r.y + labelRoomOffset);
    const line2 = `${r.area.toFixed(1).replace('.', ',')} m²`;
    const labelWidth = Math.min(r.w * scale - 8, Math.max(label.length * fontSize * .58, 82));
    const blockHeight = !compact && dimensions ? 46 : 32;
    return `<g pointer-events="none"><rect x="${n(cx - labelWidth / 2)}" y="${n(cy - 15)}" width="${n(labelWidth)}" height="${blockHeight}" rx="2" fill="${r.kind === 'bathroom' || r.kind === 'kitchen' ? '#f0f2ee' : '#f8f9f6'}" fill-opacity=".94"/><text x="${cx}" y="${cy}" font-size="${fontSize}" font-weight="600" text-anchor="middle">${label}</text><text x="${cx}" y="${n(cy + 16)}" fill="${muted}" font-size="12" text-anchor="middle">${line2}</text>${!compact && dimensions ? `<text x="${cx}" y="${n(cy + 30)}" fill="${muted}" font-size="10" text-anchor="middle">${metres(r.w)} × ${metres(r.h)} m</text>` : ''}</g>`;
  }).join('');
  const targets = rooms.filter(r => r.kind !== 'hall').map(r => `<g class="plan-room-target" data-room="${r.id}" role="button" tabindex="0" aria-label="${r.label}, ${metres(r.w)} por ${metres(r.h)} metros, ${r.area.toFixed(1)} metros cuadrados" aria-pressed="${view.selectedRoom === r.id}"><rect x="${px(c.mirrored ? r.x + r.w : r.x)}" y="${py(r.y)}" width="${n(r.w * scale)}" height="${n(r.h * scale)}" fill="transparent" stroke="${view.selectedRoom === r.id ? yellow : 'transparent'}" stroke-width="4"/></g>`).join('');
  const dimension = dimensions ? `<g fill="${muted}" stroke="${line}" stroke-width=".8"><path d="M${n(x0)} 65V42M${n(x0 + width * scale)} 65V42M${n(x0)} 49H${n(x0 + width * scale)}M${n(x0 - 8)} ${y0}h-28M${n(x0 - 8)} ${py(depth)}h-28M${n(x0 - 28)} ${y0}V${py(depth)}"/><path d="M${n(x0 - 3)} 52l6-6M${n(x0 + width * scale - 3)} 52l6-6" stroke="${ink}"/><text x="360" y="36" text-anchor="middle" stroke="none" font-size="15">${metres(width)} m</text><text x="${n(x0 - 42)}" y="${py(depth / 2)}" transform="rotate(-90 ${n(x0 - 42)} ${py(depth / 2)})" text-anchor="middle" stroke="none" font-size="15">${metres(depth)} m</text></g>` : '';
  const entrance = openings.find(o => o.kind === 'door' && o.exterior)!;
  return `<g font-family="REM, Arial, sans-serif" fill="${ink}">${dimension}<g transform="${transform}">${terrace}${rects}${furnished ? rooms.map(r => furniture(r, scale, width)).join('') : ''}${walls}<rect width="${n(width)}" height="${n(depth)}" fill="none" stroke="${ink}" stroke-width="${n(5.5 / scale)}"/>${aperture}</g>${labels}${targets}<text x="${px(c.terrace ? terraceWidth / 2 : entrance.x + .45)}" y="${c.terrace ? py(depth + 1.02) : n(py(depth) + 17)}" text-anchor="middle" font-size="12" font-weight="600">${c.terrace ? 'Terraza · acceso' : 'Acceso principal'}</text><path d="M56 555H664" stroke="#d9ddd5"/><text x="56" y="579" font-size="13" font-weight="600">${c.area} m² · ${c.bedrooms} dormitorio${c.bedrooms > 1 ? 's' : ''} · ${c.bathrooms} baño${c.bathrooms > 1 ? 's' : ''}</text><text x="664" y="579" text-anchor="end" font-size="12" fill="${muted}">${c.layout === 'longitudinal' ? 'Distribución lateral' : 'Distribución compacta'}</text><text x="56" y="603" font-size="10" fill="${muted}">Soluciones Integrales · Medidas aproximadas · Idea de distribución, no plano constructivo</text></g>`;
}
