import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  PROJECTS_KEY,
  JOURNAL_KEY,
  DEFAULT_PROJECTS,
  suggestionsToAdd,
  mergeSuggestions,
  stepDone,
  PLEASURE_LEVELS,
  makeProject,
  makeEntry,
  formatAmount,
  entriesOfWeek,
  averagePleasure,
} from '../../data/journal';
import { dateKey } from '../../data/quests';
import './JournalBoard.css';

const EMPTY_LOG = { amount: 1, text: '', pleasure: null };
const EMPTY_PROJECT = { icon: '', label: '', unit: '', total: '', current: '' };

const dayLabel = (key) => {
  if (key === dateKey(new Date())) return 'Aujourd’hui';
  const label = new Date(`${key}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

function PleasurePicker({ value, onChange }) {
  return (
    <div className="journal-pleasure">
      <span className="journal-pleasure-label">Plaisir (facultatif)</span>
      <div className="journal-pleasure-scale">
        {PLEASURE_LEVELS.map((n) => (
          <button
            key={n}
            type="button"
            className={`journal-pleasure-btn${value === n ? ' active' : ''}`}
            onClick={() => onChange(value === n ? null : n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function JournalBoard() {
  const [projects, setProjects] = useLocalStorage(PROJECTS_KEY, DEFAULT_PROJECTS);
  const [entries, setEntries] = useLocalStorage(JOURNAL_KEY, []);
  const [logging, setLogging] = useState(null); // { projectId, amount, text, pleasure }
  const [victory, setVictory] = useState({ text: '', pleasure: null });
  const [editing, setEditing] = useState(null); // { id | null, ...champs du projet }
  const [showAll, setShowAll] = useState(false);

  const weekEntries = entriesOfWeek(entries);
  const avg = averagePleasure(weekEntries);
  const visibleEntries = (showAll ? entries : weekEntries).slice().reverse();
  const byDay = visibleEntries.reduce((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const active = projects.filter((p) => p.status === 'active');
  const paused = projects.filter((p) => p.status === 'paused');
  const done = projects.filter((p) => p.status === 'done');
  const projectOf = (id) => projects.find((p) => p.id === id);
  const suggestions = suggestionsToAdd(projects);

  const [expandedSteps, setExpandedSteps] = useState(null); // id du projet dont on voit toutes les étapes

  const addSuggestions = () => setProjects(mergeSuggestions);

  // Cocher une étape la note dans le journal (et ajoute son éventuel avancement, ex. +1 succès)
  const toggleStep = (project, st) => {
    const nowDone = !st.done;
    const amount = st.amount ?? 0;
    updateProject(project.id, (p) => ({
      ...p,
      current: Math.max(0, p.current + (nowDone ? amount : -amount)),
      steps: p.steps.map((s) => (s.id === st.id ? { ...s, done: nowDone } : s)),
    }));
    setEntries((prev) =>
      nowDone
        ? [...prev, { ...makeEntry({ projectId: project.id, text: st.label, amount }), stepId: st.id }]
        : prev.filter((e) => !(e.projectId === project.id && e.stepId === st.id)),
    );
  };

  const renderSteps = (p) => {
    const doneCount = p.steps.filter((st) => stepDone(p, st)).length;
    const expanded = expandedSteps === p.id;
    // Par défaut, seulement les 3 prochaines étapes : on avance petit à petit
    const visible = expanded ? p.steps : p.steps.filter((st) => !stepDone(p, st)).slice(0, 3);
    return (
      <div className="journal-steps">
        <div className="journal-steps-head">
          <span>
            Étapes {doneCount}/{p.steps.length}
            {!expanded && doneCount < p.steps.length && ' · les prochaines'}
          </span>
          <button className="journal-link-btn" onClick={() => setExpandedSteps(expanded ? null : p.id)}>
            {expanded ? 'Réduire' : 'Tout voir'}
          </button>
        </div>
        <ul className="journal-steps-list">
          {visible.map((st) => {
            const auto = !st.done && stepDone(p, st);
            return (
              <li key={st.id}>
                <label className={`journal-step${stepDone(p, st) ? ' done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={stepDone(p, st)}
                    disabled={auto}
                    onChange={() => toggleStep(p, st)}
                  />
                  {st.label}
                  {auto && <span className="journal-step-auto"> (atteint)</span>}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const updateProject = (id, fn) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));

  const saveLog = (e) => {
    e.preventDefault();
    const amount = Math.max(1, Number(logging.amount) || 1);
    setEntries((prev) => [
      ...prev,
      makeEntry({ projectId: logging.projectId, text: logging.text.trim(), amount, pleasure: logging.pleasure }),
    ]);
    updateProject(logging.projectId, (p) => ({ ...p, current: p.current + amount }));
    setLogging(null);
  };

  const saveVictory = (e) => {
    e.preventDefault();
    const text = victory.text.trim();
    if (!text) return;
    setEntries((prev) => [...prev, makeEntry({ text, pleasure: victory.pleasure })]);
    setVictory({ text: '', pleasure: null });
  };

  // Supprimer une entrée de projet retire aussi son avancement
  const removeEntry = (entry) => {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    if (entry.projectId && (entry.amount || entry.stepId)) {
      updateProject(entry.projectId, (p) => ({
        ...p,
        current: Math.max(0, p.current - (entry.amount ?? 0)),
        steps: entry.stepId
          ? p.steps?.map((s) => (s.id === entry.stepId ? { ...s, done: false } : s))
          : p.steps,
      }));
    }
  };

  const saveProject = (e) => {
    e.preventDefault();
    const label = editing.label.trim();
    if (!label) return;
    const total = Number(editing.total) || null;
    if (editing.id) {
      updateProject(editing.id, (p) => ({
        ...p,
        icon: editing.icon || p.icon,
        label,
        unit: editing.unit.trim() || p.unit,
        total,
        current: Math.max(0, Number(editing.current) || 0),
      }));
    } else {
      setProjects((prev) => [...prev, makeProject({ icon: editing.icon, label, unit: editing.unit.trim(), total })]);
    }
    setEditing(null);
  };

  const removeProject = (id) => {
    if (!window.confirm('Supprimer ce projet ? Ses entrées restent dans le carnet.')) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setEditing(null);
  };

  const setStatus = (id, status) => {
    updateProject(id, (p) => ({ ...p, status }));
    setEditing(null);
  };

  const renderProjectForm = () => (
    <form className="journal-form" onSubmit={saveProject}>
      <div className="journal-form-row">
        <input
          className="journal-input journal-icon-input"
          placeholder="🎯"
          value={editing.icon}
          maxLength={4}
          onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
        />
        <input
          className="journal-input"
          placeholder="Projet (ex. Puzzle 1000 pièces)"
          value={editing.label}
          maxLength={50}
          onChange={(e) => setEditing({ ...editing, label: e.target.value })}
        />
      </div>
      <div className="journal-form-row">
        <input
          className="journal-input"
          placeholder="Unité (ex. sachet, chant, jeu fini)"
          value={editing.unit}
          maxLength={25}
          onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
        />
        {editing.id && (
          <input
            className="journal-input journal-number-input"
            inputMode="numeric"
            placeholder="Où j’en suis"
            value={editing.current}
            onChange={(e) => setEditing({ ...editing, current: e.target.value })}
          />
        )}
        <input
          className="journal-input journal-number-input"
          inputMode="numeric"
          placeholder="Total (facultatif)"
          value={editing.total}
          onChange={(e) => setEditing({ ...editing, total: e.target.value })}
        />
      </div>
      <div className="journal-form-actions">
        {editing.id && (
          <>
            <button type="button" className="journal-danger-btn" onClick={() => removeProject(editing.id)}>
              Supprimer
            </button>
            {projectOf(editing.id)?.status === 'active' ? (
              <>
                <button type="button" className="journal-ghost-btn" onClick={() => setStatus(editing.id, 'paused')}>
                  ⏸ En pause
                </button>
                <button type="button" className="journal-ghost-btn" onClick={() => setStatus(editing.id, 'done')}>
                  🏆 Terminé
                </button>
              </>
            ) : (
              <button type="button" className="journal-ghost-btn" onClick={() => setStatus(editing.id, 'active')}>
                ▶ Reprendre
              </button>
            )}
          </>
        )}
        <button type="button" className="journal-ghost-btn" onClick={() => setEditing(null)}>
          Annuler
        </button>
        <button type="submit" className="journal-primary-btn" disabled={!editing.label.trim()}>
          {editing.id ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  );

  const openEdit = (p) =>
    setEditing({ id: p.id, icon: p.icon, label: p.label, unit: p.unit, total: p.total ?? '', current: p.current });

  return (
    <div className="journal-board">
      <div className="journal-header">
        <h2 className="journal-title">📓 Mon carnet</h2>
        <span className="journal-week">
          Cette semaine : <strong>{weekEntries.length}</strong> chose{weekEntries.length > 1 ? 's' : ''} faite
          {weekEntries.length > 1 ? 's' : ''}
          {avg !== null && ` · plaisir moyen ${String(avg).replace('.', ',')}/10`}
        </span>
      </div>
      <p className="journal-hint">Ici, rien ne se rate : tu notes juste ce que tu as fait, à ton rythme.</p>

      {suggestions.length > 0 && (
        <div className="journal-suggest">
          <div>
            <div className="journal-suggest-title">🎮 À ajouter à tes projets</div>
            {suggestions.map((s) => (
              <div key={s.id} className="journal-suggest-item">
                {s.icon} <strong>{s.label}</strong>
                {projects.some((p) => p.id === s.id || p.label.toLowerCase() === s.label.toLowerCase())
                  ? s.refresh
                    ? ` · mise à jour : ${s.current} jeux déjà à 100 %, ${s.steps.length} étapes · ${s.hint}`
                    : ` · ses ${s.steps.length} étapes à faire petit à petit`
                  : ` · ${s.current}/${s.total} ${formatAmount(s.total, s.unit).replace(/^\d+ /, '')} · ${s.steps?.length ?? 0} étapes · ${s.hint}`}
              </div>
            ))}
          </div>
          <button className="journal-primary-btn" onClick={addSuggestions}>
            Ajouter
          </button>
        </div>
      )}

      {/* ── Petite victoire libre ── */}
      <form className="journal-victory" onSubmit={saveVictory}>
        <div className="journal-form-row">
          <input
            className="journal-input"
            placeholder="✨ Une petite victoire (ex. rangé ma chambre, 15 min de marche)"
            value={victory.text}
            maxLength={100}
            onChange={(e) => setVictory({ ...victory, text: e.target.value })}
          />
          <button type="submit" className="journal-primary-btn" disabled={!victory.text.trim()}>
            Noter
          </button>
        </div>
        {victory.text.trim() && (
          <PleasurePicker value={victory.pleasure} onChange={(pleasure) => setVictory({ ...victory, pleasure })} />
        )}
      </form>

      {/* ── Projets ── */}
      <ul className="journal-projects">
        {active.map((p) => {
          const reached = p.total && p.current >= p.total;
          return (
            <li key={p.id} className={`journal-project${reached ? ' reached' : ''}`}>
              <div className="journal-project-head">
                <span className="journal-project-icon">{reached ? '🏆' : p.icon}</span>
                <span className="journal-project-label">{p.label}</span>
                <button className="journal-edit-btn" onClick={() => openEdit(p)} title="Modifier" aria-label="Modifier">
                  ✎
                </button>
              </div>
              <div className="journal-project-progress">
                {p.total ? (
                  <>
                    <div className="journal-bar">
                      <div className="journal-bar-fill" style={{ width: `${Math.min(100, (p.current / p.total) * 100)}%` }} />
                    </div>
                    <span className="journal-progress-label">
                      {p.current}/{p.total} {formatAmount(p.total, p.unit).replace(/^\d+ /, '')}
                    </span>
                  </>
                ) : (
                  <span className="journal-progress-label">
                    {p.current > 0 ? `${formatAmount(p.current, p.unit)}` : 'Pas encore commencé, et c’est ok'}
                  </span>
                )}
                {logging?.projectId !== p.id && (
                  <button
                    className="journal-plus-btn"
                    onClick={() => setLogging({ ...EMPTY_LOG, projectId: p.id })}
                  >
                    +1 {p.unit}
                  </button>
                )}
              </div>
              {p.steps?.length > 0 && renderSteps(p)}
              {logging?.projectId === p.id && (
                <form className="journal-log" onSubmit={saveLog}>
                  <div className="journal-form-row">
                    <div className="journal-stepper">
                      <button
                        type="button"
                        onClick={() => setLogging({ ...logging, amount: Math.max(1, logging.amount - 1) })}
                        aria-label="Moins"
                      >
                        −
                      </button>
                      <span>{formatAmount(logging.amount, p.unit)}</span>
                      <button
                        type="button"
                        onClick={() => setLogging({ ...logging, amount: logging.amount + 1 })}
                        aria-label="Plus"
                      >
                        +
                      </button>
                    </div>
                    <input
                      className="journal-input"
                      placeholder="Un mot (facultatif)"
                      value={logging.text}
                      maxLength={100}
                      onChange={(e) => setLogging({ ...logging, text: e.target.value })}
                    />
                  </div>
                  <PleasurePicker value={logging.pleasure} onChange={(pleasure) => setLogging({ ...logging, pleasure })} />
                  <div className="journal-form-actions">
                    <button type="button" className="journal-ghost-btn" onClick={() => setLogging(null)}>
                      Annuler
                    </button>
                    <button type="submit" className="journal-primary-btn">
                      Noter
                    </button>
                  </div>
                </form>
              )}
              {editing?.id === p.id && renderProjectForm()}
            </li>
          );
        })}
      </ul>

      {editing && !editing.id ? (
        renderProjectForm()
      ) : (
        <button className="journal-add-btn" onClick={() => setEditing({ id: null, ...EMPTY_PROJECT })}>
          + Nouveau projet
        </button>
      )}

      {(paused.length > 0 || done.length > 0) && (
        <div className="journal-shelves">
          {paused.length > 0 && (
            <div>
              <h3 className="journal-subtitle">⏸ En pause, sans culpabilité</h3>
              <ul className="journal-shelf">
                {paused.map((p) => (
                  <li key={p.id}>
                    <span>
                      {p.icon} {p.label}
                    </span>
                    {editing?.id === p.id ? (
                      renderProjectForm()
                    ) : (
                      <button className="journal-ghost-btn" onClick={() => setStatus(p.id, 'active')}>
                        ▶ Reprendre
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h3 className="journal-subtitle">🏆 Terminés</h3>
              <ul className="journal-shelf">
                {done.map((p) => (
                  <li key={p.id}>
                    <span>
                      🏆 {p.label} · {formatAmount(p.current, p.unit)}
                    </span>
                    <button className="journal-edit-btn" onClick={() => openEdit(p)} title="Modifier" aria-label="Modifier">
                      ✎
                    </button>
                    {editing?.id === p.id && renderProjectForm()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Journal ── */}
      <div className="journal-header journal-feed-header">
        <h2 className="journal-title">{showAll ? 'Tout ce que j’ai fait' : 'Cette semaine, j’ai fait…'}</h2>
        {entries.length > weekEntries.length && (
          <button className="journal-ghost-btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Cette semaine' : 'Tout voir'}
          </button>
        )}
      </div>
      {visibleEntries.length === 0 ? (
        <p className="journal-empty">Rien encore cette semaine. La première entrée, même minuscule, compte.</p>
      ) : (
        Object.entries(byDay).map(([day, list]) => (
          <div key={day} className="journal-day">
            <div className="journal-day-label">{dayLabel(day)}</div>
            <ul className="journal-entries">
              {list.map((e) => {
                const project = e.projectId ? projectOf(e.projectId) : null;
                return (
                  <li key={e.id} className="journal-entry">
                    <span className="journal-entry-icon">{project?.icon ?? '✨'}</span>
                    <span className="journal-entry-text">
                      {project && e.stepId ? (
                        <>
                          <strong>✓ {e.text}</strong> · {project.label}
                        </>
                      ) : (
                        <>
                          {project && (
                            <strong>
                              {formatAmount(e.amount, project.unit)} · {project.label}
                            </strong>
                          )}
                          {project && e.text && ' — '}
                          {e.text}
                        </>
                      )}
                    </span>
                    {e.pleasure !== null && e.pleasure !== undefined && (
                      <span className="journal-entry-pleasure" title="Plaisir">
                        {e.pleasure}/10
                      </span>
                    )}
                    <button className="journal-entry-delete" onClick={() => removeEntry(e)} title="Supprimer" aria-label="Supprimer">
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
