
console.log('[load] map.js');
// js/map.js
// Управление картой, маркерами и кругами через OpenLayers, экспорт функций для использования из main.js и ui.js

// --- Константы и переменные ---
export const DEFAULT_COORDS = [37.6173, 55.7558]; // [долгота, широта]
let userCoords;

// Слои карты
const rasterLayer = new ol.layer.Tile({ source: new ol.source.OSM() });
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({ source: vectorSource });

// Объекты OpenLayers
let map;
let view;

/**
 * Инициализация карты в контейнере с указанным ID.
 * @param {string} targetId - ID контейнера для карты (по умолчанию 'map').
 * @returns {ol.Map} - объект карты
 */
export function initMap(targetId = 'map') {
  console.log('[map] Init ');
  view = new ol.View({
    center: ol.proj.fromLonLat(DEFAULT_COORDS),
    zoom: 14
  });
  map = new ol.Map({
    target: targetId,
    layers: [rasterLayer, vectorLayer],
    view: view
  });
  return map; 
}

initMap();

/**
 * Устанавливает текущие координаты пользователя.
 * @param {[number, number]} coords - [долгота, широта]
 */
export function setUserCoords(coords) {
  userCoords = coords;
}

/**
 * Возвращает текущие координаты пользователя.
 * @returns {[number, number]}
 */
export function getUserCoords() {
  return userCoords;
}

/**
 * Добавляет или перемещает маркер пользователя на карте.
 * @param {[number, number]} coords - [долгота, широта]
 */
export function addOrMoveUserMarker(coords) {
  // Удаляем старый маркер
  vectorSource.getFeatures()
    .filter(f => f.get('type') === 'user')
    .forEach(f => vectorSource.removeFeature(f));

  // Создаем новый
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(coords)),
    type: 'user'
  });
  feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 8,
      fill: new ol.style.Fill({ color: 'rgba(15,15,15,0.9)' }),
      stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
    })
  }));
  vectorSource.addFeature(feature);
}

// Вспомогательная функция для построения геодезического круга
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
    const lon2 = lon1 + Math.atan2(
      Math.sin(theta) * Math.sin(radiusRad) * Math.cos(lat1),
      Math.cos(radiusRad) - Math.sin(lat1) * Math.sin(lat2)
    );
    const point = ol.proj.fromLonLat([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
    coords.push(point);
  }
  return new ol.geom.Polygon([coords]);
}

/**
 * Отображает геодезический круг на карте.
 * @param {[number, number]} coords - центр круга [долгота, широта]
 * @param {number} radiusKm - радиус в километрах
 */
export function showCircleOnMap(coords, radiusKm) {
  // Удаляем старый круг
  vectorSource.getFeatures()
    .filter(f => f.get('type') === 'circle')
    .forEach(f => vectorSource.removeFeature(f));

  // Создаем новый
  const polygonGeom = createGeodesicCircle(coords, radiusKm, 80);
  const feature = new ol.Feature({ geometry: polygonGeom, type: 'circle' });
  feature.setStyle(new ol.style.Style({
    fill: new ol.style.Fill({ color: 'rgba(30,144,255,0.12)' }),
    stroke: new ol.style.Stroke({ color: '#1e90ff', width: 2 })
  }));
  vectorSource.addFeature(feature);
}

export function displayPointOnMap(point, type = 'random') {
  // Удаляем старые точки этого типа
  vectorSource.getFeatures()
    .filter(f => f.get('type') === type)
    .forEach(f => vectorSource.removeFeature(f));

  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([point.lon, point.lat])),
    type: type
  });
  const color = type === 'random' ? 'red' : type === 'attractor' ? 'orange' : 'green';
  feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({ color: color }),
      stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
    })
  }));
  vectorSource.addFeature(feature);
}

/**
 * Возвращает экземпляр карты (ol.Map).
 * @returns {ol.Map}
 */
export function getMap() {
  console.log('[map] getMap() called →', map);
  return map;
}

export function clearRandomPoint() {
  // ваш vectorSource уже хранит фичи с type==='random'
  vectorSource.getFeatures()
    .filter(f => ['random', 'attractor', 'void'].includes(f.get('type')))
    .forEach(f => vectorSource.removeFeature(f));
}