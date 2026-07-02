import {
  ROLES, WEATHER, ARTIFACTS, TEAM_CARDS, MAP_SIZES, PHASES,
} from './data.js';
import { getTile, adjacentIds, terrainInfo } from './map.js';
import {
  createLobbyState, currentPlayer, playerRole, rollD6, rollWeather,
  revealTile, scoutRevealAdjacent, canEnterTile, applyMove, computeStepPoints,
  checkVictory, nextPhase, endTurn, exchangeArtifacts, hasArtifact,
} from './engine.js';
import { soundSystem } from './sounds.js';

let state = null;
let selectedRoles = [];
let pendingReveal = null;
let pendingRescue = null;
let appContainer = null;
let onExitCallback = null;

const $ = (sel) => appContainer.querySelector(sel);
const app = () => appContainer;

export function initHikeUI(container, onExit) {
  appContainer = container;
  onExitCallback = onExit;
  soundSystem.init();
  renderLobby();
}

function renderLobby() {
  app().innerHTML = `
    <section class="screen lobby">
      <button class="btn ghost sm" id="exitLobbyBtn" style="position: absolute; top: 16px; left: 16px;">
        ← В меню
      </button>
      <header class="hero-mini">
        <div class="ridge">⛰ 🌲 🏕 🌲 ⛰</div>
        <h1>В Поход! <span style="font-size: 0.5em; opacity: 0.8;">v2.0 🎵</span></h1>
        <p class="lead">Кооперативное путешествие · 2–6 игроков · по очереди на одном устройстве</p>
      </header>
      <div class="panel">
        <label>Игроков в команде
          <select id="playerCount">${[2, 3, 4, 5, 6].map((n) => `<option value="${n}"${n === 3 ? ' selected' : ''}>${n}</option>`).join('')}</select>
        </label>
        <label>Размер карты
          <select id="mapSize">${Object.entries(MAP_SIZES).map(([k, v]) => `<option value="${k}">${v.label} (${v.tiles} плиток)</option>`).join('')}</select>
        </label>
      </div>
      <h2>Выберите роли <span class="hint">(необязательно — иначе случайно)</span></h2>
      <div class="role-pick" id="rolePick"></div>
      <button class="btn btn-lg" id="startBtn">В поход! 🚶</button>
    </section>`;

  const pick = $('#rolePick');
  ROLES.forEach((r) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'role-card';
    card.dataset.id = r.id;
    card.innerHTML = `<span class="emoji">${r.emoji}</span><strong>${r.name}</strong><small>${r.quote}</small>`;
    card.addEventListener('click', () => {
      soundSystem.click();
      toggleRole(r.id, card);
    });
    pick.appendChild(card);
  });

  $('#startBtn').addEventListener('click', () => {
    soundSystem.click();
    startGame();
  });

  $('#exitLobbyBtn')?.addEventListener('click', () => {
    onExitCallback();
  });
}

function toggleRole(id, el) {
  const count = +$('#playerCount').value;
  if (selectedRoles.includes(id)) {
    selectedRoles = selectedRoles.filter((r) => r !== id);
    el.classList.remove('selected');
    return;
  }
  if (selectedRoles.length >= count) return;
  selectedRoles.push(id);
  el.classList.add('selected');
}

function startGame() {
  const playerCount = +$('#playerCount').value;
  const mapSize = $('#mapSize').value;
  if (selectedRoles.length && selectedRoles.length !== playerCount) {
    alert(`Выберите ровно ${playerCount} ролей или сбросьте выбор.`);
    return;
  }
  state = createLobbyState(playerCount, mapSize, selectedRoles);
  selectedRoles = [];
  renderGame();
}

function renderGame() {
  if (state.gameOver) return renderVictory();

  const player = currentPlayer(state);
  const role = playerRole(state, player);
  const tile = getTile(state.map, player.tileId);

  app().innerHTML = `
    <div class="game-layout">
      <aside class="sidebar">
        <button class="btn ghost sm" id="exitBtn" style="width: 100%; margin-bottom: 12px;">
          ← В меню
        </button>
        <div class="brand">🏕 В Поход!</div>
        <button class="btn ghost sm sound-toggle" id="soundToggle" title="Вкл/выкл звук">
          ${soundSystem.enabled ? '🔊' : '🔇'} Звук
        </button>
        <div class="stat"><span>Тур</span><strong>${state.round}</strong></div>
        <div class="stat"><span>История</span><strong>${state.storyTokens} 🎖️</strong></div>
        <div class="weather-box ${state.weather ? '' : 'empty'}">
          <div class="label">Погода тура</div>
          ${state.weather ? `<div class="wx">${state.weather.emoji} ${state.weather.name}</div><small>${state.weather.effect}</small>` : '<small>Ещё не определена</small>'}
          ${state.weatherCancelled ? '<div class="badge">Привал отменил погоду</div>' : ''}
        </div>
        <div class="phase-list">${PHASES.map((p) => `<div class="phase ${p.id === state.phase ? 'active' : ''}">${p.label}</div>`).join('')}</div>
        <div class="log" id="log">${state.history.slice(-6).map((h) => `<div>${h}</div>`).join('')}</div>
      </aside>
      <main class="board-area">
        <div class="turn-banner">
          <span class="turn-who">${player.name} · ${role.emoji} ${role.name}</span>
          <span class="turn-phase">${PHASES.find((p) => p.id === state.phase)?.label}</span>
        </div>
        <div class="map-wrap"><div class="map" id="map" style="--cols:${state.map.cols}"></div></div>
        <div class="action-panel" id="actions"></div>
      </main>
      <aside class="roster">
        <h3>Команда</h3>
        ${state.players.map((p, i) => renderPlayerCard(p, i)).join('')}
        <h3>Командные карты</h3>
        ${state.teamCards.map((c) => `<div class="team-card ${state.teamCardsUsed.includes(c.id) ? 'used' : ''}">${c.emoji} ${c.name}</div>`).join('')}
      </aside>
    </div>`;

  $('#soundToggle')?.addEventListener('click', () => {
    soundSystem.toggle();
    soundSystem.click();
    renderGame();
  });

  $('#exitBtn')?.addEventListener('click', () => {
    if (confirm('Вы уверены? Прогресс игры будет потерян.')) {
      onExitCallback();
    }
  });

  renderMap();
  renderActions();
}

function renderPlayerCard(p, i) {
  const role = ROLES.find((r) => r.id === p.roleId);
  const active = i === state.currentPlayer ? 'active' : '';
  const arts = p.artifacts.map((a) => ARTIFACTS[a]?.emoji).join(' ');
  return `<div class="player-card ${active}">
    <div class="pc-head">${role.emoji} ${p.name}</div>
    <div class="pc-role">${role.name}</div>
    <div class="pc-meta">Усталость: ${p.fatigue} · ${arts || '—'}</div>
  </div>`;
}

function renderMap() {
  const mapEl = $('#map');
  const player = currentPlayer(state);
  const compass = hasArtifact(player, 'compass') || state.players.some((p) => hasArtifact(p, 'compass'));
  const isMoving = state.phase === 'move';
  const adjacents = isMoving ? adjacentIds(state.map, player.tileId) : [];

  state.map.tiles.forEach((tile) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'tile';
    el.dataset.id = tile.id;

    const hidden = !tile.revealed;
    const forestHide = hidden && !compass && isForestHidden(tile);
    const isAdjacent = adjacents.includes(tile.id);
    const canMove = isAdjacent && tile.revealed && canEnterTile(state, player, tile.id, state.movementLeft).ok;

    if (hidden && !forestHide && tile.special !== 'base') {
      el.classList.add('fog');
      el.innerHTML = '<span class="fog-mark">?</span>';
    } else if (forestHide) {
      el.classList.add('fog', 'forest-fog');
      el.innerHTML = '<span class="fog-mark">🌲</span>';
    } else {
      const terr = terrainInfo(tile.terrain);
      let label = terr.emoji;
      if (tile.special === 'base') label = '🏠';
      if (tile.special === 'mid') label = '⛳';
      if (tile.special === 'main') label = '🎯';
      el.innerHTML = `<span class="terr">${label}</span><span class="tname">${tile.special ? specialName(tile.special) : terr.name}</span>`;
      if (tile.artifact) el.innerHTML += '<span class="loot">✨</span>';
      el.classList.add(terr.kind);
      
      if (canMove) {
        el.classList.add('available');
      }
    }

    state.players.filter((p) => p.tileId === tile.id).forEach((p) => {
      const r = ROLES.find((x) => x.id === p.roleId);
      const pin = document.createElement('span');
      pin.className = `hiker ${p.id === state.currentPlayer ? 'current' : ''}`;
      pin.textContent = r.emoji;
      pin.title = p.name;
      el.appendChild(pin);
    });

    el.addEventListener('click', () => onTileClick(tile.id));
    mapEl.appendChild(el);
  });
}

function specialName(s) {
  return { base: 'База', mid: 'Промеж.', main: 'Цель' }[s] || s;
}

function isForestHidden(tile) {
  if (tile.revealed) return false;
  return state.map.tiles.some((t) => {
    if (!t.revealed || t.terrain !== 'forest') return false;
    return adjacentIds(state.map, t.id).includes(tile.id);
  });
}

function onTileClick(tileId) {
  const player = currentPlayer(state);

  if (pendingReveal === 'explorer') {
    revealTile(state, tileId);
    soundSystem.reveal();
    pendingReveal = null;
    renderGame();
    return;
  }

  if (pendingRescue !== null) {
    const target = state.players[pendingRescue];
    if (!adjacentIds(state.map, target.tileId).includes(tileId)) {
      soundSystem.error();
      return;
    }
    target.tileId = tileId;
    state.history.push(`Спасатель переместил ${target.name}.`);
    soundSystem.ability();
    pendingRescue = null;
    renderGame();
    return;
  }

  if (state.phase !== 'move') return;

  const tile = getTile(state.map, tileId);
  const hadArtifact = tile?.artifact;

  const res = applyMove(state, player, tileId);
  if (!res.ok) {
    soundSystem.error();
    flash(res.reason);
    return;
  }

  soundSystem.move();
  revealTile(state, tileId);

  if (hadArtifact && !tile.artifact) {
    soundSystem.artifact();
  }

  if (state.movementLeft <= 0 || getTile(state.map, tileId)?.terrain === 'mountain') {
    state.phase = 'effects';
  }
  checkVictory(state);
  renderGame();
}

function renderActions() {
  const box = $('#actions');
  const player = currentPlayer(state);
  const role = playerRole(state, player);

  if (state.phase === 'weather') {
    if (state.weather) {
      state.phase = 'role';
      renderGame();
      return;
    }
    box.innerHTML = `
      <p>Бросок 1: погода на весь тур команды.</p>
      <div class="dice-row">
        <button class="die" id="rollWeather">☁️</button>
        <button class="btn" id="skipWeather" disabled>Далее →</button>
      </div>`;
    $('#rollWeather').addEventListener('click', () => {
      state.weather = rollWeather();
      soundSystem.weather(state.weather.id);
      state.history.push(`Погода: ${state.weather.name}.`);
      scoutRevealAdjacent(state, player.id);
      $('#skipWeather').disabled = false;
      renderGame();
    });
    $('#skipWeather').addEventListener('click', () => {
      if (!state.weather) state.weather = rollWeather();
      soundSystem.click();
      state.phase = 'role';
      renderGame();
    });
    return;
  }

  if (state.phase === 'role') {
    box.innerHTML = `
      <p><b>Постоянное:</b> ${role.passive}</p>
      <p><b>Особое:</b> ${role.special}</p>
      <div class="btn-row">
        ${roleButtons(player, role)}
        <button class="btn ghost" id="skipRole">Пропустить →</button>
      </div>`;
    bindRoleButtons(player, role);
    $('#skipRole').addEventListener('click', () => { 
      soundSystem.click();
      state.phase = 'roll'; 
      renderGame(); 
    });
    return;
  }

  if (state.phase === 'roll') {
    box.innerHTML = `
      <p>Бросок 2: шаг игрока (макс. 2 броска за ход).</p>
      <div class="dice-row">
        <button class="die big" id="rollStep">${state.lastRoll || '?'}</button>
        ${state.rerollAvailable ? '<button class="btn ghost" id="reroll">Переброс</button>' : ''}
        <button class="btn" id="confirmRoll" ${state.lastRoll ? '' : 'disabled'}>К движению →</button>
      </div>`;
    $('#rollStep').addEventListener('click', () => {
      soundSystem.dice();
      state.lastRoll = rollD6();
      state.rerollAvailable = false;
      renderGame();
    });
    $('#reroll')?.addEventListener('click', () => {
      soundSystem.dice();
      state.lastRoll = rollD6();
      state.rerollAvailable = false;
      renderGame();
    });
    $('#confirmRoll').addEventListener('click', () => {
      soundSystem.click();
      state.movementLeft = computeStepPoints(state, player);
      state.phase = 'move';
      renderGame();
    });
    return;
  }

  if (state.phase === 'move') {
    box.innerHTML = `
      <p>Очков движения: <strong>${state.movementLeft}</strong> (бросок ${state.lastRoll})</p>
      <p class="hint">Нажмите на соседнюю открытую плитку. Сложные участки требуют больше очков.</p>
      <button class="btn ghost" id="endMove">Закончить движение →</button>`;
    $('#endMove').addEventListener('click', () => { 
      soundSystem.click();
      state.phase = 'effects'; 
      renderGame(); 
    });
    return;
  }

  if (state.phase === 'effects') {
    box.innerHTML = `
      <p>Эффекты местности и погоды применены.</p>
      <button class="btn" id="toCoop">Кооп-действие →</button>`;
    $('#toCoop').addEventListener('click', () => { 
      soundSystem.click();
      state.phase = 'coop'; 
      renderGame(); 
    });
    return;
  }

  if (state.phase === 'coop') {
    box.innerHTML = `
      <p>🤝 Кооп: обмен артефактами, командные карты.</p>
      <div class="coop-grid" id="coopGrid"></div>
      <button class="btn" id="endTurn">Передать ход →</button>`;
    renderCoop();
    $('#endTurn').addEventListener('click', () => { 
      soundSystem.turnChange();
      endTurn(state); 
      renderGame(); 
    });
  }
}

function roleButtons(player, role) {
  const btns = [];
  if (role.id === 'scout' && player.specialUsed < role.specialMax) {
    btns.push('<button class="btn" data-act="scout-special">Быстрый марш (+1 шаг)</button>');
  }
  if (role.id === 'explorer' && player.specialUsed < role.specialMax) {
    btns.push('<button class="btn" data-act="explorer-special">Разведка карты</button>');
  }
  if (role.id === 'camp' && !player.passiveUsedThisTurn) {
    btns.push('<button class="btn" data-act="camp-passive">Снять усталость</button>');
  }
  if (role.id === 'camp' && player.specialUsed < role.specialMax) {
    btns.push('<button class="btn" data-act="camp-special">Тёплый привал</button>');
  }
  if (role.id === 'atmosphere' && !player.atmosphereUsedThisRound) {
    btns.push('<button class="btn" data-act="atmo-passive">+1 шаг другому</button>');
  }
  if (role.id === 'atmosphere' && player.specialUsed < role.specialMax) {
    btns.push('<button class="btn" data-act="atmo-special">Отменить штраф</button>');
  }
  if (role.id === 'impressions' && player.specialUsed < role.specialMax && state.storyTokens >= 2) {
    btns.push('<button class="btn" data-act="impr-special">Памятный кадр (+2 шаг)</button>');
  }
  if (role.id === 'rescuer' && !player.passiveUsedThisTurn) {
    btns.push('<button class="btn" data-act="resc-passive">Снять штраф</button>');
  }
  if (role.id === 'rescuer' && player.specialUsed < role.specialMax) {
    btns.push('<button class="btn" data-act="resc-special">Спасательная операция</button>');
  }
  if (role.id === 'explorer' && !player.passiveUsedThisTurn) {
    btns.push('<button class="btn" data-act="expl-passive">Игнор сложной местности</button>');
  }
  if (role.id === 'scout' && !player.passiveUsedThisTurn) {
    btns.push('<button class="btn" data-act="scout-passive">Открыть соседнюю</button>');
  }
  return btns.join('');
}

function bindRoleButtons(player, role) {
  document.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      soundSystem.ability();
      const act = btn.dataset.act;
      if (act === 'scout-passive') {
        scoutRevealAdjacent(state, player.id);
        player.passiveUsedThisTurn = true;
      }
      if (act === 'scout-special') {
        player.specialUsed++;
        state.quickMarchBonus = 2;
        state.history.push('Разведчик: Быстрый марш!');
      }
      if (act === 'expl-passive') {
        player.ignoreHardThisTurn = true;
        player.passiveUsedThisTurn = true;
      }
      if (act === 'explorer-special') {
        pendingReveal = 'explorer';
        flash('Выберите любую закрытую плитку на карте');
        player.specialUsed++;
      }
      if (act === 'camp-passive') {
        const tired = state.players.find((p) => p.fatigue > 0);
        if (tired) { tired.fatigue--; state.history.push('Снята усталость.'); }
        player.passiveUsedThisTurn = true;
      }
      if (act === 'camp-special') {
        state.weatherCancelled = true;
        player.specialUsed++;
        state.history.push('Тёплый привал — погода отменена.');
      }
      if (act === 'atmo-passive') {
        state.movementLeft = (state.movementLeft || 0) + 1;
        player.atmosphereUsedThisRound = true;
        state.history.push('Хранитель атмосферы дал +1 к шагу.');
      }
      if (act === 'atmo-special') {
        player.specialUsed++;
        player.fatigue = Math.max(0, player.fatigue - 1);
        state.history.push('Негативный эффект отменён.');
      }
      if (act === 'impr-special') {
        state.storyTokens -= 2;
        state.impressionBonusActive = true;
        player.specialUsed++;
        state.history.push('Памятный кадр — бонус команде!');
      }
      if (act === 'resc-passive') {
        const hurt = state.players.find((p) => p.fatigue > 0) || player;
        hurt.fatigue = Math.max(0, hurt.fatigue - 1);
        player.passiveUsedThisTurn = true;
      }
      if (act === 'resc-special') {
        pendingRescue = state.players.findIndex((p) => p.id !== player.id);
        if (pendingRescue < 0) pendingRescue = player.id;
        player.specialUsed++;
        flash('Выберите соседнюю клетку для перемещения');
      }
      renderGame();
    });
  });
}

function renderCoop() {
  const grid = $('#coopGrid');
  const arts = [];
  state.players.forEach((p, from) => {
    p.artifacts.forEach((art) => {
      state.players.forEach((to, toIdx) => {
        if (from === toIdx) return;
        arts.push({ from, to: toIdx, art });
      });
    });
  });

  if (!arts.length) {
    grid.innerHTML = '<p class="hint">Нет артефактов для обмена — можно передать ход.</p>';
  } else {
    arts.forEach(({ from, to, art }) => {
      const b = document.createElement('button');
      b.className = 'btn ghost sm';
      b.textContent = `${state.players[from].name} → ${state.players[to].name}: ${ARTIFACTS[art].emoji}`;
      b.addEventListener('click', () => {
        soundSystem.click();
        exchangeArtifacts(state, from, to, art);
        renderGame();
      });
      grid.appendChild(b);
    });
  }

  state.teamCards.forEach((card) => {
    if (state.teamCardsUsed.includes(card.id)) return;
    const b = document.createElement('button');
    b.className = 'btn sm';
    b.textContent = `${card.emoji} ${card.name}`;
    b.addEventListener('click', () => {
      soundSystem.ability();
      useTeamCard(card);
    });
    grid.appendChild(b);
  });
}

function useTeamCard(card) {
  if (state.teamCardsUsed.includes(card.id)) return;
  state.teamCardsUsed.push(card.id);
  if (card.id === 'breath') {
    state.movementLeft += 1;
    state.history.push('Второе дыхание: +1 всем в туре.');
  }
  if (card.id === 'rest') {
    state.players.forEach((p) => { p.fatigue = 0; });
    state.history.push('Привал: усталость снята.');
  }
  if (card.id === 'unity') {
    state.rerollAvailable = true;
    state.history.push('Сплочённость: можно перебросить шаг.');
  }
  renderGame();
}

function renderVictory() {
  soundSystem.victory();
  const stars = '⭐'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
  app().innerHTML = `
    <section class="screen victory">
      <div class="ridge">⛰ 🌲 🏕 🌲 ⛰</div>
      <h1>Команда дошла до цели!</h1>
      <div class="stars-big">${stars}</div>
      <p class="story">${state.story}</p>
      <div class="victory-stats">
        <div><span>Туров</span><strong>${state.round}</strong></div>
        <div><span>Жетонов истории</span><strong>${state.storyTokens}</strong></div>
        <div><span>Игроков</span><strong>${state.playerCount}</strong></div>
      </div>
      <button class="btn btn-lg" id="again">Новый поход</button>
      <button class="btn ghost btn-lg" id="exitVictoryBtn" style="margin-top: 12px;">В меню</button>
    </section>`;
  $('#again').addEventListener('click', () => {
    soundSystem.click();
    renderLobby();
  });
  $('#exitVictoryBtn')?.addEventListener('click', () => {
    onExitCallback();
  });
}

function flash(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
