/** Игра Puzzle Breaks (блоки) */

import { soundSystem } from '../hike-game/sounds.js';
import { addCoins } from '../../shop.js';

const GRID_SIZE = 6;
const CELL_SIZE = 80;

let blocks = [];
let selectedBlock = null;
let moves = 0;
let level = 1;
let onExitCallback = null;

const LEVELS = [
  // Уровень 1 - простой
  [
    { id: 0, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true, color: '#E2602E' }, // целевой блок
    { id: 1, row: 0, col: 2, length: 2, isHorizontal: false, color: '#3D3894' },
    { id: 2, row: 3, col: 2, length: 3, isHorizontal: false, color: '#7FB069' },
    { id: 3, row: 0, col: 4, length: 2, isHorizontal: false, color: '#4E9FC4' },
  ],
  // Уровень 2 - средний
  [
    { id: 0, row: 2, col: 1, length: 2, isHorizontal: true, isTarget: true, color: '#E2602E' },
    { id: 1, row: 0, col: 0, length: 2, isHorizontal: false, color: '#3D3894' },
    { id: 2, row: 0, col: 3, length: 3, isHorizontal: false, color: '#7FB069' },
    { id: 3, row: 1, col: 4, length: 2, isHorizontal: false, color: '#4E9FC4' },
    { id: 4, row: 3, col: 0, length: 3, isHorizontal: true, color: '#E6A93C' },
    { id: 5, row: 5, col: 2, length: 2, isHorizontal: true, color: '#5A52B8' },
  ],
  // Уровень 3 - сложный
  [
    { id: 0, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true, color: '#E2602E' },
    { id: 1, row: 0, col: 2, length: 3, isHorizontal: false, color: '#3D3894' },
    { id: 2, row: 0, col: 3, length: 2, isHorizontal: true, color: '#7FB069' },
    { id: 3, row: 1, col: 5, length: 2, isHorizontal: false, color: '#4E9FC4' },
    { id: 4, row: 3, col: 3, length: 3, isHorizontal: false, color: '#E6A93C' },
    { id: 5, row: 4, col: 0, length: 2, isHorizontal: true, color: '#5A52B8' },
    { id: 6, row: 5, col: 4, length: 2, isHorizontal: true, color: '#A4C89A' },
  ],
];

export function renderPuzzleGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  container.innerHTML = `
    <div class="puzzle-game">
      <div class="puzzle-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="puzzle-title">
          <h1>🎯 Блоки</h1>
          <p>Пространственное мышление помогает правильно упаковать рюкзак!</p>
        </div>
      </div>
      <div class="puzzle-stats">
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
      <div class="puzzle-container">
        <div class="puzzle-board" id="board"></div>
        <div class="puzzle-exit">→</div>
      </div>
      <div class="puzzle-hint">
        Перетаскивайте блоки по вертикали или горизонтали, чтобы освободить путь
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
  if (!document.querySelector('link[href*="puzzle-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/puzzle-styles.css';
    document.head.appendChild(link);
  }
}

function initLevel() {
  moves = 0;
  selectedBlock = null;
  blocks = JSON.parse(JSON.stringify(LEVELS[level - 1]));
  document.getElementById('nextBtn').style.display = 'none';
  updateStats();
  renderBoard();
}

function resetLevel() {
  initLevel();
  soundSystem.click();
}

function nextLevel() {
  level = Math.min(level + 1, LEVELS.length);
  initLevel();
  soundSystem.click();
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.width = `${GRID_SIZE * CELL_SIZE}px`;
  board.style.height = `${GRID_SIZE * CELL_SIZE}px`;
  
  // Рисуем сетку
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'puzzle-cell';
    board.appendChild(cell);
  }
  
  // Рисуем блоки
  blocks.forEach(block => {
    const blockEl = document.createElement('div');
    blockEl.className = `puzzle-block ${block.isTarget ? 'target' : ''}`;
    blockEl.dataset.id = block.id;
    blockEl.style.backgroundColor = block.color;
    blockEl.style.left = `${block.col * CELL_SIZE}px`;
    blockEl.style.top = `${block.row * CELL_SIZE}px`;
    
    if (block.isHorizontal) {
      blockEl.style.width = `${block.length * CELL_SIZE - 10}px`;
      blockEl.style.height = `${CELL_SIZE - 10}px`;
    } else {
      blockEl.style.width = `${CELL_SIZE - 10}px`;
      blockEl.style.height = `${block.length * CELL_SIZE - 10}px`;
    }
    
    blockEl.addEventListener('mousedown', (e) => startDrag(e, block));
    blockEl.addEventListener('touchstart', (e) => startDrag(e, block));
    
    board.appendChild(blockEl);
  });
}

function startDrag(e, block) {
  e.preventDefault();
  selectedBlock = block;
  
  const startX = e.clientX || e.touches[0].clientX;
  const startY = e.clientY || e.touches[0].clientY;
  const startCol = block.col;
  const startRow = block.row;
  
  function onMove(e) {
    const currentX = e.clientX || e.touches[0].clientX;
    const currentY = e.clientY || e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    
    if (block.isHorizontal && Math.abs(deltaX) > 10) {
      const newCol = Math.round(startCol + deltaX / CELL_SIZE);
      moveBlock(block, startRow, newCol);
    } else if (!block.isHorizontal && Math.abs(deltaY) > 10) {
      const newRow = Math.round(startRow + deltaY / CELL_SIZE);
      moveBlock(block, newRow, startCol);
    }
  }
  
  function onEnd() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    
    if (selectedBlock && (selectedBlock.row !== startRow || selectedBlock.col !== startCol)) {
      moves++;
      updateStats();
      soundSystem.move();
      checkVictory();
    }
    
    selectedBlock = null;
    renderBoard();
  }
  
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove);
  document.addEventListener('touchend', onEnd);
}

function moveBlock(block, newRow, newCol) {
  if (canMove(block, newRow, newCol)) {
    block.row = newRow;
    block.col = newCol;
    renderBoard();
  }
}

function canMove(block, newRow, newCol) {
  // Проверка границ
  if (newRow < 0 || newCol < 0) return false;
  if (block.isHorizontal) {
    if (newCol + block.length > GRID_SIZE) return false;
  } else {
    if (newRow + block.length > GRID_SIZE) return false;
  }
  
  // Проверка пересечений с другими блоками
  for (let other of blocks) {
    if (other.id === block.id) continue;
    if (blocksOverlap(
      newRow, newCol, block.length, block.isHorizontal,
      other.row, other.col, other.length, other.isHorizontal
    )) {
      return false;
    }
  }
  
  return true;
}

function blocksOverlap(row1, col1, len1, hor1, row2, col2, len2, hor2) {
  for (let i = 0; i < len1; i++) {
    const r1 = hor1 ? row1 : row1 + i;
    const c1 = hor1 ? col1 + i : col1;
    
    for (let j = 0; j < len2; j++) {
      const r2 = hor2 ? row2 : row2 + j;
      const c2 = hor2 ? col2 + j : col2;
      
      if (r1 === r2 && c1 === c2) return true;
    }
  }
  return false;
}

function checkVictory() {
  const target = blocks.find(b => b.isTarget);
  if (target && target.row === 2 && target.col + target.length === GRID_SIZE) {
    soundSystem.victory();
    setTimeout(() => {
      const reward = level * 25;
      addCoins(reward);
      alert(`Уровень ${level} пройден за ${moves} ходов!\n💰 Заработано: ${reward} монет`);
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
