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

//API visibility
const apiInput       = document.getElementById('apiKey');
const toggleBtn      = document.getElementById('toggleApiVisibility');
const toggleIcon= document.getElementById('toggleIcon');

toggleBtn.addEventListener('click', () => {
  const isHidden = apiInput.type === 'password';
  apiInput.type  = isHidden ? 'text' : 'password';

  if (isHidden) {
    // показываем «закрытый» глаз
    toggleIcon.classList.remove('fi-ss-eye');
    toggleIcon.classList.add('fi-ss-eye-crossed');
  } else {
    // возвращаем «открытый» глаз
    toggleIcon.classList.remove('fi-ss-eye-crossed');
    toggleIcon.classList.add('fi-ss-eye');
  }
});


//Обновление размеров bottomSheet
function adjustPanelHeight() {
  const sheet  = document.getElementById('bottomSheet');
  const main   = sheet.querySelector('[data-view="main"]');
  // summary или result — что сейчас не скрыто
  const detail = sheet.querySelector('[data-view="summary"]:not([hidden])')
              || sheet.querySelector('[data-view="result"]:not([hidden])');

  const offset = 40; // ваш dragHandle + padding
  // сколько нужно для полной формы
  maxHeight = main.scrollHeight + offset;
  // сколько нужно для summary/result
  minHeight = detail.scrollHeight + offset;

  // ограничиваем общий max-height
  sheet.style.maxHeight = `${window.innerHeight * 0.8}px`;
  // ставим текущую высоту согласно режиму
  sheet.style.height = `${isSummaryMode ? minHeight : maxHeight}px`;
}

// настройка Summary
function updateSummarySnippet() {
  const p = document.getElementById('purpose').value || '—';
  const r = getRadius().toFixed(1);
  const btn = document.querySelector(`.point-btn[data-value="${selectedPointType}"]`);
  const t   = btn ? btn.textContent.trim() : selectedPointType;

  document.getElementById('summarySnippet').innerHTML = `
    <div><span class="font-semibold">Цель:</span> ${escapeHtml(p)}</div>
    <div><span class="font-semibold">Тип точки:</span> ${escapeHtml(t)}</div>
    <div><span class="font-semibold">Радиус:</span> ${escapeHtml(r)} км</div>
  `;
}


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


// ПЕРЕКЛЮЧЕНИЕ КНОПОК "ТИП ТОЧКИ"
// 1) Определяем соответствия для hover- и select-классов
const POINT_HOVER_CLASSES = {
  random:    'hover:bg-[var(--random-button-hover)]',
  attractor: 'hover:bg-[var(--attractor-button-hover)]',
  void:      'hover:bg-[var(--void-button-hover)]'
};

const POINT_SELECT_CLASSES = {
  random:    ['bg-[var(--random-button-select)]',    'border-[var(--random-button-select)]'],
  attractor: ['bg-[var(--attractor-button-select)]', 'border-[var(--attractor-button-select)]'],
  void:      ['bg-[var(--void-button-select)]',      'border-[var(--void-button-select)]']
};

const btns = document.querySelectorAll('.point-btn');

btns.forEach(btn => {
  // Навешиваем hover-классы сразу, если нужно:
  const hoverClass = `hover:bg-[var(--${btn.dataset.value}-button-hover)]`;
  btn.classList.add(hoverClass);

  btn.addEventListener('click', () => {
    // Считаем type именно здесь, а не вне
    const type = btn.dataset.value;  // 'random', 'attractor' или 'void'

    // 1) Сброс состояния у всех
    btns.forEach(b => {
      const t = b.dataset.value;
      // убираем select-классы
      POINT_SELECT_CLASSES[t].forEach(c => b.classList.remove(c));
      // восстанавливаем hover
      b.classList.add(POINT_HOVER_CLASSES[t]);
      // сбрасываем текст
      b.classList.remove('text-black');
      b.classList.add('text-[var(--text-color)]');
      // убираем тень
      b.classList.remove('shadow-md', 'shadow-lg');
    });

    // 2) Выделяем кликнутую
    // убираем её hover
    btn.classList.remove(POINT_HOVER_CLASSES[type]);
    // ставим фон/границу
    btn.classList.add(...POINT_SELECT_CLASSES[type]);
    // чёрный текст
    btn.classList.remove('text-[var(--text-color)]');
    btn.classList.add('text-black');
    // тень
    btn.classList.add('shadow-md');

    // **ВАЖНО**: сохраняем в глобальную переменную
    selectedPointType = type;

    // 3) обновляем текущий цвет UI
    const selColor = getComputedStyle(document.documentElement)
                        .getPropertyValue(`--${type}-button-select`)
                        .trim();
    document.documentElement.style.setProperty('--current-color', selColor);
  });
});

// Инициализируем дефолтный выбор, чтобы всё выставилось сразу
document.querySelector('.point-btn[data-value="random"]').click();





// Нижняя панель: выдвижение
 // const bottomSheet = document.getElementById('bottomSheet');
  const dragHandle = document.getElementById('dragHandle');
 dragHandle.addEventListener('click', () => {
  // если сейчас видим результаты — не даём выдвигать/заводить summary
  if (!document.getElementById('resultContainer').hidden) return;
   // перед переключением summary/main, подставим контент
   if (!isSummaryMode) {
     updateSummarySnippet();
     showSummary();
   } else {
     showMain();
   }
   adjustPanelHeight();
 });


  // Кнопка создания точки
  createBtn.onclick = onCreatePoint;

  // Кнопка "Новая генерация"
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
