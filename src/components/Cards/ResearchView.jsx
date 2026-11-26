import { BookOpen, Check, Coins, FlaskConical, Layers, Lock, Telescope } from 'lucide-react';
import {
  BRANCHES,
  POINTS_BY_RARITY,
  POINTS_PER_DAY,
  POINTS_PER_PERFECT_DAY,
  RESEARCH,
  researchById,
  statusOf,
} from '../../data/wikiResearch';

const BRANCH_ICONS = { collect: Layers, flair: Telescope, lore: BookOpen, fortune: Coins };

// points : points disponibles ; unlocked : { [id]: 'AAAA-MM-JJ' }
export default function ResearchView({ points, earned, unlocked, onResearch, busy }) {
  const doneCount = RESEARCH.filter((r) => unlocked[r.id]).length;

  return (
    <div className="lab">
      <div className="lab-summary">
        <FlaskConical size={22} aria-hidden="true" />
        <div className="lab-summary-info">
          <div className="lab-summary-row">
            <span className="lab-points">
              {points} <small>point{points > 1 ? 's' : ''} de recherche</small>
            </span>
            <span className="lab-count">
              {doneCount}/{RESEARCH.length}
            </span>
          </div>
          <p className="lab-hint">
            Capture : {POINTS_BY_RARITY.common} pt (Commune) à {POINTS_BY_RARITY.legendary} pts (Légendaire) ·
            jour de capture : +{POINTS_PER_DAY} · journée parfaite : +{POINTS_PER_PERFECT_DAY} · quêtes, défis, albums, saisons, coffres et succès en rapportent aussi · {earned} gagnés au total
          </p>
        </div>
      </div>

      {BRANCHES.map((b) => {
        const Icon = BRANCH_ICONS[b.id];
        return (
          <section key={b.id} className="lab-branch">
            <h3 className="lab-branch-title">
              <Icon size={16} aria-hidden="true" />
              {b.name}
              <small>{b.desc}</small>
            </h3>
            <ol className="lab-nodes">
              {RESEARCH.filter((r) => r.branch === b.id).map((r) => {
                const st = statusOf(r, unlocked, points);
                return (
                  <li key={r.id} className={`lab-node ${st}`}>
                    <span className="lab-node-icon">
                      {st === 'done' ? <Check size={16} /> : st === 'locked' ? <Lock size={14} /> : <FlaskConical size={15} />}
                    </span>
                    <div className="lab-node-body">
                      <span className="lab-node-name">{r.name}</span>
                      <span className="lab-node-desc">{r.desc}</span>
                      {st === 'locked' && (
                        <span className="lab-node-req">Après « {researchById(r.requires).name} »</span>
                      )}
                    </div>
                    {st === 'done' ? (
                      <span className="lab-node-done">Acquise</span>
                    ) : (
                      <button
                        className="lab-node-buy"
                        disabled={st !== 'available' || busy}
                        onClick={() => onResearch(r)}
                        aria-label={`Rechercher ${r.name} pour ${r.cost} points`}
                      >
                        {r.cost} pts
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
