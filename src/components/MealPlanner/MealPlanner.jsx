import { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import FoodLogModal from './FoodLogModal';
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
  const [foodLog, setFoodLog] = useLocalStorage(`planner_food_log_${mealsKey}`, {});
  const [skippedMeals, setSkippedMeals] = useLocalStorage(`planner_skipped_${mealsKey}`, {});
  const [foodModal, setFoodModal] = useState(null); // { dayIndex, mealType }

  const toggleSkip = (dayIndex, mealType) => {
    const key = mk(dayIndex, mealType);
    setSkippedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatWeekLabel = () => {
    if (weekOffset === 0) return 'Cette semaine';
    if (weekOffset === -1) return 'Semaine dernière';
    if (weekOffset === 1) return 'Semaine prochaine';
    return `Semaine ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
  };

  const mk = (dayIndex, mealType) => `${dayIndex}_${mealType}`;

  const getMealEntries = (dayIndex, mealType) => foodLog[mk(dayIndex, mealType)] || [];

  const getMealKcal = (dayIndex, mealType) =>
    getMealEntries(dayIndex, mealType).reduce((s, e) => s + (Number(e.kcal) || 0), 0);

  const getDayKcal = (dayIndex) =>
    MEAL_ORDER.reduce((s, mt) => s + getMealKcal(dayIndex, mt), 0);

  const addFoodEntry = (entry) => {
    const key = mk(foodModal.dayIndex, foodModal.mealType);
    setFoodLog((prev) => ({ ...prev, [key]: [...(prev[key] || []), entry] }));
    setFoodModal(null);
  };

  const removeFoodEntry = (dayIndex, mealType, id) => {
    const key = mk(dayIndex, mealType);
    setFoodLog((prev) => ({ ...prev, [key]: (prev[key] || []).filter((e) => e.id !== id) }));
  };

  const weekCalories = Array.from({ length: 7 }, (_, i) => getDayKcal(i)).reduce((s, c) => s + c, 0);

  const weekMacros = useMemo(() => {
    let proteines = 0, lipides = 0, glucides = 0;
    Object.values(foodLog).forEach((entries) => {
      (entries || []).forEach((e) => {
        proteines += Number(e.proteines) || 0;
        lipides   += Number(e.lipides)   || 0;
        glucides  += Number(e.glucides)  || 0;
      });
    });
    return { proteines: Math.round(proteines), lipides: Math.round(lipides), glucides: Math.round(glucides) };
  }, [foodLog]);

  const uniqueFoodsCount = useMemo(() => {
    const foods = new Set();
    Object.values(foodLog).forEach((entries) => {
      (entries || []).forEach((e) => foods.add(e.name));
    });
    return foods.size;
  }, [foodLog]);

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
          const dayKcal = getDayKcal(i);
          return (
            <div key={i} className="meal-day">
              <div className="meal-day-name">{dayName}</div>
              {MEAL_ORDER.map((mealType) => {
                const entries = getMealEntries(i, mealType);
                const mealKcal = getMealKcal(i, mealType);
                const skipped = !!skippedMeals[mk(i, mealType)];
                return (
                  <div key={mealType} className={`meal-slot${skipped ? ' meal-slot-skipped' : ''}`}>
                    <div className="meal-slot-header">
                      <span className="meal-slot-label">{MEAL_LABELS_FR[mealType]}</span>
                      <div className="meal-slot-actions">
                        {!skipped && mealKcal > 0 && <span className="meal-slot-kcal">{mealKcal} kcal</span>}
                        {skipped && <span className="meal-slot-skipped-badge">Sauté</span>}
                        <button
                          className={`meal-slot-skip-btn${skipped ? ' active' : ''}`}
                          onClick={() => toggleSkip(i, mealType)}
                          title={skipped ? 'Reprendre ce repas' : 'Sauter ce repas'}
                        >
                          {skipped ? '↩' : '⊘'}
                        </button>
                      </div>
                    </div>
                    {!skipped && (
                      <>
                        {entries.length > 0 && (
                          <div className="food-log-entries">
                            {entries.map((entry) => (
                              <div key={entry.id} className="food-log-entry">
                                <span className="food-log-name">{entry.name}</span>
                                {entry.grams && <span className="food-log-grams">{entry.grams}{entry.unit || 'g'}</span>}
                                <span className="food-log-kcal">{entry.kcal} kcal</span>
                                <button className="food-log-del" onClick={() => removeFoodEntry(i, mealType, entry.id)}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          className="food-log-add"
                          onClick={() => setFoodModal({ dayIndex: i, mealType })}
                        >
                          + Aliment
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              {dayKcal > 0 && (
                <div className="day-calories">{dayKcal} kcal</div>
              )}
            </div>
          );
        })}
      </div>

      {foodModal && (
        <FoodLogModal
          mealType={foodModal.mealType}
          onAdd={addFoodEntry}
          onClose={() => setFoodModal(null)}
        />
      )}
    </div>
  );
}
