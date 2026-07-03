/** Главное меню выбора игр */

import { SHOP_ITEMS, getGameProgress, purchaseItem, getReadinessPercent } from '../shop.js';
import { soundSystem } from './hike-game/sounds.js';

const GAMES = [
  {
    id: 'scenarios',
    title: 'Походные ситуации',
    icon: '🧭',
    description: 'Примите правильное решение в реальной походной ситуации! 10 случайных испытаний, 3 сердца — пройдите маршрут до конца.',
    badge: '🆕 Новое'
  },
  {
    id: 'clicker',
    title: 'Походные маршруты',
    icon: '⛰️',
    description: 'Проходите маршруты, кликая на препятствия! Горы, реки, леса - преодолевайте все и получайте награды за походы.',
    badge: null
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
    id: 'arrows',
    title: 'Составитель маршрутов',
    icon: '🗺️',
    description: 'Проложите походный маршрут стрелками! Учитывайте горы и реки, ставьте палатки для восстановления энергии.',
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
    id: 'blockblast',
    title: 'Кемпинги',
    icon: '⛺',
    description: 'Размещайте походные палатки (фигуры) на карте маршрута! Заполняйте линии, чтобы освободить место для новых привалов.',
    badge: null
  }
];

export function renderMainMenu(container, onGameSelect) {
  soundSystem.init();
  const progress = getGameProgress();
  
  container.innerHTML = `
    <div class="main-page">
      <header class="header">
        <div class="header-top">
          <div class="logo-container">
            <div class="logo-waves">≈</div>
            <div class="logo-text">
              <h1>Больше, чем путешествие</h1>
            </div>
          </div>
          <nav class="main-nav">
            <a href="#games" class="nav-link scroll-link">🎮 Игры</a>
            <a href="#shop" class="nav-link scroll-link">🛒 Магазин</a>
            <a href="#about" class="nav-link scroll-link">🌐 О программе</a>
          </nav>
        </div>
      </header>
      
      <!-- Информационный блок о программе -->
      <div class="info-section" id="about">
        <div class="info-container">
          <div class="info-header">
            <h2>⛰️ Подготовьтесь к настоящему походу через игры!</h2>
            <p>Игровая платформа программы «Больше, чем путешествие» поможет вам развить навыки, необходимые для настоящих походов по России</p>
          </div>
          
          <div class="info-cards">
            <div class="info-card">
              <div class="info-icon">🧭</div>
              <h3>Логика и планирование</h3>
              <p>Маршрут, пазлы и Match-3 развивают стратегическое мышление и умение принимать быстрые решения на тропе</p>
            </div>
            
            <div class="info-card">
              <div class="info-icon">🎒</div>
              <h3>Подготовка снаряжения</h3>
              <p>Собирайте виртуальное походное снаряжение в магазине - каждый предмет основан на реальном туристическом оборудовании</p>
            </div>
            
            <div class="info-card">
              <div class="info-icon">🏔️</div>
              <h3>Походные маршруты</h3>
              <p>Проходите виртуальные маршруты по реальным местам России: Алтай, Байкал, Камчатка, Эльбрус и другие</p>
            </div>
            
            <div class="info-card">
              <div class="info-icon">🐍</div>
              <h3>Ориентирование</h3>
              <p>Змейка учит навигации на местности и умению избегать препятствий в условиях дикой природы</p>
            </div>
          </div>
          
          <div class="info-cta">
            <p><strong>Зарабатывайте монеты в играх</strong> и покупайте снаряжение для виртуальных походов!</p>
            <a href="https://morethantrip.ru" target="_blank" class="info-link">Узнать больше о программе →</a>
          </div>
        </div>
      </div>
      
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
      <div class="shop-section" id="shop">
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
      
      <!-- Секция с играми -->
      <div class="games-section" id="games">
        <h2 class="section-title">🎮 Выберите игру</h2>
        <div class="games-grid" id="games-grid"></div>
      </div>
      
      <footer class="footer">
        <p>
          Программа Росмолодёжи 
          <a href="https://morethantrip.ru" target="_blank" class="footer-link">«Больше, чем путежествие»</a>
        </p>
        <p style="margin-top: 8px; font-size: 12px; color: var(--brand-gray);">
          v5.44 • 2026 • Походные ситуации
        </p>
      </footer>
    </div>
  `;

  // Добавляем smooth scroll для навигации
  setTimeout(() => {
    const scrollLinks = container.querySelectorAll('.scroll-link');
    scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = container.querySelector(`#${targetId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }, 100);

  renderShop(container);
  renderGames(container, onGameSelect);
}

function renderShop(container) {
  const progress = getGameProgress();
  const shelfItems = container.querySelector('#shelf-items');
  const backpackItems = container.querySelector('#backpack-items');
  const hint = container.querySelector('#next-item-hint');
  
  if (!shelfItems || !backpackItems || !hint) {
    console.error('Shop elements not found');
    return;
  }
  
  shelfItems.innerHTML = '';
  backpackItems.innerHTML = '';
  
  // Обновляем прогресс-бар
  const readinessPercent = getReadinessPercent();
  const readinessPercentEl = container.querySelector('#readiness-percent');
  const readinessFillEl = container.querySelector('#readiness-fill');
  const itemsCountEl = container.querySelector('#items-count');
  
  if (readinessPercentEl) readinessPercentEl.textContent = `${readinessPercent}%`;
  if (readinessFillEl) readinessFillEl.style.width = `${readinessPercent}%`;
  if (itemsCountEl) itemsCountEl.textContent = `${progress.purchasedItems.length}/${SHOP_ITEMS.length}`;
  
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
      <div class="shop-item-card">
        <div class="shop-item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-visual">
            <div class="item-icon">${item.icon}</div>
            <div class="item-description">${item.description}</div>
          </div>
        </div>
        <div class="shop-item-footer">
          ${isPurchased ? 
            '<div class="item-status">✓ Куплено</div>' : 
            `<button type="button" class="item-price-btn" ${isLocked ? 'disabled' : ''}><span>💰</span> ${item.price}</button>`
          }
        </div>
      </div>
    `;
    
    if (!isPurchased && canAfford && !isLocked) {
      const priceBtn = itemEl.querySelector('.item-price-btn');
      if (priceBtn) {
        priceBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const result = purchaseItem(item.id);
          if (result.success) {
            soundSystem.click();
            itemEl.classList.add('just-purchased');
            setTimeout(() => renderShop(container), 800);
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
    
    const upBtn = container.querySelector('#shelf-up');
    const downBtn = container.querySelector('#shelf-down');
    if (upBtn) upBtn.disabled = shelfPage === 0;
    if (downBtn) downBtn.disabled = end >= shopItems.length;
  }
  
  // Функции навигации для рюкзака
  function updateBackpackView() {
    backpackItems.innerHTML = '';
    const start = backpackPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = ownedItems.slice(start, end);
    pageItems.forEach(item => backpackItems.appendChild(item));
    
    const upBtn = container.querySelector('#backpack-up');
    const downBtn = container.querySelector('#backpack-down');
    if (upBtn) upBtn.disabled = backpackPage === 0;
    if (downBtn) downBtn.disabled = end >= ownedItems.length;
  }
  
  // Обработчики кнопок
  const shelfUpBtn = container.querySelector('#shelf-up');
  const shelfDownBtn = container.querySelector('#shelf-down');
  const backpackUpBtn = container.querySelector('#backpack-up');
  const backpackDownBtn = container.querySelector('#backpack-down');
  
  if (shelfUpBtn) {
    shelfUpBtn.addEventListener('click', () => {
      if (shelfPage > 0) {
        shelfPage--;
        updateShelfView();
      }
    });
  }
  
  if (shelfDownBtn) {
    shelfDownBtn.addEventListener('click', () => {
      if ((shelfPage + 1) * itemsPerPage < shopItems.length) {
        shelfPage++;
        updateShelfView();
      }
    });
  }
  
  if (backpackUpBtn) {
    backpackUpBtn.addEventListener('click', () => {
      if (backpackPage > 0) {
        backpackPage--;
        updateBackpackView();
      }
    });
  }
  
  if (backpackDownBtn) {
    backpackDownBtn.addEventListener('click', () => {
      if ((backpackPage + 1) * itemsPerPage < ownedItems.length) {
        backpackPage++;
        updateBackpackView();
      }
    });
  }
  
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
