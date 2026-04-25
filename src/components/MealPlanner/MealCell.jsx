const MEAL_LABELS = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  snack: 'Goûter',
  dinner: 'Dîner',
};

export default function MealCell({ recipe, calories, mealType, onClick }) {
  const label = MEAL_LABELS[mealType] ?? mealType;

  return (
    <div className={`meal-cell ${recipe ? 'has-recipe' : 'empty'}`} onClick={onClick}>
      <div className="meal-type-label">{label}</div>
      {recipe ? (
        <div className="meal-recipe-info">
          <span className="meal-recipe-title">{recipe.title}</span>
          <div className="meal-recipe-meta">
            {recipe.time && <span className="meal-recipe-time">{recipe.time} min</span>}
            {calories > 0 && <span className="meal-recipe-calories">{calories} kcal</span>}
          </div>
        </div>
      ) : (
        <span className="meal-add-hint">+ Ajouter</span>
      )}
    </div>
  );
}
