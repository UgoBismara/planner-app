// Recherches de Wikichasse : les captures rapportent des points de recherche,
// dépensés pour débloquer des améliorations du jeu. Comme l'XP, les points gagnés
// sont recalculés à partir des captures ; seules les recherches débloquées (et les
// relances utilisées) sont enregistrées, sous RESEARCH_KEY, écrite par l'appli seule.
import { rarityOf } from './wikimasters';

export const RESEARCH_KEY = 'wikimasters-research';
export const EMPTY_RESEARCH = { unlocked: {}, rerolls: {} };

// Points par carte capturée selon sa rareté, plus un forfait par journée parfaite
export const POINTS_BY_RARITY = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 20 };
export const POINTS_PER_PERFECT_DAY = 3;

export const BRANCHES = [
  { id: 'collect', name: 'Collecte', desc: 'Plus de cartes chaque jour' },
  { id: 'flair', name: 'Flair', desc: 'De meilleures cartes' },
  { id: 'lore', name: 'Savoir', desc: 'Plus d’XP, des séries plus solides' },
];

// requires : recherche à débloquer avant. Dans chaque branche, l'ordre du tableau
// est l'ordre d'affichage.
export const RESEARCH = [
  { id: 'extra1', branch: 'collect', name: 'Filet élargi', desc: '+1 carte par jour', cost: 15 },
  { id: 'extra2', branch: 'collect', name: 'Grand filet', desc: '+1 carte par jour (soit +2)', cost: 45, requires: 'extra1' },
  { id: 'extra3', branch: 'collect', name: 'Chalutier', desc: '+1 carte par jour (soit +3)', cost: 120, requires: 'extra2' },

  { id: 'reroll1', branch: 'flair', name: 'Relance', desc: 'Remplacer 1 carte du jour non capturée par jour', cost: 10 },
  { id: 'flair1', branch: 'flair', name: 'Flair', desc: 'Chaque jour, 1 carte du tirage est la plus lue de 3 candidates', cost: 30, requires: 'reroll1' },
  { id: 'reroll2', branch: 'flair', name: 'Double relance', desc: '2 relances par jour', cost: 40, requires: 'flair1' },
  { id: 'flair2', branch: 'flair', name: 'Flair aiguisé', desc: '3 cartes du tirage sur 3 candidates', cost: 90, requires: 'reroll2' },

  { id: 'xp1', branch: 'lore', name: 'Érudition', desc: '+10 % d’XP sur tout', cost: 20 },
  { id: 'mission', branch: 'lore', name: 'Prime de mission', desc: 'Bonus de mission doublé (100 XP)', cost: 25, requires: 'xp1' },
  { id: 'freeze', branch: 'lore', name: 'Gel de série', desc: 'Une journée ratée par semaine ne casse pas la série', cost: 50, requires: 'mission' },
  { id: 'xp2', branch: 'lore', name: 'Haute érudition', desc: '+25 % d’XP sur tout (au lieu de 10 %)', cost: 80, requires: 'freeze' },
];

export const researchById = (id) => RESEARCH.find((r) => r.id === id);

export function pointsEarned(cards, caught) {
  let pts = 0;
  const days = new Map();
  for (const c of cards) {
    if (caught[c.id]) pts += POINTS_BY_RARITY[rarityOf(c).id] ?? 1;
    if (c.bonus) continue;
    const d = days.get(c.date) ?? { total: 0, done: 0 };
    d.total++;
    if (caught[c.id]) d.done++;
    days.set(c.date, d);
  }
  for (const d of days.values()) if (d.done === d.total) pts += POINTS_PER_PERFECT_DAY;
  return pts;
}

export const pointsSpent = (unlocked) =>
  Object.keys(unlocked ?? {}).reduce((s, id) => s + (researchById(id)?.cost ?? 0), 0);

// Effets cumulés des recherches débloquées
export function effectsOf(unlocked = {}) {
  const has = (id) => Boolean(unlocked[id]);
  return {
    extraCards: ['extra1', 'extra2', 'extra3'].filter(has).length,
    rerollsPerDay: has('reroll2') ? 2 : has('reroll1') ? 1 : 0,
    flairCards: has('flair2') ? 3 : has('flair1') ? 1 : 0,
    xpMult: has('xp2') ? 1.25 : has('xp1') ? 1.1 : 1,
    missionMult: has('mission') ? 2 : 1,
    freeze: has('freeze'),
  };
}

// État d'une recherche pour l'affichage : done | available | expensive | locked
export function statusOf(r, unlocked, points) {
  if (unlocked[r.id]) return 'done';
  if (r.requires && !unlocked[r.requires]) return 'locked';
  return points >= r.cost ? 'available' : 'expensive';
}
