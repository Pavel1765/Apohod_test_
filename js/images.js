/** Локальные изображения — лежат в assets/images/ (Unsplash / Wikimedia Commons) */

const LOCAL = {
  mountain: 'assets/images/mountain.jpg',
  lake: 'assets/images/lake.jpg',
  peaks: 'assets/images/peaks.jpg',
  camp: 'assets/images/camp.jpg',
  hike: 'assets/images/hike.jpg',
  bear: 'assets/images/bear.jpg',
  wolf: 'assets/images/wolf.jpg',
  climb: 'assets/images/climb.jpg',
  snow: 'assets/images/snow.jpg',
  kayak: 'assets/images/kayak.jpg',
  bus: 'assets/images/bus.jpg',
  plane: 'assets/images/plane.jpg',
  desert: 'assets/images/desert.jpg',
  forest: 'assets/images/forest.jpg',
  bottle: 'assets/images/bottle.jpg',
  fire: 'assets/images/fire.jpg',
  elbrus: 'assets/images/elbrus.jpg',
  baikal: 'assets/images/baikal.jpg',
};

/** Базовый путь сайта (GitHub Pages: /Apohod_test_/) */
export function getSiteBase() {
  const script = document.querySelector('script[src*="app.js"]');
  if (script) {
    const src = script.getAttribute('src') || '';
    const idx = src.indexOf('js/app.js');
    if (idx >= 0) return src.substring(0, idx);
  }
  const path = window.location.pathname;
  const m = path.match(/^(\/.+?\/)index\.html$/i) || path.match(/^(\/[^/]+\/)/);
  if (m) return m[1];
  return './';
}

export function assetPath(relativePath) {
  const clean = relativePath.replace(/^\//, '');
  const base = getSiteBase();
  return `${base}${clean}`.replace(/([^:]\/)\/+/g, '$1');
}

function img(key) {
  return assetPath(LOCAL[key] || LOCAL.mountain);
}

export const IMG = {
  mountain: img('mountain'),
  lake: img('lake'),
  peaks: img('peaks'),
  camp: img('camp'),
  hike: img('hike'),
  bear: img('bear'),
  wolf: img('wolf'),
  climb: img('climb'),
  snow: img('snow'),
  kayak: img('kayak'),
  bus: img('bus'),
  plane: img('plane'),
  desert: img('desert'),
  forest: img('forest'),
  bottle: img('bottle'),
  fire: img('fire'),
  elbrus: img('elbrus'),
  baikal: img('baikal'),
};

export const PLACEHOLDER_IMAGE = IMG.mountain;
export const RUSSIA_MAP_IMAGE = assetPath('assets/maps/russia-map.svg');

/** Картинка для карточки маршрута по id */
const ROUTE_IMAGE_KEYS = {
  1: 'peaks', 2: 'snow', 3: 'climb', 4: 'peaks', 5: 'mountain',
  6: 'baikal', 7: 'forest', 8: 'peaks', 9: 'elbrus', 10: 'mountain',
  11: 'lake', 12: 'forest', 13: 'snow', 14: 'mountain', 15: 'hike',
  16: 'climb', 17: 'elbrus', 18: 'forest', 19: 'forest', 20: 'desert',
  21: 'lake', 22: 'lake', 23: 'lake', 24: 'forest', 25: 'climb',
  26: 'peaks', 27: 'snow', 28: 'lake',
};

export function getRouteImage(routeId) {
  const key = ROUTE_IMAGE_KEYS[routeId] || 'mountain';
  return IMG[key];
}

/** SVG-картинка с emoji — запасной вариант */
export function sceneSvg(emoji, color1 = '#87CEEB', color2 = '#7FB069', label = '') {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/>` +
    `</linearGradient></defs>` +
    `<rect width="800" height="500" fill="url(#g)"/>` +
    `<text x="400" y="230" text-anchor="middle" font-size="110">${emoji}</text>` +
    (label ? `<text x="400" y="380" text-anchor="middle" font-size="28" fill="#fff" opacity="0.9">${label}</text>` : '') +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const SCENARIO_IMAGES = {
  fire: { url: IMG.fire, emoji: '🔥', colors: ['#FF7043', '#BF360C'] },
  bear: { url: IMG.bear, emoji: '🐻', colors: ['#8D6E63', '#4E342E'] },
  storm: { url: IMG.peaks, emoji: '⛈️', colors: ['#546E7A', '#263238'] },
  lost: { url: IMG.mountain, emoji: '🧭', colors: ['#78909C', '#37474F'] },
  river: { url: IMG.lake, emoji: '🌊', colors: ['#4FC3F7', '#0277BD'] },
  ice: { url: IMG.snow, emoji: '🧊', colors: ['#E1F5FE', '#81D4FA'] },
  forest: { url: IMG.forest, emoji: '🌲', colors: ['#66BB6A', '#2E7D32'] },
  camp: { url: IMG.camp, emoji: '⛺', colors: ['#7FB069', '#3D3894'] },
  heat: { url: IMG.bottle, emoji: '💧', colors: ['#FFD54F', '#FF8F00'] },
  snake: { url: IMG.forest, emoji: '🐍', colors: ['#8BC34A', '#33691E'] },
  lake: { url: IMG.peaks, emoji: '🛶', colors: ['#29B6F6', '#01579B'] },
  cold: { url: IMG.snow, emoji: '🥶', colors: ['#B3E5FC', '#0288D1'] },
  rock: { url: IMG.mountain, emoji: '🪨', colors: ['#90A4AE', '#455A64'] },
  night: { url: IMG.camp, emoji: '🌙', colors: ['#1A237E', '#311B92'] },
  injury: { url: IMG.hike, emoji: '🩹', colors: ['#EF5350', '#B71C1C'] },
  food: { url: IMG.camp, emoji: '🍲', colors: ['#FF8A65', '#D84315'] },
  snow: { url: IMG.snow, emoji: '❄️', colors: ['#ECEFF1', '#90CAF9'] },
  gas: { url: IMG.camp, emoji: '🔥', colors: ['#FF5722', '#BF360C'] },
  wolf: { url: IMG.wolf, emoji: '🐺', colors: ['#78909C', '#37474F'] },
  climb: { url: IMG.climb, emoji: '🧗', colors: ['#8D6E63', '#3E2723'] },
  hike: { url: IMG.hike, emoji: '🥾', colors: ['#A1887F', '#5D4037'] },
};

export function getScenarioImage(key) {
  return (SCENARIO_IMAGES[key] || SCENARIO_IMAGES.forest).url;
}

export function getScenarioFallback(key) {
  const item = SCENARIO_IMAGES[key] || SCENARIO_IMAGES.forest;
  return sceneSvg(item.emoji, item.colors[0], item.colors[1]);
}

export const OBSTACLE_IMAGES = {
  bus: IMG.bus,
  train: IMG.mountain,
  plane: IMG.plane,
  helicopter: IMG.plane,
  boat: IMG.peaks,
  kayak: IMG.kayak,
  lake: IMG.lake,
  river: IMG.lake,
  water: IMG.lake,
  waterfall: IMG.lake,
  geyser: IMG.peaks,
  hot: IMG.desert,
  ice: IMG.snow,
  snow: IMG.snow,
  snowflake: IMG.snow,
  glacier: IMG.snow,
  ski: IMG.snow,
  camp: IMG.camp,
  fire: IMG.fire,
  moon: IMG.peaks,
  tree: IMG.forest,
  flower: IMG.forest,
  bear: IMG.bear,
  deer: IMG.forest,
  fish: IMG.lake,
  seal: IMG.snow,
  rock: IMG.mountain,
  climb: IMG.climb,
  summit: IMG.mountain,
  mountain: IMG.mountain,
  peak: IMG.mountain,
  pass: IMG.mountain,
  volcano: IMG.peaks,
  photo: IMG.mountain,
  compass: IMG.forest,
  cable: IMG.mountain,
  church: IMG.camp,
  island: IMG.lake,
  site: IMG.mountain,
  museum: IMG.mountain,
  sunrise: IMG.peaks,
  sunset: IMG.peaks,
  trail: IMG.hike,
  entrance: IMG.hike,
  checkpoint: IMG.hike,
  shelter: IMG.camp,
  cave: IMG.mountain,
  wind: IMG.mountain,
  gas: IMG.peaks,
  ash: IMG.peaks,
  altitude: IMG.mountain,
  crevasse: IMG.snow,
  rope: IMG.climb,
  oxygen: IMG.mountain,
  avalanche: IMG.snow,
  knife: IMG.camp,
  thumbs: IMG.climb,
  horse: IMG.forest,
};

export function applyBackgroundImage(el, url, fallbackSvg) {
  if (!el) return;
  el.style.backgroundImage = `url('${url}')`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  const probe = new Image();
  probe.onerror = () => {
    el.style.backgroundImage = `url('${fallbackSvg}')`;
  };
  probe.src = url;
}

export function obstacleFallbackSvg(type, icon = '🏔️') {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) >>> 0;
  const palettes = [
    ['#87CEEB', '#7FB069'],
    ['#FFB347', '#FFCC33'],
    ['#B19CD9', '#8F59BB'],
    ['#FF8A65', '#E65100'],
    ['#80CBC4', '#00897B'],
    ['#90CAF9', '#3D3894'],
  ];
  const [c1, c2] = palettes[hash % palettes.length];
  return sceneSvg(icon, c1, c2);
}

export function getObstacleImage(type, icon = '🏔️') {
  return OBSTACLE_IMAGES[type] || obstacleFallbackSvg(type, icon);
}
