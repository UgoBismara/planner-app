// Coffres de Wikichasse : chaque journée parfaite (à partir du lancement) donne un
// coffre à ouvrir. Le butin dépend de la date (même résultat partout) ; seules
// les dates des coffres ouverts sont enregistrées, sous CHESTS_KEY, par l'appli.
import { seededRandom } from './wikimasters';
import { QUESTS_START } from './wikiQuests';

export const CHESTS_KEY = 'wikimasters-chests';

// weight : chances relatives ; xp et points avant le multiplicateur de recherche
export const LOOT = [
  { id: 'wood', name: 'Coffre en bois', weight: 40, xp: 60, points: 0, color: '#a2845e' },
  { id: 'wood-pts', name: 'Coffre en bois', weight: 20, xp: 0, points: 4, color: '#a2845e' },
  { id: 'iron', name: 'Coffre en fer', weight: 18, xp: 120, points: 3, color: '#98989f' },
  { id: 'silver', name: 'Coffre d’argent', weight: 12, xp: 50, points: 10, color: '#c7c7cc' },
  { id: 'gold', name: 'Coffre d’or', weight: 8, xp: 250, points: 8, color: '#ffcc00' },
  { id: 'jackpot', name: 'Coffre légendaire', weight: 2, xp: 600, points: 25, color: '#ff375f', jackpot: true },
];

const TOTAL = LOOT.reduce((s, l) => s + l.weight, 0);

export function lootOf(date, mult = 1) {
  let r = seededRandom(`chest:${date}`)() * TOTAL;
  const l = LOOT.find((x) => (r -= x.weight) < 0) ?? LOOT[0];
  return { ...l, xp: Math.round(l.xp * mult), points: Math.round(l.points * mult) };
}

// Un coffre par journée de tirage bouclée, de la plus récente à la plus ancienne
export function chestsOf({ cards, caught, opened, fx }) {
  const days = new Map();
  for (const c of cards) {
    if (c.bonus || c.date < QUESTS_START) continue;
    const d = days.get(c.date) ?? { total: 0, done: 0 };
    d.total++;
    if (caught[c.id]) d.done++;
    days.set(c.date, d);
  }
  return [...days.entries()]
    .filter(([, d]) => d.done === d.total)
    .map(([date]) => ({ date, opened: Boolean(opened[date]), loot: lootOf(date, fx.chestMult) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
