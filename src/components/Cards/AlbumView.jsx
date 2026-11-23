import {
  CalendarCheck,
  Eye,
  EyeOff,
  Flame,
  Landmark,
  Leaf,
  Library,
  Map as MapIcon,
  Palette,
  Shapes,
  Sparkle,
  UserRound,
  Volleyball,
} from 'lucide-react';
import { isShiny, rarityOf } from '../../data/wikimasters';
import { ALBUM_TIERS, THEMES, nextTierOf, themeIdOf, tierOf } from '../../data/wikiThemes';
import { initialOf } from '../../data/wikiAchievements';

const THEME_ICONS = {
  sport: Volleyball,
  people: UserRound,
  nature: Leaf,
  culture: Palette,
  history: Landmark,
  geo: MapIcon,
  misc: Shapes,
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ctx : contexte des succès (buildContext) pour les stats déjà calculées
export default function AlbumView({ ctx, fx, streak }) {
  const got = ctx.got;
  const letters = new Set(got.map((c) => initialOf(c.title)).filter(Boolean));
  const shinies = got.filter((c) => isShiny(c, fx.shinyRate));
  const withViews = got.filter((c) => typeof c.views === 'number');
  const top = withViews.reduce((a, b) => (!a || b.views > a.views ? b : a), null);
  const low = withViews.reduce((a, b) => (!a || b.views < a.views ? b : a), null);
  const totalViews = withViews.reduce((s, c) => s + c.views, 0);

  const stats = [
    { icon: Library, label: 'Cartes capturées', value: ctx.total },
    { icon: Sparkle, label: 'Brillantes', value: ctx.shiny },
    { icon: Flame, label: 'Série actuelle', value: streak, sub: `record ${ctx.bestStreak}` },
    { icon: CalendarCheck, label: 'Journées parfaites', value: ctx.perfectDays },
    { icon: Eye, label: 'Vues cumulées (30 j)', value: totalViews.toLocaleString('fr-FR') },
  ];

  return (
    <div className="album">
      <ul className="album-stats">
        {stats.map((s) => (
          <li key={s.label}>
            <s.icon size={16} aria-hidden="true" />
            <strong>{s.value}</strong>
            <span>{s.label}</span>
            {s.sub && <small>{s.sub}</small>}
          </li>
        ))}
      </ul>

      <h3 className="ach-group-title">
        Thèmes
        <small>
          paliers {ALBUM_TIERS.map((t) => t.min).join(' · ')}
        </small>
      </h3>
      <ul className="album-themes">
        {THEMES.map((t) => {
          const n = ctx.theme(t.id);
          const tier = tierOf(n);
          const next = nextTierOf(n);
          const prevMin = tier?.min ?? 0;
          const Icon = THEME_ICONS[t.id];
          return (
            <li key={t.id} className="album-theme" style={{ '--t': t.color, '--tier': tier?.color ?? 'transparent' }}>
              <span className="album-theme-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="album-theme-body">
                <div className="album-theme-row">
                  <span className="album-theme-name">{t.name}</span>
                  {tier && <span className="album-tier">{tier.label}</span>}
                </div>
                <div className="ach-progress">
                  <div className="ach-progress-bar album-bar">
                    <div style={{ width: next ? `${((n - prevMin) / (next.min - prevMin)) * 100}%` : '100%' }} />
                  </div>
                  <span>
                    {n}
                    {next ? `/${next.min}` : ''}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className="ach-group-title">
        Abécédaire
        <small>{letters.size}/26 lettres</small>
      </h3>
      <div className="album-letters" aria-label={`${letters.size} lettres sur 26`}>
        {LETTERS.map((l) => (
          <span key={l} className={letters.has(l) ? 'on' : ''}>
            {l}
          </span>
        ))}
      </div>

      {(top || low) && (
        <>
          <h3 className="ach-group-title">Records</h3>
          <ul className="album-records">
            {top && (
              <li style={{ '--rarity': rarityOf(top).color }}>
                <Eye size={15} aria-hidden="true" />
                <span>La plus lue</span>
                <a href={top.url} target="_blank" rel="noreferrer">
                  {top.title}
                </a>
                <small>{top.views.toLocaleString('fr-FR')} vues</small>
              </li>
            )}
            {low && low !== top && (
              <li style={{ '--rarity': rarityOf(low).color }}>
                <EyeOff size={15} aria-hidden="true" />
                <span>La plus confidentielle</span>
                <a href={low.url} target="_blank" rel="noreferrer">
                  {low.title}
                </a>
                <small>{low.views.toLocaleString('fr-FR')} vues</small>
              </li>
            )}
          </ul>
        </>
      )}

      <h3 className="ach-group-title">
        Vitrine des brillantes
        <small>{shinies.length}</small>
      </h3>
      {shinies.length === 0 ? (
        <p className="qst-empty">
          <Sparkle size={16} aria-hidden="true" /> Environ une carte sur {Math.round(1 / fx.shinyRate)} brille. Ouvre l’œil !
        </p>
      ) : (
        <ul className="album-shinies">
          {shinies.map((c) => (
            <li key={c.id} style={{ '--rarity': rarityOf(c).color, '--t': THEMES.find((t) => t.id === themeIdOf(c)).color }}>
              <a href={c.url} target="_blank" rel="noreferrer">
                <Sparkle size={12} aria-hidden="true" />
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
