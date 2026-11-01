// Outils du contenu : gabarit des textes, arithmétique sur les entiers et mise en
// forme LaTeX des exercices générés.

// Gabarit des textes : String.raw (les \ du LaTeX restent tels quels), puis on retire
// l'indentation commune des lignes suivant la première, pour aligner le Markdown sur le
// code sans qu'il devienne un bloc de code
export const md = (strings, ...values) => {
  const lines = String.raw(strings, ...values).split('\n');
  const indents = lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((line, i) => (i === 0 ? line : line.slice(cut)))
    .join('\n')
    .trim();
};

// Reste positif, même pour a < 0 (le % de JavaScript garde le signe de a)
export const mod = (a, m) => ((a % m) + m) % m;

export const gcd = (a, b) => {
  let [x, y] = [Math.abs(a), Math.abs(b)];
  while (y) [x, y] = [y, x % y];
  return x;
};

// Étapes de l'algorithme d'Euclide : a = b q + r, jusqu'au reste nul
export const euclidSteps = (a, b) => {
  const steps = [];
  let [x, y] = [a, b];
  while (y) {
    steps.push({ a: x, b: y, q: Math.floor(x / y), r: x % y });
    [x, y] = [y, x % y];
  }
  return steps;
};

// [d, u, v] avec a u + b v = d = pgcd(a, b), pour a, b > 0 (Euclide étendu)
export const egcd = (a, b) => {
  let [r0, r1, u0, u1, v0, v1] = [a, b, 1, 0, 0, 1];
  while (r1) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [u0, u1] = [u1, u0 - q * u1];
    [v0, v1] = [v1, v0 - q * v1];
  }
  return [r0, u0, v0];
};

// Algorithme d'Euclide étendu ligne par ligne : chaque reste s'écrit r = a u + b v.
// q est le quotient de la division du reste précédent par celui de la ligne ; la
// dernière ligne porte le PGCD.
export const bezoutRows = (a, b) => {
  const rows = [
    { r: a, q: null, u: 1, v: 0 },
    { r: b, q: null, u: 0, v: 1 },
  ];
  for (;;) {
    const [prev, cur] = rows.slice(-2);
    const q = Math.floor(prev.r / cur.r);
    cur.q = q;
    const r = prev.r - q * cur.r;
    if (r === 0) return rows;
    rows.push({ r, q: null, u: prev.u - q * cur.u, v: prev.v - q * cur.v });
  }
};

export const bezoutTable = (rows) =>
  [
    '| Reste $r$ | Quotient $q$ | $u$ | $v$ |',
    '|---|---|---|---|',
    ...rows.map((row) => `| $${row.r}$ | ${row.q === null ? '' : `$${row.q}$`} | $${row.u}$ | $${row.v}$ |`),
  ].join('\n');

// Inverse de a modulo m dans [0, m - 1], ou null si a et m ne sont pas premiers entre eux
export const modInverse = (a, m) => {
  const [d, u] = egcd(mod(a, m), m);
  return d === 1 ? mod(u, m) : null;
};

// a^n mod m par exponentiation rapide (m < 10^7 pour rester exact en flottants)
export const modPow = (a, n, m) => {
  let result = 1 % m;
  let base = mod(a, m);
  let e = n;
  while (e > 0) {
    if (e % 2 === 1) result = (result * base) % m;
    base = (base * base) % m;
    e = Math.floor(e / 2);
  }
  return result;
};

export const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};

// Un négatif entre parenthèses, pour l'écrire après un signe : 3 \times (-2)
export const paren = (n) => (n < 0 ? `(${n})` : String(n));

// Angle p\pi/q en LaTeX, fraction réduite : 0, \pi, -\frac{3\pi}{4}…
export const texAngle = (p, q) => {
  if (p === 0) return '0';
  const g = gcd(p, q);
  const [num, den] = [p / g, q / g];
  const top = Math.abs(num) === 1 ? '\\pi' : `${Math.abs(num)}\\pi`;
  return `${num < 0 ? '-' : ''}${den === 1 ? top : `\\frac{${top}}{${den}}`}`;
};

// « + 3 » / « - 3 » pour enchaîner des termes ; « + x » plutôt que « + 1x »
export const signed = (n, variable = '') => {
  const abs = Math.abs(n);
  const body = variable && abs === 1 ? variable : `${abs}${variable}`;
  return `${n < 0 ? '-' : '+'} ${body}`;
};

// Premier terme d'une expression : « -x », « 3x », « 5 »
export const lead = (n, variable = '') => {
  if (!variable) return String(n);
  if (n === 1) return variable;
  if (n === -1) return `-${variable}`;
  return `${n}${variable}`;
};

// a + bi en LaTeX : 3 + 4i, -2i, 1 - i, 5, 0
export const texComplex = (re, im) => {
  if (im === 0) return String(re);
  const imPart = Math.abs(im) === 1 ? 'i' : `${Math.abs(im)}i`;
  if (re === 0) return `${im < 0 ? '-' : ''}${imPart}`;
  return `${re} ${im < 0 ? '-' : '+'} ${imPart}`;
};

// Entre parenthèses quand le complexe a deux termes ou un signe : (3 - 4i), (-2i)
export const texComplexParen = (re, im) => {
  const tex = texComplex(re, im);
  return re !== 0 && im !== 0 ? `(${tex})` : tex.startsWith('-') ? `(${tex})` : tex;
};
