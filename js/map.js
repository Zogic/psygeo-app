console.log(
  "[load] map.js — using geodesic circle as vector layer and overlays for markers"
);

// --- Constants and variables ---
export const DEFAULT_COORDS = [37.6173, 55.7558]; // [lon, lat]
let userCoords;
let userOverlay = null;
const pointOverlays = { random: null, attractor: null, void: null };

// OpenLayers objects
let map, view;

// Vector layer for geodesic circle
let circleSource = null;
let circleLayer = null;
let currentCircleKm = null;

// --- Helper: read CSS variable ---
function getCssVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// --- Geodesic destination point ---
function destinationPoint(lat, lon, radiusKm, bearingDeg) {
  const R = 6371; // Earth radius in km
  const d = radiusKm / R;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lon: (lon2 * 180) / Math.PI,
  };
}

// --- Initialize map ---
export function initMap(targetId = "map") {
  view = new ol.View({
    center: ol.proj.fromLonLat(DEFAULT_COORDS),
    zoom: 14,
  });
  map = new ol.Map({
    target: targetId,
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    view,
  });

  // Prepare vector layer for geodesic circle
  circleSource = new ol.source.Vector();
  circleLayer = new ol.layer.Vector({
    source: circleSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: getCssVar("--current-color"),
        width: 2,
      }),
      fill: new ol.style.Fill({
        color: "rgba(0,0,0,0.1)",
      }),
    }),
    zIndex: 5,
  });
  map.addLayer(circleLayer);

  // Redraw circle on resolution change to maintain geodesic shape
  view.on("change:resolution", () => {
    if (currentCircleKm !== null && userCoords) {
      showCircleOnMap(userCoords, currentCircleKm);
    }
  });

  return map;
}
initMap();

// --- User coordinates ---
export function setUserCoords(coords) {
  userCoords = coords;
}
export function getUserCoords() {
  return userCoords;
}

// --- User marker overlay ---
export function addOrMoveUserMarker(coords) {
  setUserCoords(coords);
  if (userOverlay) {
    userOverlay.setPosition(ol.proj.fromLonLat(coords));
    return;
  }
  const el = document.createElement("div");
  el.className = "user-marker";
  userOverlay = new ol.Overlay({
    element: el,
    positioning: "center-center",
    stopEvent: false,
  });
  userOverlay.setPosition(ol.proj.fromLonLat(coords));
  map.addOverlay(userOverlay);
}

export function updateCircleStyle() {
  if (!circleLayer) return; // если слой ещё не создан

  // 1. Читаем переменную
  const strokeColor = getCssVar("--current-color"); // e.g. "#66c7f4"

  // 2. Конвертируем в RGB + альфа 0.9
  const hex = strokeColor.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.substr(i, 2), 16));
  const fillColor = `rgba(${r},${g},${b},0.1)`;

  // 3. Строим и назначаем стиль
  const dynamicStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: strokeColor, width: 2 }),
    fill: new ol.style.Fill({ color: fillColor }),
  });
  circleLayer.setStyle(dynamicStyle);
}

// --- Show geodesic circle ---
export function showCircleOnMap(coords, radiusKm) {
  currentCircleKm = radiusKm;
  circleSource.clear();
  updateCircleStyle();

  // Build geodesic circle polygon by sampling bearings
  const lat = coords[1];
  const lon = coords[0];
  const points = [];
  for (let angle = 0; angle < 360; angle += 5) {
    const p = destinationPoint(lat, lon, radiusKm, angle);
    points.push(ol.proj.fromLonLat([p.lon, p.lat]));
  }
  // close polygon
  points.push(points[0]);

  const geom = new ol.geom.Polygon([points]);
  const feature = new ol.Feature(geom);
  circleSource.addFeature(feature);
}

// --- Display point overlays ---
export function displayPointOnMap(point, type = "random") {
  if (pointOverlays[type]) {
    map.removeOverlay(pointOverlays[type]);
    pointOverlays[type] = null;
  }
  const el = document.createElement("div");
  el.classList.add(`${type}-marker`);
  const overlay = new ol.Overlay({
    element: el,
    positioning: "center-center",
    stopEvent: false,
  });
  overlay.setPosition(ol.proj.fromLonLat([point.lon, point.lat]));
  map.addOverlay(overlay);
  pointOverlays[type] = overlay;
}

// --- Clear points ---
export function clearRandomPoint() {
  ["random", "attractor", "void"].forEach((type) => {
    if (pointOverlays[type]) {
      map.removeOverlay(pointOverlays[type]);
      pointOverlays[type] = null;
    }
  });
}

// --- Get map instance ---
export function getMap() {
  return map;
}
