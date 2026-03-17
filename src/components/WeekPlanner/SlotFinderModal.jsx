import { useState } from 'react';

const COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00897B', '#D81B60', '#F9A825', '#00ACC1', '#7CB342', '#3949AB', '#6D4C41'];
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

function pickDistinctColor(usedColors) {
  return COLORS.find((c) => !usedColors.includes(c)) ?? COLORS[0];
}

export default function SlotFinderModal({ days, initialTitle = '', existingColors = [], findSlots, onConfirm, onClose }) {
  const [title, setTitle] = useState(initialTitle);
  const [durationMin, setDurationMin] = useState(60);
  const [color, setColor] = useState(() => pickDistinctColor(existingColors));
  const [slots, setSlots] = useState(null);
  const [slotIndex, setSlotIndex] = useState(0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const found = findSlots(durationMin);
    setSlots(found);
    setSlotIndex(0);
  };

  const handleConfirm = () => {
    const slot = slots[slotIndex];
    onConfirm(slot.dayIndex, {
      title: title.trim(),
      time: minutesToTime(slot.start),
      endTime: minutesToTime(slot.end),
      color,
      id: Date.now(),
    });
    onClose();
  };

  const currentSlot = slots?.[slotIndex];

  return (
    <div className="activity-form-overlay" onClick={onClose}>
      <div className="activity-form" onClick={(e) => e.stopPropagation()}>
        <h3>Trouver un créneau</h3>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Activité *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSlots(null); }}
              placeholder="Ex: Lecture, Sport, Cours..."
            />
          </div>
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
          <button type="submit" className="btn-primary slot-search-btn" disabled={!title.trim()}>
            Rechercher un créneau
          </button>
        </form>

        {slots !== null && (
          <div className="slot-suggestion">
            {slots.length === 0 ? (
              <p className="slot-none">Aucun créneau disponible cette semaine.</p>
            ) : (
              <>
                <div className="slot-result" style={{ borderLeftColor: color }}>
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
