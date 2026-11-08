import { useState } from 'react';
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Flag, Info, TriangleAlert, X } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { QUESTS_KEY, WEEK_LOG_KEY, dateKey, daysLeft, weekKeyOf, parseDateKey } from '../../data/quests';
import { RECURRING_KEY, RECURRING_OVERRIDES_KEY } from '../../data/questsPlan';
import {
  DRILLS,
  MILESTONES,
  M_RACE,
  PHASES,
  SESSIONS,
  SWIM_BLOCKS_KEY,
  SWIM_MILESTONES_KEY,
  SWIM_TIPS,
  S_RACE,
  blockLabel,
  currentPhase,
  currentSession,
  lastMissedSession,
  phaseDates,
  phaseVolumeRange,
  shortDayLabel,
} from '../../data/swimPlan';
import {
  findSwimEvent,
  isSessionDone,
  occurrenceKey,
  swimTitlesImported,
  triStepDone,
  withSwimCount,
  withSwimEvent,
  withSwimTitles,
  withTriStep,
  withUpgradedTriQuest,
} from '../../data/swimSync';
import './SwimBoard.css';

const RECURRING_DONE_KEY = 'planner_recurring_done';

const shortDate = (key) =>
  parseDateKey(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const formatMeters = (m) => (m >= 1000 ? `${(m / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km` : `${m} m`);

// Onglet « Natation » : le programme crawl → triathlon S puis M, séance du jour à suivre au
// bord du bassin, phases, paliers et conseils
export default function SwimBoard() {
  const todayKey = dateKey(new Date());
  const [recurring, setRecurring] = useLocalStorage(RECURRING_KEY, []);
  const [overrides, setOverrides] = useLocalStorage(RECURRING_OVERRIDES_KEY, {});
  const [recurringDone, setRecurringDone] = useLocalStorage(RECURRING_DONE_KEY, []);
  const [quests, setQuests] = useLocalStorage(QUESTS_KEY, []);
  // Écriture seule : une séance cochée compte la quête hebdo « Natation »
  const [, setWeekLog] = useLocalStorage(WEEK_LOG_KEY, {});
  const [blocksDone, setBlocksDone] = useLocalStorage(SWIM_BLOCKS_KEY, {});
  const [milestones, setMilestones] = useLocalStorage(SWIM_MILESTONES_KEY, {});

  const current = currentSession(todayKey) ?? SESSIONS[SESSIONS.length - 1];
  const [selectedId, setSelectedId] = useState(current.id);
  const [importNotice, setImportNotice] = useState(null);

  const index = SESSIONS.findIndex((s) => s.id === selectedId);
  const session = SESSIONS[index];
  const phase = PHASES.find((p) => p.id === session.phase);
  const done = (s) => isSessionDone(s, recurring, recurringDone);
  const sessionDone = done(session);

  const doneSessions = SESSIONS.filter(done);
  const meters = doneSessions.reduce((sum, s) => sum + s.volume, 0);
  const thisWeek = SESSIONS.filter((s) => weekKeyOf(parseDateKey(s.date)) === weekKeyOf(new Date()));
  const thisWeekDone = thisWeek.filter(done).length;
  const nowPhase = currentPhase(todayKey);
  const daysToS = daysLeft(S_RACE);
  const daysToM = daysLeft(M_RACE);
  const imported = swimTitlesImported(recurring, overrides);
  const swimQuest = quests.find((q) => q.id === 'plan_swim');

  // Une séance passée de la semaine écoulée, pas cochée : on propose d'y revenir
  const missed = lastMissedSession(todayKey, done);
  const showMissed = missed && missed.id !== session.id && daysLeft(missed.date) >= -7;

  const isMilestoneDone = (m) => Boolean(milestones[m.id]) || Boolean(m.step && triStepDone(quests, m.step));

  const goTo = (i) => {
    if (i < 0 || i >= SESSIONS.length) return;
    setSelectedId(SESSIONS[i].id);
  };

  // La séance cochée ici l'est aussi dans la Semaine, et compte la quête « Natation »
  const setSessionDone = (s, nextDone) => {
    let rec = recurring;
    if (!findSwimEvent(rec)) {
      rec = withSwimEvent(rec);
      setRecurring(rec);
    }
    const key = occurrenceKey(findSwimEvent(rec).id, s.date);
    if (recurringDone.includes(key) === nextDone) return;
    setRecurringDone((prev) => (nextDone ? [...prev, key] : prev.filter((k) => k !== key)));
    setWeekLog((prev) => withSwimCount(prev, quests, s.date, nextDone));
  };

  const toggleBlock = (s, i) => {
    const prevDone = blocksDone[s.id] ?? [];
    const nextDone = prevDone.includes(i) ? prevDone.filter((x) => x !== i) : [...prevDone, i];
    setBlocksDone((prev) => ({ ...prev, [s.id]: nextDone }));
    // Le dernier bloc coché valide la séance
    if (nextDone.length === s.blocks.length && !done(s)) setSessionDone(s, true);
  };

  const importToPlanner = () => {
    const rec = withSwimEvent(recurring);
    if (rec !== recurring) setRecurring(rec);
    const { next, written } = withSwimTitles(overrides, findSwimEvent(rec));
    setOverrides(next);
    const upgraded = withUpgradedTriQuest(quests);
    if (upgraded !== quests) setQuests(upgraded);
    setImportNotice(
      written > 0
        ? `${written} séances ajoutées au planning, le mardi et le vendredi à 12h.`
        : 'Le planning avait déjà toutes les séances.',
    );
  };

  const toggleMilestone = (m) => {
    const nextDone = !isMilestoneDone(m);
    setMilestones((prev) => {
      if (nextDone) return { ...prev, [m.id]: todayKey };
      const { [m.id]: _removed, ...rest } = prev;
      return rest;
    });
    if (m.step) setQuests((prev) => withTriStep(prev, m.step, nextDone));
  };

  const dayTitle =
    session.date === todayKey ? 'Aujourd’hui' : shortDayLabel(session.date).replace(/^./, (c) => c.toUpperCase());
  const checked = blocksDone[session.id] ?? [];

  return (
    <div className="swim-board">
      <div className="swim-hero">
        <h2 className="swim-page-title">Natation</h2>
        <span className={`swim-week-badge${thisWeekDone >= thisWeek.length && thisWeek.length > 0 ? ' full' : ''}`}>
          Semaine : {thisWeekDone}/{thisWeek.length || 2}
        </span>
      </div>

      <div className="swim-stats">
        <div className="swim-stat">
          <span className="swim-stat-value">{daysToS > 0 ? `J-${daysToS}` : '🏁'}</span>
          <span className="swim-stat-label">triathlon S</span>
        </div>
        <div className="swim-stat">
          <span className="swim-stat-value">
            {doneSessions.length}
            <span className="swim-stat-total">/{SESSIONS.length}</span>
          </span>
          <span className="swim-stat-label">séances faites</span>
        </div>
        <div className="swim-stat">
          <span className="swim-stat-value">{formatMeters(meters)}</span>
          <span className="swim-stat-label">nagés</span>
        </div>
      </div>
      <span className="swim-bar" aria-hidden="true">
        <span className="swim-bar-fill" style={{ width: `${(doneSessions.length / SESSIONS.length) * 100}%` }} />
      </span>
      <p className="swim-sub">
        Phase en cours : <strong>{nowPhase.label}</strong> · objectif {nowPhase.goal}
        {daysToM > 0 && <> · triathlon M dans {daysToM} jours</>}
      </p>

      {!imported && (
        <div className="swim-card swim-setup">
          <CalendarPlus size={20} aria-hidden="true" />
          <div>
            <p>
              Mets les {SESSIONS.length} séances dans le planning : chaque mardi et vendredi à 12h, l’événement
              🏊 affichera la séance du jour. Les titres que tu as modifiés à la main ne bougent pas.
            </p>
            <button type="button" className="swim-btn primary" onClick={importToPlanner}>
              Mettre mes séances dans le planning
            </button>
          </div>
        </div>
      )}
      {importNotice && (
        <div className="swim-notice" role="status">
          <Check size={16} aria-hidden="true" />
          <span>{importNotice}</span>
          <button type="button" onClick={() => setImportNotice(null)} aria-label="Fermer">
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}
      {!swimQuest && (
        <p className="swim-hint">
          La quête hebdo « Natation » n’existe pas : les séances cochées ne compteront pas dans les Quêtes. Elle
          s’ajoute avec le plan Triathlon de l’onglet Quêtes.
        </p>
      )}

      {/* ── Séance ── */}
      <section className={`swim-card swim-session${sessionDone ? ' done' : ''}`} aria-label="Séance">
        <div className="swim-session-nav">
          <button type="button" className="swim-icon-btn" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Séance précédente">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="swim-session-when">
            <span className="swim-session-day">{dayTitle}</span>
            <span className="swim-session-meta">
              Semaine {session.week} · séance {session.slot === 'A' ? 'A technique' : 'B endurance'}
              {session.light && ' · allégée'}
            </span>
          </div>
          <button
            type="button"
            className="swim-icon-btn"
            onClick={() => goTo(index + 1)}
            disabled={index === SESSIONS.length - 1}
            aria-label="Séance suivante"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        {session.id !== current.id && (
          <button type="button" className="swim-link" onClick={() => setSelectedId(current.id)}>
            Revenir à la séance {current.date === todayKey ? 'du jour' : 'à venir'}
          </button>
        )}

        <div className="swim-session-head">
          <span className="swim-chip">{phase.short} · {phase.label}</span>
          <h3 className="swim-session-title">{session.title}</h3>
          <span className="swim-session-volume">{session.test ? `${session.volume} m + test` : `${session.volume} m`}</span>
        </div>

        {session.closed && (
          <p className="swim-warning">
            <TriangleAlert size={15} aria-hidden="true" /> {session.closed}
          </p>
        )}
        {session.note && (
          <p className="swim-note">
            <Info size={15} aria-hidden="true" /> {session.note}
          </p>
        )}

        <ol className="swim-blocks">
          {session.blocks.map((b, i) => {
            const drill = DRILLS[b.drill];
            const amount = blockLabel(b);
            const isChecked = checked.includes(i);
            return (
              <li key={i} className={`swim-block${isChecked ? ' checked' : ''}`}>
                <button
                  type="button"
                  className="swim-check"
                  onClick={() => toggleBlock(session, i)}
                  aria-pressed={isChecked}
                  aria-label={`${amount ?? ''} ${drill.name} : ${isChecked ? 'fait' : 'à faire'}`}
                >
                  {isChecked && <Check size={14} aria-hidden="true" />}
                </button>
                <details className="swim-block-body">
                  <summary>
                    {amount && <span className="swim-block-amount">{amount}</span>}
                    <span className="swim-block-name">{drill.name}</span>
                    {b.rest ? <span className="swim-block-rest">repos {b.rest} s</span> : null}
                  </summary>
                  <p className="swim-block-tip">{drill.tip}</p>
                </details>
                {b.note && <p className="swim-block-note">{b.note}</p>}
              </li>
            );
          })}
        </ol>
        <p className="swim-hint">Touche le nom d’un exercice pour voir comment le faire.</p>

        <button
          type="button"
          className={`swim-btn ${sessionDone ? 'done' : 'primary'} wide`}
          onClick={() => setSessionDone(session, !sessionDone)}
        >
          <Check size={16} aria-hidden="true" />
          {sessionDone ? 'Séance faite' : 'Marquer la séance comme faite'}
        </button>
        {showMissed && (
          <p className="swim-missed">
            La séance du {shortDayLabel(missed.date)} n’est pas cochée.{' '}
            <button type="button" className="swim-link" onClick={() => setSelectedId(missed.id)}>
              La voir
            </button>
          </p>
        )}
      </section>

      {/* ── Phases ── */}
      <h3 className="swim-section-title">Le programme</h3>
      <ol className="swim-phases">
        {PHASES.map((p) => {
          const [start, end] = phaseDates(p);
          const status = end < todayKey ? 'past' : p.id === nowPhase.id ? 'now' : 'next';
          const range = phaseVolumeRange(p.id);
          return (
            <li key={p.id} className={`swim-phase ${status}`}>
              <details open={status === 'now'}>
                <summary>
                  <span className="swim-phase-short">{p.short}</span>
                  <span className="swim-phase-main">
                    <span className="swim-phase-label">{p.label}</span>
                    <span className="swim-phase-dates">
                      {shortDate(start)} → {p.upcoming ? 'course M' : shortDate(end)}
                      {range && ` · ${range[0]}-${range[1]} m`}
                    </span>
                  </span>
                  {status === 'past' && <Check size={16} aria-hidden="true" className="swim-phase-check" />}
                </summary>
                <p className="swim-phase-goal">
                  <Flag size={14} aria-hidden="true" /> {p.goal}
                </p>
                <p className="swim-phase-focus">{p.focus}</p>
              </details>
            </li>
          );
        })}
      </ol>

      {/* ── Paliers ── */}
      <h3 className="swim-section-title">Paliers</h3>
      <ul className="swim-milestones">
        {MILESTONES.map((m) => {
          const isDone = isMilestoneDone(m);
          return (
            <li key={m.id}>
              <button
                type="button"
                className={`swim-milestone${isDone ? ' done' : ''}`}
                onClick={() => toggleMilestone(m)}
                aria-pressed={isDone}
              >
                <span className="swim-check" aria-hidden="true">
                  {isDone && <Check size={14} />}
                </span>
                <span className="swim-milestone-label">{m.label}</span>
                {milestones[m.id] && <span className="swim-milestone-date">{shortDate(milestones[m.id])}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="swim-hint">Les paliers du triathlon S cochent aussi les étapes de la quête « Triathlon S ».</p>

      {/* ── Conseils ── */}
      <h3 className="swim-section-title">Conseils</h3>
      <div className="swim-tips">
        {SWIM_TIPS.map((t) => (
          <details key={t.title} className="swim-tip">
            <summary>{t.title}</summary>
            <p>{t.text}</p>
          </details>
        ))}
      </div>
      <p className="swim-hint">
        Course S prévue le {shortDayLabel(S_RACE)}, course M le {shortDayLabel(M_RACE)} : dates à ajuster une fois
        inscrit.
      </p>
    </div>
  );
}
