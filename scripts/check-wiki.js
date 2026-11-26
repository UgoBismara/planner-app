// Vérifie les règles de Wikichasse avant de les livrer : identifiants uniques,
// série à une capture par jour, défi, atouts, albums, saisons, économie complète.
// Usage : npm run check:wiki
//         npm run check:wiki -- sauvegarde.json   (rejoue aussi une vraie sauvegarde :
//         { cards, bonus, commune, caught, research, chests, atouts }, lecture seule)
import { readFileSync } from 'node:fs';
import { addDays, isDrawCard, streakOf } from '../src/data/wikimasters.js';
import { ACHIEVEMENTS, buildContext } from '../src/data/wikiAchievements.js';
import { ATOUTS, loadoutOn, slotsOf } from '../src/data/wikiAtouts.js';
import { defiResults, modifierOf } from '../src/data/wikiDefi.js';
import { computeEconomy, previewCard } from '../src/data/wikiEconomy.js';
import { RESEARCH, effectsOf } from '../src/data/wikiResearch.js';
import { DIVISIONS, divisionIndex } from '../src/data/wikiSeason.js';
import { ALBUM_PAGE, albumBoard } from '../src/data/wikiThemes.js';
import { levelOf, weekOf } from '../src/data/wikimasters.js';
import { bossOf } from '../src/data/wikiBoss.js';
import { QUIZ_SIZE, clueOf, quizOf } from '../src/data/wikiQuiz.js';
import { aventBoard } from '../src/data/wikiAvent.js';

const errors = [];
const check = (cond, msg) => cond || errors.push(msg);
const unique = (list, what) => {
  const seen = new Set();
  for (const id of list) {
    check(!seen.has(id), `${what} : identifiant en double « ${id} »`);
    seen.add(id);
  }
};

unique(ACHIEVEMENTS.map((a) => a.id), 'Succès');
unique(ATOUTS.map((a) => a.id), 'Atouts');
unique(RESEARCH.map((r) => r.id), 'Recherches');
for (const r of RESEARCH) check(!r.requires || RESEARCH.some((x) => x.id === r.requires), `Recherche ${r.id} : prérequis inconnu`);

// ── Données factices : 20 jours, 5 cartes par jour + une carte commune ──
const T0 = '2026-11-01';
const card = (id, date, extra = {}) => ({
  id,
  title: `Article ${id}${id % 7 === 0 ? ' (1984)' : ''}`,
  description: ['commune française', 'footballeur brésilien', 'espèce de plante', 'film américain', 'bataille', 'joueur de tennis'][id % 6],
  extract: '',
  thumb: id % 3 ? 'x.jpg' : '',
  views: [3, 40, 200, 900, 6000][id % 5],
  date,
  ...extra,
});
const cards = [];
let n = 1;
for (let d = 0; d < 20; d++) {
  const date = addDays(T0, d);
  for (let k = 0; k < 5; k++) cards.push(card(n++, date));
  cards.push(card(n++, date, { commune: true }));
}
const today = addDays(T0, 19);

// Série : une capture par jour suffit, un jour vide la casse, aujourd'hui ne la casse pas
const one = {};
for (let d = 0; d < 19; d++) one[cards.find((c) => c.date === addDays(T0, d)).id] = addDays(T0, d);
check(streakOf(cards, one, today) === 19, `Série à 1 capture/jour : ${streakOf(cards, one, today)} au lieu de 19`);
const hole = { ...one };
delete hole[cards.find((c) => c.date === addDays(T0, 10)).id];
check(streakOf(cards, hole, today) === 8, `Série trouée : ${streakOf(cards, hole, today)} au lieu de 8`);
check(streakOf(cards, hole, today, true) === 18, `Série avec gel : ${streakOf(cards, hole, today, true)} au lieu de 18`);

// Défi : la carte commune compte le jour même seulement
const communes = cards.filter((c) => c.commune);
const defiCaught = { [communes[0].id]: communes[0].date, [communes[1].id]: addDays(communes[1].date, 1) };
check(defiResults(cards, defiCaught).count === 1, 'Défi : une carte commune capturée en retard ne doit pas compter');
check(modifierOf(today).name === modifierOf(today).name, 'Modificateur non déterministe');
const mods = new Set();
for (let d = 0; d < 60; d++) mods.add(modifierOf(addDays(T0, d)).id);
check(mods.size >= 5, `Seulement ${mods.size} modificateurs différents sur 60 jours`);
check(!isDrawCard(communes[0]), 'La carte commune ne doit pas compter dans le tirage du jour');

// Atouts : équipement par date, emplacements
const loadouts = { [addDays(T0, 5)]: ['chrono'], [addDays(T0, 12)]: ['chrono', 'humble'] };
check(loadoutOn(loadouts, addDays(T0, 4)).length === 0, 'Équipement avant la première date');
check(loadoutOn(loadouts, addDays(T0, 13)).length === 2, 'Équipement du 13e jour');
check(slotsOf({ total: 0 }, effectsOf({})) === 1 && slotsOf({ total: 60 }, effectsOf({ pocket: 'x' })) === 4, 'Emplacements');

// Albums
const all = Object.fromEntries(cards.map((c) => [c.id, c.date]));
const albums = albumBoard(cards, all);
check(albums.albums.every((a) => a.page.length < ALBUM_PAGE), 'Une page d’album dépasse sa taille');

// Boss, quiz, Avent
check(bossOf(weekOf(today)).name === bossOf(weekOf(today)).name, 'Boss non déterministe');
const qz = quizOf(today, cards, all);
check(qz.length === QUIZ_SIZE, `Quiz : ${qz.length} questions au lieu de ${QUIZ_SIZE}`);
for (const q of qz) {
  check(new Set(q.choices.map((c) => c.id)).size === 4 && q.choices.some((c) => c.id === q.card.id), 'Quiz : choix invalides');
}
check(JSON.stringify(quizOf(today, cards, all).map((q) => q.choices.map((c) => c.id))) === JSON.stringify(qz.map((q) => q.choices.map((c) => c.id))), 'Quiz non déterministe');
check(!clueOf({ title: 'Bataille de Hastings', description: 'bataille de Hastings en 1066', extract: '' }).description.includes('Hastings'), 'Quiz : titre non masqué');
const adv = aventBoard({ days: new Set(['2026-12-03']), opened: { '2026-12-03': '2026-12-04' }, today: '2026-12-10' });
check(adv.opened === 1 && adv.cases.length === 24 && adv.toOpen === 0, 'Avent');

// Divisions
check(divisionIndex(0) === 0 && divisionIndex(DIVISIONS.at(-1).min) === DIVISIONS.length - 1, 'Divisions');

// Économie complète : vide, tout capturé, avec atouts ; succès évaluables
const fx = effectsOf({});
for (const [label, caught, lo] of [
  ['vide', {}, {}],
  ['tout capturé', all, {}],
  ['avec atouts', all, loadouts],
]) {
  try {
    const econ = computeEconomy({ cards, caught, opened: {}, fx, today, loadouts: lo });
    const ctx = buildContext({ cards, caught, level: levelOf(econ.xp), fx, econ, research: {} });
    for (const a of ACHIEVEMENTS) a.check(ctx);
    check(Number.isFinite(econ.xp) && Number.isFinite(econ.points), `Économie « ${label} » : XP ou points non finis`);
    previewCard(cards[0], econ, fx, today);
    if (label === 'avec atouts') {
      const plain = computeEconomy({ cards, caught, opened: {}, fx, today });
      check(econ.xp > plain.xp, 'Les atouts équipés ne rapportent rien');
    }
    console.log(`  ${label} : ${econ.xp} XP, niveau ${levelOf(econ.xp)}, ${econ.points} pts, division ${DIVISIONS[econ.season.division].name}`);
  } catch (e) {
    errors.push(`Économie « ${label} » : ${e.stack}`);
  }
}

// ── Vraie sauvegarde (facultatif) ──
const file = process.argv[2];
if (file) {
  const s = JSON.parse(readFileSync(file, 'utf8'));
  const commune = Object.values(s.commune ?? {}).map((c) => ({ ...c, commune: true }));
  const real = [...(s.cards ?? []), ...(s.bonus ?? []), ...commune];
  const rfx = effectsOf(s.research?.unlocked ?? {});
  const realToday = Object.values(s.caught ?? {}).sort().at(-1) ?? today;
  const econ = computeEconomy({ cards: real, caught: s.caught ?? {}, opened: s.chests ?? {}, fx: rfx, today: realToday, loadouts: s.atouts ?? {} });
  const ctx = buildContext({ cards: real, caught: s.caught ?? {}, level: levelOf(econ.xp), fx: rfx, econ, research: s.research?.unlocked ?? {} });
  const done = ACHIEVEMENTS.filter((a) => a.check(ctx).done);
  console.log(
    `  sauvegarde : ${econ.xp} XP (niveau ${levelOf(econ.xp)}), ${econ.points} pts, série ${streakOf(real, s.caught, realToday, rfx.freeze)} (record ${econ.bestStreak}),`,
    `division ${DIVISIONS[econ.season.division].name} (${econ.season.points} pts), ${econ.atouts.unlocked.length} atouts, ${econ.atouts.slots} emplacement(s),`,
    `${econ.albums.pages} pages d’album, ${done.length}/${ACHIEVEMENTS.length} succès`,
  );
}

if (errors.length) {
  console.error(`\n${errors.length} erreur(s) :\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('check:wiki OK');
