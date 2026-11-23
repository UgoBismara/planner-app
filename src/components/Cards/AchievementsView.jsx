import {
  ALargeSmall,
  Atom,
  Award,
  Boxes,
  CalendarCheck,
  CalendarDays,
  Clock,
  ClipboardCheck,
  Crown,
  Diamond,
  Dumbbell,
  FlaskConical,
  Flame,
  FlipHorizontal,
  Footprints,
  Gem,
  Ghost,
  Gift,
  GraduationCap,
  Hash,
  Hourglass,
  Landmark,
  Leaf,
  Library,
  ListChecks,
  Lock,
  Magnet,
  Map as MapIcon,
  Medal,
  Microscope,
  Mountain,
  Package,
  PackageOpen,
  Palette,
  Pickaxe,
  Puzzle,
  Rainbow,
  RotateCcw,
  Ruler,
  Scroll,
  Shapes,
  Sparkle,
  Sparkles,
  Spade,
  Star,
  Swords,
  Target,
  Trophy,
  Type,
  UserRound,
  Vault,
  Volleyball,
  Zap,
} from 'lucide-react';
import { ACHIEVEMENTS, ACH_GROUPS } from '../../data/wikiAchievements';
import { ACH_POINTS, ACH_POINTS_HIDDEN } from '../../data/wikiEconomy';

const ICONS = {
  first: Footprints,
  col10: Library,
  col50: Library,
  col100: Library,
  col250: Library,
  col500: Crown,
  col1000: Crown,
  bonus1: Gift,
  bonus25: Gift,
  bonus100: Gift,
  day15: Swords,
  day30: Swords,
  abc: ALargeSmall,
  perfect1: CalendarCheck,
  perfect10: Star,
  perfect30: Star,
  perfect100: Star,
  streak3: Flame,
  streak7: Flame,
  streak14: Flame,
  streak30: Mountain,
  streak100: Mountain,
  weekend: CalendarDays,
  rare1: Gem,
  rare25: Gem,
  epic1: Gem,
  epic10: Gem,
  leg1: Sparkles,
  leg5: Crown,
  rainbow: Rainbow,
  shiny1: Sparkle,
  shiny10: Sparkle,
  shiny25: Diamond,
  'theme-sport': Volleyball,
  'theme-people': UserRound,
  'theme-nature': Leaf,
  'theme-culture': Palette,
  'theme-history': Landmark,
  'theme-geo': MapIcon,
  alltheme: Shapes,
  theme50: Microscope,
  album: Puzzle,
  quest1: ClipboardCheck,
  quest25: ListChecks,
  quest100: Target,
  questday: Scroll,
  questday10: Scroll,
  weekly1: CalendarCheck,
  weekly5: CalendarDays,
  chest1: Package,
  chest10: PackageOpen,
  chest50: Boxes,
  lvl5: Award,
  lvl10: Dumbbell,
  lvl20: Trophy,
  lvl30: Medal,
  lvl50: GraduationCap,
  lab1: FlaskConical,
  lab10: Atom,
  laball: Medal,
  ghost: Ghost,
  archeo: Pickaxe,
  time: Clock,
  long: Ruler,
  short: Type,
  comeback: RotateCcw,
  magnet: Magnet,
  grail: Crown,
  jackpot: Vault,
  quinte: Spade,
  mirror: FlipHorizontal,
  digits: Hash,
  late: Hourglass,
  misc10: Shapes,
};

const fmtDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const rewardOf = (a) => (a.hidden ? ACH_POINTS_HIDDEN : ACH_POINTS);

// results : { [id]: { done, cur?, target? } } ; unlocked : { [id]: 'AAAA-MM-JJ' }
export default function AchievementsView({ results, unlocked }) {
  const isDone = (a) => Boolean(unlocked[a.id]) || results[a.id].done;
  const doneCount = ACHIEVEMENTS.filter(isDone).length;
  const pct = Math.round((doneCount / ACHIEVEMENTS.length) * 100);
  const pointsWon = ACHIEVEMENTS.filter(isDone).reduce((s, a) => s + rewardOf(a), 0);

  // Les 3 succès visibles les plus avancés : de quoi donner envie de les finir
  const close = ACHIEVEMENTS.filter((a) => !isDone(a) && !a.hidden && results[a.id].target > 1 && results[a.id].cur > 0)
    .map((a) => ({ a, ratio: results[a.id].cur / results[a.id].target }))
    .sort((x, y) => y.ratio - x.ratio)
    .slice(0, 3);

  const tile = (a) => {
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
        <span className="ach-reward" title="Points de recherche gagnés avec ce succès">
          +{rewardOf(a)}
          <FlaskConical size={11} aria-hidden="true" />
        </span>
      </li>
    );
  };

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
          <p className="ach-summary-hint">
            Chaque succès rapporte {ACH_POINTS} points de recherche ({ACH_POINTS_HIDDEN} s’il est caché) · {pointsWon} gagnés
          </p>
        </div>
      </div>

      {close.length > 0 && (
        <section className="ach-group">
          <h3 className="ach-group-title">Presque débloqués</h3>
          <ul className="ach-grid">{close.map(({ a }) => tile(a))}</ul>
        </section>
      )}

      {ACH_GROUPS.map((g) => {
        const list = ACHIEVEMENTS.filter((a) => a.group === g.id);
        const n = list.filter(isDone).length;
        return (
          <section key={g.id} className="ach-group">
            <h3 className="ach-group-title">
              {g.name}
              <small>
                {n}/{list.length}
              </small>
            </h3>
            <ul className="ach-grid">{list.map(tile)}</ul>
          </section>
        );
      })}
    </div>
  );
}
