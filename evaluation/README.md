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

## Ejecutar obsidian-rag de forma aislada

Instalar la versión de `obsn` que se quiera comparar en un entorno Python separado. La siguiente ejecución copia este corpus ficticio a un directorio temporal, crea un índice aislado y solicita 20 resultados por pregunta. Rechaza índices que no estén `ready` o tengan fragmentos sin vector. Puede descargar el modelo configurado por defecto; la caché también es temporal salvo que se indique `--cache`.

```bash
python3 evaluation/run_obsn.py --obsn /ruta/al/entorno/bin/obsn > /tmp/laboveda-obsn.json
python3 evaluation/evaluate.py --results /tmp/laboveda-obsn.json
```

El proceso no hereda variables de entorno que puedan apuntar a un vault, índice o credenciales personales. `--cache /ruta/a/cache` permite reutilizar una caché elegida explícitamente; no usar para esta prueba índices o vaults reales. El proceso elimina la copia y el índice temporales al finalizar.

## Ejemplo de corrida real

El archivo [`results/obsn-eebdd12.json`](results/obsn-eebdd12.json) contiene solo rutas de este corpus público. Se generó y repitió con:

- obsidian-rag commit `eebdd1260ccb36a4adda53044103b9e77bb39b02`, versión 0.2.0; 20 chunks solicitados por consulta, deduplicados por nota antes de puntuar.
- Python 3.12.3, fastembed 0.9.1, numpy 2.5.4, onnxruntime 1.31.1; modelo por defecto `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`.
- Copia del vault e índice temporal aislado: 8 notas y 17/17 chunks con embeddings; ninguna nota personal. El modelo no estaba fijado a un hash de revisión, por lo que una descarga futura puede variar.

Para calcular de nuevo las métricas del archivo sin instalar el buscador:

```bash
python3 evaluation/evaluate.py --results evaluation/results/obsn-eebdd12.json
```

En esta corrida: recall@5 0,70 y MRR 0,70 sobre 10 preguntas con respuesta; 0/2 preguntas sin respuesta devolvieron resultados. En las 3 paráfrasis, recall@5 y MRR fueron 0,33. Son resultados exploratorios para este corpus pequeño, no una estimación general ni una comparación concluyente de modelos.
