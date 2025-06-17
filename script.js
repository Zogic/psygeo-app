// --- Центр Москвы по умолчанию
const DEFAULT_COORDS = [37.6173, 55.7558]; // [долгота, широта]
let userCoords = undefined;

// --- Слои ---
const rasterLayer = new ol.layer.Tile({ source: new ol.source.OSM() });
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({ source: vectorSource });

// --- View (сначала на центр Москвы)
const view = new ol.View({
  center: ol.proj.fromLonLat(DEFAULT_COORDS),
  zoom: 14
});

// --- Инициализация карты ---
const map = new ol.Map({
  target: 'map',
  layers: [rasterLayer, vectorLayer],
  view: view
});

// --- Радиус по умолчанию ---
document.getElementById('radius').value = 1;

// --- Попытка получить геолокацию ---
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      userCoords = [lon, lat];
      view.setCenter(ol.proj.fromLonLat(userCoords));
      addOrMoveUserMarker(userCoords);
      showCircleOnMap(userCoords, getRadius());
    },
    () => {
      // Не дали геолокацию — используем дефолт
      userCoords = DEFAULT_COORDS;
      view.setCenter(ol.proj.fromLonLat(userCoords));
      addOrMoveUserMarker(userCoords);
      showCircleOnMap(userCoords, getRadius());
    }
  );
} else {
  // Геолокация не поддерживается
  userCoords = DEFAULT_COORDS;
  view.setCenter(ol.proj.fromLonLat(userCoords));
  addOrMoveUserMarker(userCoords);
  showCircleOnMap(userCoords, getRadius());
}

// --- Кнопка "Определить местоположение" ---
document.getElementById("locateBtn").onclick = goToMyLocation;

// --- Поддержка ручной установки координаты по клику на карту ---
map.on('click', function(e) {
  const coord = ol.proj.toLonLat(e.coordinate);
  console.log("Тап по карте! Долгота:", coord[0], "Широта:", coord[1]);
  userCoords = [coord[0], coord[1]];
  addOrMoveUserMarker(userCoords);
  showCircleOnMap(userCoords, getRadius());
});

// --- Слушаем изменения поля "Цель" ---
document.getElementById("purpose").addEventListener("input", function() {
  checkFormValidity();
});

// --- Вспомогательные функции ---
function getRadius() {
  const val = parseFloat(document.getElementById("radius").value);
  return (!isNaN(val) && val > 0) ? val : 1;
}

function addOrMoveUserMarker(coords) {
  vectorSource.getFeatures().filter(f => f.get('type') === 'user').forEach(f => vectorSource.removeFeature(f));
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(coords)),
    type: 'user'
  });
  feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 8,
      fill: new ol.style.Fill({ color: 'blue' }),
      stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
    })
  }));
  vectorSource.addFeature(feature);
}

function createGeodesicCircle(center, radiusKm, points = 64) {
  const lat = center[1];
  const lon = center[0];
  const coords = [];
  const earthRadius = 6371;
  const radiusRad = radiusKm / earthRadius;

  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(radiusRad) +
      Math.cos(lat1) * Math.sin(radiusRad) * Math.cos(theta)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(theta) * Math.sin(radiusRad) * Math.cos(lat1),
        Math.cos(radiusRad) - Math.sin(lat1) * Math.sin(lat2)
      );
    coords.push(ol.proj.fromLonLat([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]));
  }
  return new ol.geom.Polygon([coords]);
}

function showCircleOnMap(coords, radiusKm) {
  vectorSource.getFeatures().filter(f => f.get('type') === 'circle').forEach(f => vectorSource.removeFeature(f));
  const polygon = createGeodesicCircle(coords, radiusKm, 80);
  const feature = new ol.Feature({
    geometry: polygon,
    type: 'circle'
  });
  feature.setStyle(new ol.style.Style({
    fill: new ol.style.Fill({ color: 'rgba(30,144,255,0.12)' }),
    stroke: new ol.style.Stroke({ color: '#1e90ff', width: 2 })
  }));
  vectorSource.addFeature(feature);
}

// --- Генерация одной точки ---
function generatePointInRadius(lat, lon, radiusKm) {
  const earthRadius = 6371;
  const radiusRad = radiusKm / earthRadius;
  const theta = Math.random() * 2 * Math.PI;
  const randRadius = Math.sqrt(Math.random()) * radiusRad;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(randRadius) +
      Math.cos(lat1) * Math.sin(randRadius) * Math.cos(theta)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(randRadius) * Math.cos(lat1),
      Math.cos(randRadius) - Math.sin(lat1) * Math.sin(lat2)
    );
  return {
    lat: (lat2 * 180) / Math.PI,
    lon: (lon2 * 180) / Math.PI,
  };
}

function generateRandomPointsInRadius(lat, lon, radiusKm, count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push(generatePointInRadius(lat, lon, radiusKm));
  }
  return points;
}

function countNeighbors(points, radiusM) {
  function distance(a, b) {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const aVal = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(aVal));
  }
  return points.map((pt, i) =>
    points.reduce((cnt, other, j) => i!==j && distance(pt, other) < radiusM ? cnt+1 : cnt, 0)
  );
}

function findAttractor(points, densities) {
  const maxDensity = Math.max(...densities);
  const idx = densities.indexOf(maxDensity);
  return points[idx];
}

function findVoid(points, densities) {
  const minDensity = Math.min(...densities);
  const idx = densities.indexOf(minDensity);
  return points[idx];
}

// --- Отобразить случайную точку/аттрактор/пустоту ---
function displayPointOnMap(point, label="Точка") {
  vectorSource.getFeatures().filter(f => f.get('type') === 'random').forEach(f => vectorSource.removeFeature(f));
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([point.lon, point.lat])),
    type: 'random'
  });
  feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({ color: 'red' }),
      stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
    })
  }));
  vectorSource.addFeature(feature);

  view.setCenter(ol.proj.fromLonLat([point.lon, point.lat]));
  view.setZoom(15);
}

// --- Кнопки для типа точки ---
const pointTypeDescriptions = {
  random: 'Абсолютно случайное место в выбранном радиусе.',
  attractor: 'Точка, где концентрация случайных чисел максимальна — психогеографы считают, что такие места могут “притягивать” внимание.',
  void: 'Точка, где концентрация случайных чисел минимальна — иногда такие места связаны с особой атмосферой “пустоты” или редкости событий.'
};

document.querySelectorAll('input[name="pointType"]').forEach(radio => {
  radio.addEventListener('change', function() {
    document.getElementById('pointTypeHelp').innerHTML = pointTypeDescriptions[this.value];
  });
});

// --- Реакция на изменение радиуса ---
document.getElementById("radius").addEventListener("input", () => {
  if (userCoords) {
    showCircleOnMap(userCoords, getRadius());
  }
});

// --- Кнопка "определить локацию" ---
function goToMyLocation() {
  if (!('geolocation' in navigator)) {
    alert("Геолокация не поддерживается.");
    return;
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    userCoords = [lon, lat];
    view.setCenter(ol.proj.fromLonLat(userCoords));
    view.setZoom(15);
    addOrMoveUserMarker(userCoords);
    showCircleOnMap(userCoords, getRadius());
  }, () => {
    alert("Не удалось определить местоположение.");
  });
}
document.getElementById("locateBtn").onclick = goToMyLocation;

// --- Генерация точки и вывод ---
function onCreatePoint() {
  // Проверка API перед запуском
  const api = document.getElementById("apiKey").value.trim();
  if (api !== "12345") {
    document.getElementById("apiWarning").style.display = "block";
    document.getElementById("createPointBtn").disabled = true;
    return;
  }

  if (
    !userCoords ||
    isNaN(userCoords[0]) ||
    isNaN(userCoords[1]) ||
    isNaN(getRadius()) ||
    getRadius() <= 0
  ) {
    alert("Сначала выбери стартовую точку и задай радиус!");
    return;
  }
  const purpose = document.getElementById("purpose").value || "—";
  const radiusKm = getRadius();
  const type = document.querySelector('input[name="pointType"]:checked').value;
  let point, typeLabel;

  if (type === "random") {
    point = generatePointInRadius(userCoords[1], userCoords[0], radiusKm);
    typeLabel = "Случайная точка";
  }
  if (type === "attractor") {
    const points = generateRandomPointsInRadius(userCoords[1], userCoords[0], radiusKm, 120);
    const densities = countNeighbors(points, 250);
    point = findAttractor(points, densities);
    typeLabel = "Аттрактор";
  }
  if (type === "void") {
    const points = generateRandomPointsInRadius(userCoords[1], userCoords[0], radiusKm, 120);
    const densities = countNeighbors(points, 250);
    point = findVoid(points, densities);
    typeLabel = "Пустота";
  }

  // Отображаем точку на карте
  displayPointOnMap(point, typeLabel);

  // Дата/время
  const now = new Date();
  const timestr = now.toLocaleString();

  // Координаты для Яндекс.Карт (в формате lon,lat)
  const yandexUrl = `https://yandex.ru/maps/?pt=${point.lon},${point.lat}&z=15&l=map`;

  // Итоговый текст
  const copyText = `Цель: ${purpose}
Координаты: ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}
Тип точки: ${typeLabel}
Время: ${timestr}`;

  document.getElementById("result").innerHTML = `
  <div class="bg-indigo-50 rounded-xl p-4 space-y-2 shadow text-gray-800 text-base">
    <div><span class="font-semibold text-gray-600">Цель:</span> ${escapeHtml(purpose)}</div>
    <div><span class="font-semibold text-gray-600">Координаты:</span> ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</div>
    <div><span class="font-semibold text-gray-600">Тип точки:</span> ${typeLabel}</div>
    <div><span class="font-semibold text-gray-600">Время:</span> ${timestr}</div>
    <button onclick="copyResultText()" class="mt-3 bg-indigo-600 text-white rounded-lg py-2 px-4 w-full font-semibold hover:bg-indigo-700 transition">
      Скопировать
    </button>
    <div id="copyFeedback" class="text-green-600 text-center mt-2 hidden"></div>
    <a href="${yandexUrl}" target="_blank" class="mt-2 block w-full text-center bg-yellow-400 hover:bg-yellow-500 rounded-lg py-2 px-4 font-semibold text-gray-800 transition">
      Открыть в Яндекс.Картах
    </a>
  </div>
`;
  window.copyText = copyText; // сохраняем для функции копирования

  // Очищаем поле "Цель" и блокируем кнопку
  document.getElementById("purpose").value = "";
  document.getElementById("createPointBtn").disabled = true;
}

// --- Копировать результат ---
function copyResultText() {
  navigator.clipboard.writeText(window.copyText).then(() => {
    const fb = document.getElementById("copyFeedback");
    if (fb) {
      fb.innerText = "Текст скопирован!";
      fb.classList.remove("hidden");
      setTimeout(() => fb.classList.add("hidden"), 1500);
    }
  });
}

// --- Валидация формы ---
function checkFormValidity() {
  const api = document.getElementById("apiKey").value.trim();
  const purpose = document.getElementById("purpose").value.trim();
  const btn = document.getElementById("createPointBtn");
  const warning = document.getElementById("apiWarning");

  if (api !== "12345") {
    btn.disabled = true;
    warning.style.display = "block";
  } else if (purpose === "") {
    btn.disabled = true;
    warning.style.display = "none";
  } else {
    btn.disabled = false;
    warning.style.display = "none";
  }
}

document.getElementById("apiKey").addEventListener("input", checkFormValidity);
document.getElementById("purpose").addEventListener("input", checkFormValidity);

// --- Защита HTML ---
function escapeHtml(str) {
  return str.replace(/[<>&"]/g, function(c) {
    return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];
  });
}

// --- Выделение активного пресета радиуса ---
document.querySelectorAll('.radius-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('ring', 'ring-indigo-400', 'border-indigo-400', 'bg-indigo-50'));
    this.classList.add('ring', 'ring-indigo-400', 'border-indigo-400', 'bg-indigo-50');
    document.getElementById('radius').value = this.dataset.value;
    if (userCoords) {
      showCircleOnMap(userCoords, getRadius());
    }
  });
});
document.getElementById('radius').addEventListener('input', function() {
  document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('ring', 'ring-indigo-400', 'border-indigo-400', 'bg-indigo-50'));
});
