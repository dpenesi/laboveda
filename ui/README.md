# Consola local

La consola permite escribir preguntas y ver fragmentos con sus rutas y secciones. Utiliza el [adaptador local](../local/README.md), que consulta `obsn` en el equipo; no inicia un servidor, no llama a un proveedor de IA y no genera respuestas. La web pública sigue siendo una demo independiente con notas ficticias.

## Usar

Instalá Node.js 22+ y configurá `obsn` con una bóveda e índice de prueba, como se explica en [local/README.md](../local/README.md). Para comprobar el flujo sin datos sensibles, usá únicamente notas ficticias. Desde la raíz del repositorio:

```bash
node ui/console.mjs
```

Escribí una consulta y presioná Enter. Cada fragmento se muestra con su ruta relativa y, cuando está disponible, la sección. Si no hay coincidencias, se informa sin inventar una respuesta. Podés escribir `:ayuda` o `:salir`; Ctrl+D también cierra la consola. Para una consulta de ejemplo en un flujo no interactivo:

```bash
printf '%s\n' 'decisiones del proyecto' | node ui/console.mjs
```

La salida es para lectura humana. Si necesitás JSON, usá el adaptador directamente. Si ocurre un error de búsqueda, la consola lo muestra y termina con código 1, incluso si se procesan otras consultas. Las pruebas usan una búsqueda simulada y datos ficticios:

```bash
node --test ui/console.test.mjs
```

## Privacidad y límites

Esta consola no guarda consultas ni fragmentos ni los envía a un proveedor de IA. La dependencia `obsn` puede descargar modelos de embeddings si no están disponibles localmente. El terminal, una redirección o herramientas externas podrían registrar la salida: evitá pegarla en sitios públicos. La consulta se pasa a `obsn` como argumento y puede ser visible en la lista local de procesos. La búsqueda no modifica notas, pero `obsn` puede actualizar su índice y caché, que son sensibles. No se comprueba la integridad ni la actualización del índice, ni se ejecutan comandos o instrucciones que aparezcan en las notas.
