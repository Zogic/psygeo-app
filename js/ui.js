// js/ui.js
// Логика пользовательского интерфейса: управляющие кнопки, нижняя панель, обработка onCreatePoint и т.д.

import {
  DEFAULT_COORDS,
  setUserCoords,
  getUserCoords,
  addOrMoveUserMarker,
  showCircleOnMap,
  getMap,
  displayPointOnMap, 
  clearRandomPoint
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
let selectedPointType = 'random';      // как раньше
let isSummaryMode      = false;        // false = main, true = summary
const pointTypeLabels = {
  random:    'Случайная',
  attractor: 'Аттрактор',
  void:      'Пустота'
};




function adjustPanelHeight() {
  const sheet = document.getElementById('bottomSheet');
  // снимем Tailwind-классы высоты
  sheet.classList.remove('h-[120px]', 'h-[80vh]');
  sheet.style.height    = 'auto';
  sheet.style.maxHeight = '80vh';

  // мерим содержимое .sheet-view:not([hidden])
  const active = sheet.querySelector('.sheet-view:not([hidden])');
  const offset = 40; // высота dragHandle + паддинги
  const h = active.scrollHeight + offset;
  const cap = window.innerHeight * 0.8;
  sheet.style.height = `${Math.min(h, cap)}px`;

}

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
    document.querySelectorAll('.radius-btn').forEach(b => {
      // Убираем все стили активной кнопки
      b.classList.remove(
        'ring-indigo-400',
        'border-indigo-400',
        'bg-indigo-50',
        // и убираем нейтральные стили, чтобы не конфликтовали
        'border-gray-300',
        'bg-white'
      );
      // Восстанавливаем дефолтную границу для неактивных
      b.classList.add('border-gray-300', 'bg-white');
    });

    // Настраиваем текущую кнопку как активную
    btn.classList.remove('border-gray-300', 'bg-white');
    btn.classList.add(
      'ring-indigo-400',
      'border-indigo-400',
      'bg-indigo-50'
    );

    // Обновляем радиус и круг на карте
    document.getElementById('radius').value = btn.dataset.value;
    const coords = getUserCoords();
    if (coords) showCircleOnMap(coords, getRadius());
    selectedPointType = btn.dataset.value;
  });
});

// При ручном вводе — сбрасываем выделение у кнопок
document.getElementById('radius').addEventListener('input', () => {
  document.querySelectorAll('.radius-btn').forEach(b => {
    b.classList.remove(
      'ring-indigo-400',
      'border-indigo-400',
      'bg-indigo-50'
    );
    // возвращаем дефолтный вид
    b.classList.add('border-gray-300', 'bg-white');
  });
  const coords = getUserCoords();
  if (coords) showCircleOnMap(coords, getRadius());
});

  // при клике на кнопки типа точки
document.querySelectorAll('.point-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // сбросить активный стиль у всех
    document.querySelectorAll('.point-btn').forEach(b => {
      b.classList.remove('ring-indigo-400', 'border-indigo-400', 'bg-indigo-50');
      b.classList.add('border-gray-300','bg-white');
    });
    // выделить текущую
    btn.classList.add('ring-indigo-400', 'border-indigo-400', 'bg-indigo-50');
    // убрать серый фон
    btn.classList.remove('border-gray-300','bg-white');
    // записать выбор в скрытое поле или прямо в логику
    const type = btn.dataset.value;
    // обновить подсказку
    document.getElementById('pointTypeHelp').innerText = {
      random: 'Абсолютно случайное место в выбранном радиусе.',
      attractor: 'Точка, где концентрация случайных чисел максимальна — может “притягивать” внимание.',
      void: 'Точка, где концентрация минимальна — особая атмосфера “пустоты”.'
    }[type];
    // сохранить выбор в переменную, которую используете при генерации
    selectedPointType = type;
  });
});


  // Нижняя панель: выдвижение
 // const bottomSheet = document.getElementById('bottomSheet');
  const dragHandle = document.getElementById('dragHandle');
 dragHandle.addEventListener('click', () => {
  // если сейчас видим результаты — не даём выдвигать/заводить summary
  if (!document.getElementById('resultContainer').hidden) return;
   // перед переключением summary/main, подставим контент
   if (!isSummaryMode) {
     // summary mode — отображаем текущие настройки
     const p = document.getElementById('purpose').value || '—';
     const r = getRadius().toFixed(1);
     const t = pointTypeLabels[selectedPointType] || selectedPointType;
     document.getElementById('summarySnippet').innerHTML = `
  <div><span class="font-semibold text-gray-600">Цель:</span> ${escapeHtml(p)}</div>
  <div><span class="font-semibold text-gray-600">Тип точки:</span> ${escapeHtml(t)}</div>
  <div><span class="font-semibold text-gray-600">Радиус:</span> ${escapeHtml(r)} км</div>
`;
       
     showSummary();
   } else {
     showMain();
   }
   adjustPanelHeight();
 });


 

  // Кнопка создания точки
  createBtn.onclick = onCreatePoint;

  // ОБЯЗАТЕЛЬНО: вешаем один раз, пока кнопка есть в DOM
  document.getElementById('newPointBtn').addEventListener('click', () => {
    // 1) Убираем точку с карты
    clearRandomPoint();
    // 2) Сбрасываем форму и поле Цель
   // resetForm();
    document.getElementById('purpose').value = '';
    // 3) Показываем форму, скрываем результаты
    document.getElementById('formContainer').hidden   = false;
    document.getElementById('resultContainer').hidden = true;
    document.getElementById('dragHandle').hidden = false;
    // 4) Пересчитываем высоту панели
    adjustPanelHeight();
  });

showMain();         // переключить на main-view
adjustPanelHeight(); // подогнать высоту под содержимое main
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
  if (!coords) {
    alert('Сначала выбери стартовую точку!');
    return;
  }

  // 1) Собираем входные данные
  const purpose  = document.getElementById('purpose').value || '—';
  const radiusKm = getRadius();
  const type     = selectedPointType; // 'random'|'attractor'|'void'

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

  // 3) Собираем текст результата
  const timestamp = getCurrentTimestamp();
  copyText = 
    `Цель: ${escapeHtml(purpose)}\n` +
    `Координаты: ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}\n` +
    `Тип точки: ${label}\n` +
    `Время: ${timestamp}`;

  // 4) Формируем HTML результата
  const yandexUrl = `https://yandex.ru/maps/?pt=${point.lon},${point.lat}&z=15&l=map`;
  document.getElementById('resultContent').innerHTML = `
    <div class="bg-indigo-50 rounded-xl p-4 space-y-2 shadow text-gray-800 text-base">
      <div><span class="font-semibold text-gray-600">Цель:</span> ${escapeHtml(purpose)}</div>
      <div><span class="font-semibold text-gray-600">Координаты:</span> ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</div>
      <div><span class="font-semibold text-gray-600">Тип точки:</span> ${label}</div>
      <div><span class="font-semibold text-gray-600">Время:</span> ${timestamp}</div>
      <button id="copyBtn"
        class="mt-3 bg-indigo-600 text-white rounded-lg py-2 px-4 w-full font-semibold hover:bg-indigo-700 transition">
        Скопировать
      </button>
      <a href="${yandexUrl}" target="_blank"
        class="mt-2 block w-full text-center bg-yellow-400 hover:bg-yellow-500 rounded-lg py-2 px-4 font-semibold text-gray-800 transition">
        Открыть в Яндекс.Картах
      </a>
    </div>
  `;

  // 5) Скрываем форму и показываем результат
  document.getElementById('formContainer').hidden   = true;
  document.getElementById('resultContainer').hidden = false;
   document.getElementById('dragHandle').hidden = true;
   adjustPanelHeight();

  // 6) Навешиваем копирование
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(copyText).then(() => {
      alert('Текст скопирован!');
    });
  };

  

}


function showMain() {
  isSummaryMode = false;
  document.querySelector('[data-view="main"]').hidden    = false;
  document.querySelector('[data-view="summary"]').hidden = true;
  adjustPanelHeight();  // меряем высоту main-контента
}

function showSummary() {
  isSummaryMode = true;
  document.querySelector('[data-view="main"]').hidden    = true;
  document.querySelector('[data-view="summary"]').hidden = false;
  adjustPanelHeight();  // меряем высоту summarySnippet
}