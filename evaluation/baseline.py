#!/usr/bin/env python3
"""Simple lexical baseline over the synthetic vault; outputs ranked paths as JSON."""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STOP = {'que', 'el', 'la', 'los', 'las', 'de', 'del', 'se', 'en', 'un', 'una', 'como', 'para', 'es', 'al', 'y', 'si', 'con', 'por'}


def tokens(text):
    text = ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(c) != 'Mn')
    return {t for t in re.findall(r'\w+', text) if t not in STOP and len(t) > 1}


def main():
    dataset = json.loads((ROOT / 'questions.json').read_text(encoding='utf-8'))
    vault = ROOT / 'vault'
    documents = {p.relative_to(vault).as_posix(): tokens(p.read_text(encoding='utf-8')) for p in vault.rglob('*.md')}
    results = {}
    for q in dataset['questions']:
        words = tokens(q['query'])
        ranked = sorted(((len(words & words_in_note), path) for path, words_in_note in documents.items()), key=lambda x: (-x[0], x[1]))
        results[q['id']] = [path for score, path in ranked if score > 0][:5]
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
