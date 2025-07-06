// src/generator.js
// Функции генерации точек (случайная, аттрактор, пустота) для использования из main.js и ui.js

import { random01 } from "./random/index.js";

/**
 * Генерирует случайную точку внутри круга радиусом radiusKm вокруг (lat, lon).
 * @param {number} lat - широта центра в градусах
 * @param {number} lon - долгота центра в градусах
 * @param {number} radiusKm - радиус в километрах
 * @returns {{lat: number, lon: number}} - случайная точка
 */
export function generatePointInRadius(lat, lon, radiusKm) {
  const earthRadius = 6371;
  const radiusRad = radiusKm / earthRadius;

  // теперь используем crypto.getRandomValues() через random01()
  const theta = random01() * 2 * Math.PI;
  const randRadius = Math.sqrt(random01()) * radiusRad;

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

/**
 * Генерирует несколько случайных точек внутри круга.
 * @param {number} lat - широта центра
 * @param {number} lon - долгота центра
 * @param {number} radiusKm - радиус в километрах
 * @param {number} count - количество точек
 * @returns {Array<{lat:number, lon:number}>}
 */
export function generateRandomPointsInRadius(lat, lon, radiusKm, count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push(generatePointInRadius(lat, lon, radiusKm));
  }
  return points;
}

/**
 * Считает плотность соседей для каждой точки: сколько других точек попадает в радиус radiusM метров.
 * @param {Array<{lat:number, lon:number}>} points
 * @param {number} radiusM - радиус в метрах
 * @returns {number[]} - массив плотностей для каждой точки
 */
export function countNeighbors(points, radiusM) {
  function distance(a, b) {
    const R = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lon - a.lon) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const aVal =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(aVal));
  }

  return points.map((pt, i) =>
    points.reduce(
      (cnt, other, j) =>
        i !== j && distance(pt, other) < radiusM ? cnt + 1 : cnt,
      0
    )
  );
}

/**
 * Находит точку-аттрактор: точку с максимальным количеством соседей.
 * @param {Array<{lat:number, lon:number}>} points
 * @param {number[]} densities
 * @returns {{lat:number, lon:number}}
 */
export function findAttractor(points, densities) {
  const maxDensity = Math.max(...densities);
  const idx = densities.indexOf(maxDensity);
  return points[idx];
}

/**
 * Находит точку-пустоту: точку с минимальным количеством соседей.
 * @param {Array<{lat:number, lon:number}>} points
 * @param {number[]} densities
 * @returns {{lat:number, lon:number}}
 */
export function findVoid(points, densities) {
  const minDensity = Math.min(...densities);
  const idx = densities.indexOf(minDensity);
  return points[idx];
}
