import {
  adjustPanelHeight,
  showMain,
  showSummary,
} from "./bottomSheet_controls.js";
import {
  getRadius,
  escapeHtml,
  getCurrentTimestamp,
  validateCreateBtn,
} from "../utils.js";
import { POINT_HOVER_CLASSES, POINT_SELECT_CLASSES } from "./point_select.js";
import { state } from "../state.js";

// Селектор ваших двух кнопок
const generatorBtns = document.querySelectorAll(".generator-type-btn");

export function updateGeneratorButtonStyles() {
  const currentType = state.selectedPointType; // цвет зависит от pointType
  const currentGen = state.selectedGeneratorType; // какой генератор выбран

  generatorBtns.forEach((btn) => {
    // 1) Сброс всех классов
    btn.classList.remove(
      "bg-transparent",
      "border-[var(--text-color)]",
      "text-[var(--text-color)]",
      ...Object.values(POINT_HOVER_CLASSES),
      ...Object.values(POINT_SELECT_CLASSES).flat()
    );

    if (btn.dataset.value === currentGen) {
      // 2) Для выбранного генератора — применяем селект-стили
      btn.classList.add(...POINT_SELECT_CLASSES[currentType]);
    } else {
      // 3) Для остальных — hover + дефолтные рамка/текст
      btn.classList.add(
        POINT_HOVER_CLASSES[currentType],
        "border-[var(--text-color)]",
        "text-[var(--text-color)]"
      );
    }
  });

  const apiSection = document.getElementById("apiSection");
  if (state.selectedGeneratorType === "quantum") {
    apiSection.classList.remove("hidden");
    adjustPanelHeight();
  } else {
    apiSection.classList.add("hidden");
    adjustPanelHeight();
  }
}

// Вешаем слушатели клика
generatorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.selectedGeneratorType = btn.dataset.value;
    updateGeneratorButtonStyles();
    validateCreateBtn();
  });
});

// При смене типа точки — ресетим радиус и стили кнопок
document.querySelectorAll(".point-btn").forEach((ptBtn) => {
  ptBtn.addEventListener("click", () => {
    updateGeneratorButtonStyles();
  });
});

// Инициализация дефолтного состояния
updateGeneratorButtonStyles();
