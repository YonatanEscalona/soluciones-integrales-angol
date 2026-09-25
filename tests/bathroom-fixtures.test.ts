import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {bathroomFittings} from '../src/lib/bathroom-fixtures.ts';
import {createPlanGeometry, minimumPlanArea, type GeometryConfig} from '../src/lib/plan-geometry.ts';

test('Every bathroom contains shower, basin and toilet without fixture or door-swing collisions', () => {
  const overlaps = (a: {x:number;y:number;w:number;h:number}, b: typeof a) => Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1e-7 && Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1e-7;
  for (const layout of ['compacta','longitudinal'] as const) for (const bathroomMode of ['compartidos','suite'] as const) for (const bathroomSize of ['estandar','amplio'] as const) for (let bedrooms=1;bedrooms<=4;bedrooms++) for (let bathrooms=1;bathrooms<=2;bathrooms++) {
    const options: GeometryConfig = {area:180, bedrooms, bathrooms, kitchen:'abierta',layout,bathroomMode,bathroomSize};
    for (const area of [minimumPlanArea(options),180]) for (const room of createPlanGeometry({...options,area}).rooms.filter(r=>r.kind==='bathroom')) {
      const {width,depth,fixtures,doorClearance} = bathroomFittings(room);
      const context = JSON.stringify({...options,area,room:room.id});
      assert.deepEqual(fixtures.map(f=>f.kind).sort(),['basin','shower','toilet']);
      for (const [i,fixture] of fixtures.entries()) {
        assert.ok(fixture.x>=.05 && fixture.y>=.05 && fixture.x+fixture.w<=width-.05 && fixture.y+fixture.h<=depth-.05,context);
        assert.ok(!overlaps(fixture,doorClearance),`Door swing hits ${fixture.kind}: ${context}`);
        for (const other of fixtures.slice(i+1)) assert.ok(!overlaps(fixture,other),`Fixtures overlap: ${context}`);
      }
    }
  }
});
