# Casos de uso y demo

## Casos de uso propuestos

1. **Preparar una reunión:** «¿Qué decidimos sobre el proyecto?» → listar decisiones y enlazar notas y fragmentos.
2. **Retomar trabajo:** «¿Cuáles eran los próximos pasos?» → reunir pendientes con sus fuentes y fechas cuando estén presentes.
3. **Investigar un incidente:** «¿Qué solución probamos para este error?» → recuperar notas relevantes, señalar falta de evidencia y citar rutas.
4. **Cruzar contexto:** «¿Qué acuerdos aparecen en estas reuniones?» → comparar documentos, mostrar fuentes y reconocer contradicciones.

Estos son escenarios del producto previsto. La demo actual solo realiza búsqueda léxica sobre tres notas ficticias; no sintetiza respuestas ni lee una bóveda real.

## Guion para el meetup

1. Abrir el sitio y explicar que los datos son ficticios y se procesan en el navegador.
2. Buscar `decisiones del proyecto`: aparece `proyecto/decisiones.md` con su fragmento.
3. Buscar `próximos pasos`: aparece la nota de próximos pasos.
4. Buscar un término ausente como `astronautas`: la demo muestra que no hay coincidencias.
5. Mostrar el diagrama de arquitectura y explicar qué datos saldrían del equipo si se eligiera un modelo remoto.
6. Preguntar a los participantes si la fuente mostrada alcanza para confiar en una respuesta y qué preferirían compartir con un proveedor.

## Ejemplo de flujo real futuro

Para una bóveda ya configurada, `obsn rag "decisiones del proyecto" 5 --json` podría alimentar un agente local que muestre fragmentos antes de enviarlos a un modelo. Requiere instalación, integración y pruebas; no está conectado en esta versión.
