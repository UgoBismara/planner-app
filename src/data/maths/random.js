// Tirages des exercices générés. Le générateur a une graine (mulberry32) : un énoncé se
// rejoue à l'identique, et scripts/check-maths.js teste chaque générateur sur des
// graines fixes.

export const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

export const makeRng = (seed) => {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Entier entre min et max inclus
  const int = (min, max) => min + Math.floor(next() * (max - min + 1));
  const pick = (list) => list[Math.floor(next() * list.length)];
  const nonZero = (min, max) => {
    let n = 0;
    while (n === 0) n = int(min, max);
    return n;
  };
  const shuffle = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return { next, int, pick, nonZero, shuffle };
};
