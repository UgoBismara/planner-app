// Coffres de Wikichasse : un coffre toutes les CHEST_EVERY cartes capturées (du
// jour et bonus confondues), à compter du lancement. Le n-ième coffre a toujours
// le même butin (même résultat partout) ; seuls les coffres ouverts sont
// enregistrés, sous CHESTS_KEY, par l'appli : { n1: 'AAAA-MM-JJ', n2: … }.
import { seededRandom } from './wikimasters';
import { QUESTS_START } from './wikiQuests';

export const CHESTS_KEY = 'wikimasters-chests';

export const CHEST_EVERY = 5;

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

export function lootOf(seed, mult = 1) {
  let r = seededRandom(`chest:${seed}`)() * TOTAL;
  const l = LOOT.find((x) => (r -= x.weight) < 0) ?? LOOT[0];
  return { ...l, xp: Math.round(l.xp * mult), points: Math.round(l.points * mult) };
}

// Dates de capture comptées pour les coffres, de la plus ancienne à la plus récente
const catchDates = (cards, caught) =>
  cards
    .map((c) => caught[c.id])
    .filter((d) => d && d >= QUESTS_START)
    .sort();

// Où en est le prochain coffre : have cartes sur CHEST_EVERY
export const chestProgress = ({ cards, caught }) => ({
  have: catchDates(cards, caught).length % CHEST_EVERY,
  every: CHEST_EVERY,
});

// Tous les coffres gagnés, du plus récent au plus ancien. date : jour de la
// capture qui l'a fait gagner.
export function chestsOf({ cards, caught, opened, fx }) {
  const dates = catchDates(cards, caught);
  const list = [];
  for (let n = 1; n * CHEST_EVERY <= dates.length; n++) {
    const id = `n${n}`;
    list.push({ id, n, date: dates[n * CHEST_EVERY - 1], opened: Boolean(opened[id]), loot: lootOf(`#${n}`, fx.chestMult) });
  }
  // Coffres ouverts avec l'ancienne règle (un par journée, clé = date) : gardés
  for (const key of Object.keys(opened ?? {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) list.push({ id: key, n: 0, date: key, opened: true, loot: lootOf(key, fx.chestMult) });
  }
  return list.sort((a, b) => b.date.localeCompare(a.date) || b.n - a.n);
}
