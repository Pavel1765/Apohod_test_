/** Памятки для путешествий — экран с поиском */

import { GUIDE_CATEGORIES, searchGuides } from './guides-data.js';
import { soundSystem } from '../games/hike-game/sounds.js';

let onExitCallback = null;
let state = { query: '', category: 'all' };

export function renderGuides(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  loadStyles();
  state = { query: '', category: 'all' };
  renderShell(container);
}

function loadStyles() {
  if (!document.querySelector('link[href*="guides-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/guides-styles.css';
    document.head.appendChild(link);
  }
}

function renderShell(container) {
  container.innerHTML = `
    <div class="guides-app">
      <header class="guides-header">
        <button type="button" class="btn-back game-back-btn" id="guidesBack">← В меню</button>
        <div class="guides-title">
          <h1>📋 Памятки для путешествий</h1>
          <p>Справочник с поиском: экстренные номера, багаж авиакомпаний, особенности стран</p>
        </div>
      </header>

      <div class="guides-search-panel" aria-label="Поиск по памяткам">
        <label class="guides-search-label" for="guidesSearchInput">🔍 Поиск</label>
        <input
          type="search"
          id="guidesSearchInput"
          class="guides-search-input"
          placeholder="Например: 112, Аэрофлот, Турция, нельзя, 23 кг…"
          autocomplete="off"
          enterkeyhint="search"
        />
        <div class="guides-categories" id="guidesCategories" role="tablist"></div>
        <p class="guides-search-hint" id="guidesResultCount"></p>
      </div>

      <div class="guides-disclaimer">
        Справочные данные. Номера служб и правила авиакомпаний меняются — всегда проверяйте на официальных сайтах перед поездкой.
      </div>

      <div class="guides-list" id="guidesList" aria-live="polite"></div>
    </div>
  `;

  bindEvents(container);
  renderCategories(container);
  renderResults(container);
}

function bindEvents(container) {
  container.querySelector('#guidesBack').addEventListener('click', () => onExitCallback());

  const input = container.querySelector('#guidesSearchInput');
  input.addEventListener('input', () => {
    state.query = input.value;
    renderResults(container);
  });

  input.focus();
}

function renderCategories(container) {
  const host = container.querySelector('#guidesCategories');
  host.innerHTML = `
    <button type="button" class="guides-cat-btn ${state.category === 'all' ? 'active' : ''}" data-cat="all">Все</button>
    ${GUIDE_CATEGORIES.map(
      (c) => `
      <button type="button" class="guides-cat-btn ${state.category === c.id ? 'active' : ''}" data-cat="${c.id}">
        ${c.label}
      </button>`,
    ).join('')}
  `;

  host.querySelectorAll('.guides-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      soundSystem.click();
      state.category = btn.dataset.cat;
      renderCategories(container);
      renderResults(container);
    });
  });
}

function renderResults(container) {
  const list = container.querySelector('#guidesList');
  const countEl = container.querySelector('#guidesResultCount');
  const results = searchGuides(state.query, state.category);

  countEl.textContent = results.length
    ? `Найдено: ${results.length}`
    : state.query
      ? 'Ничего не найдено — попробуйте: «багаж», «112», «Таиланд», «Победа»'
      : `Всего памяток: ${results.length}`;

  if (!results.length) {
    list.innerHTML = `
      <div class="guides-empty">
        <span class="guides-empty-icon">🗺️</span>
        <p>${state.query ? `По запросу «${escapeHtml(state.query)}» ничего не найдено.` : 'Нет записей в этой категории.'}</p>
      </div>
    `;
    return;
  }

  const catLabel = Object.fromEntries(GUIDE_CATEGORIES.map((c) => [c.id, c.icon]));

  list.innerHTML = results
    .map(
      (entry) => `
    <article class="guides-card" data-category="${entry.category}">
      <div class="guides-card-meta">
        <span class="guides-card-badge">${catLabel[entry.category] || '📌'}</span>
      </div>
      <h2 class="guides-card-title">${escapeHtml(entry.title)}</h2>
      <div class="guides-card-body">${formatBody(entry.body)}</div>
    </article>
  `,
    )
    .join('');
}

function formatBody(text) {
  const escaped = escapeHtml(text);
  const withBreaks = escaped.replace(/\n/g, '<br>');
  const withBold = withBreaks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return withBold.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
