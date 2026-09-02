import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './MealPlanner.css';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_ORDER = ['lunch', 'dinner'];
const MEAL_LABELS_FR = { lunch: 'Déjeuner', dinner: 'Dîner' };
const TOTAL_SLOTS = DAY_NAMES.length * MEAL_ORDER.length;

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
  const [mealPlan, setMealPlan] = useLocalStorage(`planner_mealplan_${mealsKey}`, {});
  const [skippedMeals, setSkippedMeals] = useLocalStorage(`planner_skipped_${mealsKey}`, {});
  const [waterLog, setWaterLog] = useLocalStorage(`planner_water_${mealsKey}`, {});
  const [clipboard, setClipboard] = useState(null); // { text, label }

  const WATER_GOAL = 2000;
  const getWater = (dayIndex) => waterLog[dayIndex] || 0;
  const addWater = (dayIndex, ml) =>
    setWaterLog((prev) => ({ ...prev, [dayIndex]: Math.max(0, (prev[dayIndex] || 0) + ml) }));

  const toggleSkip = (dayIndex, mealType) => {
    const key = mk(dayIndex, mealType);
    setSkippedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatWeekLabel = () => {
    const now = new Date();
    const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    const d1 = monday.getDate(), m1 = months[monday.getMonth()];
    const d2 = sunday.getDate(), m2 = months[sunday.getMonth()];
    const range = m1 === m2 ? `${d1}–${d2} ${m1}` : `${d1} ${m1} – ${d2} ${m2}`;
    return `Semaine du ${range}`;
  };

  const mk = (dayIndex, mealType) => `${dayIndex}_${mealType}`;

  const getMealText = (dayIndex, mealType) => mealPlan[mk(dayIndex, mealType)] || '';

  const setMealText = (dayIndex, mealType, text) => {
    const key = mk(dayIndex, mealType);
    setMealPlan((prev) => ({ ...prev, [key]: text }));
  };

  const copyMeal = (dayIndex, mealType) => {
    const text = getMealText(dayIndex, mealType);
    if (!text) return;
    setClipboard({ text, label: `${DAY_NAMES[dayIndex]} · ${MEAL_LABELS_FR[mealType]}` });
  };

  const pasteMeal = (dayIndex, mealType) => {
    if (!clipboard) return;
    setMealText(dayIndex, mealType, clipboard.text);
    setClipboard(null);
  };

  const plannedCount = DAY_NAMES.reduce((sum, _, i) => (
    sum + MEAL_ORDER.filter((mt) => !!skippedMeals[mk(i, mt)] || !!getMealText(i, mt)).length
  ), 0);

  return (
    <div className="meal-planner">
      <div className="week-nav">
        <button onClick={() => setWeekOffset((o) => o - 1)}>← Précédente</button>
        <span className="week-label">{formatWeekLabel()}</span>
        <button onClick={() => setWeekOffset((o) => o + 1)}>Suivante →</button>
      </div>

      <div className="week-progress-bar">
        <span>Repas programmés : <strong>{plannedCount}/{TOTAL_SLOTS}</strong></span>
        <div className="week-progress-track">
          <div
            className="week-progress-fill"
            style={{ width: `${(plannedCount / TOTAL_SLOTS) * 100}%` }}
          />
        </div>
      </div>

      {clipboard && (
        <div className="meal-clipboard-bar">
          <span>📋 Copié : <strong>{clipboard.label}</strong> — clique sur un repas pour coller</span>
          <button className="meal-clipboard-cancel" onClick={() => setClipboard(null)}>✕ Annuler</button>
        </div>
      )}

      <div className="meals-grid">
        {DAY_NAMES.map((dayName, i) => {
          const now = new Date();
          const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
          const monday = new Date(now);
          monday.setDate(now.getDate() - dow + weekOffset * 7);
          const colDate = new Date(monday);
          colDate.setDate(monday.getDate() + i);
          const isToday = weekOffset === 0 && i === (now.getDay() + 6) % 7;
          return (
            <div key={i} className={`meal-day${isToday ? ' meal-day-today' : ''}`}>
              <div className="meal-day-name">
                {dayName}
                <span className="meal-day-date">{colDate.getDate()}</span>
              </div>
              {MEAL_ORDER.map((mealType) => {
                const text = getMealText(i, mealType);
                const skipped = !!skippedMeals[mk(i, mealType)];
                return (
                  <div key={mealType} className={`meal-slot${skipped ? ' meal-slot-skipped' : ''}${clipboard ? ' meal-slot-pasteable' : ''}`}>
                    <div className="meal-slot-header">
                      <span className="meal-slot-label">{MEAL_LABELS_FR[mealType]}</span>
                      <div className="meal-slot-actions">
                        {skipped && <span className="meal-slot-skipped-badge">Sauté</span>}
                        {!skipped && text && !clipboard && (
                          <button
                            className="meal-slot-copy-btn"
                            onClick={() => copyMeal(i, mealType)}
                            title="Copier ce repas"
                          >
                            📋
                          </button>
                        )}
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
                      clipboard ? (
                        <button className="meal-slot-paste-btn" onClick={() => pasteMeal(i, mealType)}>
                          Coller ici
                        </button>
                      ) : (
                        <input
                          type="text"
                          className="meal-plan-input"
                          placeholder="À décider"
                          value={text}
                          onChange={(e) => setMealText(i, mealType, e.target.value)}
                        />
                      )
                    )}
                  </div>
                );
              })}
              <div className={`water-tracker${getWater(i) >= WATER_GOAL ? ' water-tracker-done' : ''}`}>
                <div className="water-header">
                  <span className="water-icon">💧</span>
                  <span className="water-amount">
                    {getWater(i) >= 1000
                      ? `${(getWater(i) / 1000).toFixed(getWater(i) % 1000 === 0 ? 0 : 1)} L`
                      : `${getWater(i)} mL`}
                    {getWater(i) >= WATER_GOAL && <span className="water-check"> ✓</span>}
                  </span>
                </div>
                <div className="water-bar-track">
                  <div
                    className="water-bar-fill"
                    style={{ width: `${Math.min(getWater(i) / WATER_GOAL * 100, 100)}%` }}
                  />
                </div>
                <div className="water-btns">
                  {[150, 250, 500].map((ml) => (
                    <button key={ml} className="water-add-btn" onClick={() => addWater(i, ml)}>
                      +{ml < 1000 ? `${ml}` : `${ml / 1000}L`}
                    </button>
                  ))}
                  <button
                    className="water-sub-btn"
                    onClick={() => addWater(i, -250)}
                    disabled={getWater(i) === 0}
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
