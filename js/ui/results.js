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




  // Кнопка "Новая генерация"
  document.getElementById('resultContainer').addEventListener('click', e => {
  if (e.target.id === 'newPointBtn') {
    clearRandomPoint();
    document.getElementById('purpose').value = '';
    formContainer.hidden   = false;
    resultContainer.hidden = true;
    dragHandle.hidden      = false;
    showMain();
  }
});