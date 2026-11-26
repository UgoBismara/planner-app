// Défi du jour de Wikichasse, façon « Daily Climb » de Slay the Spire :
// - une CARTE COMMUNE tirée une fois par jour, à capturer le jour même (défi réussi) ;
// - un MODIFICATEUR du jour, tiré de la date, qui change la valeur des captures
//   du jour (à combiner avec ses atouts).
//
// Prêt pour le multijoueur : le modificateur vient de la date (le même pour tous),
// et la carte commune vit dans sa propre clé COMMUNE_KEY ({ [date]: carte }),
// écrite par l'appli (le premier appareil qui ouvre l'onglet ce jour-là, Firestore
// relu avant d'écrire). Partagée entre joueurs, elle deviendrait la carte que tout
// le monde chasse le même jour.
import { isShiny, rarityOf, seededRandom } from './wikimasters.js';
import { THEMES, themeIdOf } from './wikiThemes.js';

export const COMMUNE_KEY = 'wikichasse-commune';

// Récompense du défi réussi (avant multiplicateur), et valeur de la carte commune
// capturée le jour même
export const DEFI_REWARD = { xp: 100, points: 5 };
export const COMMUNE_MULT = 2;

const THEMED = THEMES.filter((t) => t.id !== 'misc');
const STRONG = new Set(['rare', 'epic', 'legendary']);

// effect(card, info) → { add?, mult? } ; info : { shiny, late, theme }
// make(rnd) permet de tirer un paramètre (le thème vedette)
const MODIFIERS = [
  {
    id: 'tide',
    make: () => ({
      name: 'Marée basse',
      desc: 'Les cartes Communes valent ×2',
      effect: (c) => (rarityOf(c).id === 'common' ? { mult: 2 } : null),
    }),
  },
  {
    id: 'gold',
    make: () => ({
      name: 'Ruée vers l’or',
      desc: 'Les cartes Rares ou mieux valent ×1,5',
      effect: (c) => (STRONG.has(rarityOf(c).id) ? { mult: 1.5 } : null),
    }),
  },
  {
    id: 'star',
    make: (rnd) => {
      const t = THEMED[Math.floor(rnd() * THEMED.length)];
      return {
        name: `Thème vedette : ${t.name}`,
        desc: `+40 XP par carte du thème ${t.name}`,
        theme: t.id,
        effect: (c, info) => (info.theme === t.id ? { add: 40 } : null),
      };
    },
  },
  {
    id: 'blacklight',
    make: () => ({
      name: 'Lumière noire',
      desc: 'Les cartes brillantes valent encore ×2',
      effect: (c, info) => (info.shiny ? { mult: 2 } : null),
    }),
  },
  {
    id: 'dig',
    make: () => ({
      name: 'Fouilles',
      desc: '+30 XP par carte tirée un autre jour (anciennes et bonus)',
      effect: (c, info) => (info.late ? { add: 30 } : null),
    }),
  },
  {
    id: 'spotlight',
    make: () => ({
      name: 'Projecteur',
      desc: 'La carte commune vaut ×3 au lieu de ×2',
      communeMult: 3,
      effect: () => null,
    }),
  },
  {
    id: 'gallery',
    make: () => ({
      name: 'Galerie',
      desc: '+20 XP par carte illustrée',
      effect: (c) => (c.thumb ? { add: 20 } : null),
    }),
  },
];

const cache = new Map();

// Modificateur d'une date (même résultat partout)
export function modifierOf(date) {
  if (cache.has(date)) return cache.get(date);
  const rnd = seededRandom(`modifier:${date}`);
  const m = MODIFIERS[Math.floor(rnd() * MODIFIERS.length)];
  const out = { id: m.id, communeMult: COMMUNE_MULT, ...m.make(rnd) };
  cache.set(date, out);
  return out;
}

// Infos utiles aux modificateurs et aux atouts pour une carte capturée à `date`
export const cardInfo = (card, date, fx) => ({
  shiny: isShiny(card, fx.shinyRate),
  late: Boolean(card.bonus) || (card.date && card.date < date),
  theme: themeIdOf(card),
  commune: Boolean(card.commune) && card.date === date,
});

// Défis réussis : cartes communes capturées le jour de leur tirage
export function defiResults(cards, caught) {
  const won = new Set();
  const days = [];
  for (const c of cards) {
    if (!c.commune) continue;
    days.push(c.date);
    if (caught[c.id] === c.date) won.add(c.date);
  }
  // Meilleure suite de défis réussis sur des jours de défi consécutifs
  let best = 0;
  let run = 0;
  for (const d of days.sort()) {
    run = won.has(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { won, count: won.size, best, offered: days.length };
}
