import { useEffect, useState } from 'react';
import { Check, ChevronRight, Dices, Lock, Play, RotateCcw, Trophy, X } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { QUESTS_KEY, QUEST_LOG_KEY, dateKey } from '../../data/quests';
import {
  ATTEMPTS_KEY,
  DAYS_KEY,
  DIFFICULTIES,
  DOMAINS,
  DRILLS_KEY,
  ITEMS,
  READ_KEY,
  chapterById,
  chapterItems,
  computeStats,
  findMathsQuest,
  itemById,
  itemStatus,
  lastActivity,
  nextInChapter,
  pickSurprise,
  progressOf,
  questNeedsUpgrade,
  readKey,
  reviewQueue,
  shortDate,
  withAttempt,
  withDay,
  withDrill,
  withQuestDone,
} from '../../data/maths';
import { MATHS_ACHIEVEMENTS, unlockedAchievements } from '../../data/maths/achievements';
import { ChapterIcon, MathsAchievementIcon } from '../Icons';
import ChapterView from './ChapterView';
import ExerciseView from './ExerciseView';
import ItemMeta, { Stars } from './ItemMeta';
import './MathsBoard.css';

// Onglet « Maths » : accueil (progression, dé, révisions, chapitres, succès) et
// navigation interne vers un chapitre ou un exercice
export default function MathsBoard() {
  const [attempts, setAttempts] = useLocalStorage(ATTEMPTS_KEY, {});
  const [drills, setDrills] = useLocalStorage(DRILLS_KEY, {});
  const [read, setRead] = useLocalStorage(READ_KEY, {});
  const [days, setDays] = useLocalStorage(DAYS_KEY, []);
  // Lecture seule : la quête « Maths 15 min » se coche toute seule après un exercice
  const [quests] = useLocalStorage(QUESTS_KEY, []);
  const [questLog, setQuestLog] = useLocalStorage(QUEST_LOG_KEY, {});

  // { screen: 'home' } | { screen: 'chapter', chapterId, tab, section }
  // | { screen: 'exercise', itemId, from } (from : l'écran où revenir)
  const [view, setView] = useState({ screen: 'home' });
  const [difficulties, setDifficulties] = useState(DIFFICULTIES.map((d) => d.id));
  const [instance, setInstance] = useState(0); // remonte l'exercice : nouvel énoncé
  const [freshAchievements, setFreshAchievements] = useState([]);

  // Le bandeau des succès débloqués disparaît tout seul
  useEffect(() => {
    if (freshAchievements.length === 0) return undefined;
    const timer = setTimeout(() => setFreshAchievements([]), 6000);
    return () => clearTimeout(timer);
  }, [freshAchievements]);

  const todayKey = dateKey(new Date());
  const stats = computeStats({ attempts, drills, read, days });
  const unlocked = unlockedAchievements(stats);
  const mathsQuest = findMathsQuest(quests);
  const questDone = Boolean(mathsQuest && questLog[todayKey]?.done?.[mathsQuest.id]);

  const navigate = (next) => {
    window.scrollTo({ top: 0 });
    setView(next);
  };
  const goHome = () => navigate({ screen: 'home' });
  const openChapter = (chapterId, tab = 'cours', section = null) =>
    navigate({ screen: 'chapter', chapterId, tab, section });
  const openItem = (itemId) => {
    setInstance((n) => n + 1);
    navigate({ screen: 'exercise', itemId, from: view.screen === 'exercise' ? view.from : view });
  };

  const surprise = (excludeId = null) => {
    const item = pickSurprise({ attempts, drills, todayKey, difficulties, excludeId });
    if (item) openItem(item.id);
  };

  const toggleDifficulty = (id) =>
    setDifficulties((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next.length ? next : prev;
    });

  const toggleRead = (chapterId, sectionId) => {
    const key = readKey(chapterId, sectionId);
    setRead((prev) => {
      if (!prev[key]) return { ...prev, [key]: todayKey };
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  // Un résultat noté : historique, jour de maths, quête du jour et succès débloqués
  const record = (item, result) => {
    const now = new Date();
    const nextAttempts = item.generated ? attempts : withAttempt(attempts, item.id, result, now);
    const nextDrills = item.generated ? withDrill(drills, item.id, result, now) : drills;
    if (item.generated) setDrills((prev) => withDrill(prev, item.id, result, now));
    else setAttempts((prev) => withAttempt(prev, item.id, result, now));
    if (!days.includes(todayKey)) setDays((prev) => withDay(prev, now));

    // Exercice rédigé = la version complète de la quête ; entraînement = son minimum
    const level = item.generated ? 'min' : 'normal';
    if (mathsQuest && questNeedsUpgrade(questLog, mathsQuest.id, level, todayKey)) {
      setQuestLog((prev) =>
        questNeedsUpgrade(prev, mathsQuest.id, level, todayKey)
          ? withQuestDone(prev, mathsQuest.id, level, todayKey)
          : prev,
      );
    }

    const before = new Set(unlocked.map((a) => a.id));
    const after = unlockedAchievements(
      computeStats({ attempts: nextAttempts, drills: nextDrills, read, days: withDay(days, now) }),
    );
    const fresh = after.filter((a) => !before.has(a.id));
    if (fresh.length > 0) setFreshAchievements(fresh);
  };

  const toast = freshAchievements.length > 0 && (
    <div className="maths-toast" role="status">
      <Trophy size={18} aria-hidden="true" />
      <span>
        <strong>Succès débloqué{freshAchievements.length > 1 ? 's' : ''} :</strong>{' '}
        {freshAchievements.map((a) => a.title).join(', ')}
      </span>
      <button type="button" onClick={() => setFreshAchievements([])} aria-label="Fermer">
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );

  // ── Exercice ──
  if (view.screen === 'exercise') {
    const item = itemById(view.itemId);
    const next = nextInChapter(item.chapterId, item.id, attempts, drills);
    const from = view.from ?? { screen: 'home' };
    return (
      <div className="maths-board">
        {toast}
        <ExerciseView
          key={`${item.id}-${instance}`}
          item={item}
          status={itemStatus(item, attempts, drills, todayKey)}
          drill={drills[item.id]}
          todayKey={todayKey}
          hasNext={Boolean(next)}
          backLabel={from.screen === 'chapter' ? chapterById(from.chapterId).title : 'Maths'}
          onBack={() => navigate(from)}
          onRecord={(result) => record(item, result)}
          onNext={() => next && openItem(next.id)}
          onSurprise={() => surprise(item.id)}
          onRenew={() => {
            setInstance((n) => n + 1);
            window.scrollTo({ top: 0 });
          }}
        />
      </div>
    );
  }

  // ── Chapitre ──
  if (view.screen === 'chapter') {
    const chapter = chapterById(view.chapterId);
    return (
      <div className="maths-board">
        {toast}
        <ChapterView
          key={chapter.id}
          chapter={chapter}
          tab={view.tab}
          sectionFilter={view.section}
          attempts={attempts}
          drills={drills}
          read={read}
          todayKey={todayKey}
          onTab={(tab) => setView((v) => ({ ...v, tab }))}
          onSectionFilter={(section) => setView((v) => ({ ...v, section }))}
          onToggleRead={(sectionId) => toggleRead(chapter.id, sectionId)}
          onOpenItem={openItem}
          onBack={goHome}
        />
      </div>
    );
  }

  // ── Accueil ──
  const global = progressOf(ITEMS, attempts, drills);
  const { due, later } = reviewQueue(attempts, todayKey);
  const last = lastActivity(attempts, drills);
  const continueItem = last && nextInChapter(last.chapterId, last.id, attempts, drills);
  const available = DOMAINS.filter((d) => d.chapters.length > 0);
  const soon = DOMAINS.filter((d) => d.chapters.length === 0);
  const achievementsPercent = Math.floor((unlocked.length / MATHS_ACHIEVEMENTS.length) * 100);

  return (
    <div className="maths-board">
      {toast}
      <div className="maths-hero">
        <h2 className="maths-page-title">Maths</h2>
        {questDone && (
          <span className="maths-quest-badge">
            <Check size={14} aria-hidden="true" />
            Quête Maths du jour
          </span>
        )}
      </div>

      <div className="maths-stats">
        <div className="maths-stat">
          <span className="maths-stat-value">
            {global.done}
            <span className="maths-stat-total">/{global.total}</span>
          </span>
          <span className="maths-stat-label">exercices validés</span>
        </div>
        <div className="maths-stat">
          <span className="maths-stat-value">{global.percent} %</span>
          <span className="maths-stat-label">du contenu</span>
        </div>
        <div className="maths-stat">
          <span className="maths-stat-value">
            {unlocked.length}
            <span className="maths-stat-total">/{MATHS_ACHIEVEMENTS.length}</span>
          </span>
          <span className="maths-stat-label">succès</span>
        </div>
      </div>
      <div className="maths-bar maths-global-bar">
        <div className="maths-bar-fill" style={{ width: `${global.percent}%` }} />
      </div>

      <div className="maths-actions">
        {continueItem && (
          <button type="button" className="maths-continue" onClick={() => openItem(continueItem.id)}>
            <Play size={18} aria-hidden="true" />
            <span className="maths-continue-text">
              <strong>Continuer</strong>
              <span className="maths-continue-sub">
                {chapterById(continueItem.chapterId).title} · {continueItem.title}
              </span>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        )}
        <div className="maths-dice">
          <button type="button" className="maths-dice-btn" onClick={() => surprise()}>
            <Dices size={20} aria-hidden="true" />
            Surprends-moi
          </button>
          <div className="maths-chips" role="group" aria-label="Difficultés du tirage">
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
        </div>
      </div>

      {due.length > 0 && (
        <section className="maths-section">
          <div className="maths-header">
            <h3 className="maths-title">
              <RotateCcw size={17} style={{ color: 'var(--warning)' }} aria-hidden="true" />À retenter
            </h3>
            <span className="maths-count">{due.length}</span>
          </div>
          <p className="maths-hint">Des exercices qui ont résisté : c’est le moment de la revanche.</p>
          <ul className="maths-items">
            {due.map(({ item }) => (
              <li key={item.id}>
                <button type="button" className="maths-item" onClick={() => openItem(item.id)}>
                  <span className="maths-item-main">
                    <span className="maths-item-title">{item.title}</span>
                    <ItemMeta item={item}>
                      <span className="maths-meta-extra">{chapterById(item.chapterId).title}</span>
                    </ItemMeta>
                  </span>
                  <ChevronRight size={16} className="maths-item-chevron" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {due.length === 0 && later.length > 0 && (
        <p className="maths-hint maths-later">
          <RotateCcw size={14} aria-hidden="true" />
          {later.length} exercice{later.length > 1 ? 's reviendront' : ' reviendra'} pour une revanche
          (prochain : {shortDate(later[0].date)})
        </p>
      )}

      {available.map((domain) => {
        const domainProgress = progressOf(
          domain.chapters.flatMap((c) => chapterItems(c.id)),
          attempts,
          drills,
        );
        return (
          <section key={domain.id} className="maths-section">
            <div className="maths-header">
              <h3 className="maths-title">{domain.title}</h3>
              <span className="maths-count">{domainProgress.percent} %</span>
            </div>
            <ul className="maths-chapters">
              {domain.chapters.map((chapter) => {
                const p = progressOf(chapterItems(chapter.id), attempts, drills);
                return (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      className={`maths-chapter-card${p.percent === 100 ? ' complete' : ''}`}
                      onClick={() => openChapter(chapter.id)}
                    >
                      <span className="maths-chapter-icon">
                        <ChapterIcon id={chapter.id} size={20} />
                      </span>
                      <span className="maths-chapter-info">
                        <span className="maths-chapter-title">{chapter.title}</span>
                        <span className="maths-chapter-sub">
                          {chapter.levels} · {chapter.summary}
                        </span>
                        <span className="maths-progress">
                          <span className="maths-bar">
                            <span className="maths-bar-fill" style={{ width: `${p.percent}%` }} />
                          </span>
                          <span className="maths-progress-label">
                            {p.done}/{p.total}
                          </span>
                        </span>
                      </span>
                      <ChevronRight size={18} className="maths-item-chevron" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {soon.length > 0 && <p className="maths-soon">À venir : {soon.map((d) => d.title).join(' · ')}</p>}

      <div className="maths-header maths-achievements-header">
        <h3 className="maths-title">Succès</h3>
        <span className="maths-count">
          {unlocked.length}/{MATHS_ACHIEVEMENTS.length} · {achievementsPercent} %
        </span>
      </div>
      <ul className="maths-achievements">
        {MATHS_ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.includes(a);
          return (
            <li key={a.id} className={`maths-achievement${isUnlocked ? ' unlocked' : ''}`}>
              <span className="maths-achievement-icon">
                {isUnlocked ? <MathsAchievementIcon id={a.id} size={20} /> : <Lock size={18} aria-hidden="true" />}
              </span>
              <div>
                <div className="maths-achievement-title">{a.title}</div>
                <div className="maths-achievement-desc">{a.description}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
