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
import { ALBUM_PAGE, PAGE_REWARD, THEMES, themeIdOf, tierOf } from '../../data/wikiThemes';
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

// ctx : contexte des succès (buildContext) pour les stats déjà calculées ;
// albums : econ.albums (mosaïques page par page)
export default function AlbumView({ ctx, fx, streak, albums }) {
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
        Albums
        <small>
          {albums.pages} page{albums.pages > 1 ? 's' : ''} complète{albums.pages > 1 ? 's' : ''} · +{PAGE_REWARD.xp} XP et +{PAGE_REWARD.points} pts par page
        </small>
      </h3>
      <ul className="album-mosaics">
        {albums.albums.map(({ theme: t, total, pages, page }) => {
          const tier = tierOf(total);
          const Icon = THEME_ICONS[t.id];
          return (
            <li key={t.id} className="album-mosaic" style={{ '--t': t.color, '--tier': tier?.color ?? 'transparent' }}>
              <div className="album-mosaic-head">
                <span className="album-theme-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="album-theme-name">{t.name}</span>
                {tier && <span className="album-tier">{tier.label}</span>}
                <span className="album-mosaic-page">
                  Page {pages + 1} · {page.length}/{ALBUM_PAGE}
                </span>
              </div>
              <div className="album-cells" aria-label={`${page.length} cases sur ${ALBUM_PAGE}`}>
                {Array.from({ length: ALBUM_PAGE }, (_, i) => {
                  const c = page[i];
                  return c ? (
                    <a
                      key={c.id}
                      className={`album-cell on${isShiny(c, fx.shinyRate) ? ' shiny' : ''}`}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ '--rarity': rarityOf(c).color }}
                      title={`${c.title} · ${rarityOf(c).label}`}
                      aria-label={c.title}
                    />
                  ) : (
                    <span key={i} className="album-cell" />
                  );
                })}
              </div>
              {pages > 0 && (
                <span className="album-mosaic-done">
                  {pages} page{pages > 1 ? 's' : ''} complète{pages > 1 ? 's' : ''} · {total} cartes au total
                </span>
              )}
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
