/** Игра Block Blast - тетрис-подобная игра */

import { soundSystem } from '../hike-game/sounds.js';

const GRID_SIZE = 8;
const CELL_SIZE = 50;

// Фигуры (тетромино и другие)
const SHAPES = [
  [[1]], // 1x1
  [[1, 1]], // 1x2
  [[1], [1]], // 2x1
  [[1, 1], [1, 1]], // квадрат 2x2
  [[1, 1, 1]], // 1x3 линия
  [[1], [1], [1]], // 3x1 линия
  [[1, 0], [1, 1]], // L
  [[1, 1], [1, 0]], // обратная L
  [[0, 1], [1, 1]], // Z
  [[1, 1], [0, 1]], // S
  [[1, 1, 1], [1, 0, 0]], // большая L
  [[1, 1, 1], [0, 0, 1]], // обратная большая L
  [[1, 1, 1], [0, 1, 0]], // T
];

let grid = [];
let score = 0;
let currentShapes = [];
let draggedShape = null;
let draggedShapeIndex = null;
let onExitCallback = null;

export function renderBlockBlastGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  container.innerHTML = `
    <div class="block-blast-game">
      <div class="block-blast-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="block-blast-title">
          <h1>🎲 Block Blast</h1>
          <p>Размещайте фигуры на поле и убирайте заполненные линии!</p>
        </div>
      </div>
      <div class="block-blast-stats">
        <div class="stat-card">
          <div class="stat-label">Очки</div>
          <div class="stat-value" id="score">0</div>
        </div>
        <button class="btn-primary" id="newGameBtn">Новая игра</button>
      </div>
      <div class="block-blast-board" id="board"></div>
      <div class="block-blast-shapes" id="shapes"></div>
      <div class="block-blast-hint">
        <p>🏕️ <strong>Походная механика:</strong> Размещайте палатки (фигуры) на карте!</p>
        <p>Заполните линию по горизонтали или вертикали, чтобы она исчезла ⛰️</p>
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.getElementById('newGameBtn').addEventListener('click', () => initGame());
  
  initGame();
}

function loadStyles() {
  if (!document.querySelector('link[href*="block-blast-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/block-blast-styles.css';
    document.head.appendChild(link);
  }
}

function initGame() {
  score = 0;
  grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
  updateScore();
  generateNewShapes();
  renderBoard();
  renderShapes();
}

function generateNewShapes() {
  currentShapes = [];
  for (let i = 0; i < 3; i++) {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    currentShapes.push(JSON.parse(JSON.stringify(randomShape)));
  }
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
  board.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'bb-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      if (grid[row][col] === 1) {
        cell.classList.add('filled');
        cell.textContent = '🏕️';
      }
      
      board.appendChild(cell);
    }
  }
}

function renderShapes() {
  const shapesContainer = document.getElementById('shapes');
  shapesContainer.innerHTML = '';
  
  currentShapes.forEach((shape, index) => {
    if (shape) {
      const shapeEl = document.createElement('div');
      shapeEl.className = 'bb-shape-container';
      
      const shapeGrid = document.createElement('div');
      shapeGrid.className = 'bb-shape';
      shapeGrid.style.gridTemplateColumns = `repeat(${shape[0].length}, 40px)`;
      shapeGrid.style.gridTemplateRows = `repeat(${shape.length}, 40px)`;
      
      shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          const cellEl = document.createElement('div');
          cellEl.className = 'bb-shape-cell';
          if (cell === 1) {
            cellEl.classList.add('active');
            cellEl.textContent = '🏕️';
          }
          shapeGrid.appendChild(cellEl);
        });
      });
      
      shapeEl.appendChild(shapeGrid);
      
      shapeEl.addEventListener('mousedown', (e) => startDrag(e, shape, index));
      shapeEl.addEventListener('touchstart', (e) => startDrag(e, shape, index));
      
      shapesContainer.appendChild(shapeEl);
    }
  });
}

function startDrag(e, shape, index) {
  e.preventDefault();
  draggedShape = shape;
  draggedShapeIndex = index;
  
  const ghost = createGhostShape(shape);
  document.body.appendChild(ghost);
  
  function onMove(e) {
    const x = e.clientX || e.touches?.[0]?.clientX;
    const y = e.clientY || e.touches?.[0]?.clientY;
    
    if (ghost && x && y) {
      ghost.style.left = `${x - 30}px`;
      ghost.style.top = `${y - 30}px`;
    }
    
    highlightValidPlacement(x, y, shape);
  }
  
  function onEnd(e) {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    
    if (ghost) ghost.remove();
    clearHighlights();
    
    const x = e.clientX || e.changedTouches?.[0]?.clientX;
    const y = e.clientY || e.changedTouches?.[0]?.clientY;
    
    if (x && y) {
      tryPlaceShape(x, y, shape, index);
    }
    
    draggedShape = null;
    draggedShapeIndex = null;
  }
  
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove);
  document.addEventListener('touchend', onEnd);
}

function createGhostShape(shape) {
  const ghost = document.createElement('div');
  ghost.className = 'bb-ghost';
  ghost.style.gridTemplateColumns = `repeat(${shape[0].length}, 40px)`;
  ghost.style.gridTemplateRows = `repeat(${shape.length}, 40px)`;
  
  shape.forEach((row) => {
    row.forEach((cell) => {
      const cellEl = document.createElement('div');
      if (cell === 1) {
        cellEl.className = 'bb-ghost-cell';
        cellEl.textContent = '🏕️';
      }
      ghost.appendChild(cellEl);
    });
  });
  
  return ghost;
}

function highlightValidPlacement(x, y, shape) {
  clearHighlights();
  
  const board = document.getElementById('board');
  const rect = board.getBoundingClientRect();
  
  const col = Math.floor((x - rect.left) / CELL_SIZE);
  const row = Math.floor((y - rect.top) / CELL_SIZE);
  
  if (canPlaceShape(row, col, shape)) {
    highlightCells(row, col, shape, 'valid');
  } else {
    highlightCells(row, col, shape, 'invalid');
  }
}

function highlightCells(row, col, shape, className) {
  shape.forEach((shapeRow, r) => {
    shapeRow.forEach((cell, c) => {
      if (cell === 1) {
        const targetRow = row + r;
        const targetCol = col + c;
        if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {
          const cellEl = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
          if (cellEl) cellEl.classList.add(className);
        }
      }
    });
  });
}

function clearHighlights() {
  document.querySelectorAll('.bb-cell').forEach(cell => {
    cell.classList.remove('valid', 'invalid');
  });
}

function canPlaceShape(row, col, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c] === 1) {
        const targetRow = row + r;
        const targetCol = col + c;
        
        if (targetRow < 0 || targetRow >= GRID_SIZE || 
            targetCol < 0 || targetCol >= GRID_SIZE ||
            grid[targetRow][targetCol] === 1) {
          return false;
        }
      }
    }
  }
  return true;
}

function tryPlaceShape(x, y, shape, index) {
  const board = document.getElementById('board');
  const rect = board.getBoundingClientRect();
  
  const col = Math.floor((x - rect.left) / CELL_SIZE);
  const row = Math.floor((y - rect.top) / CELL_SIZE);
  
  if (canPlaceShape(row, col, shape)) {
    placeShape(row, col, shape);
    currentShapes[index] = null;
    soundSystem.move();
    
    checkAndClearLines();
    renderBoard();
    renderShapes();
    
    // Если все фигуры использованы, генерируем новые
    const allUsed = currentShapes.every(s => s === null);
    if (allUsed) {
      setTimeout(() => {
        generateNewShapes();
        renderShapes();
        soundSystem.ability();
      }, 500);
    } else {
      // Проверка на game over только если есть неиспользованные фигуры
      if (!hasValidMoves()) {
        setTimeout(() => {
          soundSystem.error();
          alert(`Игра окончена! Ваш счет: ${score}`);
          initGame();
        }, 600);
      }
    }
  } else {
    soundSystem.error();
  }
}

function placeShape(row, col, shape) {
  shape.forEach((shapeRow, r) => {
    shapeRow.forEach((cell, c) => {
      if (cell === 1) {
        grid[row + r][col + c] = 1;
      }
    });
  });
}

function checkAndClearLines() {
  let clearedLines = 0;
  const rowsToClear = [];
  const colsToClear = [];
  
  // Проверка горизонтальных линий
  for (let row = 0; row < GRID_SIZE; row++) {
    if (grid[row].every(cell => cell === 1)) {
      rowsToClear.push(row);
    }
  }
  
  // Проверка вертикальных линий
  for (let col = 0; col < GRID_SIZE; col++) {
    let isFull = true;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (grid[row][col] !== 1) {
        isFull = false;
        break;
      }
    }
    if (isFull) colsToClear.push(col);
  }
  
  // Очистка линий
  rowsToClear.forEach(row => {
    for (let col = 0; col < GRID_SIZE; col++) {
      grid[row][col] = 0;
    }
    clearedLines++;
  });
  
  colsToClear.forEach(col => {
    for (let row = 0; row < GRID_SIZE; row++) {
      grid[row][col] = 0;
    }
    clearedLines++;
  });
  
  if (clearedLines > 0) {
    soundSystem.artifact();
    score += clearedLines * 10 * clearedLines; // Бонус за комбо
    updateScore();
  }
}

function hasValidMoves() {
  for (const shape of currentShapes) {
    if (shape) {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (canPlaceShape(row, col, shape)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function updateScore() {
  document.getElementById('score').textContent = score;
}
