import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


RUNNER = Path(__file__).resolve().parent / 'run_obsn.py'
FAKE = '''#!{python}
import json, os, pathlib, sqlite3, sys
if sys.argv[1] == 'reindex':
    p=pathlib.Path(os.environ['OBS_RAG_INDEX'])
    assert 'SENTINEL_PRIVATE_VALUE' not in os.environ
    with sqlite3.connect(p) as db:
        db.execute('CREATE TABLE chunks(vec BLOB)')
        db.execute('INSERT INTO chunks VALUES (?)', (None if 'incomplete' in sys.argv[0] else b'v',))
        db.execute('CREATE TABLE meta(k TEXT,v TEXT)')
        db.execute("INSERT INTO meta VALUES ('estado','ready')")
else:
    print(json.dumps([{{'path':'proyecto/decisiones.md'}}]))
'''


class RunnerTests(unittest.TestCase):
    def executable(self, directory, name):
        path = Path(directory) / name
        path.write_text(FAKE.format(python=sys.executable), encoding='utf-8')
        path.chmod(0o755)
        return path

    def test_fake_tool_runs_in_isolated_environment(self):
        with tempfile.TemporaryDirectory() as temp:
            fake = self.executable(temp, 'obsn')
            env = dict(os.environ, SENTINEL_PRIVATE_VALUE='must not be inherited')
            proc = subprocess.run([sys.executable, str(RUNNER), '--obsn', str(fake)], capture_output=True, text=True, env=env)
            self.assertEqual(proc.returncode, 0, proc.stderr)
            results = json.loads(proc.stdout)
            self.assertEqual(len(results), 12)
            self.assertEqual(results['q01'], ['proyecto/decisiones.md'])

    def test_missing_vectors_block_evaluation(self):
        with tempfile.TemporaryDirectory() as temp:
            fake = self.executable(temp, 'obsn-incomplete')
            proc = subprocess.run([sys.executable, str(RUNNER), '--obsn', str(fake)], capture_output=True, text=True)
            self.assertEqual(proc.returncode, 2)
            self.assertIn('sin vector', proc.stderr)
            self.assertEqual(proc.stdout, '')


if __name__ == '__main__':
    unittest.main()
