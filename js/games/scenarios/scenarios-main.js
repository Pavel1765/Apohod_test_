/** Походные ситуации — выбор правильного действия в реальных условиях */

import { soundSystem } from '../hike-game/sounds.js';
import { addCoins } from '../../shop.js';
import { pickRandomScenarios, HIKE_LENGTH, MAX_HEARTS } from './scenarios-data.js';

let onExitCallback = null;
let hearts = MAX_HEARTS;
let currentIndex = 0;
let hikeScenarios = [];
let answered = false;

export function renderScenariosGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  loadStyles();
  showIntro(container);
}

function loadStyles() {
  if (!document.querySelector('link[href*="scenarios-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/scenarios-styles.css';
    document.head.appendChild(link);
  }
}

function showIntro(container) {
  container.innerHTML = `
    <div class="scenarios-game">
      <button class="btn-back game-back-btn" id="backBtn">← В меню</button>
      <section class="scenarios-intro">
        <div class="scenarios-intro-icon">🧭</div>
        <h1>Походные ситуации</h1>
        <p class="scenarios-intro-lead">
          Пройдите поход из <strong>10 случайных ситуаций</strong> — реальных моментов из туристической практики.
        </p>
        <ul class="scenarios-rules">
          <li>❤️ У вас <strong>3 сердца</strong> — ошибки их отнимают</li>
          <li>⚠️ В опасных ситуациях (медведь, гроза…) ошибка забирает <strong>2 сердца</strong></li>
          <li>✅ Правильный выбор — идёте дальше по маршруту</li>
          <li>💰 Пройдите весь поход — получите монеты в магазин</li>
        </ul>
        <button class="btn-primary btn-lg" id="startBtn">Начать поход</button>
      </section>
    </div>
  `;

  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.getElementById('startBtn').addEventListener('click', () => {
    soundSystem.click();
    startHike(container);
  });
}

function startHike(container) {
  hearts = MAX_HEARTS;
  currentIndex = 0;
  answered = false;
  hikeScenarios = pickRandomScenarios(HIKE_LENGTH);
  renderRound(container);
}

function renderRound(container) {
  if (hearts <= 0) {
    renderDefeat(container);
    return;
  }
  if (currentIndex >= hikeScenarios.length) {
    renderVictory(container);
    return;
  }

  answered = false;
  const scenario = hikeScenarios[currentIndex];
  const progress = currentIndex + 1;

  container.innerHTML = `
    <div class="scenarios-game">
      <button class="btn-back game-back-btn" id="backBtn">← В меню</button>
      <header class="scenarios-header">
        <div class="scenarios-hearts" id="heartsDisplay">${renderHearts()}</div>
        <div class="scenarios-progress">
          <span>Ситуация ${progress} / ${HIKE_LENGTH}</span>
          <div class="scenarios-progress-bar">
            <div class="scenarios-progress-fill" style="width: ${(progress - 1) / HIKE_LENGTH * 100}%"></div>
          </div>
        </div>
      </header>

      <article class="scenario-card">
        ${scenario.dangerous ? '<div class="scenario-danger-badge">⚠️ Опасная ситуация</div>' : ''}
        <div class="scenario-image" style="background-image: url('${scenario.image}')"></div>
        <div class="scenario-body">
          <h2>${scenario.title}</h2>
          <p class="scenario-text">${scenario.text}</p>
          <div class="scenario-choices">
            <button class="scenario-choice" data-choice="A">${scenario.optionA}</button>
            <button class="scenario-choice" data-choice="B">${scenario.optionB}</button>
          </div>
        </div>
      </article>

      <div class="scenario-feedback hidden" id="feedback">
        <div class="scenario-feedback-inner" id="feedbackInner"></div>
        <button class="btn-primary" id="nextBtn">Дальше по маршруту</button>
      </div>
    </div>
  `;

  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  document.querySelectorAll('.scenario-choice').forEach((btn) => {
    btn.addEventListener('click', () => handleChoice(container, btn.dataset.choice));
  });
}

function renderHearts() {
  return Array.from({ length: MAX_HEARTS }, (_, i) =>
    i < hearts ? '❤️' : '🖤'
  ).join('');
}

function handleChoice(container, choice) {
  if (answered) return;
  answered = true;

  const scenario = hikeScenarios[currentIndex];
  const correct = choice === scenario.correct;
  const feedback = document.getElementById('feedback');
  const feedbackInner = document.getElementById('feedbackInner');

  document.querySelectorAll('.scenario-choice').forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.choice === scenario.correct) btn.classList.add('correct');
    else if (btn.dataset.choice === choice && !correct) btn.classList.add('wrong');
  });

  if (correct) {
    soundSystem.victory();
    feedbackInner.innerHTML = `
      <div class="feedback-icon">✅</div>
      <h3>Верно!</h3>
      <p>Вы приняли правильное решение и можете идти дальше.</p>
    `;
    feedback.classList.add('feedback-success');
  } else {
    soundSystem.error();
    const loss = scenario.dangerous ? 2 : 1;
    hearts = Math.max(0, hearts - loss);
    document.getElementById('heartsDisplay').innerHTML = renderHearts();

    feedbackInner.innerHTML = `
      <div class="feedback-icon">❌</div>
      <h3>Ошибка!</h3>
      <p>${scenario.wrongMsg}</p>
      <p class="feedback-hearts">−${loss} ${loss === 1 ? 'сердце' : 'сердца'}</p>
    `;
    feedback.classList.add('feedback-error');
  }

  feedback.classList.remove('hidden');

  document.getElementById('nextBtn').addEventListener('click', () => {
    soundSystem.click();
    currentIndex += 1;
    if (hearts <= 0) {
      renderDefeat(container);
    } else if (currentIndex >= hikeScenarios.length) {
      renderVictory(container);
    } else {
      renderRound(container);
    }
  });
}

function renderVictory(container) {
  const reward = 40 + hearts * 20;
  addCoins(reward);
  soundSystem.victory();

  container.innerHTML = `
    <div class="scenarios-game">
      <section class="scenarios-result victory">
        <div class="result-icon">🏕️</div>
        <h1>Поход пройден!</h1>
        <p>Вы справились со всеми 10 ситуациями и дошли до финиша.</p>
        <div class="result-stats">
          <div><span>Осталось сердец</span><strong>${renderHearts()}</strong></div>
          <div><span>Награда</span><strong>💰 ${reward}</strong></div>
        </div>
        <button class="btn-primary btn-lg" id="againBtn">Новый поход</button>
        <button class="btn-secondary btn-lg" id="menuBtn">В меню</button>
      </section>
    </div>
  `;

  document.getElementById('againBtn').addEventListener('click', () => {
    soundSystem.click();
    startHike(container);
  });
  document.getElementById('menuBtn').addEventListener('click', () => onExitCallback());
}

function renderDefeat(container) {
  soundSystem.error();

  container.innerHTML = `
    <div class="scenarios-game">
      <section class="scenarios-result defeat">
        <div class="result-icon">⛈️</div>
        <h1>Поход прерван</h1>
        <p>Сердца закончились. В настоящем походе такие ошибки могут стоить очень дорого — попробуйте ещё раз!</p>
        <div class="result-stats">
          <div><span>Пройдено</span><strong>${currentIndex} / ${HIKE_LENGTH}</strong></div>
        </div>
        <button class="btn-primary btn-lg" id="retryBtn">Попробовать снова</button>
        <button class="btn-secondary btn-lg" id="menuBtn">В меню</button>
      </section>
    </div>
  `;

  document.getElementById('retryBtn').addEventListener('click', () => {
    soundSystem.click();
    startHike(container);
  });
  document.getElementById('menuBtn').addEventListener('click', () => onExitCallback());
}
