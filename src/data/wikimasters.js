// Onglet Wikichasse : chaque jour, des articles de Wikipédia FR tirés au hasard,
// à capturer dans le jeu WikiMasters.
//
// Trois clés, chacune avec un seul écrivain, pour qu'aucun n'écrase l'autre :
// - CARDS_KEY : liste des cartes, écrite UNIQUEMENT par scripts/wikimasters-draw.js
//   (routine cloud quotidienne, via l'API REST Firestore)
// - BONUS_KEY : cartes bonus tirées par l'appli quand tout est capturé (même forme,
//   avec bonus: true), écrite UNIQUEMENT par l'appli ; lue par le script contre les doublons
// - CAUGHT_KEY : { [pageid]: 'AAAA-MM-JJ' } des cartes capturées, écrite UNIQUEMENT par l'appli
export const GAME_NAME = 'Wikichasse';
export const CARDS_KEY = 'wikimasters-cards';
export const BONUS_KEY = 'wikimasters-bonus';
export const CAUGHT_KEY = 'wikimasters-caught';
export const CARDS_PER_DAY = 5;

// Rareté estimée d'après les vues des 30 derniers jours (plus l'article est lu,
// plus la carte est rare, comme dans WikiMasters). Paliers calés sur des tirages
// au hasard : la moitié des articles fait moins de ~30 vues par mois.
export const RARITIES = [
  { id: 'common', label: 'Commune', min: 0, xp: 10, color: '#98989f' },
  { id: 'uncommon', label: 'Peu commune', min: 30, xp: 20, color: '#30d158' },
  { id: 'rare', label: 'Rare', min: 150, xp: 40, color: '#0a84ff' },
  { id: 'epic', label: 'Épique', min: 750, xp: 80, color: '#bf5af2' },
  { id: 'legendary', label: 'Légendaire', min: 5000, xp: 200, color: '#ffcc00' },
];

export function rarityOf(card) {
  const v = typeof card.views === 'number' ? card.views : 0;
  return [...RARITIES].reverse().find((r) => v >= r.min);
}

// Niveau n atteint à 25·n·(n−1) XP : 50, 150, 300, 500…
export const xpForLevel = (n) => 25 * n * (n - 1);

export function levelOf(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

const TITLES = [
  [1, 'Apprenti chasseur'],
  [3, 'Pisteur'],
  [5, 'Fureteur'],
  [8, 'Érudit'],
  [12, 'Encyclopédiste'],
  [17, 'Grand archiviste'],
  [25, 'Légende de Wikipédia'],
];

export const titleOf = (level) => TITLES.filter(([min]) => level >= min).pop()[1];

// Série : jours de tirage consécutifs dont toutes les cartes ont été capturées.
// Le jour en cours ne casse pas la série tant qu'il n'est pas fini.
export function streakOf(cards, caught, today) {
  const byDay = new Map();
  for (const c of cards) {
    const d = byDay.get(c.date) ?? { total: 0, done: 0 };
    d.total++;
    if (caught[c.id]) d.done++;
    byDay.set(c.date, d);
  }
  let streak = 0;
  for (const date of [...byDay.keys()].sort().reverse()) {
    const { total, done } = byDay.get(date);
    if (done === total) streak++;
    else if (date === today) continue;
    else break;
  }
  return streak;
}
