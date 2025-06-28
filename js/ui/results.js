console.log('[load] results.js');

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


export function createResult({ purpose, point, label }) {
  // 1) Собираем текстовые данные
  const timestamp = getCurrentTimestamp();
  const coordsText = `${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`;
  const yandexUrl = `https://yandex.ru/maps/?pt=${point.lon},${point.lat}&z=15&l=map`;

  // 2) Подставляем в DOM
  document.getElementById('resultPurpose').textContent      = purpose;
  document.getElementById('resultCoordinates').textContent  = coordsText;
  document.getElementById('resultType').textContent         = label;
  document.getElementById('resultTime').textContent         = timestamp;

  const openMapBtn = document.getElementById('openMapBtn');
  openMapBtn.href = yandexUrl;
}

// Кнопка "Новая генерация"
export function newSetup(){
    clearRandomPoint();
    document.getElementById('purpose').value = '';
    showMain(); console.log('On new generation adjust');
}
  
  