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

// 1) Навешиваем общий клик на все кнопки (i)
document.querySelectorAll(".info-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.info; // "purpose" / "pointType" / "apiKey"
    const template = document.getElementById(`tmpl-${key}`);
    if (!template) return; // шаблона нет — выходим

    const overlay = document.getElementById("infoOverlay");
    const modal = document.getElementById("infoModal");

    // 2) Удаляем предыдущий контент (всё кроме кнопки закрытия)
    modal
      .querySelectorAll(":scope > .template-content")
      .forEach((el) => el.remove());

    // 3) Клонируем нужный <template>
    const clone = template.content.cloneNode(true);

    // 4) Оборачиваем его, чтобы потом легко чистить снова
    const wrapper = document.createElement("div");
    wrapper.classList.add("template-content");
    wrapper.appendChild(clone);

    // 5) Вставляем внутрь модалки после кнопки закрытия
    modal.appendChild(wrapper);

    // 6) Показываем оверлей
    overlay.classList.remove("hidden");
  });
});

// 7) Закрытие: по крестику
document.getElementById("infoClose").addEventListener("click", () => {
  document.getElementById("infoOverlay").classList.add("hidden");
});

// 8) Закрытие: кликом по пустому фону
document.getElementById("infoOverlay").addEventListener("click", (evt) => {
  if (evt.target === evt.currentTarget) {
    document.getElementById("infoOverlay").classList.add("hidden");
  }
});
