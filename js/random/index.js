// src/random/index.js
import { state } from "../state.js";
import { quantumRandom01 } from "./quantum.js";

/**
 * Всегда возвращает Promise<number> ∈ [0,1).
 * Выбирает источник по state.selectedGeneratorType.
 */
export async function random01() {
  if (state.selectedGeneratorType === "quantum") {
    // QRNG: может выкинуть исключение при ошибке API-ключа или сети
    return await quantumRandom01();
  }
  // PRNG через crypto.getRandomValues()
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 0xffffffff;
}
