// Réponses courtes de l'onglet Maths : lecture de ce qui est tapé, puis vérification.
// Types : number, integers (liste d'entiers), complex, complexes (liste), choice (QCM),
// truefalse. Un validate(valeur lue) remplace la comparaison exacte quand la réponse
// n'est pas unique (coefficients de Bézout, inverse modulaire à un multiple près…) ;
// expected donne alors une réponse juste, pour l'affichage et scripts/check-maths.js.

export const ANSWER_TYPES = ['number', 'integers', 'complex', 'complexes', 'choice', 'truefalse'];

// Claviers de téléphone : signe moins Unicode, tirets longs
const normalizeMinus = (text) => String(text ?? '').replace(/[−–—]/g, '-');

// « x = 3 », « z = 1 + i » : on garde ce qui suit le signe égal
const stripLabels = (text) => normalizeMinus(text).replace(/[a-zA-Z]\w*\s*=/g, ' ');

const NUMBER_RE = /^[+-]?\d+([.,]\d+)?$/;

// Entier, décimal (virgule ou point) ou fraction a/b ; null si illisible
export const parseNumber = (text) => {
  const s = stripLabels(text).replace(/\s+/g, '');
  if (!s) return null;
  const parts = s.split('/');
  if (parts.length > 2 || parts.some((p) => !NUMBER_RE.test(p))) return null;
  const [num, den = 1] = parts.map((p) => Number(p.replace(',', '.')));
  return den === 0 ? null : num / den;
};

// Entiers séparés par des espaces, virgules ou points-virgules
export const parseIntegers = (text) => {
  const tokens = stripLabels(text)
    .replace(/[{}()[\]]/g, ' ')
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (tokens.length === 0 || tokens.some((t) => !/^[+-]?\d+$/.test(t))) return null;
  return tokens.map(Number);
};

// a + bi, sous toutes ses formes courantes : 3-4i, -2i, i/2, 1/2+3i, 2,5i…
export const parseComplex = (text) => {
  const s = stripLabels(text).replace(/[\s*×]/g, '');
  if (!s) return null;
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join('') !== s) return null;
  let re = 0;
  let im = 0;
  for (const term of terms) {
    const iCount = (term.match(/i/g) ?? []).length;
    if (iCount > 1) return null;
    if (iCount === 0) {
      const value = parseNumber(term);
      if (value === null) return null;
      re += value;
      continue;
    }
    let coef = term.replace('i', '');
    if (coef === '' || coef === '+') coef = '1';
    else if (coef === '-') coef = '-1';
    else if (/^[+-]?\//.test(coef)) coef = coef.replace('/', '1/'); // i/2, -i/2
    const value = parseNumber(coef);
    if (value === null) return null;
    im += value;
  }
  return { re, im };
};

// Points-virgules (la virgule peut être décimale), ou virgule suivie d'une espace
const splitList = (text) =>
  normalizeMinus(text)
    .split(/;|,\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

// Entier attendu : exact ; sinon 3 chiffres significatifs suffisent (0,667 pour 2/3)
const defaultTolerance = (v) => (Number.isInteger(v) ? 1e-9 : 1e-3 * Math.max(1, Math.abs(v)));

const close = (x, v, tolerance) => Math.abs(x - v) <= (tolerance ?? defaultTolerance(v));

const closeComplex = (z, w, tolerance) => close(z.re, w.re, tolerance) && close(z.im, w.im, tolerance);

const sortedEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const x = [...a].sort((p, q) => p - q);
  const y = [...b].sort((p, q) => p - q);
  return x.every((v, i) => v === y[i]);
};

const FORMAT_HELP = {
  number: 'Un nombre : entier, décimal (virgule ou point) ou fraction comme 7/3.',
  integers: 'Des entiers, séparés par des espaces ou des points-virgules.',
  complex: 'Un complexe sous la forme a + bi, comme 3 − 4i, 2i ou 1/2 + i/2.',
  complexes: 'Des complexes séparés par des points-virgules, comme 1 + 2i ; 1 − 2i.',
};

const PLACEHOLDERS = {
  number: 'ex. 12, −3/4 ou 2,5',
  integers: 'ex. 2 ; 5 ; 11',
  complex: 'ex. 3 − 4i',
  complexes: 'ex. 1 + 2i ; 1 − 2i',
};

export const formatHelp = (answer) => answer.help ?? FORMAT_HELP[answer.type] ?? '';

export const placeholderOf = (answer) => answer.placeholder ?? PLACEHOLDERS[answer.type] ?? '';

// Pour le texte : 3 + 4i, -2i, 1 - i, 5… (tapable tel quel dans un champ de réponse)
export const formatComplex = ({ re, im }) => {
  const num = (v) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6))).replace('.', ','));
  if (im === 0) return num(re);
  const imAbs = Math.abs(im) === 1 ? '' : num(Math.abs(im));
  if (re === 0) return `${im < 0 ? '-' : ''}${imAbs}i`;
  return `${num(re)} ${im < 0 ? '-' : '+'} ${imAbs}i`;
};

const formatNumber = (v) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6))).replace('.', ','));

// Une réponse juste, telle qu'on la taperait (choice : index, truefalse : booléen)
export const expectedInput = (answer) => {
  if (answer.expected !== undefined) return answer.expected;
  switch (answer.type) {
    case 'number':
      return formatNumber(answer.value);
    case 'integers':
      return answer.values.join(' ; ');
    case 'complex':
      return formatComplex(answer.value);
    case 'complexes':
      return answer.values.map(formatComplex).join(' ; ');
    case 'choice':
      return answer.correct;
    case 'truefalse':
      return answer.value;
    default:
      return '';
  }
};

const CORRECT = { status: 'correct' };
const WRONG = { status: 'wrong' };
const invalid = (answer) => ({ status: 'invalid', message: `Format non reconnu. ${formatHelp(answer)}` });

// { status: 'correct' | 'wrong' | 'invalid', message? } ; invalid ne compte pas comme une erreur
export const checkAnswer = (answer, input) => {
  const verdict = (ok) => (ok ? CORRECT : WRONG);
  switch (answer.type) {
    case 'number': {
      const value = parseNumber(input);
      if (value === null) return invalid(answer);
      return verdict(answer.validate ? answer.validate(value) : close(value, answer.value, answer.tolerance));
    }
    case 'integers': {
      const values = parseIntegers(input);
      if (!values) return invalid(answer);
      if (answer.validate) return verdict(answer.validate(values));
      if (answer.ordered) {
        return verdict(values.length === answer.values.length && values.every((v, i) => v === answer.values[i]));
      }
      return verdict(sortedEqual(values, answer.values));
    }
    case 'complex': {
      const z = parseComplex(input);
      if (!z) return invalid(answer);
      return verdict(closeComplex(z, answer.value, answer.tolerance));
    }
    case 'complexes': {
      const values = splitList(input).map(parseComplex);
      if (values.length === 0 || values.some((z) => !z)) return invalid(answer);
      if (values.length !== answer.values.length) return WRONG;
      // Chaque valeur attendue doit correspondre à une valeur tapée différente
      const unused = [...values];
      const ok = answer.values.every((w) => {
        const i = unused.findIndex((z) => closeComplex(z, w, answer.tolerance));
        if (i === -1) return false;
        unused.splice(i, 1);
        return true;
      });
      return verdict(ok);
    }
    case 'choice':
      return verdict(input === answer.correct);
    case 'truefalse':
      return verdict(input === answer.value);
    default:
      return invalid(answer);
  }
};
