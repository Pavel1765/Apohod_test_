/** Улучшенная игра 3 в ряд с бонусами */

import { soundSystem } from '../hike-game/sounds.js';

const ICONS = ['⛰️', '🌲', '🏕️', '💧', '🧭', '🔬', '🎶', '📸', '⛑️'];
const DIAMOND_ICON = '💎';
const GRID_SIZE = 8;
const MIN_MATCH = 3;
const DIAMOND_SPAWN_CHANCE = 0.03; // 3% шанс появления алмаза

let grid = [];
let score = 0;
let moves = 0;
let diamonds = 5; // Алмазики для подсказок
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
          <p>Составляйте комбинации! Бонусы при 4+ совпадениях</p>
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
        <div class="stat-card special">
          <div class="stat-label">💎 Алмазы</div>
          <div class="stat-value" id="diamonds">5</div>
        </div>
        <button class="btn-hint" id="hintBtn" title="Подсказка (1 💎)">💡 Подсказка</button>
        <button class="btn-primary" id="newGameBtn">Новая игра</button>
      </div>
      <div class="match3-board" id="board"></div>
  <div class="match3-hint">
    <strong>Бонусы:</strong> 4 в ряд = 💣 Бомба (взрыв 3x3) | 5 в ряд = ⚡ Молния (крест) | 6+ = 🌟 Звезда (все иконки типа)<br>
    <strong>💎 Алмазы:</strong> Собирайте алмазы в ряд — каждый дает +1 💎 для подсказок! Появляются редко на поле.
  </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.getElementById('newGameBtn').addEventListener('click', () => initGame());
  document.getElementById('hintBtn').addEventListener('click', () => useHint());
  
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
  diamonds = 5;
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
      grid[row][col] = { icon: getRandomIcon(), bonus: null };
    }
  }
  
  while (findMatches().length > 0) {
    removeMatches();
    fillEmptyCells();
  }
}

function getRandomIcon() {
  // Небольшой шанс получить алмаз
  if (Math.random() < DIAMOND_SPAWN_CHANCE) {
    return DIAMOND_ICON;
  }
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
      
      const cellData = grid[row][col];
      if (cellData.bonus) {
        cell.classList.add('bonus-cell');
        cell.textContent = cellData.bonus;
      } else if (cellData.icon === DIAMOND_ICON) {
        cell.classList.add('diamond-cell');
        cell.textContent = cellData.icon;
      } else {
        cell.textContent = cellData.icon;
      }
      
      cell.addEventListener('click', () => onCellClick(row, col));
      board.appendChild(cell);
    }
  }
}

function onCellClick(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const cellData = grid[row][col];
  
  // Активация бонуса
  if (cellData.bonus) {
    activateBonus(row, col, cellData.bonus);
    soundSystem.artifact();
    return;
  }
  
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
        checkForBonuses(matches);
        processMatches();
      } else {
        soundSystem.error();
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

function activateBonus(row, col, bonusType) {
  grid[row][col] = { icon: null, bonus: null };
  
  if (bonusType === '💣') {
    // Бомба - взрывает 3x3 область
    soundSystem.dice(); // Звук взрыва
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          grid[r][c] = { icon: null, bonus: null };
        }
      }
    }
    score += 50;
  } else if (bonusType === '⚡') {
    // Молния - убирает всю линию по горизонтали и вертикали
    soundSystem.ability(); // Звук молнии
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[row][c] = { icon: null, bonus: null };
    }
    for (let r = 0; r < GRID_SIZE; r++) {
      grid[r][col] = { icon: null, bonus: null };
    }
    score += 100;
  } else if (bonusType === '🌟') {
    // Звезда - убирает все иконки одного типа
    soundSystem.victory(); // Звук звезды
    const targetIcon = getRandomIcon();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].icon === targetIcon) {
          grid[r][c] = { icon: null, bonus: null };
        }
      }
    }
    score += 75;
  }
  
  updateStats();
  setTimeout(() => {
    fillEmptyCells();
    renderGrid();
    setTimeout(() => processMatches(), 300);
  }, 300);
}

function checkForBonuses(matches) {
  const matchesByIcon = {};
  
  matches.forEach(m => {
    const icon = grid[m.row][m.col].icon;
    if (!matchesByIcon[icon]) matchesByIcon[icon] = [];
    matchesByIcon[icon].push(m);
  });
  
  for (const icon in matchesByIcon) {
    const iconMatches = matchesByIcon[icon];
    
    if (iconMatches.length === 5) {
      // 5 в ряд - молния
      const pos = iconMatches[2];
      grid[pos.row][pos.col] = { icon: null, bonus: '⚡' };
    } else if (iconMatches.length === 4) {
      // 4 в ряд - бомба
      const pos = iconMatches[1];
      grid[pos.row][pos.col] = { icon: null, bonus: '💣' };
    } else if (iconMatches.length >= 6) {
      // L или T форма - звезда
      const pos = iconMatches[Math.floor(iconMatches.length / 2)];
      grid[pos.row][pos.col] = { icon: null, bonus: '🌟' };
    }
  }
}

function useHint() {
  if (diamonds <= 0) {
    alert('Недостаточно алмазов! Заработайте больше очков.');
    soundSystem.error();
    return;
  }
  
  const hint = findPossibleMove();
  if (hint) {
    diamonds--;
    updateStats();
    soundSystem.click();
    
    const cell1 = document.querySelector(`[data-row="${hint.row1}"][data-col="${hint.col1}"]`);
    const cell2 = document.querySelector(`[data-row="${hint.row2}"][data-col="${hint.col2}"]`);
    
    cell1.classList.add('hint');
    cell2.classList.add('hint');
    
    setTimeout(() => {
      cell1.classList.remove('hint');
      cell2.classList.remove('hint');
    }, 2000);
  } else {
    alert('Нет доступных ходов! Перемешиваем поле...');
    shuffleGrid();
  }
}

function findPossibleMove() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      // Проверяем обмен с соседями
      const neighbors = [
        [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]
      ];
      
      for (const [nRow, nCol] of neighbors) {
        if (nRow >= 0 && nRow < GRID_SIZE && nCol >= 0 && nCol < GRID_SIZE) {
          swap(row, col, nRow, nCol);
          if (findMatches().length > 0) {
            swap(row, col, nRow, nCol);
            return { row1: row, col1: col, row2: nRow, col2: nCol };
          }
          swap(row, col, nRow, nCol);
        }
      }
    }
  }
  return null;
}

function shuffleGrid() {
  const icons = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].icon) icons.push(grid[row][col].icon);
    }
  }
  
  for (let i = icons.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [icons[i], icons[j]] = [icons[j], icons[i]];
  }
  
  let idx = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].icon) {
        grid[row][col].icon = icons[idx++];
      }
    }
  }
  
  renderGrid();
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
  
  // Горизонтальные
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      const cell = grid[row][col];
      if (!cell.icon || cell.bonus) continue;
      
      let count = 1;
      for (let c = col + 1; c < GRID_SIZE && grid[row][c].icon === cell.icon; c++) {
        count++;
      }
      if (count >= MIN_MATCH) {
        for (let c = col; c < col + count; c++) {
          matches.push({ row, col: c });
        }
      }
    }
  }
  
  // Вертикальные
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      const cell = grid[row][col];
      if (!cell.icon || cell.bonus) continue;
      
      let count = 1;
      for (let r = row + 1; r < GRID_SIZE && grid[r][col].icon === cell.icon; r++) {
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
  
  // Подсчитываем алмазы в матчах
  let diamondCount = 0;
  matches.forEach(({ row, col }) => {
    if (grid[row][col].icon === DIAMOND_ICON) {
      diamondCount++;
    }
  });
  
  // За каждый алмаз в матче дать бонус
  if (diamondCount > 0) {
    diamonds += diamondCount;
    soundSystem.artifact(); // Звук сбора алмазов
  }
  
  removeMatches();
  score += matches.length * 10;
  
  if (score % 100 === 0 && score > 0) {
    diamonds++;
  }
  
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
    grid[row][col] = { icon: null, bonus: null };
  });
}

function fillEmptyCells() {
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (!grid[row][col].icon && !grid[row][col].bonus) {
        for (let r = row - 1; r >= 0; r--) {
          if (grid[r][col].icon || grid[r][col].bonus) {
            grid[row][col] = grid[r][col];
            grid[r][col] = { icon: null, bonus: null };
            break;
          }
        }
      }
    }
  }
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col].icon && !grid[row][col].bonus) {
        grid[row][col] = { icon: getRandomIcon(), bonus: null };
      }
    }
  }
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('moves').textContent = moves;
  document.getElementById('diamonds').textContent = diamonds;
  
  const hintBtn = document.getElementById('hintBtn');
  if (hintBtn) {
    hintBtn.disabled = diamonds <= 0;
    hintBtn.style.opacity = diamonds <= 0 ? '0.5' : '1';
  }
}
