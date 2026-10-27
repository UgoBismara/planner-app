import { useState } from 'react';
import {
  ENERGY_LEVELS,
  INSTALL_DAYS,
  MAX_WEEK_GOALS,
  dailyStartKey,
  domainOf,
  weekCount,
  weekTarget,
} from '../../data/quests';
import './WeekQuests.css';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Toucher une case : fait → minimum (si la quête en a un) → vide
const nextLevel = (q, level) => {
  if (!level) return 'normal';
  if (level !== 'min' && q.minimum) return 'min';
  return null;
};

// Bandeau « Objectifs de la semaine » en haut de la Semaine : quêtes quotidiennes
// (une case par jour), quêtes hebdomadaires (compteur remis à zéro le lundi) et
// objectifs précis propres à cette semaine. Purement présentationnel, l'état vit
// dans WeekPlanner. dayKeys et dayLog suivent les 7 jours, du lundi au dimanche.
// installing = { [questId]: jours cochés } pour les habitudes en cours d'installation.
export default function WeekQuests({
  daily,
  dayKeys,
  dayLog,
  todayKey,
  dayStreak,
  installing,
  onSetLevel,
  onSetEnergy,
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
  const todayIndex = dayKeys.indexOf(todayKey);
  const todayEnergy = todayIndex >= 0 ? dayLog[todayIndex].energy : null;

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
        <span className="week-quests-side">
          {daily.length > 0 && todayIndex >= 0 && (
            <span className="week-quests-energy">
              {ENERGY_LEVELS.map((e) => (
                <button
                  key={e.id}
                  className={`week-quests-energy-btn${todayEnergy === e.id ? ' active' : ''}`}
                  onClick={() => onSetEnergy(todayEnergy === e.id ? null : e.id)}
                  title={`Batterie du jour ${e.label.toLowerCase()} : ${e.hint}`}
                >
                  {e.icon}
                </button>
              ))}
            </span>
          )}
          {daily.length > 0 && dayStreak > 0 && (
            <span className="week-quests-streak" title="Jours validés d’affilée">
              🔥 {dayStreak} j
            </span>
          )}
          {weekStreak > 0 && (
            <span className="week-quests-streak" title="Semaines réussies d’affilée">
              🔥 {weekStreak} sem.
            </span>
          )}
        </span>
      </div>

      {daily.length + total > 0 && (
        <div className="week-quests-items">
          {daily.map((q) => {
            const start = dailyStartKey(q);
            const open = dayKeys.map((key) => key >= start && key <= todayKey);
            const levels = dayLog.map((day) => day.done[q.id]);
            const allDone = open.every((o, i) => !o || levels[i]);
            return (
              <div key={q.id} className={`week-quest-row${allDone ? ' done' : ''}`}>
                <span
                  className="week-quest-label"
                  title={q.minimum ? `Minimum : ${q.minimum}` : q.label}
                >
                  {domainOf(q.domain).icon} {q.label}
                  {q.id in installing && (
                    <span className="week-quest-install">
                      {' '}🌱{installing[q.id]}/{INSTALL_DAYS}
                    </span>
                  )}
                </span>
                <span className="week-quest-days">
                  {dayKeys.map((key, i) => {
                    const level = levels[i];
                    const state = !level
                      ? 'à cocher'
                      : level === 'min'
                        ? `minimum (${q.minimum})`
                        : 'fait';
                    const levelClass = !level ? '' : level === 'min' ? ' min' : ' filled';
                    return (
                      <button
                        key={key}
                        className={`week-quest-day${levelClass}${key === todayKey ? ' today' : ''}`}
                        onClick={() => onSetLevel(i, q.id, nextLevel(q, level))}
                        disabled={!open[i]}
                        title={`${DAY_NAMES[i]} : ${state}`}
                      >
                        {level === 'min' ? 'm' : DAY_LETTERS[i]}
                      </button>
                    );
                  })}
                </span>
              </div>
            );
          })}
          {recurring.map((q) => {
            const count = weekCount(q, week);
            const target = weekTarget(q, week);
            const suggestion = suggestions[q.id];
            // Cible atteinte : un rond de plus pour compter au-delà (3/2)
            const dots = Math.max(target, count) + (count >= target ? 1 : 0);
            return (
              <div key={q.id} className="week-quest">
                <div className={`week-quest-row${count >= target ? ' done' : ''}`}>
                  <span className="week-quest-label">
                    🔁 {domainOf(q.domain).icon} {q.label}
                  </span>
                  <span className="week-quest-dots">
                    {Array.from({ length: dots }, (_, i) => (
                      <button
                        key={i}
                        className={`week-quest-dot${i < count ? ' filled' : ''}${i >= target ? ' extra' : ''}`}
                        // Toucher le dernier rond plein le vide, sinon on remplit jusqu'à lui
                        onClick={() => onSetCount(q.id, i + 1 === count ? i : i + 1)}
                        disabled={!canCount}
                        aria-label={i < target ? `${i + 1} sur ${target}` : `${i + 1}, au-delà de l’objectif`}
                        title={i >= count && i >= target ? 'Une de plus que prévu' : undefined}
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
