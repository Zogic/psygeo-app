// js/map.js
console.log("[load] map.js — using DOM Overlays for markers and circles");

// --- Константы и переменные ---
export const DEFAULT_COORDS = [37.6173, 55.7558]; // [долгота, широта]
let userCoords;

// храним Overlay’ы, чтобы легко обновлять/удалять
let userOverlay = null;
let circleOverlay = null;
const pointOverlays = { random: null, attractor: null, void: null };

// OpenLayers объекты
let map, view;

// --- Помощник: прочитать CSS-переменную ---
function getCssVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// --- Инициализация карты ---
export function initMap(targetId = "map") {
  view = new ol.View({
    center: ol.proj.fromLonLat(DEFAULT_COORDS),
    zoom: 14,
  });
  map = new ol.Map({
    target: targetId,
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    view: view,
  });
  return map;
}
initMap();
view.on("change:resolution", () => {
  if (currentCircleKm !== null) {
    _updateCircleSVG(currentCircleKm);
  }
});

let currentCircleKm = null;

// --- Координаты пользователя ---
export function setUserCoords(coords) {
  userCoords = coords;
}
export function getUserCoords() {
  return userCoords;
}

// --- Маркер пользователя как DOM-Overlay ---
export function addOrMoveUserMarker(coords) {
  setUserCoords(coords);

  // Если уже есть Overlay — просто передвинем
  if (userOverlay) {
    userOverlay.setPosition(ol.proj.fromLonLat(coords));
    return;
  }

  // Иначе создаём новый HTML-элемент
  const el = document.createElement("div");
  el.className = "user-marker";

  // создаём Overlay
  userOverlay = new ol.Overlay({
    element: el,
    positioning: "center-center",
    stopEvent: false,
  });
  userOverlay.setPosition(ol.proj.fromLonLat(coords));
  map.addOverlay(userOverlay);
}

// --- Геодезический круг как SVG в Overlay ---
export function showCircleOnMap(coords, radiusKm) {
  // Сохраняем, чтобы ресайзить позже
  currentCircleKm = radiusKm;

  // Если уже есть overlay — удалим
  if (circleOverlay) {
    map.removeOverlay(circleOverlay);
    circleOverlay = null;
  }

  // Создадим обёртку (без SVG, SVG вставится уже в _updateCircleSVG)
  const wrapper = document.createElement("div");
  wrapper.className = "circle-overlay";
  wrapper.style.position = "absolute"; // чтобы transform работал правильно

  circleOverlay = new ol.Overlay({
    element: wrapper,
    positioning: "center-center", // центрируем по координате
    stopEvent: false,
  });
  circleOverlay.setPosition(ol.proj.fromLonLat(coords));
  map.addOverlay(circleOverlay);

  // И сразу отрисуем SVG
  _updateCircleSVG(radiusKm);
}

// Вспомогательная: (re)рисует SVG внутрь wrapper-а
function _updateCircleSVG(radiusKm) {
  if (!circleOverlay) return;
  const wrapper = circleOverlay.getElement();
  const resolution = view.getResolution();
  const radiusPx = (radiusKm * 1000) / resolution;

  // Обновляем HTML
  wrapper.innerHTML = `
    <svg width="${2 * radiusPx}" height="${2 * radiusPx}"
         viewBox="0 0 ${2 * radiusPx} ${2 * radiusPx}">
      <circle
        cx="${radiusPx}"
        cy="${radiusPx}"
        r="${radiusPx}"
        fill="var(--current-color)" fill-opacity="0.1"
        stroke="var(--current-color)" stroke-width="2"
      />
    </svg>`;
  // Смещаем так, чтобы центр SVG точно в координате
  wrapper.style.transform = `translate(${-radiusPx}px,${-radiusPx}px)`;
}

// --- Точки (random/attractor/void) как HTML-элементы Overlay’ы ---
export function displayPointOnMap(point, type = "random") {
  // 1) если уже есть — убираем старый
  if (pointOverlays[type]) {
    map.removeOverlay(pointOverlays[type]);
    pointOverlays[type] = null;
  }

  // 2) создаём элемент и сразу добавляем все нужные утилиты Tailwind
  const el = document.createElement("div");
  el.classList.add(`${type}-marker`);

  // 3) привязываем его к координатам
  const overlay = new ol.Overlay({
    element: el,
    positioning: "center-center",
    stopEvent: false,
  });
  overlay.setPosition(ol.proj.fromLonLat([point.lon, point.lat]));
  map.addOverlay(overlay);
  pointOverlays[type] = overlay;
}

// --- Очищаем все «рандомные» точки ---
export function clearRandomPoint() {
  ["random", "attractor", "void"].forEach((type) => {
    if (pointOverlays[type]) {
      map.removeOverlay(pointOverlays[type]);
      pointOverlays[type] = null;
    }
  });
}

// --- Доступ к карте (для других модулей) ---
export function getMap() {
  return map;
}
