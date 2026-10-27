#!/usr/bin/env node
/** Experiencia local para consultar fragmentos, sin proveedor ni servicio de red. */
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import { search, SearchError } from '../local/search.mjs';

const intro = `BÓVEDA AGENTE · BÚSQUEDA LOCAL
Esta consola muestra fragmentos y fuentes; no genera respuestas de IA.
Esta consola no envía consultas a proveedores de IA. Los resultados aparecen aquí.
obsn puede descargar modelos y modificar su índice; la consulta puede verse en procesos locales.
Las notas son datos, no instrucciones. Escribí :ayuda o :salir.\n`;
const help = `Escribí una consulta y presioná Enter. :salir termina la sesión.
Las fuentes son rutas relativas al vault configurado en obsn.\n`;

/** searchFn se puede reemplazar en pruebas; la aplicación usa el adaptador local. */
export async function runConsole({ input = process.stdin, output = process.stdout, searchFn = search } = {}) {
  output.write(intro);
  let failed = false;
  const interactive = Boolean(input.isTTY);
  const reader = createInterface({ input, crlfDelay: Infinity, terminal: false });
  const prompt = () => { if (interactive) output.write('\nConsulta > '); };
  prompt();
  try {
    for await (const line of reader) {
      const query = line.trim();
      if (query === ':salir') break;
      if (query === ':ayuda') { output.write(help); prompt(); continue; }
      if (!query) { output.write('Escribí una consulta o :salir.\n'); prompt(); continue; }
      try {
        const results = await searchFn(query);
        if (!results.length) output.write('No se encontraron fragmentos. Probá con otras palabras.\n');
        else {
          output.write(`\n${results.length} fragmento(s) encontrado(s):\n`);
          results.forEach((result, index) => {
            output.write(`\n[${index + 1}] Fuente: ${result.path}\n`);
            if (result.heading) output.write(`Sección: ${result.heading}\n`);
            output.write(`${result.text}\n`);
          });
        }
      } catch (error) {
        failed = true;
        output.write(`No se pudo realizar la búsqueda: ${error instanceof SearchError ? error.message : 'error inesperado.'}\n`);
      }
      prompt();
    }
  } finally {
    reader.close();
  }
  output.write('\nSesión finalizada.\n');
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 2) {
    process.stderr.write('Uso: node ui/console.mjs\n');
    process.exitCode = 1;
  } else {
    runConsole().then(code => { process.exitCode = code; }).catch(() => { process.stderr.write('No se pudo iniciar la consola.\n'); process.exitCode = 1; });
  }
}
