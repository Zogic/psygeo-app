console.log('[load] summary.js');


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
  onCreatePoint,
} from './point_creation.js';

import { state } from '../state.js';


// настройка Summary
export function updateSummarySnippet() {
  const p = document.getElementById('purpose').value || '—';
  const r = getRadius().toFixed(1);
  const btn = document.querySelector(`.point-btn[data-value="${state.selectedPointType}"]`);
  const t   = btn ? btn.textContent.trim() : state.selectedPointType;
  document.getElementById('summaryPurpose').textContent = p;
  document.getElementById('summaryType')   .textContent = t;
  document.getElementById('summaryRadius') .textContent = `${r} км`;
}