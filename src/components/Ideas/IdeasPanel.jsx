import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { IDEA_TYPES, ideaTypeOf, makeIdea } from '../../data/ideas';
import './IdeasPanel.css';

// Au-delà, l'encart deviendrait plus haut que le calendrier : le reste se consulte
// dans l'onglet Idées.
const MAX_VISIBLE = 6;

// La liste vient de WeekPlanner : une seule source pour l'encart et pour les idées
// proposées à la création d'un objectif du jour.
export default function IdeasPanel({ ideas, setIdeas }) {
  const [open, setOpen] = useLocalStorage('planner_ideas_panel_open', true);
  const [draft, setDraft] = useState('');
  const [draftType, setDraftType] = useState('event');

  const pending = ideas.filter((i) => !i.done);
  const shown = pending.slice(0, MAX_VISIBLE);

  const addIdea = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setIdeas((prev) => [makeIdea(text, draftType), ...prev]);
    setDraft('');
  };

  const markDone = (id) =>
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: true } : i)),
    );

  return (
    <section className="ideas-panel">
      <button
        className="ideas-panel-head"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="ideas-panel-title">💡 Idées</span>
        {pending.length > 0 && (
          <span className="ideas-panel-count">{pending.length}</span>
        )}
        <span className="ideas-panel-chevron">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="ideas-panel-body">
          <form className="ideas-panel-form" onSubmit={addIdea}>
            <div className="ideas-panel-types">
              {IDEA_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`ideas-panel-type${draftType === t.id ? ' active' : ''}`}
                  onClick={() => setDraftType(t.id)}
                  title={t.label}
                  aria-label={t.label}
                >
                  {t.icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="ideas-panel-input"
              placeholder="Une idée à noter…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={120}
            />
            <button
              type="submit"
              className="ideas-panel-add"
              disabled={!draft.trim()}
              aria-label="Ajouter l'idée"
            >
              +
            </button>
          </form>

          {pending.length === 0 ? (
            <p className="ideas-panel-empty">Aucune idée en attente.</p>
          ) : (
            <ul className="ideas-panel-items">
              {shown.map((idea) => (
                <li key={idea.id} className="ideas-panel-item">
                  <button
                    className="ideas-panel-check"
                    onClick={() => markDone(idea.id)}
                    title="Marquer comme réalisé"
                    aria-label="Marquer comme réalisé"
                  />
                  <span
                    className="ideas-panel-icon"
                    title={ideaTypeOf(idea.type).label}
                  >
                    {ideaTypeOf(idea.type).icon}
                  </span>
                  <span className="ideas-panel-text">{idea.text}</span>
                </li>
              ))}
            </ul>
          )}

          {pending.length > MAX_VISIBLE && (
            <p className="ideas-panel-more">
              +{pending.length - MAX_VISIBLE} autres dans l’onglet Idées
            </p>
          )}
        </div>
      )}
    </section>
  );
}
