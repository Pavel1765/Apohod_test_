/** Главное меню выбора игр */

import { SHOP_ITEMS, getGameProgress, purchaseItem, getReadinessPercent } from '../shop.js';

const GAMES = [
  {
    id: 'clicker',
    title: 'Походные маршруты',
    icon: '⛰️',
    description: 'Проходите маршруты, кликая на препятствия! Горы, реки, леса - преодолевайте все и получайте награды за походы.',
    badge: '🆕 Новое'
  },
  {
    id: 'hike',
    title: 'В Поход!',
    icon: '🏕️',
    description: 'Кооперативная настольная игра о путешествии по карте. Работайте в команде, используйте способности ролей и доберитесь до цели!',
    badge: null
  },
  {
    id: 'snake',
    title: 'Походная Змейка',
    icon: '🥾',
    description: 'Собирайте походников, избегайте препятствий и пройдите поход! Классическая змейка в походном стиле.',
    badge: null
  },
  {
    id: 'blockblast',
    title: 'Block Blast',
    icon: '🎲',
    description: 'Размещайте походные палатки (фигуры) на карте маршрута! Заполняйте линии, чтобы освободить место для новых привалов.',
    badge: null
  },
  {
    id: 'match3',
    title: 'Три в Ряд',
    icon: '🧩',
    description: 'Составляйте комбинации из трех или более одинаковых символов! Собирайте иконки местностей и ролей путешественников.',
    badge: null
  },
  {
    id: 'checkers',
    title: 'Шашки',
    icon: '♟️',
    description: 'Классическая игра в шашки! Играйте против умного ИИ на разной сложности или с другом на одном устройстве.',
    badge: null
  },
  {
    id: 'puzzle',
    title: 'Блоки',
    icon: '🎯',
    description: 'Головоломка с перемещением блоков. Освободите путь для выхода главного блока, перемещая остальные в правильном порядке.',
    badge: null
  },
  {
    id: 'arrows',
    title: 'Стрелки',
    icon: '➡️',
    description: 'Логическая игра со стрелками направлений. Нажимайте на стрелки в правильной последовательности, чтобы они могли выйти.',
    badge: null
  }
];

export function renderMainMenu(container, onGameSelect) {
  const progress = getGameProgress();
  
  container.innerHTML = `
    <div class="main-page">
      <header class="header">
        <div class="logo-container">
          <div class="logo-waves">≈</div>
          <div class="logo-text">
            <h1>Больше, чем путешествие</h1>
          </div>
        </div>
        <p class="header-subtitle">программа от росмолодёжь</p>
        <p class="header-tagline">Игровая платформа</p>
      </header>
      
      <!-- Прогресс-бар готовности -->
      <div class="readiness-bar">
        <div class="readiness-container">
          <div class="readiness-title">
            <h3>🎒 Готов к походу</h3>
            <div class="readiness-percent" id="readiness-percent">0%</div>
          </div>
          <div class="readiness-progress">
            <div class="readiness-fill" id="readiness-fill" style="width: 0%"></div>
            <div class="readiness-label">Собрано снаряжения: <span id="items-count">0/20</span></div>
          </div>
        </div>
      </div>
      
      <!-- Магазин предметов -->
      <div class="shop-section">
        <div class="shop-header">
          <div class="shop-title">
            <span style="font-size: 32px;">🎒</span>
            <h2>Походное снаряжение</h2>
          </div>
          <div class="coins-display">
            <span>💰</span>
            <span id="coins-value">${progress.coins}</span>
          </div>
        </div>
        
        <div class="shop-container">
          <!-- Магазин (слева) -->
          <div class="shop-column">
            <div class="shop-column-title">🏪 Магазин</div>
            <div class="shelf" id="shop-shelf">
              <div class="shelf-nav">
                <button class="shelf-nav-btn" id="shelf-up">▲</button>
                <button class="shelf-nav-btn" id="shelf-down">▼</button>
              </div>
              <div class="shelf-items-container" id="shelf-items"></div>
            </div>
          </div>
          
          <!-- Рюкзак (справа) -->
          <div class="shop-column">
            <div class="shop-column-title">🎒 Мой рюкзак</div>
            <div class="backpack" id="backpack">
              <div class="backpack-nav">
                <button class="backpack-nav-btn" id="backpack-up">▲</button>
                <button class="backpack-nav-btn" id="backpack-down">▼</button>
              </div>
              <div class="backpack-items-container" id="backpack-items"></div>
            </div>
          </div>
        </div>
        
        <div class="next-item-hint" id="next-item-hint"></div>
      </div>
      
      <div class="games-grid" id="games-grid"></div>
      
      <footer class="footer">
        <p>
          Программа Росмолодёжи 
          <a href="https://morethantrip.ru" target="_blank" class="footer-link">«Больше, чем путежествие»</a>
        </p>
        <p style="margin-top: 8px; font-size: 12px; color: var(--brand-gray);">
          v4.4 • 2026 • ⛰️ Новая игра!
        </p>
      </footer>
    </div>
  `;

  renderShop(container);
  renderGames(container, onGameSelect);
}

function renderShop(container) {
  const progress = getGameProgress();
  const shelfItems = container.querySelector('#shelf-items');
  const backpackItems = container.querySelector('#backpack-items');
  const hint = container.querySelector('#next-item-hint');
  
  shelfItems.innerHTML = '';
  backpackItems.innerHTML = '';
  
  // Обновляем прогресс-бар
  const readinessPercent = getReadinessPercent();
  container.querySelector('#readiness-percent').textContent = `${readinessPercent}%`;
  container.querySelector('#readiness-fill').style.width = `${readinessPercent}%`;
  container.querySelector('#items-count').textContent = `${progress.purchasedItems.length}/${SHOP_ITEMS.length}`;
  
  let shelfPage = 0;
  let backpackPage = 0;
  const itemsPerPage = 6;
  
  // Отображаем предметы
  const shopItems = [];
  const ownedItems = [];
  
  SHOP_ITEMS.forEach(item => {
    const isPurchased = progress.purchasedItems.includes(item.id);
    const canAfford = progress.coins >= item.price;
    const isLocked = !isPurchased && !canAfford;
    
    const itemEl = document.createElement('div');
    itemEl.className = `shop-item ${isPurchased ? 'purchased' : ''} ${isLocked ? 'locked' : ''}`;
    
    itemEl.innerHTML = `
      <div class="shop-item-inner">
        <div class="shop-item-front">
          <div class="item-icon">${item.icon}</div>
          <div class="item-name">${item.name}</div>
          ${isPurchased ? 
            '<div class="item-status">✓ Куплено</div>' : 
            `<div class="item-price"><span>💰</span>${item.price}</div>`
          }
        </div>
        <div class="shop-item-back">
          <div class="item-back-title">${item.icon} ${item.name}</div>
          <div class="item-description">${item.description}</div>
        </div>
      </div>
    `;
    
    // Покупка по клику на цену
    if (!isPurchased && canAfford) {
      const priceEl = itemEl.querySelector('.item-price');
      if (priceEl) {
        priceEl.style.cursor = 'pointer';
        priceEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const result = purchaseItem(item.id);
          if (result.success) {
            itemEl.classList.add('just-purchased');
            setTimeout(() => {
              renderShop(container);
            }, 800);
          } else {
            alert(result.message);
          }
        });
      }
    }
    
    // Распределяем по колонкам
    if (isPurchased) {
      ownedItems.push(itemEl);
    } else {
      shopItems.push(itemEl);
    }
  });
  
  // Функции навигации для магазина
  function updateShelfView() {
    shelfItems.innerHTML = '';
    const start = shelfPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = shopItems.slice(start, end);
    pageItems.forEach(item => shelfItems.appendChild(item));
    
    container.querySelector('#shelf-up').disabled = shelfPage === 0;
    container.querySelector('#shelf-down').disabled = end >= shopItems.length;
  }
  
  // Функции навигации для рюкзака
  function updateBackpackView() {
    backpackItems.innerHTML = '';
    const start = backpackPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = ownedItems.slice(start, end);
    pageItems.forEach(item => backpackItems.appendChild(item));
    
    container.querySelector('#backpack-up').disabled = backpackPage === 0;
    container.querySelector('#backpack-down').disabled = end >= ownedItems.length;
  }
  
  // Обработчики кнопок
  container.querySelector('#shelf-up').addEventListener('click', () => {
    if (shelfPage > 0) {
      shelfPage--;
      updateShelfView();
    }
  });
  
  container.querySelector('#shelf-down').addEventListener('click', () => {
    if ((shelfPage + 1) * itemsPerPage < shopItems.length) {
      shelfPage++;
      updateShelfView();
    }
  });
  
  container.querySelector('#backpack-up').addEventListener('click', () => {
    if (backpackPage > 0) {
      backpackPage--;
      updateBackpackView();
    }
  });
  
  container.querySelector('#backpack-down').addEventListener('click', () => {
    if ((backpackPage + 1) * itemsPerPage < ownedItems.length) {
      backpackPage++;
      updateBackpackView();
    }
  });
  
  // Первичная отрисовка
  updateShelfView();
  updateBackpackView();
  
  // Подсказка
  const unpurchasedCount = SHOP_ITEMS.length - progress.purchasedItems.length;
  if (unpurchasedCount > 0) {
    hint.innerHTML = `
      <span class="highlight">До похода осталось: ${unpurchasedCount} ${unpurchasedCount === 1 ? 'предмет' : unpurchasedCount < 5 ? 'предмета' : 'предметов'}</span><br>
      <small>Зарабатывайте монеты в играх! Предметы увеличивают силу клика в походах.</small>
    `;
  } else {
    hint.innerHTML = `
      <span class="highlight">🎉 Поздравляем! Все снаряжение собрано!</span><br>
      <small>Вы полностью экипированы для любого похода! Сила клика максимальна!</small>
    `;
  }
}

function renderGames(container, onGameSelect) {
  const gamesGrid = container.querySelector('#games-grid');
  
  GAMES.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      ${game.badge ? `<div class="game-card-badge">${game.badge}</div>` : ''}
      <div class="game-card-icon">${game.icon}</div>
      <div class="game-card-content">
        <h2 class="game-card-title">${game.title}</h2>
        <p class="game-card-description">${game.description}</p>
        <button class="game-card-button">Начать игру</button>
      </div>
    `;
    
    card.addEventListener('click', () => {
      onGameSelect(game.id);
    });
    
    gamesGrid.appendChild(card);
  });
}
