console.log('[load] ui_builder.js');


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



export function setupUI() {
 
  // Радиус по умолчанию
  document.getElementById('radius').value = getRadius();

  // Кнопка определения местоположения
  document.getElementById('locateBtn').onclick = goToMyLocation;

  // Валидация формы
  const apiInput = document.getElementById('apiKey');
  const purposeInput = document.getElementById('purpose');
  const createBtn = document.getElementById('createPointBtn');
  const apiWarning = document.getElementById('apiWarning');
  apiInput.addEventListener('input', () => validateApiAndPurpose(createBtn, apiWarning));
  purposeInput.addEventListener('input', () => validateApiAndPurpose(createBtn, apiWarning));

  // Кнопка создания точки
  createBtn.onclick = onCreatePoint;



showMain();         // переключить на main-view

}