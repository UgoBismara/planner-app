import { useState, useRef } from 'react';
import { FOODS, PORTIONS } from '../../data/foods';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const MEAL_LABELS = { lunch: 'Déjeuner', dinner: 'Dîner' };

export default function FoodLogModal({ mealType, editEntry, onAdd, onClose }) {
  const [customFoods, setCustomFoods] = useLocalStorage('planner_custom_foods', []);
  const [verifiedIds, setVerifiedIds] = useLocalStorage('planner_foods_verified', []);

  const [search, setSearch] = useState('');
  const [filterUnverified, setFilterUnverified] = useState(false);

  const [selected, setSelected] = useState(() => {
    if (!editEntry?.grams) return null;
    const f = editEntry.grams;
    return {
      id: editEntry.foodId,
      name: editEntry.name,
      kcal:      Math.round(editEntry.kcal      / f * 100),
      proteines: Math.round((editEntry.proteines || 0) / f * 100 * 10) / 10,
      lipides:   Math.round((editEntry.lipides   || 0) / f * 100 * 10) / 10,
      glucides:  Math.round((editEntry.glucides  || 0) / f * 100 * 10) / 10,
      unit: editEntry.unit || 'g',
    };
  });
  const [qty, setQty] = useState(editEntry?.grams && !editEntry?.portions ? String(editEntry.grams) : '');
  const [mode, setMode] = useState(() => editEntry?.portions ? 'portion' : 'g');
  const [portions, setPortions] = useState(() => editEntry?.portions ? String(editEntry.portions) : '');

  const [isManual, setIsManual] = useState(false);
  const [editingCustomFood, setEditingCustomFood] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [manualName, setManualName] = useState('');
  const [manualKcal, setManualKcal] = useState('');
  const [manualP, setManualP] = useState('');
  const [manualL, setManualL] = useState('');
  const [manualG, setManualG] = useState('');
  const [manualUnit, setManualUnit] = useState('g');
  const [manualType, setManualType] = useState('portion');

  const allFoods = [...FOODS, ...customFoods];
  const dbFoods = FOODS.filter((f) => !f.isCustom);

  const isVerified = (id) => verifiedIds.includes(id);
  const toggleVerify = (id, e) => {
    e.stopPropagation();
    setVerifiedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const verifiedCount = dbFoods.filter((f) => isVerified(f.id)).length;
  const totalDb = dbFoods.length;

  const baseResults = search.trim().length >= 1
    ? allFoods.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.cat.toLowerCase().includes(search.toLowerCase())
      )
    : filterUnverified
      ? allFoods.filter((f) => !f.isCustom && !isVerified(f.id))
      : [];

  const results = filterUnverified
    ? baseResults.slice(0, 30)
    : baseResults.slice(0, 10);

  const portionDef = selected?.id ? PORTIONS[selected.id] : null;
  const selUnit = selected?.unit || 'g';
  const qtyNum = Number(qty);
  const portionCount = Number(portions);
  const portionGrams = portionDef ? portionCount * portionDef.g : 0;
  const effectiveGrams = mode === 'portion' ? portionGrams : qtyNum;

  const cKcal = selected && effectiveGrams ? Math.round(selected.kcal * effectiveGrams / 100) : 0;
  const cP    = selected && effectiveGrams ? Math.round(selected.proteines * effectiveGrams / 100 * 10) / 10 : 0;
  const cL    = selected && effectiveGrams ? Math.round(selected.lipides   * effectiveGrams / 100 * 10) / 10 : 0;
  const cGlu  = selected && effectiveGrams ? Math.round(selected.glucides  * effectiveGrams / 100 * 10) / 10 : 0;
  const hasPreview = mode === 'portion' ? portionCount > 0 : qtyNum > 0;

  const deleteCustomFood = (id, e) => {
    e.stopPropagation();
    setCustomFoods((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSelectFood = (f) => {
    if (f.isCustom && f.isPortionFixed !== false) {
      onAdd({ id: Date.now(), name: f.name, kcal: f.kcal, grams: null, unit: f.unit || 'g', proteines: f.proteines, lipides: f.lipides, glucides: f.glucides });
    } else {
      setSelected(f);
      setMode('g');
      setPortions('');
      setQty('');
    }
  };

  const handleSubmitQty = (e) => {
    e.preventDefault();
    if (!selected) return;
    if (mode === 'portion') {
      if (!portions || portionCount <= 0) return;
      onAdd({ id: Date.now(), foodId: selected.id, name: selected.name, grams: portionGrams, portions: portionCount, portionLabel: portionDef.label, unit: 'g', kcal: cKcal, proteines: cP, lipides: cL, glucides: cGlu });
    } else {
      if (!qty) return;
      onAdd({ id: Date.now(), foodId: selected.id, name: selected.name, grams: qtyNum, unit: selUnit, kcal: cKcal, proteines: cP, lipides: cL, glucides: cGlu });
    }
  };

  const openEditCustomFood = (food, e) => {
    e.stopPropagation();
    setEditingCustomFood(food);
    setManualName(food.name);
    setManualKcal(String(food.kcal));
    setManualP(String(food.proteines || 0));
    setManualL(String(food.lipides || 0));
    setManualG(String(food.glucides || 0));
    setManualUnit(food.unit || 'g');
    setManualType(food.isPortionFixed !== false ? 'portion' : 'per100');
    setIsManual(true);
  };

  const closeManual = () => {
    setIsManual(false);
    setEditingCustomFood(null);
    setManualName('');
    setManualKcal('');
    setManualP('');
    setManualL('');
    setManualG('');
  };

  const handleSubmitManual = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualKcal) return;
    const isPer100 = manualType === 'per100';
    const foodData = {
      id: editingCustomFood ? editingCustomFood.id : Date.now(),
      name: manualName.trim(),
      cat: editingCustomFood?.cat || 'Perso',
      unit: manualUnit,
      kcal: Number(manualKcal),
      proteines: Number(manualP) || 0,
      lipides: Number(manualL) || 0,
      glucides: Number(manualG) || 0,
      isCustom: true,
      isPortionFixed: !isPer100,
    };

    if (editingCustomFood) {
      setCustomFoods((prev) => prev.map((f) => f.id === editingCustomFood.id ? foodData : f));
      closeManual();
    } else {
      setCustomFoods((prev) => [...prev, foodData]);
      if (isPer100) {
        setSelected(foodData);
        setIsManual(false);
      } else {
        onAdd({ id: Date.now(), name: foodData.name, kcal: foodData.kcal, grams: null, unit: manualUnit, proteines: foodData.proteines, lipides: foodData.lipides, glucides: foodData.glucides });
      }
    }
  };

  const resizeAndEncode = (file, maxPx) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.onerror = reject;
      img.src = url;
    });

  const handleScanFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setScanning(true);
    setScanError('');
    try {
      const image = await resizeAndEncode(file, 1200);
      const res = await fetch('/api/analyze-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, mediaType: 'image/jpeg' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur serveur');
      }
      const data = await res.json();
      setManualName(data.name || '');
      setManualKcal(data.kcal != null ? String(data.kcal) : '');
      setManualP(data.proteines != null ? String(data.proteines) : '');
      setManualL(data.lipides != null ? String(data.lipides) : '');
      setManualG(data.glucides != null ? String(data.glucides) : '');
      setManualUnit(data.unit === 'ml' ? 'ml' : 'g');
      setManualType('per100');
      setIsManual(true);
    } catch (err) {
      setScanError(err.message || 'Impossible d\'analyser — essaie avec une meilleure photo.');
    } finally {
      setScanning(false);
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

            {/* Barre de vérification */}
            <div className="food-verify-bar">
              <div className="food-verify-progress">
                <div
                  className="food-verify-fill"
                  style={{ width: `${Math.round(verifiedCount / totalDb * 100)}%` }}
                />
              </div>
              <span className="food-verify-count">{verifiedCount}/{totalDb} vérifiés</span>
              <button
                className={`food-verify-filter${filterUnverified ? ' active' : ''}`}
                onClick={() => setFilterUnverified((v) => !v)}
                title="Voir seulement les aliments non vérifiés"
              >
                {filterUnverified ? 'Tous' : `⚠ À vérifier`}
              </button>
            </div>

            {results.length > 0 && (
              <ul className="food-results">
                {results.map((f) => {
                  const verified = isVerified(f.id);
                  return (
                    <li
                      key={f.id}
                      className={`food-result-item${f.isCustom ? ' food-result-custom' : ''}${verified ? ' food-result-verified' : ''}`}
                      onClick={() => handleSelectFood(f)}
                    >
                      <div className="food-result-top">
                        <span className="food-result-name">{f.name}</span>
                        <div className="food-result-actions">
                          {!f.isCustom && (
                            <button
                              className={`food-verify-btn${verified ? ' verified' : ''}`}
                              onClick={(e) => toggleVerify(f.id, e)}
                              title={verified ? 'Valeurs vérifiées — cliquer pour retirer' : 'Cliquer pour marquer comme vérifié'}
                            >
                              {verified ? '✓' : '?'}
                            </button>
                          )}
                          {f.isCustom && (
                            <>
                              <button className="food-result-edit-btn" onClick={(e) => openEditCustomFood(f, e)} title="Modifier">✎</button>
                              <button className="food-result-del" onClick={(e) => deleteCustomFood(f.id, e)} title="Supprimer">×</button>
                            </>
                          )}
                        </div>
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
                        {PORTIONS[f.id] && (
                          <span className="food-result-portion-hint">· 1 {PORTIONS[f.id].label} = {PORTIONS[f.id].g}g</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {results.length === 0 && (search.trim().length > 0 || filterUnverified) && (
              <p className="no-results">
                {filterUnverified && search.trim().length === 0
                  ? 'Tous les aliments sont vérifiés ✓'
                  : `Aucun résultat pour « ${search} »`}
              </p>
            )}

            {!filterUnverified && results.length === 0 && search.trim().length === 0 && (
              <p className="no-results search-hint">Tapez pour rechercher ou activez « À vérifier »</p>
            )}

            <div className="food-modal-footer-actions">
              <div className="scan-btn-row">
                <button
                  className="btn-scan-label"
                  onClick={() => { setScanError(''); fileInputRef.current?.click(); }}
                  disabled={scanning}
                  title="Prendre une photo maintenant"
                >
                  {scanning ? '⏳ Analyse…' : '📷 Appareil photo'}
                </button>
                <button
                  className="btn-scan-label btn-scan-gallery"
                  onClick={() => { setScanError(''); galleryInputRef.current?.click(); }}
                  disabled={scanning}
                  title="Choisir une photo existante"
                >
                  🖼 Photothèque
                </button>
              </div>
              <button className="btn-manual-entry" onClick={() => setIsManual(true)}>
                + Saisie manuelle
              </button>
              {scanError && <p className="scan-error">{scanError}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleScanFile}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleScanFile}
              />
            </div>
          </>
        )}

        {/* ── Étape 2 : Quantité / Portion ── */}
        {selected && (
          <form onSubmit={handleSubmitQty}>
            <div className="food-selected-header">
              <button type="button" className="btn-back" onClick={() => { setSelected(null); setQty(''); setPortions(''); setMode('g'); }}>← Retour</button>
              <strong className="food-selected-name">{selected.name}</strong>
              {selected.id && (
                <button
                  type="button"
                  className={`food-verify-btn inline${isVerified(selected.id) ? ' verified' : ''}`}
                  onClick={(e) => toggleVerify(selected.id, e)}
                  title={isVerified(selected.id) ? 'Valeurs vérifiées' : 'Marquer comme vérifié'}
                >
                  {isVerified(selected.id) ? '✓' : '?'}
                </button>
              )}
            </div>

            {portionDef && (
              <div className="food-mode-toggle">
                <button type="button" className={`food-mode-btn${mode === 'g' ? ' active' : ''}`} onClick={() => setMode('g')}>En grammes</button>
                <button type="button" className={`food-mode-btn${mode === 'portion' ? ' active' : ''}`} onClick={() => setMode('portion')}>Par portion</button>
              </div>
            )}

            {mode === 'g' && (
              <>
                <div className="food-selected-ref">
                  Pour 100{selUnit} : {selected.kcal} kcal · P {selected.proteines}g · L {selected.lipides}g · G {selected.glucides}g
                </div>
                <div className="food-qty-row">
                  <label>Quantité</label>
                  <div className="food-qty-input">
                    <input autoFocus type="number" min={1} placeholder={selUnit === 'ml' ? '250' : '150'} value={qty} onChange={(e) => setQty(e.target.value)} />
                    <span>{selUnit}</span>
                  </div>
                </div>
              </>
            )}

            {mode === 'portion' && portionDef && (
              <>
                <div className="food-selected-ref">
                  1 {portionDef.label} = {portionDef.g}g · {Math.round(selected.kcal * portionDef.g / 100)} kcal
                </div>
                <div className="food-qty-row">
                  <label>Nombre de portions</label>
                  <div className="food-qty-input">
                    <input autoFocus type="number" min={1} step={1} placeholder="1" value={portions} onChange={(e) => setPortions(e.target.value)} />
                    <span>{portionDef.label}</span>
                  </div>
                </div>
              </>
            )}

            {hasPreview && (
              <div className="food-computed-summary">
                <span className="food-computed-kcal">{cKcal} kcal</span>
                <span>P {cP}g</span>
                <span>L {cL}g</span>
                <span>G {cGlu}g</span>
                {mode === 'portion' && portionDef && (
                  <span className="food-computed-grams">= {portionGrams}g</span>
                )}
              </div>
            )}
            <div className="modal-footer">
              <button type="submit" className="btn-primary" disabled={mode === 'portion' ? !portions || portionCount <= 0 : !qty}>
                {editEntry ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}

        {/* ── Saisie manuelle ── */}
        {isManual && (
          <form onSubmit={handleSubmitManual}>
            <div className="food-selected-header">
              <button type="button" className="btn-back" onClick={closeManual}>← Retour</button>
              <strong>{editingCustomFood ? `Modifier · ${editingCustomFood.name}` : 'Nouvel aliment'}</strong>
            </div>
            <div className="manual-form-body">
              <div className="manual-type-toggle">
                <button type="button" className={`manual-type-btn${manualType === 'portion' ? ' active' : ''}`} onClick={() => setManualType('portion')}>Par portion</button>
                <button type="button" className={`manual-type-btn${manualType === 'per100' ? ' active' : ''}`} onClick={() => setManualType('per100')}>Pour 100g / 100mL</button>
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input autoFocus type="text" placeholder="Ex : Café avec lait" value={manualName} onChange={(e) => setManualName(e.target.value)} />
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
                  <span className="form-hint">{manualType === 'per100' ? ` pour 100${manualUnit}` : ' pour cette portion'}</span>
                </label>
                <input type="number" min={0} placeholder="0" value={manualKcal} onChange={(e) => setManualKcal(e.target.value)} />
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
                {manualType === 'per100' ? `Sauvegardé dans votre base · vous entrerez la quantité à chaque ajout.` : `Sauvegardé dans votre base · ajouté en un clic.`}
              </p>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary" disabled={!manualName.trim() || !manualKcal}>
                {editingCustomFood ? 'Enregistrer' : manualType === 'per100' ? 'Suivant →' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
