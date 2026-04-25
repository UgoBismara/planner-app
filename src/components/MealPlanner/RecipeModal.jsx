import { useState, useMemo } from 'react';
import { RECIPES } from '../../data/recipes';
import { RECIPE_MACROS } from '../../data/macros';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const getCalories = (recipe) => {
  if (!recipe) return 0;
  const m = RECIPE_MACROS[recipe.id];
  if (m) return m.glucides * 4 + m.lipides * 9 + m.proteines * 4;
  return recipe.calories ?? 0;
};

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_LABELS = { breakfast: 'Petit-déjeuner', lunch: 'Déjeuner', snack: 'Goûter', dinner: 'Dîner' };
const MEAL_CATEGORIES = {
  breakfast: (r) => r.category === 'petit-déjeuner',
  snack:     (r) => r.category === 'goûter',
  lunch:     (r) => r.category !== 'petit-déjeuner' && r.category !== 'goûter',
  dinner:    (r) => r.category !== 'petit-déjeuner' && r.category !== 'goûter',
};

export default function RecipeModal({ dayIndex, mealType, currentRecipe, weekMeals, customRecipes, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [detailRecipe, setDetailRecipe] = useState(currentRecipe || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [batchOnly, setBatchOnly] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ title: '', time: '', calories: '', ingredients: '', steps: '' });
  const [likedIds, setLikedIds] = useLocalStorage('planner_liked_recipes', []);

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allRecipes = useMemo(() => [...RECIPES, ...customRecipes], [customRecipes]);

  const usedIds = useMemo(() => {
    const ids = new Set();
    Object.entries(weekMeals).forEach(([key, id]) => {
      if (id && key !== `${dayIndex}_${mealType}`) ids.add(id);
    });
    return ids;
  }, [weekMeals, dayIndex, mealType]);

  const mealFilter = useMemo(() => MEAL_CATEGORIES[mealType] ?? (() => true), [mealType]);

  const filtered = useMemo(() => {
    let pool = allRecipes.filter(mealFilter);
    if (batchOnly) pool = pool.filter((r) => r.batchCooking);
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }
    return [...pool].sort((a, b) => {
      const aLiked = likedIds.includes(a.id) ? 0 : 1;
      const bLiked = likedIds.includes(b.id) ? 0 : 1;
      return aLiked - bLiked;
    });
  }, [search, batchOnly, allRecipes, mealFilter, likedIds]);

  const handleSuggest = () => {
    const pool = allRecipes.filter(mealFilter).filter((r) => !usedIds.has(r.id));
    const base = pool.length > 0 ? pool : allRecipes.filter(mealFilter);
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
                  <div className="recipe-detail-actions">
                    <button
                      className={`btn-like btn-like-detail ${likedIds.includes(detailRecipe.id) ? 'active' : ''}`}
                      onClick={(e) => toggleLike(e, detailRecipe.id)}
                      title={likedIds.includes(detailRecipe.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {likedIds.includes(detailRecipe.id) ? '♥' : '♡'}
                    </button>
                    <button className="btn-primary" onClick={() => onSelect(detailRecipe)}>
                      Choisir cette recette
                    </button>
                  </div>
                </div>
                <h4>{detailRecipe.title}</h4>
                <div className="recipe-meta">
                  {detailRecipe.category && <span className="tag">{detailRecipe.category}</span>}
                  {detailRecipe.time && <span className="tag">{detailRecipe.time} min</span>}
                  {getCalories(detailRecipe) > 0 && <span className="tag tag-calories">{getCalories(detailRecipe)} kcal</span>}
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
                {filtered.map((recipe) => {
                  const liked = likedIds.includes(recipe.id);
                  return (
                    <div
                      key={recipe.id}
                      className={`recipe-item ${usedIds.has(recipe.id) ? 'used' : ''} ${liked ? 'liked' : ''}`}
                      onClick={() => setDetailRecipe(recipe)}
                    >
                      <div className="recipe-item-top">
                        <div className="recipe-item-title">{recipe.title}</div>
                        <button
                          className={`btn-like ${liked ? 'active' : ''}`}
                          onClick={(e) => toggleLike(e, recipe.id)}
                          title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          {liked ? '♥' : '♡'}
                        </button>
                      </div>
                      <div className="recipe-item-meta">
                        {recipe.category && <span className="tag">{recipe.category}</span>}
                        {recipe.time && <span className="tag">{recipe.time} min</span>}
                        {recipe.batchCooking && <span className="tag tag-batch">batch</span>}
                        {usedIds.has(recipe.id) && <span className="tag used-tag">Déjà utilisée</span>}
                      </div>
                    </div>
                  );
                })}
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
