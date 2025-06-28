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

import {
  createResult,
} from './results.js';



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

   
  createResult({
  purpose: escapeHtml(purpose),
  point,
  label: label
});
showResult();

  console.log('adjust on creation');

    
}