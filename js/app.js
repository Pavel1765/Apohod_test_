/** Главное приложение с выбором игр */

import { renderMainMenu } from './games/main-menu.js';
import { renderHikeGame } from './games/hike-game/hike-main.js';
import { renderMatch3Game } from './games/match3/match3-main.js';
import { renderPuzzleGame } from './games/puzzle/puzzle-main.js';
import { renderArrowsGame } from './games/arrows/arrows-main.js';
import { renderBlockBlastGame } from './games/block-blast/block-blast-main.js';

class GameApp {
  constructor() {
    this.currentGame = null;
    this.app = document.getElementById('app');
  }

  init() {
    this.showMainMenu();
    
    // Обработка навигации браузера
    window.addEventListener('popstate', () => {
      this.showMainMenu();
    });
  }

  showMainMenu() {
    this.currentGame = null;
    renderMainMenu(this.app, (gameId) => this.startGame(gameId));
  }

  startGame(gameId) {
    this.currentGame = gameId;
    this.app.innerHTML = '';
    
    // Добавляем в историю браузера
    history.pushState({ game: gameId }, '', `#${gameId}`);
    
    switch (gameId) {
      case 'hike':
        renderHikeGame(this.app, () => this.showMainMenu());
        break;
      case 'match3':
        renderMatch3Game(this.app, () => this.showMainMenu());
        break;
      case 'puzzle':
        renderPuzzleGame(this.app, () => this.showMainMenu());
        break;
      case 'arrows':
        renderArrowsGame(this.app, () => this.showMainMenu());
        break;
      case 'blockblast':
        renderBlockBlastGame(this.app, () => this.showMainMenu());
        break;
      default:
        this.showMainMenu();
    }
  }
}

// Запуск приложения
const app = new GameApp();
app.init();
