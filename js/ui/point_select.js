console.log("[load] point_select.js");

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
import {
  getRadius,
  escapeHtml,
  getCurrentTimestamp,
  validateApiAndPurpose,
} from "../utils.js";
import {
  adjustPanelHeight,
  showMain,
  showSummary,
} from "./bottomSheet_controls.js";

import { goToMyLocation } from "./map_controls.js";

import { updateRadiusButtonStyles } from "./radius_select.js";

import { updateSummarySnippet } from "./summary.js";

import { onCreatePoint } from "./point_creation.js";

import { state } from "../state.js";

// ПЕРЕКЛЮЧЕНИЕ КНОПОК "ТИП ТОЧКИ"
// 1) Определяем соответствия для hover- и select-классов
export const POINT_HOVER_CLASSES = {
  random: "hover:bg-[var(--random-button-hover)]",
  attractor: "hover:bg-[var(--attractor-button-hover)]",
  void: "hover:bg-[var(--void-button-hover)]",
};

export const POINT_SELECT_CLASSES = {
  random: [
    "bg-[var(--random-button-select)]",
    "border-[var(--random-button-select)]",
    "text-[var(--color-black)]",
  ],
  attractor: [
    "bg-[var(--attractor-button-select)]",
    "border-[var(--attractor-button-select)]",
    "text-[var(--color-black)]",
  ],
  void: [
    "bg-[var(--void-button-select)]",
    "border-[var(--void-button-select)]",
    "text-[var(--color-black)]",
  ],
};

const btns = document.querySelectorAll(".point-btn");

btns.forEach((btn) => {
  // Навешиваем hover-классы сразу
  const hoverClass = `hover:bg-[var(--${btn.dataset.value}-button-hover)]`;
  btn.classList.add(hoverClass);

  btn.addEventListener("click", () => {
    const type = btn.dataset.value; // 'random', 'attractor' или 'void'

    // 1) Сброс состояния у всех кнопок
    btns.forEach((b) => {
      // убираем все утилиты фона и рамки
      b.classList.remove(
        "bg-transparent",
        ...POINT_SELECT_CLASSES.random,
        ...POINT_SELECT_CLASSES.attractor,
        ...POINT_SELECT_CLASSES.void,
        "border-[var(--text-color)]"
      );
      // убираем hover-классы и все цветовые утилиты
      b.classList.remove(
        ...Object.values(POINT_HOVER_CLASSES),
        "text-[var(--color-black)]",
        "text-[var(--text-color)]"
      );
      // восстанавливаем hover и цвет текста по умолчанию
      const t0 = b.dataset.value;
      b.classList.add(POINT_HOVER_CLASSES[t0], "text-[var(--text-color)]");
    });

    // 2) Выделяем кликнутую кнопку
    btn.classList.remove(POINT_HOVER_CLASSES[type], "text-[var(--text-color)]");
    btn.classList.add(...POINT_SELECT_CLASSES[type]);

    // **ВАЖНО**: сохраняем в глобальную переменную
    state.selectedPointType = type;

    // 3) обновляем текущий цвет UI
    const selColor = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${type}-button-select`)
      .trim();
    document.documentElement.style.setProperty("--current-color", selColor);
  });
});

// Инициализируем дефолтный выбор, чтобы всё выставилось сразу
if (btns.length) {
  document.querySelector('.point-btn[data-value="random"]').click();
}
