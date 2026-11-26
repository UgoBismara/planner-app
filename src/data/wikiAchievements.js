// Succès de Wikichasse. Tout est calculé à partir des cartes et des captures ;
// la date de premier déblocage est gardée à part (ACHIEVEMENTS_KEY, écrite
// uniquement par l'appli) pour qu'un succès ne se reverrouille jamais.
// Chaque succès rapporte des points de recherche (voir wikiEconomy.js).
import { isDrawCard, isShiny, rarityOf, weekOf } from './wikimasters.js';
import { ATOUTS } from './wikiAtouts.js';
import { THEMES, themeIdOf, tierOf } from './wikiThemes.js';
import { RESEARCH } from './wikiResearch.js';

export const ACHIEVEMENTS_KEY = 'wikimasters-achievements';

// Catégories d'affichage, dans l'ordre
export const ACH_GROUPS = [
  { id: 'collect', name: 'Collection' },
  { id: 'days', name: 'Assiduité' },
  { id: 'rarity', name: 'Raretés & brillantes' },
  { id: 'themes', name: 'Thèmes' },
  { id: 'quests', name: 'Quêtes & coffres' },
  { id: 'arena', name: 'Défis & saisons' },
  { id: 'atouts', name: 'Atouts & albums' },
  { id: 'events', name: 'Boss, quiz & événements' },
  { id: 'growth', name: 'Progression' },
  { id: 'secret', name: 'Secrets' },
];

const countBy = (items, key) => {
  const m = new Map();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
};

// Première lettre d'un titre, sans accent (É → E) ; null si ce n'est pas une lettre latine
export const initialOf = (title) => {
  const ch = (title ?? '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : null;
};

const isPalindrome = (title) => {
  const s = title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return s.length >= 4 && s === [...s].reverse().join('');
};

// Tout ce dont les succès ont besoin, calculé une seule fois.
// econ : résultat de computeEconomy ; research : recherches débloquées
export function buildContext({ cards, caught, level, fx, econ, research = {} }) {
  const got = cards.filter((c) => caught[c.id]);
  const rarity = countBy(got, (c) => rarityOf(c).id);
  const shiny = got.filter((c) => isShiny(c, fx.shinyRate));
  const theme = countBy(got, themeIdOf);

  // Journées de tirage (hors bonus) : complètes ? terminées après coup ?
  const days = new Map();
  for (const c of cards) {
    if (!isDrawCard(c)) continue;
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


  const perCatchDay = countBy(got, (c) => caught[c.id]);
  const strongPerDay = countBy(
    got.filter((c) => ['rare', 'epic', 'legendary'].includes(rarityOf(c).id)),
    (c) => caught[c.id],
  );
  const raritiesPerWeek = new Map();
  const raritiesPerDay = new Map();
  for (const c of got) {
    const w = weekOf(caught[c.id]);
    if (!raritiesPerWeek.has(w)) raritiesPerWeek.set(w, new Set());
    raritiesPerWeek.get(w).add(rarityOf(c).id);
    if (!raritiesPerDay.has(caught[c.id])) raritiesPerDay.set(caught[c.id], new Set());
    raritiesPerDay.get(caught[c.id]).add(rarityOf(c).id);
  }

  // Jours de capture : un samedi et le dimanche qui suit ?
  const catchDays = new Set(got.map((c) => caught[c.id]));
  const weekend = [...catchDays].some((d) => {
    const x = new Date(`${d}T12:00:00`);
    if (x.getDay() !== 6) return false;
    x.setDate(x.getDate() + 1);
    return catchDays.has(x.toISOString().slice(0, 10));
  });

  const realThemes = THEMES.filter((t) => t.id !== 'misc');
  const DAY = 86400000;

  return {
    total: got.length,
    rarity: (id) => rarity.get(id) ?? 0,
    perfectDays: dates.filter(complete).length,
    comeback: dates.some((d) => complete(d) && days.get(d).lastCatch > d),
    // Série : jours consécutifs avec au moins une capture (voir streakOf)
    bestStreak: econ.bestStreak,
    bonus: got.filter((c) => c.bonus).length,
    maxPerDay: Math.max(0, ...perCatchDay.values()),
    maxStrongPerDay: Math.max(0, ...strongPerDay.values()),
    rainbow: [...raritiesPerWeek.values()].some((s) => s.size === 5),
    quinte: [...raritiesPerDay.values()].some((s) => s.size === 5),
    level,
    got,
    shiny: shiny.length,
    shinyLegendary: shiny.some((c) => rarityOf(c).id === 'legendary'),
    theme: (id) => theme.get(id) ?? 0,
    themesCovered: realThemes.filter((t) => theme.get(t.id)).length,
    themeCount: realThemes.length,
    bestTheme: Math.max(0, ...realThemes.map((t) => theme.get(t.id) ?? 0)),
    silverThemes: realThemes.filter((t) => ['silver', 'gold', 'diamond'].includes(tierOf(theme.get(t.id) ?? 0)?.id)).length,
    letters: new Set(got.map((c) => initialOf(c.title)).filter(Boolean)).size,
    weekend,
    late: got.some((c) => isDrawCard(c) && (new Date(caught[c.id]) - new Date(c.date)) / DAY >= 7),
    questsDone: econ.quests.dailyDone,
    questFullDays: econ.quests.fullDays,
    weeklyDone: econ.quests.weeklyDone,
    chestsOpened: econ.chests.filter((c) => c.opened).length,
    jackpot: econ.chests.some((c) => c.opened && c.loot.jackpot),
    defis: econ.defis.count,
    defiBest: econ.defis.best,
    peakDivision: econ.season.peakDivision,
    finishedSilver: econ.season.finishedSilver,
    pages: econ.albums.pages,
    fullPageThemes: Object.values(econ.albums.pagesByTheme).filter((n) => n >= 1).length,
    atoutsUnlocked: econ.atouts.unlocked.length,
    atoutsTotal: ATOUTS.length,
    slots: econ.atouts.slots,
    maxFired: Math.max(0, ...Object.values(econ.perCard).map((p) => p.atouts)),
    maxCardXp: Math.max(0, ...Object.values(econ.perCard).map((p) => p.xp)),
    bosses: econ.boss.kills,
    fastKill: econ.boss.fastKill,
    quizCorrect: econ.quizzes.correct,
    quizPerfect: econ.quizzes.perfect,
    quizRun: econ.quizzes.bestRun,
    avent: econ.advent.openedThisYear,
    aventJackpot: econ.advent.cases.some((c) => c.opened && c.loot.jackpot),
    ghostWins: econ.season.ghostWins,
    research: Object.keys(research).length,
    researchTotal: RESEARCH.length,
  };
}

const atLeast = (cur, target) => ({ done: cur >= target, cur: Math.min(cur, target), target });
const flag = (done) => ({ done });

const THEME_ACH = [
  ['sport', 'Supporter'],
  ['people', 'Biographe'],
  ['nature', 'Naturaliste'],
  ['culture', 'Esthète'],
  ['history', 'Historien'],
  ['geo', 'Cartographe'],
].map(([id, name]) => ({
  id: `theme-${id}`,
  group: 'themes',
  name,
  desc: `Capturer 10 cartes du thème ${THEMES.find((t) => t.id === id).name}`,
  check: (x) => atLeast(x.theme(id), 10),
}));

// hidden : affiché « ??? » tant qu'il n'est pas débloqué
export const ACHIEVEMENTS = [
  { id: 'first', group: 'collect', name: 'Premier sang', desc: 'Capturer ta première carte', check: (x) => atLeast(x.total, 1) },
  { id: 'col10', group: 'collect', name: 'Collectionneur', desc: 'Capturer 10 cartes', check: (x) => atLeast(x.total, 10) },
  { id: 'col50', group: 'collect', name: 'Grand collectionneur', desc: 'Capturer 50 cartes', check: (x) => atLeast(x.total, 50) },
  { id: 'col100', group: 'collect', name: 'Centurion', desc: 'Capturer 100 cartes', check: (x) => atLeast(x.total, 100) },
  { id: 'col250', group: 'collect', name: 'Conservateur', desc: 'Capturer 250 cartes', check: (x) => atLeast(x.total, 250) },
  { id: 'col500', group: 'collect', name: 'Bibliothèque vivante', desc: 'Capturer 500 cartes', check: (x) => atLeast(x.total, 500) },
  { id: 'col1000', group: 'collect', name: 'Mémoire de l’humanité', desc: 'Capturer 1 000 cartes', check: (x) => atLeast(x.total, 1000) },
  { id: 'bonus1', group: 'collect', name: 'Rab', desc: 'Capturer une carte bonus', check: (x) => atLeast(x.bonus, 1) },
  { id: 'bonus25', group: 'collect', name: 'Insatiable', desc: 'Capturer 25 cartes bonus', check: (x) => atLeast(x.bonus, 25) },
  { id: 'bonus100', group: 'collect', name: 'Puits sans fond', desc: 'Capturer 100 cartes bonus', check: (x) => atLeast(x.bonus, 100) },
  { id: 'day15', group: 'collect', name: 'Razzia', desc: '15 captures en une journée', check: (x) => atLeast(x.maxPerDay, 15) },
  { id: 'day30', group: 'collect', name: 'Frénésie', desc: '30 captures en une journée', check: (x) => atLeast(x.maxPerDay, 30) },
  { id: 'abc', group: 'collect', name: 'Abécédaire', desc: 'Des cartes commençant par les 26 lettres', check: (x) => atLeast(x.letters, 26) },

  { id: 'perfect1', group: 'days', name: 'Journée parfaite', desc: "Capturer toutes les cartes d'une journée", check: (x) => atLeast(x.perfectDays, 1) },
  { id: 'perfect10', group: 'days', name: 'Perfectionniste', desc: '10 journées parfaites', check: (x) => atLeast(x.perfectDays, 10) },
  { id: 'perfect30', group: 'days', name: 'Horloger suisse', desc: '30 journées parfaites', check: (x) => atLeast(x.perfectDays, 30) },
  { id: 'perfect100', group: 'days', name: 'Métronome', desc: '100 journées parfaites', check: (x) => atLeast(x.perfectDays, 100) },
  { id: 'streak3', group: 'days', name: 'En jambes', desc: 'Série de 3 jours', check: (x) => atLeast(x.bestStreak, 3) },
  { id: 'streak7', group: 'days', name: 'Semaine sans faute', desc: 'Série de 7 jours', check: (x) => atLeast(x.bestStreak, 7) },
  { id: 'streak14', group: 'days', name: 'Quinzaine', desc: 'Série de 14 jours', check: (x) => atLeast(x.bestStreak, 14) },
  { id: 'streak30', group: 'days', name: 'Marathonien', desc: 'Série de 30 jours', check: (x) => atLeast(x.bestStreak, 30) },
  { id: 'streak100', group: 'days', name: 'Inarrêtable', desc: 'Série de 100 jours', check: (x) => atLeast(x.bestStreak, 100) },
  { id: 'weekend', group: 'days', name: 'Week-end studieux', desc: 'Capturer un samedi et le dimanche suivant', check: (x) => flag(x.weekend) },

  { id: 'rare1', group: 'rarity', name: 'Œil de lynx', desc: 'Capturer une carte Rare', check: (x) => atLeast(x.rarity('rare'), 1) },
  { id: 'rare25', group: 'rarity', name: 'Chercheur d’or', desc: 'Capturer 25 cartes Rares', check: (x) => atLeast(x.rarity('rare'), 25) },
  { id: 'epic1', group: 'rarity', name: 'Trésor épique', desc: 'Capturer une carte Épique', check: (x) => atLeast(x.rarity('epic'), 1) },
  { id: 'epic10', group: 'rarity', name: 'Collection épique', desc: 'Capturer 10 cartes Épiques', check: (x) => atLeast(x.rarity('epic'), 10) },
  { id: 'leg1', group: 'rarity', name: 'Coup de chance', desc: 'Capturer une carte Légendaire', check: (x) => atLeast(x.rarity('legendary'), 1) },
  { id: 'leg5', group: 'rarity', name: 'Panthéon', desc: 'Capturer 5 cartes Légendaires', check: (x) => atLeast(x.rarity('legendary'), 5) },
  { id: 'rainbow', group: 'rarity', name: 'Arc-en-ciel', desc: 'Les 5 raretés capturées la même semaine', check: (x) => flag(x.rainbow) },
  { id: 'shiny1', group: 'rarity', name: 'Ça brille !', desc: 'Capturer une carte brillante', check: (x) => atLeast(x.shiny, 1) },
  { id: 'shiny10', group: 'rarity', name: 'Pie voleuse', desc: 'Capturer 10 cartes brillantes', check: (x) => atLeast(x.shiny, 10) },
  { id: 'shiny25', group: 'rarity', name: 'Galerie des glaces', desc: 'Capturer 25 cartes brillantes', check: (x) => atLeast(x.shiny, 25) },

  ...THEME_ACH,
  { id: 'alltheme', group: 'themes', name: 'Touche-à-tout', desc: 'Une carte de chacun des 6 thèmes', check: (x) => atLeast(x.themesCovered, x.themeCount) },
  { id: 'theme50', group: 'themes', name: 'Spécialiste', desc: '50 cartes dans un même thème', check: (x) => atLeast(x.bestTheme, 50) },
  { id: 'album', group: 'themes', name: 'Encyclopédie illustrée', desc: 'Palier Argent (15 cartes) dans les 6 thèmes', check: (x) => atLeast(x.silverThemes, x.themeCount) },

  { id: 'quest1', group: 'quests', name: 'Contrat rempli', desc: 'Terminer une quête du jour', check: (x) => atLeast(x.questsDone, 1) },
  { id: 'quest25', group: 'quests', name: 'Mercenaire', desc: 'Terminer 25 quêtes du jour', check: (x) => atLeast(x.questsDone, 25) },
  { id: 'quest100', group: 'quests', name: 'Chasseur de primes', desc: 'Terminer 100 quêtes du jour', check: (x) => atLeast(x.questsDone, 100) },
  { id: 'questday', group: 'quests', name: 'Tableau de chasse', desc: 'Toutes les quêtes d’une journée', check: (x) => atLeast(x.questFullDays, 1) },
  { id: 'questday10', group: 'quests', name: 'Infatigable', desc: 'Toutes les quêtes du jour, 10 fois', check: (x) => atLeast(x.questFullDays, 10) },
  { id: 'weekly1', group: 'quests', name: 'Objectif hebdo', desc: 'Terminer une quête de la semaine', check: (x) => atLeast(x.weeklyDone, 1) },
  { id: 'weekly5', group: 'quests', name: 'Régularité', desc: 'Terminer 5 quêtes de la semaine', check: (x) => atLeast(x.weeklyDone, 5) },
  { id: 'chest1', group: 'quests', name: 'Butin', desc: 'Ouvrir un coffre', check: (x) => atLeast(x.chestsOpened, 1) },
  { id: 'chest10', group: 'quests', name: 'Pilleur', desc: 'Ouvrir 10 coffres', check: (x) => atLeast(x.chestsOpened, 10) },
  { id: 'chest50', group: 'quests', name: 'Dragon sur son tas d’or', desc: 'Ouvrir 50 coffres', check: (x) => atLeast(x.chestsOpened, 50) },

  { id: 'defi1', group: 'arena', name: 'Premier défi', desc: 'Capturer la carte commune le jour même', check: (x) => atLeast(x.defis, 1) },
  { id: 'defi10', group: 'arena', name: 'Habitué de l’arène', desc: 'Réussir 10 défis du jour', check: (x) => atLeast(x.defis, 10) },
  { id: 'defi30', group: 'arena', name: 'Gladiateur', desc: 'Réussir 30 défis du jour', check: (x) => atLeast(x.defis, 30) },
  { id: 'defirun5', group: 'arena', name: 'Invaincu', desc: '5 défis réussis d’affilée', check: (x) => atLeast(x.defiBest, 5) },
  { id: 'div-silver', group: 'arena', name: 'Sur le podium', desc: 'Atteindre la division Argent', check: (x) => atLeast(x.peakDivision, 2) },
  { id: 'div-gold', group: 'arena', name: 'Médaille d’or', desc: 'Atteindre la division Or', check: (x) => atLeast(x.peakDivision, 3) },
  { id: 'div-diamond', group: 'arena', name: 'Diamant brut', desc: 'Atteindre la division Diamant', check: (x) => atLeast(x.peakDivision, 5) },
  { id: 'div-master', group: 'arena', name: 'Grand maître', desc: 'Atteindre la division Maître', check: (x) => atLeast(x.peakDivision, 6) },
  { id: 'season1', group: 'arena', name: 'Saison bouclée', desc: 'Terminer une saison en Argent ou mieux', check: (x) => atLeast(x.finishedSilver, 1) },

  { id: 'page1', group: 'atouts', name: 'Première page', desc: 'Compléter une page d’album', check: (x) => atLeast(x.pages, 1) },
  { id: 'page10', group: 'atouts', name: 'Relieur', desc: 'Compléter 10 pages d’album', check: (x) => atLeast(x.pages, 10) },
  { id: 'page-all', group: 'atouts', name: 'Mosaïque complète', desc: 'Une page complète dans les 7 albums', check: (x) => atLeast(x.fullPageThemes, 7) },
  { id: 'atout5', group: 'atouts', name: 'Main de joueur', desc: 'Débloquer 5 atouts', check: (x) => atLeast(x.atoutsUnlocked, 5) },
  { id: 'atout-all', group: 'atouts', name: 'Joker', desc: 'Débloquer tous les atouts', check: (x) => atLeast(x.atoutsUnlocked, x.atoutsTotal) },
  { id: 'slots3', group: 'atouts', name: 'Arsenal', desc: 'Avoir 3 emplacements d’atout', check: (x) => atLeast(x.slots, 3) },

  { id: 'boss1', group: 'events', name: 'Chasseur de boss', desc: 'Vaincre un boss de la semaine', check: (x) => atLeast(x.bosses, 1) },
  { id: 'boss5', group: 'events', name: 'Tueur de géants', desc: 'Vaincre 5 boss', check: (x) => atLeast(x.bosses, 5) },
  { id: 'boss20', group: 'events', name: 'Fléau des boss', desc: 'Vaincre 20 boss', check: (x) => atLeast(x.bosses, 20) },
  { id: 'quiz10', group: 'events', name: 'Bonne mémoire', desc: '10 bonnes réponses au quiz du jour', check: (x) => atLeast(x.quizCorrect, 10) },
  { id: 'quiz100', group: 'events', name: 'Puits de science', desc: '100 bonnes réponses au quiz du jour', check: (x) => atLeast(x.quizCorrect, 100) },
  { id: 'quizp5', group: 'events', name: 'Sans faute', desc: '5 quiz parfaits', check: (x) => atLeast(x.quizPerfect, 5) },
  { id: 'ghost1', group: 'events', name: 'Plus fort que mon ombre', desc: 'Battre ton rival fantôme sur une semaine', check: (x) => atLeast(x.ghostWins, 1) },
  { id: 'ghost4', group: 'events', name: 'Toujours mieux', desc: 'Battre ton rival fantôme 4 semaines', check: (x) => atLeast(x.ghostWins, 4) },
  { id: 'avent12', group: 'events', name: 'Mi-chemin de l’Avent', desc: 'Ouvrir 12 cases du calendrier de l’Avent', check: (x) => atLeast(x.avent, 12) },
  { id: 'avent24', group: 'events', name: 'Esprit de Noël', desc: 'Ouvrir les 24 cases du calendrier de l’Avent', check: (x) => atLeast(x.avent, 24) },

  { id: 'lvl5', group: 'growth', name: 'Montée en grade', desc: 'Atteindre le niveau 5', check: (x) => atLeast(x.level, 5) },
  { id: 'lvl10', group: 'growth', name: 'Vétéran', desc: 'Atteindre le niveau 10', check: (x) => atLeast(x.level, 10) },
  { id: 'lvl20', group: 'growth', name: 'Maître chasseur', desc: 'Atteindre le niveau 20', check: (x) => atLeast(x.level, 20) },
  { id: 'lvl30', group: 'growth', name: 'Sage', desc: 'Atteindre le niveau 30', check: (x) => atLeast(x.level, 30) },
  { id: 'lvl50', group: 'growth', name: 'Omniscient', desc: 'Atteindre le niveau 50', check: (x) => atLeast(x.level, 50) },
  { id: 'lab1', group: 'growth', name: 'Laborantin', desc: 'Terminer une recherche', check: (x) => atLeast(x.research, 1) },
  { id: 'lab10', group: 'growth', name: 'Savant', desc: 'Terminer 10 recherches', check: (x) => atLeast(x.research, 10) },
  { id: 'laball', group: 'growth', name: 'Prix Nobel', desc: 'Terminer toutes les recherches', check: (x) => atLeast(x.research, x.researchTotal) },

  { id: 'ghost', group: 'secret', hidden: true, name: 'Fantôme', desc: 'Capturer une carte que personne n’a lue en 30 jours', check: (x) => flag(x.got.some((c) => c.views === 0)) },
  { id: 'archeo', group: 'secret', hidden: true, name: 'Archéologue', desc: 'Capturer une carte à moins de 5 vues en 30 jours', check: (x) => flag(x.got.some((c) => typeof c.views === 'number' && c.views < 5)) },
  { id: 'time', group: 'secret', hidden: true, name: 'Voyageur temporel', desc: 'Capturer une carte dont le titre contient une année', check: (x) => flag(x.got.some((c) => /\b(1\d{3}|20\d{2})\b/.test(c.title))) },
  { id: 'long', group: 'secret', hidden: true, name: 'Titre à rallonge', desc: 'Capturer une carte au titre de 45 caractères ou plus', check: (x) => flag(x.got.some((c) => c.title.length >= 45)) },
  { id: 'short', group: 'secret', hidden: true, name: 'Laconique', desc: 'Capturer une carte au titre de 5 caractères ou moins', check: (x) => flag(x.got.some((c) => c.title.length <= 5)) },
  { id: 'comeback', group: 'secret', hidden: true, name: 'Retour en force', desc: 'Terminer après coup une journée laissée en plan', check: (x) => flag(x.comeback) },
  { id: 'magnet', group: 'secret', hidden: true, name: 'Aimant à trésors', desc: '3 cartes Rares ou mieux capturées le même jour', check: (x) => atLeast(x.maxStrongPerDay, 3) },
  { id: 'grail', group: 'secret', hidden: true, name: 'Saint Graal', desc: 'Capturer une carte Légendaire brillante', check: (x) => flag(x.shinyLegendary) },
  { id: 'jackpot', group: 'secret', hidden: true, name: 'Jackpot', desc: 'Ouvrir un coffre légendaire', check: (x) => flag(x.jackpot) },
  { id: 'quinte', group: 'secret', hidden: true, name: 'Quinte royale', desc: 'Les 5 raretés capturées le même jour', check: (x) => flag(x.quinte) },
  { id: 'mirror', group: 'secret', hidden: true, name: 'Miroir', desc: 'Capturer une carte au titre palindrome', check: (x) => flag(x.got.some((c) => isPalindrome(c.title))) },
  { id: 'digits', group: 'secret', hidden: true, name: 'Numérologue', desc: 'Capturer une carte dont le titre commence par un chiffre', check: (x) => flag(x.got.some((c) => /^\d/.test(c.title.trim()))) },
  { id: 'late', group: 'secret', hidden: true, name: 'Mieux vaut tard', desc: 'Capturer une carte une semaine après son tirage', check: (x) => flag(x.late) },
  { id: 'combo', group: 'secret', hidden: true, name: 'Combo !', desc: 'Une capture qui déclenche 3 atouts', check: (x) => atLeast(x.maxFired, 3) },
  { id: 'bighit', group: 'secret', hidden: true, name: 'Coup de maître', desc: 'Une seule capture qui rapporte 300 XP ou plus', check: (x) => flag(x.maxCardXp >= 300) },
  { id: 'blitz', group: 'secret', hidden: true, name: 'Blitzkrieg', desc: 'Vaincre un boss en 3 jours ou moins', check: (x) => flag(x.fastKill) },
  { id: 'quizrun7', group: 'secret', hidden: true, name: 'Encyclopédie vivante', desc: '7 quiz parfaits d’affilée', check: (x) => atLeast(x.quizRun, 7) },
  { id: 'star', group: 'secret', hidden: true, name: 'Étoile du sommet', desc: 'Trouver l’étoile dans le calendrier de l’Avent', check: (x) => flag(x.aventJackpot) },
  { id: 'misc10', group: 'secret', hidden: true, name: 'Inclassable', desc: 'Capturer 10 cartes sans thème (Divers)', check: (x) => atLeast(x.theme('misc'), 10) },
];
