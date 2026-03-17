import { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import ActivityForm from "./ActivityForm";
import SlotFinderModal from "./SlotFinderModal";
import "./WeekPlanner.css";

function getWeekKey(weekOffset) {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + weekOffset * 7);
  const year = monday.getFullYear();
  const week = getWeekNumber(monday);
  return `planner_week_${year}_${String(week).padStart(2, "0")}`;
}

function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getMondayOfWeek(weekOffset) {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getDaysOfWeek(weekOffset) {
  const monday = getMondayOfWeek(weekOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatWeekLabel(weekOffset) {
  const days = getDaysOfWeek(weekOffset);
  const first = days[0];
  const last = days[6];
  const fmt = (d) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  if (weekOffset === 0) return `Cette semaine (${fmt(first)} – ${fmt(last)})`;
  if (weekOffset === -1) return `Semaine dernière`;
  if (weekOffset === 1) return `Semaine prochaine`;
  return `${fmt(first)} – ${fmt(last)}`;
}

function getDefaultRecurring() {
  return [
    {
      id: "recur_am",
      title: "Travail",
      time: "09:00",
      endTime: "12:30",
      color: "#4f8ef7",
      days: [0, 1, 2, 3, 4],
    },
    {
      id: "recur_pm",
      title: "Travail",
      time: "14:00",
      endTime: "17:30",
      color: "#4f8ef7",
      days: [0, 1, 2, 3, 4],
    },
    {
      id: "recur_savoirs",
      title: "Table des savoirs",
      time: "",
      endTime: "",
      color: "#f39c12",
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      id: "recur_nba",
      title: "Vidéo NBA",
      time: "",
      endTime: "",
      color: "#e74c3c",
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      id: "recur_sport",
      title: "Sport",
      time: "",
      endTime: "",
      color: "#2ecc71",
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      id: "recur_lecture",
      title: "Lire",
      time: "",
      endTime: "",
      color: "#9b59b6",
      days: [0, 1, 2, 3, 4, 5, 6],
    },
  ];
}

function roundUpTo30(min) {
  return Math.ceil(min / 30) * 30;
}

function findFreeSlots(weekData, recurring, durationMin, days = null, searchEnd = 22 * 60) {
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    // Skip past days
    if (days) {
      const d = new Date(days[dayIndex]); d.setHours(0, 0, 0, 0);
      if (d < today) continue;
    }

    // For today: start after current time; for future days: start at 8:00
    const isToday = days ? (days[dayIndex].toDateString() === now.toDateString()) : false;
    const searchStart = isToday ? Math.max(8 * 60, currentMinutes + 5) : 8 * 60;

    const recurringForDay = recurring.filter((r) => r.days.includes(dayIndex));
    const weekActivities = (weekData[dayIndex] || []).filter(
      (a) => !String(a.id).startsWith("default_"),
    );
    const busy = [];
    for (const a of [...recurringForDay, ...weekActivities]) {
      if (!a.time) continue;
      const start = timeToMinutes(a.time);
      const end = a.endTime ? timeToMinutes(a.endTime) : start + 30;
      if (end > searchStart && start < searchEnd) {
        busy.push([Math.max(start, searchStart), Math.min(end, searchEnd)]);
      }
    }
    busy.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [s, e] of busy) {
      if (merged.length === 0 || s > merged[merged.length - 1][1]) {
        merged.push([s, e]);
      } else {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
      }
    }
    let cursor = roundUpTo30(searchStart);
    for (const [busyStart, busyEnd] of merged) {
      if (busyStart - cursor >= durationMin) {
        slots.push({ dayIndex, start: cursor, end: cursor + durationMin });
      }
      cursor = Math.max(cursor, roundUpTo30(busyEnd));
    }
    if (searchEnd - cursor >= durationMin) {
      slots.push({ dayIndex, start: cursor, end: cursor + durationMin });
    }
  }
  return slots;
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const START_HOUR = 9;
const END_HOUR = 26;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);
const TOTAL_MINS = (END_HOUR - START_HOUR) * 60;
const START_MIN = START_HOUR * 60;
// Hours 00:xx … (END_HOUR%24 - 1):xx belong to the next calendar day
const POST_MIDNIGHT_MAX_HOUR = END_HOUR % 24; // = 2

function isPostMidnight(time) {
  if (!time) return false;
  return parseInt(time.split(":")[0], 10) < POST_MIDNIGHT_MAX_HOUR;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Handles post-midnight times: "00:30" → 1470 instead of 30, so they position correctly after 24h
function timeToCalMin(timeStr) {
  const min = timeToMinutes(timeStr);
  return min < START_MIN ? min + 24 * 60 : min;
}

function minutesToTime(min) {
  const clamped = Math.max(START_MIN, Math.min(END_HOUR * 60 - 1, min));
  const h = Math.floor(clamped / 60) % 24;
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toTopPct(timeStr) {
  return `${((timeToCalMin(timeStr) - START_MIN) / TOTAL_MINS) * 100}%`;
}

function toHeightPct(startStr, endStr) {
  return `${((timeToCalMin(endStr) - timeToCalMin(startStr)) / TOTAL_MINS) * 100}%`;
}

// Assigns each timed event a column index so that overlapping events share space side by side.
function computeLayout(timedEvents) {
  if (timedEvents.length === 0) return [];
  const getStart = (e) => timeToCalMin(e.time);
  const getEnd = (e) =>
    e.endTime ? timeToCalMin(e.endTime) : timeToCalMin(e.time) + 30;
  const overlaps = (a, b) => getStart(a) < getEnd(b) && getEnd(a) > getStart(b);

  const sorted = [...timedEvents].sort((a, b) => getStart(a) - getStart(b));

  // Greedy column assignment: place each event in the first column where no overlap exists
  const colEnds = []; // colEnds[c] = end time of the last event placed in column c
  const colOf = new Map();
  for (const ev of sorted) {
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= getStart(ev)) {
        colEnds[c] = getEnd(ev);
        colOf.set(ev.id, c);
        placed = true;
        break;
      }
    }
    if (!placed) {
      colOf.set(ev.id, colEnds.length);
      colEnds.push(getEnd(ev));
    }
  }

  // For each event, totalCols = highest column index among all events overlapping with it, + 1
  return sorted.map((ev) => {
    const colIndex = colOf.get(ev.id);
    let maxCol = colIndex;
    for (const other of sorted) {
      if (other.id !== ev.id && overlaps(ev, other)) {
        const c = colOf.get(other.id);
        if (c > maxCol) maxCol = c;
      }
    }
    return { ...ev, _colIndex: colIndex, _totalCols: maxCol + 1 };
  });
}

export default function WeekPlanner({ weekOffset, setWeekOffset }) {
  const weekKey = getWeekKey(weekOffset);
  const [weekData, setWeekData] = useLocalStorage(
    weekKey,
    Array.from({ length: 7 }, () => []),
  );
  const [recurring, setRecurring] = useLocalStorage(
    "planner_recurring",
    getDefaultRecurring(),
  );
  const [exceptions, setExceptions] = useLocalStorage(
    "planner_recurring_exceptions",
    [],
  );
  const [recurringDone, setRecurringDone] = useLocalStorage(
    "planner_recurring_done",
    [],
  );
  const [recurringOverrides, setRecurringOverrides] = useLocalStorage(
    "planner_recurring_overrides",
    {},
  );
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState(null); // { original, updated, storedDay }
  const days = getDaysOfWeek(weekOffset);
  const [dailyGoals, setDailyGoals] = useLocalStorage("planner_daily_goals", {});
  const [editingGoal, setEditingGoal] = useState(null); // { dayIndex, text, linkedEventId }
  const [activeFormDay, setActiveFormDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showSlotFinder, setShowSlotFinder] = useState(false);
  const [deletingRecurring, setDeletingRecurring] = useState(null); // { activity, dayIndex }

  // ── Drag state ──────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null); // { targetDayIndex, newTime, newEndTime }
  const dragRef = useRef(null); // { activity, dayIndex, offsetY, startX, startY, isDragging, currentPreview }
  const dayColRefs = useRef([]); // refs to each .cal-day-col element
  const applyDropRef = useRef(null);

  // Migration: add missing default recurring entries — runs only once ever (flag in localStorage)
  useEffect(() => {
    if (localStorage.getItem("planner_migration_v1")) return;
    const defaults = getDefaultRecurring();
    const existingIds = new Set(recurring.map((r) => r.id));
    const missing = defaults.filter((d) => !existingIds.has(d.id));
    if (missing.length > 0) {
      setRecurring((prev) => [...prev, ...missing]);
    }
    localStorage.setItem("planner_migration_v1", "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cursor style during drag
  useEffect(() => {
    if (isDragging) document.body.classList.add("dragging-activity");
    else document.body.classList.remove("dragging-activity");
    return () => document.body.classList.remove("dragging-activity");
  }, [isDragging]);

  const getActivitiesForDay = (dayIndex) => {
    // Current day: exclude post-midnight events (they show in next day's column)
    const recurringForDay = recurring
      .filter((r) => r.days.includes(dayIndex))
      .filter((r) => !exceptions.includes(`${r.id}|${weekKey}|${dayIndex}`))
      .map((r) => {
        const key = `${r.id}|${weekKey}|${dayIndex}`;
        const ov = recurringOverrides[key];
        return { ...r, ...(ov || {}), _recurring: true, _storedDayIndex: dayIndex };
      })
      .filter((r) => !isPostMidnight(r.time));
    const weekActivities = (weekData[dayIndex] || [])
      .filter((a) => !String(a.id).startsWith("default_"))
      .filter((a) => !isPostMidnight(a.time))
      .map((a) => ({ ...a, _storedDayIndex: dayIndex }));

    // Next day: its post-midnight events (00:xx–01:xx) appear at the bottom of this column
    // e.g. Wednesday 01:00 is the tail of Tuesday's column
    const nextIdx = dayIndex + 1;
    const nextMidnight = nextIdx < 7 ? [
      ...recurring
        .filter((r) => r.days.includes(nextIdx))
        .filter((r) => !exceptions.includes(`${r.id}|${weekKey}|${nextIdx}`))
        .filter((r) => isPostMidnight(r.time))
        .map((r) => ({ ...r, _recurring: true, _storedDayIndex: nextIdx })),
      ...(weekData[nextIdx] || [])
        .filter((a) => !String(a.id).startsWith("default_"))
        .filter((a) => isPostMidnight(a.time))
        .map((a) => ({ ...a, _storedDayIndex: nextIdx })),
    ] : [];

    return [...recurringForDay, ...weekActivities, ...nextMidnight];
  };

  // ── Drag: compute preview from mouse position ──────────────────
  const computePreview = (clientX, clientY) => {
    const ds = dragRef.current;
    if (!ds) return null;
    let targetDayIndex = ds.visualDayIndex;
    let colRect = null;
    for (let i = 0; i < dayColRefs.current.length; i++) {
      const r = dayColRefs.current[i]?.getBoundingClientRect();
      if (r && clientX >= r.left && clientX <= r.right) {
        targetDayIndex = i;
        colRect = r;
        break;
      }
    }
    if (!colRect)
      colRect = dayColRefs.current[targetDayIndex]?.getBoundingClientRect();
    if (!colRect) return null;

    const relY = clientY - colRect.top - ds.offsetY;
    const ratio = Math.max(0, Math.min(1, relY / colRect.height));
    const snappedMin = Math.round((ratio * TOTAL_MINS) / 15) * 15;
    const absoluteStartMin = Math.max(
      START_MIN,
      Math.min(END_HOUR * 60 - 15, START_MIN + snappedMin),
    );
    const newTime = minutesToTime(absoluteStartMin);

    let newEndTime = ds.activity.endTime || "";
    if (ds.activity.time && ds.activity.endTime) {
      const duration =
        timeToCalMin(ds.activity.endTime) - timeToCalMin(ds.activity.time);
      newEndTime = minutesToTime(
        Math.min(END_HOUR * 60 - 1, absoluteStartMin + duration),
      );
    }
    return { targetDayIndex, newTime, newEndTime };
  };

  // ── Drag: apply drop ──────────────────────────────────────────
  const applyDrop = (ds, p) => {
    if (!p) return;
    const { newTime, newEndTime, targetDayIndex } = p;
    const { activity, dayIndex: sourceDayIndex } = ds;
    // Post-midnight drops belong to the next day's storage
    // (dropping to Tuesday 01:00 stores in Wednesday, since that slot is Wednesday early morning)
    const actualTargetDay = isPostMidnight(newTime) && targetDayIndex < 6
      ? targetDayIndex + 1
      : targetDayIndex;

    if (activity._recurring) {
      // Move only this week's occurrence: suppress the original and add a one-time copy
      const sourceKey = `${activity.id}|${weekKey}|${sourceDayIndex}`;
      setExceptions((prev) => [...prev.filter((k) => k !== sourceKey), sourceKey]);
      const moved = { ...activity, id: Date.now(), time: newTime, endTime: newEndTime };
      delete moved._recurring;
      delete moved._storedDayIndex;
      setWeekData((prev) => {
        const updated = [...prev];
        updated[actualTargetDay] = [...(updated[actualTargetDay] || []), moved];
        return updated;
      });
    } else if (actualTargetDay !== sourceDayIndex) {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[sourceDayIndex] = updated[sourceDayIndex].filter(
          (a) => a.id !== activity.id,
        );
        const moved = { ...activity, time: newTime, endTime: newEndTime };
        delete moved._recurring;
        delete moved._storedDayIndex;
        updated[actualTargetDay] = [...(updated[actualTargetDay] || []), moved];
        return updated;
      });
    } else {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[sourceDayIndex] = updated[sourceDayIndex].map((a) =>
          a.id === activity.id
            ? { ...a, time: newTime, endTime: newEndTime }
            : a,
        );
        return updated;
      });
    }
  };

  applyDropRef.current = applyDrop;

  // ── Global mouse events ────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e) => {
      const ds = dragRef.current;
      if (!ds) return;
      if (!ds.isDragging) {
        if (
          Math.abs(e.clientX - ds.startX) > 4 ||
          Math.abs(e.clientY - ds.startY) > 4
        ) {
          ds.isDragging = true;
          setIsDragging(true);
        } else return;
      }
      const p = computePreview(e.clientX, e.clientY);
      ds.currentPreview = p;
      setPreview(p);
    };

    const onMouseUp = () => {
      const ds = dragRef.current;
      if (ds) {
        if (ds.isDragging) {
          applyDropRef.current(ds, ds.currentPreview);
          setIsDragging(false);
          setPreview(null);
        } else {
          // Short click → open edit
          setEditingActivity({ activity: ds.activity, dayIndex: ds.dayIndex });
        }
      }
      dragRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleBlockMouseDown = (activity, visualDayIndex, e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const blockRect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      activity,
      dayIndex: activity._storedDayIndex, // source = stored day for correct writes
      visualDayIndex,
      startX: e.clientX,
      startY: e.clientY,
      offsetY: e.clientY - blockRect.top,
      isDragging: false,
      currentPreview: null,
    };
  };

  // ── CRUD handlers ──────────────────────────────────────────────
  const handleAdd = (visualDayIndex, activity) => {
    const storedDay = isPostMidnight(activity.time) && visualDayIndex < 6
      ? visualDayIndex + 1
      : visualDayIndex;
    setWeekData((prev) => {
      const updated = [...prev];
      updated[storedDay] = [...(updated[storedDay] || []), activity];
      return updated;
    });
  };

  const handleAddRecurring = (activity) => {
    const { days: recurDays, ...activityData } = activity;
    setRecurring((prev) => [
      ...prev,
      { ...activityData, id: `recur_${Date.now()}`, days: recurDays },
    ]);
  };

  const handleEdit = (updatedActivity) => {
    const { activity } = editingActivity;
    if (activity._recurring) {
      // Show choice dialog before saving
      setPendingRecurringEdit({ original: activity, updated: updatedActivity });
      setEditingActivity(null);
    } else {
      const storedDay = activity._storedDayIndex;
      setWeekData((prev) => {
        const next = [...prev];
        next[storedDay] = next[storedDay].map((a) =>
          a.id === activity.id ? { ...a, ...updatedActivity } : a,
        );
        return next;
      });
      setEditingActivity(null);
    }
  };

  const applyRecurringEditAll = () => {
    const { original, updated } = pendingRecurringEdit;
    setRecurring((prev) =>
      prev.map((r) =>
        r.id === original.id
          ? { id: r.id, title: updated.title, time: updated.time, endTime: updated.endTime, color: updated.color, days: updated.days ?? r.days }
          : r,
      ),
    );
    setPendingRecurringEdit(null);
  };

  const applyRecurringEditOne = () => {
    const { original, updated } = pendingRecurringEdit;
    const key = `${original.id}|${weekKey}|${original._storedDayIndex}`;
    setRecurringOverrides((prev) => ({
      ...prev,
      [key]: { title: updated.title, time: updated.time, endTime: updated.endTime, color: updated.color },
    }));
    setPendingRecurringEdit(null);
  };

  const handleDelete = (activity, e) => {
    e.stopPropagation();
    const storedDay = activity._storedDayIndex;
    setWeekData((prev) => {
      const updated = [...prev];
      updated[storedDay] = updated[storedDay].filter((a) => a.id !== activity.id);
      return updated;
    });
  };

  const handleDeleteRecurringOne = (activity, dayIndex) => {
    setExceptions((prev) => [...prev, `${activity.id}|${weekKey}|${dayIndex}`]);
  };

  const handleDeleteRecurringAll = (recurringId) => {
    setRecurring((prev) => prev.filter((r) => r.id !== recurringId));
  };

  const isToday = (date) =>
    date && new Date().toDateString() === date.toDateString();
  const formatDate = (d) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const hasUnscheduled = days.some((_, i) =>
    getActivitiesForDay(i).some((a) => !a.time),
  );

  // Precompute layouts for all days (used in both header and body)
  const dayLayouts = days.map((_, i) => {
    const timedAll = getActivitiesForDay(i).filter((a) => a.time);
    return computeLayout(timedAll);
  });

  // ── Done / past helpers ─────────────────────────────────────────
  const isDoneActivity = (activity) => {
    // If goals are linked to this activity, done = all linked goals are done
    const linkedGoals = days.flatMap((_, di) =>
      getGoalsForDay(di).filter((g) => String(g.linkedEventId) === String(activity.id))
    );
    if (linkedGoals.length > 0) return linkedGoals.every((g) => g.done);
    const storedDay = activity._storedDayIndex;
    if (activity._recurring)
      return recurringDone.includes(`${activity.id}|${weekKey}|${storedDay}`);
    return !!activity.done;
  };

  const handleToggleDone = (activity, visualDayIndex, e) => {
    e.stopPropagation();
    const storedDay = activity._storedDayIndex;
    const newDone = !isDoneActivity(activity);
    if (activity._recurring) {
      const key = `${activity.id}|${weekKey}|${storedDay}`;
      setRecurringDone((prev) =>
        newDone ? [...prev, key] : prev.filter((k) => k !== key),
      );
    } else {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[storedDay] = updated[storedDay].map((a) =>
          a.id === activity.id ? { ...a, done: newDone } : a,
        );
        return updated;
      });
    }
    // Sync ALL goals across all days linked to this activity
    days.forEach((_, di) => {
      const dGoals = getGoalsForDay(di);
      const hasLinked = dGoals.some((g) => String(g.linkedEventId) === String(activity.id));
      if (hasLinked)
        setGoalsForDay(di, dGoals.map((g) =>
          String(g.linkedEventId) === String(activity.id) ? { ...g, done: newDone } : g,
        ));
    });
  };

  const isPastEvent = (date, endTime, time) => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < today) return true;
    if (d.getTime() === today.getTime()) {
      const t = endTime || time;
      if (t) {
        const [h, m] = t.split(":").map(Number);
        const eventEnd = new Date(now);
        eventEnd.setHours(h, m, 0, 0);
        return eventEnd < now;
      }
    }
    return false;
  };

  // ── Daily goals helpers ─────────────────────────────────────────
  const dayKey = (i) => days[i].toISOString().split("T")[0];

  // Goals are stored as an array per day; handle legacy single-object format
  const getGoalsForDay = (i) => {
    const g = dailyGoals[dayKey(i)];
    if (!g) return [];
    if (Array.isArray(g)) return g;
    return g.text ? [{ id: "legacy", text: g.text, done: g.done ?? false, linkedEventId: g.linkedEventId ?? null }] : [];
  };

  const setGoalsForDay = (i, goals) =>
    setDailyGoals((prev) => ({ ...prev, [dayKey(i)]: goals }));

  const saveGoal = (i, goalId, text, linkedEventId) => {
    if (!text.trim()) {
      setGoalsForDay(i, getGoalsForDay(i).filter((g) => g.id !== goalId));
    } else if (goalId) {
      setGoalsForDay(i, getGoalsForDay(i).map((g) =>
        g.id === goalId ? { ...g, text: text.trim(), linkedEventId: linkedEventId || null } : g,
      ));
    } else {
      setGoalsForDay(i, [...getGoalsForDay(i), { id: Date.now() + 1, text: text.trim(), done: false, linkedEventId: linkedEventId || null }]);
    }
    setEditingGoal(null);
  };

  const toggleGoalDone = (i, goalId) => {
    const goals = getGoalsForDay(i);
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const newDone = !goal.done;
    const updatedGoals = goals.map((g) => g.id === goalId ? { ...g, done: newDone } : g);
    setGoalsForDay(i, updatedGoals);

    if (!goal.linkedEventId) return;
    const linked = getActivitiesForDay(i).find((a) => String(a.id) === String(goal.linkedEventId));
    if (!linked) return;

    // Event is done only when ALL goals across all days linked to it are done
    const allLinkedGoals = days.flatMap((_, di) => {
      const dGoals = di === i ? updatedGoals : getGoalsForDay(di);
      return dGoals.filter((g) => String(g.linkedEventId) === String(goal.linkedEventId));
    });
    const allDone = allLinkedGoals.length > 0 && allLinkedGoals.every((g) => g.done);

    const storedDay = linked._storedDayIndex;
    if (linked._recurring) {
      const key = `${linked.id}|${weekKey}|${storedDay}`;
      setRecurringDone((prev) => allDone ? [...prev.filter((k) => k !== key), key] : prev.filter((k) => k !== key));
    } else {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[storedDay] = updated[storedDay].map((a) =>
          String(a.id) === String(goal.linkedEventId) ? { ...a, done: allDone } : a,
        );
        return updated;
      });
    }
  };

  const deleteGoal = (i, goalId) =>
    setGoalsForDay(i, getGoalsForDay(i).filter((g) => g.id !== goalId));

  const moveGoalToDay = (fromDay, goalId, toDay) => {
    const goal = getGoalsForDay(fromDay).find((g) => g.id === goalId);
    if (!goal) return;
    setGoalsForDay(fromDay, getGoalsForDay(fromDay).filter((g) => g.id !== goalId));
    setGoalsForDay(toDay, [...getGoalsForDay(toDay), goal]);
  };

  const moveGoal = (i, goalId, dir) => {
    const goals = getGoalsForDay(i);
    const idx = goals.findIndex((g) => g.id === goalId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= goals.length) return;
    const updated = [...goals];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setGoalsForDay(i, updated);
  };

  // ── À confirmer ────────────────────────────────────────────────
  const isPastDay = (date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const reportEvent = (activity) => {
    const storedDay = activity._storedDayIndex;
    if (activity._recurring) {
      const key = `${activity.id}|${weekKey}|${storedDay}`;
      setRecurringOverrides((prev) => ({
        ...prev,
        [key]: { ...(prev[key] || {}), time: "", endTime: "" },
      }));
    } else {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[storedDay] = updated[storedDay].map((a) =>
          a.id === activity.id ? { ...a, time: "", endTime: "" } : a,
        );
        return updated;
      });
    }
  };

  const reportGoal = (fromDayIdx, goal) => {
    const todayIdx = days.findIndex((d) => isToday(d));
    if (todayIdx >= 0 && todayIdx !== fromDayIdx) {
      setGoalsForDay(todayIdx, [
        ...getGoalsForDay(todayIdx),
        { id: Date.now(), text: goal.text, done: false, linkedEventId: null },
      ]);
    }
  };

  const confirmItems = [];
  days.forEach((date, i) => {
    getActivitiesForDay(i)
      .filter((a) => a.time && !isDoneActivity(a))
      .forEach((a) => {
        const actualDate = days[a._storedDayIndex] ?? date;
        if (isPastEvent(actualDate, a.endTime, a.time))
          confirmItems.push({ type: "event", activity: a, dayIndex: i });
      });
    if (isPastDay(date)) {
      getGoalsForDay(i)
        .filter((g) => !g.done)
        .forEach((g) => confirmItems.push({ type: "goal", goal: g, dayIndex: i }));
    }
  });

  // ── Render helpers ─────────────────────────────────────────────
  const renderDoneBtn = (activity, i) => {
    const done = isDoneActivity(activity);
    return (
      <button
        className={`done-toggle-btn${done ? " done-active" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => handleToggleDone(activity, i, e)}
        title={done ? "Marquer comme non effectué" : "Marquer comme effectué"}
      >
        ✓
      </button>
    );
  };

  const renderDeleteBtn = (activity) => (
    <button
      className="activity-delete"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (activity._recurring) {
          setDeletingRecurring({ activity, dayIndex: activity._storedDayIndex });
        } else {
          handleDelete(activity, e);
        }
      }}
      title="Supprimer"
    >
      ×
    </button>
  );

  return (
    <div className="week-planner">
      <div className="week-nav">
        <div className="week-nav-controls">
          <button onClick={() => setWeekOffset((o) => o - 1)}>
            ← Précédente
          </button>
          <span className="week-label">{formatWeekLabel(weekOffset)}</span>
          <button onClick={() => setWeekOffset((o) => o + 1)}>
            Suivante →
          </button>
          {weekOffset !== 0 && (
            <button className="week-nav-today" onClick={() => setWeekOffset(0)}>
              Aujourd'hui
            </button>
          )}
        </div>
        <button
          className="week-nav-find-slot"
          onClick={() => setShowSlotFinder(true)}
        >
          Créneau libre
        </button>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-header">
          <div className="time-gutter-header" />
          {days.map((date, i) => {
            const hasOverlap = dayLayouts[i].some((a) => a._totalCols > 1);
            return (
              <div
                key={i}
                className={`cal-day-header ${isToday(date) ? "today" : ""}`}
              >
                <span className="day-name">{DAY_NAMES[i]}</span>
                <span className="day-date">{formatDate(date)}</span>
                {hasOverlap && (
                  <span className="overlap-badge" title="Des événements se superposent sur ce jour">⚠</span>
                )}
                <button
                  className="add-activity-btn"
                  onClick={() => setActiveFormDay(i)}
                >
                  + Ajouter
                </button>
              </div>
            );
          })}
        </div>

        <div className="goals-row">
          <div className="goals-gutter" />
          {days.map((_, i) => {
            const goals = getGoalsForDay(i);
            const timedActivities = getActivitiesForDay(i).filter((a) => a.time).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={i} className="goals-cell">
                {goals.map((goal, idx) => {
                  const isEditing = editingGoal?.dayIndex === i && editingGoal?.goalId === goal.id;
                  const linked = goal.linkedEventId
                    ? timedActivities.find((a) => String(a.id) === String(goal.linkedEventId))
                    : null;
                  if (isEditing) {
                    return (
                      <div key={goal.id} className="goal-edit-form">
                        <div className="goal-edit-top">
                          <input
                            className="goal-input"
                            autoFocus
                            value={editingGoal.text}
                            onChange={(e) => setEditingGoal((g) => ({ ...g, text: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveGoal(i, goal.id, editingGoal.text, editingGoal.linkedEventId, null);
                              if (e.key === "Escape") setEditingGoal(null);
                            }}
                            placeholder={goal.text}
                          />
                          <button className="goal-save-btn" onMouseDown={() => saveGoal(i, goal.id, editingGoal.text, editingGoal.linkedEventId, null)}>✓</button>
                          <button className="goal-cancel-btn" onMouseDown={() => setEditingGoal(null)}>✕</button>
                        </div>
                        {timedActivities.length > 0 && (
                          <select
                            className="goal-link-select"
                            value={editingGoal.linkedEventId || ""}
                            onChange={(e) => setEditingGoal((g) => ({ ...g, linkedEventId: e.target.value || null }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveGoal(i, goal.id, editingGoal.text, editingGoal.linkedEventId, null);
                              if (e.key === "Escape") setEditingGoal(null);
                            }}
                          >
                            <option value="">— Lier à un événement —</option>
                            {timedActivities.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title} ({a.time}{a.endTime ? `–${a.endTime}` : ""})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div key={goal.id} className={`goal-item${goal.done ? " goal-done" : ""}`}>
                      <span className="goal-priority">{idx + 1}</span>
                      <input
                        type="checkbox"
                        className="goal-checkbox"
                        checked={goal.done}
                        onChange={() => toggleGoalDone(i, goal.id)}
                      />
                      {linked && (
                        <span
                          className="goal-link-badge"
                          style={{ borderColor: linked.color, color: linked.color, backgroundColor: linked.color + "18" }}
                          title={`Lié à : ${linked.title} (${linked.time})`}
                        >
                          {linked.title}
                        </span>
                      )}
                      <span
                        className="goal-text"
                        onClick={() => setEditingGoal({ dayIndex: i, goalId: goal.id, text: goal.text, linkedEventId: goal.linkedEventId || null })}
                        title="Cliquer pour modifier"
                      >
                        {goal.text}
                      </span>
                      <div className="goal-actions">
                        {i > 0 && (
                          <button className="goal-move-btn" onMouseDown={(e) => e.stopPropagation()} onClick={() => moveGoalToDay(i, goal.id, i - 1)} title="Jour précédent">←</button>
                        )}
                        {i < 6 && (
                          <button className="goal-move-btn" onMouseDown={(e) => e.stopPropagation()} onClick={() => moveGoalToDay(i, goal.id, i + 1)} title="Jour suivant">→</button>
                        )}
                        {idx > 0 && (
                          <button className="goal-move-btn" onMouseDown={(e) => e.stopPropagation()} onClick={() => moveGoal(i, goal.id, -1)} title="Monter">↑</button>
                        )}
                        {idx < goals.length - 1 && (
                          <button className="goal-move-btn" onMouseDown={(e) => e.stopPropagation()} onClick={() => moveGoal(i, goal.id, 1)} title="Descendre">↓</button>
                        )}
                        <button className="goal-delete-btn" onMouseDown={(e) => e.stopPropagation()} onClick={() => deleteGoal(i, goal.id)} title="Supprimer">×</button>
                      </div>
                    </div>
                  );
                })}
                <button
                  className="goal-add-btn"
                  onClick={() => setEditingGoal({ dayIndex: i, goalId: null, text: "", linkedEventId: null })}
                >
                  + Objectif
                </button>
                {editingGoal?.dayIndex === i && editingGoal?.goalId === null && (
                  <div className="goal-edit-form">
                    <div className="goal-edit-top">
                      <input
                        className="goal-input"
                        autoFocus
                        value={editingGoal.text}
                        onChange={(e) => setEditingGoal((g) => ({ ...g, text: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveGoal(i, null, editingGoal.text, editingGoal.linkedEventId, null);
                          if (e.key === "Escape") setEditingGoal(null);
                        }}
                        placeholder="Objectif…"
                      />
                      <button className="goal-save-btn" onMouseDown={() => saveGoal(i, null, editingGoal.text, editingGoal.linkedEventId, null)}>✓</button>
                      <button className="goal-cancel-btn" onMouseDown={() => setEditingGoal(null)}>✕</button>
                    </div>
                    {timedActivities.length > 0 && (
                      <select
                        className="goal-link-select"
                        value={editingGoal.linkedEventId || ""}
                        onChange={(e) => setEditingGoal((g) => ({ ...g, linkedEventId: e.target.value || null }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveGoal(i, null, editingGoal.text, editingGoal.linkedEventId, null);
                          if (e.key === "Escape") setEditingGoal(null);
                        }}
                      >
                        <option value="">— Lier à un événement —</option>
                        {timedActivities.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title} ({a.time}{a.endTime ? `–${a.endTime}` : ""})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="calendar-body">
          <div className="time-gutter">
            {HOURS.map((h) => (
              <div key={h} className="hour-slot">
                <span className="hour-label">
                  {String(h % 24).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {days.map((date, i) => {
            const timedWithLayout = dayLayouts[i];
            const timedFull = timedWithLayout.filter((a) => a.endTime);
            const timedStart = timedWithLayout.filter((a) => !a.endTime);
            const isGhostCol = isDragging && preview?.targetDayIndex === i;

            const overlapStyle = (a) => {
              if (a._totalCols <= 1) return {};
              const w = 100 / a._totalCols;
              return {
                left: `calc(${a._colIndex * w}% + 2px)`,
                width: `calc(${w}% - 4px)`,
                right: "auto",
                zIndex: a._colIndex + 1,
              };
            };

            return (
              <div
                key={i}
                ref={(el) => (dayColRefs.current[i] = el)}
                className={`cal-day-col ${isToday(date) ? "today" : ""}`}
              >
                {HOURS.map((h, idx) => (
                  <div
                    key={h}
                    className="hour-line"
                    style={{ top: `${(idx / HOURS.length) * 100}%` }}
                  />
                ))}

                {/* Ghost block dans la colonne cible */}
                {isGhostCol && preview.newTime && (
                  <div
                    className="cal-activity-block drag-ghost"
                    style={{
                      top: toTopPct(preview.newTime),
                      height: preview.newEndTime
                        ? toHeightPct(preview.newTime, preview.newEndTime)
                        : `${(30 / TOTAL_MINS) * 100}%`,
                      borderLeftColor:
                        dragRef.current?.activity.color ?? "#4f8ef7",
                      backgroundColor:
                        (dragRef.current?.activity.color ?? "#4f8ef7") + "30",
                      pointerEvents: "none",
                    }}
                  >
                    <span className="cal-activity-time">
                      {preview.newTime}
                      {preview.newEndTime ? ` – ${preview.newEndTime}` : ""}
                    </span>
                    <span className="cal-activity-title">
                      {dragRef.current?.activity.title}
                    </span>
                  </div>
                )}

                {timedFull.map((activity) => {
                  const beingDragged =
                    isDragging && dragRef.current?.activity.id === activity.id;
                  const durationMin =
                    timeToCalMin(activity.endTime) -
                    timeToCalMin(activity.time);
                  const isCompact = durationMin < 75;
                  const done = isDoneActivity(activity);
                  const actualDate = days[activity._storedDayIndex] ?? date;
                  const missed = !done && isPastEvent(actualDate, activity.endTime, activity.time);
                  return (
                    <div
                      key={activity.id}
                      className={`cal-activity-block${isCompact ? " block-compact" : ""}${beingDragged ? " is-dragging" : ""}${done ? " is-done" : ""}${missed ? " is-missed" : ""}`}
                      style={{
                        top: toTopPct(activity.time),
                        height: toHeightPct(activity.time, activity.endTime),
                        backgroundColor: activity.color + "25",
                        borderLeftColor: activity.color,
                        ...overlapStyle(activity),
                      }}
                      onMouseDown={(e) => handleBlockMouseDown(activity, i, e)}
                    >
                      {isCompact ? (
                        <div
                          className="cal-compact-row"
                          title={`${activity.time} – ${activity.endTime}`}
                        >
                          {activity._recurring && (
                            <span className="recur-icon">↻ </span>
                          )}
                          <span className="cal-activity-title">
                            {activity.title}
                          </span>
                          {missed && <span className="missed-badge" title="Non effectué">!</span>}
                          <span className="cal-compact-time">
                            {activity.time}
                          </span>
                          {renderDoneBtn(activity, i)}
                          {renderDeleteBtn(activity, i)}
                        </div>
                      ) : (
                        <>
                          <div className="cal-block-header">
                            <span className="cal-activity-time">
                              {activity._recurring && (
                                <span className="recur-icon">↻ </span>
                              )}
                              {activity.time} – {activity.endTime}
                            </span>
                            <div className="cal-block-actions">
                              {missed && <span className="missed-badge" title="Non effectué">!</span>}
                              {renderDoneBtn(activity, i)}
                              {renderDeleteBtn(activity, i)}
                            </div>
                          </div>
                          <span className="cal-activity-title">
                            {activity.title}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}

                {timedStart.map((activity) => {
                  const beingDragged =
                    isDragging && dragRef.current?.activity.id === activity.id;
                  const done = isDoneActivity(activity);
                  const actualDate = days[activity._storedDayIndex] ?? date;
                  const missed = !done && isPastEvent(actualDate, null, activity.time);
                  return (
                    <div
                      key={activity.id}
                      className={`cal-activity-pill${beingDragged ? " is-dragging" : ""}${done ? " is-done" : ""}${missed ? " is-missed" : ""}`}
                      style={{
                        top: toTopPct(activity.time),
                        backgroundColor: activity.color + "25",
                        borderLeftColor: activity.color,
                        ...overlapStyle(activity),
                      }}
                      onMouseDown={(e) => handleBlockMouseDown(activity, i, e)}
                    >
                      <span className="cal-activity-time">
                        {activity._recurring && (
                          <span className="recur-icon">↻ </span>
                        )}
                        {activity.time}
                      </span>
                      <span className="cal-activity-title">
                        {activity.title}
                      </span>
                      {renderDoneBtn(activity, i)}
                      {renderDeleteBtn(activity, i)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {confirmItems.length > 0 && (
          <div className="confirm-row">
            <div className="confirm-row-label">À confirmer</div>
            <div className="confirm-items">
              {confirmItems.map((item, idx) =>
                item.type === "event" ? (
                  <div key={idx} className="confirm-item">
                    <span className="confirm-dot" style={{ backgroundColor: item.activity.color }} />
                    <span className="confirm-day">{DAY_NAMES[item.dayIndex]}</span>
                    <span className="confirm-title">{item.activity.title}</span>
                    {item.activity.time && (
                      <span className="confirm-time">{item.activity.time}</span>
                    )}
                    <button
                      className="confirm-validate-btn"
                      onClick={(e) => handleToggleDone(item.activity, item.dayIndex, e)}
                    >
                      Valider
                    </button>
                    <button
                      className="confirm-report-btn"
                      onClick={() => reportEvent(item.activity)}
                    >
                      Reporter
                    </button>
                  </div>
                ) : (
                  <div key={idx} className="confirm-item">
                    <span className="confirm-dot" style={{ backgroundColor: "#9b59b6" }} />
                    <span className="confirm-day">{DAY_NAMES[item.dayIndex]}</span>
                    <span className="confirm-title">{item.goal.text}</span>
                    <span className="confirm-badge">Objectif</span>
                    <button
                      className="confirm-validate-btn"
                      onClick={() => toggleGoalDone(item.dayIndex, item.goal.id)}
                    >
                      Valider
                    </button>
                    <button
                      className="confirm-report-btn"
                      onClick={() => reportGoal(item.dayIndex, item.goal)}
                    >
                      Reporter
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {hasUnscheduled && (
          <div className="unscheduled-row">
            <div className="unscheduled-label">Sans horaire</div>
            {days.map((_, i) => (
              <div key={i} className="unscheduled-day">
                {getActivitiesForDay(i)
                  .filter((a) => !a.time)
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="activity-card"
                      style={{
                        borderLeftColor: activity.color,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setEditingActivity({ activity, dayIndex: i })
                      }
                    >
                      {activity._recurring && (
                        <span className="recur-icon">↻ </span>
                      )}
                      <span className="activity-title">{activity.title}</span>
                      {renderDeleteBtn(activity, i)}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeFormDay !== null && (
        <ActivityForm
          dayIndex={activeFormDay}
          existingActivities={getActivitiesForDay(activeFormDay).filter((a) => a.time)}
          onAdd={(activity) => handleAdd(activeFormDay, activity)}
          onAddRecurring={handleAddRecurring}
          onClose={() => setActiveFormDay(null)}
        />
      )}

      {editingActivity !== null && (
        <ActivityForm
          dayIndex={editingActivity.dayIndex}
          activity={editingActivity.activity}
          existingActivities={getActivitiesForDay(editingActivity.dayIndex).filter(
            (a) => a.time && a.id !== editingActivity.activity.id,
          )}
          onEdit={handleEdit}
          onClose={() => setEditingActivity(null)}
        />
      )}

{showSlotFinder && (
        <SlotFinderModal
          days={days}
          existingColors={days.flatMap((_, i) => getActivitiesForDay(i).map((a) => a.color))}
          findSlots={(durationMin) => findFreeSlots(weekData, recurring, durationMin, days)}
          onConfirm={(dayIndex, activity) => handleAdd(dayIndex, activity)}
          onClose={() => setShowSlotFinder(false)}
        />
      )}

      {pendingRecurringEdit !== null && (
        <div className="activity-form-overlay" onClick={() => setPendingRecurringEdit(null)}>
          <div className="confirm-recur-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-recur-title">
              Modifier <strong>"{pendingRecurringEdit.original.title}"</strong>
            </p>
            <p className="confirm-recur-sub">
              Modifier uniquement cette occurrence ou toute la série ?
            </p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setPendingRecurringEdit(null)}>
                Annuler
              </button>
              <button className="btn-secondary" onClick={applyRecurringEditOne}>
                Cette occurrence
              </button>
              <button className="btn-primary" onClick={applyRecurringEditAll}>
                Toute la série
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingRecurring !== null && (
        <div
          className="activity-form-overlay"
          onClick={() => setDeletingRecurring(null)}
        >
          <div
            className="confirm-recur-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="confirm-recur-title">
              Supprimer <strong>"{deletingRecurring.activity.title}"</strong>
            </p>
            <p className="confirm-recur-sub">
              Supprimer uniquement cette occurrence ou toute la série ?
            </p>
            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeletingRecurring(null)}
              >
                Annuler
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  handleDeleteRecurringOne(
                    deletingRecurring.activity,
                    deletingRecurring.dayIndex,
                  );
                  setDeletingRecurring(null);
                }}
              >
                Cette occurrence
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  handleDeleteRecurringAll(deletingRecurring.activity.id);
                  setDeletingRecurring(null);
                }}
              >
                Toute la série
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
