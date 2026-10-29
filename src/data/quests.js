// Onglet « 🏆 Quêtes » : quatre sortes de quêtes.
// - Case du jour : cochée chaque jour, avec un minimum « jour sans » facultatif.
// - Chaque semaine : à faire N fois par semaine, compteur remis à zéro le lundi.
// - Challenge (id historique « target », ex-« but chiffré ») : un défi du mois chiffré,
//   ou un objectif long terme découpé en étapes, avec une échéance.
// - À mettre en place : une habitude en liste d'attente, activée quand on est prêt,
//   puis acquise après INSTALL_DAYS jours cochés.
// Les quêtes quotidiennes (cases du jour + habitudes activées) alimentent une série
// qui tolère un raté isolé mais pas deux d'affilée. Les quêtes hebdomadaires et les
// objectifs précis de la semaine alimentent une série de semaines réussies.

export const QUESTS_KEY = 'planner_quests';
export const QUEST_LOG_KEY = 'planner_quest_log';
// { [lundi YYYY-MM-DD]: { counts: { [questId]: n }, targets: { [questId]: n }, goals: [{ id, label, done }] } }
export const WEEK_LOG_KEY = 'planner_week_quests';

export const MAX_DAILY = 5;
export const MAX_INSTALLING = 2;
export const MAX_WEEKLY = 5;
export const MAX_WEEK_GOALS = 2;
export const MAX_LONG = 3;
export const INSTALL_DAYS = 30;
export const MAX_JOKERS = 3;
export const DAYS_PER_JOKER = 7;

export const QUEST_TYPES = [
  { id: 'daily', label: 'Case du jour', hint: 'Une case à cocher chaque jour (ex. 20 pompes).' },
  { id: 'weekly', label: 'Chaque semaine', hint: 'À faire plusieurs fois par semaine (ex. 2 séances de natation). Se coche en haut de la Semaine.' },
  { id: 'target', label: 'Challenge', hint: 'Un défi du mois chiffré, ou un objectif long terme découpé en étapes.' },
  { id: 'habit', label: 'À mettre en place', hint: `Une habitude en liste d’attente. Une fois activée, ${INSTALL_DAYS} jours cochés pour l’acquérir.` },
];

export const DOMAINS = [
  { id: 'sport', label: 'Sport / santé' },
  { id: 'work', label: 'Travail' },
  { id: 'perso', label: 'Projets perso' },
  { id: 'daily', label: 'Quotidien' },
];

export const CHALLENGE_KINDS = [
  { id: 'monthly', label: 'Défi du mois', hint: 'Un chiffre à atteindre avant la fin du mois (ex. nager 10 km). Un seul par mois.' },
  { id: 'long', label: 'Long terme', hint: 'Un grand objectif découpé en étapes, avec une date finale (ex. triathlon S en juin).' },
];

export const ENERGY_LEVELS = [
  { id: 'low', label: 'Basse', hint: 'Les minimums suffisent, et c’est une victoire.' },
  { id: 'mid', label: 'Normale', hint: 'Fais tes quêtes en version complète quand tu peux.' },
  { id: 'high', label: 'Haute', hint: 'Profites-en pour avancer un challenge, pas pour ajouter de nouvelles quêtes.' },
];

// Les quêtes créées avant les types étaient toutes des cases du jour
export const typeOf = (q) => q.type ?? 'daily';

export const makeQuest = ({ type, label, domain, minimum, target, unit, perWeek, kind, month, steps, deadline }) => {
  const base = {
    id: `quest_${Date.now()}`,
    type,
    label,
    domain,
    createdAt: new Date().toISOString(),
  };
  if (type === 'target' && kind === 'monthly') {
    return { ...base, kind, month, target, unit, progress: 0, entries: [], deadline: endOfMonthKey(month) };
  }
  if (type === 'target') return { ...base, kind: 'long', steps, deadline: deadline || null };
  if (type === 'habit') return { ...base, minimum, activatedAt: null };
  if (type === 'weekly') return { ...base, perWeek, perWeekSince: weekKeyOf(new Date()) };
  return { ...base, minimum };
};

// Date locale (pas UTC) : une case cochée à 23h compte bien pour ce jour-là.
export const dateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const parseDateKey = (key) => parseKey(key);

export const shiftDateKey = (key, n) => dateKey(addDays(parseKey(key), n));

// Clé de mois = YYYY-MM ; le défi du mois expire le dernier jour de son mois
export const monthKeyOf = (d) => dateKey(d).slice(0, 7);

export const nextMonthKey = (d) => monthKeyOf(new Date(d.getFullYear(), d.getMonth() + 1, 1));

export const endOfMonthKey = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  return dateKey(new Date(y, m, 0));
};

export const monthLabel = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long' });
};

// Clé de semaine = date locale du lundi
export const weekKeyOf = (d) => dateKey(addDays(d, -((d.getDay() + 6) % 7)));

// Premier jour où la quête est attendue chaque jour (null = pas une quête quotidienne)
export const dailyStartKey = (q) => {
  const type = typeOf(q);
  if (type === 'daily') return dateKey(new Date(q.createdAt));
  if (type === 'habit' && q.activatedAt) return dateKey(new Date(q.activatedAt));
  return null;
};

export const isDailyQuest = (q) => dailyStartKey(q) !== null;

export const dailyQuestsOn = (quests, key) =>
  quests.filter((q) => {
    const start = dailyStartKey(q);
    return start !== null && start <= key;
  });

// Jours cochés depuis l'activation de l'habitude, consécutifs ou non
export const installedDays = (q, log) => {
  const start = dailyStartKey(q);
  if (typeOf(q) !== 'habit' || start === null) return 0;
  return Object.entries(log).filter(([key, day]) => key >= start && day.done?.[q.id]).length;
};

export const isAcquired = (q, log) => installedDays(q, log) >= INSTALL_DAYS;

export const isInstalling = (q, log) =>
  typeOf(q) === 'habit' && Boolean(q.activatedAt) && !isAcquired(q, log);

// ── Challenges ────────────────────────────────────────────────────

// Les anciens « buts chiffrés » n'ont pas de kind : long terme chiffré, sans échéance
export const kindOf = (q) => q.kind ?? 'long';

export const hasSteps = (q) => Array.isArray(q.steps) && q.steps.length > 0;

export const isChallengeDone = (q) => {
  if (typeOf(q) !== 'target') return false;
  if (hasSteps(q)) return q.steps.every((st) => st.done);
  return q.progress >= q.target;
};

// done > archived > expired (échéance passée, à prolonger ou archiver) > upcoming > active
export const challengeStatus = (q, today = new Date()) => {
  if (isChallengeDone(q)) return 'done';
  if (q.archivedAt) return 'archived';
  if (q.deadline && q.deadline < dateKey(today)) return 'expired';
  if (kindOf(q) === 'monthly' && q.month > monthKeyOf(today)) return 'upcoming';
  return 'active';
};

export const daysLeft = (deadline, today = new Date()) =>
  Math.round((parseKey(deadline) - parseKey(dateKey(today))) / 86400000);

// Une journée est validée quand chaque quête quotidienne a été cochée (le minimum suffit).
// null = aucune quête quotidienne ce jour-là, la journée ne compte ni pour ni contre.
export const isDayValidated = (key, quests, log) => {
  const active = dailyQuestsOn(quests, key);
  if (active.length === 0) return null;
  const done = log[key]?.done ?? {};
  return active.every((q) => done[q.id]);
};

// Rejoue tout l'historique jour par jour, du premier jour de quête jusqu'à aujourd'hui.
// Aujourd'hui ne compte comme raté qu'une fois passé : tant qu'il n'est pas validé, on l'ignore.
export const computeProgress = (quests, log, today = new Date()) => {
  const todayKey = dateKey(today);
  const stats = {
    streak: 0,
    maxStreak: 0,
    jokers: 0,
    jokersUsed: 0,
    missRun: 0, // ratés consécutifs en cours
    validatedDays: 0,
    lowDaysValidated: 0,
    normalCount: 0,
    noDoubleRun: 0,
    maxNoDoubleRun: 0,
    perfectWeeks: 0,
    fullMonths: 0,
    comebacks: 0,
    todayValidated: false,
    challengesDone: quests.filter(isChallengeDone).length,
    monthlyDone: quests.filter((q) => isChallengeDone(q) && kindOf(q) === 'monthly').length,
    longDone: quests.filter((q) => isChallengeDone(q) && kindOf(q) === 'long').length,
    habitsAcquired: quests.filter((q) => isAcquired(q, log)).length,
  };

  const starts = quests.map(dailyStartKey).filter(Boolean).sort();
  if (starts.length === 0) return stats;

  let sinceJoker = 0;
  let weekRun = 0; // jours validés depuis lundi
  let monthRun = 0; // jours validés depuis le 1er
  let afterMiss = false;
  let comebackRun = 0;

  for (let d = parseKey(starts[0]); dateKey(d) <= todayKey; d = addDays(d, 1)) {
    const key = dateKey(d);
    const validated = isDayValidated(key, quests, log);
    if (validated === null) continue;
    if (key === todayKey && !validated) break;

    if (d.getDay() === 1) weekRun = 0;
    if (d.getDate() === 1) monthRun = 0;

    if (validated) {
      stats.streak += 1;
      stats.validatedDays += 1;
      stats.missRun = 0;
      stats.noDoubleRun += 1;
      if (log[key]?.energy === 'low') stats.lowDaysValidated += 1;
      stats.normalCount += Object.values(log[key]?.done ?? {}).filter(
        (lvl) => lvl !== 'min',
      ).length;

      sinceJoker += 1;
      if (sinceJoker === DAYS_PER_JOKER) {
        sinceJoker = 0;
        stats.jokers = Math.min(MAX_JOKERS, stats.jokers + 1);
      }

      weekRun += 1;
      if (d.getDay() === 0 && weekRun === 7) stats.perfectWeeks += 1;
      monthRun += 1;
      if (addDays(d, 1).getDate() === 1 && monthRun === d.getDate()) {
        stats.fullMonths += 1;
      }

      if (afterMiss) {
        comebackRun += 1;
        if (comebackRun === 7) {
          stats.comebacks += 1;
          afterMiss = false;
        }
      }
    } else {
      stats.missRun += 1;
      weekRun = -Infinity;
      monthRun = -Infinity;
      afterMiss = true;
      comebackRun = 0;

      if (stats.missRun >= 2) {
        // Deuxième raté d'affilée : un joker le comble, sinon la série tombe
        stats.noDoubleRun = 0;
        if (stats.jokers > 0) {
          stats.jokers -= 1;
          stats.jokersUsed += 1;
          stats.missRun = 1;
        } else {
          stats.streak = 0;
          sinceJoker = 0;
        }
      } else {
        stats.noDoubleRun += 1;
      }
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    stats.maxNoDoubleRun = Math.max(stats.maxNoDoubleRun, stats.noDoubleRun);
    if (key === todayKey) stats.todayValidated = validated;
  }

  return stats;
};

// Saison = mois en cours, 100 % = chaque jour du mois validé.
export const computeSeason = (quests, log, today = new Date()) => {
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  let validated = 0;
  for (let i = 1; i <= today.getDate(); i += 1) {
    const key = dateKey(new Date(today.getFullYear(), today.getMonth(), i));
    if (isDayValidated(key, quests, log)) validated += 1;
  }
  return {
    label: today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    validated,
    daysInMonth,
    percent: Math.round((validated / daysInMonth) * 100),
  };
};

// ── Semaine ───────────────────────────────────────────────────────

export const emptyWeek = () => ({ counts: {}, targets: {}, goals: [] });

export const weeklyQuestsOn = (quests, weekKey) =>
  quests.filter(
    (q) => typeOf(q) === 'weekly' && weekKeyOf(new Date(q.createdAt)) <= weekKey,
  );

// Cible figée dans la semaine dès qu'on y compte, pour qu'un changement ultérieur
// de perWeek ne réécrive pas le résultat des semaines passées
export const weekTarget = (q, week) => week?.targets?.[q.id] ?? q.perWeek;

export const weekCount = (q, week) => week?.counts?.[q.id] ?? 0;

// null = rien à faire cette semaine-là, elle ne compte ni pour ni contre
export const isWeekSucceeded = (weekKey, quests, weekLog) => {
  const recurring = weeklyQuestsOn(quests, weekKey);
  const week = weekLog[weekKey];
  const goals = week?.goals ?? [];
  if (recurring.length === 0 && goals.length === 0) return null;
  return (
    recurring.every((q) => weekCount(q, week) >= weekTarget(q, week)) &&
    goals.every((g) => g.done)
  );
};

// La semaine en cours ne casse pas la série tant qu'elle n'est pas finie
export const computeWeekProgress = (quests, weekLog, today = new Date()) => {
  const current = weekKeyOf(today);
  const stats = { weekStreak: 0, maxWeekStreak: 0, weeksSucceeded: 0, currentWeekSucceeded: false };
  const starts = [
    ...quests.filter((q) => typeOf(q) === 'weekly').map((q) => weekKeyOf(new Date(q.createdAt))),
    ...Object.keys(weekLog).filter((k) => (weekLog[k].goals ?? []).length > 0),
  ].sort();
  if (starts.length === 0) return stats;

  for (let d = parseKey(starts[0]); dateKey(d) <= current; d = addDays(d, 7)) {
    const key = dateKey(d);
    const succeeded = isWeekSucceeded(key, quests, weekLog);
    if (succeeded === null) continue;
    if (succeeded) {
      stats.weekStreak += 1;
      stats.weeksSucceeded += 1;
    } else if (key !== current) {
      stats.weekStreak = 0;
    }
    stats.maxWeekStreak = Math.max(stats.maxWeekStreak, stats.weekStreak);
    if (key === current) stats.currentWeekSucceeded = succeeded;
  }
  return stats;
};

// Raté 2 semaines de suite → proposer de baisser ; réussi 3 semaines de suite → de monter.
// Seules les semaines terminées depuis le dernier réglage comptent.
export const adjustSuggestion = (q, weekLog, today = new Date()) => {
  const current = weekKeyOf(today);
  if (typeOf(q) !== 'weekly' || q.adjustDismissed === current) return null;
  const since = q.perWeekSince ?? weekKeyOf(new Date(q.createdAt));
  const results = []; // du plus récent au plus ancien
  for (
    let d = addDays(parseKey(current), -7);
    dateKey(d) >= since && results.length < 3;
    d = addDays(d, -7)
  ) {
    const week = weekLog[dateKey(d)];
    results.push(weekCount(q, week) >= weekTarget(q, week));
  }
  if (results.length >= 2 && !results[0] && !results[1] && q.perWeek > 1) {
    return { dir: 'down', to: q.perWeek - 1 };
  }
  if (results.length === 3 && results.every(Boolean) && q.perWeek < 7) {
    return { dir: 'up', to: q.perWeek + 1 };
  }
  return null;
};

export const ACHIEVEMENTS = [
  { id: 'first_step', title: 'Premier pas', description: 'Valider une première journée.', check: (s) => s.validatedDays >= 1 },
  { id: 'low_day', title: 'Même sans batterie', description: 'Valider une journée en batterie basse.', check: (s) => s.lowDaysValidated >= 1 },
  { id: 'streak_7', title: 'Une semaine solide', description: 'Atteindre une série de 7 jours.', check: (s) => s.maxStreak >= 7 },
  { id: 'week_1', title: 'Semaine réussie', description: 'Remplir tous tes objectifs d’une semaine.', check: (s) => s.weeksSucceeded >= 1 },
  { id: 'target_1', title: 'Challenge relevé', description: 'Réussir un challenge.', check: (s) => s.challengesDone >= 1 },
  { id: 'perfect_week', title: 'Semaine parfaite', description: 'Valider tous les jours, du lundi au dimanche.', check: (s) => s.perfectWeeks >= 1 },
  { id: 'joker_saved', title: 'Sauvé par le joker', description: 'Un joker a protégé ta série.', check: (s) => s.jokersUsed >= 1 },
  { id: 'comeback', title: 'Remontada', description: 'Repartir après un raté et enchaîner 7 jours.', check: (s) => s.comebacks >= 1 },
  { id: 'low_5', title: 'Tenir la ligne', description: 'Valider 5 journées en batterie basse.', check: (s) => s.lowDaysValidated >= 5 },
  { id: 'habit_1', title: 'Habitude installée', description: `Cocher une habitude ${INSTALL_DAYS} jours.`, check: (s) => s.habitsAcquired >= 1 },
  { id: 'week_streak_4', title: 'Mois carré', description: 'Réussir 4 semaines d’affilée.', check: (s) => s.maxWeekStreak >= 4 },
  { id: 'no_double_30', title: 'Jamais deux fois', description: '30 jours sans deux ratés d’affilée.', check: (s) => s.maxNoDoubleRun >= 30 },
  { id: 'streak_30', title: 'Mois de fer', description: 'Atteindre une série de 30 jours.', check: (s) => s.maxStreak >= 30 },
  { id: 'target_3', title: 'Tireur d’élite', description: 'Réussir 3 challenges.', check: (s) => s.challengesDone >= 3 },
  { id: 'monthly_3', title: 'Trois lunes', description: 'Réussir 3 défis du mois.', check: (s) => s.monthlyDone >= 3 },
  { id: 'long_1', title: 'Sommet atteint', description: 'Réussir un challenge long terme.', check: (s) => s.longDone >= 1 },
  { id: 'normal_50', title: 'Pas que le minimum', description: 'Faire 50 quêtes en version complète.', check: (s) => s.normalCount >= 50 },
  { id: 'full_season', title: 'Saison à 100 %', description: 'Valider chaque jour d’un mois entier.', check: (s) => s.fullMonths >= 1 },
  { id: 'week_streak_12', title: 'Trimestre en or', description: 'Réussir 12 semaines d’affilée.', check: (s) => s.maxWeekStreak >= 12 },
  { id: 'habit_3', title: 'Jardinier', description: 'Installer 3 habitudes.', check: (s) => s.habitsAcquired >= 3 },
  { id: 'total_100', title: 'Centenaire', description: 'Cumuler 100 journées validées.', check: (s) => s.validatedDays >= 100 },
  { id: 'streak_100', title: 'Centurion', description: 'Atteindre une série de 100 jours.', check: (s) => s.maxStreak >= 100 },
];
