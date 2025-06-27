console.log('[load] point_select.js');


import {
  DEFAULT_COORDS,
  setUserCoords,
  getUserCoords,
  addOrMoveUserMarker,
  showCircleOnMap,
  getMap,
  displayPointOnMap, 
  clearRandomPoint
} from '../map.js';
import {
  generatePointInRadius,
  generateRandomPointsInRadius,
  countNeighbors,
  findAttractor,
  findVoid
} from '../generator.js';
import {
  getRadius,
  escapeHtml,
  getCurrentTimestamp,
  validateApiAndPurpose
} from '../utils.js';
import {
  adjustPanelHeight,
  showMain,
  showSummary,
} from './bottomSheet_controls.js';

import {
  goToMyLocation,
} from './map_controls.js';

import {
  updateRadiusButtonStyles,
} from './radius_select.js';

import {
  updateSummarySnippet,
} from './summary.js';

import {
  onCreatePoint,
} from './point_creation.js';

import { state } from '../state.js';

// ПЕРЕКЛЮЧЕНИЕ КНОПОК "ТИП ТОЧКИ"
// 1) Определяем соответствия для hover- и select-классов
export const POINT_HOVER_CLASSES = {
  random:    'hover:bg-[var(--random-button-hover)]',
  attractor: 'hover:bg-[var(--attractor-button-hover)]',
  void:      'hover:bg-[var(--void-button-hover)]'
};

export const POINT_SELECT_CLASSES = {
  random:    ['bg-[var(--random-button-select)]',    'border-[var(--random-button-select)]'],
  attractor: ['bg-[var(--attractor-button-select)]', 'border-[var(--attractor-button-select)]'],
  void:      ['bg-[var(--void-button-select)]',      'border-[var(--void-button-select)]']
};

const btns = document.querySelectorAll('.point-btn');

btns.forEach(btn => {
  // Навешиваем hover-классы сразу, если нужно:
  const hoverClass = `hover:bg-[var(--${btn.dataset.value}-button-hover)]`;
  btn.classList.add(hoverClass);

  btn.addEventListener('click', () => {
    // Считаем type именно здесь, а не вне
    const type = btn.dataset.value;  // 'random', 'attractor' или 'void'

    // 1) Сброс состояния у всех
    btns.forEach(b => {
      const t = b.dataset.value;
      // убираем select-классы
      POINT_SELECT_CLASSES[t].forEach(c => b.classList.remove(c));
      // восстанавливаем hover
      b.classList.add(POINT_HOVER_CLASSES[t]);
      // сбрасываем текст
      b.classList.remove('text-[var(--color-black)]');
      b.classList.add('text-[var(--text-color)]');
    });

    // 2) Выделяем кликнутую
    // убираем её hover
    btn.classList.remove(POINT_HOVER_CLASSES[type]);
    // ставим фон/границу
    btn.classList.add(...POINT_SELECT_CLASSES[type]);
    // чёрный текст
    btn.classList.remove('text-[var(--text-color)]');
    btn.classList.add('text-[var(--color-black)]');

    // **ВАЖНО**: сохраняем в глобальную переменную
    state.selectedPointType = type;

    // 3) обновляем текущий цвет UI
    const selColor = getComputedStyle(document.documentElement)
                        .getPropertyValue(`--${type}-button-select`)
                        .trim();
    document.documentElement.style.setProperty('--current-color', selColor);
  });
});

// Инициализируем дефолтный выбор, чтобы всё выставилось сразу
document.querySelector('.point-btn[data-value="random"]').click();