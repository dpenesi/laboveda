#!/usr/bin/env node
/** Adaptador local de solo lectura de notas; no inicia servicios ni usa red. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const runFile = promisify(execFile);
const MAX_QUERY = 2000;
const MAX_RESULTS = 20;
const MAX_OUTPUT = 2 * 1024 * 1024;
const safeText = (text) => text.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, '');

export class SearchError extends Error {}

async function invoke(command, args, env) {
  try {
    const { stdout } = await runFile(command, args, {
      env, shell: false, encoding: 'utf8', timeout: 30_000, maxBuffer: MAX_OUTPUT,
      windowsHide: true,
    });
    return JSON.parse(stdout);
  } catch (error) {
    // stderr puede contener rutas u otros datos de la bóveda: no se copia al error.
    if (error.code === 'ENOENT') throw new SearchError('No se encontró obsn. Instalalo y comprobá que esté en PATH.');
    if (error.killed || error.code === 'ETIMEDOUT') throw new SearchError('La búsqueda superó el tiempo de espera.');
    if (error instanceof SyntaxError) throw new SearchError('obsn devolvió JSON inválido.');
    throw new SearchError('obsn falló o devolvió una respuesta demasiado grande. Revisá la configuración local.');
  }
}

function validPath(path) {
  return typeof path === 'string' && path.length > 0 && path.length <= 4096 &&
    !path.startsWith('/') && !path.includes('\\') && !/^[A-Za-z]:/.test(path) &&
    !/[\u0000-\u001f\u007f-\u009f]/.test(path) &&
    path.split('/').every(part => part !== '' && part !== '.' && part !== '..');
}

/** Ejecuta exclusivamente status y rag; los fragmentos solo se devuelven al llamador. */
export async function search(query, options = {}) {
  if (typeof query !== 'string' || !query.trim() || query.length > MAX_QUERY || /[\u0000-\u001f\u007f-\u009f]/.test(query)) {
    throw new SearchError('La consulta debe tener entre 1 y 2000 caracteres y no contener caracteres de control.');
  }
  const limit = options.limit ?? 5;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RESULTS) throw new SearchError('La cantidad debe estar entre 1 y 20.');
  const command = options.command ?? 'obsn';
  const env = options.env ?? process.env;
  const status = await invoke(command, ['status', '--json'], env);
  if (!status || typeof status !== 'object' || Array.isArray(status) ||
      !Number.isSafeInteger(status.chunks) || !Number.isSafeInteger(status.con_embedding) ||
      status.chunks < 0 || status.con_embedding < 0 || status.con_embedding > status.chunks) {
    throw new SearchError('El estado del índice tiene un formato inválido.');
  }
  if (status.con_embedding < status.chunks) throw new SearchError('El índice tiene fragmentos sin vector. Revisá o reconstruí el índice antes de buscar.');
  const rows = await invoke(command, ['rag', '--json', '--', query, String(limit)], env);
  if (!Array.isArray(rows) || rows.length > limit) throw new SearchError('obsn devolvió una lista de resultados inválida.');
  return rows.map(row => {
    if (!row || typeof row !== 'object' || !validPath(row.path) || typeof row.text !== 'string' ||
        row.text.length > 100_000 || (row.heading != null && typeof row.heading !== 'string') ||
        (row.heading?.length ?? 0) > 4096) {
      throw new SearchError('obsn devolvió un resultado inválido.');
    }
    return { path: row.path, heading: safeText(row.heading ?? ''), text: safeText(row.text) };
  });
}

async function main() {
  const limitText = process.argv[2] ?? '5';
  if (!/^\d+$/.test(limitText) || process.argv.length > 3) throw new SearchError('Uso: escribí la consulta por stdin y ejecutá node local/search.mjs [cantidad].');
  let query = '';
  for await (const chunk of process.stdin) {
    query += chunk;
    if (query.length > MAX_QUERY + 2) throw new SearchError('La consulta es demasiado larga.');
  }
  query = query.replace(/\r?\n$/, '');
  const results = await search(query, { limit: Number(limitText) });
  process.stdout.write(JSON.stringify({ results }, null, 2) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { process.stderr.write((error instanceof SearchError ? error.message : 'No se pudo completar la búsqueda.') + '\n'); process.exitCode = 1; });
}
