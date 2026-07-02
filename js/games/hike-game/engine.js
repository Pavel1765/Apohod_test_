import {
  ROLES, WEATHER, ARTIFACTS, TEAM_CARDS, MAP_SIZES, STORY_SNIPPETS, PHASES,
} from './data.js';
import { generateMap, getTile, adjacentIds, terrainInfo } from './map.js';

export function createLobbyState(playerCount, mapSize, selectedRoles) {
  const roles = selectedRoles.length
    ? selectedRoles.map((id) => ROLES.find((r) => r.id === id))
    : shuffle([...ROLES]).slice(0, playerCount);

  const players = roles.map((role, i) => ({
    id: i,
    name: `Игрок ${i + 1}`,
    roleId: role.id,
    tileId: null,
    artifacts: [...(role.startArtifacts || [])],
    fatigue: 0,
    specialUsed: 0,
    atmosphereUsedThisRound: false,
    atmosphereBonusGiven: false,
    ignoreHardThisTurn: false,
    passiveUsedThisTurn: false,
  }));

  const map = generateMap(mapSize, MAP_SIZES);
  const baseTile = map.tiles.find((t) => t.special === 'base');
  players.forEach((p) => { p.tileId = baseTile.id; });

  const teamCards = shuffle([...TEAM_CARDS]).slice(0, 2);

  return {
    playerCount,
    mapSize,
    map,
    players,
    currentPlayer: 0,
    round: 1,
    phase: 'weather',
    weather: null,
    weatherCancelled: false,
    stepPoints: 0,
    lastRoll: 0,
    movementLeft: 0,
    midVisited: false,
    storyTokens: 0,
    teamCards,
    teamCardsUsed: [],
    history: ['Команда вышла с Базы в поход!'],
    rolesUsed: new Set(),
    turnsTotal: 0,
    rerollAvailable: false,
    impressionBonusActive: false,
    quickMarchBonus: 0,
    gameOver: false,
    stars: 0,
    story: '',
  };
}

export function rollD6() {
  return 1 + Math.floor(Math.random() * 6);
}

export function rollWeather() {
  return WEATHER[Math.floor(Math.random() * WEATHER.length)];
}

export function currentPlayer(state) {
  return state.players[state.currentPlayer];
}

export function playerRole(state, player) {
  return ROLES.find((r) => r.id === player.roleId);
}

export function hasArtifact(player, id) {
  return player.artifacts.includes(id);
}

export function teamHasArtifact(state, id) {
  return state.players.some((p) => hasArtifact(p, id));
}

export function revealTile(state, tileId) {
  const tile = getTile(state.map, tileId);
  if (!tile || tile.revealed) return;
  tile.revealed = true;
  state.rolesUsed.add('impressions');
  state.storyTokens += 1;
  state.history.push(`Открыта новая плитка: ${terrainInfo(tile.terrain).name}.`);
}

export function scoutRevealAdjacent(state, playerId) {
  const player = state.players[playerId];
  const adj = adjacentIds(state.map, player.tileId);
  const hidden = adj.map((id) => getTile(state.map, id)).filter((t) => t && !t.revealed);
  if (hidden.length) revealTile(state, hidden[0].id);
}

/** Стоимость входа на плитку */
export function moveCost(state, player, toTileId) {
  const tile = getTile(state.map, toTileId);
  if (!tile) return Infinity;
  let cost = terrainInfo(tile.terrain).cost;

  if (tile.terrain === 'water' && (hasArtifact(player, 'boat') || teamHasArtifact(state, 'boat'))) {
    cost = 1;
  }

  if (terrainInfo(tile.terrain).kind === 'hard') {
    if (player.ignoreHardThisTurn) cost = Math.max(1, cost - 1);
    if (state.weather?.id === 'rain' && !state.weatherCancelled) cost += 1;
  }

  return cost;
}

export function canEnterTile(state, player, toTileId, movementLeft) {
  const tile = getTile(state.map, toTileId);
  if (!tile || !tile.revealed) return { ok: false, reason: 'Плитка закрыта' };

  const from = getTile(state.map, player.tileId);
  if (!adjacentIds(state.map, player.tileId).includes(toTileId)) {
    return { ok: false, reason: 'Не соседняя клетка' };
  }

  if (state.weather?.id === 'wind' && !state.weatherCancelled) {
    const mainGoal = getTile(state.map, state.map.main);
    const back = dist(mainGoal, tile) > dist(mainGoal, from);
    if (back && tile.id !== from.id) return { ok: false, reason: 'Ветер — нельзя назад' };
  }

  if (tile.terrain === 'swamp') {
    const equipped = hasArtifact(player, 'equipment') || player.ignoreHardThisTurn;
    if (!equipped && movementLeft < 6 && state.lastRoll !== 6) {
      return { ok: false, reason: 'Болото: нужна 6 или снаряжение' };
    }
  }

  const cost = moveCost(state, player, toTileId);
  if (cost > movementLeft) return { ok: false, reason: `Нужно ${cost} очков` };

  return { ok: true, cost };
}

function dist(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

export function applyMove(state, player, toTileId) {
  const check = canEnterTile(state, player, toTileId, state.movementLeft);
  if (!check.ok) return check;

  const tile = getTile(state.map, toTileId);
  const cost = check.cost;
  state.movementLeft -= cost;
  player.tileId = toTileId;
  state.rolesUsed.add(player.roleId);

  if (tile.special === 'mid') state.midVisited = true;
  if (tile.artifact && !state.players.some((p) => p.artifacts.includes(tile.artifact))) {
    player.artifacts.push(tile.artifact);
    state.history.push(`Найден артефакт: ${ARTIFACTS[tile.artifact].name}!`);
    tile.artifact = null;
  }

  if (tile.terrain === 'mountain' && !player.ignoreHardThisTurn) {
    state.movementLeft = 0;
    state.history.push('Горы остановили ход.');
  }

  if (tile.terrain === 'swamp' && !hasArtifact(player, 'equipment')) {
    player.fatigue += 1;
  }

  return { ok: true };
}

export function computeStepPoints(state, player) {
  let pts = state.lastRoll;

  if (state.weather?.id === 'sun' && !state.weatherCancelled) pts += 1;
  if (state.weather?.id === 'fog' && !state.weatherCancelled) pts = Math.max(1, pts - 1);

  const onPlains = getTile(state.map, player.tileId)?.terrain === 'plains';
  if (state.weather?.id === 'heat' && !state.weatherCancelled && onPlains && !hasArtifact(player, 'hat')) {
    pts = Math.max(1, pts - 1);
  }

  if (state.impressionBonusActive) pts += 2;
  if (state.quickMarchBonus) pts += state.quickMarchBonus;

  return pts;
}

export function checkVictory(state) {
  const allAtMain = state.players.every((p) => getTile(state.map, p.tileId)?.special === 'main');
  if (!allAtMain || !state.midVisited) return false;

  state.gameOver = true;
  state.stars = calcStars(state);
  state.story = buildStory(state);
  return true;
}

function calcStars(state) {
  let stars = 2;
  if (state.round <= 12 && state.storyTokens >= 3) stars = 3;
  else if (state.round > 20) stars = 1;

  const uniqueRoles = state.rolesUsed.size;
  if (stars === 3 && uniqueRoles < Math.min(4, state.playerCount)) stars = 2;

  return stars;
}

function buildStory(state) {
  const parts = shuffle([...STORY_SNIPPETS]).slice(0, 2);
  parts.push(`Команда из ${state.playerCount} человек дошла за ${state.round} туров.`);
  if (state.storyTokens >= 3) parts.push(`Собрано ${state.storyTokens} жетонов истории.`);
  return parts.join(' ');
}

export function endTurn(state) {
  state.turnsTotal += 1;
  state.impressionBonusActive = false;
  state.quickMarchBonus = 0;
  state.players.forEach((p) => {
    p.passiveUsedThisTurn = false;
    p.ignoreHardThisTurn = false;
    p.atmosphereBonusGiven = false;
  });

  const next = (state.currentPlayer + 1) % state.players.length;
  if (next === 0) {
    state.round += 1;
    state.weather = null;
    state.weatherCancelled = false;
    state.players.forEach((p) => { p.atmosphereUsedThisRound = false; });
  }

  state.currentPlayer = next;
  state.phase = 'weather';
  state.stepPoints = 0;
  state.lastRoll = 0;
  state.movementLeft = 0;
  state.rerollAvailable = false;
}

export function nextPhase(state) {
  const order = PHASES.map((p) => p.id);
  const i = order.indexOf(state.phase);
  if (i < order.length - 1) state.phase = order[i + 1];
  else endTurn(state);
}

export function exchangeArtifacts(state, fromId, toId, artifactId) {
  const from = state.players[fromId];
  const to = state.players[toId];
  if (!from.artifacts.includes(artifactId)) return false;
  from.artifacts = from.artifacts.filter((a) => a !== artifactId);
  to.artifacts.push(artifactId);
  state.history.push(`Обмен: ${ARTIFACTS[artifactId].name} передан игроку ${to.name}.`);
  return true;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
