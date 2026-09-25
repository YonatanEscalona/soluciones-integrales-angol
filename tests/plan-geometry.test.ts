import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createPlanGeometry } from '../src/lib/plan-geometry.ts';
import type { GeometryConfig, Opening, Room } from '../src/lib/plan-geometry.ts';

const EPSILON = 1e-7;
const close = (a: number, b: number) => Math.abs(a - b) < EPSILON;

function configurations(): GeometryConfig[] {
  const result: GeometryConfig[] = [];
  for (let bedrooms = 1; bedrooms <= 4; bedrooms++) {
    for (let bathrooms = 1; bathrooms <= 2; bathrooms++) {
      const minimum = Math.max(48, bedrooms * 24 + (bathrooms - 1) * 12);
      for (const area of new Set([minimum, Math.max(minimum, 96), 180])) {
        for (const layout of ['compacta', 'longitudinal'] as const) {
          for (const kitchen of ['abierta', 'cerrada'] as const) {
            result.push({ area, bedrooms, bathrooms, layout, kitchen });
          }
        }
      }
    }
  }
  return result;
}

function touchingRooms(opening: Opening, rooms: Room[]): Room[] {
  return rooms.filter(room => opening.axis === 'x'
    ? (close(opening.y, room.y) || close(opening.y, room.y + room.h)) && opening.x >= room.x - EPSILON && opening.x + opening.length <= room.x + room.w + EPSILON
    : (close(opening.x, room.x) || close(opening.x, room.x + room.w)) && opening.y >= room.y - EPSILON && opening.y + opening.length <= room.y + room.h + EPSILON);
}

test('Every offered geometry has finite positive rooms, correct counts and exact non-overlapping coverage', () => {
  for (const config of configurations()) {
    const plan = createPlanGeometry(config);
    const context = JSON.stringify(config);
    assert.ok(Number.isFinite(plan.width) && plan.width > 0, context);
    assert.ok(Number.isFinite(plan.depth) && plan.depth > 0, context);
    assert.ok(close(plan.width * plan.depth, config.area), `Footprint area: ${context}`);
    assert.equal(plan.rooms.filter(room => room.kind === 'bedroom').length, config.bedrooms, context);
    assert.equal(plan.rooms.filter(room => room.kind === 'bathroom').length, config.bathrooms, context);
    assert.equal(plan.rooms.filter(room => room.kind === 'living').length, 1, context);
    assert.equal(plan.rooms.filter(room => room.kind === 'kitchen').length, 1, context);
    assert.equal(new Set(plan.rooms.map(room => room.id)).size, plan.rooms.length, `Duplicate room IDs: ${context}`);
    assert.ok(close(plan.rooms.reduce((area, room) => area + room.area, 0), config.area), `Total room area: ${context}`);

    for (const [index, room] of plan.rooms.entries()) {
      const location = `${room.id}: ${context}`;
      assert.ok([room.x, room.y, room.w, room.h, room.area].every(Number.isFinite), location);
      assert.ok(room.w > 0 && room.h > 0 && room.area > 0, location);
      assert.ok(close(room.area, room.w * room.h), `Room area: ${location}`);
      assert.ok(room.x >= -EPSILON && room.y >= -EPSILON && room.x + room.w <= plan.width + EPSILON && room.y + room.h <= plan.depth + EPSILON, `Room exceeds footprint: ${location}`);
      for (const other of plan.rooms.slice(index + 1)) {
        const overlapX = Math.min(room.x + room.w, other.x + other.w) - Math.max(room.x, other.x);
        const overlapY = Math.min(room.y + room.h, other.y + other.h) - Math.max(room.y, other.y);
        assert.ok(overlapX < EPSILON || overlapY < EPSILON, `${room.id} overlaps ${other.id}: ${context}`);
      }
    }
  }
});

test('Each opening spans a complete shared or exterior wall segment and stays inside the footprint', () => {
  for (const config of configurations()) {
    const plan = createPlanGeometry(config);
    for (const opening of plan.openings) {
      const context = `${JSON.stringify(opening)} in ${JSON.stringify(config)}`;
      assert.ok([opening.x, opening.y, opening.length].every(Number.isFinite), context);
      assert.ok(opening.length > 0, context);
      const endX = opening.x + (opening.axis === 'x' ? opening.length : 0);
      const endY = opening.y + (opening.axis === 'y' ? opening.length : 0);
      assert.ok(opening.x >= -EPSILON && opening.y >= -EPSILON && endX <= plan.width + EPSILON && endY <= plan.depth + EPSILON, `Opening exceeds footprint: ${context}`);
      const exterior = opening.axis === 'x'
        ? close(opening.y, 0) || close(opening.y, plan.depth)
        : close(opening.x, 0) || close(opening.x, plan.width);
      assert.equal(Boolean(opening.exterior), exterior, `Incorrect exterior flag: ${context}`);
      assert.equal(touchingRooms(opening, plan.rooms).length, exterior ? 1 : 2, `Opening is not on a whole room boundary: ${context}`);
      if (opening.kind === 'window') assert.ok(exterior, `Window must face outdoors: ${context}`);
    }
  }
});

test('All rooms are reachable from the main entrance, with private rooms opening to circulation', () => {
  for (const config of configurations()) {
    const plan = createPlanGeometry(config);
    const context = JSON.stringify(config);
    const graph = new Map(plan.rooms.map(room => [room.id, new Set<string>()]));
    const entrances = plan.openings.filter(opening => opening.exterior && opening.kind === 'door');
    assert.ok(entrances.length >= 1, `No entrance: ${context}`);
    const roots = entrances.flatMap(opening => touchingRooms(opening, plan.rooms).map(room => room.id));
    for (const opening of plan.openings.filter(opening => !opening.exterior && opening.kind !== 'window')) {
      const neighbors = touchingRooms(opening, plan.rooms);
      assert.equal(neighbors.length, 2, context);
      graph.get(neighbors[0].id)!.add(neighbors[1].id);
      graph.get(neighbors[1].id)!.add(neighbors[0].id);
    }
    const reachable = new Set<string>();
    const pending = [...roots];
    while (pending.length) {
      const id = pending.pop()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      pending.push(...graph.get(id)!);
    }
    assert.equal(reachable.size, plan.rooms.length, `Inaccessible rooms: ${plan.rooms.filter(room => !reachable.has(room.id)).map(room => room.id).join(', ')} in ${context}`);
    for (const room of plan.rooms.filter(room => room.kind === 'bedroom' || room.kind === 'bathroom')) {
      assert.ok([...graph.get(room.id)!].some(id => plan.rooms.find(candidate => candidate.id === id)?.kind === 'hall'), `Private room lacks direct circulation access: ${room.id} in ${context}`);
    }
  }
});

test('Every bedroom and the living area have an exterior window; the two distributions differ', () => {
  for (const config of configurations()) {
    const plan = createPlanGeometry(config);
    const windowed = new Set(plan.openings.filter(opening => opening.kind === 'window').flatMap(opening => touchingRooms(opening, plan.rooms).map(room => room.id)));
    for (const room of plan.rooms.filter(room => room.kind === 'bedroom' || room.kind === 'living')) {
      assert.ok(windowed.has(room.id), `${room.id} has no window: ${JSON.stringify(config)}`);
    }
    if (config.layout === 'compacta') {
      const alternate = createPlanGeometry({ ...config, layout: 'longitudinal' });
      assert.notDeepEqual(plan.rooms, alternate.rooms, 'Layout selector must change the distribution');
    }
  }
});

test('Bathroom proportions and dressing-room access remain valid through every area-slider transition', () => {
  for (let bedrooms = 1; bedrooms <= 4; bedrooms++) {
    for (let bathrooms = 1; bathrooms <= 2; bathrooms++) {
      for (const layout of ['compacta', 'longitudinal'] as const) {
        for (let area = Math.max(48, bedrooms * 24 + (bathrooms - 1) * 12); area <= 180; area++) {
          const config = { area, bedrooms, bathrooms, layout, kitchen: 'abierta' as const };
          const plan = createPlanGeometry(config);
          const context = JSON.stringify(config);
          for (const bathroom of plan.rooms.filter(room => room.kind === 'bathroom')) {
            assert.ok(bathroom.area >= 4 - EPSILON && bathroom.area <= 6 + EPSILON, `Bathroom should stay between 4 and 6 m²: ${bathroom.area} in ${context}`);
            const doors = plan.openings.filter(opening => opening.kind === 'door' && touchingRooms(opening, [bathroom]).length);
            assert.ok(doors.some(door => door.length >= .8 - EPSILON), `Bathroom has no 0.8 m door: ${context}`);
          }
          for (const wardrobe of plan.rooms.filter(room => room.id.startsWith('wardrobe-'))) {
            assert.ok(wardrobe.w >= 1 - EPSILON, `Dressing room is too narrow: ${context}`);
            const entrances = plan.openings.filter(opening => opening.kind === 'door' && touchingRooms(opening, [wardrobe]).length);
            assert.equal(entrances.length, 1, `Dressing room requires one entrance: ${context}`);
            const entrance = entrances[0];
            assert.equal(entrance.axis, 'x', context);
            assert.ok(close(entrance.y, wardrobe.y), `Dressing room should open to the room above it: ${context}`);
            const adjacent = touchingRooms(entrance, plan.rooms).filter(room => room !== wardrobe);
            assert.equal(adjacent.length, 1, `Dressing room entrance crosses a partition: ${context}`);
            assert.ok(adjacent[0].kind === 'bedroom' || adjacent[0].kind === 'flex', `Dressing room must not be accessed through a bathroom: ${context}`);
          }
          for (const opening of plan.openings) {
            assert.equal(touchingRooms(opening, plan.rooms).length, opening.exterior ? 1 : 2, `Opening crosses a wall partition: ${context}`);
          }
        }
      }
    }
  }
});
