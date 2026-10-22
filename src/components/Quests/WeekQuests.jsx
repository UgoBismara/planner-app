import { useState } from 'react';
import { MAX_WEEK_GOALS, domainOf, weekCount, weekTarget } from '../../data/quests';
import './WeekQuests.css';

// Bandeau « Objectifs de la semaine » en haut de la Semaine : quêtes hebdomadaires
// (compteur remis à zéro le lundi) et objectifs précis propres à cette semaine.
// Purement présentationnel, l'état vit dans WeekPlanner.
export default function WeekQuests({
  recurring,
  week,
  canCount,
  weekStreak,
  suggestions,
  onSetCount,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onAcceptAdjust,
  onDismissAdjust,
}) {
  const [draft, setDraft] = useState(null); // null = saisie fermée
  const goals = week?.goals ?? [];
  const total = recurring.length + goals.length;
  const done =
    recurring.filter((q) => weekCount(q, week) >= weekTarget(q, week)).length +
    goals.filter((g) => g.done).length;

  const submit = (e) => {
    e.preventDefault();
    const label = draft.trim();
    if (label) onAddGoal(label);
    setDraft(null);
  };

  return (
    <div className={`week-quests${total > 0 && done === total ? ' succeeded' : ''}`}>
      <div className="week-quests-head">
        <span className="week-quests-title">
          🗓️ Objectifs de la semaine
          {total > 0 && <span className="week-quests-count"> {done}/{total}{done === total && ' ✓'}</span>}
        </span>
        {weekStreak > 0 && (
          <span className="week-quests-streak" title="Semaines réussies d’affilée">
            🔥 {weekStreak} sem.
          </span>
        )}
      </div>

      {total > 0 && (
        <div className="week-quests-items">
          {recurring.map((q) => {
            const count = weekCount(q, week);
            const target = weekTarget(q, week);
            const suggestion = suggestions[q.id];
            return (
              <div key={q.id} className="week-quest">
                <div className={`week-quest-row${count >= target ? ' done' : ''}`}>
                  <span className="week-quest-label">
                    🔁 {domainOf(q.domain).icon} {q.label}
                  </span>
                  <span className="week-quest-dots">
                    {Array.from({ length: target }, (_, i) => (
                      <button
                        key={i}
                        className={`week-quest-dot${i < count ? ' filled' : ''}`}
                        // Toucher le dernier rond plein le vide, sinon on remplit jusqu'à lui
                        onClick={() => onSetCount(q.id, i + 1 === count ? i : i + 1)}
                        disabled={!canCount}
                        aria-label={`${i + 1} sur ${target}`}
                      />
                    ))}
                    <span className="week-quest-ratio">
                      {count}/{target}
                    </span>
                  </span>
                </div>
                {suggestion && (
                  <div className="week-quest-suggest">
                    {suggestion.dir === 'down'
                      ? `Raté 2 semaines de suite : passer à ${suggestion.to}/sem. ?`
                      : `Réussi 3 semaines de suite : monter à ${suggestion.to}/sem. ?`}
                    <button onClick={() => onAcceptAdjust(q.id, suggestion.to)}>Oui</button>
                    <button onClick={() => onDismissAdjust(q.id)}>Non</button>
                  </div>
                )}
              </div>
            );
          })}
          {goals.map((g) => (
            <div key={g.id} className={`week-quest-row${g.done ? ' done' : ''}`}>
              <label className="week-quest-label week-goal-label">
                <input
                  type="checkbox"
                  className="week-goal-checkbox"
                  checked={g.done}
                  onChange={() => onToggleGoal(g.id)}
                />
                📌 {g.label}
              </label>
              <button
                className="week-goal-delete"
                onClick={() => onDeleteGoal(g.id)}
                title="Supprimer"
                aria-label="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {draft !== null ? (
        <form className="week-goal-form" onSubmit={submit}>
          <input
            className="week-goal-input"
            autoFocus
            placeholder="Objectif précis et atteignable (ex. nager 400 m sans m’arrêter)"
            value={draft}
            maxLength={80}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setDraft(null)}
          />
          <button type="submit" className="week-goal-save" disabled={!draft.trim()}>
            OK
          </button>
        </form>
      ) : (
        goals.length < MAX_WEEK_GOALS && (
          <button className="week-goal-add" onClick={() => setDraft('')}>
            + Objectif précis
          </button>
        )
      )}
    </div>
  );
}
