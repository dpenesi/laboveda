# Plan de implementación

## Hito 0 — demo de concepto (actual)

Sitio estático y búsqueda de ejemplo en el navegador. La interfaz distingue datos ficticios de una integración real. No hay autenticación, servidor de aplicación ni modelo de IA.

## Hito 1 — evaluación reproducible

Crear un vault sintético público y preguntas con respuestas y fuentes etiquetadas. Medir recall@5 y MRR, incluyendo paráfrasis, preguntas sin respuesta y nombres exactos. Comparar `obsn` actual con alternativas de retrieval multilingüe bajo las mismas condiciones; publicar corpus, versiones y resultados. No extrapolar el benchmark privado del informe a todos los vaults.

## Hito 2 — integración local

Validar que `obsn` indexa todos los chunks con embeddings o comunica el fallo; reproducir el caso reportado de vectores faltantes. Implementar un adaptador de solo lectura con autorización explícita, sin exposición indiscriminada a sitios web. Probar que citas y rutas correspondan a fragmentos reales y que una búsqueda vacía no produzca una respuesta inventada.

## Hito 3 — generación con consentimiento

Seleccionar un proveedor o modelo local; mostrar exactamente el contexto y el destino antes de cualquier envío externo. Probar citas, datos contradictorios, contenido malicioso en notas y rechazo del consentimiento. Definir costos y retención. No ofrecer escrituras automáticas.

## Hito 4 — sincronización confiable

Revisar y probar las garantías de integridad de las dependencias, con los cambios de protocolo que correspondan. Probar con dos dispositivos y conflictos. Evitar afirmar garantías que todavía no estén implementadas.

## Criterio para decidir

En el meetup, observar si los participantes pueden responder una pregunta concreta y verificar la fuente. La calidad de recuperación y la disposición a compartir fragmentos son hipótesis por validar, no resultados establecidos.
