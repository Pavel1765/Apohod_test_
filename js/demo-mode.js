/** Демо-режим: презентации и быстрый старт без порчи основного прогресса */

const STORAGE_KEY = 'hiking_game_progress';
const DEMO_ITEM_COUNT = 20;
const DEMO_FLAG = 'hiking_demo_mode';
const DEMO_BACKUP = 'hiking_demo_progress_backup';
const DEMO_HIKE_LEN = 'hiking_demo_hike_length';

export const DEMO_COINS = 5000;

export function isDemoMode() {
  return sessionStorage.getItem(DEMO_FLAG) === '1';
}

export function getDemoProgress() {
  return {
    coins: DEMO_COINS,
    purchasedItems: Array.from({ length: DEMO_ITEM_COUNT }, (_, i) => i + 1),
  };
}

export function enableDemoMode() {
  if (!isDemoMode()) {
    const current = localStorage.getItem(STORAGE_KEY);
    sessionStorage.setItem(DEMO_BACKUP, current || JSON.stringify({ coins: 0, purchasedItems: [] }));
    sessionStorage.setItem(DEMO_FLAG, '1');
  }
  window.dispatchEvent(new CustomEvent('demo-mode-changed', { detail: { active: true } }));
}

export function disableDemoMode() {
  const backup = sessionStorage.getItem(DEMO_BACKUP);
  if (backup !== null) {
    localStorage.setItem(STORAGE_KEY, backup);
  }
  sessionStorage.removeItem(DEMO_BACKUP);
  sessionStorage.removeItem(DEMO_FLAG);
  clearDemoHikeLength();
  window.dispatchEvent(new CustomEvent('demo-mode-changed', { detail: { active: false } }));
}

export function toggleDemoMode() {
  if (isDemoMode()) disableDemoMode();
  else enableDemoMode();
}

export function setDemoHikeLength(count) {
  sessionStorage.setItem(DEMO_HIKE_LEN, String(count));
}

export function getDemoHikeLength() {
  const n = parseInt(sessionStorage.getItem(DEMO_HIKE_LEN) || '', 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function clearDemoHikeLength() {
  sessionStorage.removeItem(DEMO_HIKE_LEN);
}
