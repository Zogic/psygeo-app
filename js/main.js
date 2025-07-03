console.log("[load] main.js");
// js/main.js
// Точка входа: инициализация карты, определение стартовой локации, запуск UI
import "./ui/api_select.js";
import "./ui/bottomSheet_controls.js";
import "./ui/hints.js";
import "./ui/map_controls.js";
import "./ui/point_creation.js";
import "./ui/point_select.js";
import "./ui/radius_select.js";
import "./ui/results.js";
import "./ui/summary.js";
import "./ui/ui_builder.js";
import "./ui/generator_type_select.js";

import {
  initMap,
  DEFAULT_COORDS,
  setUserCoords,
  addOrMoveUserMarker,
  showCircleOnMap,
} from "./map.js";
import { setupUI } from "./ui/ui_builder.js";

// Ждём полной загрузки DOM
window.addEventListener("DOMContentLoaded", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = [position.coords.longitude, position.coords.latitude];
      setUserCoords(coords);
      addOrMoveUserMarker(coords);
      showCircleOnMap(
        coords,
        parseFloat(document.getElementById("radius").value)
      );
    },
    () => {
      // Если отказано — используем дефолтные координаты
      setUserCoords(DEFAULT_COORDS);
      addOrMoveUserMarker(DEFAULT_COORDS);
      showCircleOnMap(
        DEFAULT_COORDS,
        parseFloat(document.getElementById("radius").value)
      );
    }
  );

  // Настраиваем пользовательский интерфейс (кнопки, форму, панель)
  setupUI();
  console.log(" setupUI");
});
