import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Eye,
  FlaskConical,
  Gift,
  Image,
  Package,
  PackageOpen,
  Shapes,
  Sparkle,
  Gem,
  Target,
  Tag,
  Trophy,
} from 'lucide-react';
import { ALL_QUESTS_REWARD, QUEST_REWARD, WEEKLY_REWARD } from '../../data/wikiQuests';
import { themeById } from '../../data/wikiThemes';

const KIND_ICONS = {
  catch: Target,
  rare: Gem,
  uncommon: Gem,
  strong: Gem,
  epic: Gem,
  theme: Tag,
  photo: Image,
  variety: Shapes,
  bonus: Gift,
  views: Eye,
  mission: ClipboardCheck,
  perfect: CalendarDays,
  shiny: Sparkle,
};

const fmtDay = (iso, today) =>
  iso === today
    ? "Aujourd'hui"
    : new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

function Reward({ xp, points, mult }) {
  return (
    <span className="qst-reward">
      +{Math.round(xp * mult)} XP · +{points}
      <FlaskConical size={11} aria-hidden="true" />
    </span>
  );
}

function Quest({ q, reward, mult }) {
  const Icon = KIND_ICONS[q.kind] ?? Target;
  const color = q.theme ? themeById(q.theme).color : undefined;
  const fmt = (n) => (q.kind === 'views' ? n.toLocaleString('fr-FR') : n);
  return (
    <li className={`qst${q.done ? ' done' : ''}`} style={color ? { '--q': color } : undefined}>
      <span className="qst-icon">{q.done ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}</span>
      <div className="qst-body">
        <span className="qst-text">{q.text}</span>
        <div className="ach-progress">
          <div className="ach-progress-bar">
            <div style={{ width: `${(q.cur / q.target) * 100}%` }} />
          </div>
          <span>
            {fmt(q.cur)}/{fmt(q.target)}
          </span>
        </div>
      </div>
      <Reward {...reward} mult={mult} />
    </li>
  );
}

// quests : questBoard ; chests : chestsOf ; onOpen(chest)
export default function QuestsView({ quests, chests, progress, fx, today, onOpen, opening }) {
  const done = quests.today.filter((q) => q.done).length;
  const allDone = done === quests.today.length;
  const toOpen = chests.filter((c) => !c.opened);
  const opened = chests.filter((c) => c.opened);

  return (
    <div className="qsts">
      <div className={`qst-summary${allDone ? ' done' : ''}`}>
        <ClipboardCheck size={22} aria-hidden="true" />
        <div className="qst-summary-info">
          <div className="ach-summary-row">
            <span className="ach-summary-title">Quêtes du jour</span>
            <span className="qst-summary-count">
              {done}/{quests.today.length}
            </span>
          </div>
          <p className="ach-summary-hint">
            Nouvelles quêtes chaque jour à minuit · {quests.dailyDone} terminées au total
          </p>
        </div>
      </div>

      <ul className="qst-list">
        {quests.today.map((q) => (
          <Quest key={q.id} q={q} reward={QUEST_REWARD} mult={fx.xpMult} />
        ))}
        <li className={`qst qst-all${allDone ? ' done' : ''}`}>
          <span className="qst-icon">
            <Trophy size={16} aria-hidden="true" />
          </span>
          <div className="qst-body">
            <span className="qst-text">Bonus : toutes les quêtes du jour</span>
          </div>
          <Reward {...ALL_QUESTS_REWARD} mult={fx.xpMult} />
        </li>
      </ul>

      <h3 className="ach-group-title">
        Quête de la semaine
        <small>
          {quests.weekDaysLeft > 1 ? `encore ${quests.weekDaysLeft} jours` : 'dernier jour'}
        </small>
      </h3>
      <ul className="qst-list">
        <Quest q={quests.weekly} reward={WEEKLY_REWARD} mult={fx.xpMult} />
      </ul>

      <h3 className="ach-group-title">
        Coffres
        <small>{opened.length} ouverts</small>
      </h3>
      <div className="qst-empty chest-progress">
        <Package size={16} aria-hidden="true" />
        <span>
          Un coffre toutes les {progress.every} cartes capturées · encore{' '}
          <strong>{progress.every - progress.have}</strong> avant le prochain
        </span>
        <span className="hunt-chest-pips" aria-hidden="true">
          {Array.from({ length: progress.every }, (_, i) => (
            <span key={i} className={i < progress.have ? 'on' : ''} />
          ))}
        </span>
      </div>
      {toOpen.length > 0 && (
        <ul className="chest-list">
          {toOpen.map((c) => (
            <li key={c.id}>
              <button className="chest-btn" onClick={() => onOpen(c)} disabled={Boolean(opening)}>
                <Package size={26} aria-hidden="true" />
                <span>{c.n ? `Coffre n° ${c.n}` : fmtDay(c.date, today)}</span>
                <strong>Ouvrir</strong>
              </button>
            </li>
          ))}
        </ul>
      )}
      {opened.length > 0 && (
        <ul className="chest-log">
          {opened.slice(0, 7).map((c) => (
            <li key={c.id} style={{ '--loot': c.loot.color }}>
              <PackageOpen size={14} aria-hidden="true" />
              <span className="chest-log-day">{fmtDay(c.date, today)}</span>
              <span className="chest-log-name">{c.loot.name}</span>
              <span className="chest-log-gain">
                {c.loot.xp > 0 && `+${Math.round(c.loot.xp * fx.xpMult)} XP`}
                {c.loot.xp > 0 && c.loot.points > 0 && ' · '}
                {c.loot.points > 0 && `+${c.loot.points} pts`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
