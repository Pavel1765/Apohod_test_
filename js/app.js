/** Главное приложение с выбором игр */

import { renderMainMenu } from './games/main-menu.js';
import { renderHikeGame } from './games/hike-game/hike-main.js';
import { renderMatch3Game } from './games/match3/match3-main.js';
import { renderPuzzleGame } from './games/puzzle/puzzle-main.js';
import { renderArrowsGame } from './games/arrows/arrows-main.js';
import { renderBlockBlastGame } from './games/block-blast/block-blast-main.js';
import { renderCheckersGame } from './games/checkers/checkers-main.js';
import { renderSnakeGame } from './games/snake/snake-main.js';
import { renderHikeClickerGame } from './games/clicker/clicker-main.js';
import { renderScenariosGame } from './games/scenarios/scenarios-main.js';
import { renderGuides } from './guides/guides-main.js';

class GameApp {
  constructor() {
    this.currentGame = null;
    this.app = document.getElementById('app');
  }

  init() {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && this.isKnownScreen(hash)) {
      this.startGame(hash);
    } else {
      this.showMainMenu();
    }

    window.addEventListener('popstate', () => {
      const h = window.location.hash.replace(/^#/, '');
      if (h && this.isKnownScreen(h)) {
        this.startGame(h);
      } else {
        this.showMainMenu();
      }
    });
  }

  isKnownScreen(id) {
    return [
      'hike', 'snake', 'clicker', 'match3', 'puzzle', 'arrows',
      'blockblast', 'checkers', 'scenarios', 'guides',
    ].includes(id);
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
      case 'snake':
        renderSnakeGame(this.app, () => this.showMainMenu());
        break;
      case 'clicker':
        renderHikeClickerGame(this.app, () => this.showMainMenu());
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
      case 'checkers':
        renderCheckersGame(this.app, () => this.showMainMenu());
        break;
      case 'scenarios':
        renderScenariosGame(this.app, () => this.showMainMenu());
        break;
      case 'guides':
        renderGuides(this.app, () => this.showMainMenu());
        break;
      default:
        this.showMainMenu();
    }
  }
}

// Запуск приложения
const app = new GameApp();
app.init();
