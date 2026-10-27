import test from 'node:test';
import assert from 'node:assert/strict';
import { answer } from './answer.mjs';
const notes = [{ path: 'proyecto/decisiones.md', heading: 'Decisiones', text: 'Se acordó usar un corpus ficticio.' }];
test('devuelve respuesta con referencias a fuentes entregadas', async () => {
  const result = await answer('¿Qué se acordó?', notes, async ({ sources }) => ({ text: 'Se usará un corpus ficticio.', citations: [sources[0].id] }), { mode: 'local' });
  assert.deepEqual(result.sources, [{ id: 's1', path: 'proyecto/decisiones.md', heading: 'Decisiones' }]);
});
test('no invoca el generador si no hay evidencia', async () => {
  let called = false;
  const result = await answer('pregunta', [], async () => { called = true; });
  assert.equal(result.status, 'sin_evidencia'); assert.equal(called, false);
});
test('rechaza citas desconocidas y ausencia de citas', async () => {
  await assert.rejects(answer('pregunta', notes, async () => ({ text: 'Algo', citations: ['s999'] }), { mode: 'local' }), /desconocida/);
  await assert.rejects(answer('pregunta', notes, async () => ({ text: 'Algo', citations: [] }), { mode: 'local' }), /formato/);
});
test('no envía a generador externo sin consentimiento', async () => {
  let called = false;
  await assert.rejects(answer('pregunta', notes, async () => { called = true; }, { mode: 'externo' }), /autorización/);
  assert.equal(called, false);
});
test('con consentimiento entrega únicamente las fuentes a la función inyectada', async () => {
  const result = await answer('pregunta', notes, async ({ sources }) => ({ text: sources[0].text, citations: ['s1', 's1'] }), { mode: 'externo', consent: true });
  assert.equal(result.sources.length, 1);
});
test('exige declarar el destino antes de invocar el generador', async () => {
  let called = false;
  await assert.rejects(answer('pregunta', notes, async () => { called = true; }), /local o externo/);
  assert.equal(called, false);
});
