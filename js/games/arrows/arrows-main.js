/** Игра «Маршрут» — проложите путь стрелками с минимумом энергии */

import { soundSystem } from '../hike-game/sounds.js';
import { addCoins } from '../../shop.js';

const DIRECTIONS = ['↑', '→', '↓', '←'];
const DIR_VECTORS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

const MAX_ENERGY = 80;
const TENT_RESTORE = 30;
const MAX_TENTS = 3;
const GRID_COLS = 10;
const GRID_ROWS = 8;

const TERRAIN = {
  plain: { icon: '🌿', name: 'Луг', cost: 1 },
  forest: { icon: '🌲', name: 'Лес', cost: 1 },
  mountain: { icon: '⛰️', name: 'Горы', cost: 2 },
  river: { icon: '🌊', name: 'Река', cost: 2 },
  rock: { icon: '🪨', name: 'Скалы', blocked: true },
  start: { icon: '🏕️', name: 'Старт', cost: 0 },
  finish: { icon: '🎌', name: 'Финиш', cost: 0 }
};

// Один большой маршрут с препятствиями
const MAP_LAYOUT = [
  ['start', 'plain', 'plain', 'forest', 'mountain', 'mountain', 'plain', 'forest', 'plain', 'finish'],
  ['plain', 'forest', 'plain', 'plain', 'mountain', 'river', 'river', 'plain', 'forest', 'plain'],
  ['plain', 'plain', 'plain', 'forest', 'plain', 'plain', 'mountain', 'mountain', 'plain', 'plain'],
  ['forest', 'mountain', 'mountain', 'plain', 'plain', 'forest', 'plain', 'river', 'river', 'plain'],
  ['plain', 'plain', 'river', 'river', 'plain', 'plain', 'plain', 'plain', 'forest', 'plain'],
  ['plain', 'forest', 'plain', 'plain', 'mountain', 'mountain', 'forest', 'plain', 'plain', 'forest'],
  ['plain', 'plain', 'forest', 'plain', 'plain', 'river', 'plain', 'forest', 'plain', 'plain'],
  ['rock', 'rock', 'plain', 'plain', 'forest', 'plain', 'plain', 'plain', 'mountain', 'plain']
];

let terrain = [];
let arrows = [];
let tents = new Set();
let tentsLeft = MAX_TENTS;
let energy = MAX_ENERGY;
let phase = 'planning';
let onExitCallback = null;
let tentMode = false;
let startPos = { r: 0, c: 0 };
let finishPos = { r: 0, c: 9 };

export function renderArrowsGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  container.innerHTML = `
    <div class="arrows-game">
      <button class="btn-back game-back-btn" id="backBtn">← В меню</button>
      <div class="arrows-header">
        <div class="arrows-title">
          <h1>🗺️ Маршрут</h1>
          <p>Проложите путь стрелками, расставьте палатки и доберитесь до финиша с минимумом энергии!</p>
        </div>
      </div>

      <div class="arrows-stats">
        <div class="stat-card">
          <div class="stat-label">⚡ Энергия</div>
          <div class="stat-value" id="energy-val">${MAX_ENERGY}</div>
          <div class="energy-bar"><div class="energy-fill" id="energy-fill" style="width:100%"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">⛺ Палатки</div>
          <div class="stat-value" id="tents-val">${MAX_TENTS}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">📍 Шагов</div>
          <div class="stat-value" id="steps-val">—</div>
        </div>
        <button class="btn-secondary" id="tentBtn">⛺ Поставить палатку</button>
        <button class="btn-primary" id="hikeBtn">🥾 Начать поход</button>
        <button class="btn-secondary" id="resetBtn">🔄 Сброс</button>
      </div>

      <div class="arrows-board-wrap">
        <div class="arrows-board" id="board"></div>
      </div>

      <div class="arrows-legend">
        <span>🌿 Луг — 1</span>
        <span>🌲 Лес — 1</span>
        <span>⛰️ Горы — 2</span>
        <span>🌊 Река — 2</span>
        <span>⛺ Палатка — +${TENT_RESTORE} энергии</span>
      </div>

      <div class="arrows-hint" id="hint">
        <p><strong>Как играть:</strong> Кликайте по клеткам, чтобы поставить стрелку направления (↑→↓←).</p>
        <p>Нажмите «Поставить палатку», затем кликните на клетку — восстановит ${TENT_RESTORE} энергии при прохождении.</p>
        <p>Сложные участки (горы, реки) тратят <strong>в 2 раза больше</strong> энергии. Дойдите до 🎌 с запасом сил!</p>
      </div>

      <div class="arrows-message" id="message" hidden></div>
    </div>
  `;

  loadStyles();

  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.getElementById('resetBtn').addEventListener('click', () => resetGame());
  document.getElementById('tentBtn').addEventListener('click', () => toggleTentMode());
  document.getElementById('hikeBtn').addEventListener('click', () => startHike());

  initGame();
}

function loadStyles() {
  if (!document.querySelector('link[href*="arrows-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/arrows-styles.css';
    document.head.appendChild(link);
  }
}

function initGame() {
  terrain = MAP_LAYOUT.map(row => [...row]);
  arrows = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
  tents = new Set();
  tentsLeft = MAX_TENTS;
  energy = MAX_ENERGY;
  phase = 'planning';
  tentMode = false;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (terrain[r][c] === 'start') startPos = { r, c };
      if (terrain[r][c] === 'finish') finishPos = { r, c };
    }
  }

  updateUI();
  renderBoard();
  hideMessage();
  document.getElementById('tentBtn').classList.remove('active');
}

function resetGame() {
  soundSystem.click();
  initGame();
}

function toggleTentMode() {
  if (phase !== 'planning') return;
  tentMode = !tentMode;
  document.getElementById('tentBtn').classList.toggle('active', tentMode);
  soundSystem.click();
}

function isTraversable(r, c) {
  if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return false;
  const t = terrain[r][c];
  return t !== 'rock';
}

function canPlaceArrow(r, c) {
  const t = terrain[r][c];
  return t !== 'rock' && phase === 'planning';
}

function canPlaceTent(r, c) {
  const t = terrain[r][c];
  const key = `${r},${c}`;
  if (t === 'rock' || t === 'start' || t === 'finish') return false;
  if (tents.has(key)) return true;
  return tentsLeft > 0;
}

function onCellClick(r, c) {
  if (phase !== 'planning') return;

  if (tentMode) {
    const key = `${r},${c}`;
    if (tents.has(key)) {
      tents.delete(key);
      tentsLeft++;
      soundSystem.click();
    } else if (canPlaceTent(r, c)) {
      tents.add(key);
      tentsLeft--;
      soundSystem.move();
    } else {
      soundSystem.error();
      return;
    }
    updateUI();
    renderBoard();
    return;
  }

  if (!canPlaceArrow(r, c)) {
    soundSystem.error();
    return;
  }

  const current = arrows[r][c];
  if (current === null) {
    arrows[r][c] = 0;
  } else if (current < 3) {
    arrows[r][c] = current + 1;
  } else {
    arrows[r][c] = null;
  }

  soundSystem.click();
  renderBoard();
}

function simulatePath() {
  let r = startPos.r;
  let c = startPos.c;
  let simEnergy = MAX_ENERGY;
  const visited = new Set();
  const path = [{ r, c }];
  let steps = 0;

  while (steps < 150) {
    if (r === finishPos.r && c === finishPos.c) {
      return { ok: true, energy: simEnergy, path, steps };
    }

    const key = `${r},${c}`;
    if (visited.has(key)) {
      return { ok: false, reason: 'Маршрут зациклился! Измените стрелки.' };
    }
    visited.add(key);

    const dir = arrows[r][c];
    if (dir === null) {
      return { ok: false, reason: 'Нет стрелки на клетке — маршрут обрывается.' };
    }

    const [dr, dc] = DIR_VECTORS[dir];
    const nr = r + dr;
    const nc = c + dc;

    if (!isTraversable(nr, nc)) {
      return { ok: false, reason: 'Стрелка ведёт в препятствие или за карту.' };
    }

    const t = terrain[nr][nc];
    const cost = TERRAIN[t]?.cost ?? 1;
    simEnergy -= cost;

    const tentKey = `${nr},${nc}`;
    if (tents.has(tentKey)) {
      simEnergy = Math.min(MAX_ENERGY, simEnergy + TENT_RESTORE);
    }

    if (simEnergy <= 0 && !(nr === finishPos.r && nc === finishPos.c)) {
      return { ok: false, reason: 'Энергии не хватит! Добавьте палатки или измените маршрут.' };
    }

    r = nr;
    c = nc;
    path.push({ r, c });
    steps++;
  }

  return { ok: false, reason: 'Маршрут слишком длинный.' };
}

async function startHike() {
  if (phase !== 'planning') return;

  const result = simulatePath();
  if (!result.ok) {
    soundSystem.error();
    showMessage(result.reason, 'error');
    return;
  }

  phase = 'walking';
  document.getElementById('hikeBtn').disabled = true;
  document.getElementById('tentBtn').disabled = true;
  soundSystem.click();

  let simEnergy = MAX_ENERGY;
  const path = result.path;

  for (let i = 0; i < path.length; i++) {
    const { r, c } = path[i];
    highlightCell(r, c);

    if (i > 0) {
      const t = terrain[r][c];
      const cost = TERRAIN[t]?.cost ?? 1;
      simEnergy -= cost;
      if (tents.has(`${r},${c}`)) {
        simEnergy = Math.min(MAX_ENERGY, simEnergy + TENT_RESTORE);
      }
    }

    energy = simEnergy;
    updateUI();
    await sleep(350);
  }

  phase = 'won';
  soundSystem.victory();
  const reward = Math.max(10, Math.floor(energy / 2));
  addCoins(reward);

  document.getElementById('steps-val').textContent = path.length - 1;
  showMessage(
    `🎉 Маршрут пройден! Осталось ${energy} энергии из ${MAX_ENERGY}. Награда: ${reward} 💰`,
    'success'
  );
  document.getElementById('hikeBtn').disabled = false;
  document.getElementById('tentBtn').disabled = false;
}

function highlightCell(r, c) {
  document.querySelectorAll('.arrows-cell').forEach(el => el.classList.remove('active-step'));
  const idx = r * GRID_COLS + c;
  const cell = document.querySelectorAll('.arrows-cell')[idx];
  if (cell) cell.classList.add('active-step');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = document.createElement('div');
      const t = terrain[r][c];
      const info = TERRAIN[t];

      cell.className = 'arrows-cell';
      cell.classList.add(`terrain-${t}`);

      if (info?.blocked) cell.classList.add('blocked');

      const terrainEl = document.createElement('div');
      terrainEl.className = 'cell-terrain';
      terrainEl.textContent = info?.icon || '';
      terrainEl.title = info?.name || '';

      cell.appendChild(terrainEl);

      const key = `${r},${c}`;
      if (tents.has(key)) {
        const tentEl = document.createElement('div');
        tentEl.className = 'cell-tent';
        tentEl.textContent = '⛺';
        cell.appendChild(tentEl);
      }

      if (arrows[r][c] !== null && t !== 'rock') {
        const arrowEl = document.createElement('div');
        arrowEl.className = 'cell-arrow';
        arrowEl.textContent = DIRECTIONS[arrows[r][c]];
        cell.appendChild(arrowEl);
      }

      if (phase === 'planning' && t !== 'rock') {
        cell.addEventListener('click', () => onCellClick(r, c));
        cell.classList.add('clickable');
      }

      board.appendChild(cell);
    }
  }
}

function updateUI() {
  document.getElementById('energy-val').textContent = energy;
  document.getElementById('tents-val').textContent = tentsLeft;
  const pct = Math.max(0, Math.min(100, (energy / MAX_ENERGY) * 100));
  document.getElementById('energy-fill').style.width = `${pct}%`;
}

function showMessage(text, type) {
  const el = document.getElementById('message');
  el.hidden = false;
  el.textContent = text;
  el.className = `arrows-message ${type}`;
}

function hideMessage() {
  const el = document.getElementById('message');
  el.hidden = true;
}
