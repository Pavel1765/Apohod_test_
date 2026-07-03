/** Улучшенная игра 3 в ряд с бонусами, ракетами и способностями */

import { soundSystem } from '../hike-game/sounds.js';

const ICONS = ['⛰️', '🌲', '🏕️', '💧', '🧭', '🔬', '🎶', '📸', '⛑️'];
const DIAMOND_ICON = '💎';
const GRID_SIZE = 8;
const MIN_MATCH = 3;
const DIAMOND_SPAWN_CHANCE = 0.03;

let grid = [];
let score = 0;
let moves = 0;
let diamonds = 5;
let selectedCell = null;
let onExitCallback = null;
let isAnimating = false;
let activeAbility = null; // 'swap', 'remove', 'bomb'

const ABILITIES = [
  { id: 'swap', name: 'Поменять', icon: '🔄', cost: 3 },
  { id: 'remove', name: 'Убрать', icon: '🗑️', cost: 2 },
  { id: 'bomb', name: 'Бомба', icon: '💣', cost: 5 }
];

export function renderMatch3Game(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  container.innerHTML = `
    <div class="match3-game">
      <button class="btn-back game-back-btn" id="backBtn">← В меню</button>
      <div class="match3-header">
        <div class="match3-title">
          <h1>🧩 Три в Ряд</h1>
          <p>Развитие внимательности и быстрой реакции для сбора ягод и грибов</p>
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
      <div class="match3-container">
        <div class="match3-board" id="board"></div>
        <div class="match3-abilities" id="abilities">
          <h3>Способности</h3>
          <div class="abilities-list"></div>
        </div>
      </div>
      <div class="match3-hint">
        <strong>Бонусы:</strong> 4 в ряд = 💣 Бомба (взрыв 3x3) | 5 в ряд = 🚀 Ракета (линия) | L/T = 🌟 Звезда<br>
        <strong>💎 Алмазы:</strong> Собирайте алмазы в ряд — каждый дает +1 💎 для способностей!
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.getElementById('newGameBtn').addEventListener('click', () => initGame());
  document.getElementById('hintBtn').addEventListener('click', () => useHint());
  
  renderAbilities();
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

function renderAbilities() {
  const abilitiesList = document.querySelector('.abilities-list');
  abilitiesList.innerHTML = '';
  
  ABILITIES.forEach(ability => {
    const abilityEl = document.createElement('button');
    abilityEl.className = 'ability-btn';
    abilityEl.dataset.ability = ability.id;
    abilityEl.innerHTML = `
      <div class="ability-icon">${ability.icon}</div>
      <div class="ability-name">${ability.name}</div>
      <div class="ability-cost">${ability.cost} 💎</div>
    `;
    
    abilityEl.addEventListener('click', () => activateAbility(ability.id, ability.cost));
    abilitiesList.appendChild(abilityEl);
  });
}

function activateAbility(abilityId, cost) {
  if (isAnimating) return;
  
  if (diamonds < cost) {
    soundSystem.error();
    return;
  }
  
  if (activeAbility === abilityId) {
    // Отменяем активную способность
    activeAbility = null;
    document.querySelectorAll('.ability-btn').forEach(btn => btn.classList.remove('active'));
    soundSystem.click();
    return;
  }
  
  activeAbility = abilityId;
  diamonds -= cost;
  updateStats();
  soundSystem.ability();
  
  document.querySelectorAll('.ability-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ability === abilityId);
  });
}

function initGame() {
  score = 0;
  moves = 0;
  diamonds = 5;
  selectedCell = null;
  activeAbility = null;
  isAnimating = false;
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
  if (isAnimating) return;
  
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const cellData = grid[row][col];
  
  // Использование способностей
  if (activeAbility) {
    handleAbility(row, col);
    return;
  }
  
  // Активация бонуса
  if (cellData.bonus) {
    activateBonus(row, col, cellData.bonus);
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
      animateSwap(selectedCell.row, selectedCell.col, row, col, (valid) => {
        document.querySelector('.selected')?.classList.remove('selected');
        selectedCell = null;

        if (valid) {
          soundSystem.ability();
          moves++;
          updateStats();
          isAnimating = true;
          setTimeout(() => {
            checkForBonuses(findMatches());
            processMatches();
          }, 80);
        } else {
          soundSystem.error();
        }
      });
    } else {
      soundSystem.error();
      document.querySelector('.selected')?.classList.remove('selected');
      selectedCell = { row, col };
      cell.classList.add('selected');
    }
  }
}

function handleAbility(row, col) {
  const cellData = grid[row][col];
  
  if (activeAbility === 'remove') {
    // Убрать одну фигуру
    grid[row][col] = { icon: null, bonus: null };
    soundSystem.move();
    activeAbility = null;
    document.querySelectorAll('.ability-btn').forEach(btn => btn.classList.remove('active'));
    
    setTimeout(() => {
      fillEmptyCells();
      renderGrid();
      setTimeout(() => processMatches(), 300);
    }, 300);
    
  } else if (activeAbility === 'bomb') {
    // Взорвать область 3x3
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          grid[r][c] = { icon: null, bonus: null };
        }
      }
    }
    
    addExplosionAnimation(row, col);
    soundSystem.dice();
    score += 50;
    activeAbility = null;
    document.querySelectorAll('.ability-btn').forEach(btn => btn.classList.remove('active'));
    
    setTimeout(() => {
      fillEmptyCells();
      renderGrid();
      setTimeout(() => processMatches(), 300);
    }, 600);
    
  } else if (activeAbility === 'swap') {
    // Поменять местами
    if (!selectedCell) {
      selectedCell = { row, col };
      document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.add('selected');
    } else {
      swap(selectedCell.row, selectedCell.col, row, col);
      soundSystem.move();
      document.querySelector('.selected')?.classList.remove('selected');
      selectedCell = null;
      activeAbility = null;
      document.querySelectorAll('.ability-btn').forEach(btn => btn.classList.remove('active'));
      
      setTimeout(() => processMatches(), 300);
    }
  }
}

function addExplosionAnimation(row, col) {
  const board = document.getElementById('board');
  
  const explosion = document.createElement('div');
  explosion.className = 'explosion-effect';
  explosion.style.gridRow = row + 1;
  explosion.style.gridColumn = col + 1;
  explosion.textContent = '💥';
  board.appendChild(explosion);
  
  setTimeout(() => explosion.remove(), 600);
}

function activateBonus(row, col, bonusType) {
  grid[row][col] = { icon: null, bonus: null };
  isAnimating = true;
  
  if (bonusType === '💣') {
    // Бомба - взрывает 3x3 область
    addExplosionAnimation(row, col);
    soundSystem.dice();
    
    setTimeout(() => {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            grid[r][c] = { icon: null, bonus: null };
          }
        }
      }
      score += 50;
      updateStats();
      
      setTimeout(() => {
        fillEmptyCells();
        renderGrid();
        setTimeout(() => processMatches(), 300);
      }, 200);
    }, 400);
    
  } else if (bonusType === '🚀↔️' || bonusType === '🚀↕️') {
    // Ракета - убирает линию
    soundSystem.ability();
    
    if (bonusType === '🚀↔️') {
      // Горизонтальная
      for (let c = 0; c < GRID_SIZE; c++) {
        grid[row][c] = { icon: null, bonus: null };
      }
      addRocketAnimation(row, 'horizontal');
    } else {
      // Вертикальная
      for (let r = 0; r < GRID_SIZE; r++) {
        grid[r][col] = { icon: null, bonus: null };
      }
      addRocketAnimation(col, 'vertical');
    }
    
    score += 100;
    updateStats();
    
    setTimeout(() => {
      fillEmptyCells();
      renderGrid();
      setTimeout(() => processMatches(), 300);
    }, 600);
    
  } else if (bonusType === '🌟') {
    soundSystem.victory();
    const targetIcon = getRandomIcon();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].icon === targetIcon) {
          grid[r][c] = { icon: null, bonus: null };
        }
      }
    }
    score += 75;
    updateStats();
    
    setTimeout(() => {
      fillEmptyCells();
      renderGrid();
      setTimeout(() => processMatches(), 300);
    }, 300);
  }
}

function addRocketAnimation(index, direction) {
  const board = document.getElementById('board');
  
  const rocket = document.createElement('div');
  rocket.className = `rocket-effect ${direction}`;
  
  if (direction === 'horizontal') {
    rocket.style.gridRow = index + 1;
    rocket.style.gridColumn = '1 / -1';
  } else {
    rocket.style.gridColumn = index + 1;
    rocket.style.gridRow = '1 / -1';
  }
  
  rocket.textContent = '🚀';
  board.appendChild(rocket);
  
  setTimeout(() => rocket.remove(), 600);
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
      // 5 в ряд - ракета (проверяем направление)
      const isHorizontal = iconMatches.every(m => m.row === iconMatches[0].row);
      const pos = iconMatches[2];
      grid[pos.row][pos.col] = { icon: null, bonus: isHorizontal ? '🚀↔️' : '🚀↕️' };
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
    alert('Недостаточно алмазов!');
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

function swapCells(row1, col1, row2, col2) {
  const temp = grid[row1][col1];
  grid[row1][col1] = grid[row2][col2];
  grid[row2][col2] = temp;
}

function playSwapMotion(cell1, cell2, colDiff, rowDiff, done) {
  if (!cell1 || !cell2) {
    done?.();
    return;
  }

  cell1.classList.add('swapping');
  cell2.classList.add('swapping');
  cell1.classList.remove('swap-x', 'swap-y');
  cell2.classList.remove('swap-x', 'swap-y');
  cell1.style.removeProperty('--swap-x');
  cell1.style.removeProperty('--swap-y');
  cell2.style.removeProperty('--swap-x');
  cell2.style.removeProperty('--swap-y');

  if (colDiff !== 0) {
    cell1.style.setProperty('--swap-x', `${colDiff * 100}%`);
    cell2.style.setProperty('--swap-x', `${-colDiff * 100}%`);
    cell1.classList.add('swap-x');
    cell2.classList.add('swap-x');
  } else {
    cell1.style.setProperty('--swap-y', `${rowDiff * 100}%`);
    cell2.style.setProperty('--swap-y', `${-rowDiff * 100}%`);
    cell1.classList.add('swap-y');
    cell2.classList.add('swap-y');
  }

  setTimeout(done, 280);
}

function animateSwap(row1, col1, row2, col2, onComplete) {
  const board = document.getElementById('board');
  const colDiff = col2 - col1;
  const rowDiff = row2 - row1;

  const getCells = () => ({
    cell1: board.querySelector(`[data-row="${row1}"][data-col="${col1}"]`),
    cell2: board.querySelector(`[data-row="${row2}"][data-col="${col2}"]`)
  });

  const { cell1, cell2 } = getCells();
  playSwapMotion(cell1, cell2, colDiff, rowDiff, () => {
    swapCells(row1, col1, row2, col2);
    renderGrid();

    if (findMatches().length > 0) {
      onComplete?.(true);
      return;
    }

    const back = getCells();
    playSwapMotion(back.cell1, back.cell2, colDiff, rowDiff, () => {
      swapCells(row1, col1, row2, col2);
      renderGrid();
      onComplete?.(false);
    });
  });
}

function swap(row1, col1, row2, col2) {
  swapCells(row1, col1, row2, col2);
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
  if (matches.length === 0) {
    isAnimating = false;
    return;
  }

  matches.forEach(({ row, col }) => {
    document.querySelector(`[data-row="${row}"][data-col="${col}"]`)?.classList.add('matching');
  });
  
  let diamondCount = 0;
  matches.forEach(({ row, col }) => {
    if (grid[row][col].icon === DIAMOND_ICON) {
      diamondCount++;
    }
  });
  
  if (diamondCount > 0) {
    diamonds += diamondCount;
    soundSystem.artifact();
  }
  
  setTimeout(() => {
    removeMatches();
    score += matches.length * 10;
    
    if (score % 100 === 0 && score > 0) {
      diamonds++;
    }
    
    updateStats();
    
    setTimeout(() => {
      fillEmptyCells();
      renderGridWithAnimation();
      
      setTimeout(() => {
        if (findMatches().length > 0) {
          processMatches();
        } else {
          isAnimating = false;
        }
      }, 400);
    }, 150);
  }, 220);
}

function removeMatches() {
  const matches = findMatches();
  matches.forEach(({ row, col }) => {
    grid[row][col] = { icon: null, bonus: null };
  });
}

function fillEmptyCells() {
  // Сначала опускаем существующие фигуры
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
  
  // Затем заполняем пустые сверху
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col].icon && !grid[row][col].bonus) {
        grid[row][col] = { icon: getRandomIcon(), bonus: null };
      }
    }
  }
}

function renderGridWithAnimation() {
  const board = document.getElementById('board');
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (!cell) continue;
      
      const cellData = grid[row][col];
      
      // Добавляем класс для анимации падения
      cell.classList.add('falling');
      
      if (cellData.bonus) {
        cell.className = 'match3-cell bonus-cell falling';
        cell.textContent = cellData.bonus;
      } else if (cellData.icon === DIAMOND_ICON) {
        cell.className = 'match3-cell diamond-cell falling';
        cell.textContent = cellData.icon;
      } else {
        cell.className = 'match3-cell falling';
        cell.textContent = cellData.icon;
      }
      
      setTimeout(() => cell.classList.remove('falling'), 500);
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
  
  // Обновляем доступность способностей
  document.querySelectorAll('.ability-btn').forEach(btn => {
    const abilityId = btn.dataset.ability;
    const ability = ABILITIES.find(a => a.id === abilityId);
    const canAfford = diamonds >= ability.cost;
    btn.disabled = !canAfford;
    btn.style.opacity = canAfford ? '1' : '0.5';
  });
}
