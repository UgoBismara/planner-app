import {
  Award,
  CalendarCheck,
  Clock,
  Crown,
  Dumbbell,
  Flame,
  Footprints,
  Gem,
  Ghost,
  Gift,
  Library,
  Lock,
  Magnet,
  Mountain,
  Pickaxe,
  Rainbow,
  RotateCcw,
  Ruler,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Type,
  Zap,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/wikiAchievements';

const ICONS = {
  first: Footprints,
  col10: Library,
  col50: Library,
  col100: Library,
  col250: Library,
  col500: Crown,
  perfect1: CalendarCheck,
  perfect10: Star,
  streak3: Flame,
  streak7: Flame,
  streak30: Mountain,
  streak100: Mountain,
  rare1: Gem,
  epic1: Gem,
  leg1: Sparkles,
  leg5: Crown,
  rainbow: Rainbow,
  bonus1: Gift,
  bonus25: Gift,
  day15: Swords,
  lvl5: Award,
  lvl10: Dumbbell,
  lvl20: Trophy,
  ghost: Ghost,
  archeo: Pickaxe,
  time: Clock,
  long: Ruler,
  short: Type,
  comeback: RotateCcw,
  magnet: Magnet,
};

const fmtDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

// results : { [id]: { done, cur?, target? } } ; unlocked : { [id]: 'AAAA-MM-JJ' }
export default function AchievementsView({ results, unlocked }) {
  const isDone = (a) => Boolean(unlocked[a.id]) || results[a.id].done;
  const doneCount = ACHIEVEMENTS.filter(isDone).length;
  const pct = Math.round((doneCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="ach">
      <div className="ach-summary">
        <Trophy size={22} aria-hidden="true" />
        <div className="ach-summary-info">
          <div className="ach-summary-row">
            <span className="ach-summary-title">Succès</span>
            <span className="ach-summary-count">
              {doneCount}/{ACHIEVEMENTS.length} · {pct} %
            </span>
          </div>
          <div className="hunt-bar">
            <div className="ach-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <ul className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const done = isDone(a);
          const secret = a.hidden && !done;
          const r = results[a.id];
          const Icon = secret ? Lock : (ICONS[a.id] ?? Zap);
          return (
            <li key={a.id} className={`ach-tile${done ? ' done' : ''}${secret ? ' secret' : ''}`}>
              <span className="ach-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="ach-body">
                <span className="ach-name">{secret ? '???' : a.name}</span>
                <span className="ach-desc">{secret ? 'Succès caché' : a.desc}</span>
                {done && unlocked[a.id] && <span className="ach-date">Débloqué le {fmtDate(unlocked[a.id])}</span>}
                {!done && !secret && r.target > 1 && (
                  <div className="ach-progress">
                    <div className="ach-progress-bar">
                      <div style={{ width: `${(r.cur / r.target) * 100}%` }} />
                    </div>
                    <span>
                      {r.cur}/{r.target}
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
