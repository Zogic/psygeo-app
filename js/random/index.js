// src/random/index.js
import { state } from "../state.js";

/**
 * Возвращает случайное число ∈ [0,1).
 * Пока реализован только pseudo-режим, остальные типы — в будущем.
 */
export function random01() {
  if (state.selectedGeneratorType !== "pseudo") {
    throw new Error(
      `Generator "${state.selectedGeneratorType}" not implemented`
    );
  }
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // 0 ≤ buf[0] ≤ 0xffffffff
  return buf[0] / 0xffffffff;
}
