import { TERRAIN } from './data.js';

const EASY = ['plains', 'plains', 'forest', 'forest', 'water'];
const HARD = ['swamp', 'mountain'];

/** Соседи на сетке (4 направления + диагонали для связности) */
export function neighbors(col, row, cols, rows) {
  const list = [];
  const dirs = [
    [0, -1], [1, 0], [0, 1], [-1, 0],
    [1, -1], [-1, -1], [1, 1], [-1, 1],
  ];
  for (const [dc, dr] of dirs) {
    const nc = col + dc;
    const nr = row + dr;
    if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) list.push({ col: nc, row: nr });
  }
  return list;
}

function idx(col, row, cols) {
  return row * cols + col;
}

function dist(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function pickTerrain(col, row, cols, rows, center) {
  const d = dist({ col, row }, center) / (cols + rows);
  const hardChance = Math.min(0.55, 0.15 + d * 0.9);
  if (Math.random() < hardChance) return HARD[Math.floor(Math.random() * HARD.length)];
  return EASY[Math.floor(Math.random() * EASY.length)];
}

/** Генерация карты: база → промежуточная → цель по диагонали */
export function generateMap(sizeKey, MAP_SIZES) {
  const { cols, rows } = MAP_SIZES[sizeKey];
  const center = { col: Math.floor(cols / 2), row: Math.floor(rows / 2) };

  const base = { col: 0, row: rows - 1 };
  const mainGoal = { col: cols - 1, row: 0 };
  const midGoal = {
    col: Math.floor((base.col + mainGoal.col) / 2),
    row: Math.floor((base.row + mainGoal.row) / 2),
  };

  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = idx(col, row, cols);
      let type = pickTerrain(col, row, cols, rows, center);
      let special = null;

      if (col === base.col && row === base.row) {
        type = 'plains';
        special = 'base';
      } else if (col === midGoal.col && row === midGoal.row) {
        type = 'plains';
        special = 'mid';
      } else if (col === mainGoal.col && row === mainGoal.row) {
        type = 'plains';
        special = 'main';
      }

      tiles.push({
        id,
        col,
        row,
        terrain: type,
        special,
        revealed: special !== null,
        artifact: null,
      });
    }
  }

  // Разброс артефактов на закрытых плитках
  const hidden = tiles.filter((t) => !t.revealed);
  const loot = ['boat', 'hat', 'equipment', 'compass'].filter(
    (a) => !hidden.every((t) => t.artifact)
  );
  shuffle(hidden);
  loot.forEach((art, i) => {
    if (hidden[i]) hidden[i].artifact = art;
  });

  return { cols, rows, tiles, base: idx(base.col, base.row, cols), mid: idx(midGoal.col, midGoal.row, cols), main: idx(mainGoal.col, mainGoal.row, cols) };
}

export function getTile(map, id) {
  return map.tiles.find((t) => t.id === id);
}

export function adjacentIds(map, tileId) {
  const t = getTile(map, tileId);
  if (!t) return [];
  return neighbors(t.col, t.row, map.cols, map.rows).map((n) => idx(n.col, n.row, map.cols));
}

export function terrainInfo(type) {
  return TERRAIN[type] || TERRAIN.plains;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
