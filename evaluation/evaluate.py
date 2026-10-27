#!/usr/bin/env python3
"""Evaluate note-level ranked results against the public synthetic corpus."""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def evaluate(dataset, results, documents, k=5):
    if not isinstance(dataset, dict) or not isinstance(dataset.get('questions'), list):
        raise ValueError('El dataset debe contener una lista questions.')
    if not isinstance(results, dict) or not isinstance(k, int) or k <= 0:
        raise ValueError('Los resultados deben ser un objeto y k un entero positivo.')
    questions = dataset['questions']
    if not questions:
        raise ValueError('No hay preguntas para evaluar.')
    ids = []
    for q in questions:
        if not isinstance(q, dict) or not all(isinstance(q.get(key), str) and q[key] for key in ('id', 'query', 'category')):
            raise ValueError('Cada pregunta necesita id, query y category no vacíos.')
        relevant = q.get('relevant')
        if not isinstance(relevant, list) or not all(isinstance(p, str) and p in documents for p in relevant):
            raise ValueError(f"Fuentes inválidas en {q['id']}.")
        if len(relevant) != len(set(relevant)):
            raise ValueError(f"Fuentes duplicadas en {q['id']}.")
        if (q['category'] == 'sin_respuesta') != (not relevant):
            raise ValueError(f"Categoría y fuentes inconsistentes en {q['id']}.")
        ids.append(q['id'])
    if len(ids) != len(set(ids)):
        raise ValueError('Hay IDs de preguntas duplicados.')
    if set(results) != set(ids):
        raise ValueError('Los resultados deben incluir exactamente todos los IDs de preguntas.')

    rows = []
    for q in questions:
        paths = results[q['id']]
        if not isinstance(paths, list) or not all(isinstance(p, str) and p in documents for p in paths):
            raise ValueError(f"Resultados inválidos o fuera del corpus en {q['id']}.")
        ranked = list(dict.fromkeys(paths))
        relevant = set(q['relevant'])
        first = next((i for i, path in enumerate(ranked, 1) if path in relevant), None)
        rows.append({
            'id': q['id'], 'category': q['category'],
            'recall_at_5': len(relevant.intersection(ranked[:k])) / len(relevant) if relevant else None,
            'reciprocal_rank': 1 / first if first else (0 if relevant else None),
            'has_results': bool(ranked),
        })

    def summarize(selected):
        positive = [r for r in selected if r['recall_at_5'] is not None]
        negative = [r for r in selected if r['recall_at_5'] is None]
        return {
            'questions': len(selected), 'answerable': len(positive), 'unanswerable': len(negative),
            'recall_at_5': math.fsum(r['recall_at_5'] for r in positive) / len(positive) if positive else None,
            'mrr': math.fsum(r['reciprocal_rank'] for r in positive) / len(positive) if positive else None,
            'false_result_rate': sum(r['has_results'] for r in negative) / len(negative) if negative else None,
        }
    return {'overall': summarize(rows), 'by_category': {
        category: summarize([r for r in rows if r['category'] == category])
        for category in sorted({r['category'] for r in rows})
    }, 'per_query': rows}


def main():
    parser = argparse.ArgumentParser(description='Evaluar resultados por nota frente al corpus ficticio.')
    parser.add_argument('--results', type=Path, required=True, help='JSON: ID de pregunta -> rutas relativas ordenadas')
    args = parser.parse_args()
    try:
        dataset = json.loads((ROOT / 'questions.json').read_text(encoding='utf-8'))
        results = json.loads(args.results.read_text(encoding='utf-8'))
        docs = {p.relative_to(ROOT / 'vault').as_posix() for p in (ROOT / 'vault').rglob('*.md')}
        report = evaluate(dataset, results, docs)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        parser.exit(2, f'Error: {exc}\n')
    print(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()
