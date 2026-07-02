/** Игра 3 в ряд (Match-3) */

import { soundSystem } from '../hike-game/sounds.js';

const ICONS = ['⛰️', '🌲', '🏕️', '💧', '🧭', '🔬', '🎶', '📸', '⛑️'];
const GRID_SIZE = 8;
const MIN_MATCH = 3;

let grid = [];
let score = 0;
let moves = 0;
let selectedCell = null;
let onExitCallback = null;

export function renderMatch3Game(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  container.innerHTML = `
    <div class="match3-game">
      <div class="match3-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="match3-title">
          <h1>🧩 Три в Ряд</h1>
          <p>Составляйте комбинации из трех и более одинаковых символов!</p>
        </div>
      </div>
      <div class="match3-stats">
        <div class="stat-card">
          <div class="stat-label">Очки</div>
          <div class="stat-value" id="score">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Ходы</div>
          <div class="stat-value" id="moves">0</div>
        </div>
        <button class="btn-primary" id="newGameBtn">Новая игра</button>
      </div>
      <div class="match3-board" id="board"></div>
      <div class="match3-hint">
        Нажмите на символ, затем на соседний, чтобы поменять их местами
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.getElementById('newGameBtn').addEventListener('click', () => initGame());
  
  initGame();
}

function loadStyles() {
  if (!document.querySelector('link[href*="match3-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/match3-styles.css';
    document.head.appendChild(link);
  }
}

function initGame() {
  score = 0;
  moves = 0;
  selectedCell = null;
  updateStats();
  createGrid();
  renderGrid();
}

function createGrid() {
  grid = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    grid[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      grid[row][col] = getRandomIcon();
    }
  }
  
  // Удаляем начальные совпадения
  while (findMatches().length > 0) {
    removeMatches();
    fillEmptyCells();
  }
}

function getRandomIcon() {
  return ICONS[Math.floor(Math.random() * ICONS.length)];
}

function renderGrid() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'match3-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.textContent = grid[row][col];
      cell.addEventListener('click', () => onCellClick(row, col));
      board.appendChild(cell);
    }
  }
}

function onCellClick(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  
  if (!selectedCell) {
    selectedCell = { row, col };
    cell.classList.add('selected');
    soundSystem.click();
  } else {
    if (selectedCell.row === row && selectedCell.col === col) {
      cell.classList.remove('selected');
      selectedCell = null;
      return;
    }
    
    if (isAdjacent(selectedCell, { row, col })) {
      swap(selectedCell.row, selectedCell.col, row, col);
      document.querySelector('.selected')?.classList.remove('selected');
      
      const matches = findMatches();
      if (matches.length > 0) {
        soundSystem.ability();
        moves++;
        updateStats();
        processMatches();
      } else {
        soundSystem.error();
        // Возвращаем обратно
        setTimeout(() => {
          swap(selectedCell.row, selectedCell.col, row, col);
          renderGrid();
        }, 300);
      }
      
      selectedCell = null;
    } else {
      soundSystem.error();
      document.querySelector('.selected')?.classList.remove('selected');
      selectedCell = { row, col };
      cell.classList.add('selected');
    }
  }
}

function isAdjacent(cell1, cell2) {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function swap(row1, col1, row2, col2) {
  const temp = grid[row1][col1];
  grid[row1][col1] = grid[row2][col2];
  grid[row2][col2] = temp;
  renderGrid();
}

function findMatches() {
  const matches = [];
  
  // Горизонтальные совпадения
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      const icon = grid[row][col];
      let count = 1;
      for (let c = col + 1; c < GRID_SIZE && grid[row][c] === icon; c++) {
        count++;
      }
      if (count >= MIN_MATCH) {
        for (let c = col; c < col + count; c++) {
          matches.push({ row, col: c });
        }
      }
    }
  }
  
  // Вертикальные совпадения
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      const icon = grid[row][col];
      let count = 1;
      for (let r = row + 1; r < GRID_SIZE && grid[r][col] === icon; r++) {
        count++;
      }
      if (count >= MIN_MATCH) {
        for (let r = row; r < row + count; r++) {
          matches.push({ row: r, col });
        }
      }
    }
  }
  
  return matches;
}

function processMatches() {
  const matches = findMatches();
  if (matches.length === 0) return;
  
  removeMatches();
  score += matches.length * 10;
  updateStats();
  
  setTimeout(() => {
    fillEmptyCells();
    renderGrid();
    
    if (findMatches().length > 0) {
      setTimeout(() => processMatches(), 300);
    }
  }, 300);
}

function removeMatches() {
  const matches = findMatches();
  matches.forEach(({ row, col }) => {
    grid[row][col] = null;
  });
}

function fillEmptyCells() {
  // Падение
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (grid[row][col] === null) {
        for (let r = row - 1; r >= 0; r--) {
          if (grid[r][col] !== null) {
            grid[row][col] = grid[r][col];
            grid[r][col] = null;
            break;
          }
        }
      }
    }
  }
  
  // Заполнение пустых
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) {
        grid[row][col] = getRandomIcon();
      }
    }
  }
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('moves').textContent = moves;
}
