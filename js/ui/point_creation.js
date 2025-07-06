// src/controls/point_creation.js
import {
  DEFAULT_COORDS,
  setUserCoords,
  getUserCoords,
  addOrMoveUserMarker,
  showCircleOnMap,
  getMap,
  displayPointOnMap,
  clearRandomPoint,
} from "../map.js";

import {
  generatePointInRadius,
  generateRandomPointsInRadius,
  countNeighbors,
  findAttractor,
  findVoid,
} from "../generator.js";

import { getRadius, escapeHtml, getCurrentTimestamp } from "../utils.js";

import {
  adjustPanelHeight,
  showMain,
  showSummary,
  showResult,
  showLoading,
} from "./bottomSheet_controls.js"; // добавили showLoading, hideLoading, showInfo

import { showInfo } from "./hints.js";

import { createResult } from "./results.js";
import { state } from "../state.js";

state.selectedPointType = "random"; // начальное значение :contentReference[oaicite:3]{index=3}

/**
 * Генерация точки и вывод результата (псевдо- или квантовый режим).
 */
export async function onCreatePoint() {
  const coords = getUserCoords();
  if (!coords) {
    alert("Сначала выбери стартовую точку!");
    return;
  }

  const purpose = document.getElementById("purpose").value || "—";
  const radiusKm = getRadius();
  const type = state.selectedPointType; // 'random'|'attractor'|'void'

  // PSEUDO-режим (синхронно)
  if (state.selectedGeneratorType === "pseudo") {
    let point, label;
    if (type === "random") {
      point = await generatePointInRadius(coords[1], coords[0], radiusKm);
      label = "Случайная точка";
    } else {
      const pts = await generateRandomPointsInRadius(
        coords[1],
        coords[0],
        radiusKm,
        120
      );
      const dens = countNeighbors(pts, 250);
      if (type === "attractor") {
        point = findAttractor(pts, dens);
        label = "Аттрактор";
      } else {
        point = findVoid(pts, dens);
        label = "Пустота";
      }
    }

    displayPointOnMap(point, type);
    createResult({ purpose: escapeHtml(purpose), point, label });
    showResult();
    return;
  }

  // QUANTUM-режим (асинхронно, с загрузкой)
  showLoading();
  try {
    let point, label;

    if (type === "random") {
      point = await generatePointInRadius(coords[1], coords[0], radiusKm);
      label = "Случайная точка";
    } else {
      const pts = await generateRandomPointsInRadius(
        coords[1],
        coords[0],
        radiusKm,
        120
      );
      const dens = countNeighbors(pts, 250);
      if (type === "attractor") {
        point = findAttractor(pts, dens);
        label = "Аттрактор";
      } else {
        point = findVoid(pts, dens);
        label = "Пустота";
      }
    }

    displayPointOnMap(point, type);
    createResult({ purpose: escapeHtml(purpose), point, label });
    showResult();
  } catch (err) {
    // при ошибке QRNG
    showMain();
    showInfo("QRNGError");
  }
}
