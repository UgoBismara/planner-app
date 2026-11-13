// Succès de Wikichasse. Tout est calculé à partir des cartes et des captures ;
// la date de premier déblocage est gardée à part (ACHIEVEMENTS_KEY, écrite
// uniquement par l'appli) pour qu'un succès ne se reverrouille jamais.
import { rarityOf } from './wikimasters';

export const ACHIEVEMENTS_KEY = 'wikimasters-achievements';

// Lundi de la semaine d'une date AAAA-MM-JJ (clé de semaine)
function weekOf(iso) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

const countBy = (items, key) => {
  const m = new Map();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
};

// Tout ce dont les succès ont besoin, calculé une seule fois
export function buildContext({ cards, caught, level, today }) {
  const got = cards.filter((c) => caught[c.id]);
  const rarity = countBy(got, (c) => rarityOf(c).id);

  // Journées de tirage (hors bonus) : complètes ? terminées après coup ?
  const days = new Map();
  for (const c of cards) {
    if (c.bonus) continue;
    const d = days.get(c.date) ?? { total: 0, done: 0, lastCatch: '' };
    d.total++;
    if (caught[c.id]) {
      d.done++;
      if (caught[c.id] > d.lastCatch) d.lastCatch = caught[c.id];
    }
    days.set(c.date, d);
  }
  const dates = [...days.keys()].sort();
  const complete = (date) => days.get(date).done === days.get(date).total;

  let bestStreak = 0;
  let run = 0;
  for (const date of dates) {
    if (complete(date)) bestStreak = Math.max(bestStreak, ++run);
    else if (date !== today) run = 0;
  }

  const perCatchDay = countBy(got, (c) => caught[c.id]);
  const strongPerDay = countBy(
    got.filter((c) => ['rare', 'epic', 'legendary'].includes(rarityOf(c).id)),
    (c) => caught[c.id],
  );
  const raritiesPerWeek = new Map();
  for (const c of got) {
    const w = weekOf(caught[c.id]);
    if (!raritiesPerWeek.has(w)) raritiesPerWeek.set(w, new Set());
    raritiesPerWeek.get(w).add(rarityOf(c).id);
  }

  return {
    total: got.length,
    rarity: (id) => rarity.get(id) ?? 0,
    perfectDays: dates.filter(complete).length,
    comeback: dates.some((d) => complete(d) && days.get(d).lastCatch > d),
    bestStreak,
    bonus: got.filter((c) => c.bonus).length,
    maxPerDay: Math.max(0, ...perCatchDay.values()),
    maxStrongPerDay: Math.max(0, ...strongPerDay.values()),
    rainbow: [...raritiesPerWeek.values()].some((s) => s.size === 5),
    level,
    got,
  };
}

const atLeast = (cur, target) => ({ done: cur >= target, cur: Math.min(cur, target), target });
const flag = (done) => ({ done });

// hidden : affiché « ??? » tant qu'il n'est pas débloqué
export const ACHIEVEMENTS = [
  { id: 'first', name: 'Premier sang', desc: 'Capturer ta première carte', check: (x) => atLeast(x.total, 1) },
  { id: 'col10', name: 'Collectionneur', desc: 'Capturer 10 cartes', check: (x) => atLeast(x.total, 10) },
  { id: 'col50', name: 'Grand collectionneur', desc: 'Capturer 50 cartes', check: (x) => atLeast(x.total, 50) },
  { id: 'col100', name: 'Centurion', desc: 'Capturer 100 cartes', check: (x) => atLeast(x.total, 100) },
  { id: 'col250', name: 'Conservateur', desc: 'Capturer 250 cartes', check: (x) => atLeast(x.total, 250) },
  { id: 'col500', name: 'Bibliothèque vivante', desc: 'Capturer 500 cartes', check: (x) => atLeast(x.total, 500) },

  { id: 'perfect1', name: 'Journée parfaite', desc: "Capturer toutes les cartes d'une journée", check: (x) => atLeast(x.perfectDays, 1) },
  { id: 'perfect10', name: 'Perfectionniste', desc: '10 journées parfaites', check: (x) => atLeast(x.perfectDays, 10) },
  { id: 'streak3', name: 'En jambes', desc: 'Série de 3 jours', check: (x) => atLeast(x.bestStreak, 3) },
  { id: 'streak7', name: 'Semaine sans faute', desc: 'Série de 7 jours', check: (x) => atLeast(x.bestStreak, 7) },
  { id: 'streak30', name: 'Marathonien', desc: 'Série de 30 jours', check: (x) => atLeast(x.bestStreak, 30) },
  { id: 'streak100', name: 'Inarrêtable', desc: 'Série de 100 jours', check: (x) => atLeast(x.bestStreak, 100) },

  { id: 'rare1', name: 'Œil de lynx', desc: 'Capturer une carte Rare', check: (x) => atLeast(x.rarity('rare'), 1) },
  { id: 'epic1', name: 'Trésor épique', desc: 'Capturer une carte Épique', check: (x) => atLeast(x.rarity('epic'), 1) },
  { id: 'leg1', name: 'Coup de chance', desc: 'Capturer une carte Légendaire', check: (x) => atLeast(x.rarity('legendary'), 1) },
  { id: 'leg5', name: 'Panthéon', desc: 'Capturer 5 cartes Légendaires', check: (x) => atLeast(x.rarity('legendary'), 5) },
  { id: 'rainbow', name: 'Arc-en-ciel', desc: 'Les 5 raretés capturées la même semaine', check: (x) => flag(x.rainbow) },

  { id: 'bonus1', name: 'Rab', desc: 'Capturer une carte bonus', check: (x) => atLeast(x.bonus, 1) },
  { id: 'bonus25', name: 'Insatiable', desc: 'Capturer 25 cartes bonus', check: (x) => atLeast(x.bonus, 25) },
  { id: 'day15', name: 'Razzia', desc: '15 captures en une journée', check: (x) => atLeast(x.maxPerDay, 15) },

  { id: 'lvl5', name: 'Montée en grade', desc: 'Atteindre le niveau 5', check: (x) => atLeast(x.level, 5) },
  { id: 'lvl10', name: 'Vétéran', desc: 'Atteindre le niveau 10', check: (x) => atLeast(x.level, 10) },
  { id: 'lvl20', name: 'Maître chasseur', desc: 'Atteindre le niveau 20', check: (x) => atLeast(x.level, 20) },

  { id: 'ghost', hidden: true, name: 'Fantôme', desc: 'Capturer une carte que personne n’a lue en 30 jours', check: (x) => flag(x.got.some((c) => c.views === 0)) },
  { id: 'archeo', hidden: true, name: 'Archéologue', desc: 'Capturer une carte à moins de 5 vues en 30 jours', check: (x) => flag(x.got.some((c) => typeof c.views === 'number' && c.views < 5)) },
  { id: 'time', hidden: true, name: 'Voyageur temporel', desc: 'Capturer une carte dont le titre contient une année', check: (x) => flag(x.got.some((c) => /\b(1\d{3}|20\d{2})\b/.test(c.title))) },
  { id: 'long', hidden: true, name: 'Titre à rallonge', desc: 'Capturer une carte au titre de 45 caractères ou plus', check: (x) => flag(x.got.some((c) => c.title.length >= 45)) },
  { id: 'short', hidden: true, name: 'Laconique', desc: 'Capturer une carte au titre de 5 caractères ou moins', check: (x) => flag(x.got.some((c) => c.title.length <= 5)) },
  { id: 'comeback', hidden: true, name: 'Retour en force', desc: 'Terminer après coup une journée laissée en plan', check: (x) => flag(x.comeback) },
  { id: 'magnet', hidden: true, name: 'Aimant à trésors', desc: '3 cartes Rares ou mieux capturées le même jour', check: (x) => atLeast(x.maxStrongPerDay, 3) },
];
