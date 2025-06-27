console.log('[load] bottomSheet_controls.js');



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

state.isSummaryMode = false;        // false = main, true = summary

//Обновление размеров bottomSheet
export function adjustPanelHeight() {
  const sheet = document.getElementById('bottomSheet');
  if (!sheet) return;

  const mainEl = sheet.querySelector('[data-view="main"]');
  const detailEl = sheet.querySelector('[data-view="summary"]:not([hidden])')
                || sheet.querySelector('[data-view="result"]:not([hidden])');
  const offset = 40;
  // если mainEl нет — используем высоту всего sheet как резерв
  const maxHeight = mainEl
    ? mainEl.scrollHeight + offset
    : sheet.scrollHeight;

  // если detailEl нет — сворачиваем вплоть до offset
  const minHeight = detailEl
    ? detailEl.scrollHeight + offset
    : offset + 20;

  sheet.style.maxHeight = `${window.innerHeight * 0.8}px`;
  sheet.style.height    = `${state.isSummaryMode ? minHeight : maxHeight}px`;
  console.log('adjust inside');
}


export function showMain() {
  state.isSummaryMode = false;
  document.querySelector('[data-view="main"]').hidden    = false;
  document.querySelector('[data-view="summary"]').hidden = true;
  adjustPanelHeight();  // меряем высоту main-контента
}

export function showSummary() {
  state.isSummaryMode = true;
  document.querySelector('[data-view="main"]').hidden    = true;
  document.querySelector('[data-view="summary"]').hidden = false;
  document.querySelector('[data-view="result"]').hidden = true;
  adjustPanelHeight();  // меряем высоту summarySnippet
}

export function showResult() {
  state.isSummaryMode = true;
  document.querySelector('[data-view="main"]').hidden    = true;
  document.querySelector('[data-view="summary"]').hidden = true;
  document.querySelector('[data-view="result"]').hidden = false;
  adjustPanelHeight();  // меряем высоту summarySnippet
}

// Нижняя панель: выдвижение
 // const bottomSheet = document.getElementById('bottomSheet');
const dragHandle = document.getElementById('dragHandle');
 dragHandle.addEventListener('click', () => {
  // если сейчас видим результаты — не даём выдвигать/заводить summary
  if (!document.getElementById('resultContainer').hidden) return;
   // перед переключением summary/main, подставим контент
   if (!state.isSummaryMode) {
     updateSummarySnippet();
     showSummary();
   } else {
     showMain();
   }
   
 });

 