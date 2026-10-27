# Evaluación pública de recuperación

Corpus pequeño **inventado**: ocho notas Markdown y doce preguntas etiquetadas, con consultas exactas, paráfrasis y dos preguntas sin respuesta. No usar notas, índices, logs ni resultados de bóvedas privadas. Los resultados de este corpus son ilustrativos: la muestra es pequeña, las etiquetas fueron creadas junto con las notas y no demuestran calidad general.

## Ejecutar la línea de base

Requiere Python 3.10+ y ninguna dependencia externa. Desde la raíz del repositorio:

```bash
python3 -m unittest discover -s evaluation -p 'test_*.py'
python3 evaluation/baseline.py > /tmp/laboveda-results.json
python3 evaluation/evaluate.py --results /tmp/laboveda-results.json
```

`baseline.py` es un buscador léxico muy simple, sin embeddings. Sirve para comprobar que el evaluador funciona y tener una referencia reproducible; **no mide `obsn` ni una IA**. No guarda resultados en el repositorio. Los valores de `/tmp` son ejemplos de archivos generados y pueden eliminarse luego.

## Evaluar otra herramienta

Indexar exclusivamente `evaluation/vault/` en un índice separado y generar un JSON con todas las preguntas de `questions.json`, incluso las que no tienen resultados. Cada clave es un ID y su valor es una lista de rutas relativas al vault, ordenadas por relevancia:

```json
{
  "q01": ["proyecto/decisiones.md", "reuniones/reunion-uno.md"],
  "q02": [],
  "q03": []
}
```

Este fragmento ilustra el formato; para ejecutar el evaluador se necesitan **todos** los IDs. Se rechazan IDs faltantes o extra, rutas desconocidas y etiquetas inválidas. Las rutas corresponden a notas, no a fragmentos; si una herramienta devuelve varios chunks de una misma nota, el evaluador conserva la primera aparición. Documentar por separado versión de la herramienta, modelo, configuración, cantidad de resultados solicitados y fecha de la corrida para que la comparación sea reproducible.

`obsn rag "consulta" 5 --json` devuelve objetos con `path`: un adaptador externo debe ejecutar cada pregunta, extraer los `path` en orden y guardar el JSON anterior. Usar una instancia e índice aislados; no apuntar la prueba a un vault personal. Indexar con embeddings puede requerir instalar dependencias y descargar un modelo, y esas operaciones son independientes de esta línea de base. Si la indexación falla o quedan chunks sin vector, no presentar esa corrida como una evaluación semántica completa.

## Métricas

- **Recall@5:** fracción de notas etiquetadas como relevantes que aparecen entre las primeras cinco notas distintas, promediada por pregunta con respuesta. Una pregunta con dos fuentes relevantes y solo una recuperada aporta 0,5.
- **MRR:** promedio de `1 / posición` de la primera nota relevante en la lista completa, por pregunta con respuesta. Si no se recupera ninguna, aporta cero. Si la herramienta solo entrega cinco resultados, MRR también queda limitado a esos cinco.
- **Tasa de resultados falsos:** proporción de preguntas etiquetadas `sin_respuesta` que devuelven al menos una nota. No calcula precisión del texto generado.

La salida incluye métricas generales, por categoría y por pregunta. Las preguntas sin respuesta se excluyen de recall y MRR; las categorías sin casos aplicables muestran `null`. La evaluación no verifica citas textuales, contenido de respuestas generadas, seguridad ni integridad de sincronización.
