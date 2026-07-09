/** Адаптивный размер клеток для игровых полей */

export function getResponsiveCellSize({
  gridSize,
  maxCell = 80,
  minCell = 28,
  horizontalPadding = 40,
  container = null,
}) {
  let available = window.innerWidth - horizontalPadding;
  if (container) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (el?.clientWidth) available = el.clientWidth;
  }
  const fromViewport = Math.floor(available / gridSize);
  return Math.min(maxCell, Math.max(minCell, fromViewport));
}

export function onBoardResize(callback) {
  let timer;
  const handler = () => {
    clearTimeout(timer);
    timer = setTimeout(callback, 120);
  };
  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', handler);
  return () => {
    window.removeEventListener('resize', handler);
    window.removeEventListener('orientationchange', handler);
    clearTimeout(timer);
  };
}
