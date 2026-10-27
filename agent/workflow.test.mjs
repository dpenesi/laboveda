import test from 'node:test';
import assert from 'node:assert/strict';
import { runQuestion } from './workflow.mjs';

test('lleva resultados de la búsqueda al generador y devuelve su fuente', async () => {
  const result = await runQuestion('¿Qué se decidió?', async ({ sources }) => ({ text: 'Se eligió un ejemplo.', citations: [sources[0].id] }), {
    mode: 'local', searchFn: async () => [{ path: 'ejemplo.md', heading: 'Decisión', text: 'Se eligió un ejemplo.' }],
  });
  assert.equal(result.sources[0].path, 'ejemplo.md');
});

test('con búsqueda vacía no ejecuta el generador', async () => {
  let called = false;
  const result = await runQuestion('pregunta', async () => { called = true; }, { searchFn: async () => [] });
  assert.equal(result.status, 'sin_evidencia');
  assert.equal(called, false);
});
