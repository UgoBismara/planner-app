import { useState } from 'react';
import ActivityForm from './ActivityForm';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function DayColumn({ dayIndex, date, activities, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);

  const isToday = date && new Date().toDateString() === date.toDateString();

  const formatDate = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const sortedActivities = [...activities].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className={`day-column ${isToday ? 'today' : ''}`}>
      <div className="day-header">
        <span className="day-name">{DAY_NAMES[dayIndex]}</span>
        <span className="day-date">{formatDate(date)}</span>
      </div>
      <div className="activities-list">
        {sortedActivities.map((activity) => (
          <div
            key={activity.id}
            className="activity-card"
            style={{ borderLeftColor: activity.color }}
          >
            {activity.time && (
              <span className="activity-time">
                {activity.time}{activity.endTime ? ` – ${activity.endTime}` : ''}
              </span>
            )}
            <span className="activity-title">{activity.title}</span>
            <button
              className="activity-delete"
              onClick={() => onDelete(activity.id)}
              title="Supprimer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button className="add-activity-btn" onClick={() => setShowForm(true)}>
        + Ajouter
      </button>
      {showForm && (
        <ActivityForm
          onAdd={(activity) => onAdd(dayIndex, activity)}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
