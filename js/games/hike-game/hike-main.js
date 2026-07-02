/** Обертка для игры "В Поход!" */

import { initHikeUI } from './hike-ui.js';

export function renderHikeGame(container, onExit) {
  // Загружаем стили игры про поход
  if (!document.querySelector('link[href*="hike-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/hike-styles.css';
    document.head.appendChild(link);
  }
  
  container.innerHTML = '<div id="hike-app"></div>';
  
  const hikeApp = container.querySelector('#hike-app');
  initHikeUI(hikeApp, onExit);
}
