/** Интерактивное демо на главной — одна ситуация без входа в игру */

import { SCENARIOS } from './scenarios/scenarios-data.js';
import { getScenarioImage, getScenarioFallback, applyBackgroundImage } from '../images.js';
import { soundSystem } from './hike-game/sounds.js';

const DEMO_SCENARIO = SCENARIOS[0];

export function mountDemoWidget(root) {
  if (!root) return;
  let answered = false;

  root.innerHTML = `
    <article class="demo-widget-card" id="demo-widget-card">
      <div class="demo-widget-image" id="demo-widget-image"></div>
      <div class="demo-widget-body">
        <h3 class="demo-widget-title">${DEMO_SCENARIO.title}</h3>
        <p class="demo-widget-text">${DEMO_SCENARIO.text}</p>
        <div class="demo-widget-choices">
          <button type="button" class="demo-choice" data-choice="A">${DEMO_SCENARIO.optionA}</button>
          <button type="button" class="demo-choice" data-choice="B">${DEMO_SCENARIO.optionB}</button>
        </div>
        <div class="demo-widget-feedback hidden" id="demo-widget-feedback"></div>
      </div>
    </article>
  `;

  const imageEl = root.querySelector('#demo-widget-image');
  applyBackgroundImage(
    imageEl,
    getScenarioImage(DEMO_SCENARIO.imageKey || 'fire'),
    getScenarioFallback(DEMO_SCENARIO.imageKey || 'fire'),
  );

  root.querySelectorAll('.demo-choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const choice = btn.dataset.choice;
      const correct = choice === DEMO_SCENARIO.correct;
      const feedback = root.querySelector('#demo-widget-feedback');

      root.querySelectorAll('.demo-choice').forEach((b) => {
        b.disabled = true;
        if (b.dataset.choice === DEMO_SCENARIO.correct) b.classList.add('correct');
        else if (b.dataset.choice === choice && !correct) b.classList.add('wrong');
      });

      if (correct) soundSystem.victory();
      else soundSystem.error();

      feedback.classList.remove('hidden');
      feedback.innerHTML = correct
        ? `<p class="demo-feedback-success">✅ <strong>Верно!</strong> Так в походе и поступают опытные туристы.</p>`
        : `<p class="demo-feedback-error">❌ <strong>Не совсем.</strong> ${DEMO_SCENARIO.wrongMsg}</p>
           <p class="demo-feedback-hint">Правильный вариант: «${DEMO_SCENARIO.correct === 'A' ? DEMO_SCENARIO.optionA : DEMO_SCENARIO.optionB}»</p>`;

      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'btn-secondary demo-retry-btn';
      retry.textContent = 'Попробовать ещё раз';
      retry.addEventListener('click', () => {
        soundSystem.click();
        mountDemoWidget(root);
      });
      feedback.appendChild(retry);
    });
  });
}
