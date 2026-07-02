/** Игра-кликер с маршрутами */

import { soundSystem } from '../hike-game/sounds.js';
import { addCoins, getPurchasedItems, getClickPowerBonus } from '../../shop.js';

const ROUTES = [
  {
    id: 1,
    name: 'Поднебесные Зубья',
    location: 'Кузнецкий Алатау',
    elevation: 2178,
    season: '☀️ Лето',
    reward: 50,
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночевка', clicks: 5 },
      { type: 'bus', icon: '🚌', name: 'Дорога', clicks: 7 },
      { type: 'water', icon: '💧', name: 'Река', clicks: 8 },
      { type: 'knife', icon: '🔪', name: 'Привал', clicks: 6 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 10 },
      { type: 'thumbs', icon: '👍', name: 'Подъем', clicks: 12 },
      { type: 'snowflake', icon: '❄️', name: 'Снег', clicks: 9 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 8 },
      { type: 'summit', icon: '⛰️', name: 'Вершина!', clicks: 15 }
    ]
  },
  {
    id: 2,
    name: 'Алтайские горы',
    location: 'Горный Алтай',
    elevation: 3200,
    season: '🍂 Осень',
    reward: 75,
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночь', clicks: 6 },
      { type: 'bus', icon: '🚌', name: 'Переезд', clicks: 8 },
      { type: 'water', icon: '💧', name: 'Брод', clicks: 10 },
      { type: 'tree', icon: '🌲', name: 'Лес', clicks: 7 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 9 },
      { type: 'rock', icon: '🪨', name: 'Скалы', clicks: 12 },
      { type: 'wind', icon: '💨', name: 'Ветер', clicks: 10 },
      { type: 'fire', icon: '🔥', name: 'Костер', clicks: 8 },
      { type: 'camp', icon: '⛺', name: 'Базовый лагерь', clicks: 10 },
      { type: 'summit', icon: '🏔️', name: 'Пик!', clicks: 18 }
    ]
  },
  {
    id: 3,
    name: 'Байкальский хребет',
    location: 'Озеро Байкал',
    elevation: 2840,
    season: '❄️ Зима',
    reward: 100,
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Морозная ночь', clicks: 8 },
      { type: 'bus', icon: '🚌', name: 'Заброска', clicks: 9 },
      { type: 'ice', icon: '🧊', name: 'Лед', clicks: 12 },
      { type: 'snow', icon: '❄️', name: 'Снегопад', clicks: 10 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 11 },
      { type: 'wind', icon: '💨', name: 'Буран', clicks: 15 },
      { type: 'tree', icon: '🌲', name: 'Тайга', clicks: 9 },
      { type: 'fire', icon: '🔥', name: 'Обогрев', clicks: 10 },
      { type: 'camp', icon: '⛺', name: 'Зимовка', clicks: 12 },
      { type: 'lake', icon: '🏞️', name: 'Байкал', clicks: 14 },
      { type: 'summit', icon: '⛰️', name: 'Вершина!', clicks: 20 }
    ]
  },
  {
    id: 4,
    name: 'Камчатка',
    location: 'Вулканы Камчатки',
    elevation: 4750,
    season: '🌋 Круглый год',
    reward: 150,
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночлег', clicks: 10 },
      { type: 'helicopter', icon: '🚁', name: 'Заброска', clicks: 12 },
      { type: 'volcano', icon: '🌋', name: 'Вулкан', clicks: 15 },
      { type: 'hot', icon: '🔥', name: 'Горячие источники', clicks: 8 },
      { type: 'bear', icon: '🐻', name: 'Медведи', clicks: 14 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 12 },
      { type: 'rock', icon: '🪨', name: 'Лавовые поля', clicks: 16 },
      { type: 'gas', icon: '💨', name: 'Газы', clicks: 13 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 11 },
      { type: 'summit', icon: '🏔️', name: 'Кратер!', clicks: 25 }
    ]
  },
  {
    id: 5,
    name: 'Эльбрус',
    location: 'Кавказ',
    elevation: 5642,
    season: '⛷️ Весна',
    reward: 200,
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночной подъем', clicks: 12 },
      { type: 'bus', icon: '🚌', name: 'Подъезд', clicks: 10 },
      { type: 'cable', icon: '🚡', name: 'Канатка', clicks: 8 },
      { type: 'snow', icon: '❄️', name: 'Снежные поля', clicks: 15 },
      { type: 'ice', icon: '🧊', name: 'Ледник', clicks: 18 },
      { type: 'wind', icon: '💨', name: 'Сильный ветер', clicks: 16 },
      { type: 'altitude', icon: '😵', name: 'Высота', clicks: 20 },
      { type: 'crevasse', icon: '🕳️', name: 'Трещины', clicks: 14 },
      { type: 'camp', icon: '⛺', name: 'Высотный лагерь', clicks: 13 },
      { type: 'oxygen', icon: '💨', name: 'Кислород', clicks: 12 },
      { type: 'summit', icon: '🏔️', name: 'Вершина Эльбрус!', clicks: 30 }
    ]
  },
  {
    id: 6,
    name: 'Саяны',
    location: 'Западный Саян',
    elevation: 2875,
    season: '🌸 Весна',
    reward: 120,
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночевка', clicks: 9 },
      { type: 'bus', icon: '🚌', name: 'Переезд', clicks: 10 },
      { type: 'water', icon: '💧', name: 'Переправа', clicks: 13 },
      { type: 'tree', icon: '🌲', name: 'Тайга', clicks: 11 },
      { type: 'bear', icon: '🐻', name: 'Медвежьи следы', clicks: 12 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 10 },
      { type: 'rock', icon: '🪨', name: 'Скальный участок', clicks: 15 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 9 },
      { type: 'summit', icon: '⛰️', name: 'Вершина!', clicks: 22 }
    ]
  }
];

let currentRoute = null;
let currentObstacleIndex = 0;
let clicksRemaining = 0;
let totalClicks = 0;
let onExitCallback = null;

export function renderHikeClickerGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  showRouteSelection(container);
}

function showRouteSelection(container) {
  const purchasedItems = getPurchasedItems();
  const clickBonus = getClickPowerBonus();
  
  container.innerHTML = `
    <div class="clicker-game">
      <div class="clicker-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="clicker-title">
          <h1>⛰️ Походные маршруты</h1>
          <p>Выберите маршрут для прохождения</p>
        </div>
      </div>
      
      ${purchasedItems.length > 0 ? `
      <div class="equipment-display">
        <h3>🎒 Ваше снаряжение (Сила клика: ×${clickBonus.toFixed(2)})</h3>
        <div class="equipment-icons">
          ${purchasedItems.map(item => `<span class="equipment-icon" title="${item.name}">${item.icon}</span>`).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="routes-container" id="routes"></div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  
  const routesContainer = container.querySelector('#routes');
  ROUTES.forEach(route => {
    const routeCard = document.createElement('div');
    routeCard.className = 'route-card';
    routeCard.innerHTML = `
      <div class="route-header">
        <h2>⛰️ ${route.name}</h2>
        <div class="route-reward">💰 ${route.reward}</div>
      </div>
      <div class="route-info">
        <div class="route-detail">📍 ${route.location}</div>
        <div class="route-detail">📏 ${route.elevation} м</div>
        <div class="route-detail">${route.season}</div>
      </div>
      <div class="route-obstacles-preview">
        ${route.obstacles.map(o => o.icon).join(' ')}
      </div>
      <button class="btn-primary route-start-btn">Начать поход</button>
    `;
    
    routeCard.querySelector('.route-start-btn').addEventListener('click', () => {
      startRoute(container, route);
    });
    
    routesContainer.appendChild(routeCard);
  });
}

function startRoute(container, route) {
  currentRoute = route;
  currentObstacleIndex = 0;
  totalClicks = 0;
  clicksRemaining = route.obstacles[0].clicks;
  
  container.innerHTML = `
    <div class="clicker-game">
      <div class="clicker-header">
        <button class="btn-back" id="backBtn">← Выбор маршрута</button>
        <div class="clicker-title">
          <h1>⛰️ ${route.name}</h1>
          <p>${route.location} · ${route.elevation} м · ${route.season}</p>
        </div>
      </div>
      
      <div class="route-progress">
        <div class="progress-text">
          <span>Препятствий пройдено: <strong><span id="progress-count">0</span>/${route.obstacles.length}</strong></span>
          <span>Кликов: <strong id="total-clicks">0</strong></span>
        </div>
      </div>
      
      <div class="route-path" id="route-path"></div>
      
      <div class="current-obstacle-section">
        <div class="obstacle-card" id="obstacle-card">
          <div class="obstacle-icon" id="obstacle-icon">${route.obstacles[0].icon}</div>
          <div class="obstacle-name" id="obstacle-name">${route.obstacles[0].name}</div>
          <div class="obstacle-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
            </div>
            <div class="clicks-remaining" id="clicks-remaining">${clicksRemaining} кликов</div>
          </div>
          <button class="btn-primary btn-large" id="click-btn">👆 Кликать!</button>
        </div>
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => {
    showRouteSelection(container);
  });
  
  document.getElementById('click-btn').addEventListener('click', () => handleClick());
  
  renderRoutePath();
}

function renderRoutePath() {
  const pathContainer = document.getElementById('route-path');
  pathContainer.innerHTML = '';
  
  currentRoute.obstacles.forEach((obstacle, index) => {
    const obstacleEl = document.createElement('div');
    obstacleEl.className = `path-obstacle ${index < currentObstacleIndex ? 'completed' : ''} ${index === currentObstacleIndex ? 'active' : ''}`;
    obstacleEl.innerHTML = `
      <div class="path-icon">${obstacle.icon}</div>
      ${index < currentObstacleIndex ? '<div class="check-mark">✓</div>' : ''}
    `;
    pathContainer.appendChild(obstacleEl);
    
    // Добавляем пунктирную линию между препятствиями
    if (index < currentRoute.obstacles.length - 1) {
      const line = document.createElement('div');
      line.className = 'path-line';
      pathContainer.appendChild(line);
    }
  });
}

function handleClick() {
  const clickPower = getClickPowerBonus();
  const actualClicks = Math.max(1, Math.round(clickPower)); // Минимум 1 клик
  
  soundSystem.click();
  totalClicks++;
  clicksRemaining -= actualClicks;
  
  if (clicksRemaining < 0) clicksRemaining = 0;
  
  document.getElementById('total-clicks').textContent = totalClicks;
  document.getElementById('clicks-remaining').textContent = clicksRemaining;
  
  const obstacle = currentRoute.obstacles[currentObstacleIndex];
  const progress = ((obstacle.clicks - clicksRemaining) / obstacle.clicks) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
  
  // Анимация клика
  const btn = document.getElementById('click-btn');
  btn.classList.add('clicked');
  setTimeout(() => btn.classList.remove('clicked'), 150);
  
  // Показываем бонус
  if (clickPower > 1) {
    showClickBonus(actualClicks);
  }
  
  if (clicksRemaining <= 0) {
    completeObstacle();
  }
}

function showClickBonus(clicks) {
  const btn = document.getElementById('click-btn');
  const bonus = document.createElement('div');
  bonus.className = 'click-bonus';
  bonus.textContent = clicks > 1 ? `+${clicks}` : '+1';
  bonus.style.position = 'absolute';
  bonus.style.left = `${Math.random() * 80 + 10}%`;
  bonus.style.top = '50%';
  bonus.style.color = var(--brand-orange);
  bonus.style.fontWeight = 'bold';
  bonus.style.fontSize = '24px';
  bonus.style.animation = 'floatUp 1s ease-out forwards';
  bonus.style.pointerEvents = 'none';
  
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(bonus);
  setTimeout(() => bonus.remove(), 1000);
}

function completeObstacle() {
  soundSystem.move();
  currentObstacleIndex++;
  
  document.getElementById('progress-count').textContent = currentObstacleIndex;
  
  if (currentObstacleIndex >= currentRoute.obstacles.length) {
    completeRoute();
    return;
  }
  
  // Переход к следующему препятствию
  const nextObstacle = currentRoute.obstacles[currentObstacleIndex];
  clicksRemaining = nextObstacle.clicks;
  
  document.getElementById('obstacle-icon').textContent = nextObstacle.icon;
  document.getElementById('obstacle-name').textContent = nextObstacle.name;
  document.getElementById('clicks-remaining').textContent = clicksRemaining;
  document.getElementById('progress-fill').style.width = '0%';
  
  renderRoutePath();
}

function completeRoute() {
  soundSystem.victory();
  
  // Добавляем монеты
  addCoins(currentRoute.reward);
  
  setTimeout(() => {
    const container = document.querySelector('.clicker-game').parentElement;
    container.innerHTML = `
      <div class="clicker-game">
        <div class="victory-screen">
          <h1>🎉 Маршрут пройден! 🎉</h1>
          <div class="victory-stats">
            <p class="victory-route">⛰️ ${currentRoute.name}</p>
            <p>📍 ${currentRoute.location}</p>
            <p>📏 Высота: ${currentRoute.elevation} м</p>
            <p>👆 Всего кликов: ${totalClicks}</p>
            <p class="victory-reward">💰 Получено: ${currentRoute.reward} монет</p>
          </div>
          <div class="victory-buttons">
            <button class="btn-primary" id="newRouteBtn">Выбрать другой маршрут</button>
            <button class="btn-secondary" id="menuBtn">В главное меню</button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('newRouteBtn').addEventListener('click', () => {
      showRouteSelection(container);
    });
    
    document.getElementById('menuBtn').addEventListener('click', () => {
      onExitCallback();
    });
  }, 500);
}

function loadStyles() {
  if (!document.querySelector('link[href*="clicker-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/clicker-styles.css';
    document.head.appendChild(link);
  }
}
