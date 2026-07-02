/** Главное меню выбора игр */

import { SHOP_ITEMS, getGameProgress, purchaseItem } from '../shop.js';

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
            <div class="shelf" id="shop-shelf"></div>
          </div>
          
          <!-- Рюкзак (справа) -->
          <div class="shop-column">
            <div class="shop-column-title">🎒 Мой рюкзак</div>
            <div class="backpack" id="backpack"></div>
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
  const shelf = container.querySelector('#shop-shelf');
  const backpack = container.querySelector('#backpack');
  const hint = container.querySelector('#next-item-hint');
  
  shelf.innerHTML = '';
  backpack.innerHTML = '';
  
  // Найти следующий доступный предмет
  const nextItem = SHOP_ITEMS.find(item => !progress.purchasedItems.includes(item.id));
  
  // Отображаем предметы
  SHOP_ITEMS.forEach(item => {
    const isPurchased = progress.purchasedItems.includes(item.id);
    const isNext = nextItem && nextItem.id === item.id;
    const isLocked = !isPurchased && !isNext;
    
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
    
    if (isNext && !isPurchased) {
      itemEl.addEventListener('click', (e) => {
        // Предотвращаем переворот при клике на покупку
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
    
    // Распределяем по колонкам
    if (isPurchased) {
      backpack.appendChild(itemEl);
    } else {
      shelf.appendChild(itemEl);
    }
  });
  
  // Подсказка
  if (nextItem) {
    hint.innerHTML = `
      <span class="highlight">Следующий предмет:</span> ${nextItem.icon} ${nextItem.name} - ${nextItem.price} 💰<br>
      <small>Зарабатывайте монеты в играх, чтобы купить снаряжение для похода!</small>
    `;
  } else {
    hint.innerHTML = `
      <span class="highlight">🎉 Поздравляем! Все снаряжение собрано!</span><br>
      <small>Вы полностью экипированы для любого похода!</small>
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
