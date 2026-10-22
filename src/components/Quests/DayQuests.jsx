import { ENERGY_LEVELS, INSTALL_DAYS, domainOf } from '../../data/quests';
import './DayQuests.css';

// Bloc « Quêtes » d'une case jour de la Semaine. Purement présentationnel :
// l'état vit dans WeekPlanner pour que les 7 jours partagent le même journal.
// installing = { [questId]: jours cochés } pour les habitudes en cours d'installation.
export default function DayQuests({
  quests,
  day,
  isToday,
  streak,
  installing,
  onSetLevel,
  onSetEnergy,
}) {
  if (quests.length === 0) return null;
  const validated = quests.every((q) => day.done[q.id]);

  return (
    <div className={`day-quests${validated ? ' validated' : ''}`}>
      <div className="day-quests-head">
        <span className="day-quests-title">
          🏆 Quêtes{isToday && streak > 0 ? ` 🔥${streak}` : ''}
          {validated && ' ✓'}
        </span>
        <span className="day-quests-energy">
          {ENERGY_LEVELS.map((e) => (
            <button
              key={e.id}
              className={`day-quests-energy-btn${day.energy === e.id ? ' active' : ''}`}
              onClick={() => onSetEnergy(day.energy === e.id ? null : e.id)}
              title={`Batterie ${e.label.toLowerCase()} : ${e.hint}`}
            >
              {e.icon}
            </button>
          ))}
        </span>
      </div>
      {quests.map((q) => {
        const level = day.done[q.id];
        return (
          <div key={q.id} className={`day-quest${level ? ' done' : ''}`}>
            <span
              className="day-quest-label"
              title={q.minimum ? `Minimum : ${q.minimum}` : q.label}
            >
              {domainOf(q.domain).icon} {q.label}
              {q.id in installing && (
                <span className="day-quest-install">
                  {' '}🌱{installing[q.id]}/{INSTALL_DAYS}
                </span>
              )}
            </span>
            <span className="day-quest-levels">
              {q.minimum ? (
                <>
                  <button
                    className={`day-quest-level${level === 'min' ? ' active' : ''}`}
                    onClick={() => onSetLevel(q.id, 'min')}
                    title={`Minimum : ${q.minimum}`}
                  >
                    Min
                  </button>
                  <button
                    className={`day-quest-level${level && level !== 'min' ? ' active' : ''}`}
                    onClick={() => onSetLevel(q.id, 'normal')}
                    title={q.label}
                  >
                    Fait
                  </button>
                </>
              ) : (
                <button
                  className={`day-quest-level${level ? ' active' : ''}`}
                  onClick={() => onSetLevel(q.id, 'normal')}
                  aria-label={level ? 'Décocher' : 'Cocher'}
                >
                  ✓
                </button>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
