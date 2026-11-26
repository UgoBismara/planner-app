// Boss de la semaine de Wikichasse, façon « boss blind » de Balatro : chaque
// semaine (lundi → dimanche), un boss tiré de la date, avec des PV et une règle.
// Les captures de la semaine qui respectent la règle lui infligent leur XP en
// dégâts (atouts et modificateurs compris, avant le multiplicateur global) ; sa
// faiblesse double les dégâts. Vaincu avant dimanche soir : récompense.
// Rien n'est enregistré : tout est recalculé (le même boss pour tous les joueurs).
import { addDays, daysBetween, rarityOf, seededRandom, weekOf } from './wikimasters.js';
import { THEMES, themeIdOf } from './wikiThemes.js';

export const BOSS_START = '2026-11-23'; // premier lundi avec un boss
export const BOSS_REWARD = { xp: 200, points: 15 };

const STRONG = new Set(['epic', 'legendary']);
const THEMED = THEMES.filter((t) => t.id !== 'misc');
const views = (c) => (typeof c.views === 'number' ? c.views : null);

// hits(card) → la carte blesse-t-elle ? ; weak(card) → dégâts ×2 ; scale : dégâts de base
const BOSSES = [
  {
    id: 'mute',
    make: () => ({
      name: 'Le Bibliothécaire muet',
      rule: 'Seules les cartes sans image le blessent',
      weakness: 'Communes : dégâts ×2',
      hp: 160,
      hits: (c) => !c.thumb,
      weak: (c) => rarityOf(c).id === 'common',
    }),
  },
  {
    id: 'colossus',
    make: () => ({
      name: 'Le Colosse de papier',
      rule: 'Seules les cartes Peu communes ou mieux le blessent',
      weakness: 'Épiques et Légendaires : dégâts ×2',
      hp: 220,
      hits: (c) => rarityOf(c).id !== 'common',
      weak: (c) => STRONG.has(rarityOf(c).id),
    }),
  },
  {
    id: 'specter',
    make: () => ({
      name: 'Le Spectre des archives',
      rule: 'Seules les cartes à moins de 50 vues le blessent',
      weakness: 'Moins de 10 vues : dégâts ×2',
      hp: 170,
      hits: (c) => views(c) !== null && views(c) < 50,
      weak: (c) => views(c) !== null && views(c) < 10,
    }),
  },
  {
    id: 'hydra',
    make: () => ({
      name: 'L’Hydre aux longs titres',
      rule: 'Seules les cartes au titre de 15 caractères ou plus le blessent',
      weakness: 'Titres de 30 caractères ou plus : dégâts ×2',
      hp: 190,
      hits: (c) => c.title.length >= 15,
      weak: (c) => c.title.length >= 30,
    }),
  },
  {
    id: 'chronos',
    make: () => ({
      name: 'Chronos',
      rule: 'Seules les cartes avec un nombre dans le titre ou la description le blessent',
      weakness: 'Une année dans le titre : dégâts ×2',
      hp: 160,
      hits: (c) => /\d/.test(`${c.title} ${c.description ?? ''}`),
      weak: (c) => /\b(1\d{3}|20\d{2})\b/.test(c.title),
    }),
  },
  {
    id: 'sphinx',
    make: (rnd) => {
      const t = THEMED[Math.floor(rnd() * THEMED.length)];
      return {
        name: 'Le Sphinx',
        rule: `Seules les cartes du thème ${t.name} le blessent`,
        weakness: 'Cartes illustrées : dégâts ×2',
        hp: 150,
        theme: t.id,
        hits: (c) => themeIdOf(c) === t.id,
        weak: (c) => Boolean(c.thumb),
      };
    },
  },
  {
    id: 'jester',
    make: () => ({
      name: 'Le Fou du roi',
      rule: 'Toutes les cartes le blessent, mais à moitié',
      weakness: 'Carte commune du défi : dégâts ×4',
      hp: 200,
      scale: 0.5,
      hits: () => true,
      weak: (c) => Boolean(c.commune),
      weakMult: 8, // ×4 une fois la moitié appliquée
    }),
  },
];

const cache = new Map();

// Boss d'une semaine (clé : son lundi), même résultat partout
export function bossOf(week) {
  if (cache.has(week)) return cache.get(week);
  const rnd = seededRandom(`boss:${week}`);
  const b = BOSSES[Math.floor(rnd() * BOSSES.length)];
  const out = { id: b.id, scale: 1, weakMult: 2, ...b.make(rnd) };
  cache.set(week, out);
  return out;
}

// Multiplicateur de dégâts d'une carte contre le boss de la semaine de `date` (0 : ne le blesse pas)
export function bossFactor(card, date) {
  const b = bossOf(weekOf(date));
  if (!b.hits(card)) return 0;
  return b.scale * (b.weak(card) ? b.weakMult : 1);
}

// Toutes les semaines depuis BOSS_START. perCard : { [id]: { xp } } (economy)
export function bossBoard({ cards, caught, perCard, today }) {
  const hits = new Map(); // semaine → [{ card, date, dmg }]
  for (const c of cards) {
    const d = caught[c.id];
    if (!d || d < BOSS_START || d > today || !perCard[c.id]) continue;
    const f = bossFactor(c, d);
    if (!f) continue;
    const w = weekOf(d);
    if (!hits.has(w)) hits.set(w, []);
    hits.get(w).push({ card: c, date: d, dmg: Math.round(perCard[c.id].xp * f) });
  }

  const weeks = [];
  const first = weekOf(today) < weekOf(BOSS_START) ? weekOf(today) : weekOf(BOSS_START);
  for (let w = first; w <= weekOf(today); w = addDays(w, 7)) {
    const boss = bossOf(w);
    const list = (hits.get(w) ?? []).sort((a, b) => a.date.localeCompare(b.date));
    let dealt = 0;
    let killedOn = null;
    for (const h of list) {
      dealt += h.dmg;
      if (!killedOn && dealt >= boss.hp) killedOn = h.date;
    }
    weeks.push({ week: w, boss, dealt, killedOn, hits: list });
  }
  const current = weeks[weeks.length - 1];
  const kills = weeks.filter((w) => w.killedOn);
  return {
    current,
    daysLeft: 7 - daysBetween(current.week, today),
    kills: kills.length,
    fastKill: kills.some((w) => daysBetween(w.week, w.killedOn) <= 2),
    xp: kills.length * BOSS_REWARD.xp,
    points: kills.length * BOSS_REWARD.points,
  };
}
