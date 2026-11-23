// Quêtes de Wikichasse : chaque jour, 3 quêtes (4 avec la recherche « Contrats »)
// et une quête de la semaine. Elles sont tirées d'après la date (même tirage sur
// tous les appareils) et remplies d'après les captures du jour : rien n'est
// enregistré, tout est recalculé.
import { isShiny, rarityOf, seededRandom, weekOf } from './wikimasters';
import { THEMES, themeIdOf } from './wikiThemes';

// Les quêtes comptent à partir de leur mise en service (pas de rappel rétroactif)
export const QUESTS_START = '2026-11-23';

export const QUEST_REWARD = { xp: 25, points: 2 };
export const ALL_QUESTS_REWARD = { xp: 40, points: 3 };
export const WEEKLY_REWARD = { xp: 150, points: 10 };

const QUEST_THEMES = THEMES.filter((t) => t.id !== 'misc');
const STRONG = new Set(['rare', 'epic', 'legendary']);
const pick = (rnd, list) => list[Math.floor(rnd() * list.length)];
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const themesIn = (got) => new Set(got.map(themeIdOf).filter((id) => id !== 'misc')).size;

// make(rnd) → { text, target, measure(got, ctx) } ; got : cartes capturées sur la
// période, ctx : { missionDone, perfectDays, fx }
const DAILY = [
  {
    id: 'catch',
    make: (rnd) => {
      const n = pick(rnd, [5, 6, 7, 8]);
      return { text: `Capturer ${n} cartes`, target: n, measure: (got) => got.length };
    },
  },
  {
    id: 'rare',
    make: () => ({
      text: 'Capturer 1 carte Rare ou mieux',
      target: 1,
      measure: (got) => got.filter((c) => STRONG.has(rarityOf(c).id)).length,
    }),
  },
  {
    id: 'uncommon',
    make: (rnd) => {
      const n = pick(rnd, [2, 3]);
      return {
        text: `Capturer ${n} cartes Peu communes ou mieux`,
        target: n,
        measure: (got) => got.filter((c) => rarityOf(c).id !== 'common').length,
      };
    },
  },
  {
    id: 'theme',
    make: (rnd) => {
      const t = pick(rnd, QUEST_THEMES);
      const n = t.id === 'geo' || t.id === 'people' ? 2 : 1;
      return {
        text: `Capturer ${plural(n, 'carte')} du thème ${t.name}`,
        theme: t.id,
        target: n,
        measure: (got) => got.filter((c) => themeIdOf(c) === t.id).length,
      };
    },
  },
  {
    id: 'photo',
    make: (rnd) => {
      const n = pick(rnd, [3, 4]);
      return { text: `Capturer ${n} cartes illustrées`, target: n, measure: (got) => got.filter((c) => c.thumb).length };
    },
  },
  {
    id: 'variety',
    make: (rnd) => {
      const n = pick(rnd, [3, 4]);
      return { text: `Capturer des cartes de ${n} thèmes différents`, target: n, measure: themesIn };
    },
  },
  {
    id: 'bonus',
    make: (rnd) => {
      const n = pick(rnd, [1, 2]);
      return {
        text: `Capturer ${plural(n, 'carte')} bonus`,
        target: n,
        measure: (got) => got.filter((c) => c.bonus).length,
      };
    },
  },
  {
    id: 'views',
    make: (rnd) => {
      const n = pick(rnd, [300, 600, 1000]);
      return {
        text: `Capturer des cartes cumulant ${n.toLocaleString('fr-FR')} vues`,
        target: n,
        measure: (got) => got.reduce((s, c) => s + (typeof c.views === 'number' ? c.views : 0), 0),
      };
    },
  },
  {
    id: 'mission',
    make: () => ({ text: 'Boucler la mission du jour', target: 1, measure: (_, ctx) => (ctx.missionDone ? 1 : 0) }),
  },
];

const WEEKLY = [
  {
    id: 'catch',
    make: (rnd) => {
      const n = pick(rnd, [25, 30, 40]);
      return { text: `Capturer ${n} cartes cette semaine`, target: n, measure: (got) => got.length };
    },
  },
  {
    id: 'theme',
    make: (rnd) => {
      const t = pick(rnd, QUEST_THEMES);
      const n = t.id === 'geo' || t.id === 'people' ? 8 : 5;
      return {
        text: `Capturer ${n} cartes du thème ${t.name}`,
        theme: t.id,
        target: n,
        measure: (got) => got.filter((c) => themeIdOf(c) === t.id).length,
      };
    },
  },
  {
    id: 'strong',
    make: () => ({
      text: 'Capturer 3 cartes Rares ou mieux',
      target: 3,
      measure: (got) => got.filter((c) => STRONG.has(rarityOf(c).id)).length,
    }),
  },
  {
    id: 'perfect',
    make: (rnd) => {
      const n = pick(rnd, [4, 5]);
      return { text: `${n} journées parfaites`, target: n, measure: (_, ctx) => ctx.perfectDays };
    },
  },
  {
    id: 'variety',
    make: () => ({ text: `Capturer une carte de chacun des ${QUEST_THEMES.length} thèmes`, target: QUEST_THEMES.length, measure: themesIn }),
  },
  {
    id: 'epic',
    make: () => ({
      text: 'Capturer 1 carte Épique ou mieux',
      target: 1,
      measure: (got) => got.filter((c) => ['epic', 'legendary'].includes(rarityOf(c).id)).length,
    }),
  },
  {
    id: 'shiny',
    make: () => ({
      text: 'Capturer 1 carte brillante',
      target: 1,
      measure: (got, ctx) => got.filter((c) => isShiny(c, ctx.fx.shinyRate)).length,
    }),
  },
];

// Les quêtes d'une journée : mélange déterministe, les count premières (les 3
// premières sont donc les mêmes avec ou sans la 4e quête de « Contrats »)
export function dailyQuests(date, count = 3) {
  const rnd = seededRandom(`quests:${date}`);
  const order = DAILY.map((q) => ({ q, k: rnd() })).sort((a, b) => a.k - b.k);
  return order.slice(0, count).map(({ q }) => ({ id: `${date}:${q.id}`, kind: q.id, ...q.make(rnd) }));
}

export function weeklyQuest(week) {
  const rnd = seededRandom(`weekly:${week}`);
  const q = pick(rnd, WEEKLY);
  return { id: `${week}:${q.id}`, kind: q.id, ...q.make(rnd) };
}

const evaluate = (q, got, ctx) => {
  const cur = q.measure(got, ctx);
  return { ...q, cur: Math.min(cur, q.target), done: cur >= q.target };
};

// Toutes les quêtes, du lancement à aujourd'hui : progression du jour et de la
// semaine, et récompenses cumulées (XP avant multiplicateur, points)
export function questBoard({ cards, caught, today, fx }) {
  const gotByDay = new Map();
  for (const c of cards) {
    const d = caught[c.id];
    if (!d) continue;
    if (!gotByDay.has(d)) gotByDay.set(d, []);
    gotByDay.get(d).push(c);
  }
  const drawDays = new Map();
  for (const c of cards) {
    if (c.bonus) continue;
    const d = drawDays.get(c.date) ?? { total: 0, done: 0 };
    d.total++;
    if (caught[c.id]) d.done++;
    drawDays.set(c.date, d);
  }
  const missionDone = (date) => {
    const d = drawDays.get(date);
    return Boolean(d) && d.done === d.total;
  };

  const evalDay = (date) =>
    dailyQuests(date, fx.questCount).map((q) => evaluate(q, gotByDay.get(date) ?? [], { missionDone: missionDone(date), fx }));

  const evalWeek = (week) => {
    const got = [];
    for (const [d, list] of gotByDay) if (weekOf(d) === week) got.push(...list);
    const perfectDays = [...drawDays.keys()].filter((d) => weekOf(d) === week && missionDone(d)).length;
    return evaluate(weeklyQuest(week), got, { perfectDays, fx });
  };

  let xp = 0;
  let points = 0;
  let dailyDone = 0;
  let fullDays = 0;
  let weeklyDone = 0;
  const weeks = new Set();
  for (const date of gotByDay.keys()) {
    if (date < QUESTS_START || date > today) continue;
    weeks.add(weekOf(date));
    const qs = evalDay(date);
    const n = qs.filter((q) => q.done).length;
    dailyDone += n;
    xp += n * QUEST_REWARD.xp;
    points += n * QUEST_REWARD.points;
    if (n === qs.length) {
      fullDays++;
      xp += ALL_QUESTS_REWARD.xp;
      points += ALL_QUESTS_REWARD.points;
    }
  }
  for (const w of weeks) {
    if (!evalWeek(w).done) continue;
    weeklyDone++;
    xp += WEEKLY_REWARD.xp;
    points += WEEKLY_REWARD.points;
  }

  const week = weekOf(today);
  const daysLeft = 7 - Math.round((new Date(`${today}T12:00:00`) - new Date(`${week}T12:00:00`)) / 86400000);
  return {
    today: evalDay(today),
    weekly: evalWeek(week),
    weekDaysLeft: daysLeft,
    xp,
    points,
    dailyDone,
    fullDays,
    weeklyDone,
  };
}
