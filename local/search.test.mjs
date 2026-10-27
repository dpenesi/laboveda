import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { search, SearchError } from './search.mjs';

const temporary = await mkdtemp(join(tmpdir(), 'boveda-agente-test-'));
const fake = join(temporary, 'obsn');
await writeFile(fake, `#!/usr/bin/env node
const args = process.argv.slice(2);
const mode = process.env.MOCK_MODE;
if (mode === 'error') { console.error('texto sensible de error'); process.exit(3); }
if (mode === 'invalid-json') { process.stdout.write('{'); process.exit(0); }
if (args[0] === 'status' && args[1] === '--json') {
  console.log(JSON.stringify({chunks: 2, con_embedding: mode === 'missing-vector' ? 1 : 2}));
} else if (args[0] === 'rag' && args[1] === '--json' && args[2] === '--' && args.length === 5) {
  if (mode === 'empty') console.log('[]');
  else console.log(JSON.stringify([{path: mode === 'bad-path' ? '../fuera.md' : 'proyecto/nota.md', heading: 'Decisiones', text: args[3], score: 0.9}]));
} else { process.exit(4); }
`);
await chmod(fake, 0o700);
test.after(async () => rm(temporary, { recursive: true, force: true }));
const options = mode => ({ command: fake, env: { ...process.env, MOCK_MODE: mode } });

test('devuelve fragmentos y rutas y pasa la consulta como un único argumento', async () => {
  const query = '-consulta; $(comando ficticio)';
  assert.deepEqual(await search(query, options('ok')), [{ path: 'proyecto/nota.md', heading: 'Decisiones', text: query }]);
});

test('rechaza índice con vectores faltantes antes de buscar', async () => {
  await assert.rejects(search('consulta', options('missing-vector')), /fragmentos sin vector/);
});

test('devuelve vacío y no inventa una respuesta', async () => {
  assert.deepEqual(await search('consulta', options('empty')), []);
});

test('rechaza rutas que salen de la bóveda', async () => {
  await assert.rejects(search('consulta', options('bad-path')), /resultado inválido/);
});

test('falla ante JSON inválido o error de obsn sin revelar su stderr', async () => {
  await assert.rejects(search('consulta', options('invalid-json')), /JSON inválido/);
  await assert.rejects(search('consulta', options('error')), error => error instanceof SearchError && !error.message.includes('sensible'));
});

test('valida consulta y límites antes de ejecutar obsn', async () => {
  await assert.rejects(search(' \n', options('ok')), /consulta/);
  await assert.rejects(search('consulta', { ...options('ok'), limit: 21 }), /cantidad/);
  await assert.rejects(search('consulta\u001b[31m', options('ok')), /consulta/);
});

test('informa cuando obsn no está instalado', async () => {
  await assert.rejects(search('consulta', { command: join(temporary, 'ausente') }), /No se encontró obsn/);
});
