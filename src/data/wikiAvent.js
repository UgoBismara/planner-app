// Calendrier de l'Avent de Wikichasse : du 1er au 24 décembre, chaque jour avec
// au moins une capture gagne la case du jour, à ouvrir quand on veut (jusqu'au
// 31 décembre). Le contenu de chaque case vient de la date (même partout) ; seules
// les cases ouvertes sont enregistrées, sous AVENT_KEY, par l'appli :
// { [date de la case]: date d'ouverture }.
import { seededRandom } from './wikimasters.js';

export const AVENT_KEY = 'wikichasse-avent';

const LOOT = [
  { weight: 40, xp: 40, points: 0, label: 'Sucre d’orge' },
  { weight: 25, xp: 0, points: 4, label: 'Pain d’épices' },
  { weight: 20, xp: 80, points: 2, label: 'Boule de Noël' },
  { weight: 10, xp: 150, points: 5, label: 'Cadeau doré' },
  { weight: 5, xp: 300, points: 10, label: 'Étoile du sommet', jackpot: true },
];
const TOTAL = LOOT.reduce((s, l) => s + l.weight, 0);

export function aventLoot(date) {
  let r = seededRandom(`avent:${date}`)() * TOTAL;
  return LOOT.find((l) => (r -= l.weight) < 0) ?? LOOT[0];
}

// Cases de l'année de `today` ; visible : affiché du 20 novembre au 31 décembre
export function aventBoard({ days, opened = {}, today }) {
  const year = today.slice(0, 4);
  const cases = Array.from({ length: 24 }, (_, i) => {
    const date = `${year}-12-${String(i + 1).padStart(2, '0')}`;
    const won = days.has(date);
    return {
      n: i + 1,
      date,
      won,
      opened: won && Boolean(opened[date]),
      future: date > today,
      today: date === today,
      loot: aventLoot(date),
    };
  });
  // Toutes les années (cases ouvertes enregistrées) : récompenses cumulées
  let xp = 0;
  let points = 0;
  let count = 0;
  for (const date of Object.keys(opened)) {
    if (!days.has(date)) continue;
    const l = aventLoot(date);
    xp += l.xp;
    points += l.points;
    count++;
  }
  const md = today.slice(5);
  return {
    year,
    cases,
    visible: md >= '11-20',
    startsIn: md < '12-01' ? Math.round((new Date(`${year}-12-01T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000) : 0,
    toOpen: cases.filter((c) => c.won && !c.opened && c.date <= today).length,
    openedThisYear: cases.filter((c) => c.opened).length,
    opened: count,
    xp,
    points,
  };
}
