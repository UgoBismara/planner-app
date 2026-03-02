import { useState } from 'react';

const COLORS = ['#4f8ef7', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c', '#f39c12'];
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function ActivityForm({ dayIndex, activity, onAdd, onAddRecurring, onEdit, onClose }) {
  const isEditMode = !!activity;

  const [title, setTitle] = useState(activity?.title ?? '');
  const [time, setTime] = useState(activity?.time ?? '');
  const [endTime, setEndTime] = useState(activity?.endTime ?? '');
  const [color, setColor] = useState(activity?.color ?? COLORS[0]);
  const [isRecurring, setIsRecurring] = useState(activity?._recurring ?? false);
  const [recurDays, setRecurDays] = useState(activity?.days ?? [dayIndex ?? 0]);

  const toggleDay = (d) => {
    setRecurDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const base = { title: title.trim(), time, endTime, color, id: activity?.id ?? Date.now() };

    if (isEditMode) {
      onEdit({ ...base, days: isRecurring ? recurDays : undefined });
    } else if (isRecurring) {
      onAddRecurring({ ...base, days: recurDays.length > 0 ? recurDays : [dayIndex ?? 0] });
    } else {
      onAdd(base);
    }
    onClose();
  };

  return (
    <div className="activity-form-overlay" onClick={onClose}>
      <div className="activity-form" onClick={(e) => e.stopPropagation()}>
        <h3>{isEditMode ? 'Modifier l\'activité' : 'Nouvelle activité'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titre *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réunion, Sport, Cours..."
            />
          </div>
          <div className="form-group form-group-inline">
            <div>
              <label>Début (optionnel)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div>
              <label>Fin (optionnel)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Couleur</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${c === color ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="form-group recur-toggle">
            <label>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={isEditMode}
              />
              Répéter chaque semaine
              {isEditMode && isRecurring && <span className="recur-edit-note"> (récurrence)</span>}
            </label>
          </div>
          {isRecurring && (
            <div className="form-group">
              <label>Jours</label>
              <div className="recur-days-picker">
                {DAY_LABELS.map((name, d) => (
                  <button
                    key={d}
                    type="button"
                    className={`recur-day-btn ${recurDays.includes(d) ? 'active' : ''}`}
                    onClick={() => toggleDay(d)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">
              {isEditMode ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
