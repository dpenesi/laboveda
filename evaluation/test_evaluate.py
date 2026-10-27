import unittest
from evaluate import evaluate


class EvaluateTests(unittest.TestCase):
    def setUp(self):
        self.docs = {'a.md', 'b.md', 'c.md'}
        self.data = {'questions': [
            {'id': 'q1', 'query': 'consulta', 'category': 'exacta', 'relevant': ['a.md', 'b.md']},
            {'id': 'q2', 'query': 'ausente', 'category': 'sin_respuesta', 'relevant': []},
            {'id': 'q3', 'query': 'otra', 'category': 'parafrasis', 'relevant': ['c.md']},
        ]}

    def test_deduplicates_paths_and_scores_each_relevant_note(self):
        result = evaluate(self.data, {'q1': ['c.md', 'c.md', 'a.md', 'b.md'], 'q2': ['a.md'], 'q3': []}, self.docs)
        self.assertEqual(result['per_query'][0]['recall_at_5'], 1)
        self.assertEqual(result['per_query'][0]['reciprocal_rank'], 0.5)
        self.assertEqual(result['overall']['recall_at_5'], 0.5)
        self.assertEqual(result['overall']['mrr'], 0.25)
        self.assertEqual(result['overall']['false_result_rate'], 1)

    def test_requires_all_query_ids_and_known_notes(self):
        with self.assertRaises(ValueError):
            evaluate(self.data, {'q1': []}, self.docs)
        with self.assertRaises(ValueError):
            evaluate(self.data, {'q1': ['desconocida.md'], 'q2': [], 'q3': []}, self.docs)

    def test_category_and_relevance_must_agree(self):
        self.data['questions'][0]['relevant'] = []
        with self.assertRaises(ValueError):
            evaluate(self.data, {'q1': [], 'q2': [], 'q3': []}, self.docs)

    def test_mrr_is_not_cut_at_five(self):
        docs = {f'{i}.md' for i in range(6)}
        dataset = {'questions': [{'id': 'q', 'query': 'consulta', 'category': 'exacta', 'relevant': ['5.md']}]}
        report = evaluate(dataset, {'q': [f'{i}.md' for i in range(6)]}, docs)
        self.assertEqual(report['overall']['recall_at_5'], 0)
        self.assertAlmostEqual(report['overall']['mrr'], 1 / 6)


if __name__ == '__main__':
    unittest.main()
