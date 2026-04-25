import { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { RECIPES } from '../../data/recipes';
import { RECIPE_MACROS, extractFoodName } from '../../data/macros';
import MealCell from './MealCell';
import RecipeModal from './RecipeModal';
import './MealPlanner.css';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_ORDER = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_LABELS_FR = { breakfast: 'Petit-déjeuner', lunch: 'Déjeuner', snack: 'Goûter', dinner: 'Dîner' };

function getMealsKey(weekOffset) {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + weekOffset * 7);
  const year = monday.getFullYear();
  const week = getWeekNumber(monday);
  return `planner_meals_${year}_${String(week).padStart(2, '0')}`;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function MealPlanner({ weekOffset, setWeekOffset }) {
  const mealsKey = getMealsKey(weekOffset);
  const [weekMeals, setWeekMeals] = useLocalStorage(mealsKey, {});
  const [customRecipes, setCustomRecipes] = useLocalStorage('planner_custom_recipes', []);
  const [checkedItems, setCheckedItems] = useLocalStorage(`planner_shopping_${mealsKey}`, {});
  const [modal, setModal] = useState(null);
  const [showShopping, setShowShopping] = useState(true);
  const [openSections, setOpenSections] = useState({ breakfast: true, lunch: true, snack: true, dinner: true });
  const toggleSection = (type) => setOpenSections((prev) => ({ ...prev, [type]: !prev[type] }));

  const allRecipes = useMemo(() => [...RECIPES, ...customRecipes], [customRecipes]);

  const getRecipe = (dayIndex, mealType) => {
    const id = weekMeals[`${dayIndex}_${mealType}`];
    if (!id) return null;
    return allRecipes.find((r) => r.id === id || r.id === parseInt(id)) || null;
  };

  const handleSelect = (recipe, isNew = false) => {
    if (isNew) {
      setCustomRecipes((prev) => [...prev, recipe]);
    }
    const key = `${modal.dayIndex}_${modal.mealType}`;
    setWeekMeals((prev) => ({ ...prev, [key]: recipe ? recipe.id : null }));
    setModal(null);
  };

  const formatWeekLabel = () => {
    if (weekOffset === 0) return 'Cette semaine';
    if (weekOffset === -1) return 'Semaine dernière';
    if (weekOffset === 1) return 'Semaine prochaine';
    return `Semaine ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
  };

  // ── Liste de courses ──────────────────────────────────────────────────────
  const shoppingList = useMemo(() => {
    const items = [];
    Object.entries(weekMeals)
      .sort(([a], [b]) => {
        const [dayA, mealA] = a.split('_');
        const [dayB, mealB] = b.split('_');
        return MEAL_ORDER.indexOf(mealA) - MEAL_ORDER.indexOf(mealB) || parseInt(dayA) - parseInt(dayB);
      })
      .forEach(([key, recipeId]) => {
        if (!recipeId) return;
        const recipe = allRecipes.find((r) => r.id === recipeId || r.id === parseInt(recipeId));
        if (!recipe) return;
        const [dayIndex, mealType] = key.split('_');
        items.push({ key, dayIndex: parseInt(dayIndex), mealType, recipe });
      });
    return items;
  }, [weekMeals, allRecipes]);

  const toggleItem = (itemKey) => {
    setCheckedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const totalIngredients = shoppingList.reduce((sum, e) => sum + e.recipe.ingredients.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  // ── Calories & Macros ─────────────────────────────────────────────────────
  const getMacros = (recipe) => RECIPE_MACROS[recipe?.id] ?? { glucides: 0, lipides: 0, proteines: 0 };

  // Calories calculées depuis les macros (source unique de vérité)
  const getCalories = (recipe) => {
    if (!recipe) return 0;
    const m = getMacros(recipe);
    const fromMacros = m.glucides * 4 + m.lipides * 9 + m.proteines * 4;
    return fromMacros > 0 ? fromMacros : (recipe.calories ?? 0);
  };

  const getDayCalories = (dayIndex) => {
    let total = 0;
    MEAL_ORDER.forEach((mealType) => {
      total += getCalories(getRecipe(dayIndex, mealType));
    });
    return total;
  };

  const weekCalories = Array.from({ length: 7 }, (_, i) => getDayCalories(i)).reduce((s, c) => s + c, 0);

  const weekMacros = useMemo(() => {
    let glucides = 0, lipides = 0, proteines = 0;
    Object.values(weekMeals).forEach((id) => {
      if (!id) return;
      const recipe = allRecipes.find((r) => r.id === id || r.id === parseInt(id));
      if (!recipe) return;
      const m = getMacros(recipe);
      glucides  += m.glucides;
      lipides   += m.lipides;
      proteines += m.proteines;
    });
    return { glucides, lipides, proteines };
  }, [weekMeals, allRecipes]);

  // ── Diversité alimentaire ──────────────────────────────────────────────────

  const uniqueFoodsCount = useMemo(() => {
    const foods = new Set();
    Object.values(weekMeals).forEach((id) => {
      if (!id) return;
      const recipe = allRecipes.find((r) => r.id === id || r.id === parseInt(id));
      if (!recipe) return;
      recipe.ingredients.forEach((ing) => {
        const name = extractFoodName(ing);
        if (name) foods.add(name);
      });
    });
    return foods.size;
  }, [weekMeals, allRecipes]);

  return (
    <div className="meal-planner">
      <div className="week-nav">
        <button onClick={() => setWeekOffset((o) => o - 1)}>← Précédente</button>
        <span className="week-label">{formatWeekLabel()}</span>
        <button onClick={() => setWeekOffset((o) => o + 1)}>Suivante →</button>
      </div>

      {weekCalories > 0 && (
        <div className="week-calories-bar">
          <span>Total semaine : <strong>{weekCalories.toLocaleString('fr-FR')} kcal</strong></span>
          <span className="week-calories-avg">· {Math.round(weekCalories / 7)} kcal/jour</span>
          <span className="week-macro week-macro-g">G {weekMacros.glucides}g</span>
          <span className="week-macro week-macro-l">L {weekMacros.lipides}g</span>
          <span className="week-macro week-macro-p">P {weekMacros.proteines}g</span>
        </div>
      )}

      {uniqueFoodsCount > 0 && (
        <div className="diversity-bar">
          <span className="diversity-label">Diversité alimentaire</span>
          <div className="diversity-track">
            <div
              className="diversity-fill"
              style={{ width: `${Math.min(uniqueFoodsCount / 30 * 100, 100)}%` }}
            />
          </div>
          <span className={`diversity-count ${uniqueFoodsCount >= 30 ? 'reached' : ''}`}>
            {uniqueFoodsCount}/30 aliments
          </span>
        </div>
      )}

      <div className="meals-grid">
        {DAY_NAMES.map((dayName, i) => {
          const dayCalories = getDayCalories(i);
          return (
            <div key={i} className="meal-day">
              <div className="meal-day-name">{dayName}</div>
              {MEAL_ORDER.map((mealType) => {
                const recipe = getRecipe(i, mealType);
                return (
                  <MealCell
                    key={mealType}
                    recipe={recipe}
                    calories={getCalories(recipe)}
                    mealType={mealType}
                    onClick={() => setModal({ dayIndex: i, mealType })}
                  />
                );
              })}
              {dayCalories > 0 && (
                <div className="day-calories">{dayCalories} kcal</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Listes de courses par repas ── */}
      {shoppingList.length > 0 && (
        <div className="shopping-section">
          <button className="shopping-toggle" onClick={() => setShowShopping((v) => !v)}>
            <span>Listes de courses</span>
            <span className="shopping-progress">{checkedCount}/{totalIngredients} cochés</span>
            <span className="shopping-chevron">{showShopping ? '▲' : '▼'}</span>
          </button>

          {showShopping && (
            <div className="shopping-body">
              {MEAL_ORDER.map((mealType) => {
                const items = shoppingList.filter((e) => e.mealType === mealType);
                if (items.length === 0) return null;
                const isOpen = openSections[mealType];
                const sectionTotal = items.reduce((s, e) => s + e.recipe.ingredients.length, 0);
                const sectionChecked = items.reduce((s, { key: mk, recipe }) =>
                  s + recipe.ingredients.filter((_, idx) => !!checkedItems[`${mk}_${idx}`]).length, 0);
                return (
                  <div key={mealType} className="shopping-meal-section">
                    <button className="shopping-meal-header" onClick={() => toggleSection(mealType)}>
                      <span className="shopping-meal-label">{MEAL_LABELS_FR[mealType]}</span>
                      <span className="shopping-meal-progress">{sectionChecked}/{sectionTotal}</span>
                      <span className="shopping-chevron">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                      <div className="shopping-meal-body">
                        {items.map(({ key: mealKey, dayIndex, recipe }) => (
                          <div key={mealKey} className="shopping-group">
                            <div className="shopping-group-header">
                              <span className="shopping-recipe-name">{recipe.title}</span>
                              <span className="shopping-group-meta">{DAY_NAMES[dayIndex]}</span>
                            </div>
                            <ul className="shopping-items">
                              {recipe.ingredients.map((ing, idx) => {
                                const itemKey = `${mealKey}_${idx}`;
                                const checked = !!checkedItems[itemKey];
                                return (
                                  <li key={itemKey} className={`shopping-item ${checked ? 'checked' : ''}`}>
                                    <label>
                                      <input type="checkbox" checked={checked} onChange={() => toggleItem(itemKey)} />
                                      <span>{ing}</span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {checkedCount > 0 && (
                <button className="shopping-reset" onClick={() => setCheckedItems({})}>Tout décocher</button>
              )}
            </div>
          )}
        </div>
      )}

      {modal && (
        <RecipeModal
          dayIndex={modal.dayIndex}
          mealType={modal.mealType}
          currentRecipe={getRecipe(modal.dayIndex, modal.mealType)}
          weekMeals={weekMeals}
          customRecipes={customRecipes}
          onSelect={handleSelect}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
