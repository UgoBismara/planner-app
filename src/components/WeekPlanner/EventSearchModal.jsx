import { useState } from 'react';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Purement présentationnel : la recherche elle-même vit dans WeekPlanner, qui a
// accès aux semaines stockées et aux récurrences.
export default function EventSearchModal({ onSearch, onPick, onClose }) {
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const tooShort = trimmed.length === 1;
  const results = tooShort ? [] : onSearch(trimmed);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="activity-form-overlay" onClick={onClose}>
      <div className="evsearch-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="evsearch-head">
          <input
            type="text"
            className="evsearch-input"
            placeholder="Rechercher un événement…"
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <button className="evsearch-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {trimmed.length === 0 ? (
          <p className="evsearch-hint">
            Cherche par titre, dans toutes les semaines enregistrées.
          </p>
        ) : tooShort ? (
          <p className="evsearch-hint">Encore une lettre…</p>
        ) : results.length === 0 ? (
          <p className="evsearch-hint">Aucun événement ne correspond.</p>
        ) : (
          <ul className="evsearch-results">
            {results.map((r) => {
              const past = r._date && r._date < today;
              return (
                <li key={r._key}>
                  <button
                    className={`evsearch-result${past ? ' is-past' : ''}`}
                    onClick={() => r._date && onPick(r._date)}
                    disabled={!r._date}
                  >
                    <span
                      className="evsearch-dot"
                      style={{ background: r.color || '#4f8ef7' }}
                    />
                    <span className="evsearch-title">{r.title}</span>
                    <span className="evsearch-meta">
                      {r._date ? (
                        <>
                          {formatDate(r._date)}
                          {r.time ? ` · ${r.time}` : ''}
                        </>
                      ) : (
                        <>
                          récurrent ·{' '}
                          {(r.days || [])
                            .slice()
                            .sort((a, b) => a - b)
                            .map((d) => DAY_LABELS[d])
                            .join(' ')}
                          {r.time ? ` · ${r.time}` : ''}
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
