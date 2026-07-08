/** Надёжные изображения: проверенные URL + SVG-запасные варианты */

const U = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

/** Проверенные рабочие фото (HTTP 200) */
export const IMG = {
  mountain: U('1464822759023-fed622ff2c3b'),
  lake: U('1439066615861-d1af74d74000'),
  peaks: U('1506905925346-21bda4d32df4'),
  camp: U('1504280390367-361c6d9f38f4'),
  hike: U('1551632811-561732d1e306'),
  bear: U('1589652717521-10c0d092dea9', 800, 500),
  wolf: U('1444464666168-49d633b86797', 800, 500),
  climb: U('1522163182402-834f871fd851'),
  snow: U('1551524559-8af4e6624178'),
  kayak: U('1544551763-46a013bb70d5'),
  bus: U('1544620347-c4fd4a3d5957'),
  plane: U('1436491865332-7a61a109cc05'),
  desert: U('1519904981063-b0cf448d479e'),
  forest: U('1518495973542-4542c06a5843', 800, 500),
  bottle: U('1542601906990-b4d3fb778b09', 800, 500),
};

export const PLACEHOLDER_IMAGE = IMG.mountain;
export const RUSSIA_MAP_IMAGE = 'assets/maps/russia-map.svg';

/** SVG-картинка с emoji — всегда работает офлайн */
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

/** Категории для походных ситуаций */
export const SCENARIO_IMAGES = {
  fire: { url: IMG.camp, emoji: '🔥', colors: ['#FF7043', '#BF360C'] },
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
  const item = SCENARIO_IMAGES[key] || SCENARIO_IMAGES.forest;
  return item.url;
}

export function getScenarioFallback(key) {
  const item = SCENARIO_IMAGES[key] || SCENARIO_IMAGES.forest;
  return sceneSvg(item.emoji, item.colors[0], item.colors[1]);
}

/** Препятствия кликера — только рабочие URL */
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
  fire: IMG.camp,
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

/** Установить фон с автозапасным SVG при ошибке загрузки */
export function applyBackgroundImage(el, url, fallbackSvg) {
  if (!el) return;
  el.style.backgroundImage = `url('${fallbackSvg}')`;
  const probe = new Image();
  probe.onload = () => {
    el.style.backgroundImage = `url('${url}')`;
  };
  probe.onerror = () => {
    el.style.backgroundImage = `url('${fallbackSvg}')`;
  };
  probe.src = url;
}

/** Запасной SVG для препятствия кликера */
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
