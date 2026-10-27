/** Núcleo independiente del proveedor. No abre conexiones ni almacena datos. */
export class AnswerError extends Error {}

export async function answer(question, results, generate, options = {}) {
  if (typeof question !== 'string' || !question.trim() || question.length > 2000 || !Array.isArray(results) || typeof generate !== 'function') {
    throw new AnswerError('Solicitud inválida.');
  }
  if (results.length > 20) throw new AnswerError('Demasiadas fuentes.');
  if (results.length === 0) return { status: 'sin_evidencia', text: '', sources: [] };
  const sources = results.map((item, index) => {
    if (!item || typeof item.path !== 'string' || !item.path || typeof item.text !== 'string' || !item.text.trim() || item.text.length > 100_000) {
      throw new AnswerError('Fuente inválida.');
    }
    return { id: `s${index + 1}`, path: item.path, heading: typeof item.heading === 'string' ? item.heading : '', text: item.text };
  });
  if (!['local', 'externo'].includes(options.mode)) throw new AnswerError('Indicá si el generador es local o externo.');
  if (options.mode === 'externo' && options.consent !== true) throw new AnswerError('Se necesita autorización antes de enviar fragmentos a un proveedor externo.');
  // El generador recibe los datos por separado de las instrucciones. Esto no garantiza
  // inmunidad frente a instrucciones maliciosas incluidas en una nota.
  const result = await generate({ question, sources });
  if (!result || typeof result.text !== 'string' || !result.text.trim() || result.text.length > 100_000 || !Array.isArray(result.citations) || !result.citations.length) {
    throw new AnswerError('La respuesta o sus referencias tienen un formato inválido.');
  }
  const byId = new Map(sources.map(source => [source.id, source]));
  if (result.citations.some(id => typeof id !== 'string' || !byId.has(id))) throw new AnswerError('La respuesta cita una fuente desconocida.');
  const cited = [...new Set(result.citations)].map(id => {
    const { path, heading } = byId.get(id);
    return { id, path, heading };
  });
  return { status: 'ok', text: result.text, sources: cited };
}
