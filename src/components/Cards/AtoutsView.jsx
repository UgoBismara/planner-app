import { useState } from 'react';
import { Lock, LockOpen, Plus, Spade, Wand2, X } from 'lucide-react';
import { ATOUTS, SLOT_STEPS, atoutById } from '../../data/wikiAtouts';

// atouts : econ.atouts ({ unlocked, slots, today, stats }) ; locked : une capture a
// déjà eu lieu aujourd'hui, l'équipement est figé jusqu'à demain
export default function AtoutsView({ atouts, modifier, locked, onSave }) {
  const [draft, setDraft] = useState(null); // équipement en cours de modification
  const equipped = draft ?? atouts.today.filter((id) => atouts.unlocked.includes(id)).slice(0, atouts.slots);
  const dirty = draft !== null;

  const toggle = (id) => {
    if (locked) return;
    const cur = equipped;
    if (cur.includes(id)) setDraft(cur.filter((x) => x !== id));
    else if (cur.length < atouts.slots) setDraft([...cur, id]);
  };

  const save = () => {
    onSave(equipped);
    setDraft(null);
  };

  const nextSlot = SLOT_STEPS.find((n) => atouts.stats.total < n);

  return (
    <div className="atouts">
      <section className="atouts-hand">
        <div className="atouts-hand-head">
          <span className="atouts-hand-title">
            <Spade size={16} aria-hidden="true" /> Ta main du jour
          </span>
          <span className={`atouts-lock${locked ? ' on' : ''}`}>
            {locked ? <Lock size={13} aria-hidden="true" /> : <LockOpen size={13} aria-hidden="true" />}
            {locked ? 'Figée jusqu’à demain' : 'Modifiable jusqu’à ta première capture'}
          </span>
        </div>
        <ul className="atouts-slots">
          {Array.from({ length: atouts.slots }, (_, i) => {
            const a = atoutById(equipped[i]);
            return (
              <li key={i} className={`atouts-slot${a ? ' filled' : ''}`}>
                {a ? (
                  <>
                    <strong>{a.name}</strong>
                    <span>{a.desc}</span>
                    {!locked && (
                      <button onClick={() => toggle(a.id)} aria-label={`Retirer ${a.name}`}>
                        <X size={14} aria-hidden="true" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="atouts-slot-empty">
                    <Plus size={14} aria-hidden="true" /> Emplacement libre
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="atouts-hint">
          <Wand2 size={13} aria-hidden="true" /> Aujourd’hui : <strong>{modifier.name}</strong> — {modifier.desc}. Choisis des atouts
          qui vont avec.
          {nextSlot && ` Prochain emplacement à ${nextSlot} captures (${atouts.stats.total}/${nextSlot}).`}
        </p>
        {dirty && (
          <div className="atouts-actions">
            <button className="atouts-cancel" onClick={() => setDraft(null)}>
              Annuler
            </button>
            <button className="atouts-save" onClick={save}>
              Équiper
            </button>
          </div>
        )}
      </section>

      <h3 className="ach-group-title">
        Collection
        <small>
          {atouts.unlocked.length}/{ATOUTS.length} débloqués
        </small>
      </h3>
      <ul className="atouts-grid">
        {ATOUTS.map((a) => {
          const owned = atouts.unlocked.includes(a.id);
          const on = equipped.includes(a.id);
          const full = !on && equipped.length >= atouts.slots;
          return (
            <li key={a.id}>
              <button
                className={`atout${owned ? '' : ' locked'}${on ? ' on' : ''}`}
                onClick={() => toggle(a.id)}
                disabled={!owned || locked || full}
                aria-pressed={on}
              >
                <span className="atout-name">{a.name}</span>
                <span className="atout-desc">{a.desc}</span>
                {!owned && (
                  <span className="atout-unlock">
                    <Lock size={11} aria-hidden="true" /> {a.unlock}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
