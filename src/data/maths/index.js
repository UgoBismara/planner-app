// Onglet « Maths » : cours, exercices corrigés et entraînement, pour le plaisir.
// Rien ne se rate : pas de série, juste des exercices validés (% par chapitre), une
// file de révision pour retenter ce qui a résisté, et des succès.
//
// ── Guide de rédaction d'un chapitre (chapters/*.js, puis l'ajouter à DOMAINS) ──
// - Texte en Markdown avec du LaTeX : $…$ dans la ligne, et $$ seul sur sa ligne
//   avant et après une formule centrée. Gabarits String.raw, donc ni backtick ni ${
//   dans le texte. Virgule décimale : 3{,}5. Macros : voir katex.js (\C, \pgcd, \Re…).
// - lesson : sections { id, title, level, blocks }, un bloc = { type, title?, body } avec
//   un type de BLOCK_TYPES (demo et histoire se déplient).
// - exercises : { id, section, title, difficulty (1 à 4), level, kind, statement,
//   hints, answer?, solution }. Sans answer, l'exercice se corrige en auto-évaluation.
//   Les ids sont les clés de l'historique : uniques dans tout l'onglet, et jamais
//   renommés une fois livrés.
// - generators : mêmes champs, sauf que generate(rng) renvoie { statement, answer, solution }.
// - Chaque réponse numérique est recalculée par script avant de livrer, puis
//   npm run check:maths doit passer (structure, formules, 500 graines par générateur).

import { dateKey, isDailyQuest, parseDateKey, shiftDateKey } from '../quests.js';
import arithmetique from './chapters/arithmetique.js';
import complexes from './chapters/complexes.js';

// { [exerciceId]: [{ date, at, result }] } (exercices rédigés)
export const ATTEMPTS_KEY = 'planner_maths_attempts';
// { [generateurId]: { solo, aide, rate, run, validated, at } } : des compteurs, pas un
// historique, l'entraînement étant illimité (limite Firestore de 1 Mo par clé)
export const DRILLS_KEY = 'planner_maths_drills';
// { ['chapitre/section']: date } : fiches de cours lues
export const READ_KEY = 'planner_maths_read';
// ['YYYY-MM-DD', …] : jours avec des maths, pour le succès « Le retour »
export const DAYS_KEY = 'planner_maths_days';

// Un exercice raté revient 2 jours plus tard, réussi avec aide 4 jours plus tard
export const REVIEW_DELAYS = { rate: 2, aide: 4 };
// Un entraînement est validé après 3 réussites seul d'affilée
export const DRILL_TARGET = 3;
// « Le retour » : des maths après au moins 3 semaines sans
export const COMEBACK_DAYS = 21;

export const DIFFICULTIES = [
  { id: 1, label: 'Échauffement', hint: 'Application directe du cours' },
  { id: 2, label: 'Classique', hint: 'Un exercice type, en quelques étapes' },
  { id: 3, label: 'Costaud', hint: 'Plusieurs idées à combiner, niveau partiel de licence' },
  { id: 4, label: 'Défi', hint: 'Une astuce ou une longue démarche, niveau oral ou olympiade' },
];

export const LEVELS = ['Tle', 'L1', 'L2', 'L3'];

export const KINDS = [
  { id: 'calcul', label: 'Calcul' },
  { id: 'demo', label: 'Démonstration' },
  { id: 'probleme', label: 'Problème' },
  { id: 'qcm', label: 'QCM' },
  { id: 'vrai-faux', label: 'Vrai ou faux' },
  { id: 'code', label: 'À coder' },
];

export const RESULTS = [
  { id: 'solo', label: 'Réussi seul' },
  { id: 'aide', label: 'Avec aide' },
  { id: 'rate', label: 'Raté' },
];

export const BLOCK_TYPES = [
  { id: 'texte', label: null },
  { id: 'definition', label: 'Définition' },
  { id: 'theoreme', label: 'Théorème' },
  { id: 'propriete', label: 'Propriété' },
  { id: 'methode', label: 'Méthode' },
  { id: 'exemple', label: 'Exemple' },
  { id: 'piege', label: 'Piège classique' },
  { id: 'demo', label: 'Démonstration', collapsible: true },
  { id: 'histoire', label: 'Pour la culture', collapsible: true },
];

// Les domaines sans chapitre s'affichent « à venir »
export const DOMAINS = [
  { id: 'algebre', title: 'Algèbre & arithmétique', chapters: [arithmetique, complexes] },
  { id: 'analyse', title: 'Analyse', chapters: [] },
  { id: 'probas', title: 'Probas & stats', chapters: [] },
  { id: 'graphes', title: 'Graphes', chapters: [] },
];

export const CHAPTERS = DOMAINS.flatMap((d) => d.chapters);

// Tous les exercices, rédigés puis générés, avec leur chapitre
export const ITEMS = CHAPTERS.flatMap((chapter) => [
  ...chapter.exercises.map((ex) => ({ ...ex, chapterId: chapter.id, generated: false })),
  ...chapter.generators.map((gen) => ({ ...gen, chapterId: chapter.id, generated: true })),
]);

const ITEM_BY_ID = new Map(ITEMS.map((it) => [it.id, it]));

export const itemById = (id) => ITEM_BY_ID.get(id) ?? null;
export const chapterById = (id) => CHAPTERS.find((c) => c.id === id) ?? null;
export const chapterItems = (chapterId) => ITEMS.filter((it) => it.chapterId === chapterId);
export const sectionOf = (item) =>
  chapterById(item.chapterId)?.lesson.find((s) => s.id === item.section) ?? null;
export const kindLabel = (id) => KINDS.find((k) => k.id === id)?.label ?? id;
export const resultLabel = (id) => RESULTS.find((r) => r.id === id)?.label ?? id;
export const readKey = (chapterId, sectionId) => `${chapterId}/${sectionId}`;

// « 12 nov. », pour les dates de révision
export const shortDate = (key) =>
  parseDateKey(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const lastOf = (list) => (list?.length ? list[list.length - 1] : null);

// ── Progression ─────────────────────────────────────────────────

// Validé = réussi seul au moins une fois (exercice) ou DRILL_TARGET fois d'affilée
export const isValidated = (item, attempts, drills) =>
  item.generated
    ? Boolean(drills[item.id]?.validated)
    : (attempts[item.id] ?? []).some((a) => a.result === 'solo');

// Date à laquelle retenter un exercice rédigé, null s'il n'y a rien à retenter
export const reviewDate = (item, attempts) => {
  if (item.generated) return null;
  const last = lastOf(attempts[item.id]);
  const delay = last && REVIEW_DELAYS[last.result];
  return delay ? shiftDateKey(last.date, delay) : null;
};

// new · validated · review (à retenter maintenant) · later (revient plus tard) ·
// tried (entraînement entamé)
export const itemStatus = (item, attempts, drills, todayKey) => {
  if (item.generated) {
    const drill = drills[item.id];
    if (!drill) return 'new';
    return drill.validated ? 'validated' : 'tried';
  }
  const due = reviewDate(item, attempts);
  if (due) return due <= todayKey ? 'review' : 'later';
  return attempts[item.id]?.length ? 'validated' : 'new';
};

// Arrondi par défaut : 100 % seulement quand tout est validé
export const progressOf = (items, attempts, drills) => {
  const done = items.filter((it) => isValidated(it, attempts, drills)).length;
  const total = items.length;
  return { done, total, percent: total ? Math.floor((done / total) * 100) : 0 };
};

export const reviewQueue = (attempts, todayKey) => {
  const scheduled = ITEMS.filter((it) => !it.generated)
    .map((item) => ({ item, date: reviewDate(item, attempts) }))
    .filter((r) => r.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    due: scheduled.filter((r) => r.date <= todayKey),
    later: scheduled.filter((r) => r.date > todayKey),
  };
};

// Le dé : révisions dues d'abord, puis jamais tentés, puis tentés mais pas validés ;
// n'importe lequel une fois tout validé
export const pickSurprise = ({
  attempts,
  drills,
  todayKey,
  difficulties,
  chapterId = null,
  excludeId = null,
  random = Math.random,
}) => {
  const pool = ITEMS.filter(
    (it) =>
      (!chapterId || it.chapterId === chapterId) &&
      difficulties.includes(it.difficulty) &&
      it.id !== excludeId,
  );
  const status = (it) => itemStatus(it, attempts, drills, todayKey);
  const tiers = [
    pool.filter((it) => status(it) === 'review'),
    pool.filter((it) => status(it) === 'new'),
    pool.filter((it) => !isValidated(it, attempts, drills)),
    pool,
  ];
  const tier = tiers.find((t) => t.length > 0);
  return tier ? tier[Math.floor(random() * tier.length)] : null;
};

// Dernier exercice fait (rédigé ou entraînement), pour le bouton « Continuer »
export const lastActivity = (attempts, drills) => {
  let best = null;
  Object.entries(attempts).forEach(([id, list]) => {
    const last = lastOf(list);
    if (last?.at && (!best || last.at > best.at)) best = { id, at: last.at };
  });
  Object.entries(drills).forEach(([id, drill]) => {
    if (drill.at && (!best || drill.at > best.at)) best = { id, at: drill.at };
  });
  return best ? itemById(best.id) : null;
};

// Prochain exercice non validé du chapitre après afterId, en reprenant au début
export const nextInChapter = (chapterId, afterId, attempts, drills) => {
  const items = chapterItems(chapterId);
  const start = items.findIndex((it) => it.id === afterId);
  const ordered = [...items.slice(start + 1), ...items.slice(0, start + 1)];
  return ordered.find((it) => it.id !== afterId && !isValidated(it, attempts, drills)) ?? null;
};

// ── Enregistrement ──────────────────────────────────────────────

export const withAttempt = (attempts, id, result, now = new Date()) => ({
  ...attempts,
  [id]: [...(attempts[id] ?? []), { date: dateKey(now), at: now.toISOString(), result }],
});

export const withDrill = (drills, id, result, now = new Date()) => {
  const prev = drills[id] ?? { solo: 0, aide: 0, rate: 0, run: 0, validated: false };
  const run = result === 'solo' ? prev.run + 1 : 0;
  return {
    ...drills,
    [id]: {
      ...prev,
      [result]: (prev[result] ?? 0) + 1,
      run,
      validated: prev.validated || run >= DRILL_TARGET,
      at: now.toISOString(),
    },
  };
};

export const withDay = (days, now = new Date()) => {
  const key = dateKey(now);
  return days.includes(key) ? days : [...days, key].sort();
};

// ── Quête « Maths 15 min » ──────────────────────────────────────

export const MATHS_QUEST_ID = 'plan_maths';

export const findMathsQuest = (quests) =>
  quests.find((q) => q.id === MATHS_QUEST_ID && isDailyQuest(q)) ??
  quests.find((q) => isDailyQuest(q) && /maths/i.test(q.label)) ??
  null;

// 'min' (le minimum) < 'normal' (la version complète) : on ne rétrograde jamais
const questRank = (level) => (level === 'min' ? 1 : level ? 2 : 0);

export const questNeedsUpgrade = (log, questId, level, todayKey) =>
  questRank(log[todayKey]?.done?.[questId]) < questRank(level);

export const withQuestDone = (log, questId, level, todayKey) => {
  const day = log[todayKey] ?? { energy: null, done: {} };
  return { ...log, [todayKey]: { ...day, done: { ...day.done, [questId]: level } } };
};

// ── Statistiques des succès ─────────────────────────────────────

const daysBetween = (a, b) => Math.round((parseDateKey(b) - parseDateKey(a)) / 86400000);

export const computeStats = ({ attempts, drills, read, days }) => {
  const validated = ITEMS.filter((it) => isValidated(it, attempts, drills));
  const byDifficulty = { 1: 0, 2: 0, 3: 0, 4: 0 };
  validated.forEach((it) => {
    byDifficulty[it.difficulty] += 1;
  });

  // Révision réussie : un « réussi seul » juste après un raté ou un « avec aide »
  // Revanche : un exercice raté au moins une fois, puis réussi seul
  let reviews = 0;
  let revenges = 0;
  Object.values(attempts).forEach((list) => {
    let failed = false;
    let revenge = false;
    list.forEach((a, i) => {
      if (a.result === 'solo' && i > 0 && list[i - 1].result !== 'solo') reviews += 1;
      if (a.result === 'rate') failed = true;
      else if (a.result === 'solo' && failed) revenge = true;
    });
    if (revenge) revenges += 1;
  });

  const kindsTried = new Set(
    [...Object.keys(attempts), ...Object.keys(drills)].map((id) => itemById(id)?.kind).filter(Boolean),
  );
  const chapterDone = (c) => progressOf(chapterItems(c.id), attempts, drills).percent === 100;

  let comebacks = 0;
  for (let i = 1; i < days.length; i += 1) {
    if (daysBetween(days[i - 1], days[i]) >= COMEBACK_DAYS) comebacks += 1;
  }

  return {
    validated: validated.length,
    byDifficulty,
    proofs: validated.filter((it) => it.kind === 'demo').length,
    code: validated.filter((it) => it.kind === 'code').length,
    reviews,
    revenges,
    drillWins: Object.values(drills).reduce((sum, d) => sum + (d.solo ?? 0), 0),
    kindsTried: kindsTried.size,
    chaptersDone: CHAPTERS.filter(chapterDone).length,
    chaptersRead: CHAPTERS.filter((c) => c.lesson.every((s) => read[readKey(c.id, s.id)])).length,
    domainsDone: DOMAINS.filter((d) => d.chapters.length > 0 && d.chapters.every(chapterDone)).map((d) => d.id),
    comebacks,
  };
};
