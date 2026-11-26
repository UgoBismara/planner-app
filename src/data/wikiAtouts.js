// Atouts de Wikichasse, façon jokers de Balatro : des bonus passifs à collectionner
// qui changent la valeur d'une capture selon la carte. On en équipe quelques-uns
// (emplacements limités), avant la première capture du jour.
//
// Valeur d'une capture : (XP de base + bonus « + ») × multiplicateurs « × ».
//
// Enregistré sous LOADOUT_KEY, par l'appli seule : { [date]: [ids] }, l'équipement
// choisi à partir de cette date. Une capture compte avec l'équipement de son jour :
// changer d'atouts ne réécrit jamais le passé, tout reste recalculable.
//
// Les conditions de déblocage ne dépendent que des captures (jamais de l'XP, que
// les atouts eux-mêmes font varier).
import { rarityOf } from './wikimasters.js';
import { themeById } from './wikiThemes.js';

export const LOADOUT_KEY = 'wikichasse-atouts';

const STRONG = new Set(['rare', 'epic', 'legendary']);
const YEAR = /\b(1\d{3}|20\d{2})\b/;

const THEME_ATOUTS = [
  ['sport', 'Ballon d’or'],
  ['people', 'Carnet d’autographes'],
  ['nature', 'Herbier'],
  ['culture', 'Palette'],
  ['history', 'Grimoire'],
  ['geo', 'Boussole'],
].map(([theme, name]) => ({
  id: `theme-${theme}`,
  name,
  desc: `+35 XP par carte du thème ${themeById(theme).name}`,
  unlock: `Compléter une page de l’album ${themeById(theme).name}`,
  unlocked: (s) => (s.pages[theme] ?? 0) >= 1,
  effect: (c, i) => (i.theme === theme ? { add: 35 } : null),
}));

// effect(card, info) → { add } | { mult } | null
// info : { theme, shiny, late, commune, sameDay (captures ce jour-là), streak (série ce jour-là),
//         bossHit (blesse le boss de la semaine), quizPerfect (quiz parfait ce jour-là) }
// unlocked(stats) ; stats : { total, bestStreak, defis, shiny, pages, peakDivision, bosses, avent, quizPerfect }
export const ATOUTS = [
  {
    id: 'chrono',
    name: 'Chronomètre',
    desc: '+30 XP si le titre contient une année',
    unlock: 'Dès le départ',
    unlocked: () => true,
    effect: (c) => (YEAR.test(c.title) ? { add: 30 } : null),
  },
  {
    id: 'blank',
    name: 'Page blanche',
    desc: '+25 XP pour une carte sans image',
    unlock: 'Dès le départ',
    unlocked: () => true,
    effect: (c) => (!c.thumb ? { add: 25 } : null),
  },
  {
    id: 'humble',
    name: 'Humilité',
    desc: '+15 XP pour une carte Commune',
    unlock: 'Dès le départ',
    unlocked: () => true,
    effect: (c) => (rarityOf(c).id === 'common' ? { add: 15 } : null),
  },
  {
    id: 'short',
    name: 'Concision',
    desc: '+25 XP si le titre fait 10 caractères ou moins',
    unlock: 'Capturer 5 cartes',
    unlocked: (s) => s.total >= 5,
    effect: (c) => (c.title.length <= 10 ? { add: 25 } : null),
  },
  {
    id: 'verbose',
    name: 'Verbiage',
    desc: '+20 XP si le titre fait 25 caractères ou plus',
    unlock: 'Capturer 10 cartes',
    unlocked: (s) => s.total >= 10,
    effect: (c) => (c.title.length >= 25 ? { add: 20 } : null),
  },
  {
    id: 'snowball',
    name: 'Boule de neige',
    desc: '+10 XP par autre capture du même jour (jusqu’à +50)',
    unlock: 'Capturer 20 cartes',
    unlocked: (s) => s.total >= 20,
    effect: (c, i) => (i.sameDay > 1 ? { add: Math.min(50, 10 * (i.sameDay - 1)) } : null),
  },
  {
    id: 'archivist',
    name: 'Archiviste',
    desc: '+25 XP pour une carte tirée un autre jour (ancienne ou bonus)',
    unlock: 'Capturer 30 cartes',
    unlocked: (s) => s.total >= 30,
    effect: (c, i) => (i.late ? { add: 25 } : null),
  },
  {
    id: 'expert',
    name: 'Œil d’expert',
    desc: '×1,5 pour une carte Rare ou mieux',
    unlock: 'Capturer 50 cartes',
    unlocked: (s) => s.total >= 50,
    effect: (c) => (STRONG.has(rarityOf(c).id) ? { mult: 1.5 } : null),
  },
  {
    id: 'ghost',
    name: 'Spectre',
    desc: '×2 pour une carte à moins de 20 vues en 30 jours',
    unlock: 'Capturer 80 cartes',
    unlocked: (s) => s.total >= 80,
    effect: (c) => (typeof c.views === 'number' && c.views < 20 ? { mult: 2 } : null),
  },
  {
    id: 'flame',
    name: 'Flamme éternelle',
    desc: '+3 XP par jour de série (jusqu’à +60)',
    unlock: 'Série de 7 jours',
    unlocked: (s) => s.bestStreak >= 7,
    effect: (c, i) => (i.streak > 0 ? { add: Math.min(60, 3 * i.streak) } : null),
  },
  {
    id: 'echo',
    name: 'Écho',
    desc: '×2 pour la carte commune capturée le jour même',
    unlock: 'Réussir 3 défis du jour',
    unlocked: (s) => s.defis >= 3,
    effect: (c, i) => (i.commune ? { mult: 2 } : null),
  },
  {
    id: 'clover',
    name: 'Trèfle à quatre feuilles',
    desc: '×2 pour une carte brillante',
    unlock: 'Capturer une carte brillante',
    unlocked: (s) => s.shiny >= 1,
    effect: (c, i) => (i.shiny ? { mult: 2 } : null),
  },
  {
    id: 'giant',
    name: 'Tueur de géants',
    desc: '+40 XP pour une carte qui blesse le boss de la semaine',
    unlock: 'Vaincre 2 boss',
    unlocked: (s) => (s.bosses ?? 0) >= 2,
    effect: (c, i) => (i.bossHit ? { add: 40 } : null),
  },
  {
    id: 'scholar',
    name: 'Érudit',
    desc: '×1,5 sur les captures d’un jour de quiz parfait',
    unlock: 'Réussir 5 quiz parfaits',
    unlocked: (s) => (s.quizPerfect ?? 0) >= 5,
    effect: (c, i) => (i.quizPerfect ? { mult: 1.5 } : null),
  },
  {
    id: 'snowflake',
    name: 'Flocon',
    desc: '+20 XP sur toutes les captures',
    unlock: 'Ouvrir 20 cases du calendrier de l’Avent',
    unlocked: (s) => (s.avent ?? 0) >= 20,
    effect: () => ({ add: 20 }),
  },
  ...THEME_ATOUTS,
  {
    id: 'crown',
    name: 'Couronne',
    desc: '×1,25 sur toutes les captures',
    unlock: 'Atteindre la division Or en saison',
    unlocked: (s) => s.peakDivision >= 3,
    effect: () => ({ mult: 1.25 }),
  },
];

export const atoutById = (id) => ATOUTS.find((a) => a.id === id);

// Emplacements : 1, +1 à 15 captures, +1 à 60 captures, +1 avec la recherche « Poche secrète »
export const SLOT_STEPS = [15, 60];
export const slotsOf = (stats, fx) => 1 + SLOT_STEPS.filter((n) => stats.total >= n).length + (fx.atoutSlots ?? 0);

export const unlockedAtouts = (stats) => ATOUTS.filter((a) => a.unlocked(stats)).map((a) => a.id);

// Équipement en vigueur à une date : la dernière entrée au plus tard ce jour-là
export function loadoutOn(loadouts, date) {
  let best = null;
  for (const k of Object.keys(loadouts ?? {})) if (k <= date && (!best || k > best)) best = k;
  return best ? loadouts[best].filter((id) => atoutById(id)) : [];
}

// Applique une liste d'effets { add } / { mult } : somme puis produit
export function applyEffects(base, effects) {
  const add = effects.reduce((s, e) => s + (e.add ?? 0), 0);
  const mult = effects.reduce((p, e) => p * (e.mult ?? 1), 1);
  return (base + add) * mult;
}
