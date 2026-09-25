import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createRooms, decodePlan, defaultConfig, encodePlan, MAX_POINTS, minimumArea, normalizeConfig } from '../src/lib/house-plan.ts';

test('Every offered layout fills the interior without overlapping rooms or escaping its bounds', () => {
  for (let bedrooms = 1; bedrooms <= 4; bedrooms++) for (let bathrooms = 1; bathrooms <= 2; bathrooms++) for (const mirrored of [true, false]) {
    const config = normalizeConfig({...defaultConfig, area: 48, bedrooms, bathrooms, mirrored});
    const rooms = createRooms(config);
    assert.equal(config.area, minimumArea(bedrooms, bathrooms));
    assert.equal(rooms.filter(r => r.kind === 'bedroom').length, bedrooms);
    assert.equal(rooms.filter(r => r.kind === 'bathroom').length, bathrooms);
    assert.ok(Math.abs(rooms.reduce((a, r) => a + r.area, 0) - config.area) < 0.001);
    for (const room of rooms) {
      assert.ok(room.x >= -1e-9 && room.y >= 0 && room.x + room.w <= 1 + 1e-9 && room.y + room.h <= 1 + 1e-9);
      for (const other of rooms) {
        if (room === other) continue;
        const overlapX = Math.min(room.x + room.w, other.x + other.w) - Math.max(room.x, other.x);
        const overlapY = Math.min(room.y + room.h, other.y + other.h) - Math.max(room.y, other.y);
        assert.ok(overlapX < 1e-9 || overlapY < 1e-9, `${room.label} overlaps ${other.label}`);
      }
    }
  }
});

test('Shared links retain settings, flipped distribution and every drawing point', () => {
  const state = {config: normalizeConfig({...defaultConfig, area: 120, layout: 'longitudinal', bathroomMode: 'suite', bathroomSize: 'amplio', bedroomPriority: 'principal', kitchen: 'cerrada', terrace: false, mirrored: true}), strokes: [[0, 255, 25, 50, 125, 150], [220, 30, 240, 40]]};
  assert.deepEqual(decodePlan(encodePlan(state)), state);
});

test('Older small designs migrate explicitly to a usable area; the only bathroom stays shared', () => {
  const legacy = btoa(String.fromCharCode(2, 48, 2, 1, 1, 0));
  const migrated = decodePlan(legacy);
  assert.equal(migrated?.adjustedFrom, 48);
  assert.equal(migrated?.config.area, 60);
  assert.equal(migrated?.config.bathrooms, 1);
  assert.equal(normalizeConfig({...defaultConfig, bathrooms: 1, bathroomMode: 'suite'}).bathroomMode, 'compartidos');
  assert.equal(decodePlan(btoa(String.fromCharCode(3, 96, 2, 1, 16, 0))), null);
  const singleBedroom = normalizeConfig({...defaultConfig, area: 48, bedrooms: 1, bathrooms: 1, bedroomPriority: 'principal'});
  assert.equal(singleBedroom.bedroomPriority, 'equilibrada');
  assert.equal(singleBedroom.area, 48);
});

test('Previously shared version 1 links still open as compact layouts', () => {
  assert.deepEqual(decodePlan('AWADAgEA'), {config: defaultConfig, strokes: []});
  const previous = decodePlan('AZ8DAQMA');
  assert.equal(previous?.config.area, 159);
  assert.equal(previous?.config.bathrooms, 1);
  assert.equal(previous?.config.mirrored, true);
  assert.equal(previous?.config.layout, 'compacta');
});

test('Maximum drawing remains shareable in a compact URL', () => {
  const stroke = Array.from({length: 400}, (_, i) => i % 256);
  const state = {config: defaultConfig, strokes: [stroke, stroke]};
  const encoded = encodePlan(state);
  assert.ok(encoded.length < 1200);
  assert.equal(decodePlan(encoded)?.strokes.reduce((sum, s) => sum + s.length / 2, 0), MAX_POINTS);
});

test('Invalid, truncated and hostile link data is rejected', () => {
  for (const code of ['', '#<script>', 'A'.repeat(2000), 'AgADAgMA', 'AWADAggA', encodePlan({config: defaultConfig, strokes: [[0, 0, 10, 10]]}).slice(0, -3)]) assert.equal(decodePlan(code), null);
});

test('Out of range or non-finite options cannot generate invalid geometry', () => {
  const config = normalizeConfig({area: NaN, bedrooms: 99, bathrooms: -10});
  assert.equal(config.bedrooms, 4);
  assert.equal(config.bathrooms, 1);
  assert.ok(Number.isFinite(config.area));
  assert.ok(config.area >= minimumArea(4, 1));
});
