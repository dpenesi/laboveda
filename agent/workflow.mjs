import { search } from '../local/search.mjs';
import { answer } from './answer.mjs';

/** Une la búsqueda local con un generador inyectado; no proporciona un modelo. */
export async function runQuestion(question, generate, options = {}) {
  const searchFn = options.searchFn ?? search;
  const results = await searchFn(question);
  return answer(question, results, generate, { mode: options.mode, consent: options.consent });
}
