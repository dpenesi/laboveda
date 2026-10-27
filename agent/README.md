# Núcleo de respuestas con fuentes

Este módulo experimental recibe una pregunta, fragmentos y una función generadora inyectada. Comprueba que la respuesta incluya referencias a fuentes recibidas y no llama al generador cuando no hay evidencia. La función puede fallar o producir una respuesta equivocada; verificar que una cita exista **no prueba** que el texto esté respaldado por ella.

El módulo `workflow.mjs` permite combinar la búsqueda local con una función generadora inyectada. Aún no hay un modelo, proveedor ni interfaz de consentimiento integrados; la conexión se prueba con funciones simuladas. El llamador debe declarar el modo `local` o `externo`. Para un proveedor externo debe presentar el destino y los fragmentos exactos antes de pasar `mode: 'externo'` y `consent: true` para cada envío. Es responsabilidad del integrador clasificar correctamente el proveedor: el módulo no detecta por sí solo si la función usa red. No registra ni almacena las consultas o fuentes.

Las notas pueden contener instrucciones maliciosas. Entregar el texto como datos no garantiza que un modelo vaya a ignorarlas. No dar al generador herramientas de escritura o ejecución de comandos y evaluar el modelo elegido con casos adversarios antes de usarlo con datos reales.

Pruebas con un generador simulado y datos inventados:

```bash
node --test agent/answer.test.mjs
```
