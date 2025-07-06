console.log("[load] utils");
// js/utils.js
// Вспомогательные функции для проекта
import { state } from "./state.js";

/**
 * Получает радиус из поля ввода и возвращает число (в километрах).
 * Если значение некорректно или <= 0, возвращает 1.
 * @returns {number}
 */
export function getRadius() {
  const input = document.getElementById("radius");
  if (!input) return 1;
  const val = parseFloat(input.value);
  return !isNaN(val) && val > 0 ? val : 1;
}

/**
 * Экранирует HTML-специальные символы, чтобы предотвратить XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return str.replace(
    /[<>&"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
      }[c])
  );
}

/**
 * Возвращает текущее время в виде локализованной строки.
 * @returns {string}
 */
export function getCurrentTimestamp() {
  return new Date().toLocaleString();
}

export function validateCreateBtn() {
  const createBtn = document.getElementById("createPointBtn");
  const apiInput = document.getElementById("apiKey");
  const api = apiInput.value.trim();

  if (state.selectedGeneratorType === "pseudo") {
    // для псевдо — всегда активна
    createBtn.disabled = false;
  } else {
    // для quantum — проверяем, что ключ есть и равен "12345"
    createBtn.disabled = api !== "12345";
  }
}
