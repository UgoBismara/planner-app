import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye, ExternalLink, Flame, Gem, Gift, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { useLocalStorage, writeStoredValue } from '../../hooks/useLocalStorage';
import { ACHIEVEMENTS, ACHIEVEMENTS_KEY, buildContext } from '../../data/wikiAchievements';
import AchievementsView from './AchievementsView';
import { drawCard, titleKey } from '../../data/wikiDraw';
import {
  BONUS_KEY,
  CARDS_KEY,
  CAUGHT_KEY,
  CARDS_PER_DAY,
  GAME_NAME,
  RARITIES,
  levelOf,
  rarityOf,
  streakOf,
  titleOf,
  xpForLevel,
} from '../../data/wikimasters';
import './CardsBoard.css';

const MISSION_BONUS = 50;

const FILTERS = [
  { id: 'todo', label: 'À capturer' },
  { id: 'all', label: 'Toutes' },
  { id: 'caught', label: 'Capturées' },
];

const todayIso = () =>
  new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

function dayLabel(iso, today) {
  if (iso === 'bonus') return 'Cartes bonus';
  if (iso === today) return "Aujourd'hui";
  const d = new Date(`${iso}T12:00:00`);
  const y = new Date(`${today}T12:00:00`);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Une carte par page et par titre (le script l'assure déjà, l'affichage aussi)
function uniqueCards(raw) {
  const seen = new Set();
  return raw.filter((c) => {
    const k = c.title.trim().toLocaleLowerCase('fr');
    if (seen.has(c.id) || seen.has(k)) return false;
    seen.add(c.id);
    seen.add(k);
    return true;
  });
}

// XP = valeur des cartes capturées (bonus comprises) + bonus pour chaque journée
// bouclée (les cartes bonus ne comptent pas dans les journées)
function totalXp(cards, caught) {
  let xp = 0;
  const days = new Map();
  for (const c of cards) {
    if (caught[c.id]) xp += rarityOf(c).xp;
    if (c.bonus) continue;
    const d = days.get(c.date) ?? { total: 0, done: 0 };
    d.total++;
    if (caught[c.id]) d.done++;
    days.set(c.date, d);
  }
  for (const d of days.values()) if (d.done === d.total) xp += MISSION_BONUS;
  return xp;
}

export default function CardsBoard() {
  // Les cartes sont déposées par la routine cloud ; l'appli n'écrit que les captures
  const [rawCards] = useLocalStorage(CARDS_KEY, []);
  // Cartes bonus : tirées par l'appli quand il ne reste rien à capturer
  const [rawBonus, setBonus] = useLocalStorage(BONUS_KEY, []);
  const [caught, setCaught] = useLocalStorage(CAUGHT_KEY, {});
  // Date de premier déblocage de chaque succès (jamais retirée)
  const [unlocked] = useLocalStorage(ACHIEVEMENTS_KEY, {});
  const [bonusState, setBonusState] = useState('idle'); // idle | drawing | error
  const [view, setView] = useState('cards'); // cards | achievements
  const [filter, setFilter] = useState('todo');
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const copiedTimer = useRef(null);
  const toastTimer = useRef(null);
  const today = todayIso();
  const cards = uniqueCards([...rawCards, ...rawBonus]);
  const daily = cards.filter((c) => !c.bonus);

  const xp = totalXp(cards, caught);
  const level = levelOf(xp);
  const levelStart = xpForLevel(level);
  const levelEnd = xpForLevel(level + 1);
  const streak = streakOf(daily, caught, today);

  const achContext = buildContext({ cards, caught, level, today });
  const achResults = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a.check(achContext)]));
  const achDone = ACHIEVEMENTS.filter((a) => unlocked[a.id] || achResults[a.id].done).length;
  const newlyDone = ACHIEVEMENTS.filter((a) => achResults[a.id].done && !unlocked[a.id])
    .map((a) => a.id)
    .join(',');

  const todayCards = daily.filter((c) => c.date === today);
  const todayCaught = todayCards.filter((c) => caught[c.id]).length;
  const missionDone = todayCards.length > 0 && todayCaught === todayCards.length;

  // Plus rien à capturer : une carte bonus est tirée. Petit délai pour laisser
  // Firestore livrer d'éventuelles nouvelles cartes avant de conclure.
  const todoCount = cards.filter((c) => !caught[c.id]).length;
  const drawingRef = useRef(false);
  const latest = useRef({ cards, caught });
  useEffect(() => {
    latest.current = { cards, caught };
  });
  const drawBonus = async () => {
    if (drawingRef.current) return;
    drawingRef.current = true;
    setBonusState('drawing');
    try {
      const all = latest.current.cards;
      const card = await drawCard(
        new Set(all.map((c) => c.id)),
        new Set(all.map((c) => titleKey(c.title))),
        { bonus: true },
      );
      // Une nouvelle carte à capturer est arrivée pendant le tirage : pas de bonus
      const { cards: now, caught: nowCaught } = latest.current;
      if (now.some((c) => !nowCaught[c.id])) return;
      setBonus((prev) => [card, ...(prev ?? [])]);
      showToast({ kind: 'bonus', text: 'Nouvelle carte bonus !' });
    } catch {
      setBonusState('error');
    } finally {
      drawingRef.current = false;
      setBonusState((st) => (st === 'drawing' ? 'idle' : st));
    }
  };
  useEffect(() => {
    if (cards.length === 0 || todoCount > 0 || bonusState !== 'idle') return;
    const t = setTimeout(drawBonus, 1200);
    return () => clearTimeout(t);
    // drawBonus lit l'état courant via latest : seuls ces compteurs déclenchent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, todoCount, bonusState]);

  const showToast = (t, ms = 2200) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  // Nouveau succès rempli : date enregistrée une fois pour toutes. Firestore est relu
  // juste avant d'écrire (writeStoredValue) : sur un appareil qui vient d'ouvrir
  // l'appli, les dates déjà enregistrées ailleurs ne sont ni écrasées ni refêtées.
  useEffect(() => {
    if (!newlyDone) return;
    const t = setTimeout(async () => {
      let added = [];
      await writeStoredValue(ACHIEVEMENTS_KEY, (base) => {
        const b = base ?? {};
        added = newlyDone.split(',').filter((id) => !b[id]);
        if (added.length === 0) return null;
        return { ...b, ...Object.fromEntries(added.map((id) => [id, todayIso()])) };
      });
      if (added.length === 0) return;
      const first = ACHIEVEMENTS.find((a) => a.id === added[0]);
      const more = added.length > 1 ? ` (+${added.length - 1})` : '';
      showToast({ kind: 'achievement', text: `Succès débloqué : ${first.name}${more}` }, 3500);
    }, 1500);
    return () => clearTimeout(t);
  }, [newlyDone]);

  // Clic sur le titre : copié pour le coller dans la recherche du jeu
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

  const toggle = (card) => {
    const next = { ...caught };
    if (next[card.id]) {
      delete next[card.id];
      setCaught(next);
      return;
    }
    next[card.id] = today;
    setCaught(next);

    const r = rarityOf(card);
    const newXp = totalXp(cards, next);
    const newLevel = levelOf(newXp);
    const dayCards = daily.filter((c) => c.date === card.date);
    const dayDone = !card.bonus && dayCards.every((c) => next[c.id]);
    if (newLevel > level) {
      showToast({ kind: 'level', text: `Niveau ${newLevel} — ${titleOf(newLevel)} !` });
    } else if (dayDone) {
      showToast({ kind: 'mission', text: `Mission accomplie ! +${r.xp + MISSION_BONUS} XP` });
    } else {
      showToast({ kind: r.id, color: r.color, text: `${r.label} capturée ! +${r.xp} XP` });
    }
  };

  const visible = cards.filter((c) => {
    if (filter === 'todo') return !caught[c.id];
    if (filter === 'caught') return caught[c.id];
    return true;
  });

  // Regroupe par jour de tirage, le plus récent en haut
  const days = [];
  for (const c of visible) {
    const key = c.bonus ? 'bonus' : c.date;
    const group = days.find((d) => d.date === key);
    if (group) group.cards.push(c);
    else days.push({ date: key, cards: [c] });
  }
  // Bonus en tête, puis du jour le plus récent au plus ancien
  days.sort((a, b) => (a.date === 'bonus' ? -1 : b.date === 'bonus' ? 1 : b.date.localeCompare(a.date)));

  const collection = RARITIES.map((r) => ({
    ...r,
    count: cards.filter((c) => caught[c.id] && rarityOf(c).id === r.id).length,
  }));

  return (
    <div className="hunt">
      {/* ── Profil du chasseur ── */}
      <section className="hunt-hero">
        <div className="hunt-hero-top">
          <div>
            <h2 className="hunt-name">{GAME_NAME}</h2>
            <p className="hunt-tagline">Capture les articles du jour dans WikiMasters</p>
          </div>
          <div className="hunt-chips">
            <button
              className="hunt-trophies"
              onClick={() => setView(view === 'achievements' ? 'cards' : 'achievements')}
              title="Succès débloqués"
            >
              <Trophy size={15} aria-hidden="true" />
              {achDone}/{ACHIEVEMENTS.length}
            </button>
            <div className={`hunt-streak${streak > 0 ? ' on' : ''}`} title="Jours d'affilée avec toutes les cartes capturées">
              <Flame size={16} aria-hidden="true" />
              {streak}
            </div>
          </div>
        </div>
        <div className="hunt-level">
          <div className="hunt-level-badge" aria-label={`Niveau ${level}`}>{level}</div>
          <div className="hunt-level-info">
            <div className="hunt-level-row">
              <span className="hunt-level-title">{titleOf(level)}</span>
              <span className="hunt-level-xp">
                {xp - levelStart}/{levelEnd - levelStart} XP
              </span>
            </div>
            <div className="hunt-bar">
              <div
                className="hunt-bar-fill"
                style={{ width: `${((xp - levelStart) / (levelEnd - levelStart)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="hunt-views" role="tablist">
        <button role="tab" aria-selected={view === 'cards'} className={`hunt-view${view === 'cards' ? ' active' : ''}`} onClick={() => setView('cards')}>
          Cartes
        </button>
        <button role="tab" aria-selected={view === 'achievements'} className={`hunt-view${view === 'achievements' ? ' active' : ''}`} onClick={() => setView('achievements')}>
          Succès · {achDone}/{ACHIEVEMENTS.length}
        </button>
      </div>

      {view === 'achievements' ? (
        <AchievementsView results={achResults} unlocked={unlocked} />
      ) : (
      <>
      {/* ── Mission du jour ── */}
      <section className={`hunt-mission${missionDone ? ' done' : ''}`}>
        <div className="hunt-mission-head">
          <span className="hunt-mission-title">
            {missionDone ? <Sparkles size={16} aria-hidden="true" /> : <Target size={16} aria-hidden="true" />}
            {missionDone ? 'Mission accomplie !' : 'Mission du jour'}
          </span>
          <span className="hunt-mission-count">
            {todayCaught}/{todayCards.length || CARDS_PER_DAY}
            {!missionDone && <small> · +{MISSION_BONUS} XP bonus</small>}
          </span>
        </div>
        <div className="hunt-pips">
          {(todayCards.length ? todayCards : Array.from({ length: CARDS_PER_DAY })).map((c, i) => (
            <span
              key={c?.id ?? i}
              className={`hunt-pip${c && caught[c.id] ? ' filled' : ''}`}
              style={c ? { '--rarity': rarityOf(c).color } : undefined}
              title={c ? `${c.title} · ${rarityOf(c).label}` : 'Prochain tirage à 8h'}
            />
          ))}
        </div>
      </section>

      {/* ── Collection par rareté ── */}
      <div className="hunt-collection">
        {collection.map((r) => (
          <span key={r.id} className="hunt-chip" style={{ '--rarity': r.color }}>
            <Gem size={12} aria-hidden="true" />
            {r.count}
            <span className="hunt-chip-label">{r.label}</span>
          </span>
        ))}
      </div>

      <div className="hunt-filters" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`hunt-filter${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="hunt-empty">Aucune carte pour l'instant : le premier tirage arrive à 8h.</p>
      )}
      {cards.length > 0 && visible.length === 0 && filter === 'caught' && (
        <p className="hunt-empty">Aucune carte capturée pour l’instant.</p>
      )}
      {cards.length > 0 && todoCount === 0 && filter !== 'caught' && (
        <div className={`hunt-bonus-draw${bonusState === 'error' ? ' error' : ''}`} role="status">
          <Gift size={18} aria-hidden="true" />
          {bonusState === 'error' ? (
            <>
              <span>Le tirage de la carte bonus a échoué.</span>
              <button className="hunt-retry" onClick={() => setBonusState('idle')}>
                <RotateCcw size={14} aria-hidden="true" /> Réessayer
              </button>
            </>
          ) : (
            <span>Tout est capturé, bravo ! Tirage d’une carte bonus…</span>
          )}
        </div>
      )}

      {days.map((day) => (
        <section key={day.date} className="hunt-day">
          <h3 className="hunt-day-title">{dayLabel(day.date, today)}</h3>
          <ul className="hunt-cards">
            {day.cards.map((c) => {
              const isCaught = Boolean(caught[c.id]);
              const r = rarityOf(c);
              return (
                <li
                  key={c.id}
                  className={`tcg rarity-${r.id}${isCaught ? ' caught' : ''}`}
                  style={{ '--rarity': r.color }}
                >
                  <div className="tcg-top">
                    <span className="tcg-rarity">
                      <Gem size={12} aria-hidden="true" />
                      {r.label}
                      {c.bonus && <span className="tcg-bonus">Bonus</span>}
                    </span>
                    <span className="tcg-meta">
                      {typeof c.views === 'number' && (
                        <>
                          <Eye size={12} aria-hidden="true" />
                          {c.views.toLocaleString('fr-FR')} vues/30 j ·{' '}
                        </>
                      )}
                      {r.xp} XP
                    </span>
                  </div>

                  <div className="tcg-main">
                    {c.thumb && <img className="tcg-thumb" src={c.thumb} alt="" loading="lazy" />}
                    <div className="tcg-body">
                      <div className="tcg-title-row">
                        <button className="tcg-title" onClick={() => copyTitle(c)} title="Copier le titre">
                          {c.title}
                        </button>
                        {copiedId === c.id && (
                          <span className="tcg-copied" role="status">
                            <Copy size={12} aria-hidden="true" /> Copié
                          </span>
                        )}
                      </div>
                      {c.description && <span className="tcg-desc">{c.description}</span>}
                      {c.extract && <p className="tcg-extract">{c.extract}</p>}
                    </div>
                  </div>

                  <div className="tcg-actions">
                    <a
                      className="tcg-link"
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Voir la page ${c.title} sur Wikipédia`}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Voir la page
                    </a>
                    <button
                      className="tcg-catch"
                      onClick={() => toggle(c)}
                      aria-pressed={isCaught}
                      aria-label={isCaught ? `Annuler la capture de ${c.title}` : `Capturer ${c.title}`}
                    >
                      <Check size={15} aria-hidden="true" />
                      {isCaught ? 'Capturée' : 'Capturer'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      </>
      )}

      {toast && (
        <div
          key={toast.text}
          className={`hunt-toast ${toast.kind}`}
          style={toast.color ? { '--rarity': toast.color } : undefined}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
