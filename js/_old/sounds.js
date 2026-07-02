/** Система звуков для игры «В Поход!» */

class SoundSystem {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.sounds = {};
    this.masterVolume = 0.3;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Генерация простых тонов с помощью Web Audio API
  playTone(frequency, duration, type = 'sine', volume = 1) {
    if (!this.enabled) return;
    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const vol = volume * this.masterVolume;
    gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Звук движения по карте
  move() {
    this.playTone(440, 0.1, 'sine', 0.3);
  }

  // Звук открытия новой плитки
  reveal() {
    this.playTone(523, 0.15, 'triangle', 0.4);
    setTimeout(() => this.playTone(659, 0.15, 'triangle', 0.3), 80);
  }

  // Звук броска кубика
  dice() {
    const frequencies = [300, 350, 400, 450];
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.05, 'square', 0.2), i * 20);
    });
  }

  // Звук находки артефакта
  artifact() {
    [523, 659, 784, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.4), i * 100);
    });
  }

  // Звук использования способности
  ability() {
    this.playTone(660, 0.12, 'sawtooth', 0.35);
    setTimeout(() => this.playTone(880, 0.12, 'sawtooth', 0.3), 100);
  }

  // Звук ошибки/блокировки
  error() {
    this.playTone(200, 0.2, 'sawtooth', 0.3);
  }

  // Звук победы
  victory() {
    const melody = [523, 587, 659, 784, 880, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.5), i * 150);
    });
  }

  // Звук нажатия кнопки
  click() {
    this.playTone(600, 0.05, 'sine', 0.2);
  }

  // Звук смены хода
  turnChange() {
    this.playTone(440, 0.1, 'triangle', 0.3);
    setTimeout(() => this.playTone(550, 0.15, 'triangle', 0.25), 100);
  }

  // Звук погоды
  weather(weatherId) {
    switch (weatherId) {
      case 'rain':
        // Дождь - низкие быстрые звуки
        for (let i = 0; i < 8; i++) {
          setTimeout(() => this.playTone(200 + Math.random() * 100, 0.05, 'sine', 0.15), i * 50);
        }
        break;
      case 'wind':
        // Ветер - волнообразный звук
        this.playTone(300, 0.4, 'sawtooth', 0.2);
        break;
      case 'sun':
        // Солнце - яркий позитивный звук
        this.playTone(880, 0.2, 'sine', 0.3);
        setTimeout(() => this.playTone(1047, 0.2, 'sine', 0.25), 100);
        break;
      case 'fog':
        // Туман - низкий таинственный звук
        this.playTone(220, 0.3, 'triangle', 0.25);
        break;
      case 'heat':
        // Жара - пульсирующий звук
        this.playTone(500, 0.15, 'square', 0.2);
        setTimeout(() => this.playTone(500, 0.15, 'square', 0.15), 200);
        break;
      default:
        this.playTone(440, 0.1, 'sine', 0.2);
    }
  }
}

export const soundSystem = new SoundSystem();
