/** Система магазина походных предметов */

// Предметы для похода
export const SHOP_ITEMS = [
  { id: 1, name: 'Спички', icon: '🔥', price: 50, description: 'Без них никуда! Разведете костер и согреетесь холодным вечером.' },
  { id: 2, name: 'Компас', icon: '🧭', price: 100, description: 'Поможет не заблудиться в лесу и найти верный путь домой.' },
  { id: 3, name: 'Фонарик', icon: '🔦', price: 150, description: 'Осветит путь в темноте и отпугнет диких животных.' },
  { id: 4, name: 'Палатка', icon: '⛺', price: 250, description: 'Защита от дождя, ветра и насекомых. Ваш дом в походе!' },
  { id: 5, name: 'Спальник', icon: '🛏️', price: 350, description: 'Теплый сон после долгого дня в пути - бесценно.' },
  { id: 6, name: 'Рюкзак', icon: '🎒', price: 450, description: 'Вместительный и удобный - унесет все необходимое.' },
  { id: 7, name: 'Котелок', icon: '🍲', price: 600, description: 'Горячая еда в походе - залог хорошего настроения!' },
  { id: 8, name: 'Термос', icon: '🫖', price: 750, description: 'Горячий чай на привале согреет душу и тело.' },
  { id: 9, name: 'Аптечка', icon: '💊', price: 900, description: 'Безопасность превыше всего! Пластыри и лекарства всегда под рукой.' },
  { id: 10, name: 'Нож', icon: '🔪', price: 1100, description: 'Универсальный инструмент туриста. Подготовка дров, еды и многое другое.' },
  { id: 11, name: 'Топор', icon: '🪓', price: 1300, description: 'Для рубки дров и обустройства лагеря. Мощь и надежность!' },
  { id: 12, name: 'Карта', icon: '🗺️', price: 1550, description: 'Подробная карта местности - ваш проводник в незнакомых краях.' },
  { id: 13, name: 'Бинокль', icon: '🔭', price: 1800, description: 'Рассмотрите красоты природы и заметите опасность издалека.' },
  { id: 14, name: 'Панама', icon: '🎩', price: 2100, description: 'Защита от солнца и перегрева в жаркий день.' },
  { id: 15, name: 'Крем от загара', icon: '🧴', price: 2400, description: 'Кожа скажет спасибо! SPF 50 защитит от солнечных ожогов.' },
  { id: 16, name: 'Удочка', icon: '🎣', price: 2750, description: 'Свежая рыба на ужин - что может быть лучше?' },
  { id: 17, name: 'Гитара', icon: '🎸', price: 3100, description: 'Песни у костра создают атмосферу и сближают друзей.' },
  { id: 18, name: 'Фотоаппарат', icon: '📷', price: 3500, description: 'Запечатлейте лучшие моменты путешествия на память!' },
  { id: 19, name: 'GPS-навигатор', icon: '📡', price: 4000, description: 'Современные технологии в помощь путешественнику. Точность до метра!' },
  { id: 20, name: 'Спутниковый телефон', icon: '📞', price: 5000, description: 'Связь с миром из любой точки планеты. Для экстремалов!' }
];

// Сохранение/загрузка данных из localStorage
const STORAGE_KEY = 'hiking_game_progress';

export function getGameProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    coins: 0,
    purchasedItems: []
  };
}

export function saveGameProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function addCoins(amount) {
  const progress = getGameProgress();
  progress.coins += amount;
  saveGameProgress(progress);
  return progress.coins;
}

export function purchaseItem(itemId) {
  const progress = getGameProgress();
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  
  if (!item) return { success: false, message: 'Предмет не найден' };
  if (progress.purchasedItems.includes(itemId)) {
    return { success: false, message: 'Уже куплено' };
  }
  if (progress.coins < item.price) {
    return { success: false, message: 'Недостаточно монет' };
  }
  
  progress.coins -= item.price;
  progress.purchasedItems.push(itemId);
  saveGameProgress(progress);
  
  return { success: true, coins: progress.coins };
}

export function getNextAvailableItem() {
  const progress = getGameProgress();
  return SHOP_ITEMS.find(item => !progress.purchasedItems.includes(item.id));
}
