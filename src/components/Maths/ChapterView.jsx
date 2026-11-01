import { useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronDown, ChevronRight, InfinityIcon, PenLine, X } from 'lucide-react';
import {
  DIFFICULTIES,
  DRILL_TARGET,
  KINDS,
  chapterItems,
  isValidated,
  itemStatus,
  progressOf,
  readKey,
  reviewDate,
  shortDate,
} from '../../data/maths';
import ItemMeta, { Stars, StatusIcon } from './ItemMeta';
import LessonBlocks from './LessonBlocks';

const STATUS_FILTERS = [
  { id: 'all', label: 'Tous les statuts' },
  { id: 'todo', label: 'À faire' },
  { id: 'review', label: 'À retenter' },
  { id: 'done', label: 'Validés' },
];

// Un chapitre : la fiche de cours, section par section, et ses exercices filtrables
export default function ChapterView({
  chapter,
  tab,
  sectionFilter,
  attempts,
  drills,
  read,
  todayKey,
  onTab,
  onSectionFilter,
  onToggleRead,
  onOpenItem,
  onBack,
}) {
  const [openSections, setOpenSections] = useState([]);
  const [difficulties, setDifficulties] = useState(DIFFICULTIES.map((d) => d.id));
  const [kind, setKind] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const items = chapterItems(chapter.id);
  const progress = progressOf(items, attempts, drills);
  const filterSection = chapter.lesson.find((s) => s.id === sectionFilter);

  const toggleSection = (id) =>
    setOpenSections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleDifficulty = (id) =>
    setDifficulties((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next.length ? next : prev; // au moins une difficulté
    });

  const statusOf = (it) => itemStatus(it, attempts, drills, todayKey);
  const matches = (it) => {
    if (!difficulties.includes(it.difficulty)) return false;
    if (kind !== 'all' && it.kind !== kind) return false;
    if (sectionFilter && it.section !== sectionFilter) return false;
    const status = statusOf(it);
    if (statusFilter === 'todo') return !isValidated(it, attempts, drills) && status !== 'review';
    if (statusFilter === 'review') return status === 'review' || status === 'later';
    if (statusFilter === 'done') return isValidated(it, attempts, drills);
    return true;
  };
  const written = items.filter((it) => !it.generated && matches(it));
  const generated = items.filter((it) => it.generated && matches(it));

  const renderItem = (it) => {
    const status = statusOf(it);
    let extra = null;
    if (it.generated) {
      const drill = drills[it.id];
      extra = drill?.validated ? 'validé' : `${drill?.run ?? 0}/${DRILL_TARGET}`;
    } else if (status === 'review') {
      extra = 'à retenter';
    } else if (status === 'later') {
      extra = `revient le ${shortDate(reviewDate(it, attempts))}`;
    }
    return (
      <li key={it.id}>
        <button type="button" className="maths-item" onClick={() => onOpenItem(it.id)}>
          <StatusIcon status={status} />
          <span className="maths-item-main">
            <span className="maths-item-title">{it.title}</span>
            <ItemMeta item={it}>{extra && <span className="maths-meta-extra">{extra}</span>}</ItemMeta>
          </span>
          <ChevronRight size={16} className="maths-item-chevron" aria-hidden="true" />
        </button>
      </li>
    );
  };

  return (
    <div className="maths-chapter">
      <button type="button" className="maths-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        Maths
      </button>

      <header className="maths-chapter-head">
        <h2 className="maths-page-title">{chapter.title}</h2>
        <p className="maths-chapter-meta">
          {chapter.levels} · {progress.done}/{progress.total} validés · {progress.percent} %
        </p>
        <div className="maths-bar">
          <div className="maths-bar-fill" style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="maths-chapter-summary">{chapter.summary}</p>
      </header>

      <div className="maths-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'cours'}
          className={`maths-tab${tab === 'cours' ? ' active' : ''}`}
          onClick={() => onTab('cours')}
        >
          <BookOpen size={15} aria-hidden="true" />
          Cours
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'exercices'}
          className={`maths-tab${tab === 'exercices' ? ' active' : ''}`}
          onClick={() => onTab('exercices')}
        >
          <PenLine size={15} aria-hidden="true" />
          Exercices ({items.length})
        </button>
      </div>

      {tab === 'cours' ? (
        <ol className="maths-sections">
          {chapter.lesson.map((section, i) => {
            const open = openSections.includes(section.id);
            const isRead = Boolean(read[readKey(chapter.id, section.id)]);
            const count = items.filter((it) => it.section === section.id).length;
            return (
              <li key={section.id} className={`maths-section-card${open ? ' open' : ''}`}>
                <button
                  type="button"
                  className="maths-section-head"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={open}
                >
                  <span className={`maths-section-num${isRead ? ' read' : ''}`}>
                    {isRead ? <Check size={14} aria-label="Lu" /> : i + 1}
                  </span>
                  <span className="maths-section-title">{section.title}</span>
                  <span className="maths-level">{section.level}</span>
                  <ChevronDown size={16} className="maths-chevron" aria-hidden="true" />
                </button>
                {open && (
                  <div className="maths-section-body">
                    <LessonBlocks blocks={section.blocks} />
                    <div className="maths-section-actions">
                      <button
                        type="button"
                        className={`maths-ghost-btn${isRead ? ' active' : ''}`}
                        onClick={() => onToggleRead(section.id)}
                        aria-pressed={isRead}
                      >
                        <Check size={15} aria-hidden="true" />
                        {isRead ? 'Lu' : 'Marquer comme lu'}
                      </button>
                      {count > 0 && (
                        <button
                          type="button"
                          className="maths-link-btn"
                          onClick={() => {
                            onSectionFilter(section.id);
                            onTab('exercices');
                          }}
                        >
                          S’entraîner sur cette notion ({count})
                          <ChevronRight size={15} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <>
          <div className="maths-filters">
            <div className="maths-chips" role="group" aria-label="Difficultés">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`maths-chip${difficulties.includes(d.id) ? ' active' : ''}`}
                  onClick={() => toggleDifficulty(d.id)}
                  aria-pressed={difficulties.includes(d.id)}
                >
                  <Stars n={d.id} size={11} />
                </button>
              ))}
            </div>
            <select className="maths-select" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type">
              <option value="all">Tous les types</option>
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
            <select
              className="maths-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Statut"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {filterSection && (
            <p className="maths-filter-tag">
              Notion : {filterSection.title}
              <button type="button" onClick={() => onSectionFilter(null)} aria-label="Retirer ce filtre">
                <X size={14} aria-hidden="true" />
              </button>
            </p>
          )}

          {written.length > 0 && <ul className="maths-items">{written.map(renderItem)}</ul>}

          {generated.length > 0 && (
            <>
              <h3 className="maths-subtitle">
                <InfinityIcon size={16} aria-hidden="true" />
                Entraînement
              </h3>
              <p className="maths-hint">
                Des énoncés tirés au hasard, en nombre illimité : {DRILL_TARGET} réussites d’affilée valident
                l’entraînement.
              </p>
              <ul className="maths-items">{generated.map(renderItem)}</ul>
            </>
          )}

          {written.length === 0 && generated.length === 0 && (
            <p className="maths-empty">Aucun exercice avec ces filtres.</p>
          )}
        </>
      )}
    </div>
  );
}
