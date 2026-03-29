import { useState } from 'react';

const DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 h', value: 60 },
  { label: '1 h 30', value: 90 },
  { label: '2 h', value: 120 },
  { label: '2 h 30', value: 150 },
  { label: '3 h', value: 180 },
];
const DAY_NAMES_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function minutesToTime(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

function formatDate(d) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function calcDuration(time, endTime) {
  if (!time || !endTime) return 60;
  const [sh, sm] = time.split(':').map(Number);
  let [eh, em] = endTime.split(':').map(Number);
  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin <= startMin) endMin += 24 * 60;
  const diff = endMin - startMin;
  return diff > 0 ? diff : 60;
}

function nearestDuration(min) {
  const values = DURATIONS.map((d) => d.value);
  return values.reduce((prev, curr) => Math.abs(curr - min) < Math.abs(prev - min) ? curr : prev);
}

export default function RescheduleModal({ activity, days, findSlots, onConfirm, onClose }) {
  const initialDuration = nearestDuration(calcDuration(activity.time, activity.endTime));
  const [durationMin, setDurationMin] = useState(initialDuration);
  const [slots, setSlots] = useState(null);
  const [slotIndex, setSlotIndex] = useState(0);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = findSlots(durationMin);
    setSlots(found);
    setSlotIndex(0);
  };

  const handleConfirm = () => {
    const slot = slots[slotIndex];
    onConfirm(slot.dayIndex, minutesToTime(slot.start), minutesToTime(slot.end));
    onClose();
  };

  const currentSlot = slots?.[slotIndex];

  return (
    <div className="activity-form-overlay" onClick={onClose}>
      <div className="activity-form" onClick={(e) => e.stopPropagation()}>
        <h3>Reporter « {activity.title} »</h3>

        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Durée</label>
            <div className="duration-picker">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`duration-btn ${durationMin === d.value ? 'active' : ''}`}
                  onClick={() => { setDurationMin(d.value); setSlots(null); }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary slot-search-btn">
            Rechercher un créneau
          </button>
        </form>

        {slots !== null && (
          <div className="slot-suggestion">
            {slots.length === 0 ? (
              <p className="slot-none">Aucun créneau disponible cette semaine.</p>
            ) : (
              <>
                <div className="slot-result" style={{ borderLeftColor: activity.color }}>
                  <div className="slot-day">
                    {DAY_NAMES_FULL[currentSlot.dayIndex]}
                    <span className="slot-date">{formatDate(days[currentSlot.dayIndex])}</span>
                  </div>
                  <div className="slot-time">
                    {minutesToTime(currentSlot.start)} – {minutesToTime(currentSlot.end)}
                  </div>
                  {slots.length > 1 && (
                    <div className="slot-counter">{slotIndex + 1} / {slots.length}</div>
                  )}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setSlotIndex((i) => (i + 1) % slots.length)}
                    >
                      Suivant →
                    </button>
                  )}
                  <button type="button" className="btn-primary" onClick={handleConfirm}>
                    ✓ Planifier
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {slots === null && (
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
          </div>
        )}
      </div>
    </div>
  );
}
