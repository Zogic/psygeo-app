console.log("[load] radius_select.js");

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
import { updateSummarySnippet } from "./summary.js";
import { onCreatePoint } from "./point_creation.js";
import { POINT_HOVER_CLASSES, POINT_SELECT_CLASSES } from "./point_select.js";
import { state } from "../state.js";

// Устанавливаем тип точки по умолчанию и входной радиус
state.selectedPointType = "random";
document.getElementById("radius").value = getRadius();

// Функция, которая обновляет стили у кнопок радиуса поиска
export function updateRadiusButtonStyles() {
  const radiusBtns = document.querySelectorAll(".radius-btn");
  const type = state.selectedPointType;
  const currentRadius = String(getRadius());

  radiusBtns.forEach((btn) => {
    // 1) Сброс всех утилит фона, границы, hover и цвета текста
    btn.classList.remove(
      "bg-transparent",
      "border-[var(--text-color)]",
      "text-[var(--text-color)]",
      ...Object.values(POINT_HOVER_CLASSES),
      ...POINT_SELECT_CLASSES.random,
      ...POINT_SELECT_CLASSES.attractor,
      ...POINT_SELECT_CLASSES.void
    );

    if (btn.dataset.value === currentRadius) {
      // 2) Если эта кнопка соответствует текущему радиусу — выделяем
      // удаляем hover-класс
      btn.classList.remove(POINT_HOVER_CLASSES[type]);
      // добавляем селект-стили (background, border, текст)
      btn.classList.add(...POINT_SELECT_CLASSES[type]);
    } else {
      // 3) Для невыбранных кнопок — дефолтные стили и hover
      btn.classList.add(
        POINT_HOVER_CLASSES[type],
        "border-[var(--text-color)]",
        "text-[var(--text-color)]"
      );
    }
  });

  console.log("[load] radius_select.js style update");
}

// Обработчики

// При смене типа точки — ресетим радиус и стили кнопок
document.querySelectorAll(".point-btn").forEach((ptBtn) => {
  ptBtn.addEventListener("click", () => {
    state.selectedPointType = ptBtn.dataset.value;
    updateRadiusButtonStyles();
  });
});

// При клике на radius-btn — обновляем значение input, рисуем круг и стили
document.querySelectorAll(".radius-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("radius").value = btn.dataset.value;
    const coords = getUserCoords();
    if (coords) showCircleOnMap(coords, getRadius());
    updateRadiusButtonStyles();
  });
});

// При ручном вводе в поле radius — обновляем круг и стили
document.getElementById("radius").addEventListener("input", () => {
  const coords = getUserCoords();
  if (coords) showCircleOnMap(coords, getRadius());
  updateRadiusButtonStyles();
});

// Инициализация при загрузке страницы
updateRadiusButtonStyles();
