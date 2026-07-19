import { useState } from 'react';
import { FOODS } from '../../data/foods';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const MEAL_LABELS = { breakfast: 'Petit-déjeuner', lunch: 'Déjeuner', snack: 'Goûter', dinner: 'Dîner' };

export default function FoodLogModal({ mealType, editEntry, onAdd, onClose }) {
  const [customFoods, setCustomFoods] = useLocalStorage('planner_custom_foods', []);

  const [search, setSearch] = useState('');

  // En mode édition, reconstruire les valeurs pour 100g à partir de l'entrée existante
  const [selected, setSelected] = useState(() => {
    if (!editEntry?.grams) return null;
    const f = editEntry.grams;
    return {
      name: editEntry.name,
      kcal:      Math.round(editEntry.kcal      / f * 100),
      proteines: Math.round((editEntry.proteines || 0) / f * 100 * 10) / 10,
      lipides:   Math.round((editEntry.lipides   || 0) / f * 100 * 10) / 10,
      glucides:  Math.round((editEntry.glucides  || 0) / f * 100 * 10) / 10,
      unit: editEntry.unit || 'g',
    };
  });
  const [qty, setQty] = useState(editEntry?.grams ? String(editEntry.grams) : '');

  const [isManual, setIsManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualKcal, setManualKcal] = useState('');
  const [manualP, setManualP] = useState('');
  const [manualL, setManualL] = useState('');
  const [manualG, setManualG] = useState('');
  const [manualUnit, setManualUnit] = useState('g');
  const [manualType, setManualType] = useState('portion'); // 'portion' | 'per100'

  const allFoods = [...FOODS, ...customFoods];

  const results = search.trim().length >= 1
    ? allFoods
        .filter((f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.cat.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Aliment sélectionné depuis la DB : calcul proportionnel
  const selUnit = selected?.unit || 'g';
  const qtyNum = Number(qty);
  const cKcal = selected && qty ? Math.round(selected.kcal * qtyNum / 100) : 0;
  const cP    = selected && qty ? Math.round(selected.proteines * qtyNum / 100 * 10) / 10 : 0;
  const cL    = selected && qty ? Math.round(selected.lipides   * qtyNum / 100 * 10) / 10 : 0;
  const cGlu  = selected && qty ? Math.round(selected.glucides  * qtyNum / 100 * 10) / 10 : 0;

  const deleteCustomFood = (id, e) => {
    e.stopPropagation();
    setCustomFoods((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSelectFood = (f) => {
    // Aliment perso à portion fixe → ajouter directement sans étape de quantité
    if (f.isCustom && f.isPortionFixed !== false) {
      onAdd({ id: Date.now(), name: f.name, kcal: f.kcal, grams: null, unit: f.unit || 'g', proteines: f.proteines, lipides: f.lipides, glucides: f.glucides });
    } else {
      setSelected(f);
    }
  };

  const handleSubmitQty = (e) => {
    e.preventDefault();
    if (!selected || !qty) return;
    onAdd({ id: Date.now(), name: selected.name, grams: qtyNum, unit: selUnit, kcal: cKcal, proteines: cP, lipides: cL, glucides: cGlu });
  };

  const handleSubmitManual = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualKcal) return;
    const isPer100 = manualType === 'per100';
    const customFood = {
      id: Date.now(),
      name: manualName.trim(),
      cat: 'Perso',
      unit: manualUnit,
      kcal: Number(manualKcal),
      proteines: Number(manualP) || 0,
      lipides: Number(manualL) || 0,
      glucides: Number(manualG) || 0,
      isCustom: true,
      isPortionFixed: !isPer100,
    };
    setCustomFoods((prev) => [...prev, customFood]);

    if (isPer100) {
      // Aliment per-100 : aller directement à l'étape quantité
      setSelected(customFood);
      setIsManual(false);
    } else {
      // Portion fixe : ajouter directement
      onAdd({ id: Date.now(), name: customFood.name, kcal: customFood.kcal, grams: null, unit: manualUnit, proteines: customFood.proteines, lipides: customFood.lipides, glucides: customFood.glucides });
    }
  };

  const isPortionCustom = (f) => f.isCustom && f.isPortionFixed !== false;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="food-log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editEntry ? 'Modifier' : 'Ajouter'} · {MEAL_LABELS[mealType]}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* ── Étape 1 : Recherche ── */}
        {!selected && !isManual && (
          <>
            <div className="food-search-row">
              <input
                autoFocus
                type="text"
                placeholder="Rechercher un aliment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {results.length > 0 && (
              <ul className="food-results">
                {results.map((f) => (
                  <li
                    key={f.id}
                    className={`food-result-item${f.isCustom ? ' food-result-custom' : ''}`}
                    onClick={() => handleSelectFood(f)}
                  >
                    <div className="food-result-top">
                      <span className="food-result-name">{f.name}</span>
                      {f.isCustom && (
                        <button className="food-result-del" onClick={(e) => deleteCustomFood(f.id, e)} title="Supprimer">×</button>
                      )}
                    </div>
                    <div className="food-result-meta">
                      <span className={`food-result-cat${f.isCustom ? ' food-result-cat-custom' : ''}`}>{f.cat}</span>
                      <span className="food-result-kcal">{f.kcal} kcal</span>
                      {!isPortionCustom(f) && (
                        <>
                          <span className="food-result-macros">P {f.proteines}g · L {f.lipides}g · G {f.glucides}g</span>
                          <span className="food-result-per">/ 100{f.unit || 'g'}</span>
                        </>
                      )}
                      {isPortionCustom(f) && <span className="food-result-per">/ portion</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {results.length === 0 && search.trim().length > 0 && (
              <p className="no-results">Aucun résultat pour « {search} »</p>
            )}
            <div className="food-modal-footer-actions">
              <button className="btn-manual-entry" onClick={() => setIsManual(true)}>
                + Ajouter manuellement
              </button>
            </div>
          </>
        )}

        {/* ── Étape 2 : Quantité (DB ou custom per-100) ── */}
        {selected && (
          <form onSubmit={handleSubmitQty}>
            <div className="food-selected-header">
              <button type="button" className="btn-back" onClick={() => { setSelected(null); setQty(''); }}>← Retour</button>
              <strong className="food-selected-name">{selected.name}</strong>
            </div>
            <div className="food-selected-ref">
              Pour 100{selUnit} : {selected.kcal} kcal · P {selected.proteines}g · L {selected.lipides}g · G {selected.glucides}g
            </div>
            <div className="food-qty-row">
              <label>Quantité</label>
              <div className="food-qty-input">
                <input
                  autoFocus
                  type="number"
                  min={1}
                  placeholder={selUnit === 'ml' ? '250' : '150'}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
                <span>{selUnit}</span>
              </div>
            </div>
            {qty > 0 && (
              <div className="food-computed-summary">
                <span className="food-computed-kcal">{cKcal} kcal</span>
                <span>P {cP}g</span>
                <span>L {cL}g</span>
                <span>G {cGlu}g</span>
              </div>
            )}
            <div className="modal-footer">
              <button type="submit" className="btn-primary" disabled={!qty}>{editEntry ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </form>
        )}

        {/* ── Saisie manuelle ── */}
        {isManual && (
          <form onSubmit={handleSubmitManual}>
            <div className="food-selected-header">
              <button type="button" className="btn-back" onClick={() => setIsManual(false)}>← Retour</button>
              <strong>Nouvel aliment</strong>
            </div>
            <div className="manual-form-body">

              {/* Type de saisie */}
              <div className="manual-type-toggle">
                <button
                  type="button"
                  className={`manual-type-btn${manualType === 'portion' ? ' active' : ''}`}
                  onClick={() => setManualType('portion')}
                >
                  Par portion
                </button>
                <button
                  type="button"
                  className={`manual-type-btn${manualType === 'per100' ? ' active' : ''}`}
                  onClick={() => setManualType('per100')}
                >
                  Pour 100g / 100mL
                </button>
              </div>

              <div className="form-group">
                <label>Nom *</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex : Café avec lait"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>

              {manualType === 'per100' && (
                <div className="form-group">
                  <label>Unité de mesure</label>
                  <div className="manual-unit-toggle">
                    <button type="button" className={`manual-type-btn${manualUnit === 'g' ? ' active' : ''}`} onClick={() => setManualUnit('g')}>grammes (g)</button>
                    <button type="button" className={`manual-type-btn${manualUnit === 'ml' ? ' active' : ''}`} onClick={() => setManualUnit('ml')}>millilitres (mL)</button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  Calories (kcal) *
                  <span className="form-hint">
                    {manualType === 'per100' ? ` pour 100${manualUnit}` : ' pour cette portion'}
                  </span>
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={manualKcal}
                  onChange={(e) => setManualKcal(e.target.value)}
                />
              </div>

              <div className="manual-macros-row">
                <div className="form-group">
                  <label>Protéines (g)</label>
                  <input type="number" min={0} step={0.1} placeholder="0" value={manualP} onChange={(e) => setManualP(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Lipides (g)</label>
                  <input type="number" min={0} step={0.1} placeholder="0" value={manualL} onChange={(e) => setManualL(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Glucides (g)</label>
                  <input type="number" min={0} step={0.1} placeholder="0" value={manualG} onChange={(e) => setManualG(e.target.value)} />
                </div>
              </div>

              <p className="manual-save-hint">
                {manualType === 'per100'
                  ? `Sauvegardé dans votre base · vous entrerez la quantité à chaque ajout.`
                  : `Sauvegardé dans votre base · ajouté en un clic.`}
              </p>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary" disabled={!manualName.trim() || !manualKcal}>
                {manualType === 'per100' ? 'Suivant →' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
