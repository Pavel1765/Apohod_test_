/** Игра со стрелками */

import { soundSystem } from '../hike-game/sounds.js';

const DIRECTIONS = ['↑', '→', '↓', '←'];
const DIR_VECTORS = [
  [-1, 0], // up
  [0, 1],  // right
  [1, 0],  // down
  [0, -1]  // left
];

let grid = [];
let gridSize = 5;
let level = 1;
let moves = 0;
let onExitCallback = null;

const LEVELS = [
  // Уровень 1 - простой (3x3) - проходим!
  { 
    size: 3, 
    arrows: [
      [1, 2, 1],  // → ↓ →
      [null, 0, null],  // пусто ↑ пусто
      [3, null, 1]   // ← пусто →
    ]
  },
  
  // Уровень 2 - средний (4x4) - проходим!
  { 
    size: 4, 
    arrows: [
      [null, 1, 2, null],  // пусто → ↓ пусто
      [0, null, null, 2],  // ↑ пусто пусто ↓
      [null, 3, 1, null],  // пусто ← → пусто
      [3, null, null, 0]   // ← пусто пусто ↑
    ]
  },
  
  // Уровень 3 - сложный (5x5) - проходим!
  { 
    size: 5, 
    arrows: [
      [null, 1, null, 1, null],    // пусто → пусто → пусто
      [0, null, 2, null, 2],       // ↑ пусто ↓ пусто ↓
      [null, 1, null, 3, null],    // пусто → пусто ← пусто
      [null, null, 0, null, null], // пусто пусто ↑ пусто пусто
      [3, null, null, null, 1]     // ← пусто пусто пусто →
    ]
  },
];

export function renderArrowsGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  container.innerHTML = `
    <div class="arrows-game">
      <div class="arrows-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="arrows-title">
          <h1>➡️ Стрелки</h1>
          <p>Нажимайте на стрелки в правильном порядке, чтобы все вышли</p>
        </div>
      </div>
      <div class="arrows-stats">
        <div class="stat-card">
          <div class="stat-label">Уровень</div>
          <div class="stat-value" id="level">1</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Ходы</div>
          <div class="stat-value" id="moves">0</div>
        </div>
        <button class="btn-primary" id="resetBtn">Сброс</button>
        <button class="btn-primary" id="nextBtn" style="display:none;">Следующий</button>
      </div>
      <div class="arrows-board" id="board"></div>
      <div class="arrows-hint">
        <p><strong>Правило:</strong> Стрелка может выйти только если путь в её направлении свободен</p>
        <p>Нажимайте на стрелки, чтобы они исчезли с поля</p>
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.getElementById('resetBtn').addEventListener('click', () => resetLevel());
  document.getElementById('nextBtn').addEventListener('click', () => nextLevel());
  
  initLevel();
}

function loadStyles() {
  if (!document.querySelector('link[href*="arrows-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/arrows-styles.css';
    document.head.appendChild(link);
  }
}

function initLevel() {
  moves = 0;
  const levelData = LEVELS[level - 1];
  gridSize = levelData.size;
  grid = JSON.parse(JSON.stringify(levelData.arrows));
  document.getElementById('nextBtn').style.display = 'none';
  updateStats();
  renderBoard();
}

function resetLevel() {
  initLevel();
  soundSystem.click();
}

function nextLevel() {
  if (level < LEVELS.length) {
    level++;
    initLevel();
    soundSystem.click();
  }
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'arrows-cell';
      
      if (grid[row][col] !== null) {
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.textContent = DIRECTIONS[grid[row][col]];
        arrow.addEventListener('click', () => onArrowClick(row, col));
        
        if (canExit(row, col)) {
          arrow.classList.add('can-exit');
        } else {
          arrow.classList.add('blocked');
        }
        
        cell.appendChild(arrow);
      }
      
      board.appendChild(cell);
    }
  }
}

function canExit(row, col) {
  if (grid[row][col] === null) return false;
  
  const dir = grid[row][col];
  const [dr, dc] = DIR_VECTORS[dir];
  
  let r = row + dr;
  let c = col + dc;
  
  // Проверяем путь до края
  while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
    if (grid[r][c] !== null) {
      return false; // Путь заблокирован
    }
    r += dr;
    c += dc;
  }
  
  return true; // Путь свободен до края
}

function onArrowClick(row, col) {
  if (grid[row][col] === null) return;
  
  if (canExit(row, col)) {
    soundSystem.move();
    grid[row][col] = null;
    moves++;
    updateStats();
    renderBoard();
    checkVictory();
  } else {
    soundSystem.error();
    // Анимация блокировки
    const cell = document.querySelector(`.arrows-cell:nth-child(${row * gridSize + col + 1})`);
    cell.classList.add('shake');
    setTimeout(() => cell.classList.remove('shake'), 500);
  }
}

function checkVictory() {
  let hasArrows = false;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] !== null) {
        hasArrows = true;
        break;
      }
    }
    if (hasArrows) break;
  }
  
  if (!hasArrows) {
    soundSystem.victory();
    setTimeout(() => {
      alert(`Уровень ${level} пройден за ${moves} ходов!`);
      if (level < LEVELS.length) {
        document.getElementById('nextBtn').style.display = 'block';
      } else {
        alert('Поздравляем! Вы прошли все уровни!');
      }
    }, 500);
  }
}

function updateStats() {
  document.getElementById('level').textContent = level;
  document.getElementById('moves').textContent = moves;
}
