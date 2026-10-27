import { search } from './search.js';

const form = document.querySelector('#search-form');
const input = document.querySelector('#query');
const results = document.querySelector('#results');

function render(query) {
  const found = search(query);
  results.replaceChildren();

  if (!found.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    const mark = document.createElement('span');
    mark.className = 'empty-mark';
    mark.textContent = '↳';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = 'No encontramos coincidencias.';
    const detail = document.createElement('p');
    detail.textContent = 'Probá con otras palabras o revisá las notas de ejemplo disponibles.';
    copy.append(title, detail);
    empty.append(mark, copy);
    results.append(empty);
    return;
  }

  for (const [index, note] of found.entries()) {
    const item = document.createElement('article');
    item.className = 'result';
    item.style.animationDelay = `${index * 70}ms`;
    const title = document.createElement('h3');
    title.textContent = note.title;
    const source = document.createElement('small');
    source.textContent = `FUENTE · ${note.path}`;
    const text = document.createElement('p');
    text.textContent = note.text;
    item.append(title, source, text);
    results.append(item);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  render(input.value);
});

document.querySelectorAll('.suggestion').forEach(button => {
  button.addEventListener('click', () => {
    input.value = button.dataset.query;
    render(input.value);
  });
});

// A sample query in the URL is useful for sharing or capturing a real demo state.
const sampleQuery = new URLSearchParams(window.location.search).get('q');
if (sampleQuery) {
  input.value = sampleQuery;
  render(sampleQuery);
  document.documentElement.style.scrollBehavior = 'auto';
  requestAnimationFrame(() => document.querySelector('#demo').scrollIntoView({ behavior: 'auto', block: 'start' }));
}

const revealItems = document.querySelectorAll('.reveal');
document.documentElement.classList.add('has-reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.14 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}
