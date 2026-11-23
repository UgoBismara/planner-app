import { useEffect, useRef } from 'react';
import { FlaskConical, Package, PackageOpen, Sparkles } from 'lucide-react';

// Ouverture d'un coffre : il tremble (phase « shake »), puis s'ouvre sur le butin
export default function ChestReveal({ chest, phase, xpMult, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (phase === 'open') closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && phase === 'open' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onClose]);

  const { loot } = chest;
  const open = phase === 'open';
  return (
    <div className="chest-overlay" role="dialog" aria-modal="true" aria-label="Ouverture du coffre" onClick={open ? onClose : undefined}>
      <div
        className={`chest-card ${phase}${loot.jackpot ? ' jackpot' : ''}`}
        style={{ '--loot': loot.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chest-art">
          {open ? <PackageOpen size={72} strokeWidth={1.5} aria-hidden="true" /> : <Package size={72} strokeWidth={1.5} aria-hidden="true" />}
          {open && <Sparkles className="chest-sparkles" size={30} aria-hidden="true" />}
        </div>
        {open ? (
          <>
            <p className="chest-name">{loot.name}</p>
            <div className="chest-gains">
              {loot.xp > 0 && <span>+{Math.round(loot.xp * xpMult)} XP</span>}
              {loot.points > 0 && (
                <span>
                  +{loot.points} <FlaskConical size={16} aria-hidden="true" />
                </span>
              )}
            </div>
            <button ref={closeRef} className="chest-close" onClick={onClose}>
              Super !
            </button>
          </>
        ) : (
          <p className="chest-name">Ouverture…</p>
        )}
      </div>
    </div>
  );
}
