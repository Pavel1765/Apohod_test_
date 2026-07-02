/** Главное меню выбора игр */

const GAMES = [
  {
    id: 'hike',
    title: 'В Поход!',
    icon: '🏕️',
    description: 'Кооперативная настольная игра о путешествии по карте. Работайте в команде, используйте способности ролей и доберитесь до цели!',
    badge: null
  },
  {
    id: 'blockblast',
    title: 'Block Blast',
    icon: '🎲',
    description: 'Размещайте походные палатки (фигуры) на карте маршрута! Заполняйте линии, чтобы освободить место для новых привалов.',
    badge: 'Новое'
  },
  {
    id: 'match3',
    title: 'Три в Ряд',
    icon: '🧩',
    description: 'Составляйте комбинации из трех или более одинаковых символов! Собирайте иконки местностей и ролей путешественников.',
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
      
      <div class="games-grid" id="games-grid"></div>
      
      <footer class="footer">
        <p>
          Программа Росмолодёжи 
          <a href="https://morethantrip.ru" target="_blank" class="footer-link">«Больше, чем путешествие»</a>
        </p>
        <p style="margin-top: 8px; font-size: 12px; color: var(--brand-gray);">
          v3.0 • 2026
        </p>
      </footer>
    </div>
  `;

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
