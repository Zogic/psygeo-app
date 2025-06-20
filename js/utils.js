// js/utils.js
// Вспомогательные функции для проекта

/**
 * Получает радиус из поля ввода и возвращает число (в километрах).
 * Если значение некорректно или <= 0, возвращает 1.
 * @returns {number}
 */
export function getRadius() {
  const input = document.getElementById("radius");
  if (!input) return 1;
  const val = parseFloat(input.value);
  return (!isNaN(val) && val > 0) ? val : 1;
}

/**
 * Экранирует HTML-специальные символы, чтобы предотвратить XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return str.replace(/[<>&"]/g, c => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;'
  })[c]);
}

/**
 * Возвращает текущее время в виде локализованной строки.
 * @returns {string}
 */
export function getCurrentTimestamp() {
  return new Date().toLocaleString();
}

/**
 * Устанавливает доступность кнопки создания точки и показывает/скрывает предупреждение по API.
 * @param {HTMLButtonElement} btn - кнопка 'Создать точку'
 * @param {HTMLDivElement} warning - блок с предупреждением об API
 */
export function validateApiAndPurpose(btn, warning) {
  const api = document.getElementById("apiKey").value.trim();
  if (api !== "12345") {
    btn.disabled = true;
  } else {
    btn.disabled = false;
    warning.style.display = "none";
  }
}
