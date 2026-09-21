import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { IDEAS_KEY, IDEA_TYPES, ideaTypeOf, makeIdea } from '../../data/ideas';
import './IdeasList.css';

const FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'event', label: '📅 Événements' },
  { id: 'goal', label: '🎯 Objectifs' },
  { id: 'done', label: '✓ Réalisés' },
];

export default function IdeasList() {
  const [ideas, setIdeas] = useLocalStorage(IDEAS_KEY, []);
  const [draft, setDraft] = useState('');
  const [draftType, setDraftType] = useState('event');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const addIdea = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setIdeas((prev) => [makeIdea(text, draftType), ...prev]);
    setDraft('');
  };

  const toggleDone = (id) =>
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    );

  const removeIdea = (id) => setIdeas((prev) => prev.filter((i) => i.id !== id));

  const startEdit = (idea) => {
    setEditingId(idea.id);
    setEditText(idea.text);
  };

  const commitEdit = () => {
    const text = editText.trim();
    if (text) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, text } : i)),
      );
    }
    setEditingId(null);
  };

  const visible = ideas
    .filter((i) => {
      if (filter === 'done') return i.done;
      if (filter === 'all') return true;
      return i.type === filter;
    })
    // Les idées réalisées descendent en bas de liste sans être perdues
    .sort((a, b) => Number(a.done) - Number(b.done));

  const pending = ideas.filter((i) => !i.done).length;

  return (
    <div className="ideas-list">
      <div className="ideas-header">
        <h2 className="ideas-title">Mes idées</h2>
        <span className="ideas-count">
          {pending === 0 ? 'Rien en attente' : `${pending} à réaliser`}
        </span>
      </div>

      <form className="ideas-form" onSubmit={addIdea}>
        <div className="ideas-type-picker">
          {IDEA_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`ideas-type-btn${draftType === t.id ? ' active' : ''}`}
              onClick={() => setDraftType(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="ideas-input-row">
          <input
            type="text"
            className="ideas-input"
            placeholder="Une idée à noter…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={120}
          />
          <button
            type="submit"
            className="ideas-add-btn"
            disabled={!draft.trim()}
          >
            Ajouter
          </button>
        </div>
      </form>

      <div className="ideas-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`ideas-filter-btn${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="ideas-empty">
          {ideas.length === 0
            ? 'Aucune idée pour le moment. Note la première ci-dessus.'
            : 'Rien dans cette catégorie.'}
        </p>
      ) : (
        <ul className="ideas-items">
          {visible.map((idea) => (
            <li key={idea.id} className={`ideas-item${idea.done ? ' done' : ''}`}>
              <button
                className="ideas-check"
                onClick={() => toggleDone(idea.id)}
                title={idea.done ? 'Remettre à faire' : 'Marquer comme réalisé'}
                aria-label={
                  idea.done ? 'Remettre à faire' : 'Marquer comme réalisé'
                }
              >
                {idea.done ? '✓' : ''}
              </button>

              <span
                className="ideas-item-type"
                title={ideaTypeOf(idea.type).label}
              >
                {ideaTypeOf(idea.type).icon}
              </span>

              {editingId === idea.id ? (
                <input
                  type="text"
                  className="ideas-edit-input"
                  value={editText}
                  autoFocus
                  maxLength={120}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
              ) : (
                <span
                  className="ideas-item-text"
                  onClick={() => startEdit(idea)}
                  title="Cliquer pour modifier"
                >
                  {idea.text}
                </span>
              )}

              <button
                className="ideas-delete"
                onClick={() => removeIdea(idea.id)}
                title="Supprimer"
                aria-label="Supprimer"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
