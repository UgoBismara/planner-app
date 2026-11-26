// Quiz du jour de Wikichasse : 3 questions sur tes propres cartes (capturées avant
// aujourd'hui). On lit la description et le début de l'extrait, titre masqué, et
// on retrouve l'article parmi 4 titres de sa collection. Les questions sont tirées
// de la date (même tirage sur tous les appareils toute la journée) ; seules les
// réponses sont enregistrées, sous QUIZ_KEY, par l'appli : { [date]: [{ id, ok }] }.
import { hash32, seededRandom } from './wikimasters.js';

export const QUIZ_KEY = 'wikichasse-quiz';
export const QUIZ_SIZE = 3;
export const QUIZ_MIN_CARDS = 6;
export const QUIZ_REWARD = { xp: 15, points: 1 };
export const QUIZ_PERFECT = { xp: 20, points: 2 };

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Indice : description + première phrase de l'extrait, mots du titre masqués
export function clueOf(card) {
  const words = card.title
    .replace(/\(.*?\)/g, ' ')
    .split(/[\s,;:'’()-]+/)
    .filter((w) => w.length >= 3);
  const mask = (t) =>
    words.reduce((s, w) => s.replace(new RegExp(`(^|[^\\p{L}])${esc(w)}(?=[^\\p{L}]|$)`, 'giu'), '$1▮▮▮'), t ?? '');
  const sentence = (card.extract ?? '').split(/(?<=[.!?])\s/)[0] ?? '';
  return {
    description: mask(card.description),
    extract: mask(sentence.length > 220 ? `${sentence.slice(0, 217)}…` : sentence),
  };
}

const usable = (c) => (c.description || c.extract) && c.title;

// Questions d'une date : cartes capturées avant cette date
export function quizOf(date, cards, caught) {
  const pool = cards
    .filter((c) => caught[c.id] && caught[c.id] < date && usable(c))
    .sort((a, b) => hash32(`quiz:${date}:${a.id}`) - hash32(`quiz:${date}:${b.id}`));
  if (pool.length < QUIZ_MIN_CARDS) return [];
  const rnd = seededRandom(`quiz-choices:${date}`);
  return pool.slice(0, QUIZ_SIZE).map((card, i) => {
    const others = pool.filter((c) => c.id !== card.id);
    const wrong = [];
    while (wrong.length < 3) {
      const c = others[Math.floor(rnd() * others.length)];
      if (!wrong.includes(c)) wrong.push(c);
    }
    // Mélange par clés tirées (même ordre sur tous les navigateurs)
    const choices = [card, ...wrong]
      .map((c) => ({ c, k: rnd() }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.c);
    return { index: i, card, clue: clueOf(card), choices };
  });
}

// Bilan de toutes les réponses enregistrées
export function quizBoard(answers = {}, today) {
  let correct = 0;
  let perfect = 0;
  let best = 0;
  let run = 0;
  const perfectDays = new Set();
  for (const date of Object.keys(answers).sort()) {
    if (date > today) continue;
    const list = answers[date] ?? [];
    const ok = list.filter((a) => a?.ok).length;
    correct += ok;
    if (ok === QUIZ_SIZE) {
      perfect++;
      perfectDays.add(date);
      best = Math.max(best, ++run);
    } else if (list.filter(Boolean).length === QUIZ_SIZE) run = 0;
  }
  return {
    correct,
    perfect,
    perfectDays,
    bestRun: best,
    xp: correct * QUIZ_REWARD.xp + perfect * QUIZ_PERFECT.xp,
    points: correct * QUIZ_REWARD.points + perfect * QUIZ_PERFECT.points,
  };
}
