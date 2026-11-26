// Onglet Wikichasse : chaque jour, des articles de Wikipédia FR tirés au hasard,
// à capturer dans le jeu WikiMasters.
//
// Données d'un joueur, toutes recalculées par des fonctions pures (wikiEconomy.js) :
// le jour où le jeu devient multijoueur, les mêmes fonctions appliquées aux clés
// d'un ami donnent son score, sa division, ses atouts, sans rien changer aux règles.
// Ce qui doit être identique pour tous (quêtes, modificateur du jour, brillantes,
// coffres) est tiré d'une graine (la date, le pageid), jamais de Math.random.
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
  [35, 'Mémoire du monde'],
  [50, 'Omniscient'],
];

export const titleOf = (level) => TITLES.filter(([min]) => level >= min).pop()[1];

// Hachage 32 bits (FNV-1a + mélange final) : graine de tout ce qui doit être « au
// hasard » mais identique sur tous les appareils (brillantes, quêtes, coffres)
export function hash32(str) {
  let h = 0x811c9dc5;
  for (const ch of String(str)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// Générateur pseudo-aléatoire (mulberry32) à partir d'une graine texte
export function seededRandom(seed) {
  let a = hash32(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cartes brillantes : environ une carte sur 25 brille, selon son pageid (même
// résultat partout, rien à enregistrer). La recherche « Lentille holographique »
// relève le taux : des cartes déjà capturées peuvent alors se mettre à briller.
export const SHINY_RATE = 0.04;
export const isShiny = (card, rate = SHINY_RATE) => (hash32(`shiny:${card.id}`) % 10000) / 10000 < rate;

// Lundi de la semaine d'une date AAAA-MM-JJ (clé de semaine)
export function weekOf(iso) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Carte du tirage du jour (ni bonus, ni carte commune du défi) : seules celles-là
// comptent dans les journées parfaites
export const isDrawCard = (c) => !c.bonus && !c.commune;

export const daysBetween = (a, b) =>
  Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);

// Jours où au moins une carte a été capturée (date de capture, toutes cartes confondues)
export const captureDays = (cards, caught) => new Set(cards.map((c) => caught[c.id]).filter(Boolean));

// Série : jours consécutifs avec AU MOINS UNE capture (capturer plusieurs cartes
// par jour dans WikiMasters est trop dur pour en faire la règle). Le jour en
// cours ne casse pas la série tant qu'il n'est pas fini.
// freeze (recherche « Gel de série ») : un jour sans capture est sauté sans
// casser la série, au plus un tous les 7 jours
export function streakOf(cards, caught, today, freeze = false) {
  const days = captureDays(cards, caught);
  if (days.size === 0) return 0;
  const first = [...days].sort()[0];
  let d = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  let lastFrozen = null;
  while (d >= first) {
    if (days.has(d)) streak++;
    else if (freeze && (!lastFrozen || daysBetween(d, lastFrozen) >= 7)) lastFrozen = d;
    else break;
    d = addDays(d, -1);
  }
  return streak;
}

// Série atteinte à chaque jour de capture (sans gel) et meilleure série
export function streakHistory(days) {
  const at = new Map();
  let best = 0;
  let prev = null;
  for (const d of [...days].sort()) {
    const n = prev && daysBetween(prev, d) === 1 ? at.get(prev) + 1 : 1;
    at.set(d, n);
    best = Math.max(best, n);
    prev = d;
  }
  return { at, best };
}
