import { Gift, Lock, Snowflake, Star, X } from 'lucide-react';

// advent : econ.advent ; onOpen(case) ; xpMult : multiplicateur global
export default function AventPanel({ advent, onOpen, xpMult }) {
  if (!advent.visible) return null;
  if (advent.startsIn > 0) {
    return (
      <section className="avent teaser">
        <Snowflake size={18} aria-hidden="true" />
        <span>
          <strong>Calendrier de l’Avent</strong> dans {advent.startsIn} jour{advent.startsIn > 1 ? 's' : ''} : du 1er au 24 décembre,
          chaque jour de capture ouvre une case.
        </span>
      </section>
    );
  }

  return (
    <section className="avent">
      <div className="avent-head">
        <h3 className="avent-title">
          <Snowflake size={16} aria-hidden="true" /> Calendrier de l’Avent {advent.year}
        </h3>
        <span className="avent-count">{advent.openedThisYear}/24</span>
      </div>
      <ol className="avent-grid">
        {advent.cases.map((c) => {
          const canOpen = c.won && !c.opened && !c.future;
          const missed = !c.won && !c.future && !c.today;
          const label = c.opened
            ? `${c.n} décembre : ${c.loot.label}`
            : canOpen
              ? `Ouvrir la case du ${c.n} décembre`
              : missed
                ? `${c.n} décembre : manquée`
                : `${c.n} décembre`;
          return (
            <li key={c.n}>
              <button
                className={`avent-case${c.opened ? ' opened' : ''}${canOpen ? ' ready' : ''}${missed ? ' missed' : ''}${c.today ? ' today' : ''}${c.loot.jackpot && c.opened ? ' jackpot' : ''}`}
                onClick={() => canOpen && onOpen(c)}
                disabled={!canOpen}
                aria-label={label}
                title={label}
              >
                <span className="avent-n">{c.n}</span>
                {c.opened ? (
                  <span className="avent-loot">
                    {c.loot.jackpot ? <Star size={12} aria-hidden="true" /> : null}
                    {c.loot.xp ? `+${Math.round(c.loot.xp * xpMult)}` : `+${c.loot.points} pts`}
                  </span>
                ) : canOpen ? (
                  <Gift size={16} aria-hidden="true" />
                ) : missed ? (
                  <X size={14} aria-hidden="true" />
                ) : (
                  <Lock size={12} aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="avent-hint">Une capture dans la journée gagne la case du jour. Cases à ouvrir jusqu’au 31 décembre.</p>
    </section>
  );
}
