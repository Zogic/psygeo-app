// js/ui.js
// Логика пользовательского интерфейса: управляющие кнопки, нижняя панель, обработка onCreatePoint и т.д.

import {
  DEFAULT_COORDS,
  setUserCoords,
  getUserCoords,
  addOrMoveUserMarker,
  showCircleOnMap,
  getMap
} from './map.js';
import {
  generatePointInRadius,
  generateRandomPointsInRadius,
  countNeighbors,
  findAttractor,
  findVoid
} from './generator.js';
import {
  getRadius,
  escapeHtml,
  getCurrentTimestamp,
  validateApiAndPurpose
} from './utils.js';

let copyText = '';

// Описания для подсказки по типу точки
const pointTypeDescriptions = {
  random: 'Абсолютно случайное место в выбранном радиусе.',
  attractor: 'Точка, где концентрация случайных чисел максимальна — психогеографы считают, что такие места могут "притягивать" внимание.',
  void: 'Точка, где концентрация случайных чисел минимальна — иногда такие места связаны с особой атмосферой пустоты или редкости событий.'
};

/**
 * Настройка всех UI-элементов и событий
 */
export function setupUI() {
  // Радиус по умолчанию
  document.getElementById('radius').value = getRadius();

  // Кнопка определения местоположения
  document.getElementById('locateBtn').onclick = goToMyLocation;

  // Слушаем клик по карте для установки userCoords
  const map = getMap();
  map.on('click', e => {
    const coord = ol.proj.toLonLat(e.coordinate);
    setUserCoords([coord[0], coord[1]]);
    addOrMoveUserMarker([coord[0], coord[1]]);
    showCircleOnMap([coord[0], coord[1]], getRadius());
  });

  // Валидация формы
  const apiInput = document.getElementById('apiKey');
  const purposeInput = document.getElementById('purpose');
  const createBtn = document.getElementById('createPointBtn');
  const apiWarning = document.getElementById('apiWarning');
  apiInput.addEventListener('input', () => validateApiAndPurpose(createBtn, apiWarning));
  purposeInput.addEventListener('input', () => validateApiAndPurpose(createBtn, apiWarning));

  // Радиус: пресеты и ручной ввод
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('ring', 'ring-indigo-400', 'border-indigo-400', 'bg-indigo-50'));
      btn.classList.add('ring', 'ring-indigo-400', 'border-indigo-400', 'bg-indigo-50');
      document.getElementById('radius').value = btn.dataset.value;
      const coords = getUserCoords();
      if (coords) showCircleOnMap(coords, getRadius());
    });
  });
  document.getElementById('radius').addEventListener('input', () => {
    document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('ring', 'ring-indigo-400', 'border-indigo-400', 'bg-indigo-50'));
    const coords = getUserCoords();
    if (coords) showCircleOnMap(coords, getRadius());
  });

  // Тип точки: подсказка
  document.querySelectorAll('input[name="pointType"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('pointTypeHelp').innerText = pointTypeDescriptions[radio.value];
    });
  });

  // Нижняя панель: выдвижение
  const bottomSheet = document.getElementById('bottomSheet');
  const dragHandle = document.getElementById('dragHandle');
  let expanded = false;
  dragHandle.addEventListener('click', () => {
    expanded = !expanded;
    bottomSheet.classList.toggle('h-[120px]', !expanded);
    bottomSheet.classList.toggle('h-[80vh]', expanded);
  });

  // Скрываем кнопку локации при вводе в форму
  const sheetInputs = document.querySelectorAll('#bottomSheet input, #bottomSheet textarea');
  const locateBtn = document.getElementById('locateBtn');
  sheetInputs.forEach(inp => {
    inp.addEventListener('focus', () => locateBtn.style.display = 'none');
    inp.addEventListener('blur', () => locateBtn.style.display = '');
  });

  // Кнопка создания точки
  createBtn.onclick = onCreatePoint;
}

/**
 * Определяет местоположение через Geolocation API
 */
function goToMyLocation() {
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

/**
 * Генерация точки и вывод результата
 */
function onCreatePoint() {
  const coords = getUserCoords();
  if (!coords) return alert('Сначала выбери стартовую точку!');

  const purpose = document.getElementById('purpose').value || '—';
  const radiusKm = getRadius();
  const type = document.querySelector('input[name="pointType"]:checked').value;

  let point, label;
  if (type === 'random') {
    point = generatePointInRadius(coords[1], coords[0], radiusKm);
    label = 'Случайная точка';
  } else {
    const pts = generateRandomPointsInRadius(coords[1], coords[0], radiusKm, 120);
    const dens = countNeighbors(pts, 250);
    if (type === 'attractor') point = findAttractor(pts, dens), label = 'Аттрактор';
    else point = findVoid(pts, dens), label = 'Пустота';
  }

  // Отобразить на карте
  showCircleOnMap([coords[0], coords[1]], radiusKm);
  const map = getMap();
  map.getView().setCenter(ol.proj.fromLonLat([point.lon, point.lat]));
  map.getView().setZoom(15);

  // Формируем текст
  const timestamp = getCurrentTimestamp();
  copyText = `Цель: ${escapeHtml(purpose)}
Координаты: ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}
Тип точки: ${label}
Время: ${timestamp}`;

  // Выводим
  const yandexUrl = `https://yandex.ru/maps/?pt=${point.lon},${point.lat}&z=15&l=map`;
  document.getElementById('result').innerHTML = `
    <div class="bg-indigo-50 rounded-xl p-4 space-y-2 shadow text-gray-800 text-base">
      <div><span class="font-semibold text-gray-600">Цель:</span> ${escapeHtml(purpose)}</div>
      <div><span class="font-semibold text-gray-600">Координаты:</span> ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</div>
      <div><span class="font-semibold text-gray-600">Тип точки:</span> ${label}</div>
      <div><span class="font-semibold text-gray-600">Время:</span> ${timestamp}</div>
      <button onclick="copyResultText()" class="mt-3 bg-indigo-600 text-white rounded-lg py-2 px-4 w-full font-semibold hover:bg-indigo-700 transition">Скопировать</button>
      <div id="copyFeedback" class="text-green-600 text-center mt-2 hidden"></div>
      <a href="${yandexUrl}" target="_blank" class="mt-2 block w-full text-center bg-yellow-400 hover:bg-yellow-500 rounded-lg py-2 px-4 font-semibold text-gray-800 transition">Открыть в Яндекс.Картах</a>
    </div>
  `;

  // Сброс формы
  document.getElementById('purpose').value = '';
  document.getElementById('createPointBtn').disabled = true;
}

/**
 * Копирует результат в буфер и показывает фидбек
 */
export function copyResultText() {
  navigator.clipboard.writeText(copyText).then(() => {
    const fb = document.getElementById('copyFeedback');
    fb.innerText = 'Текст скопирован!';
    fb.classList.remove('hidden');
    setTimeout(() => fb.classList.add('hidden'), 1500);
  });
}
