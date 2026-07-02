/** Канон игры «В Поход!» — данные */

export const ROLES = [
  {
    id: 'scout',
    emoji: '🧭',
    name: 'Разведчик',
    quote: '«Я пойду первым»',
    passive: 'В начале хода открывает 1 соседнюю закрытую плитку.',
    special: '«Быстрый марш» — дополнительный шаг (1× за партию).',
    grow: 'Лидерство, планирование',
    specialMax: 1,
    atmosphereMax: 0,
  },
  {
    id: 'explorer',
    emoji: '🔬',
    name: 'Исследователь',
    quote: '«Почему здесь такие камни?»',
    passive: 'Игнорирует 1 эффект сложной местности за ход.',
    special: '«Разведка карты» — открыть любую закрытую плитку (1×).',
    grow: 'Любознательность, анализ',
    specialMax: 1,
    atmosphereMax: 0,
  },
  {
    id: 'camp',
    emoji: '🏕️',
    name: 'Хранитель лагеря',
    quote: '«Кто голоден?»',
    passive: 'Снимает 1 усталость у любого игрока.',
    special: '«Тёплый привал» — отменяет погоду на 1 тур (1×).',
    grow: 'Ответственность, забота',
    specialMax: 1,
    atmosphereMax: 0,
  },
  {
    id: 'atmosphere',
    emoji: '🎶',
    name: 'Хранитель атмосферы',
    quote: '«Давайте споём!»',
    passive: 'Раз в раунд даёт +1 к шагу другому игроку.',
    special: 'Отменяет негативный эффект у игрока (2×).',
    grow: 'Эмпатия, дипломатия',
    specialMax: 2,
    atmosphereMax: 0,
  },
  {
    id: 'impressions',
    emoji: '📸',
    name: 'Хранитель впечатлений',
    quote: '«Какой закат!»',
    passive: 'За новую плитку команда получает жетон истории.',
    special: '«Памятный кадр» — бонус команде за жетоны (1×).',
    grow: 'Самовыражение, память',
    specialMax: 1,
    atmosphereMax: 0,
  },
  {
    id: 'rescuer',
    emoji: '⛑️',
    name: 'Спасатель',
    quote: '«Я выведу. Спокойно.»',
    passive: 'Отменяет 1 серьёзный штраф у себя или другого.',
    special: '«Спасательная операция» — переместить игрока на соседнюю клетку (1×).',
    grow: 'Безопасность, стрессоустойчивость',
    specialMax: 1,
    atmosphereMax: 0,
    startArtifacts: ['compass', 'equipment'],
  },
];

export const TERRAIN = {
  plains: { id: 'plains', emoji: '🟩', name: 'Равнина', kind: 'easy', cost: 1, desc: 'Без штрафов' },
  forest: { id: 'forest', emoji: '🌲', name: 'Лес', kind: 'easy', cost: 1, desc: 'Скрывает соседние плитки', hidden: true },
  water: { id: 'water', emoji: '💧', name: 'Водоём', kind: 'easy', cost: 2, desc: 'Переправа = 2 очка' },
  swamp: { id: 'swamp', emoji: '🟫', name: 'Болото', kind: 'hard', cost: 1, desc: 'Вход только на 6 или со снаряжением', needsSix: true },
  mountain: { id: 'mountain', emoji: '⛰️', name: 'Горы', kind: 'hard', cost: 1, desc: 'Вход останавливает ход', stopsTurn: true },
};

export const WEATHER = [
  { id: 'sun', emoji: '☀️', name: 'Ясно', effect: '+1 к шагу всем в этом туре.' },
  { id: 'cloud', emoji: '☁️', name: 'Облачность', effect: 'Нейтрально.' },
  { id: 'rain', emoji: '🌧️', name: 'Дождь', effect: 'Сложная местность стоит +1 очко.' },
  { id: 'heat', emoji: '🔥', name: 'Жара', effect: 'На равнине шаг −1 (мин. 1).' },
  { id: 'wind', emoji: '🌬️', name: 'Ветер', effect: 'Нельзя отступать назад.' },
  { id: 'fog', emoji: '🌫️', name: 'Туман', effect: 'Движение на 1 клетку меньше (мин. 1).' },
];

export const ARTIFACTS = {
  compass: { id: 'compass', emoji: '🧭', name: 'Компас', desc: 'Видны соседние плитки в лесу' },
  boat: { id: 'boat', emoji: '🛶', name: 'Плавсредство', desc: 'Водоём = 1 очко' },
  hat: { id: 'hat', emoji: '🧢', name: 'Головной убор', desc: 'Игнорирует жару' },
  equipment: { id: 'equipment', emoji: '🎒', name: 'Спецснаряжение', desc: 'Болото без 6 / игнор сложной местности' },
};

export const TEAM_CARDS = [
  { id: 'breath', emoji: '💨', name: 'Второе дыхание', desc: '+1 к шагу всем в этом туре' },
  { id: 'rest', emoji: '🔥', name: 'Привал', desc: 'Снять усталость у всех' },
  { id: 'unity', emoji: '🤝', name: 'Сплочённость', desc: 'Перебросить кубик шага' },
];

export const MAP_SIZES = {
  S: { label: 'Малая', tiles: 16, cols: 4, rows: 4 },
  M: { label: 'Средняя', tiles: 25, cols: 5, rows: 5 },
  B: { label: 'Большая', tiles: 36, cols: 6, rows: 6 },
};

export const STORY_SNIPPETS = [
  'Прошли через туман в лесу и нашли компас.',
  'Хранитель лагеря спас всех от усталости на болоте.',
  'Под дождём команда сплотилась у Промежуточной цели.',
  'Разведчик первым увидел Главную цель на закате.',
  'Обменяли плавсредство и вместе переправились через водоём.',
  'Хранитель атмосферы поднял дух команды у костра.',
];

export const PHASES = [
  { id: 'weather', label: 'Погода тура' },
  { id: 'role', label: 'Способность роли' },
  { id: 'roll', label: 'Бросок шага' },
  { id: 'move', label: 'Движение' },
  { id: 'effects', label: 'Эффекты' },
  { id: 'coop', label: 'Кооп-действие' },
];
