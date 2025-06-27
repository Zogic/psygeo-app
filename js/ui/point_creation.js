console.log('[load] point_creation.js');



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
  showResult
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

import { state } from '../state.js';

let copyText = '';
state.selectedPointType = 'random';      // как раньше

/**
 * Генерация точки и вывод результата
 */
export function onCreatePoint() {
  const coords = getUserCoords();
  if (!coords) {
    alert('Сначала выбери стартовую точку!');
    return;
  }

  // 1) Собираем входные данные
  const purpose  = document.getElementById('purpose').value || '—';
  const radiusKm = getRadius();
  const type     = state.selectedPointType; // 'random'|'attractor'|'void'

  // 2) Генерируем точку и рисуем её
  let point, label;
  if (type === 'random') {
    point = generatePointInRadius(coords[1], coords[0], radiusKm);
    label = 'Случайная точка';
  } else {
    const pts = generateRandomPointsInRadius(coords[1], coords[0], radiusKm, 120);
    const dens = countNeighbors(pts, 250);
    if (type === 'attractor') {
      point = findAttractor(pts, dens);
      label = 'Аттрактор';
    } else {
      point = findVoid(pts, dens);
      label = 'Пустота';
    }
  }
  displayPointOnMap(point, type);

  // 3) Собираем текст результата
  const timestamp = getCurrentTimestamp();
  copyText = 
    `Цель: ${escapeHtml(purpose)}\n` +
    `Координаты: ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}\n` +
    `Тип точки: ${label}\n` +
    `Время: ${timestamp}`;

  // 4) Формируем HTML результата
  const yandexUrl = `https://yandex.ru/maps/?pt=${point.lon},${point.lat}&z=15&l=map`;
  document.getElementById('resultContent').innerHTML = `
    <div class="bg-indigo-50 rounded-xl p-4 space-y-2 shadow text-gray-800 text-base">
      <div><span class="font-semibold text-gray-600">Цель:</span> ${escapeHtml(purpose)}</div>
      <div><span class="font-semibold text-gray-600">Координаты:</span> ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</div>
      <div><span class="font-semibold text-gray-600">Тип точки:</span> ${label}</div>
      <div><span class="font-semibold text-gray-600">Время:</span> ${timestamp}</div>
      <button id="copyBtn"
        class="mt-3 bg-indigo-600 text-white rounded-lg py-2 px-4 w-full font-semibold hover:bg-indigo-700 transition">
        Скопировать
      </button>
      <a href="${yandexUrl}" target="_blank"
        class="mt-2 block w-full text-center bg-yellow-400 hover:bg-yellow-500 rounded-lg py-2 px-4 font-semibold text-gray-800 transition">
        Открыть в Яндекс.Картах
      </a>
    </div>
  `;
   
  // 5) Скрываем форму и показываем результат
  document.getElementById('formContainer').hidden   = true;
  document.getElementById('resultContainer').hidden = false;
  document.getElementById('dragHandle').hidden = true;
  showResult(); 
  console.log('adjust on creation');

  // 6) Навешиваем копирование
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(copyText).then(() => {
      alert('Текст скопирован!');
    });
  };
    
}