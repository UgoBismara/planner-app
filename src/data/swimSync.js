// Liens entre le programme natation et le reste de l'app : titres des séances dans le
// planning, séance cochée ✓ (même clé que dans la Semaine), quête hebdo « Natation » et
// étapes de la quête « Triathlon S ».
import { emptyWeek, parseDateKey, typeOf, weekKeyOf } from './quests';
import { LEGACY_SWIM_TITLES, PLAN_SWIM_EVENT, goalDayKey, plannerWeekKey } from './questsPlan';
import {
  SESSIONS,
  SWIM_EVENT_ID,
  SWIM_QUEST_ID,
  SWIM_START,
  TRI_S_QUEST_ID,
  sessionEventTitle,
  upgradeTriSteps,
} from './swimPlan';

const dayIndexOf = (date) => (date.getDay() + 6) % 7;

// Titres que l'import peut écraser : ceux qu'il a lui-même écrits (même si le programme a
// changé depuis), ceux des anciennes versions du plan et le titre générique
const OWN_TITLES = new Set([...SESSIONS.map(sessionEventTitle), ...LEGACY_SWIM_TITLES, PLAN_SWIM_EVENT.title]);

// L'événement natation du planning : celui du plan, sinon un événement relié à la quête
export const findSwimEvent = (recurring) =>
  (recurring ?? []).find((r) => r.id === SWIM_EVENT_ID) ??
  (recurring ?? []).find((r) => (r.questIds ?? []).includes(SWIM_QUEST_ID)) ??
  null;

// Clé de l'occurrence du jour de la séance, comme dans WeekPlanner
export const occurrenceKey = (eventId, dateKeyStr) => {
  const date = parseDateKey(dateKeyStr);
  return `${eventId}|${plannerWeekKey(date)}|${dayIndexOf(date)}`;
};

export const isSessionDone = (session, recurring, recurringDone) => {
  const event = findSwimEvent(recurring);
  return Boolean(event && (recurringDone ?? []).includes(occurrenceKey(event.id, session.date)));
};

export const swimTitlesImported = (recurring, overrides) => {
  const event = findSwimEvent(recurring);
  if (!event) return false;
  const upcoming = SESSIONS.filter((s) => event.days.includes(dayIndexOf(parseDateKey(s.date))));
  return upcoming.length > 0 && upcoming.every((s) => overrides?.[occurrenceKey(event.id, s.date)]?.title);
};

export const withSwimEvent = (recurring) => {
  if (findSwimEvent(recurring)) return recurring ?? [];
  return [...(recurring ?? []), { ...PLAN_SWIM_EVENT, startDate: goalDayKey(SWIM_START) }];
};

// Écrit le titre de chaque séance dans son occurrence, sans toucher à un titre modifié à la
// main. Seules les séances tombant un jour de l'événement sont concernées.
export const withSwimTitles = (overrides, event) => {
  const next = { ...(overrides ?? {}) };
  let written = 0;
  SESSIONS.forEach((s) => {
    if (!event.days.includes(dayIndexOf(parseDateKey(s.date)))) return;
    const key = occurrenceKey(event.id, s.date);
    const current = next[key]?.title;
    const title = sessionEventTitle(s);
    if (current === title || (current && !OWN_TITLES.has(current))) return;
    next[key] = { ...next[key], title };
    written += 1;
  });
  return { next, written };
};

export const withUpgradedTriQuest = (quests) => {
  const quest = (quests ?? []).find((q) => q.id === TRI_S_QUEST_ID);
  const steps = upgradeTriSteps(quest);
  if (!steps) return quests;
  return quests.map((q) => (q.id === TRI_S_QUEST_ID ? { ...q, steps } : q));
};

// La quête hebdo « Natation » compte +1 / −1, comme quand on coche l'événement dans la Semaine
export const withSwimCount = (weekLog, quests, dateKeyStr, done) => {
  const quest = (quests ?? []).find((q) => q.id === SWIM_QUEST_ID);
  if (!quest || typeOf(quest) !== 'weekly') return weekLog;
  const wk = weekKeyOf(parseDateKey(dateKeyStr));
  const week = { ...emptyWeek(), ...weekLog?.[wk] };
  const count = Math.max(0, (week.counts[SWIM_QUEST_ID] ?? 0) + (done ? 1 : -1));
  return {
    ...weekLog,
    [wk]: {
      ...week,
      counts: { ...week.counts, [SWIM_QUEST_ID]: count },
      targets: { ...week.targets, [SWIM_QUEST_ID]: week.targets[SWIM_QUEST_ID] ?? quest.perWeek },
    },
  };
};

export const triStepDone = (quests, label) =>
  Boolean((quests ?? []).find((q) => q.id === TRI_S_QUEST_ID)?.steps?.find((s) => s.label === label)?.done);

export const withTriStep = (quests, label, done) =>
  (quests ?? []).map((q) =>
    q.id === TRI_S_QUEST_ID && q.steps?.some((s) => s.label === label)
      ? { ...q, steps: q.steps.map((s) => (s.label === label ? { ...s, done } : s)) }
      : q,
  );
