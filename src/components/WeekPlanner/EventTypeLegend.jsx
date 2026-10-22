import { EVENT_TYPES, formatDuration } from '../../data/eventTypes';

// Légende des types au-dessus du planning : couleur, temps passé sur la semaine affichée.
// Cliquer sur un type le met en avant (les autres s'estompent), recliquer l'annule.
export default function EventTypeLegend({ minutesByType, highlighted, onHighlight }) {
  const entries = [
    ...EVENT_TYPES.map((t) => ({ ...t, minutes: minutesByType[t.id] ?? 0 })),
    { id: 'none', label: 'Sans type', icon: '', color: '#8b90a8', minutes: minutesByType.none ?? 0 },
  ].filter((t) => t.id !== 'none' || t.minutes > 0);

  return (
    <div className="type-legend" role="toolbar" aria-label="Types d’événements">
      {entries.map((t) => (
        <button
          key={t.id}
          className={`type-legend-item${highlighted === t.id ? ' active' : ''}${t.minutes === 0 ? ' empty' : ''}`}
          style={{ '--type-color': t.color }}
          onClick={() => onHighlight(highlighted === t.id ? null : t.id)}
          title={highlighted === t.id ? 'Tout afficher' : `Mettre en avant : ${t.label}`}
        >
          {t.icon ? <span className="type-legend-icon">{t.icon}</span> : <span className="type-legend-dot" />}
          {t.label}
          {t.minutes > 0 && <span className="type-legend-time">{formatDuration(t.minutes)}</span>}
        </button>
      ))}
    </div>
  );
}
