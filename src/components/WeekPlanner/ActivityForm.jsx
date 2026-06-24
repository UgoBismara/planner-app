import { useState } from 'react';

const COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00897B', '#D81B60', '#F9A825', '#00ACC1', '#7CB342', '#3949AB', '#6D4C41'];
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function toMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function hasTimeOverlap(time, endTime, existing) {
  if (!time || !existing?.length) return false;
  const start = toMin(time);
  const end = endTime ? toMin(endTime) : start + 30;
  return existing.some((a) => {
    if (!a.time) return false;
    const aStart = toMin(a.time);
    const aEnd = a.endTime ? toMin(a.endTime) : aStart + 30;
    return start < aEnd && end > aStart;
  });
}

function pickDistinctColor(usedColors) {
  return COLORS.find((c) => !usedColors.includes(c)) ?? COLORS[0];
}

export default function ActivityForm({ dayIndex, days, activity, existingActivities, onAdd, onAddRecurring, onEdit, onClose }) {
  const isEditMode = !!activity;
  const effectiveDayIndex = activity?._isContinuation ? activity._storedDayIndex : (dayIndex ?? 0);

  const [title, setTitle] = useState(activity?.title ?? '');
  const [isAllDay, setIsAllDay] = useState(isEditMode && !activity.time);
  const [time, setTime] = useState(activity?.time ?? '');
  const [endTime, setEndTime] = useState(activity?.endTime ?? '');
  const [color, setColor] = useState(
    activity?.color ?? pickDistinctColor((existingActivities || []).map((a) => a.color))
  );
  const [isRecurring, setIsRecurring] = useState(activity?._recurring ?? false);
  const [recurDays, setRecurDays] = useState(activity?.days ?? [effectiveDayIndex]);
  const [endDayOffset, setEndDayOffset] = useState(activity?.endDayOffset ?? 0);

  const toggleDay = (d) => {
    setRecurDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const base = {
      title: title.trim(),
      time: isAllDay ? '' : time,
      endTime: isAllDay ? '' : endTime,
      color,
      id: activity?.id ?? Date.now(),
      ...(isAllDay ? { allDay: true } : {}),
      ...(endDayOffset > 0 && !isRecurring && !isAllDay ? { endDayOffset } : {}),
    };

    if (isEditMode) {
      onEdit({ ...base, days: isRecurring ? recurDays : undefined });
    } else if (isRecurring) {
      onAddRecurring({ ...base, days: recurDays.length > 0 ? recurDays : [effectiveDayIndex] });
    } else {
      onAdd(base);
    }
    onClose();
  };

  const maxOffset = 30; // max 31 days span

  // Day name labels for the end-day select
  const endDayOptions = days
    ? [
        { value: 0, label: 'Même jour' },
        ...Array.from({ length: maxOffset }, (_, k) => {
          const offset = k + 1;
          const d = days[effectiveDayIndex + offset];
          const label = d
            ? d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            : `J+${offset}`;
          return { value: offset, label: label.charAt(0).toUpperCase() + label.slice(1) };
        }),
      ]
    : [{ value: 0, label: 'Même jour' }];

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

          <div className="form-group recur-toggle">
            <label>
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => {
                  setIsAllDay(e.target.checked);
                  if (e.target.checked) { setTime(''); setEndTime(''); setEndDayOffset(0); }
                }}
              />
              Toute la journée
            </label>
          </div>

          {!isAllDay && (
            <>
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
              {endDayOffset === 0 && hasTimeOverlap(time, endTime, existingActivities) && (
                <p className="overlap-warning">⚠ Ce créneau se superpose à une activité existante.</p>
              )}
              {!isRecurring && maxOffset > 0 && (
                <div className="form-group">
                  <label>Durée (jours)</label>
                  <input
                    type="number"
                    min={1}
                    max={maxOffset + 1}
                    value={endDayOffset + 1}
                    onChange={(e) => setEndDayOffset(Math.min(maxOffset, Math.max(0, Number(e.target.value) - 1)))}
                  />
                </div>
              )}
            </>
          )}

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
            <>
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
            </>
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
