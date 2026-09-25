export type GeometryConfig = {
  area: number;
  bedrooms: number;
  bathrooms: number;
  kitchen: 'abierta' | 'cerrada';
  layout?: 'compacta' | 'longitudinal';
  bathroomMode?: 'compartidos' | 'suite';
  bathroomSize?: 'estandar' | 'amplio';
  bedroomPriority?: 'equilibrada' | 'principal';
};
export type Room = {
  id: string;
  label: string;
  short: string;
  kind: 'bedroom' | 'flex' | 'hall' | 'living' | 'kitchen' | 'bathroom';
  x: number;
  y: number;
  w: number;
  h: number;
  area: number;
  bathroomEntry?: 'left' | 'right' | 'top' | 'bottom';
  access?: 'shared' | 'suite';
};
export type Opening = {
  kind: 'door' | 'window' | 'passage';
  x: number;
  y: number;
  length: number;
  axis: 'x' | 'y';
  swing?: 1 | -1;
  hinge?: 'start' | 'end';
  exterior?: boolean;
};

/** Reserve enough floor area for the selected rooms before calculating a layout. */
export function minimumPlanArea(c: Pick<GeometryConfig, 'bedrooms' | 'bathrooms'> & Partial<GeometryConfig>): number {
  const bedrooms = Math.max(1, Math.min(4, Math.round(c.bedrooms) || 1));
  const bathrooms = Math.max(1, Math.min(2, Math.round(c.bathrooms) || 1));
  return [48, 60, 84, 108][bedrooms - 1] + (bathrooms - 1) * 12
    + (c.bathroomSize === 'amplio' ? bathrooms * 4 : 0)
    + (bedrooms > 1 && c.bedroomPriority === 'principal' ? 4 : 0);
}

/** Coordinates are in metres. These are illustrative room layouts, not construction plans. */
export function createPlanGeometry(input: GeometryConfig) {
  const c = { ...input, bedrooms: Math.max(1, Math.min(4, Math.round(input.bedrooms) || 1)), bathrooms: Math.max(1, Math.min(2, Math.round(input.bathrooms) || 1)) };
  const longitudinal = c.layout === 'longitudinal';
  const spacious = c.bathroomSize === 'amplio';
  const priority = c.bedrooms > 1 && c.bedroomPriority === 'principal';
  const suite = c.bathroomMode === 'suite' && c.bathrooms === 2;
  const minimum = minimumPlanArea(c);
  const area = Math.max(minimum, Number.isFinite(c.area) ? c.area : minimum);
  const bathW = spacious ? 2.6 : 2.4;
  const bathH = spacious ? 2.2 : 1.9;
  const hallW = 1.1;
  const rooms: Room[] = [];
  const openings: Opening[] = [];
  const add = (id: string, label: string, short: string, kind: Room['kind'], x: number, y: number, w: number, h: number): Room => {
    const room = { id, label, short, kind, x, y, w, h, area: w * h };
    rooms.push(room);
    return room;
  };
  const door = (x: number, y: number, axis: Opening['axis'], swing: 1 | -1, length = .8, exterior = false, hinge: 'start' | 'end' = 'start') => {
    openings.push({ kind: 'door', x, y, axis, swing, length, exterior, hinge });
  };
  const window = (r: Room, side: 'top' | 'right' | 'left' | 'bottom', requested = 1.3) => {
    const horizontal = side === 'top' || side === 'bottom';
    const length = Math.min(requested, (horizontal ? r.w : r.h) - .5);
    openings.push({ kind: 'window', axis: horizontal ? 'x' : 'y', length, x: horizontal ? r.x + (r.w - length) / 2 : side === 'left' ? r.x : r.x + r.w, y: horizontal ? side === 'top' ? r.y : r.y + r.h : r.y + (r.h - length) / 2, exterior: true });
  };
  const addBedroom = (number: number, x: number, y: number, w: number, h: number, side: 'left' | 'right') => {
    const r = add(`bed-${number}`, number === 1 ? 'Dormitorio principal' : `Dormitorio ${number}`, number === 1 ? 'Principal' : `Dorm. ${number}`, 'bedroom', x, y, w, h);
    door(side === 'left' ? x + w : x, y + h - 1.08, 'y', side === 'left' ? -1 : 1);
    window(r, side);
    return r;
  };
  // Entry corners follow the fixture renderer: top entries are near the right
  // corner, left entries near the top, and right entries near the bottom.
  const addBathroom = (number: number, x: number, y: number, entry: Room['bathroomEntry'], access: 'shared' | 'suite') => {
    const r = add(`bath-${number}`, access === 'suite' ? 'Baño en suite' : 'Baño compartido', access === 'suite' ? 'En suite' : `Baño ${number}`, 'bathroom', x, y, bathW, bathH);
    r.bathroomEntry = entry;
    r.access = access;
    if (entry === 'left') door(x, y + .15, 'y', 1);
    else if (entry === 'right') door(x + bathW, y + bathH - .95, 'y', -1, .8, false, 'end');
    else if (entry === 'top') door(x + bathW - .95, y, 'x', 1, .8, false, 'end');
    else door(x + .15, y + bathH, 'x', -1);
    return r;
  };

  if (longitudinal) {
    const baseWidth = spacious ? 7.9 : 7.7;
    const width = baseWidth * Math.sqrt(area / minimum);
    const depth = area / width;
    const privateW = (spacious ? 3.6 : 3.4) + (width - baseWidth) * .5;
    const socialW = width - hallW - privateW;
    const bedroomZone = depth - bathH * c.bathrooms;
    const weight = priority && c.bedrooms > 1 ? 1.35 : 1;
    const ordinaryH = bedroomZone / (c.bedrooms - 1 + weight);
    let y = 0;
    // The main bedroom occupies the last private bay, directly above its suite.
    for (const number of [...Array.from({ length: c.bedrooms - 1 }, (_, i) => i + 2), 1]) {
      const h = ordinaryH * (number === 1 ? weight : 1);
      addBedroom(number, socialW + hallW, y, privateW, h, 'right');
      y += h;
    }
    for (let i = 0; i < c.bathrooms; i++) {
      const isSuite = suite && i === 0;
      const r = addBathroom(i + 1, socialW + hallW, bedroomZone + i * bathH, isSuite ? 'top' : 'left', isSuite ? 'suite' : 'shared');
      if (i === c.bathrooms - 1) window(r, 'bottom', .6);
    }
    const wardrobe = add('wardrobe-right', 'Vestidor', 'Vestidor', 'flex', socialW + hallW + bathW, bedroomZone, privateW - bathW, bathH * c.bathrooms);
    door(wardrobe.x + (wardrobe.w - .8) / 2, wardrobe.y, 'x', 1);
    window(wardrobe, 'right', .8);
    add('hall', 'Circulación', 'Paso', 'hall', socialW, 0, hallW, depth);
    const kitchenH = Math.max(2.6, depth * .32);
    const kitchen = add('kitchen', `Cocina ${c.kitchen}`, 'Cocina', 'kitchen', 0, 0, socialW, kitchenH);
    const living = add('living', 'Estar y comedor', 'Estar · comedor', 'living', 0, kitchenH, socialW, depth - kitchenH);
    openings.push({ kind: 'passage', x: socialW, y: depth - 1.65, axis: 'y', length: 1.2 });
    if (c.kitchen === 'abierta') openings.push({ kind: 'passage', x: .2, y: kitchenH, axis: 'x', length: socialW - .4 });
    else door(socialW - 1.1, kitchenH, 'x', -1);
    door(socialW * .45, depth, 'x', -1, .9, true);
    window(kitchen, 'top', 1.4);
    window(living, 'left', 2.1);
    return { width, depth, rooms, openings };
  }

  const mainSide = c.bedrooms === 3 ? 'right' : 'left';
  const baseWidth = (spacious ? 8.6 : 8.2) + (priority && c.bedrooms > 1 ? .6 : 0);
  const width = baseWidth * Math.sqrt(area / minimum);
  const depth = area / width;
  const standardWing = (width - hallW) / 2;
  const mainExtra = priority && c.bedrooms > 1 ? .25 : 0;
  const leftW = standardWing + (mainSide === 'left' ? mainExtra : -mainExtra);
  const rightW = width - hallW - leftW;
  const bedNumbers = c.bedrooms === 1 ? { left: [1], right: [] }
    : c.bedrooms === 2 ? { left: [1], right: [2] }
    : c.bedrooms === 3 ? { left: [2, 3], right: [1] }
    : { left: [2, 1], right: [3, 4] };
  const bathSides = c.bathrooms === 2 ? ['left', 'right'] : ['right'];
  const roomWeight = (number: number) => priority && number === 1 && c.bedrooms > 1 ? 1.35 : 1;
  const needed = Math.max(...(['left', 'right'] as const).map(side => {
    const beds = bedNumbers[side];
    return (beds.length ? beds.reduce((sum, number) => sum + roomWeight(number) * 2.5, 0) : 1.3) + (bathSides.includes(side) ? bathH : 0);
  }));
  const privateH = Math.max(needed, depth * .58);
  let bathroom = 0;
  for (const side of ['left', 'right'] as const) {
    const x = side === 'left' ? 0 : leftW + hallW;
    const wingW = side === 'left' ? leftW : rightW;
    const beds = bedNumbers[side];
    const hasBath = bathSides.includes(side);
    const bedZone = privateH - (hasBath ? bathH : 0);
    const weights = beds.reduce((sum, number) => sum + roomWeight(number), 0);
    let y = 0;
    for (const number of beds) {
      const h = bedZone * roomWeight(number) / weights;
      addBedroom(number, x, y, wingW, h, side);
      y += h;
    }
    if (!beds.length) {
      const r = add(`flex-${side}`, 'Espacio flexible', 'Flexible', 'flex', x, 0, wingW, bedZone);
      door(side === 'left' ? x + wingW : x, .2, 'y', side === 'left' ? -1 : 1);
      window(r, side, 1.1);
    }
    if (hasBath) {
      bathroom++;
      const isSuite = suite && side === mainSide;
      const bathX = side === 'left' ? x + wingW - bathW : x;
      addBathroom(bathroom, bathX, bedZone, isSuite ? 'top' : side === 'left' ? 'right' : 'left', isSuite ? 'suite' : 'shared');
      const wardrobe = add(`wardrobe-${side}`, 'Vestidor', 'Vestidor', 'flex', side === 'left' ? x : x + bathW, bedZone, wingW - bathW, bathH);
      door(wardrobe.x + (wardrobe.w - .8) / 2, wardrobe.y, 'x', 1);
      window(wardrobe, side, .8);
    }
  }
  add('hall', 'Circulación', 'Paso', 'hall', leftW, 0, hallW, privateH);
  const livingW = width * .65;
  const living = add('living', 'Estar y comedor', 'Estar · comedor', 'living', 0, privateH, livingW, depth - privateH);
  const kitchen = add('kitchen', `Cocina ${c.kitchen}`, 'Cocina', 'kitchen', livingW, privateH, width - livingW, depth - privateH);
  openings.push({ kind: 'passage', x: leftW + .03, y: privateH, length: hallW - .06, axis: 'x' });
  if (c.kitchen === 'abierta') openings.push({ kind: 'passage', x: livingW, y: privateH + .2, axis: 'y', length: depth - privateH - .4 });
  else door(livingW, privateH + .2, 'y', 1);
  door(livingW * .5, depth, 'x', -1, .9, true);
  window(living, 'left', 1.8);
  window(kitchen, 'right', 1.3);
  openings.push({ kind: 'window', x: .3, y: depth, length: 1.3, axis: 'x', exterior: true });
  return { width, depth, rooms, openings };
}
