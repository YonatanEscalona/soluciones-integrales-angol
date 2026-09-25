export type GeometryConfig = { area: number; bedrooms: number; bathrooms: number; kitchen: 'abierta' | 'cerrada'; layout?: 'compacta' | 'longitudinal' };
export type Room = { id: string; label: string; short: string; kind: 'bedroom' | 'flex' | 'hall' | 'living' | 'kitchen' | 'bathroom'; x: number; y: number; w: number; h: number; area: number };
export type Opening = { kind: 'door' | 'window' | 'passage'; x: number; y: number; length: number; axis: 'x' | 'y'; swing?: 1 | -1; hinge?: 'start' | 'end'; exterior?: boolean };

/** Metres throughout. Illustrative zoning, not construction or structural design. */
export function createPlanGeometry(c: GeometryConfig) {
  const longitudinal = c.layout === 'longitudinal';
  const base = c.bedrooms <= 2 ? longitudinal && c.bedrooms === 2 ? 7 : 7.1 : c.bedrooms === 3 ? longitudinal ? 7.5 : 9.3 : longitudinal ? 7.8 : 9.8;
  const minimum = Math.max(48, c.bedrooms * 24 + (c.bathrooms - 1) * 12);
  const width = base * Math.sqrt(c.area / minimum);
  const depth = c.area / width;
  const rooms: Room[] = [], openings: Opening[] = [];
  const add = (id: string, label: string, short: string, kind: Room['kind'], x: number, y: number, w: number, h: number) => {
    const room = {id, label, short, kind, x, y, w, h, area: w * h};
    rooms.push(room); return room;
  };
  const door = (x: number, y: number, axis: Opening['axis'], swing: 1 | -1, length = .8, exterior = false) => openings.push({kind: 'door', x, y, axis, swing, length, exterior});
  const window = (r: Room, side: 'top' | 'right' | 'left' | 'bottom', length = 1.3) => {
    const horizontal = side === 'top' || side === 'bottom';
    const span = Math.min(length, (horizontal ? r.w : r.h) - .6);
    openings.push({kind: 'window', axis: horizontal ? 'x' : 'y', length: span, x: horizontal ? r.x + (r.w - span) / 2 : side === 'left' ? r.x : r.x + r.w, y: horizontal ? side === 'top' ? r.y : r.y + r.h : r.y + (r.h - span) / 2, exterior: true});
  };
  if (longitudinal) {
    const hall = 1.1, privateW = (width - hall) * .48, socialW = width - hall - privateW;
    const bathH = Math.max(1.35, 4.8 / privateW), bedroomH = (depth - bathH * c.bathrooms) / c.bedrooms;
    // Keep the wet rooms beside circulation; excess width becomes a dressing
    // room reached from the preceding bedroom, rather than through a bathroom.
    const wardrobeW = privateW - 3.2 >= 1 && bedroomH >= .8 ? privateW - 3.2 : 0;
    const bathW = privateW - wardrobeW;
    for (let i = 0; i < c.bedrooms; i++) {
      const r = add(`bed-${i + 1}`, `Dormitorio ${i + 1}`, `Dorm. ${i + 1}`, 'bedroom', socialW + hall, i * bedroomH, privateW, bedroomH);
      door(r.x, r.y + r.h - 1.05, 'y', 1); window(r, 'right');
    }
    for (let i = 0; i < c.bathrooms; i++) {
      const r = add(`bath-${i + 1}`, `Baño ${i + 1}`, `Baño ${i + 1}`, 'bathroom', socialW + hall, bedroomH * c.bedrooms + i * bathH, bathW, bathH);
      door(r.x, r.y + .18, 'y', 1, .8);
      if (!wardrobeW) window(r, 'right', .6);
      else if (i === c.bathrooms - 1) window(r, 'bottom', .6);
    }
    if (wardrobeW) {
      const r = add('wardrobe-right', 'Vestidor', 'Vestidor', 'flex', socialW + hall + bathW, bedroomH * c.bedrooms, wardrobeW, bathH * c.bathrooms);
      door(r.x + (r.w - .8) / 2, r.y, 'x', 1);
      window(r, 'right', .9);
    }
    add('hall', 'Circulación', 'Paso', 'hall', socialW, 0, hall, depth);
    const kitchenH = Math.max(2.6, depth * .3);
    const kitchen = add('kitchen', `Cocina ${c.kitchen}`, 'Cocina', 'kitchen', 0, 0, socialW, kitchenH);
    const living = add('living', 'Estar y comedor', 'Estar · comedor', 'living', 0, kitchenH, socialW, depth - kitchenH);
    openings.push({kind: 'passage', x: socialW, y: depth - 2, axis: 'y', length: 1.3});
    if (c.kitchen === 'abierta') openings.push({kind: 'passage', x: .25, y: kitchenH, axis: 'x', length: socialW - .5});
    else door(socialW - 1.2, kitchenH, 'x', -1);
    door(socialW * .45, depth, 'x', -1, .9, true);
    window(kitchen, 'top', 1.4); window(living, 'left', 2.1);
    return {width, depth, rooms, openings};
  }
  const hallW = 1.1, wingW = (width - hallW) / 2;
  const leftBeds = Math.ceil(c.bedrooms / 2), rightBeds = Math.floor(c.bedrooms / 2);
  const leftBaths = c.bedrooms === 4 && c.bathrooms === 2 ? 1 : 0, rightBaths = c.bathrooms - leftBaths;
  const bathH = Math.max(1.35, Math.min(2, 4.8 / wingW));
  const needed = Math.max(leftBeds * 2.65 + leftBaths * bathH, rightBeds * 2.65 + rightBaths * bathH);
  const proposedPrivateH = Math.min(depth - 2.4, Math.max(needed, depth * .57));
  // With one bedroom the opposite wing contains only bathrooms and optional
  // flexible space. If that space is too short to enter, keep the bathrooms
  // under 6 m² and give the remaining depth back to the social area.
  const privateH = rightBeds === 0 && proposedPrivateH - rightBaths * bathH < 1.4
    ? Math.min(proposedPrivateH, rightBaths * 6 / wingW)
    : proposedPrivateH;
  let bedroom = 0, bathroom = 0;
  for (const side of ['left', 'right'] as const) {
    const x = side === 'left' ? 0 : wingW + hallW;
    const nBeds = side === 'left' ? leftBeds : rightBeds;
    const nBaths = side === 'left' ? leftBaths : rightBaths;
    const bathHeight = nBeds === 0 && privateH - nBaths * bathH < 1.4 ? privateH / nBaths : bathH;
    const flexibleH = side === 'left' && c.bedrooms === 2 ? bathH : 0;
    const bedZone = privateH - nBaths * bathHeight - flexibleH;
    const entryX = side === 'left' ? wingW : x;
    const swing = side === 'left' ? -1 : 1;
    const aboveBaths = nBeds ? bedZone / nBeds : bedZone;
    const wardrobeW = nBaths && wingW - 3.2 >= 1 && aboveBaths >= .8 ? wingW - 3.2 : 0;
    const bathW = wingW - wardrobeW;
    const bathX = x + (side === 'left' ? wardrobeW : 0);
    if (nBeds) for (let i = 0; i < nBeds; i++) {
      bedroom++;
      const r = add(`bed-${bedroom}`, `Dormitorio ${bedroom}`, `Dorm. ${bedroom}`, 'bedroom', x, i * bedZone / nBeds, wingW, bedZone / nBeds);
      door(entryX, r.y + r.h - 1.02, 'y', swing); window(r, side);
    }
    if ((!nBeds && bedZone > .01) || flexibleH) {
      const r = add('flex', 'Espacio flexible', 'Flexible', 'flex', x, nBeds ? bedZone : 0, wingW, nBeds ? flexibleH : bedZone);
      door(entryX, r.y + .2, 'y', swing, .75); window(r, side, .9);
    }
    for (let i = 0; i < nBaths; i++) {
      bathroom++;
      const r = add(`bath-${bathroom}`, `Baño ${bathroom}`, `Baño ${bathroom}`, 'bathroom', bathX, privateH - (nBaths - i) * bathHeight, bathW, bathHeight);
      door(entryX, r.y + .18, 'y', swing, .8);
      if (!wardrobeW) window(r, side, .6);
    }
    if (wardrobeW) {
      const r = add(`wardrobe-${side}`, 'Vestidor', 'Vestidor', 'flex', x + (side === 'right' ? bathW : 0), privateH - nBaths * bathHeight, wardrobeW, nBaths * bathHeight);
      door(r.x + (r.w - .8) / 2, r.y, 'x', 1);
      window(r, side, .9);
    }
  }
  add('hall', 'Circulación', 'Paso', 'hall', wingW, 0, hallW, privateH);
  const livingW = width * .64;
  const living = add('living', 'Estar y comedor', 'Estar · comedor', 'living', 0, privateH, livingW, depth - privateH);
  const kitchen = add('kitchen', `Cocina ${c.kitchen}`, 'Cocina', 'kitchen', livingW, privateH, width - livingW, depth - privateH);
  openings.push({kind: 'passage', x: wingW + .03, y: privateH, length: hallW - .06, axis: 'x'});
  if (c.kitchen === 'abierta') openings.push({kind: 'passage', x: livingW, y: privateH + .2, axis: 'y', length: depth - privateH - .4});
  else door(livingW, privateH + .3, 'y', 1);
  door(livingW * .5, depth, 'x', -1, .9, true);
  window(living, 'left', 1.8); window(kitchen, 'right', 1.3);
  openings.push({kind: 'window', x: .35, y: depth, length: Math.min(1.5, livingW * .5 - .6), axis: 'x', exterior: true});
  return {width, depth, rooms, openings};
}
