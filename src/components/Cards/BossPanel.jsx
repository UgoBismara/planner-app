import { Skull, Swords, Trophy } from 'lucide-react';
import { BOSS_REWARD } from '../../data/wikiBoss';

// boss : econ.boss ; xpMult : multiplicateur global pour la récompense affichée
export default function BossPanel({ boss, xpMult }) {
  const { boss: b, dealt, killedOn, hits } = boss.current;
  const left = Math.max(0, b.hp - dealt);
  const pct = Math.max(0, (left / b.hp) * 100);
  const top = [...hits].sort((x, y) => y.dmg - x.dmg).slice(0, 3);

  return (
    <section className={`boss${killedOn ? ' dead' : ''}`}>
      <div className="boss-head">
        <span className="boss-icon" aria-hidden="true">
          {killedOn ? <Trophy size={22} /> : <Skull size={22} />}
        </span>
        <div className="boss-id">
          <span className="boss-kicker">Boss de la semaine</span>
          <strong className="boss-name">{b.name}</strong>
        </div>
        <span className="boss-left">
          {killedOn ? 'Vaincu !' : `${boss.daysLeft} j restant${boss.daysLeft > 1 ? 's' : ''}`}
        </span>
      </div>
      <div className="boss-hp" role="meter" aria-valuemin={0} aria-valuemax={b.hp} aria-valuenow={left} aria-label="Points de vie du boss">
        <div style={{ width: `${pct}%` }} />
        <span>
          {left} / {b.hp} PV
        </span>
      </div>
      <p className="boss-rule">
        <Swords size={13} aria-hidden="true" /> {b.rule} · <em>Faiblesse : {b.weakness}</em>
      </p>
      <p className="boss-reward">
        {killedOn
          ? `+${Math.round(BOSS_REWARD.xp * xpMult)} XP et +${BOSS_REWARD.points} pts gagnés`
          : `Récompense : +${Math.round(BOSS_REWARD.xp * xpMult)} XP et +${BOSS_REWARD.points} pts · tes captures infligent leur XP en dégâts`}
        {boss.kills > 0 && ` · ${boss.kills} boss vaincu${boss.kills > 1 ? 's' : ''} au total`}
      </p>
      {top.length > 0 && (
        <ul className="boss-hits">
          {top.map((h) => (
            <li key={h.card.id}>
              <span>{h.card.title}</span>
              <strong>−{h.dmg}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
