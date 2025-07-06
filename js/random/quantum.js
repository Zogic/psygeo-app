// src/random/quantum.js
export async function quantumRandom01() {
  // допустим, API возвращает { data: [N], success: true }
  const resp = await fetch(
    "https://your-qrng-service/api/random?length=1&type=uint8"
  );
  if (!resp.ok) throw new Error(`QRNG error: ${resp.status}`);
  const { data } = await resp.json();
  // нормализуем к [0,1)
  return data[0] / 0xff;
}
