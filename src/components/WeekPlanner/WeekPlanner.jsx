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

function findFreeSlots(
  weekData,
  recurring,
  durationMin,
  searchStart = 8 * 60,
  searchEnd = 22 * 60,
) {
  const slots = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
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
        merged[merged.length - 1][1] = Math.max(
          merged[merged.length - 1][1],
          e,
        );
      }
    }
    let cursor = searchStart;
    for (const [busyStart, busyEnd] of merged) {
      if (busyStart - cursor >= durationMin) {
        slots.push({ dayIndex, start: cursor, end: cursor + durationMin });
      }
      cursor = Math.max(cursor, busyEnd);
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

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min) {
  const clamped = Math.max(START_MIN, Math.min(END_HOUR * 60 - 1, min));
  const h = Math.floor(clamped / 60) % 24;
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toTopPct(timeStr) {
  return `${((timeToMinutes(timeStr) - START_MIN) / TOTAL_MINS) * 100}%`;
}

function toHeightPct(startStr, endStr) {
  return `${((timeToMinutes(endStr) - timeToMinutes(startStr)) / TOTAL_MINS) * 100}%`;
}

// Assigns each timed event a column index so that overlapping events share space side by side.
function computeLayout(timedEvents) {
  if (timedEvents.length === 0) return [];
  const getStart = (e) => timeToMinutes(e.time);
  const getEnd = (e) =>
    e.endTime ? timeToMinutes(e.endTime) : timeToMinutes(e.time) + 30;
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
  const days = getDaysOfWeek(weekOffset);
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
    const recurringForDay = recurring
      .filter((r) => r.days.includes(dayIndex))
      .filter((r) => !exceptions.includes(`${r.id}|${weekKey}|${dayIndex}`))
      .map((r) => ({ ...r, _recurring: true }));
    const weekActivities = (weekData[dayIndex] || []).filter(
      (a) => !String(a.id).startsWith("default_"),
    );
    return [...recurringForDay, ...weekActivities];
  };

  // ── Drag: compute preview from mouse position ──────────────────
  const computePreview = (clientX, clientY) => {
    const ds = dragRef.current;
    if (!ds) return null;
    let targetDayIndex = ds.dayIndex;
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
        timeToMinutes(ds.activity.endTime) - timeToMinutes(ds.activity.time);
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
    const { activity, dayIndex } = ds;

    if (activity._recurring) {
      setRecurring((prev) =>
        prev.map((r) =>
          r.id === activity.id
            ? { ...r, time: newTime, endTime: newEndTime }
            : r,
        ),
      );
    } else if (targetDayIndex !== dayIndex) {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[dayIndex] = updated[dayIndex].filter(
          (a) => a.id !== activity.id,
        );
        const moved = { ...activity, time: newTime, endTime: newEndTime };
        delete moved._recurring;
        updated[targetDayIndex] = [...(updated[targetDayIndex] || []), moved];
        return updated;
      });
    } else {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[dayIndex] = updated[dayIndex].map((a) =>
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

  const handleBlockMouseDown = (activity, dayIndex, e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const blockRect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      activity,
      dayIndex,
      startX: e.clientX,
      startY: e.clientY,
      offsetY: e.clientY - blockRect.top,
      isDragging: false,
      currentPreview: null,
    };
  };

  // ── CRUD handlers ──────────────────────────────────────────────
  const handleAdd = (dayIndex, activity) => {
    setWeekData((prev) => {
      const updated = [...prev];
      updated[dayIndex] = [...(updated[dayIndex] || []), activity];
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
    const { activity, dayIndex } = editingActivity;
    if (activity._recurring) {
      setRecurring((prev) =>
        prev.map((r) =>
          r.id === activity.id
            ? {
                id: r.id,
                title: updatedActivity.title,
                time: updatedActivity.time,
                endTime: updatedActivity.endTime,
                color: updatedActivity.color,
                days: updatedActivity.days ?? r.days,
              }
            : r,
        ),
      );
    } else {
      setWeekData((prev) => {
        const updated = [...prev];
        updated[dayIndex] = updated[dayIndex].map((a) =>
          a.id === activity.id ? { ...a, ...updatedActivity } : a,
        );
        return updated;
      });
    }
    setEditingActivity(null);
  };

  const handleDelete = (dayIndex, activityId, e) => {
    e.stopPropagation();
    setWeekData((prev) => {
      const updated = [...prev];
      updated[dayIndex] = updated[dayIndex].filter((a) => a.id !== activityId);
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

  // ── Render helpers ─────────────────────────────────────────────
  const renderDeleteBtn = (activity, i) => (
    <button
      className="activity-delete"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (activity._recurring) {
          setDeletingRecurring({ activity, dayIndex: i });
        } else {
          handleDelete(i, activity.id, e);
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
          {days.map((date, i) => (
            <div
              key={i}
              className={`cal-day-header ${isToday(date) ? "today" : ""}`}
            >
              <span className="day-name">{DAY_NAMES[i]}</span>
              <span className="day-date">{formatDate(date)}</span>
              <button
                className="add-activity-btn"
                onClick={() => setActiveFormDay(i)}
              >
                + Ajouter
              </button>
            </div>
          ))}
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
            const activities = getActivitiesForDay(i);
            const timedAll = activities.filter((a) => a.time);
            const timedWithLayout = computeLayout(timedAll);
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
                    timeToMinutes(activity.endTime) -
                    timeToMinutes(activity.time);
                  const isCompact = durationMin < 45;
                  return (
                    <div
                      key={activity.id}
                      className={`cal-activity-block${isCompact ? " block-compact" : ""}${beingDragged ? " is-dragging" : ""}`}
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
                          <span className="cal-compact-time">
                            {activity.time}
                          </span>
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
                            {renderDeleteBtn(activity, i)}
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
                  return (
                    <div
                      key={activity.id}
                      className={`cal-activity-pill${beingDragged ? " is-dragging" : ""}`}
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
                      {renderDeleteBtn(activity, i)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

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
          onAdd={(activity) => handleAdd(activeFormDay, activity)}
          onAddRecurring={handleAddRecurring}
          onClose={() => setActiveFormDay(null)}
        />
      )}

      {editingActivity !== null && (
        <ActivityForm
          dayIndex={editingActivity.dayIndex}
          activity={editingActivity.activity}
          onEdit={handleEdit}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {showSlotFinder && (
        <SlotFinderModal
          days={days}
          findSlots={(durationMin) =>
            findFreeSlots(weekData, recurring, durationMin)
          }
          onConfirm={(dayIndex, activity) => handleAdd(dayIndex, activity)}
          onClose={() => setShowSlotFinder(false)}
        />
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
