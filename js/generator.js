// src/generator.js

import { state } from "./state.js";
import { random01 } from "./random/index.js";
import { fetchQuantum } from "./random/quantum.js";

/**
 * Генерирует одну точку внутри круга радиусом radiusKm вокруг (lat, lon).
 * @param {number} lat – широта центра в градусах
 * @param {number} lon – долгота центра в градусах
 * @param {number} radiusKm – радиус круга в километрах
 * @returns {Promise<{lat:number, lon:number}>}
 */
export async function generatePointInRadius(lat, lon, radiusKm) {
  const earthRadius = 6371;
  const radiusRad = radiusKm / earthRadius;

  if (state.selectedGeneratorType === "quantum") {
    // Для QRNG: один batch-запрос на 2 числа, берём первую точку
    const [pt] = await generateRandomPointsInRadius(lat, lon, radiusKm, 1);
    return pt;
  }

  // Pseudo-RNG
  const u1 = await random01();
  const u2 = await random01();
  const theta = u1 * 2 * Math.PI;
  const randRadius = Math.sqrt(u2) * radiusRad;

  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(randRadius) +
      Math.cos(φ1) * Math.sin(randRadius) * Math.cos(theta)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(randRadius) * Math.cos(φ1),
      Math.cos(randRadius) - Math.sin(φ1) * Math.sin(φ2)
    );

  return {
    lat: (φ2 * 180) / Math.PI,
    lon: (λ2 * 180) / Math.PI,
  };
}

/**
 * Генерирует count точек внутри круга радиусом radiusKm вокруг (lat, lon).
 * @param {number} lat – широта центра
 * @param {number} lon – долгота центра
 * @param {number} radiusKm – радиус круга в километрах
 * @param {number} count – число точек
 * @returns {Promise<Array<{lat:number, lon:number}>>}
 */
export async function generateRandomPointsInRadius(lat, lon, radiusKm, count) {
  const earthRadius = 6371;
  const radiusRad = radiusKm / earthRadius;

  if (state.selectedGeneratorType === "quantum") {
    // QRNG: запрашиваем сразу 2*count чисел uint16
    const data = await fetchQuantum({ length: 2 * count, type: "uint16" });
    const points = [];
    const φ1 = (lat * Math.PI) / 180;
    const λ1 = (lon * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const u1 = data[2 * i] / 0xffff;
      const u2 = data[2 * i + 1] / 0xffff;
      const theta = u1 * 2 * Math.PI;
      const randRadius = Math.sqrt(u2) * radiusRad;

      const φ2 = Math.asin(
        Math.sin(φ1) * Math.cos(randRadius) +
          Math.cos(φ1) * Math.sin(randRadius) * Math.cos(theta)
      );
      const λ2 =
        λ1 +
        Math.atan2(
          Math.sin(theta) * Math.sin(randRadius) * Math.cos(φ1),
          Math.cos(randRadius) - Math.sin(φ1) * Math.sin(φ2)
        );

      points.push({
        lat: (φ2 * 180) / Math.PI,
        lon: (λ2 * 180) / Math.PI,
      });
    }

    return points;
  }

  // Pseudo-RNG: по точке за раз
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push(await generatePointInRadius(lat, lon, radiusKm));
  }
  return points;
}

/**
 * Считает число соседей для каждой точки в радиусе radiusM метров.
 * @param {Array<{lat:number, lon:number}>} points
 * @param {number} radiusM
 * @returns {number[]}
 */
export function countNeighbors(points, radiusM) {
  function distance(a, b) {
    const R = 6371000; // в метрах
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lon - a.lon) * Math.PI) / 180;
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
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
 * Находит точку с максимальной плотностью соседей.
 * @param {Array<{lat:number, lon:number}>} points
 * @param {number[]} densities
 * @returns {{lat:number, lon:number}}
 */
export function findAttractor(points, densities) {
  const maxD = Math.max(...densities);
  const idx = densities.indexOf(maxD);
  return points[idx];
}

/**
 * Находит точку с минимальной плотностью соседей.
 * @param {Array<{lat:number, lon:number}>} points
 * @param {number[]} densities
 * @returns {{lat:number, lon:number}}
 */
export function findVoid(points, densities) {
  const minD = Math.min(...densities);
  const idx = densities.indexOf(minD);
  return points[idx];
}
