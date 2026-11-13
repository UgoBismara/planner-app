import { useRef, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CARDS_KEY, CAUGHT_KEY, CARDS_PER_DAY } from '../../data/wikimasters';
import './CardsBoard.css';

const FILTERS = [
  { id: 'todo', label: 'À capturer' },
  { id: 'all', label: 'Toutes' },
  { id: 'caught', label: 'Capturées' },
];

const todayIso = () =>
  new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

function dayLabel(iso, today) {
  if (iso === today) return "Aujourd'hui";
  const d = new Date(`${iso}T12:00:00`);
  const y = new Date(`${today}T12:00:00`);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function CardsBoard() {
  // Les cartes sont déposées par la routine cloud ; l'appli n'écrit que les captures
  const [rawCards] = useLocalStorage(CARDS_KEY, []);
  // Filet de sécurité : le script empêche déjà les doublons, l'affichage aussi
  const seen = new Set();
  const cards = rawCards.filter((c) => {
    const k = c.title.trim().toLocaleLowerCase('fr');
    if (seen.has(c.id) || seen.has(k)) return false;
    seen.add(c.id);
    seen.add(k);
    return true;
  });
  const [caught, setCaught] = useLocalStorage(CAUGHT_KEY, {});
  const [filter, setFilter] = useState('todo');
  const today = todayIso();

  // Clic sur le titre : copié pour le coller dans la recherche du jeu
  const [copiedId, setCopiedId] = useState(null);
  const copiedTimer = useRef(null);
  const copyTitle = async (card) => {
    try {
      await navigator.clipboard.writeText(card.title);
    } catch {
      // Repli pour les navigateurs sans API presse-papiers (http, vieux Safari)
      const ta = document.createElement('textarea');
      ta.value = card.title;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopiedId(card.id);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedId(null), 1500);
  };

  const toggle = (id) =>
    setCaught((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = today;
      return next;
    });

  const caughtCount = cards.filter((c) => caught[c.id]).length;
  const todayCards = cards.filter((c) => c.date === today);
  const todayCaught = todayCards.filter((c) => caught[c.id]).length;

  const visible = cards.filter((c) => {
    if (filter === 'todo') return !caught[c.id];
    if (filter === 'caught') return caught[c.id];
    return true;
  });

  // Regroupe par jour de tirage, le plus récent en haut
  const days = [];
  for (const c of visible) {
    const last = days[days.length - 1];
    if (last?.date === c.date) last.cards.push(c);
    else days.push({ date: c.date, cards: [c] });
  }
  days.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="cards-board">
      <div className="cards-header">
        <h2 className="cards-title">Cartes du jour</h2>
        <span className="cards-sub">WikiMasters · {CARDS_PER_DAY} articles tirés chaque matin</span>
      </div>

      <div className="cards-stats">
        <div className="cards-stat">
          <span className="cards-stat-value">
            {todayCaught}/{todayCards.length || CARDS_PER_DAY}
          </span>
          <span className="cards-stat-label">aujourd'hui</span>
        </div>
        <div className="cards-stat">
          <span className="cards-stat-value">{caughtCount}</span>
          <span className="cards-stat-label">capturées</span>
        </div>
        <div className="cards-stat">
          <span className="cards-stat-value">{cards.length - caughtCount}</span>
          <span className="cards-stat-label">en attente</span>
        </div>
      </div>

      <div className="cards-filters" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`cards-filter${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="cards-empty">Aucune carte pour l'instant : le premier tirage arrive à 8h.</p>
      )}
      {cards.length > 0 && visible.length === 0 && (
        <p className="cards-empty">
          {filter === 'todo' ? 'Tout est capturé, bravo !' : 'Aucune carte capturée pour l’instant.'}
        </p>
      )}

      {days.map((day) => (
        <section key={day.date} className="cards-day">
          <h3 className="cards-day-title">{dayLabel(day.date, today)}</h3>
          <ul className="cards-list">
            {day.cards.map((c) => {
              const isCaught = Boolean(caught[c.id]);
              return (
                <li key={c.id} className={`card-item${isCaught ? ' caught' : ''}`}>
                  {c.thumb && <img className="card-thumb" src={c.thumb} alt="" loading="lazy" />}
                  <div className="card-body">
                    <div className="card-title-row">
                      <button
                        className="card-title"
                        onClick={() => copyTitle(c)}
                        title="Copier le titre"
                      >
                        {c.title}
                      </button>
                      {copiedId === c.id && (
                        <span className="card-copied" role="status">
                          <Copy size={12} aria-hidden="true" /> Copié
                        </span>
                      )}
                    </div>
                    {c.description && <span className="card-desc">{c.description}</span>}
                    {c.extract && <p className="card-extract">{c.extract}</p>}
                    <a
                      className="card-link"
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Voir la page ${c.title} sur Wikipédia`}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Voir la page
                    </a>
                  </div>
                  <button
                    className="card-catch"
                    onClick={() => toggle(c.id)}
                    aria-pressed={isCaught}
                    aria-label={isCaught ? `Marquer ${c.title} comme non capturée` : `Marquer ${c.title} comme capturée`}
                  >
                    <Check size={18} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
