// XP et points de recherche de Wikichasse, recalculés à partir de tout ce qui est
// enregistré (cartes, captures, coffres ouverts, recherches, équipements d'atouts).
// Fonction pure des données d'un joueur : appliquée aux données d'un ami, elle
// donnerait son score avec exactement les mêmes règles (multijoueur).
import { addDays, captureDays, isDrawCard, isShiny, rarityOf, streakHistory } from './wikimasters.js';
import { questBoard } from './wikiQuests.js';
import { chestProgress, chestsOf } from './wikiChests.js';
import { pointsEarned } from './wikiResearch.js';
import { albumBoard } from './wikiThemes.js';
import { DEFI_REWARD, cardInfo, defiResults, modifierOf } from './wikiDefi.js';
import { applyEffects, atoutById, loadoutOn, slotsOf, unlockedAtouts } from './wikiAtouts.js';
import { seasonBoard } from './wikiSeason.js';
import { bossBoard, bossFactor } from './wikiBoss.js';
import { quizBoard } from './wikiQuiz.js';
import { aventBoard } from './wikiAvent.js';

// Mission du jour : au moins une capture (la série repose dessus)
export const MISSION_BONUS = 50;
// Journée parfaite : toutes les cartes du tirage d'un jour
export const PERFECT_BONUS = 50;

// Points de recherche par succès débloqué
export const ACH_POINTS = 5;
export const ACH_POINTS_HIDDEN = 10;

// Valeur d'une capture faite à `date`, avant le multiplicateur global (Savoir).
// env : { fx, ids (atouts équipés ce jour-là), sameDay (captures ce jour-là), streak,
//        quizPerfectDays (Set des jours de quiz parfait) }
// fired : ce qui s'est déclenché (modificateur du jour, atouts), pour l'affichage
export function scoreCard(card, date, env) {
  const info = {
    ...cardInfo(card, date, env.fx),
    sameDay: env.sameDay ?? 1,
    streak: env.streak ?? 0,
    bossHit: bossFactor(card, date) > 0,
    quizPerfect: Boolean(env.quizPerfectDays?.has(date)),
  };
  const mod = modifierOf(date);
  let base = rarityOf(card).xp * (info.shiny ? env.fx.shinyMult : 1);
  if (info.commune) base *= mod.communeMult;
  const effects = [];
  const fired = [];
  const m = mod.effect(card, info);
  if (m) {
    effects.push(m);
    fired.push({ id: 'modifier', name: mod.name, ...m });
  }
  for (const id of env.ids ?? []) {
    const a = atoutById(id);
    const e = a?.effect(card, info);
    if (e) {
      effects.push(e);
      fired.push({ id, name: a.name, ...e });
    }
  }
  return {
    xp: applyEffects(base, effects),
    fired,
    atouts: fired.filter((f) => f.id !== 'modifier').length,
    boss: bossFactor(card, date),
  };
}

const countBy = (items, key) => {
  const m = new Map();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
};

export function computeEconomy({ cards, caught, opened, fx, today, loadouts = {}, quiz = {}, avent = {} }) {
  const got = cards.filter((c) => caught[c.id]);
  const days = captureDays(cards, caught);
  const { at: streakAt, best: bestStreak } = streakHistory(days);
  const sameDay = countBy(got, (c) => caught[c.id]);

  const defis = defiResults(cards, caught);
  const albums = albumBoard(cards, caught);
  const season = seasonBoard({ cards, caught, defisWon: defis.won, today });
  const quests = questBoard({ cards, caught, today, fx });
  const chests = chestsOf({ cards, caught, opened, fx });
  const quizzes = quizBoard(quiz, today);
  const advent = aventBoard({ days, opened: avent, today });

  // Chaque capture avec l'équipement et le modificateur de son jour (les déblocages
  // d'atouts, eux, ne dépendent que des captures : pas de boucle)
  const perCard = {};
  let cardsXp = 0;
  for (const c of got) {
    const d = caught[c.id];
    const s = scoreCard(c, d, {
      fx,
      ids: loadoutOn(loadouts, d),
      sameDay: sameDay.get(d),
      streak: streakAt.get(d),
      quizPerfectDays: quizzes.perfectDays,
    });
    perCard[c.id] = s;
    cardsXp += s.xp;
  }
  const boss = bossBoard({ cards, caught, perCard, today });

  // Atouts : déblocages (d'après les captures seulement) et emplacements
  const stats = {
    total: got.length,
    bestStreak,
    defis: defis.count,
    shiny: got.filter((c) => isShiny(c, fx.shinyRate)).length,
    pages: albums.pagesByTheme,
    peakDivision: season.peakDivision,
    bosses: boss.kills,
    avent: advent.opened,
    quizPerfect: quizzes.perfect,
  };
  const atouts = {
    stats,
    unlocked: unlockedAtouts(stats),
    slots: slotsOf(stats, fx),
    today: loadoutOn(loadouts, today),
  };


  // Journées parfaites (tirage du jour entièrement capturé)
  const draws = new Map();
  for (const c of cards) {
    if (!isDrawCard(c)) continue;
    const x = draws.get(c.date) ?? { total: 0, done: 0 };
    x.total++;
    if (caught[c.id]) x.done++;
    draws.set(c.date, x);
  }
  const perfectDays = [...draws.values()].filter((x) => x.done === x.total).length;

  const openedChests = chests.filter((c) => c.opened);
  const chestXp = openedChests.reduce((s, c) => s + c.loot.xp, 0);
  const chestPoints = openedChests.reduce((s, c) => s + c.loot.points, 0);

  const rawXp =
    cardsXp +
    days.size * MISSION_BONUS * fx.missionMult +
    perfectDays * PERFECT_BONUS +
    quests.xp +
    chestXp +
    albums.xp +
    defis.count * DEFI_REWARD.xp +
    season.xp +
    boss.xp +
    quizzes.xp +
    advent.xp;

  return {
    xp: Math.round(rawXp * fx.xpMult),
    // Sans les points des succès, ajoutés par l'appelant
    points:
      pointsEarned(cards, caught, fx) +
      quests.points +
      chestPoints +
      albums.points +
      defis.count * DEFI_REWARD.points +
      season.rewardPoints +
      boss.points +
      quizzes.points +
      advent.points,
    perCard,
    sameDay,
    streakAt,
    bestStreak,
    perfectDays,
    quests,
    chests,
    chestProgress: chestProgress({ cards, caught }),
    defis,
    albums,
    season,
    boss,
    quizzes,
    advent,
    atouts,
  };
}

// Ce que rapporterait la capture de `card` aujourd'hui, avec l'équipement du jour
export function previewCard(card, econ, fx, today) {
  const sameDay = (econ.sameDay.get(today) ?? 0) + 1;
  const streak = econ.streakAt.get(today) ?? (econ.streakAt.get(addDays(today, -1)) ?? 0) + 1;
  return scoreCard(card, today, { fx, ids: econ.atouts.today, sameDay, streak, quizPerfectDays: econ.quizzes.perfectDays });
}

// XP affichée d'une carte : sa valeur réelle si elle est capturée, sinon l'aperçu
export function cardXp(card, econ, fx, today) {
  const s = econ.perCard[card.id] ?? previewCard(card, econ, fx, today);
  return { xp: Math.round(s.xp * fx.xpMult), fired: s.fired, boss: s.boss };
}
