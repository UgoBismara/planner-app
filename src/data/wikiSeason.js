// Saisons de Wikichasse, façon classement ATP de Tennis Manager :
// - chaque capture et chaque exploit rapporte des POINTS DE CLASSEMENT à sa date ;
// - la division se lit sur les points des 28 derniers jours (fenêtre glissante :
//   des points « à défendre » tombent chaque jour, on peut redescendre) ;
// - une saison = un mois civil ; sa meilleure division rapporte une récompense
//   une fois le mois terminé (palmarès).
// Tout est recalculé : rien n'est enregistré. Même calcul pour tous les joueurs,
// donc un classement entre amis n'aura qu'à comparer ces points.
import { addDays, daysBetween, isDrawCard, rarityOf, weekOf } from './wikimasters.js';

export const WINDOW = 28;
export const SEASON_START = '2026-11'; // Saison 1

export const RANK_POINTS = {
  rarity: { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 20 },
  day: 2, // jour avec au moins une capture
  defi: 10, // défi du jour réussi
  perfect: 5, // journée parfaite (toutes les cartes du tirage)
};

// Seuils sur 28 jours : ~1 capture et 1 défi par jour mènent vers Platine/Diamant,
// Maître demande de presque tout réussir
// Rival fantôme : toi-même, la semaine dernière, au même moment de la semaine.
// Une semaine terminée avec plus de points que la précédente le bat (le premier
// adversaire du jeu, en attendant de vrais amis).
export const GHOST_START = '2026-11-23';
export const GHOST_REWARD = { xp: 50, points: 3 };

const sumRange = (byDay, from, to) => {
  let s = 0;
  for (const [d, n] of byDay) if (d >= from && d <= to) s += n;
  return s;
};

export const DIVISIONS = [
  { id: 'wood', name: 'Bois', min: 0, color: '#a2845e', reward: { xp: 0, points: 0 } },
  { id: 'bronze', name: 'Bronze', min: 20, color: '#c87533', reward: { xp: 50, points: 2 } },
  { id: 'silver', name: 'Argent', min: 60, color: '#c7c7cc', reward: { xp: 100, points: 4 } },
  { id: 'gold', name: 'Or', min: 120, color: '#ffcc00', reward: { xp: 200, points: 8 } },
  { id: 'platinum', name: 'Platine', min: 200, color: '#64d2ff', reward: { xp: 350, points: 12 } },
  { id: 'diamond', name: 'Diamant', min: 300, color: '#bf5af2', reward: { xp: 500, points: 16 } },
  { id: 'master', name: 'Maître', min: 450, color: '#ff375f', reward: { xp: 800, points: 25 } },
];

export const divisionIndex = (pts) => {
  let i = 0;
  while (i + 1 < DIVISIONS.length && pts >= DIVISIONS[i + 1].min) i++;
  return i;
};

const monthOf = (iso) => iso.slice(0, 7);
const seasonNumber = (month) => {
  const [y, m] = month.split('-').map(Number);
  const [y0, m0] = SEASON_START.split('-').map(Number);
  return (y - y0) * 12 + (m - m0) + 1;
};
export const seasonLabel = (month) =>
  `Saison ${seasonNumber(month)} · ${new Date(`${month}-15T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;

const lastDayOf = (month) => {
  const d = new Date(`${month}-01T12:00:00`);
  d.setMonth(d.getMonth() + 1, 0);
  return d.toISOString().slice(0, 10);
};

// Points de classement par date. defisWon : Set des dates de défi réussi
export function rankPointsByDay(cards, caught, defisWon) {
  const byDay = new Map();
  const add = (d, n) => byDay.set(d, (byDay.get(d) ?? 0) + n);
  const draws = new Map();
  for (const c of cards) {
    const d = caught[c.id];
    if (d) add(d, RANK_POINTS.rarity[rarityOf(c).id] ?? 1);
    if (!isDrawCard(c)) continue;
    const x = draws.get(c.date) ?? { total: 0, done: 0, last: '' };
    x.total++;
    if (d) {
      x.done++;
      if (d > x.last) x.last = d;
    }
    draws.set(c.date, x);
  }
  for (const d of [...byDay.keys()]) add(d, RANK_POINTS.day);
  for (const d of defisWon) add(d, RANK_POINTS.defi);
  // Journée parfaite : comptée le jour où sa dernière carte est capturée
  for (const x of draws.values()) if (x.done === x.total && x.last) add(x.last, RANK_POINTS.perfect);
  return byDay;
}

// Points de la fenêtre glissante qui se termine à `date`
function windowPoints(byDay, date) {
  let s = 0;
  for (const [d, n] of byDay) {
    const age = daysBetween(d, date);
    if (age >= 0 && age < WINDOW) s += n;
  }
  return s;
}

export function seasonBoard({ cards, caught, defisWon, today }) {
  const byDay = rankPointsByDay(cards, caught, defisWon);
  const points = windowPoints(byDay, today);
  const div = divisionIndex(points);
  const next = DIVISIONS[div + 1] ?? null;

  // Points qui sortiront de la fenêtre dans les 7 prochains jours (« à défendre »)
  let expiring = 0;
  for (const [d, n] of byDay) {
    const age = daysBetween(d, today);
    if (age >= WINDOW - 7 && age < WINDOW) expiring += n;
  }
  const weekAgo = windowPoints(byDay, addDays(today, -7));

  // Saisons : de la première à celle en cours, meilleure division atteinte
  const seasons = [];
  let month = SEASON_START;
  const nowMonth = monthOf(today);
  while (month <= nowMonth) {
    const end = month === nowMonth ? today : lastDayOf(month);
    let peak = 0;
    for (let d = `${month}-01`; d <= end; d = addDays(d, 1)) peak = Math.max(peak, divisionIndex(windowPoints(byDay, d)));
    const finished = month < nowMonth;
    seasons.push({ month, label: seasonLabel(month), peak, finished, reward: finished ? DIVISIONS[peak].reward : null });
    const n = new Date(`${month}-15T12:00:00`);
    n.setMonth(n.getMonth() + 1);
    month = n.toISOString().slice(0, 7);
  }
  const finished = seasons.filter((s) => s.finished);

  const week = weekOf(today);
  const ghost = {
    me: sumRange(byDay, week, today),
    ghost: sumRange(byDay, addDays(week, -7), addDays(today, -7)),
  };
  let ghostWins = 0;
  for (let w = addDays(weekOf(GHOST_START), 7); addDays(w, 6) < today; w = addDays(w, 7)) {
    if (sumRange(byDay, w, addDays(w, 6)) > sumRange(byDay, addDays(w, -7), addDays(w, -1))) ghostWins++;
  }

  return {
    points,
    division: div,
    next,
    toNext: next ? next.min - points : 0,
    expiring,
    trend: points - weekAgo,
    daysLeft: daysBetween(today, lastDayOf(nowMonth)) + 1,
    current: seasons[seasons.length - 1],
    seasons,
    peakDivision: Math.max(0, ...seasons.map((s) => s.peak)),
    finishedSilver: finished.filter((s) => s.peak >= 2).length,
    ghost,
    ghostWins,
    xp: finished.reduce((s, x) => s + x.reward.xp, 0) + ghostWins * GHOST_REWARD.xp,
    rewardPoints: finished.reduce((s, x) => s + x.reward.points, 0) + ghostWins * GHOST_REWARD.points,
  };
}
