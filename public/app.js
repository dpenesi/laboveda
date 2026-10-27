import { search } from './search.js';
const form = document.querySelector('#search-form');
const input = document.querySelector('#query');
const results = document.querySelector('#results');
function render(query) {
  const found = search(query);
  results.replaceChildren();
  if (!found.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'No encontramos coincidencias. Probá con otras palabras.'; results.append(empty); return; }
  for (const note of found) {
    const item = document.createElement('article'); item.className = 'result';
    const title = document.createElement('h3'); title.textContent = note.title;
    const source = document.createElement('small'); source.textContent = `FUENTE · ${note.path}`;
    const text = document.createElement('p'); text.textContent = note.text;
    item.append(title, source, text); results.append(item);
  }
}
form.addEventListener('submit', event => { event.preventDefault(); render(input.value); });
document.querySelectorAll('.suggestion').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.query; render(input.value); }));
