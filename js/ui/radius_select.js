console.log('[load] radius_select.js');



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
  updateSummarySnippet,
} from './summary.js';

import {
  onCreatePoint,
} from './point_creation.js';

import {
  POINT_HOVER_CLASSES,
  POINT_SELECT_CLASSES,
} from './point_select.js';

import { state } from '../state.js';

state.selectedPointType = 'random';      // как раньше
  // Радиус по умолчанию
  document.getElementById('radius').value = getRadius();

// ПЕРЕКЛЮЧЕНИЕ КНОПОК "РАДИУС ПОИСКА"
 // Функция, которая обновляет стили у кнопок радиуса поиска
export function updateRadiusButtonStyles() {
  const radiusBtns = document.querySelectorAll('.radius-btn');
  const type       = state.selectedPointType;
  const curRadius  = document.getElementById('radius').value;

  radiusBtns.forEach(btn => {
    // 1) Сброс старых стилей
    //   – hover / select
    Object.values(POINT_HOVER_CLASSES).forEach(c => btn.classList.remove(c));
    Object.values(POINT_SELECT_CLASSES).flat().forEach(c => btn.classList.remove(c));
    //   – утилиты из предыдущей логики
    btn.classList.remove('text-black');

    // 2) Добавляем hover-стиль под текущий тип точки
    btn.classList.add(POINT_HOVER_CLASSES[type]);

    // 3) Если эта кнопка соответствует текущему радиусу
    if (btn.dataset.value === curRadius) {
      // убираем hover, чтобы не реагировала на наведении
      btn.classList.remove(POINT_HOVER_CLASSES[type]);
      //   – select-стили в цвете текущего типа
      btn.classList.add(...POINT_SELECT_CLASSES[type]);
      //   – тёмный текст для контраста
      btn.classList.add('text-black');
    } else {
      //   – дефолтный вид невыбранных
      btn.classList.add('border-[var(--text-color)]','bg-transparent','text-[var(--text-color)]');
    }
  });
  console.log('[load] radius_select.js style update');
}

// --- Обработчики ---

// 1) При выборе типа точки — обновляем радиус-кнопки
document.querySelectorAll('.point-btn').forEach(ptBtn => {
  ptBtn.addEventListener('click', () => {
    state.selectedPointType = ptBtn.dataset.value;
    updateRadiusButtonStyles();
  });
});

// 2) При клике на radius-btn — ставим input, рисуем круг и обновляем стили
document.querySelectorAll('.radius-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('radius').value = btn.dataset.value;
    const coords = getUserCoords();
    if (coords) showCircleOnMap(coords, getRadius());
    updateRadiusButtonStyles();
  });
});

// 3) При ручном вводе в поле radius — сброс всех пресетов и перерисовка круга
document.getElementById('radius').addEventListener('input', () => {
  const coords = getUserCoords();
  if (coords) showCircleOnMap(coords, getRadius());
  updateRadiusButtonStyles();
});

// 4) Инициализация при загрузке страницы
updateRadiusButtonStyles();