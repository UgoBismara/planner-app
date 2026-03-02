import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ActivityForm from './ActivityForm';
import './WeekPlanner.css';

function getWeekKey(weekOffset) {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + weekOffset * 7);
  const year = monday.getFullYear();
  const week = getWeekNumber(monday);
  return `planner_week_${year}_${String(week).padStart(2, '0')}`;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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
  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  if (weekOffset === 0) return `Cette semaine (${fmt(first)} – ${fmt(last)})`;
  if (weekOffset === -1) return `Semaine dernière`;
  if (weekOffset === 1) return `Semaine prochaine`;
  return `${fmt(first)} – ${fmt(last)}`;
}

function getDefaultWeekData() {
  return Array.from({ length: 7 }, (_, i) => {
    if (i >= 5) return [];
    return [
      { title: 'Travail', time: '09:00', endTime: '12:30', color: '#4f8ef7', id: `default_am_${i}` },
      { title: 'Travail', time: '14:00', endTime: '17:30', color: '#4f8ef7', id: `default_pm_${i}` },
    ];
  });
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const START_HOUR = 7;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const TOTAL_MINS = (END_HOUR - START_HOUR) * 60;
const START_MIN = START_HOUR * 60;

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function toTopPct(timeStr) {
  return `${((timeToMinutes(timeStr) - START_MIN) / TOTAL_MINS) * 100}%`;
}

function toHeightPct(startStr, endStr) {
  return `${((timeToMinutes(endStr) - timeToMinutes(startStr)) / TOTAL_MINS) * 100}%`;
}

export default function WeekPlanner({ weekOffset, setWeekOffset }) {
  const weekKey = getWeekKey(weekOffset);
  const [weekData, setWeekData] = useLocalStorage(weekKey, getDefaultWeekData());
  const days = getDaysOfWeek(weekOffset);
  const [activeFormDay, setActiveFormDay] = useState(null);

  const handleAdd = (dayIndex, activity) => {
    setWeekData((prev) => {
      const updated = [...prev];
      updated[dayIndex] = [...(updated[dayIndex] || []), activity];
      return updated;
    });
  };

  const handleDelete = (dayIndex, activityId) => {
    setWeekData((prev) => {
      const updated = [...prev];
      updated[dayIndex] = updated[dayIndex].filter((a) => a.id !== activityId);
      return updated;
    });
  };

  const isToday = (date) => date && new Date().toDateString() === date.toDateString();

  const formatDate = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const hasUnscheduled = days.some((_, i) => (weekData[i] || []).some((a) => !a.time));

  return (
    <div className="week-planner">
      <div className="week-nav">
        <button onClick={() => setWeekOffset((o) => o - 1)}>← Précédente</button>
        <span className="week-label">{formatWeekLabel(weekOffset)}</span>
        <button onClick={() => setWeekOffset((o) => o + 1)}>Suivante →</button>
      </div>

      <div className="calendar-wrapper">
        {/* Ligne des en-têtes de jours */}
        <div className="calendar-header">
          <div className="time-gutter-header" />
          {days.map((date, i) => (
            <div key={i} className={`cal-day-header ${isToday(date) ? 'today' : ''}`}>
              <span className="day-name">{DAY_NAMES[i]}</span>
              <span className="day-date">{formatDate(date)}</span>
              <button className="add-activity-btn" onClick={() => setActiveFormDay(i)}>
                + Ajouter
              </button>
            </div>
          ))}
        </div>

        {/* Corps scrollable : timeline */}
        <div className="calendar-body">
          {/* Colonne des heures */}
          <div className="time-gutter">
            {HOURS.map((h) => (
              <div key={h} className="hour-slot">
                <span className="hour-label">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Colonnes des jours */}
          {days.map((date, i) => {
            const activities = weekData[i] || [];
            const timedFull = activities.filter((a) => a.time && a.endTime);
            const timedStart = activities.filter((a) => a.time && !a.endTime);

            return (
              <div
                key={i}
                className={`cal-day-col ${isToday(date) ? 'today' : ''}`}
              >
                {/* Lignes d'heures */}
                {HOURS.map((h, idx) => (
                  <div
                    key={h}
                    className="hour-line"
                    style={{ top: `${(idx / HOURS.length) * 100}%` }}
                  />
                ))}

                {/* Blocs avec plage horaire complète */}
                {timedFull.map((activity) => (
                  <div
                    key={activity.id}
                    className="cal-activity-block"
                    style={{
                      top: toTopPct(activity.time),
                      height: toHeightPct(activity.time, activity.endTime),
                      backgroundColor: activity.color + '25',
                      borderLeftColor: activity.color,
                    }}
                  >
                    <div className="cal-block-header">
                      <span className="cal-activity-time">
                        {activity.time} – {activity.endTime}
                      </span>
                      <button
                        className="activity-delete"
                        onClick={() => handleDelete(i, activity.id)}
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <span className="cal-activity-title">{activity.title}</span>
                  </div>
                ))}

                {/* Pilules avec heure de début seulement */}
                {timedStart.map((activity) => (
                  <div
                    key={activity.id}
                    className="cal-activity-pill"
                    style={{
                      top: toTopPct(activity.time),
                      backgroundColor: activity.color + '25',
                      borderLeftColor: activity.color,
                    }}
                  >
                    <span className="cal-activity-time">{activity.time}</span>
                    <span className="cal-activity-title">{activity.title}</span>
                    <button
                      className="activity-delete"
                      onClick={() => handleDelete(i, activity.id)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Activités sans horaire */}
        {hasUnscheduled && (
          <div className="unscheduled-row">
            <div className="unscheduled-label">Sans horaire</div>
            {days.map((_, i) => (
              <div key={i} className="unscheduled-day">
                {(weekData[i] || [])
                  .filter((a) => !a.time)
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="activity-card"
                      style={{ borderLeftColor: activity.color }}
                    >
                      <span className="activity-title">{activity.title}</span>
                      <button
                        className="activity-delete"
                        onClick={() => handleDelete(i, activity.id)}
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeFormDay !== null && (
        <ActivityForm
          onAdd={(activity) => handleAdd(activeFormDay, activity)}
          onClose={() => setActiveFormDay(null)}
        />
      )}
    </div>
  );
}
