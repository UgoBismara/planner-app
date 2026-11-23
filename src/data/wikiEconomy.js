// XP et points de recherche de Wikichasse, recalculés à partir de tout ce qui est
// enregistré (cartes, captures, coffres ouverts, recherches, succès).
import { isShiny, rarityOf } from './wikimasters';
import { questBoard } from './wikiQuests';
import { chestProgress, chestsOf } from './wikiChests';
import { pointsEarned } from './wikiResearch';

export const MISSION_BONUS = 50;

// Points de recherche par succès débloqué
export const ACH_POINTS = 5;
export const ACH_POINTS_HIDDEN = 10;

// XP des cartes (brillantes multipliées) + bonus de chaque journée bouclée (les
// cartes bonus ne comptent pas dans les journées), avant multiplicateur
function cardsXp(cards, caught, fx) {
  let xp = 0;
  const days = new Map();
  for (const c of cards) {
    if (caught[c.id]) xp += rarityOf(c).xp * (isShiny(c, fx.shinyRate) ? fx.shinyMult : 1);
    if (c.bonus) continue;
    const d = days.get(c.date) ?? { total: 0, done: 0 };
    d.total++;
    if (caught[c.id]) d.done++;
    days.set(c.date, d);
  }
  for (const d of days.values()) if (d.done === d.total) xp += MISSION_BONUS * fx.missionMult;
  return xp;
}

// XP d'une carte telle qu'affichée (multiplicateurs compris)
export const cardXp = (card, fx) =>
  Math.round(rarityOf(card).xp * (isShiny(card, fx.shinyRate) ? fx.shinyMult : 1) * fx.xpMult);

export function computeEconomy({ cards, caught, opened, fx, today }) {
  const quests = questBoard({ cards, caught, today, fx });
  const chests = chestsOf({ cards, caught, opened, fx });
  const openedChests = chests.filter((c) => c.opened);
  const chestXp = openedChests.reduce((s, c) => s + c.loot.xp, 0);
  const chestPoints = openedChests.reduce((s, c) => s + c.loot.points, 0);
  return {
    xp: Math.round((cardsXp(cards, caught, fx) + quests.xp + chestXp) * fx.xpMult),
    // Sans les points des succès, ajoutés par l'appelant
    points: pointsEarned(cards, caught, fx) + quests.points + chestPoints,
    quests,
    chests,
    chestProgress: chestProgress({ cards, caught }),
  };
}
