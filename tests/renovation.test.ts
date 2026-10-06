import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { emptyRenovation, renovationMessage, renovationStepError, selectedRenovations } from '../src/lib/renovation.ts';

test('A quote includes only selected spaces and tasks offered for each space', () => {
  const draft = {...emptyRenovation(), spaces: ['bano', 'bano', 'cocina', '<script>'], jobs: {bano: ['artefactos', 'techumbre', 'artefactos'], cocina: ['muebles'], exterior: ['techumbre']}};
  assert.deepEqual(selectedRenovations(draft), [
    {id: 'cocina', label: 'Cocina', jobs: ['Muebles y cubiertas']},
    {id: 'bano', label: 'Baño', jobs: ['Ducha y artefactos']},
  ]);
  draft.spaces = ['cocina'];
  assert.ok(!renovationMessage(draft).includes('Ducha y artefactos'));
  assert.ok(!renovationMessage(draft).includes('techumbre'));
});

test('Each selected room needs a task or explicit request for guidance before review', () => {
  const draft = emptyRenovation();
  assert.ok(renovationStepError(draft, 1));
  draft.spaces = ['bano', 'cocina'];
  assert.equal(renovationStepError(draft, 1), null);
  draft.jobs = {bano: ['gasfiteria']};
  assert.equal(renovationStepError(draft, 2)?.space, 'cocina');
  draft.jobs.cocina = ['orientacion'];
  assert.equal(renovationStepError(draft, 2), null);
});

test('WhatsApp preserves the personalized brief, accents and optional notes without inventing price or size', () => {
  const draft = {...emptyRenovation(), spaces: ['bano'], jobs: {bano: ['artefactos', 'gasfiteria']}, town: ' Los Ángeles ', area: '12.5', finish: 'madera', timing: 'meses', notes: 'Conservar ventana.\nMe gustaría cambiar la ducha.'};
  const message = renovationMessage(draft);
  const href = `https://wa.me/56935172731?text=${encodeURIComponent(message)}`;
  assert.equal(new URL(href).searchParams.get('text'), message);
  assert.ok(message.includes('Comuna: Los Ángeles.'));
  assert.ok(message.includes('12.5 m²'));
  assert.ok(message.includes('Cálido, con madera'));
  assert.ok(message.includes('Ducha y artefactos, Gasfitería'));
  assert.ok(message.includes(draft.notes));
  assert.ok(renovationMessage({...draft, area: ''}).includes('Superficie aproximada a intervenir: Por confirmar.'));
  assert.ok(renovationMessage({...draft, area: '-8'}).includes('Superficie aproximada a intervenir: Por confirmar.'));
});
