// Plan « Triathlon & Maths » de novembre 2026, importable d'un clic depuis l'onglet Quêtes.
// Référence détaillée (séances de natation, programme maths, feuille de route) :
// page Notion « Plan Triathlon & Maths — saison 2026-27 ».
// Les séances sont des événements récurrents du planning (natation, vélo, course,
// maths + culture), reliés aux quêtes : cocher ✓ l'événement compte la quête. Le détail
// de chaque séance est le titre de l'occurrence du jour.
// L'import ne fait qu'ajouter, sauf pour les éléments du plan devenus obsolètes
// (PLAN_REPLACED, OBSOLETE_DAY_TEXTS) ; les doublons sont ignorés.

import { MAX_DAILY, MAX_WEEKLY, MAX_WEEK_GOALS, makeQuest, typeOf, isDailyQuest } from './quests';

// Clés de WeekPlanner : objectifs du jour, événements récurrents et leurs occurrences modifiées
export const DAILY_GOALS_KEY = 'planner_daily_goals';
export const RECURRING_KEY = 'planner_recurring';
export const RECURRING_OVERRIDES_KEY = 'planner_recurring_overrides';

const PLAN_QUESTS = [
  { id: 'plan_culture', type: 'daily', label: 'Défi culture 15 min', domain: 'perso', minimum: '1 épisode ou 1 article' },
  { id: 'plan_maths', type: 'daily', label: 'Maths 15 min', domain: 'perso', minimum: '1 partie de Zetamac (2 min)' },
  { id: 'plan_home', type: 'daily', label: 'Appart 15 min', domain: 'daily', minimum: '5 min : vaisselle ou ranger 1 chose' },
  { id: 'plan_swim', type: 'weekly', label: 'Natation', domain: 'sport', perWeek: 2 },
  { id: 'plan_ultimate', type: 'weekly', label: 'Ultimate', domain: 'sport', perWeek: 2 },
  // Au moins une sortie de chaque sport du triathlon par semaine
  { id: 'plan_bike', type: 'weekly', label: 'Vélo', domain: 'sport', perWeek: 1 },
  { id: 'plan_run', type: 'weekly', label: 'Course', domain: 'sport', perWeek: 1 },
  { id: 'plan_batch', type: 'weekly', label: 'Batch cooking', domain: 'daily', perWeek: 1 },
  { id: 'plan_swim_nov', type: 'target', kind: 'monthly', month: '2026-11', label: 'Nager', domain: 'sport', target: 6, unit: 'km' },
  {
    id: 'plan_tri_s',
    type: 'target',
    kind: 'long',
    label: 'Triathlon S',
    domain: 'sport',
    deadline: '2027-06-30',
    steps: [
      'Trouver un club ou un créneau natation encadré',
      'Nager 400 m de crawl sans m’arrêter',
      'Choisir la course et m’inscrire',
      'Nager 750 m sans m’arrêter',
      'Premier enchaînement vélo → course',
      'Faire la course 🏁',
    ],
  },
  { id: 'plan_core', type: 'habit', label: 'Gainage 10 min', domain: 'sport', minimum: '1 planche d’une minute' },
  { id: 'plan_memory', type: 'habit', label: 'Palais mental 5 min', domain: 'perso', minimum: 'Revoir 1 palais' },
];

// Quêtes d'une version précédente du plan, retirées à l'import de leurs remplaçantes
const PLAN_REPLACED = { plan_bike_run: ['plan_bike', 'plan_run'] };

// Séances du plan, par date locale. Chacune devient le titre de l'occurrence du jour de
// l'événement correspondant à son emoji (SESSION_EVENT_BY_EMOJI).
const PLAN_SESSIONS = {
  '2026-10-26': ['🧮 Königsberg + vocabulaire (sommet, arête, degré)'],
  '2026-10-27': ['🏊 Séance A technique (même 30 min)'],
  '2026-10-28': ['🧮 Prouver : somme des degrés = 2 × arêtes'],
  '2026-10-30': ['🏊 Séance B (même 20 min d’éducatifs)', '🧮 Project Euler n°1'],
  '2026-10-31': ['🚴 Vélo 45 min tranquille'],
  '2026-11-01': ['🏃 Course facile 30 min'],
  '2026-11-02': ['🧮 Théorème d’Euler (chemins eulériens)'],
  '2026-11-03': ['🏊 Test n°1 : chrono 100 m + distance max en crawl', '🧮 5 figures « sans lever le crayon »'],
  '2026-11-04': ['🧮 Arbres : n sommets ⇒ n−1 arêtes'],
  '2026-11-05': ['🧮 Révision de la semaine'],
  '2026-11-06': ['🏊 Séance B endurance (~800 m)', '🧮 Project Euler n°2'],
  '2026-11-07': ['🚴 Vélo 1 h tranquille'],
  '2026-11-08': ['🏃 Course facile 30 min'],
  '2026-11-09': ['🧮 Graphes bipartis'],
  '2026-11-10': ['🏊 Séance A technique (~800 m)'],
  '2026-11-11': ['🧮 Dijkstra à la main sur un petit graphe'],
  '2026-11-12': ['🧮 Dijkstra sur un graphe de 8 sommets'],
  '2026-11-13': ['🏊 Séance B endurance (~800 m)', '🧮 Project Euler n°3'],
  '2026-11-14': ['🚴 Vélo 1 h 15'],
  '2026-11-15': ['🏃 Course facile 35 min'],
  '2026-11-16': ['🧮 Coloration de graphes'],
  '2026-11-17': ['🏊 Séance A technique (~800 m)'],
  '2026-11-18': ['🧮 L’histoire du théorème des 4 couleurs'],
  '2026-11-19': ['🧮 Colorier la carte des régions de France'],
  '2026-11-20': ['🏊 Séance B endurance (~800 m)', '🧮 Project Euler n°4'],
  '2026-11-21': ['🚴 Vélo 1 h 30'],
  '2026-11-22': ['🏃 Course facile 40 min', '🧮 Bonus : coder Dijkstra'],
};

// Sujet culture du jour, d'après les cycles du défi culture (pages Notion : thèmes et
// ressources par semaine), en alternant lecture, vidéo, écoute et pratique
const CULTURE_SESSIONS = {
  '2026-10-23': '🎲 Backgammon · une partie contre un bot (XG Mobile ou Backgammon NJ)',
  '2026-10-24': '🎲 Backgammon · analyser cette partie avec eXtreme Gammon',
  '2026-10-25': '🎲 Backgammon · une partie sur ton plateau, en jouant le cube de doublement',
  '2026-10-26': '🎲 Backgammon · 2 problèmes de « 555 Backgammon Problems » (Robertie)',
  '2026-10-27': '🎲 Backgammon · une partie contre un bot, puis compter les pips',
  '2026-10-28': '🎲 Backgammon · relire un chapitre de « Backgammon » (Magriel)',
  '2026-10-29': '🎲 Backgammon · quiz de fin de cycle + bilan',
  '2026-10-30': '🎷 Jazz · Ken Burns « Jazz », épisode 1 (1re moitié)',
  '2026-10-31': '🎷 Jazz · le ragtime : écouter Scott Joplin, « Maple Leaf Rag »',
  '2026-11-01': '🎷 Jazz · les brass bands et les second lines (vidéo)',
  '2026-11-02': '🎷 Jazz · le blues et les chants de travail (podcast Les Chroniques du Jazz)',
  '2026-11-03': '🎷 Jazz · Congo Square et la culture créole (lecture)',
  '2026-11-04': '🎷 Jazz · Ken Burns « Jazz », épisode 1 (2e moitié)',
  '2026-11-05': '🎷 Jazz · lire le début de « Jazzmen » (Ramsey & Smith)',
  '2026-11-06': '🎷 Jazz · Buddy Bolden, le premier roi du jazz, sans aucun disque',
  '2026-11-07': '🎷 Jazz · Storyville, et sa fermeture en 1917',
  '2026-11-08': '🎷 Jazz · King Oliver : écouter le Creole Jazz Band',
  '2026-11-09': '🎷 Jazz · Louis Armstrong : écouter « West End Blues »',
  '2026-11-10': '🎷 Jazz · un épisode de Version Standard (podcast)',
  '2026-11-11': '🎷 Jazz · l’exode vers Chicago (Ken Burns, épisode 2)',
  '2026-11-12': '🎷 Jazz · quiz de fin de cycle + bilan',
  '2026-11-13': '📚 Lotus Bleu · Hergé et sa rencontre avec Tchang Tchong-Jen',
  '2026-11-14': '📚 Lotus Bleu · lire les pages 1 à 15',
  '2026-11-15': '📚 Lotus Bleu · lire les pages 16 à 31',
  '2026-11-16': '📚 Lotus Bleu · lire les pages 32 à 47',
  '2026-11-17': '📚 Lotus Bleu · lire les pages 48 à 62 (fin de l’album)',
  '2026-11-18': '📚 Lotus Bleu · « Hergé à l’ombre de Tintin » (1re partie)',
  '2026-11-19': '📚 Lotus Bleu · « Hergé à l’ombre de Tintin » (suite)',
  '2026-11-20': '📚 Lotus Bleu · l’incident de Moukden (1931) et l’occupation japonaise',
  '2026-11-21': '📚 Lotus Bleu · la critique politique d’Hergé et les réactions de l’époque',
  '2026-11-22': '📚 Lotus Bleu · sa place dans l’œuvre : des Cigares du pharaon au Lotus Bleu',
};

// Thème court de chaque cycle, pour le titre de l'événement du soir
const cultureTheme = (localKey) => {
  const text = CULTURE_SESSIONS[localKey];
  return text ? text.split(' · ')[0] : '📚 Culture';
};

// Version du plan : une nouvelle version fait réapparaître la carte d'import
export const PLAN_VERSION = 2;

const PLAN_START = '2026-10-26';
const PLAN_END = '2026-11-22';

// days : 0 = lundi … 6 = dimanche, comme dans WeekPlanner
const PLAN_EVENTS = [
  { id: 'plan_ev_swim', title: '🏊 Natation', days: [1, 4], time: '12:00', endTime: '13:00', color: '#1E88E5', questIds: ['plan_swim'] },
  { id: 'plan_ev_bike', title: '🚴 Vélo', days: [5], time: '10:00', endTime: '11:30', color: '#43A047', questIds: ['plan_bike'] },
  { id: 'plan_ev_run', title: '🏃 Course', days: [6], time: '10:00', endTime: '10:45', color: '#FB8C00', questIds: ['plan_run'] },
  {
    id: 'plan_ev_study',
    title: '🧮 Maths + 📚 Culture',
    days: [1, 2, 4, 5, 6],
    time: '21:00',
    endTime: '21:30',
    color: '#8E24AA',
    questIds: ['plan_maths', 'plan_culture'],
  },
  // Lundi et jeudi, l'ultimate occupe 19h-22h : maths + culture passent avant
  {
    id: 'plan_ev_study_early',
    title: '🧮 Maths + 📚 Culture',
    days: [0, 3],
    time: '18:00',
    endTime: '18:30',
    color: '#8E24AA',
    questIds: ['plan_maths', 'plan_culture'],
  },
  // Le dimanche avant la semaine : les repas du lundi au mercredi sont prêts
  { id: 'plan_ev_batch', title: '🍳 Batch cooking', days: [6], time: '17:00', endTime: '19:00', color: '#6D4C41', questIds: ['plan_batch'] },
];

const ULTIMATE_DAYS = [0, 3];

// Événements d'une version précédente du plan, retirés à l'import : la tâche pour l'appart
// n'a plus d'horaire, c'est la case du jour « Appart 15 min » dans les objectifs de chaque jour
const OBSOLETE_EVENT_IDS = ['plan_ev_home', 'plan_ev_home_late'];

// Créé seulement si le planning n'a pas déjà un événement « ultimate » à relier
const ULTIMATE_EVENT = {
  id: 'plan_ev_ultimate',
  title: '🥏 Ultimate',
  days: [0, 3],
  time: '19:00',
  endTime: '22:00',
  color: '#E53935',
  questIds: ['plan_ultimate'],
};

const SESSION_EVENT_BY_EMOJI = { '🏊': 'plan_ev_swim', '🚴': 'plan_ev_bike', '🏃': 'plan_ev_run', '🧮': 'plan_ev_study' };

// Objectifs du jour des versions précédentes du plan (les séances y étaient des objectifs),
// retirés s'ils ne sont pas cochés
const OBSOLETE_DAY_TEXTS = [
  '🚴 Vélo ou 🏃 course 30-45 min, si l’envie est là',
  '🏃 Course facile 30 min (facultatif)',
  '🏃 Course facile (facultatif)',
  ...Object.values(PLAN_SESSIONS).flat(),
];

// Objectifs précis de la semaine, par lundi
const PLAN_WEEK_GOALS = {
  '2026-10-26': ['Aller une fois à la piscine', 'Fixer mes créneaux piscine mardi et vendredi'],
  '2026-11-02': ['Test natation n°1', 'Lister 2 clubs de triathlon près de chez moi'],
  '2026-11-09': ['Contacter un club de tri pour une séance d’essai'],
  '2026-11-16': ['Repérer un triathlon S en mai-juin et noter la date'],
};

// Même convention que toDayKey dans WeekPlanner : minuit local, puis date UTC
const goalDayKey = (localKey) => {
  const [y, m, d] = localKey.split('-').map(Number);
  return new Date(y, m - 1, d).toISOString().split('T')[0];
};

// Même convention que getWeekKeyForDate dans WeekPlanner (clé des semaines du planning)
const isoWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const plannerWeekKey = (date) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
  return `planner_week_${monday.getFullYear()}_${String(isoWeekNumber(monday)).padStart(2, '0')}`;
};

const parseLocalKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const sameText = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

const isUltimate = (r) => /ultimate/i.test(r.title ?? '');

// Quêtes du plan pas encore dans l'app (pour annoncer une mise à jour du plan)
export const planMissingLabels = (quests) =>
  PLAN_QUESTS.filter((p) => !quests.some((q) => q.id === p.id)).map((p) => p.label);

export const isPlanImported = (quests, recurring) =>
  PLAN_QUESTS.every((p) => quests.some((q) => q.id === p.id)) &&
  PLAN_EVENTS.every((ev) => recurring.some((r) => r.id === ev.id)) &&
  !recurring.some((r) => OBSOLETE_EVENT_IDS.includes(r.id));

// Quêtes du plan à ajouter : ni déjà là (même id ou même nom), ni au-delà des plafonds.
// removed = anciennes quêtes du plan remplacées par cette version.
export const planQuestsToAdd = (allQuests) => {
  const removed = allQuests
    .filter((q) => PLAN_REPLACED[q.id]?.some((id) => !allQuests.some((o) => o.id === id)))
    .map((q) => q.id);
  const quests = allQuests.filter((q) => !removed.includes(q.id));
  let daily = quests.filter(isDailyQuest).length;
  let weekly = quests.filter((q) => typeOf(q) === 'weekly').length;
  const added = [];
  const skipped = [];
  PLAN_QUESTS.forEach(({ id, ...def }) => {
    if (quests.some((q) => q.id === id || sameText(q.label, def.label))) return;
    if (def.type === 'daily' && daily >= MAX_DAILY) return skipped.push(def.label);
    if (def.type === 'weekly' && weekly >= MAX_WEEKLY) return skipped.push(def.label);
    if (def.type === 'daily') daily += 1;
    if (def.type === 'weekly') weekly += 1;
    const steps = def.steps?.map((label, i) => ({ id: `${id}_step_${i}`, label, done: false }));
    const quest = { ...makeQuest({ ...def, steps }), id };
    // Les quêtes hebdo démarrent avec les séances : la semaine entamée ne compte pas
    if (def.type === 'weekly') {
      Object.assign(quest, { createdAt: parseLocalKey(PLAN_START).toISOString(), perWeekSince: PLAN_START });
    }
    added.push(quest);
  });
  return { added, skipped, removed };
};

// Événements récurrents du plan ; l'ultimate déjà présent est relié plutôt que doublé
export const mergePlanRecurring = (prev) => {
  const startDate = goalDayKey(PLAN_START);
  const next = (prev ?? []).filter((r) => !OBSOLETE_EVENT_IDS.includes(r.id));
  PLAN_EVENTS.forEach((ev) => {
    if (!next.some((r) => r.id === ev.id)) next.push({ ...ev, startDate });
  });
  if (!next.some(isUltimate)) next.push({ ...ULTIMATE_EVENT, startDate });
  return next.map((r) => {
    // Version précédente : maths + culture tous les soirs à 21h, en conflit avec l'ultimate
    if (r.id === 'plan_ev_study' && r.days.some((d) => ULTIMATE_DAYS.includes(d))) {
      return { ...r, days: r.days.filter((d) => !ULTIMATE_DAYS.includes(d)) };
    }
    if (isUltimate(r) && !(r.questIds ?? []).includes('plan_ultimate')) {
      return { ...r, questIds: [...(r.questIds ?? []), 'plan_ultimate'] };
    }
    return r;
  });
};

// Sujet d'étude précis du jour pour une quête (bandeau de la Semaine) ; null s'il n'y en a pas
export const planSubjectFor = (questId, localKey) => {
  if (questId === 'plan_culture') return CULTURE_SESSIONS[localKey] ?? null;
  if (questId !== 'plan_maths' || localKey < PLAN_START || localKey > PLAN_END) return null;
  const maths = (PLAN_SESSIONS[localKey] ?? []).find((t) => t.startsWith('🧮'));
  if (!maths) {
    return parseLocalKey(localKey).getDay() % 6 === 0 ? '🧮 Maths · Zetamac 2 min (calcul mental)' : null;
  }
  // Le thème devant le sujet, comme pour la culture : « 🧮 Graphes · Graphes bipartis »
  const topic = maths.replace(/^🧮\s*/, '');
  return topic.startsWith('Project Euler') ? `🧮 Maths · ${topic}` : `🧮 Graphes · ${topic}`;
};

// Titre de l'événement maths + culture de la version 1 du plan, remplacé par un titre court
const legacyStudyTitle = (localKey, dayIndex) => {
  const maths = (PLAN_SESSIONS[localKey] ?? []).find((t) => t.startsWith('🧮'));
  return `${maths ?? (dayIndex >= 5 ? '🧮 Zetamac 2 min' : '🧮 Maths 15 min')} · 📚 Culture`;
};

// Titre de chaque occurrence : la séance du jour ; le soir, « 🧮 Maths · 🎷 Jazz » (le sujet
// précis est dans les objectifs du jour)
export const mergePlanOverrides = (prev) => {
  const next = { ...(prev ?? {}) };
  for (let d = parseLocalKey(PLAN_START); d <= parseLocalKey(PLAN_END); d.setDate(d.getDate() + 1)) {
    const localKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayIndex = (d.getDay() + 6) % 7;
    const sessions = PLAN_SESSIONS[localKey] ?? [];
    const titles = {};
    sessions.forEach((text) => {
      const eventId = SESSION_EVENT_BY_EMOJI[[...text][0]];
      if (eventId) titles[eventId] = text;
    });
    titles.plan_ev_study = `🧮 Maths · ${cultureTheme(localKey)}`;
    Object.entries(titles).forEach(([sessionEventId, title]) => {
      const isStudy = sessionEventId === 'plan_ev_study';
      const eventId = isStudy && ULTIMATE_DAYS.includes(dayIndex) ? 'plan_ev_study_early' : sessionEventId;
      const key = `${eventId}|${plannerWeekKey(d)}|${dayIndex}`;
      const replaceLegacy = isStudy && next[key]?.title === legacyStudyTitle(localKey, dayIndex);
      if (!next[key] || replaceLegacy) next[key] = { ...next[key], title };
    });
  }
  return next;
};

// Ne fait plus que retirer les séances des versions précédentes, désormais des événements
export const mergePlanDailyGoals = (prev) => {
  const next = { ...(prev ?? {}) };
  Object.entries(next).forEach(([key, goals]) => {
    // Le plan a toujours écrit des tableaux : l'ancien format objet n'est pas concerné
    if (!Array.isArray(goals)) return;
    const kept = goals.filter((g) => g.done || !OBSOLETE_DAY_TEXTS.some((t) => sameText(t, g.text)));
    if (kept.length !== goals.length) next[key] = kept;
  });
  return next;
};

export const mergePlanWeekGoals = (prev) => {
  const next = { ...prev };
  let n = 0;
  Object.entries(PLAN_WEEK_GOALS).forEach(([weekKey, labels]) => {
    const week = { counts: {}, targets: {}, goals: [], ...next[weekKey] };
    const goals = [...week.goals];
    labels.forEach((label) => {
      if (goals.length >= MAX_WEEK_GOALS || goals.some((g) => sameText(g.label, label))) return;
      n += 1;
      goals.push({ id: `wgoal_${Date.now()}_${n}`, label, done: false });
    });
    next[weekKey] = { ...week, goals };
  });
  return next;
};
