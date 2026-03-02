export default function MealCell({ recipe, mealType, onClick }) {
  const label = mealType === 'lunch' ? 'Déjeuner' : 'Dîner';

  return (
    <div className={`meal-cell ${recipe ? 'has-recipe' : 'empty'}`} onClick={onClick}>
      <div className="meal-type-label">{label}</div>
      {recipe ? (
        <div className="meal-recipe-info">
          <span className="meal-recipe-title">{recipe.title}</span>
          <div className="meal-recipe-meta">
            {recipe.time && <span className="meal-recipe-time">{recipe.time} min</span>}
            {recipe.calories && <span className="meal-recipe-calories">{recipe.calories} kcal</span>}
          </div>
        </div>
      ) : (
        <span className="meal-add-hint">+ Ajouter</span>
      )}
    </div>
  );
}
