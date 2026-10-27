#!/usr/bin/env python3
"""Execute obsn on an isolated copy of the synthetic vault and output ranked paths."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent


def run(executable: Path, cache: Path | None = None):
    if not executable.is_file() or not os.access(executable, os.X_OK):
        raise ValueError('El ejecutable obsn no existe o no tiene permiso de ejecución.')
    with tempfile.TemporaryDirectory(prefix='laboveda-eval-') as temporary:
        tmp = Path(temporary)
        vault = tmp / 'vault'
        shutil.copytree(ROOT / 'vault', vault)
        for name in ('home', 'data', 'cache', 'tmp'):
            (tmp / name).mkdir()
        index = tmp / 'data/index.db'
        cache_path = cache.resolve() if cache else tmp / 'cache'
        cache_path.mkdir(parents=True, exist_ok=True)
        # Do not pass personal credentials, vault paths or configuration to the child.
        env = {'PATH': os.environ.get('PATH', os.defpath), 'HOME': str(tmp / 'home'),
               'XDG_DATA_HOME': str(tmp / 'data'), 'XDG_CACHE_HOME': str(cache_path),
               'TMPDIR': str(tmp / 'tmp'), 'OBS_RAG_VAULT': str(vault), 'OBS_RAG_INDEX': str(index),
               'OBS_RAG_CACHE': str(cache_path), 'FASTEMBED_CACHE_PATH': str(cache_path),
               'HF_HOME': str(cache_path / 'hf')}
        build = subprocess.run([str(executable), 'reindex'], env=env, capture_output=True, text=True, timeout=1800)
        if build.returncode:
            raise RuntimeError('Falló la indexación del corpus sintético: ' + build.stderr[-1200:])
        if not index.is_file():
            raise RuntimeError('La indexación no creó el índice esperado.')
        with sqlite3.connect(f'file:{index}?mode=ro', uri=True) as db:
            total, missing = db.execute('SELECT count(*), count(*) - count(vec) FROM chunks').fetchone()
            status = db.execute("SELECT v FROM meta WHERE k='estado'").fetchone()
        if not total or missing or not status or status[0] != 'ready':
            raise RuntimeError(f'Índice incompleto o no listo: {total} fragmentos, {missing} sin vector.')
        print(f'Índice sintético listo: {total} fragmentos con embeddings.', file=sys.stderr)
        questions = json.loads((ROOT / 'questions.json').read_text(encoding='utf-8'))['questions']
        results = {}
        for q in questions:
            proc = subprocess.run([str(executable), 'rag', q['query'], '20', '--json'], env=env,
                                  capture_output=True, text=True, timeout=120)
            if proc.returncode:
                raise RuntimeError(f"Consulta {q['id']} falló: {proc.stderr[-1200:]}")
            raw = json.loads(proc.stdout)
            if not isinstance(raw, list) or not all(isinstance(r, dict) and isinstance(r.get('path'), str) for r in raw):
                raise ValueError(f"Formato de resultados inválido para {q['id']}.")
            results[q['id']] = [r['path'] for r in raw]
        return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--obsn', type=Path, required=True, help='Ruta del ejecutable obsn instalado')
    parser.add_argument('--cache', type=Path, help='Caché explícita de modelo; por defecto es temporal')
    args = parser.parse_args()
    try:
        results = run(args.obsn.resolve(), args.cache)
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired, sqlite3.Error) as exc:
        parser.exit(2, f'Error: {exc}\n')
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
