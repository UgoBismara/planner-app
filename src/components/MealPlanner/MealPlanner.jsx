import { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { RECIPES } from '../../data/recipes';
import MealCell from './MealCell';
import RecipeModal from './RecipeModal';
import './MealPlanner.css';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

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
        return parseInt(dayA) - parseInt(dayB) || (mealA === 'lunch' ? -1 : 1);
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

  // ── Calories ──────────────────────────────────────────────────────────────
  const getDayCalories = (dayIndex) => {
    let total = 0;
    ['lunch', 'dinner'].forEach((mealType) => {
      const recipe = getRecipe(dayIndex, mealType);
      if (recipe?.calories) total += recipe.calories;
    });
    return total;
  };

  const weekCalories = Array.from({ length: 7 }, (_, i) => getDayCalories(i)).reduce(
    (sum, c) => sum + c,
    0
  );

  return (
    <div className="meal-planner">
      <div className="week-nav">
        <button onClick={() => setWeekOffset((o) => o - 1)}>← Précédente</button>
        <span className="week-label">{formatWeekLabel()}</span>
        <button onClick={() => setWeekOffset((o) => o + 1)}>Suivante →</button>
      </div>

      {weekCalories > 0 && (
        <div className="week-calories-bar">
          Total semaine : <strong>{weekCalories.toLocaleString('fr-FR')} kcal</strong>
          <span className="week-calories-avg">
            · {Math.round(weekCalories / 7)} kcal/jour en moyenne
          </span>
        </div>
      )}

      <div className="meals-grid">
        {DAY_NAMES.map((dayName, i) => {
          const dayCalories = getDayCalories(i);
          return (
            <div key={i} className="meal-day">
              <div className="meal-day-name">{dayName}</div>
              <MealCell
                recipe={getRecipe(i, 'lunch')}
                mealType="lunch"
                onClick={() => setModal({ dayIndex: i, mealType: 'lunch' })}
              />
              <MealCell
                recipe={getRecipe(i, 'dinner')}
                mealType="dinner"
                onClick={() => setModal({ dayIndex: i, mealType: 'dinner' })}
              />
              {dayCalories > 0 && (
                <div className="day-calories">{dayCalories} kcal</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Liste de courses ── */}
      {shoppingList.length > 0 && (
        <div className="shopping-section">
          <button
            className="shopping-toggle"
            onClick={() => setShowShopping((v) => !v)}
          >
            <span>Liste de courses</span>
            <span className="shopping-progress">
              {checkedCount}/{totalIngredients} cochés
            </span>
            <span className="shopping-chevron">{showShopping ? '▲' : '▼'}</span>
          </button>

          {showShopping && (
            <div className="shopping-body">
              <div className="shopping-groups">
                {shoppingList.map(({ key: mealKey, dayIndex, mealType, recipe }) => (
                  <div key={mealKey} className="shopping-group">
                    <div className="shopping-group-header">
                      <span className="shopping-recipe-name">{recipe.title}</span>
                      <span className="shopping-group-meta">
                        {DAY_NAMES[dayIndex]} · {mealType === 'lunch' ? 'Déjeuner' : 'Dîner'}
                      </span>
                    </div>
                    <ul className="shopping-items">
                      {recipe.ingredients.map((ing, idx) => {
                        const itemKey = `${mealKey}_${idx}`;
                        const checked = !!checkedItems[itemKey];
                        return (
                          <li key={itemKey} className={`shopping-item ${checked ? 'checked' : ''}`}>
                            <label>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleItem(itemKey)}
                              />
                              <span>{ing}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              {checkedCount > 0 && (
                <button className="shopping-reset" onClick={() => setCheckedItems({})}>
                  Tout décocher
                </button>
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
