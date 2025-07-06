console.log("[load] hints.js");

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
} from "./bottomSheet_controls.js";

import { goToMyLocation } from "./map_controls.js";

import { updateRadiusButtonStyles } from "./radius_select.js";

import { updateSummarySnippet } from "./summary.js";

import { onCreatePoint } from "./point_creation.js";

// 1. Функция, которая по ключу key (например, "purpose") показывает подсказку
export function showInfo(key) {
  const template = document.getElementById(`tmpl-${key}`);
  if (!template) return; // если такого шаблона нет — выход

  const overlay = document.getElementById("infoOverlay");
  const modal = document.getElementById("infoModal");

  // Удаляем предыдущий контент (кроме кнопки закрытия)
  modal
    .querySelectorAll(":scope > .template-content")
    .forEach((el) => el.remove());

  // Клонируем нужный <template>
  const clone = template.content.cloneNode(true);

  // Оборачиваем, чтобы при следующем вызове было легко удалить
  const wrapper = document.createElement("div");
  wrapper.classList.add("template-content");
  wrapper.appendChild(clone);

  // Вставляем внутрь модалки после кнопки закрытия
  modal.appendChild(wrapper);

  // Показываем оверлей
  overlay.classList.remove("hidden");
}

// 2. Повесим на все кнопки info-btn вызов нашей функции при клике
document.querySelectorAll(".info-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    showInfo(btn.dataset.info);
  });
});

// 3. Обработчик для закрытия (по кнопке или клику вне модалки)
document.getElementById("infoClose").addEventListener("click", () => {
  document.getElementById("infoOverlay").classList.add("hidden");
});
document.getElementById("infoOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    // кликнули по оверлею вне модалки
    e.currentTarget.classList.add("hidden");
  }
});

// 4. Теперь можно вызывать showInfo("purpose") где угодно
// например, показывать подсказку при загрузке страницы:
window.addEventListener("load", () => {
  // showInfo("purpose");
});
