/** Походная змейка - собираем походников и избегаем препятствий */

import { soundSystem } from '../hike-game/sounds.js';
import { addCoins } from '../../shop.js';
import { getResponsiveCellSize, onBoardResize } from '../../responsive-board.js';

const GRID_SIZE = 20;
const MAX_CELL_SIZE = 25;
let cellSize = MAX_CELL_SIZE;
let unbindResize = null;
const INITIAL_SPEED = 180;
const TARGET_LENGTH = 12;

const ITEMS = ['🏕️', '🧭', '🔥', '🎒']; // Только походные принадлежности
const TERRAIN_OBSTACLES = [
  { icon: '🌲', type: 'tree', spawn: 15 },
  { icon: '⛰️', type: 'mountain', spawn: 10 },
  { icon: '🌊', type: 'river', spawn: 8 }
];

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let item = null;
let terrainMap = []; // Постоянная карта местности
let score = 0;
let gameLoop = null;
let speed = INITIAL_SPEED;
let isPaused = false;
let gameOver = false;
let onExitCallback = null;

export function renderSnakeGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  container.innerHTML = `
    <div class="snake-game">
      <div class="snake-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="snake-title">
          <h1>🥾 Походная Змейка</h1>
          <p>Ориентирование на местности и быстрые решения - залог безопасности!</p>
        </div>
      </div>
      
      <div class="snake-stats">
        <div class="stat-card">
          <div class="stat-label">👥 Походники</div>
          <div class="stat-value" id="hikers">3</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Цель</div>
          <div class="stat-value">${TARGET_LENGTH}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Счет</div>
          <div class="stat-value" id="score">0</div>
        </div>
        <button class="btn-primary" id="pauseBtn">⏸️ Пауза</button>
        <button class="btn-primary" id="newGameBtn">🔄 Новая игра</button>
      </div>
      
      <div class="snake-board" id="board"></div>
      
      <div class="snake-controls">
        <div class="control-hint">
          <strong>Управление:</strong> Стрелки ← ↑ → ↓ или WASD | Пробел - пауза
        </div>
        <div class="mobile-controls" id="mobileControls">
          <button class="control-btn" data-dir="up">↑</button>
          <div class="control-row">
            <button class="control-btn" data-dir="left">←</button>
            <button class="control-btn" data-dir="down">↓</button>
            <button class="control-btn" data-dir="right">→</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => {
    stopGame();
    onExitCallback();
  });
  
  document.getElementById('newGameBtn').addEventListener('click', () => initGame());
  document.getElementById('pauseBtn').addEventListener('click', () => togglePause());
  
  document.addEventListener('keydown', handleKeyPress);
  
  // Мобильные кнопки управления
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir;
      handleMobileControl(dir);
    });
  });
  
  initGame();
  unbindResize = onBoardResize(() => {
    if (!gameOver) renderBoard();
  });
}

function loadStyles() {
  if (!document.querySelector('link[href*="snake-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/snake-styles.css';
    document.head.appendChild(link);
  }
}

function initGame() {
  snake = [
    { x: 3, y: 10 },
    { x: 2, y: 10 },
    { x: 1, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speed = INITIAL_SPEED;
  isPaused = false;
  gameOver = false;
  
  // Генерируем карту местности
  generateTerrain();
  
  spawnItem();
  updateStats();
  renderBoard();
  
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(gameStep, speed);
}

function generateTerrain() {
  terrainMap = [];
  
  // Создаем пустую карту
  for (let y = 0; y < GRID_SIZE; y++) {
    terrainMap[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      terrainMap[y][x] = null;
    }
  }
  
  // Размещаем препятствия по типам
  TERRAIN_OBSTACLES.forEach(terrain => {
    let placed = 0;
    let attempts = 0;
    
    while (placed < terrain.spawn && attempts < 200) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      
      // Проверяем, не занято ли место
      if (terrainMap[y][x] !== null) {
        attempts++;
        continue;
      }
      
      // Проверяем, не слишком ли близко к начальной позиции змейки
      const distToStart = Math.abs(x - 3) + Math.abs(y - 10);
      if (distToStart < 5) {
        attempts++;
        continue;
      }
      
      // Размещаем препятствие
      terrainMap[y][x] = { icon: terrain.icon, type: terrain.type };
      placed++;
      attempts++;
    }
  });
}

function stopGame() {
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
  document.removeEventListener('keydown', handleKeyPress);
}

function togglePause() {
  isPaused = !isPaused;
  const pauseBtn = document.getElementById('pauseBtn');
  pauseBtn.textContent = isPaused ? '▶️ Продолжить' : '⏸️ Пауза';
  soundSystem.click();
}

function handleKeyPress(e) {
  if (gameOver) return;
  
  const key = e.key.toLowerCase();
  
  // Пауза
  if (key === ' ' || key === 'escape') {
    e.preventDefault();
    togglePause();
    return;
  }
  
  if (isPaused) return;
  
  // Управление
  if ((key === 'arrowup' || key === 'w') && direction.y === 0) {
    nextDirection = { x: 0, y: -1 };
    e.preventDefault();
  } else if ((key === 'arrowdown' || key === 's') && direction.y === 0) {
    nextDirection = { x: 0, y: 1 };
    e.preventDefault();
  } else if ((key === 'arrowleft' || key === 'a') && direction.x === 0) {
    nextDirection = { x: -1, y: 0 };
    e.preventDefault();
  } else if ((key === 'arrowright' || key === 'd') && direction.x === 0) {
    nextDirection = { x: 1, y: 0 };
    e.preventDefault();
  }
}

function handleMobileControl(dir) {
  if (gameOver || isPaused) return;
  
  switch(dir) {
    case 'up':
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case 'down':
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case 'left':
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case 'right':
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
  }
}

function gameStep() {
  if (isPaused || gameOver) return;
  
  direction = nextDirection;
  
  // Двигаем змейку
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y
  };
  
  // Проверка столкновений
  if (checkCollision(newHead)) {
    endGame(false);
    return;
  }
  
  snake.unshift(newHead);
  
  // Проверка сбора предмета
  if (newHead.x === item.x && newHead.y === item.y) {
    score += 10;
    soundSystem.artifact();
    spawnItem();
    
    // Проверка победы
    if (snake.length >= TARGET_LENGTH) {
      endGame(true);
      return;
    }
  } else {
    snake.pop();
  }
  
  updateStats();
  renderBoard();
}

function checkCollision(pos) {
  // Стены
  if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
    return true;
  }
  
  // Сам себя
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === pos.x && snake[i].y === pos.y) {
      return true;
    }
  }
  
  // Препятствия на местности
  if (terrainMap[pos.y] && terrainMap[pos.y][pos.x] !== null) {
    return true;
  }
  
  return false;
}

function spawnItem() {
  let attempts = 0;
  while (attempts < 100) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    if (!checkCollision({ x, y })) {
      item = {
        x,
        y,
        icon: ITEMS[Math.floor(Math.random() * ITEMS.length)]
      };
      return;
    }
    attempts++;
  }
}

function endGame(victory) {
  gameOver = true;
  if (gameLoop) clearInterval(gameLoop);
  
  // Добавляем монеты в магазин
  const earnedCoins = Math.floor(score / 2); // 10 очков = 5 монет
  addCoins(earnedCoins);
  
  if (victory) {
    soundSystem.victory();
    setTimeout(() => {
      const board = document.getElementById('board');
      const victoryMsg = document.createElement('div');
      victoryMsg.className = 'snake-victory';
      victoryMsg.innerHTML = `
        <div class="victory-content">
          <h2>🎉 Поход пройден! 🎉</h2>
          <p>Вы собрали ${snake.length} походников!</p>
          <p>Счет: ${score}</p>
          <p style="color: var(--brand-orange); font-weight: bold;">💰 Заработано: ${earnedCoins} монет</p>
          <button class="btn-primary" onclick="document.getElementById('newGameBtn').click()">Новый поход</button>
          <button class="btn-secondary" onclick="document.getElementById('backBtn').click()">В магазин</button>
        </div>
      `;
      board.appendChild(victoryMsg);
    }, 300);
  } else {
    soundSystem.error();
    setTimeout(() => {
      alert(`Игра окончена! Собрано походников: ${snake.length}. Счет: ${score}\n💰 Заработано: ${earnedCoins} монет`);
      initGame();
    }, 300);
  }
}

function updateStats() {
  document.getElementById('hikers').textContent = snake.length;
  document.getElementById('score').textContent = score;
}

function updateCellSize() {
  cellSize = getResponsiveCellSize({
    gridSize: GRID_SIZE,
    maxCell: MAX_CELL_SIZE,
    minCell: 14,
    horizontalPadding: 24,
  });
}

function renderBoard() {
  updateCellSize();
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.width = `${GRID_SIZE * cellSize}px`;
  board.style.height = `${GRID_SIZE * cellSize}px`;
  board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${cellSize}px)`;
  board.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${cellSize}px)`;
  
  // Создаем все клетки с местностью
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.className = 'snake-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      
      // Отрисовываем препятствия местности (всегда видны)
      const terrain = terrainMap[y][x];
      if (terrain) {
        cell.classList.add('terrain', terrain.type);
        cell.textContent = terrain.icon;
      }
      
      board.appendChild(cell);
    }
  }
  
  // Рисуем змейку (походников) - поверх местности
  snake.forEach((segment, index) => {
    const cell = board.querySelector(`[data-x="${segment.x}"][data-y="${segment.y}"]`);
    if (cell) {
      cell.classList.add('snake-segment');
      if (index === 0) {
        cell.classList.add('head');
        cell.innerHTML = '<div class="hiker-head">🧑‍🦰</div>';
      } else {
        cell.innerHTML = `<div class="hiker-body">${index % 2 === 0 ? '👤' : '👥'}</div>`;
      }
    }
  });
  
  // Рисуем предмет - поверх всего
  if (item) {
    const cell = board.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
    if (cell) {
      cell.classList.add('item');
      // Добавляем предмет как оверлей, чтобы не затереть местность
      const itemEl = document.createElement('div');
      itemEl.className = 'item-icon';
      itemEl.textContent = item.icon;
      cell.appendChild(itemEl);
    }
  }
}
