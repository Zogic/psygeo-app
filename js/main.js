// js/main.js
// Точка входа: инициализация карты, определение стартовой локации, запуск UI

import { initMap, DEFAULT_COORDS, setUserCoords, addOrMoveUserMarker, showCircleOnMap } from './map.js';
import { setupUI } from './ui.js';

// Ждём полной загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
  // Инициализируем карту в контейнере с ID 'map'
  const map = initMap('map');

  // Попытка получить геолокацию пользователя
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = [position.coords.longitude, position.coords.latitude];
        setUserCoords(coords);
        addOrMoveUserMarker(coords);
        showCircleOnMap(coords, parseFloat(document.getElementById('radius').value));
      },
      () => {
        // Если отказано — используем дефолтные координаты
        setUserCoords(DEFAULT_COORDS);
        addOrMoveUserMarker(DEFAULT_COORDS);
        showCircleOnMap(DEFAULT_COORDS, parseFloat(document.getElementById('radius').value));
      }
    );
  } else {
    // Геолокация не поддерживается — сразу дефолт
    setUserCoords(DEFAULT_COORDS);
    addOrMoveUserMarker(DEFAULT_COORDS);
    showCircleOnMap(DEFAULT_COORDS, parseFloat(document.getElementById('radius').value));
  }

  // Настраиваем пользовательский интерфейс (кнопки, форму, панель)
  setupUI();
});
