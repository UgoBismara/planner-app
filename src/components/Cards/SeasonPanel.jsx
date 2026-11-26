import { Ghost, Medal, Swords, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { DIVISIONS, GHOST_REWARD, RANK_POINTS, WINDOW } from '../../data/wikiSeason';

// season : econ.season ; defis : econ.defis
export default function SeasonPanel({ season, defis }) {
  const div = DIVISIONS[season.division];
  const from = div.min;
  const to = season.next?.min ?? div.min;
  const pct = season.next ? ((season.points - from) / (to - from)) * 100 : 100;
  const past = season.seasons.filter((s) => s.finished).reverse();

  return (
    <div className="season">
      <section className="season-card" style={{ '--div': div.color }}>
        <div className="season-head">
          <span className="season-label">{season.current.label}</span>
          <span className="season-left">
            fin dans {season.daysLeft} jour{season.daysLeft > 1 ? 's' : ''}
          </span>
        </div>
        <div className="season-main">
          <span className="season-badge" aria-hidden="true">
            <Medal size={26} />
          </span>
          <div className="season-info">
            <div className="season-row">
              <strong className="season-div">{div.name}</strong>
              <span className="season-pts">
                {season.points} pts
                {season.trend !== 0 && (
                  <small className={season.trend > 0 ? 'up' : 'down'}>
                    {season.trend > 0 ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
                    {season.trend > 0 ? '+' : ''}
                    {season.trend} en 7 j
                  </small>
                )}
              </span>
            </div>
            <div className="hunt-bar">
              <div className="season-bar-fill" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <span className="season-sub">
              {season.next ? `${season.toNext} pts avant ${season.next.name}` : 'Division maximale !'}
              {season.expiring > 0 && ` · ${season.expiring} pts à défendre cette semaine`}
            </span>
          </div>
        </div>
        <ol className="season-ladder" aria-label="Divisions">
          {DIVISIONS.map((d, i) => (
            <li
              key={d.id}
              className={`${i === season.division ? 'cur' : ''}${i <= season.current.peak ? ' reached' : ''}`}
              style={{ '--d': d.color }}
              title={`${d.name} : ${d.min} pts · récompense ${d.reward.xp} XP`}
            >
              {d.name}
            </li>
          ))}
        </ol>
        <p className="season-rules">
          Classement glissant sur {WINDOW} jours : capture {RANK_POINTS.rarity.common} à {RANK_POINTS.rarity.legendary} pts selon
          la rareté, jour de capture +{RANK_POINTS.day}, défi réussi +{RANK_POINTS.defi}, journée parfaite +{RANK_POINTS.perfect}.
          En fin de mois, ta meilleure division rapporte sa récompense.
        </p>
      </section>

      <div className="season-stats">
        <span>
          <Swords size={14} aria-hidden="true" /> {defis.count} défi{defis.count > 1 ? 's' : ''} réussi{defis.count > 1 ? 's' : ''}
          <small> · record {defis.best} d’affilée</small>
        </span>
        <span className="season-friends" title="Le classement entre amis arrivera avec le multijoueur">
          <Users size={14} aria-hidden="true" /> Classement entre amis : bientôt
        </span>
      </div>

      <section className={`ghost${season.ghost.me > season.ghost.ghost ? ' ahead' : ''}`}>
        <span className="ghost-title">
          <Ghost size={16} aria-hidden="true" /> Rival fantôme : toi, la semaine dernière
        </span>
        <div className="ghost-duel">
          <span>
            Toi <strong>{season.ghost.me}</strong>
          </span>
          <span className="ghost-vs">vs</span>
          <span>
            <strong>{season.ghost.ghost}</strong> Fantôme
          </span>
        </div>
        <p className="ghost-sub">
          {season.ghost.me > season.ghost.ghost
            ? `Tu mènes de ${season.ghost.me - season.ghost.ghost} pts à ce stade de la semaine.`
            : season.ghost.me === season.ghost.ghost
              ? 'Égalité parfaite à ce stade de la semaine.'
              : `Ton fantôme mène de ${season.ghost.ghost - season.ghost.me} pts : rattrape-le !`}{' '}
          Semaine gagnée : +{GHOST_REWARD.xp} XP · {season.ghostWins} victoire{season.ghostWins > 1 ? 's' : ''}
        </p>
      </section>

      {past.length > 0 && (
        <>
          <h3 className="ach-group-title">Palmarès</h3>
          <ul className="season-history">
            {past.map((s) => (
              <li key={s.month} style={{ '--d': DIVISIONS[s.peak].color }}>
                <span>{s.label}</span>
                <strong>{DIVISIONS[s.peak].name}</strong>
                <small>+{s.reward.xp} XP</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
