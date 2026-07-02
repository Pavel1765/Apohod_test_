/** Походная змейка - собираем походников и избегаем препятствий */

import { soundSystem } from '../hike-game/sounds.js';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 180;
const TARGET_LENGTH = 12;

const ITEMS = ['🏕️', '🧭', '🔥', '🎒']; // Только походные принадлежности
const OBSTACLES = [
  { icon: '🌲', name: 'tree' },
  { icon: '⛰️', name: 'mountain' },
  { icon: '🌊', name: 'river' }
];

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let item = null;
let obstacles = [];
let score = 0;
let gameLoop = null;
let speed = INITIAL_SPEED;
let moveCount = 0;
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
          <p>Собирайте походников и избегайте препятствий!</p>
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
  obstacles = [];
  score = 0;
  moveCount = 0;
  speed = INITIAL_SPEED;
  isPaused = false;
  gameOver = false;
  
  spawnItem();
  updateStats();
  renderBoard();
  
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(gameStep, speed);
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
  moveCount++;
  
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
  
  // Управление препятствиями
  updateObstacles();
  
  // Спавним новое препятствие каждые 6-9 ходов (чаще!)
  if (moveCount % (6 + Math.floor(Math.random() * 4)) === 0) {
    spawnObstacle();
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
  
  // Препятствия
  for (const obstacle of obstacles) {
    for (const cell of obstacle.cells) {
      if (cell.x === pos.x && cell.y === pos.y) {
        return true;
      }
    }
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

function spawnObstacle() {
  const head = snake[0];
  const obstacleType = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
  
  // 30% - 1 клетка, 40% - 2-3 клетки, 30% - большое препятствие 4-6 клеток
  const rand = Math.random();
  let size;
  if (rand < 0.3) size = 1;
  else if (rand < 0.7) size = 2 + Math.floor(Math.random() * 2); // 2-3
  else size = 4 + Math.floor(Math.random() * 3); // 4-6
  
  const lifetime = 5 + Math.floor(Math.random() * 8); // 5-12 ходов (дольше!)
  
  let attempts = 0;
  while (attempts < 100) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    // Проверка: не ближе 4 клеток от головы (увеличил с 3)
    const distToHead = Math.abs(x - head.x) + Math.abs(y - head.y);
    if (distToHead < 4) {
      attempts++;
      continue;
    }
    
    const cells = generateObstacleShape(x, y, size, obstacleType.name);
    
    if (!cells || cells.length === 0) {
      attempts++;
      continue;
    }
    
    // Проверяем, что все клетки валидны
    let valid = true;
    for (const cell of cells) {
      if (cell.x < 0 || cell.x >= GRID_SIZE || cell.y < 0 || cell.y >= GRID_SIZE) {
        valid = false;
        break;
      }
      if (checkCollision(cell)) {
        valid = false;
        break;
      }
    }
    
    if (valid && !wouldBlockPath(cells)) {
      obstacles.push({
        cells,
        icon: obstacleType.icon,
        type: obstacleType.name,
        lifetime,
        age: 0
      });
      return;
    }
    
    attempts++;
  }
}

function generateObstacleShape(startX, startY, size, type) {
  const cells = [{ x: startX, y: startY }];
  
  if (size === 1) return cells;
  
  // Генерируем форму в зависимости от типа препятствия
  if (type === 'tree') {
    // Лес - случайный кластер
    const directions = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: -1 },
      { x: 1, y: -1 }, { x: -1, y: 1 }
    ];
    
    for (let i = 1; i < size; i++) {
      const lastCell = cells[cells.length - 1];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const newCell = { x: lastCell.x + dir.x, y: lastCell.y + dir.y };
      
      // Проверяем, что клетка еще не добавлена
      if (!cells.some(c => c.x === newCell.x && c.y === newCell.y)) {
        cells.push(newCell);
      }
    }
  } else if (type === 'mountain') {
    // Гора - компактный квадрат/прямоугольник
    const width = Math.ceil(Math.sqrt(size));
    const height = Math.ceil(size / width);
    
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width && cells.length < size; dx++) {
        if (dx === 0 && dy === 0) continue; // Уже добавлена стартовая клетка
        cells.push({ x: startX + dx, y: startY + dy });
      }
    }
  } else if (type === 'river') {
    // Река - линия
    const horizontal = Math.random() < 0.5;
    if (horizontal) {
      for (let i = 1; i < size; i++) {
        cells.push({ x: startX + i, y: startY });
      }
    } else {
      for (let i = 1; i < size; i++) {
        cells.push({ x: startX, y: startY + i });
      }
    }
  }
  
  return cells;
}

function wouldBlockPath(newObstacleCells) {
  // Простая проверка: не блокирует ли препятствие полностью путь
  // Проверяем, есть ли хотя бы 2 свободных направления вокруг головы змейки
  const head = snake[0];
  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];
  
  let freeDirections = 0;
  for (const dir of directions) {
    const testPos = { x: head.x + dir.x, y: head.y + dir.y };
    
    if (testPos.x < 0 || testPos.x >= GRID_SIZE || testPos.y < 0 || testPos.y >= GRID_SIZE) {
      continue;
    }
    
    let blocked = false;
    
    // Проверяем новое препятствие
    for (const cell of newObstacleCells) {
      if (cell.x === testPos.x && cell.y === testPos.y) {
        blocked = true;
        break;
      }
    }
    
    // Проверяем существующие препятствия
    if (!blocked) {
      for (const obstacle of obstacles) {
        for (const cell of obstacle.cells) {
          if (cell.x === testPos.x && cell.y === testPos.y) {
            blocked = true;
            break;
          }
        }
        if (blocked) break;
      }
    }
    
    // Проверяем змейку
    if (!blocked) {
      for (const segment of snake) {
        if (segment.x === testPos.x && segment.y === testPos.y) {
          blocked = true;
          break;
        }
      }
    }
    
    if (!blocked) freeDirections++;
  }
  
  return freeDirections < 2;
}

function updateObstacles() {
  obstacles = obstacles.filter(obstacle => {
    obstacle.age++;
    return obstacle.age < obstacle.lifetime;
  });
}

function endGame(victory) {
  gameOver = true;
  if (gameLoop) clearInterval(gameLoop);
  
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
          <button class="btn-primary" onclick="document.getElementById('newGameBtn').click()">Новый поход</button>
        </div>
      `;
      board.appendChild(victoryMsg);
    }, 300);
  } else {
    soundSystem.error();
    setTimeout(() => {
      alert(`Игра окончена! Собрано походников: ${snake.length}. Счет: ${score}`);
      initGame();
    }, 300);
  }
}

function updateStats() {
  document.getElementById('hikers').textContent = snake.length;
  document.getElementById('score').textContent = score;
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.width = `${GRID_SIZE * CELL_SIZE}px`;
  board.style.height = `${GRID_SIZE * CELL_SIZE}px`;
  board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
  board.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`;
  
  // Создаем все клетки
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.className = 'snake-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      board.appendChild(cell);
    }
  }
  
  // Рисуем змейку (походников)
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
  
  // Рисуем предмет
  if (item) {
    const cell = board.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
    if (cell) {
      cell.classList.add('item');
      cell.textContent = item.icon;
    }
  }
  
  // Рисуем препятствия
  obstacles.forEach(obstacle => {
    obstacle.cells.forEach(cell => {
      const cellEl = board.querySelector(`[data-x="${cell.x}"][data-y="${cell.y}"]`);
      if (cellEl) {
        cellEl.classList.add('obstacle');
        cellEl.textContent = obstacle.icon;
        
        // Добавляем индикатор времени жизни
        const remaining = obstacle.lifetime - obstacle.age;
        cellEl.style.opacity = 0.3 + (remaining / obstacle.lifetime) * 0.7;
      }
    });
  });
}
