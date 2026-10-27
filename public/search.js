export const notes = [
  { title: 'Decisiones del proyecto', path: 'proyecto/decisiones.md', text: 'Decidimos mantener las notas en el dispositivo. El prototipo usará una bóveda de ejemplo y mostrará las fuentes de cada resultado.' },
  { title: 'Próximos pasos', path: 'proyecto/proximos-pasos.md', text: 'Preparar la demo para DevDay Mendoza, conversar con participantes y evaluar la recuperación de notas antes de integrar un modelo de IA.' },
  { title: 'Reunión de equipo', path: 'reuniones/primera-reunion.md', text: 'El equipo acordó probar la sincronización cifrada con ovaultd y la búsqueda local con obsn. Antes de compartir fragmentos con un proveedor, pedir consentimiento.' }
];
const terms = value => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[\p{L}\p{N}]+/gu) ?? [];
const stop = new Set(['el','la','los','las','de','del','en','con','y','un','una','que','para','como','cuales']);
export function search(query, corpus = notes) {
  const words = [...new Set(terms(query).filter(word => !stop.has(word)))];
  if (!words.length) return [];
  return corpus.map(note => {
    const haystack = terms(`${note.title} ${note.path} ${note.text}`);
    const score = words.filter(word => haystack.some(token => token.startsWith(word))).length;
    return { ...note, score };
  }).filter(note => note.score > 0).sort((a,b) => b.score - a.score || a.title.localeCompare(b.title));
}
