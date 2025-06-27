console.log('[load] hints.js');


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


// 1) Словарь подсказок
const infoContent = {
  purpose: {
    title: 'Цель психогео-прогулки',
    text:  'Опишите намерение или вопрос, который будете исследовать на прогулке: слово, фразу или идею, отражающую ваше внутреннее состояние или запрос.'
  },
  pointType: {
    title: 'Тип точки',
    text:  'Выберите:\n' +
           '- Случайная: полностью рандомная локация;\n' +
           '- Аттрактор: зона повышенной «интенсивности» событий;\n' +
           '- Пустота: места с малой «концентрацией» событий.'
  },
  apiKey: {
    title: 'API-ключ ANU Quantum Numbers',
    text:  'Для получения квантовых чисел нужен личный ключ. ' +
           'Если у вас его нет, перейдите на ' +
           '<a href="https://quantumnumbers.anu.edu.au/" target="_blank" class="text-indigo-600 underline">ANU Quantum Numbers</a> и получите ключ в личном кабинете.'
  }
};

// 2) Обработчик клика по «i»
document.querySelectorAll('.info-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.info;
    const info = infoContent[key];
    if (!info) return;

    document.getElementById('infoTitle').innerText = info.title;
    // Можно вставлять HTML-ссылки:
    document.getElementById('infoText').innerHTML = info.text;

    document.getElementById('infoOverlay').classList.remove('hidden');
  });
});

// 3) Закрытие по кресту или клику вне модалки
document.getElementById('infoClose').addEventListener('click', () => {
  document.getElementById('infoOverlay').classList.add('hidden');
});
document.getElementById('infoOverlay').addEventListener('click', (evt) => {
  if (evt.target === evt.currentTarget) {
    document.getElementById('infoOverlay').classList.add('hidden');
  }
});