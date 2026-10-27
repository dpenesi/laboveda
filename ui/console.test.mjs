import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { runConsole } from './console.mjs';
import { SearchError } from '../local/search.mjs';

async function simulate(lines, searchFn) {
  const input = Readable.from(lines.map(line => line + '\n'));
  let text = '';
  const output = new Writable({ write(chunk, _encoding, done) { text += chunk.toString(); done(); } });
  const code = await runConsole({ input, output, searchFn });
  return { text, code };
}

test('muestra privacidad, fuentes y fragmentos devueltos por el adaptador', async () => {
  const queries = [];
  const { text, code } = await simulate(['decisiones', ':salir'], async query => {
    queries.push(query);
    return [{ path: 'proyecto/decisiones.md', heading: 'Acuerdos', text: 'El equipo eligió una demo ficticia.' }];
  });
  assert.deepEqual(queries, ['decisiones']);
  assert.equal(code, 0);
  assert.match(text, /no genera respuestas de IA/);
  assert.match(text, /Fuente: proyecto\/decisiones\.md/);
  assert.match(text, /Sección: Acuerdos/);
  assert.match(text, /El equipo eligió una demo ficticia\./);
});

test('explica búsquedas sin resultados y acepta otra consulta', async () => {
  const queries = [];
  const { text } = await simulate(['planetas', 'agenda'], async query => {
    queries.push(query);
    return query === 'agenda' ? [{ path: 'agenda.md', heading: '', text: 'Preparar la demo.' }] : [];
  });
  assert.deepEqual(queries, ['planetas', 'agenda']);
  assert.match(text, /No se encontraron fragmentos/);
  assert.match(text, /Fuente: agenda\.md/);
  assert.doesNotMatch(text, /Sección:/);
});

test('ayuda, consulta vacía y salida no invocan la búsqueda', async () => {
  let calls = 0;
  const { text } = await simulate([':ayuda', '', ':salir', 'no ejecutar'], async () => { calls++; return []; });
  assert.equal(calls, 0);
  assert.match(text, /Escribí una consulta y presioná Enter/);
  assert.match(text, /Escribí una consulta o :salir/);
  assert.match(text, /Sesión finalizada/);
});

test('muestra errores controlados y oculta detalles inesperados', async () => {
  let count = 0;
  const { text, code } = await simulate(['uno', 'dos'], async () => {
    if (count++ === 0) throw new SearchError('No se encontró obsn.');
    throw new Error('detalle sensible ficticio');
  });
  assert.match(text, /No se encontró obsn/);
  assert.equal(code, 1);
  assert.match(text, /error inesperado/);
  assert.doesNotMatch(text, /detalle sensible ficticio/);
});
