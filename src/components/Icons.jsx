// Icônes de l'appli : une seule famille (Lucide, au trait), couleur du texte.
// Les données gardent des identifiants (domaine, type de quête…) : l'icône
// correspondante est choisie ici, pour que tout l'écran reste homogène.
import {
  Apple,
  Award,
  BatteryLow,
  BatteryMedium,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Check,
  ClipboardList,
  Compass,
  Crosshair,
  Crown,
  Dumbbell,
  Flame,
  Footprints,
  House,
  Lightbulb,
  Link2,
  Moon,
  Mountain,
  NotebookPen,
  PenLine,
  Repeat,
  Rocket,
  RotateCcw,
  Shield,
  ShieldCheck,
  SquareCheck,
  Sprout,
  Star,
  Tag,
  Target,
  Ticket,
  TreeDeciduous,
  Trophy,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';

// colors : couleur propre à chaque identifiant (mêmes teintes que les types
// d'événements), sauf si l'appelant en impose une via style
function mapped(map, fallback, colors) {
  return function MappedIcon({ id, size = 15, style, ...props }) {
    const Icon = map[id] ?? fallback;
    return (
      <Icon
        size={size}
        strokeWidth={2}
        aria-hidden="true"
        style={colors?.[id] ? { color: colors[id], ...style } : style}
        {...props}
      />
    );
  };
}

export const TabIcon = mapped(
  {
    week: CalendarDays,
    quests: Trophy,
    journal: NotebookPen,
    meals: UtensilsCrossed,
    nutrition: Apple,
    ideas: Lightbulb,
    vinted: Tag,
  },
  CalendarDays,
);

// Teintes partagées avec les types d'événements (data/eventTypes.js)
const RED = '#FF453A';
const ORANGE = '#FF9F0A';
const YELLOW = '#FFD60A';
const GREEN = '#30D158';
const MINT = '#63E6E2';
const BLUE = '#0A84FF';
const PURPLE = '#BF5AF2';

export const DomainIcon = mapped(
  { sport: Dumbbell, work: Briefcase, perso: Rocket, daily: House },
  Dumbbell,
  { sport: RED, work: BLUE, perso: PURPLE, daily: YELLOW },
);

export const QuestTypeIcon = mapped(
  { daily: SquareCheck, weekly: Repeat, target: Target, habit: Sprout },
  SquareCheck,
  { daily: GREEN, weekly: BLUE, target: ORANGE, habit: MINT },
);

export const ChallengeKindIcon = mapped(
  { monthly: Star, long: Mountain },
  Star,
  { monthly: YELLOW, long: PURPLE },
);

export const EnergyIcon = mapped(
  { low: BatteryLow, mid: BatteryMedium, high: Zap },
  BatteryMedium,
  { low: RED, mid: GREEN, high: YELLOW },
);

export const IdeaTypeIcon = mapped(
  { event: CalendarDays, goal: Target },
  CalendarDays,
  { event: BLUE, goal: ORANGE },
);

export const VintedStatusIcon = mapped(
  { draft: PenLine, ready: ClipboardList, published: Check },
  PenLine,
  { draft: ORANGE, ready: BLUE, published: GREEN },
);

export const AchievementIcon = mapped(
  {
    first_step: Footprints,
    low_day: BatteryLow,
    streak_7: Flame,
    week_1: CalendarCheck,
    target_1: Target,
    perfect_week: CalendarDays,
    joker_saved: Ticket,
    comeback: RotateCcw,
    low_5: Shield,
    habit_1: Sprout,
    week_streak_4: CalendarRange,
    no_double_30: ShieldCheck,
    streak_30: Link2,
    target_3: Crosshair,
    monthly_3: Moon,
    long_1: Mountain,
    normal_50: Dumbbell,
    full_season: Trophy,
    week_streak_12: Compass,
    habit_3: TreeDeciduous,
    total_100: Award,
    streak_100: Crown,
  },
  Award,
);
