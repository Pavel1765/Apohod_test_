/** Игра-кликер с маршрутами - расширенная версия */

import { soundSystem } from '../hike-game/sounds.js';
import { addCoins, getPurchasedItems, getClickPowerBonus } from '../../shop.js';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop';

const ROUTES = [
  // Короткие маршруты (1-3 дня)
  {
    id: 1,
    name: 'Ленские столбы',
    location: 'Якутия',
    elevation: 220,
    season: '☀️ Лето',
    difficulty: 'Легкий',
    duration: 2,
    reward: 40,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Lena_Pillars.jpg/800px-Lena_Pillars.jpg',
    fact: 'Ленские столбы - это вертикальные скальные образования высотой до 100 метров, которым около 500 тысяч лет',
    obstacles: [
      { type: 'bus', icon: '🚌', name: 'Дорога', clicks: 5 },
      { type: 'boat', icon: '⛵', name: 'Переправа по Лене', clicks: 7 },
      { type: 'photo', icon: '📸', name: 'Фотосессия', clicks: 4 },
      { type: 'climb', icon: '🧗', name: 'Подъем на смотровую', clicks: 10 },
      { type: 'camp', icon: '⛺', name: 'Лагерь у реки', clicks: 6 },
      { type: 'summit', icon: '⛰️', name: 'Панорама!', clicks: 8 }
    ]
  },
  {
    id: 2,
    name: 'Кольский полуостров',
    location: 'Мурманская область',
    elevation: 540,
    season: '☀️ Лето',
    difficulty: 'Легкий',
    duration: 3,
    reward: 50,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Khibiny_Mountains.jpg/800px-Khibiny_Mountains.jpg',
    fact: 'На Кольском полуострове можно увидеть полярное сияние даже летом в период полярного дня',
    obstacles: [
      { type: 'train', icon: '🚂', name: 'Поезд до Кировска', clicks: 6 },
      { type: 'lake', icon: '🏞️', name: 'Озеро Имандра', clicks: 5 },
      { type: 'tree', icon: '🌲', name: 'Хибинская тундра', clicks: 8 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 7 },
      { type: 'camp', icon: '⛺', name: 'Ночевка', clicks: 6 },
      { type: 'summit', icon: '⛰️', name: 'Горный перевал', clicks: 12 }
    ]
  },
  // Средние маршруты (4-7 дней)
  {
    id: 3,
    name: 'Поднебесные Зубья',
    location: 'Кузнецкий Алатау',
    elevation: 2178,
    season: '☀️ Лето',
    difficulty: 'Средний',
    duration: 5,
    reward: 70,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Kuznetsk_Alatau.jpg/800px-Kuznetsk_Alatau.jpg',
    fact: 'Поднебесные Зубья - самая живописная часть Кузнецкого Алатау с острыми скальными вершинами',
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночевка', clicks: 5 },
      { type: 'bus', icon: '🚌', name: 'Дорога', clicks: 7 },
      { type: 'water', icon: '💧', name: 'Река', clicks: 8 },
      { type: 'knife', icon: '🔪', name: 'Привал', clicks: 6 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 10 },
      { type: 'thumbs', icon: '👍', name: 'Подъем', clicks: 12 },
      { type: 'snowflake', icon: '❄️', name: 'Снег', clicks: 9 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 8 },
      { type: 'summit', icon: '⛰️', name: 'Вершина!', clicks: 15 }
    ]
  },
  {
    id: 4,
    name: 'Плато Путорана',
    location: 'Красноярский край',
    elevation: 1700,
    season: '☀️ Лето',
    difficulty: 'Сложный',
    duration: 7,
    reward: 120,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Putorana_Plateau.jpg/800px-Putorana_Plateau.jpg',
    fact: 'Плато Путорана называют "краем десяти тысяч озер и тысячи водопадов"',
    obstacles: [
      { type: 'plane', icon: '✈️', name: 'Перелет в Норильск', clicks: 10 },
      { type: 'helicopter', icon: '🚁', name: 'Заброска вертолетом', clicks: 12 },
      { type: 'water', icon: '💧', name: 'Водопад Тальниковый', clicks: 15 },
      { type: 'boat', icon: '⛵', name: 'По озеру Лама', clicks: 13 },
      { type: 'fish', icon: '🐟', name: 'Рыбалка', clicks: 8 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 14 },
      { type: 'bear', icon: '🐻', name: 'След медведя', clicks: 10 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 11 },
      { type: 'sunset', icon: '🌅', name: 'Полуночное солнце', clicks: 9 },
      { type: 'summit', icon: '⛰️', name: 'Плато!', clicks: 20 }
    ]
  },
  {
    id: 5,
    name: 'Алтайские горы',
    location: 'Горный Алтай',
    elevation: 3200,
    season: '🍂 Осень',
    difficulty: 'Средний',
    duration: 6,
    reward: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Belukha_Mountain.jpg/800px-Belukha_Mountain.jpg',
    fact: 'Гора Белуха (4506 м) - высшая точка Алтая и считается священной у местных народов',
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночь', clicks: 6 },
      { type: 'bus', icon: '🚌', name: 'Переезд', clicks: 8 },
      { type: 'water', icon: '💧', name: 'Брод', clicks: 10 },
      { type: 'tree', icon: '🌲', name: 'Лес', clicks: 7 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 9 },
      { type: 'rock', icon: '🪨', name: 'Скалы', clicks: 12 },
      { type: 'wind', icon: '💨', name: 'Ветер', clicks: 10 },
      { type: 'fire', icon: '🔥', name: 'Костер', clicks: 8 },
      { type: 'horse', icon: '🐎', name: 'Конная тропа', clicks: 9 },
      { type: 'camp', icon: '⛺', name: 'Базовый лагерь', clicks: 10 },
      { type: 'summit', icon: '🏔️', name: 'Пик!', clicks: 18 }
    ]
  },
  {
    id: 6,
    name: 'Байкальский хребет',
    location: 'Озеро Байкал',
    elevation: 2840,
    season: '❄️ Зима',
    difficulty: 'Сложный',
    duration: 6,
    reward: 110,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Lake_Baikal_ice.jpg/800px-Lake_Baikal_ice.jpg',
    fact: 'Байкал - самое глубокое озеро в мире (1642 м) и содержит 20% мировых запасов пресной воды',
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Морозная ночь', clicks: 8 },
      { type: 'bus', icon: '🚌', name: 'Заброска', clicks: 9 },
      { type: 'ice', icon: '🧊', name: 'Лед Байкала', clicks: 12 },
      { type: 'snow', icon: '❄️', name: 'Снегопад', clicks: 10 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 11 },
      { type: 'wind', icon: '💨', name: 'Буран', clicks: 15 },
      { type: 'tree', icon: '🌲', name: 'Тайга', clicks: 9 },
      { type: 'fire', icon: '🔥', name: 'Обогрев', clicks: 10 },
      { type: 'seal', icon: '🦭', name: 'Нерпа на льду', clicks: 7 },
      { type: 'camp', icon: '⛺', name: 'Зимовка', clicks: 12 },
      { type: 'lake', icon: '🏞️', name: 'Байкал', clicks: 14 },
      { type: 'summit', icon: '⛰️', name: 'Вершина!', clicks: 20 }
    ]
  },
  {
    id: 7,
    name: 'Саяны',
    location: 'Западный Саян',
    elevation: 2875,
    season: '🌸 Весна',
    difficulty: 'Средний',
    duration: 5,
    reward: 85,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Sayan_Mountains.jpg/800px-Sayan_Mountains.jpg',
    fact: 'Саяны - дом для снежного барса, одного из самых редких животных России',
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночевка', clicks: 9 },
      { type: 'bus', icon: '🚌', name: 'Переезд', clicks: 10 },
      { type: 'water', icon: '💧', name: 'Переправа', clicks: 13 },
      { type: 'tree', icon: '🌲', name: 'Тайга', clicks: 11 },
      { type: 'bear', icon: '🐻', name: 'Медвежьи следы', clicks: 12 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 10 },
      { type: 'rock', icon: '🪨', name: 'Скальный участок', clicks: 15 },
      { type: 'flower', icon: '🌸', name: 'Альпийские луга', clicks: 8 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 9 },
      { type: 'summit', icon: '⛰️', name: 'Вершина!', clicks: 22 }
    ]
  },
  // Длинные маршруты (8+ дней)
  {
    id: 8,
    name: 'Камчатка',
    location: 'Вулканы Камчатки',
    elevation: 4750,
    season: '☀️ Лето',
    difficulty: 'Очень сложный',
    duration: 10,
    reward: 180,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Klyuchevskaya_Sopka.jpg/800px-Klyuchevskaya_Sopka.jpg',
    fact: 'Ключевская Сопка - самый активный вулкан Евразии, извергается каждые 3-5 лет',
    obstacles: [
      { type: 'plane', icon: '✈️', name: 'Перелет', clicks: 10 },
      { type: 'helicopter', icon: '🚁', name: 'Заброска', clicks: 12 },
      { type: 'volcano', icon: '🌋', name: 'Вулкан Толбачик', clicks: 15 },
      { type: 'hot', icon: '♨️', name: 'Горячие источники', clicks: 8 },
      { type: 'bear', icon: '🐻', name: 'Медведи', clicks: 14 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 12 },
      { type: 'rock', icon: '🪨', name: 'Лавовые поля', clicks: 16 },
      { type: 'gas', icon: '💨', name: 'Вулканические газы', clicks: 13 },
      { type: 'geyser', icon: '💦', name: 'Долина Гейзеров', clicks: 11 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 11 },
      { type: 'ash', icon: '🌫️', name: 'Пепел', clicks: 10 },
      { type: 'summit', icon: '🏔️', name: 'Кратер!', clicks: 30 }
    ]
  },
  {
    id: 9,
    name: 'Эльбрус',
    location: 'Кавказ',
    elevation: 5642,
    season: '☀️ Лето',
    difficulty: 'Очень сложный',
    duration: 9,
    reward: 220,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Mount_Elbrus.jpg/800px-Mount_Elbrus.jpg',
    fact: 'Эльбрус (5642 м) - высочайшая вершина России и Европы, потухший вулкан',
    obstacles: [
      { type: 'moon', icon: '🌙', name: 'Ночной подъем', clicks: 12 },
      { type: 'bus', icon: '🚌', name: 'Подъезд', clicks: 10 },
      { type: 'cable', icon: '🚡', name: 'Канатка', clicks: 8 },
      { type: 'snow', icon: '❄️', name: 'Снежные поля', clicks: 15 },
      { type: 'ice', icon: '🧊', name: 'Ледник', clicks: 18 },
      { type: 'wind', icon: '💨', name: 'Сильный ветер', clicks: 16 },
      { type: 'altitude', icon: '😵', name: 'Горная болезнь', clicks: 20 },
      { type: 'crevasse', icon: '🕳️', name: 'Трещины', clicks: 14 },
      { type: 'camp', icon: '⛺', name: 'Высотный лагерь', clicks: 13 },
      { type: 'oxygen', icon: '💨', name: 'Разреженный воздух', clicks: 12 },
      { type: 'rope', icon: '🪢', name: 'Связка', clicks: 15 },
      { type: 'summit', icon: '🏔️', name: 'Вершина Эльбрус!', clicks: 35 }
    ]
  },
  {
    id: 10,
    name: 'Уральские горы',
    location: 'Приполярный Урал',
    elevation: 1895,
    season: '☀️ Лето',
    difficulty: 'Средний',
    duration: 7,
    reward: 95,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ural_Mountains.jpg/800px-Ural_Mountains.jpg',
    fact: 'Уральские горы - естественная граница между Европой и Азией, возрастом около 350 млн лет',
    obstacles: [
      { type: 'train', icon: '🚂', name: 'Поезд', clicks: 9 },
      { type: 'river', icon: '💧', name: 'Река Щугор', clicks: 11 },
      { type: 'tree', icon: '🌲', name: 'Тайга', clicks: 10 },
      { type: 'rock', icon: '🪨', name: 'Скальные останцы', clicks: 13 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 11 },
      { type: 'fish', icon: '🐟', name: 'Рыбалка', clicks: 7 },
      { type: 'camp', icon: '⛺', name: 'Ночевка', clicks: 9 },
      { type: 'cave', icon: '🕳️', name: 'Пещера', clicks: 12 },
      { type: 'summit', icon: '⛰️', name: 'Перевал!', clicks: 18 }
    ]
  },
  {
    id: 11,
    name: 'Карелия',
    location: 'Республика Карелия',
    elevation: 380,
    season: '☀️ Лето',
    difficulty: 'Легкий',
    duration: 4,
    reward: 60,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Karelia_lake.jpg/800px-Karelia_lake.jpg',
    fact: 'В Карелии более 60 000 озер и 27 000 рек - настоящий водный край',
    obstacles: [
      { type: 'train', icon: '🚂', name: 'Поезд в Петрозаводск', clicks: 8 },
      { type: 'boat', icon: '⛵', name: 'Онежское озеро', clicks: 10 },
      { type: 'island', icon: '🏝️', name: 'Остров Кижи', clicks: 9 },
      { type: 'church', icon: '⛪', name: 'Деревянные церкви', clicks: 6 },
      { type: 'kayak', icon: '🛶', name: 'Сплав на байдарках', clicks: 12 },
      { type: 'fish', icon: '🐟', name: 'Рыбалка', clicks: 7 },
      { type: 'camp', icon: '⛺', name: 'Лагерь у озера', clicks: 8 },
      { type: 'waterfall', icon: '💦', name: 'Водопад Кивач', clicks: 10 }
    ]
  },
  {
    id: 12,
    name: 'Кавказский заповедник',
    location: 'Западный Кавказ',
    elevation: 3256,
    season: '🍂 Осень',
    difficulty: 'Средний',
    duration: 6,
    reward: 100,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Caucasus_Reserve.jpg/800px-Caucasus_Reserve.jpg',
    fact: 'Кавказский заповедник - объект Всемирного наследия ЮНЕСКО, дом для зубров и туров',
    obstacles: [
      { type: 'bus', icon: '🚌', name: 'Дорога в Сочи', clicks: 9 },
      { type: 'checkpoint', icon: '🚧', name: 'КПП заповедника', clicks: 6 },
      { type: 'tree', icon: '🌲', name: 'Самшитовая роща', clicks: 10 },
      { type: 'deer', icon: '🦌', name: 'Благородный олень', clicks: 8 },
      { type: 'waterfall', icon: '💦', name: 'Водопад Безымянный', clicks: 12 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 11 },
      { type: 'camp', icon: '⛺', name: 'Приют', clicks: 9 },
      { type: 'mountain', icon: '⛰️', name: 'Гора Фишт', clicks: 16 },
      { type: 'summit', icon: '🏔️', name: 'Панорама!', clicks: 19 }
    ]
  },
  {
    id: 13,
    name: 'Хибины',
    location: 'Кольский полуостров',
    elevation: 1201,
    season: '🌸 Весна',
    difficulty: 'Средний',
    duration: 5,
    reward: 75,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Khibiny.jpg/800px-Khibiny.jpg',
    fact: 'Хибины - крупнейший горный массив на Кольском полуострове, богат редкими минералами',
    obstacles: [
      { type: 'train', icon: '🚂', name: 'Поезд до Апатитов', clicks: 10 },
      { type: 'bus', icon: '🚌', name: 'До Кировска', clicks: 7 },
      { type: 'ski', icon: '⛷️', name: 'Лыжный переход', clicks: 13 },
      { type: 'avalanche', icon: '🏔️', name: 'Лавиноопасный участок', clicks: 15 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 11 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 9 },
      { type: 'lake', icon: '🏞️', name: 'Озеро', clicks: 8 },
      { type: 'summit', icon: '⛰️', name: 'Перевал!', clicks: 17 }
    ]
  },
  {
    id: 14,
    name: 'Тункинская долина',
    location: 'Бурятия',
    elevation: 2750,
    season: '☀️ Лето',
    difficulty: 'Средний',
    duration: 6,
    reward: 85,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Tunka_Valley.jpg/800px-Tunka_Valley.jpg',
    fact: 'Тункинская долина - живописная межгорная котловина между Саянами и хребтом Хамар-Дабан',
    obstacles: [
      { type: 'bus', icon: '🚌', name: 'Переезд из Иркутска', clicks: 9 },
      { type: 'hot', icon: '♨️', name: 'Аршан - источники', clicks: 8 },
      { type: 'waterfall', icon: '💦', name: 'Водопады', clicks: 11 },
      { type: 'tree', icon: '🌲', name: 'Кедровая тайга', clicks: 10 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 12 },
      { type: 'rock', icon: '🪨', name: 'Скальный пояс', clicks: 14 },
      { type: 'camp', icon: '⛺', name: 'Ночевка', clicks: 9 },
      { type: 'peak', icon: '⛰️', name: 'Пик Топографов', clicks: 18 },
      { type: 'summit', icon: '🏔️', name: 'Вершина!', clicks: 20 }
    ]
  },
  {
    id: 15,
    name: 'Таганай',
    location: 'Южный Урал',
    elevation: 1178,
    season: '🍂 Осень',
    difficulty: 'Легкий',
    duration: 3,
    reward: 55,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Taganay.jpg/800px-Taganay.jpg',
    fact: 'Таганай известен своими каменными реками - курумами из огромных валунов',
    obstacles: [
      { type: 'train', icon: '🚂', name: 'Поезд в Златоуст', clicks: 8 },
      { type: 'entrance', icon: '🚪', name: 'Въезд в нацпарк', clicks: 5 },
      { type: 'river', icon: '💧', name: 'Река Большой Киалим', clicks: 9 },
      { type: 'rock', icon: '🪨', name: 'Каменная река', clicks: 12 },
      { type: 'shelter', icon: '🏠', name: 'Приют Таганай', clicks: 7 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 10 },
      { type: 'summit', icon: '⛰️', name: 'Двуглавая сопка', clicks: 15 }
    ]
  },
  {
    id: 16,
    name: 'Домбай',
    location: 'Карачаево-Черкесия',
    elevation: 3200,
    season: '🌸 Весна',
    difficulty: 'Средний',
    duration: 5,
    reward: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dombay.jpg/800px-Dombay.jpg',
    fact: 'Домбай - горнолыжный курорт и центр альпинизма с видом на Эльбрус',
    obstacles: [
      { type: 'bus', icon: '🚌', name: 'Дорога в горы', clicks: 9 },
      { type: 'cable', icon: '🚡', name: 'Канатная дорога', clicks: 7 },
      { type: 'waterfall', icon: '💦', name: 'Алибекский водопад', clicks: 11 },
      { type: 'glacier', icon: '🧊', name: 'Ледник Алибек', clicks: 13 },
      { type: 'climb', icon: '🧗', name: 'Скальный участок', clicks: 15 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 9 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 11 },
      { type: 'summit', icon: '⛰️', name: 'Перевал!', clicks: 19 }
    ]
  },
  {
    id: 17,
    name: 'Приэльбрусье',
    location: 'Кабардино-Балкария',
    elevation: 3800,
    season: '☀️ Лето',
    difficulty: 'Сложный',
    duration: 7,
    reward: 130,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Elbrus_region.jpg/800px-Elbrus_region.jpg',
    fact: 'Приэльбрусье - район вокруг Эльбруса с десятками вершин выше 4000 метров',
    obstacles: [
      { type: 'plane', icon: '✈️', name: 'Перелет в Нальчик', clicks: 10 },
      { type: 'bus', icon: '🚌', name: 'Дорога в Терскол', clicks: 8 },
      { type: 'cable', icon: '🚡', name: 'Подъемник на Чегет', clicks: 9 },
      { type: 'waterfall', icon: '💦', name: 'Водопады Чегета', clicks: 11 },
      { type: 'climb', icon: '🧗', name: 'Акклиматизационный выход', clicks: 14 },
      { type: 'glacier', icon: '🧊', name: 'Ледник', clicks: 16 },
      { type: 'compass', icon: '🧭', name: 'Навигация', clicks: 13 },
      { type: 'altitude', icon: '😵', name: 'Высота', clicks: 18 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 12 },
      { type: 'summit', icon: '🏔️', name: 'Пик 4200!', clicks: 25 }
    ]
  },
  {
    id: 18,
    name: 'Ергаки',
    location: 'Красноярский край',
    elevation: 2265,
    season: '☀️ Лето',
    difficulty: 'Средний',
    duration: 6,
    reward: 95,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Ergaki.jpg/800px-Ergaki.jpg',
    fact: 'Ергаки - природный парк с причудливыми скальными вершинами и кристальными озерами',
    obstacles: [
      { type: 'bus', icon: '🚌', name: 'Дорога из Абакана', clicks: 10 },
      { type: 'entrance', icon: '🚪', name: 'КПП парка', clicks: 6 },
      { type: 'lake', icon: '🏞️', name: 'Озеро Художников', clicks: 11 },
      { type: 'waterfall', icon: '💦', name: 'Водопад', clicks: 9 },
      { type: 'rock', icon: '🪨', name: 'Скала Звездный', clicks: 15 },
      { type: 'compass', icon: '🧭', name: 'Ориентирование', clicks: 12 },
      { type: 'pass', icon: '⛰️', name: 'Перевал Художников', clicks: 14 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 10 },
      { type: 'summit', icon: '🏔️', name: 'Пик Звездный!', clicks: 20 }
    ]
  },
  {
    id: 19,
    name: 'Красноярские Столбы',
    location: 'Красноярский край',
    elevation: 840,
    season: '🍂 Осень',
    difficulty: 'Легкий',
    duration: 2,
    reward: 45,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Stolby_Reserve.jpg/800px-Stolby_Reserve.jpg',
    fact: 'Столбы - уникальные скалы из сиенита, место зарождения столбизма - особого вида скалолазания',
    obstacles: [
      { type: 'bus', icon: '🚌', name: 'От центра Красноярска', clicks: 6 },
      { type: 'entrance', icon: '🚪', name: 'Въезд в заповедник', clicks: 5 },
      { type: 'trail', icon: '🥾', name: 'Тропа', clicks: 8 },
      { type: 'rock', icon: '🪨', name: 'Скала Дед', clicks: 12 },
      { type: 'climb', icon: '🧗', name: 'Лазание', clicks: 14 },
      { type: 'summit', icon: '⛰️', name: 'Второй Столб!', clicks: 16 }
    ]
  },
  {
    id: 20,
    name: 'Аркаим',
    location: 'Челябинская область',
    elevation: 450,
    season: '☀️ Лето',
    difficulty: 'Легкий',
    duration: 3,
    reward: 50,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Arkaim.jpg/800px-Arkaim.jpg',
    fact: 'Аркаим - древний город бронзового века (около 4000 лет), современник Египетских пирамид',
    obstacles: [
      { type: 'bus', icon: '🚌', name: 'Дорога из Челябинска', clicks: 9 },
      { type: 'site', icon: '🏛️', name: 'Археологический памятник', clicks: 10 },
      { type: 'museum', icon: '🏺', name: 'Музей', clicks: 7 },
      { type: 'mountain', icon: '⛰️', name: 'Гора Шаманка', clicks: 12 },
      { type: 'camp', icon: '⛺', name: 'Лагерь', clicks: 8 },
      { type: 'sunrise', icon: '🌅', name: 'Рассвет на горе', clicks: 9 },
      { type: 'summit', icon: '⛰️', name: 'Панорама!', clicks: 15 }
    ]
  }
];

const ROUTE_MAP_POSITIONS = {
  1: { x: 72, y: 42 },
  2: { x: 24, y: 18 },
  3: { x: 58, y: 54 },
  4: { x: 62, y: 30 },
  5: { x: 54, y: 60 },
  6: { x: 70, y: 50 },
  7: { x: 66, y: 52 },
  8: { x: 92, y: 38 },
  9: { x: 28, y: 74 },
  10: { x: 44, y: 26 },
  11: { x: 30, y: 20 },
  12: { x: 26, y: 70 },
  13: { x: 23, y: 16 },
  14: { x: 72, y: 52 },
  15: { x: 46, y: 56 },
  16: { x: 30, y: 72 },
  17: { x: 32, y: 76 },
  18: { x: 60, y: 46 },
  19: { x: 58, y: 42 },
  20: { x: 44, y: 54 }
};

const ROUTE_MAP_SVG = `
  <svg class="route-map-svg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <linearGradient id="routeMapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E8F5E9"/>
        <stop offset="100%" stop-color="#C8E6C9"/>
      </linearGradient>
    </defs>
    <path fill="url(#routeMapGrad)" stroke="#7FB069" stroke-width="3"
      d="M90,170 C120,110 190,70 280,55 C380,38 520,32 660,42 C780,52 860,68 920,95
         C960,118 970,165 950,215 C930,275 880,320 790,345 C690,372 560,382 430,375
         C300,368 210,340 150,295 C105,260 75,220 90,170 Z"/>
    <path fill="none" stroke="rgba(127,176,105,0.35)" stroke-width="2" stroke-dasharray="6 8"
      d="M280,55 C350,120 420,180 520,220 C620,260 760,280 860,290"/>
  </svg>
`;

let selectedRouteId = null;
let currentRoute = null;
let currentObstacleIndex = 0;
let clicksRemaining = 0;
let totalClicks = 0;
let onExitCallback = null;

// Фильтры
let filters = {
  duration: { min: 0, max: 15 },
  reward: { min: 0, max: 250 },
  difficulty: 'all',
  season: 'all',
  search: ''
};

export function renderHikeClickerGame(container, onExit) {
  onExitCallback = onExit;
  soundSystem.init();
  
  showRouteSelection(container);
}

function applyFilters(routes) {
  return routes.filter(route => {
    if (route.duration < filters.duration.min || route.duration > filters.duration.max) return false;
    if (route.reward < filters.reward.min || route.reward > filters.reward.max) return false;
    if (filters.difficulty !== 'all' && route.difficulty !== filters.difficulty) return false;
    if (filters.season !== 'all' && !route.season.includes(filters.season)) return false;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchName = route.name.toLowerCase().includes(searchLower);
      const matchLocation = route.location.toLowerCase().includes(searchLower);
      if (!matchName && !matchLocation) return false;
    }

    return true;
  });
}

function getRouteCardHTML(route, compact = false) {
  const imageUrl = route.image || PLACEHOLDER_IMAGE;
  return `
    ${imageUrl ? `<div class="route-image" style="background-image: url('${imageUrl}')"></div>` : ''}
    <div class="route-header">
      <h2>⛰️ ${route.name}</h2>
      <div class="route-reward">💰 ${route.reward}</div>
    </div>
    <div class="route-info">
      <div class="route-detail">📍 ${route.location}</div>
      <div class="route-detail">📏 ${route.elevation} м</div>
      <div class="route-detail">${route.season}</div>
      <div class="route-detail">⏱️ ${route.duration} ${route.duration === 1 ? 'день' : route.duration < 5 ? 'дня' : 'дней'}</div>
      <div class="route-detail difficulty-${route.difficulty.replace(/\s/g, '-').toLowerCase()}">🎯 ${route.difficulty}</div>
    </div>
    ${route.fact && !compact ? `<div class="route-fact">💡 ${route.fact}</div>` : ''}
    <div class="route-obstacles-preview">
      ${route.obstacles.map(o => o.icon).join(' ')}
    </div>
    <button class="btn-primary route-start-btn">Начать поход</button>
  `;
}

function attachRouteCardHandlers(cardEl, container, route) {
  cardEl.querySelector('.route-start-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    startRoute(container, route);
  });

  cardEl.addEventListener('click', () => {
    selectedRouteId = route.id;
    updateRouteViews(container);
  });
}

function renderRouteMap(container, routes) {
  const pinsContainer = container.querySelector('#route-map-pins');
  if (!pinsContainer) return;

  pinsContainer.innerHTML = '';
  routes.forEach(route => {
    const pos = ROUTE_MAP_POSITIONS[route.id];
    if (!pos) return;

    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = `route-map-pin${selectedRouteId === route.id ? ' active' : ''}`;
    pin.style.left = `${pos.x}%`;
    pin.style.top = `${pos.y}%`;
    pin.dataset.routeId = route.id;
    pin.title = route.name;
    pin.setAttribute('aria-label', route.name);
    pin.innerHTML = '<span class="route-map-pin-icon">📍</span>';

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedRouteId = route.id;
      updateRouteViews(container);
    });

    pinsContainer.appendChild(pin);
  });
}

function renderRoutePreview(container, route) {
  const preview = container.querySelector('#route-preview');
  if (!preview) return;

  if (!route) {
    preview.innerHTML = `
      <div class="route-preview-empty">
        <div class="route-preview-empty-icon">🗺️</div>
        <p>Нажмите на булавку на карте, чтобы увидеть маршрут и начать поход</p>
      </div>
    `;
    preview.classList.remove('has-route');
    return;
  }

  preview.classList.add('has-route');
  preview.innerHTML = `<div class="route-card route-preview-card">${getRouteCardHTML(route, true)}</div>`;
  attachRouteCardHandlers(preview.querySelector('.route-preview-card'), container, route);
}

function updateRouteViews(container) {
  const routes = applyFilters(ROUTES);

  if (selectedRouteId && !routes.some(route => route.id === selectedRouteId)) {
    selectedRouteId = null;
  }

  renderRouteMap(container, routes);
  renderRoutePreview(container, routes.find(route => route.id === selectedRouteId) || null);
  renderRouteCards(container, routes);
}

function renderRouteCards(container, routes) {
  const routesContainer = container.querySelector('#routes');
  const routesInfo = container.querySelector('#routes-count');
  if (!routesContainer) return;

  if (routesInfo) {
    routesInfo.textContent = `${routes.length} из ${ROUTES.length}`;
  }

  routesContainer.innerHTML = '';
  routes.forEach(route => {
    const routeCard = document.createElement('div');
    routeCard.className = `route-card${selectedRouteId === route.id ? ' selected' : ''}`;
    routeCard.dataset.routeId = route.id;
    routeCard.innerHTML = getRouteCardHTML(route);
    attachRouteCardHandlers(routeCard, container, route);
    routesContainer.appendChild(routeCard);
  });
}

function updateDualRange(minInput, maxInput, fillEl, valueEl, minLimit, maxLimit) {
  let minVal = parseInt(minInput.value, 10);
  let maxVal = parseInt(maxInput.value, 10);

  if (minVal > maxVal) {
    if (document.activeElement === minInput) {
      maxVal = minVal;
      maxInput.value = minVal;
    } else {
      minVal = maxVal;
      minInput.value = maxVal;
    }
  }

  const span = maxLimit - minLimit || 1;
  const left = ((minVal - minLimit) / span) * 100;
  const width = ((maxVal - minVal) / span) * 100;
  fillEl.style.left = `${left}%`;
  fillEl.style.width = `${width}%`;
  valueEl.textContent = `${minVal} – ${maxVal}`;

  return { minVal, maxVal };
}

function setupDualRangeFilter(container, minId, maxId, fillId, valueId, filterKey, minLimit, maxLimit) {
  const minInput = document.getElementById(minId);
  const maxInput = document.getElementById(maxId);
  const fillEl = document.getElementById(fillId);
  const valueEl = document.getElementById(valueId);
  if (!minInput || !maxInput || !fillEl || !valueEl) return;

  const sync = () => {
    const { minVal, maxVal } = updateDualRange(minInput, maxInput, fillEl, valueEl, minLimit, maxLimit);
    filters[filterKey].min = minVal;
    filters[filterKey].max = maxVal;
    updateRouteViews(container);
  };

  updateDualRange(minInput, maxInput, fillEl, valueEl, minLimit, maxLimit);
  minInput.addEventListener('input', sync);
  maxInput.addEventListener('input', sync);
}

function showRouteSelection(container) {
  const purchasedItems = getPurchasedItems();
  const clickBonus = getClickPowerBonus();
  const filteredRoutes = applyFilters(ROUTES);
  
  container.innerHTML = `
    <div class="clicker-game">
      <div class="clicker-header">
        <button class="btn-back" id="backBtn">← В меню</button>
        <div class="clicker-title">
          <h1>⛰️ Походные маршруты по России</h1>
          <p>Выберите маршрут для прохождения</p>
        </div>
      </div>
      
      <div class="route-main-container">
        <!-- Фильтры слева -->
        <div class="route-filters">
          <h3>🔍 Фильтры</h3>
          
          <div class="filter-group">
            <label>Поиск по названию:</label>
            <input type="text" id="search-input" placeholder="Название или регион..." value="${filters.search}">
          </div>
          
          <div class="filter-group">
            <div class="filter-range-header">
              <label>Длительность (дней)</label>
              <span class="filter-range-value" id="duration-value">${filters.duration.min} – ${filters.duration.max}</span>
            </div>
            <div class="dual-range">
              <div class="dual-range-track">
                <div class="dual-range-fill" id="duration-fill"></div>
              </div>
              <input type="range" class="dual-range-min" id="duration-min" min="0" max="15" value="${filters.duration.min}">
              <input type="range" class="dual-range-max" id="duration-max" min="0" max="15" value="${filters.duration.max}">
            </div>
          </div>
          
          <div class="filter-group">
            <div class="filter-range-header">
              <label>Награда (монет)</label>
              <span class="filter-range-value" id="reward-value">${filters.reward.min} – ${filters.reward.max}</span>
            </div>
            <div class="dual-range">
              <div class="dual-range-track">
                <div class="dual-range-fill" id="reward-fill"></div>
              </div>
              <input type="range" class="dual-range-min" id="reward-min" min="0" max="250" step="10" value="${filters.reward.min}">
              <input type="range" class="dual-range-max" id="reward-max" min="0" max="250" step="10" value="${filters.reward.max}">
            </div>
          </div>
          
          <div class="filter-group">
            <label>Сложность:</label>
            <select id="difficulty-select">
              <option value="all" ${filters.difficulty === 'all' ? 'selected' : ''}>Все</option>
              <option value="Легкий" ${filters.difficulty === 'Легкий' ? 'selected' : ''}>Легкий</option>
              <option value="Средний" ${filters.difficulty === 'Средний' ? 'selected' : ''}>Средний</option>
              <option value="Сложный" ${filters.difficulty === 'Сложный' ? 'selected' : ''}>Сложный</option>
              <option value="Очень сложный" ${filters.difficulty === 'Очень сложный' ? 'selected' : ''}>Очень сложный</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Сезон:</label>
            <select id="season-select">
              <option value="all" ${filters.season === 'all' ? 'selected' : ''}>Все сезоны</option>
              <option value="Лето" ${filters.season === 'Лето' ? 'selected' : ''}>☀️ Лето</option>
              <option value="Осень" ${filters.season === 'Осень' ? 'selected' : ''}>🍂 Осень</option>
              <option value="Зима" ${filters.season === 'Зима' ? 'selected' : ''}>❄️ Зима</option>
              <option value="Весна" ${filters.season === 'Весна' ? 'selected' : ''}>🌸 Весна</option>
            </select>
          </div>
          
          <button type="button" class="filter-reset-btn" id="reset-filters">↺ Сбросить фильтры</button>
        </div>
        
        <!-- Маршруты справа -->
        <div class="route-content">
          ${purchasedItems.length > 0 ? `
          <div class="equipment-display">
            <h3>🎒 Ваше снаряжение</h3>
            <p class="equipment-bonus">Сила клика увеличена в <strong>×${clickBonus.toFixed(2)}</strong> раз</p>
            <p class="equipment-help">💡 Каждый предмет дает +5% к силе клика</p>
            <div class="equipment-icons">
              ${purchasedItems.map(item => `
                <span class="equipment-icon" data-tooltip="${item.description}">
                  ${item.icon}
                  <span class="item-name">${item.name}</span>
                </span>
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          <div class="route-map-section">
            <div class="route-map-panel">
              <h3>🗺️ Карта маршрутов</h3>
              <div class="route-map" id="route-map">
                ${ROUTE_MAP_SVG}
                <div class="route-map-pins" id="route-map-pins"></div>
              </div>
            </div>
            <div class="route-map-preview" id="route-preview"></div>
          </div>
          
          <div class="routes-info">
            <p>Найдено маршрутов: <strong id="routes-count">${filteredRoutes.length}</strong> из ${ROUTES.length}</p>
          </div>
          
          <div class="routes-container" id="routes"></div>
        </div>
      </div>
    </div>
  `;
  
  // Скролл наверх страницы при открытии
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => onExitCallback());
  
  // Обработчики фильтров
  document.getElementById('search-input').addEventListener('input', (e) => {
    filters.search = e.target.value;
    updateRouteViews(container);
  });

  setupDualRangeFilter(container, 'duration-min', 'duration-max', 'duration-fill', 'duration-value', 'duration', 0, 15);
  setupDualRangeFilter(container, 'reward-min', 'reward-max', 'reward-fill', 'reward-value', 'reward', 0, 250);
  
  document.getElementById('difficulty-select').addEventListener('change', (e) => {
    filters.difficulty = e.target.value;
    updateRouteViews(container);
  });
  
  document.getElementById('season-select').addEventListener('change', (e) => {
    filters.season = e.target.value;
    updateRouteViews(container);
  });
  
  document.getElementById('reset-filters').addEventListener('click', () => {
    selectedRouteId = null;
    filters = {
      duration: { min: 0, max: 15 },
      reward: { min: 0, max: 250 },
      difficulty: 'all',
      season: 'all',
      search: ''
    };
    showRouteSelection(container);
  });
  
  updateRouteViews(container);
}

// Остальные функции остаются прежними
function startRoute(container, route) {
  currentRoute = route;
  currentObstacleIndex = 0;
  totalClicks = 0;
  clicksRemaining = route.obstacles[0].clicks;
  
  container.innerHTML = `
    <div class="clicker-game">
      <div class="clicker-header">
        <button class="btn-back" id="backBtn">← Выбор маршрута</button>
        <div class="clicker-title">
          <h1>⛰️ ${route.name}</h1>
          <p>${route.location} · ${route.elevation} м · ${route.season} · ${route.duration} дн.</p>
        </div>
      </div>
      
      ${PLACEHOLDER_IMAGE ? `<div class="route-hero-image" style="background-image: url('${PLACEHOLDER_IMAGE}')"></div>` : ''}
      
      <div class="route-progress">
        <div class="progress-text">
          <span>Препятствий пройдено: <strong><span id="progress-count">0</span>/${route.obstacles.length}</strong></span>
          <span>Кликов: <strong id="total-clicks">0</strong></span>
        </div>
      </div>
      
      <div class="route-path" id="route-path"></div>
      
      <div class="current-obstacle-section">
        <div class="obstacle-card" id="obstacle-card">
          <div class="obstacle-icon" id="obstacle-icon">${route.obstacles[0].icon}</div>
          <div class="obstacle-name" id="obstacle-name">${route.obstacles[0].name}</div>
          <div class="obstacle-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
            </div>
            <div class="clicks-remaining" id="clicks-remaining">${clicksRemaining} кликов</div>
          </div>
          <button class="btn-primary btn-large" id="click-btn">👆 Кликать!</button>
        </div>
      </div>
    </div>
  `;
  
  loadStyles();
  
  document.getElementById('backBtn').addEventListener('click', () => {
    showRouteSelection(container);
  });
  
  document.getElementById('click-btn').addEventListener('click', () => handleClick());
  
  renderRoutePath();
}

function renderRoutePath() {
  const pathContainer = document.getElementById('route-path');
  pathContainer.innerHTML = '';
  
  currentRoute.obstacles.forEach((obstacle, index) => {
    const obstacleEl = document.createElement('div');
    obstacleEl.className = `path-obstacle ${index < currentObstacleIndex ? 'completed' : ''} ${index === currentObstacleIndex ? 'active' : ''}`;
    obstacleEl.innerHTML = `
      <div class="path-icon">${obstacle.icon}</div>
      ${index < currentObstacleIndex ? '<div class="check-mark">✓</div>' : ''}
    `;
    pathContainer.appendChild(obstacleEl);
    
    if (index < currentRoute.obstacles.length - 1) {
      const line = document.createElement('div');
      line.className = 'path-line';
      pathContainer.appendChild(line);
    }
  });
}

function handleClick() {
  const clickPower = getClickPowerBonus();
  
  soundSystem.click();
  totalClicks++;
  clicksRemaining -= clickPower;
  
  if (clicksRemaining < 0) clicksRemaining = 0;
  
  document.getElementById('total-clicks').textContent = totalClicks;
  document.getElementById('clicks-remaining').textContent = Math.ceil(clicksRemaining);
  
  const obstacle = currentRoute.obstacles[currentObstacleIndex];
  const progress = ((obstacle.clicks - clicksRemaining) / obstacle.clicks) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
  
  const btn = document.getElementById('click-btn');
  btn.classList.add('clicked');
  setTimeout(() => btn.classList.remove('clicked'), 150);
  
  if (clickPower > 1) {
    showClickBonus(clickPower);
  }
  
  if (clicksRemaining <= 0) {
    completeObstacle();
  }
}

function showClickBonus(clickPower) {
  const btn = document.getElementById('click-btn');
  const bonus = document.createElement('div');
  bonus.className = 'click-bonus';
  bonus.textContent = `×${clickPower.toFixed(2)}`;
  bonus.style.position = 'absolute';
  bonus.style.left = `${Math.random() * 80 + 10}%`;
  bonus.style.top = '50%';
  bonus.style.color = 'var(--brand-orange)';
  bonus.style.fontWeight = 'bold';
  bonus.style.fontSize = '24px';
  bonus.style.animation = 'floatUp 1s ease-out forwards';
  bonus.style.pointerEvents = 'none';
  
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(bonus);
  setTimeout(() => bonus.remove(), 1000);
}

function completeObstacle() {
  soundSystem.move();
  currentObstacleIndex++;
  
  document.getElementById('progress-count').textContent = currentObstacleIndex;
  
  if (currentObstacleIndex >= currentRoute.obstacles.length) {
    completeRoute();
    return;
  }
  
  const nextObstacle = currentRoute.obstacles[currentObstacleIndex];
  clicksRemaining = nextObstacle.clicks;
  
  document.getElementById('obstacle-icon').textContent = nextObstacle.icon;
  document.getElementById('obstacle-name').textContent = nextObstacle.name;
  document.getElementById('clicks-remaining').textContent = clicksRemaining;
  document.getElementById('progress-fill').style.width = '0%';
  
  renderRoutePath();
}

function completeRoute() {
  soundSystem.victory();
  
  addCoins(currentRoute.reward);
  
  setTimeout(() => {
    const container = document.querySelector('.clicker-game').parentElement;
    container.innerHTML = `
      <div class="clicker-game">
        <div class="victory-screen">
          <h1>🎉 Маршрут пройден! 🎉</h1>
          ${currentRoute.image ? `<div class="victory-image" style="background-image: url('${currentRoute.image}')"></div>` : ''}
          <div class="victory-stats">
            <p class="victory-route">⛰️ ${currentRoute.name}</p>
            <p>📍 ${currentRoute.location}</p>
            <p>📏 Высота: ${currentRoute.elevation} м</p>
            <p>⏱️ Длительность: ${currentRoute.duration} ${currentRoute.duration === 1 ? 'день' : currentRoute.duration < 5 ? 'дня' : 'дней'}</p>
            <p>👆 Всего кликов: ${totalClicks}</p>
            <p class="victory-reward">💰 Получено: ${currentRoute.reward} монет</p>
          </div>
          ${currentRoute.fact ? `<div class="victory-fact">💡 <strong>Интересный факт:</strong> ${currentRoute.fact}</div>` : ''}
          <div class="victory-buttons">
            <button class="btn-primary" id="newRouteBtn">Выбрать другой маршрут</button>
            <button class="btn-secondary" id="menuBtn">В главное меню</button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('newRouteBtn').addEventListener('click', () => {
      showRouteSelection(container);
    });
    
    document.getElementById('menuBtn').addEventListener('click', () => {
      onExitCallback();
    });
  }, 500);
}

function loadStyles() {
  if (!document.querySelector('link[href*="clicker-styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/clicker-styles.css';
    document.head.appendChild(link);
  }
}
