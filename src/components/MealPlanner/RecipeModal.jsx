import { useState, useMemo } from 'react';
import { RECIPES } from '../../data/recipes';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_LABELS = { lunch: 'Déjeuner', dinner: 'Dîner' };

export default function RecipeModal({ dayIndex, mealType, currentRecipe, weekMeals, customRecipes, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [detailRecipe, setDetailRecipe] = useState(currentRecipe || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [batchOnly, setBatchOnly] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ title: '', time: '', calories: '', ingredients: '', steps: '' });

  const allRecipes = useMemo(() => [...RECIPES, ...customRecipes], [customRecipes]);

  const usedIds = useMemo(() => {
    const ids = new Set();
    Object.entries(weekMeals).forEach(([key, id]) => {
      if (id && key !== `${dayIndex}_${mealType}`) ids.add(id);
    });
    return ids;
  }, [weekMeals, dayIndex, mealType]);

  const filtered = useMemo(() => {
    let pool = batchOnly ? allRecipes.filter((r) => r.batchCooking) : allRecipes;
    if (!search.trim()) return pool;
    const q = search.toLowerCase();
    return pool.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      (r.category && r.category.toLowerCase().includes(q))
    );
  }, [search, batchOnly, allRecipes]);

  const handleSuggest = () => {
    const pool = (batchOnly ? allRecipes.filter((r) => r.batchCooking) : allRecipes)
      .filter((r) => !usedIds.has(r.id));
    const base = pool.length > 0 ? pool : allRecipes;
    const pick = base[Math.floor(Math.random() * base.length)];
    setDetailRecipe(pick);
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    if (!newRecipe.title.trim()) return;
    const recipe = {
      id: `custom_${Date.now()}`,
      title: newRecipe.title.trim(),
      category: 'perso',
      time: newRecipe.time ? parseInt(newRecipe.time) : null,
      calories: newRecipe.calories ? parseInt(newRecipe.calories) : null,
      ingredients: newRecipe.ingredients.split('\n').map((s) => s.trim()).filter(Boolean),
      steps: newRecipe.steps.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    // On informe le parent d'ajouter la recette
    onSelect(recipe, true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{DAY_NAMES[dayIndex]} — {MEAL_LABELS[mealType]}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {!showAddForm ? (
          <>
            <div className="modal-search-row">
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <button
                className={`btn-batch-filter ${batchOnly ? 'active' : ''}`}
                onClick={() => setBatchOnly((v) => !v)}
                title="Afficher uniquement les recettes batch cooking"
              >
                🥘 Batch
              </button>
              <button className="btn-suggest" onClick={handleSuggest}>
                Suggestion
              </button>
            </div>

            {detailRecipe ? (
              <div className="recipe-detail">
                <div className="recipe-detail-header">
                  <button className="btn-back" onClick={() => setDetailRecipe(null)}>← Retour</button>
                  <button className="btn-primary" onClick={() => onSelect(detailRecipe)}>
                    Choisir cette recette
                  </button>
                </div>
                <h4>{detailRecipe.title}</h4>
                <div className="recipe-meta">
                  {detailRecipe.category && <span className="tag">{detailRecipe.category}</span>}
                  {detailRecipe.time && <span className="tag">{detailRecipe.time} min</span>}
                  {detailRecipe.calories && <span className="tag tag-calories">{detailRecipe.calories} kcal</span>}
                  {detailRecipe.batchCooking && <span className="tag tag-batch">batch cooking</span>}
                </div>
                <div className="recipe-section">
                  <strong>Ingrédients</strong>
                  <ul>
                    {detailRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                  </ul>
                </div>
                <div className="recipe-section">
                  <strong>Étapes</strong>
                  <ol>
                    {detailRecipe.steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="recipe-list">
                {filtered.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={`recipe-item ${usedIds.has(recipe.id) ? 'used' : ''}`}
                    onClick={() => setDetailRecipe(recipe)}
                  >
                    <div className="recipe-item-title">{recipe.title}</div>
                    <div className="recipe-item-meta">
                      {recipe.category && <span className="tag">{recipe.category}</span>}
                      {recipe.time && <span className="tag">{recipe.time} min</span>}
                      {recipe.batchCooking && <span className="tag tag-batch">batch</span>}
                      {usedIds.has(recipe.id) && <span className="tag used-tag">Déjà utilisée</span>}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="no-results">Aucune recette trouvée.</p>
                )}
              </div>
            )}

            <div className="modal-footer">
              {currentRecipe && (
                <button className="btn-danger" onClick={() => onSelect(null)}>
                  Retirer le repas
                </button>
              )}
              <button className="btn-secondary" onClick={() => setShowAddForm(true)}>
                + Ma propre recette
              </button>
            </div>
          </>
        ) : (
          <form className="add-recipe-form" onSubmit={handleSaveCustom}>
            <h4>Ajouter ma recette</h4>
            <div className="form-group">
              <label>Nom de la recette *</label>
              <input
                type="text"
                value={newRecipe.title}
                onChange={(e) => setNewRecipe((r) => ({ ...r, title: e.target.value }))}
                placeholder="Ex: Gratin de brocolis"
                autoFocus
              />
            </div>
            <div className="form-group-inline">
              <div className="form-group">
                <label>Temps (minutes)</label>
                <input
                  type="number"
                  value={newRecipe.time}
                  onChange={(e) => setNewRecipe((r) => ({ ...r, time: e.target.value }))}
                  placeholder="30"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Calories (kcal)</label>
                <input
                  type="number"
                  value={newRecipe.calories}
                  onChange={(e) => setNewRecipe((r) => ({ ...r, calories: e.target.value }))}
                  placeholder="400"
                  min="1"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Ingrédients (un par ligne)</label>
              <textarea
                value={newRecipe.ingredients}
                onChange={(e) => setNewRecipe((r) => ({ ...r, ingredients: e.target.value }))}
                placeholder="200g de brocolis&#10;100g de gruyère&#10;..."
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Étapes (une par ligne)</label>
              <textarea
                value={newRecipe.steps}
                onChange={(e) => setNewRecipe((r) => ({ ...r, steps: e.target.value }))}
                placeholder="Préchauffer le four...&#10;..."
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Sauvegarder et choisir</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
