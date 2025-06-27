console.log('[load] map_controls.js');


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
  updateRadiusButtonStyles,
} from './radius_select.js';

import {
  updateSummarySnippet,
} from './summary.js';

import {
  onCreatePoint,
} from './point_creation.js';


// Слушаем клик по карте для установки userCoords
  const map = getMap();
  map.on('click', e => {
    const coord = ol.proj.toLonLat(e.coordinate);
    setUserCoords([coord[0], coord[1]]);
    addOrMoveUserMarker([coord[0], coord[1]]);
    showCircleOnMap([coord[0], coord[1]], getRadius());
  });

  /**
   * Определяет местоположение через Geolocation API
   */
  export function goToMyLocation() {
    if (!('geolocation' in navigator)) {
      return alert('Геолокация не поддерживается.');
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      setUserCoords(coords);
      addOrMoveUserMarker(coords);
      showCircleOnMap(coords, getRadius());
    }, () => alert('Не удалось определить местоположение.'));
  }