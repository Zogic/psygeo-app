// src/random/quantum.js
const QRN_URL = "https://api.quantumnumbers.anu.edu.au/";

/**
 * Запрашивает массив случайных чисел из QRNG-сервиса.
 * @param {Object} options
 * @param {number} options.length - количество чисел (1–1024)
 * @param {'uint8'|'uint16'|'hex8'|'hex16'} options.type - тип данных
 * @param {number} [options.blockSize] - размер блока для hex8/hex16 (1–10)
 * @returns {Promise<Array<number|string>>} - массив данных из ответа
 * @throws {Error} при отсутствии ключа или ошибках HTTP/API
 */
export async function fetchQuantum({
  length = 1,
  type = "uint16",
  blockSize,
} = {}) {
  const apiKey = document.getElementById("apiKey").value.trim();
  if (!apiKey) {
    throw new Error("QRNG: API ключ не задан");
  }

  const params = new URLSearchParams({
    length: String(length),
    type: String(type),
  });
  // Добавляем blockSize только если он передан
  if (blockSize != null) {
    params.set("size", String(blockSize));
  }

  const response = await fetch(`${QRN_URL}?${params.toString()}`, {
    headers: { "x-api-key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`QRNG HTTP error: ${response.status}`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(`QRNG API error: ${result.message}`);
  }

  return result.data;
}

/**
 * Возвращает одно случайное число ∈ [0,1) через QRNG (uint16 → 0…65535).
 * @returns {Promise<number>}
 */
export async function quantumRandom01() {
  // Получаем один 16-битный элемент
  const data = await fetchQuantum({ length: 1, type: "uint16" });
  const value = Array.isArray(data) ? data[0] : data;
  // нормируем от 0 до 1
  return Number(value) / 0xffff;
}
