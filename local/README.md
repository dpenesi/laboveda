# Adaptador local de búsqueda

Este prototipo conecta una consulta local con `obsn` para devolver fragmentos y rutas. No inicia un servidor, no acepta conexiones remotas, no ejecuta un modelo y no modifica notas. Está separado de la web pública: esa demo sigue usando sus propios ejemplos ficticios.

## Requisitos y uso

Requiere Node.js 22+, `obsn` instalado en `PATH` y una bóveda e índice configurados siguiendo la documentación de [obsidian-rag](https://github.com/kastormdz/obsidian-rag). El usuario debe crear o actualizar el índice con `obsn reindex` por su cuenta. Para una prueba sin información sensible, usar únicamente una bóveda ficticia:

```bash
printf '%s\n' 'decisiones del proyecto' | node local/search.mjs
# Opcional: limitar la cantidad de resultados entre 1 y 20
printf '%s\n' 'próximos pasos' | node local/search.mjs 3
node --test local/search.test.mjs
```

Devuelve JSON en stdout con `results`: cada resultado contiene `path`, `heading` y `text`. Una lista vacía significa que la búsqueda no encontró resultados; no produce una respuesta inventada. Los errores salen por stderr sin reproducir errores internos de `obsn`. No se almacenan consultas ni resultados desde este adaptador; quien lo invoque decide dónde dirigir la salida.

## Protección y límites

El adaptador invoca solo `obsn status --json` y `obsn rag --json`; no utiliza shell, trata la consulta como un argumento y no expone operaciones de modificación de notas. Rechaza un índice que informe fragmentos sin vector. Comprueba el formato y rutas relativas de los resultados, pero no comprueba que el contenido recuperado sea verdadero ni verifica firmas, cambios recientes o integridad del índice.

**No es acceso de solo lectura al sistema de archivos:** la propia búsqueda de `obsn` puede crear o modificar su índice SQLite y caché. El adaptador no altera los archivos de notas, pero depende del comportamiento de la versión instalada de `obsn`. El índice y sus vectores son sensibles. El estado que devuelve `obsn` no permite demostrar que el índice esté actualizado; sincronizá y reindexá cuando corresponda. El adaptador no ejecuta reindexado automáticamente.

La consulta se lee de stdin para evitar escribirla como argumento del adaptador, pero `obsn` la recibe como argumento y podría verse en la lista local de procesos. Los fragmentos se muestran en la salida; no los pegues en canales públicos. Las notas son datos no confiables, no instrucciones para un agente. No hay conexión con IA ni envío a proveedores externos en esta versión.

## Verificación con obsn real

El 27 de octubre de 2026 se probó con `obsn` 0.2.0, a partir del código del commit `eebdd12`, y un vault ficticio aislado de 8 notas, 17 fragmentos y 17 vectores. Una consulta con coincidencias devolvió fragmentos con sus rutas; una consulta fuera de dominio devolvió una lista vacía, y una consulta iniciada con guion se procesó correctamente. Esta prueba puntual no demuestra la seguridad del sistema, la calidad general de recuperación ni que un índice esté actualizado.
