import { useState, useMemo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './RecipesLibrary.css';

export default function RecipesLibrary() {
  const [recipes, setRecipes] = useLocalStorage('planner_recipes_library', []);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return recipes;
    const q = search.toLowerCase();
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [recipes, search]);

  const openAdd = () => { setEditingRecipe(null); setShowForm(true); };
  const openEdit = (r) => { setEditingRecipe(r); setShowForm(true); };

  const handleSave = (recipe) => {
    if (editingRecipe) {
      setRecipes((prev) => prev.map((r) => (r.id === editingRecipe.id ? recipe : r)));
    } else {
      setRecipes((prev) => [recipe, ...prev]);
    }
    setShowForm(false);
    setEditingRecipe(null);
    setExpandedId(recipe.id);
  };

  const handleDelete = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="recipes-library">
      <div className="recipes-toolbar">
        <input
          className="recipes-search"
          type="text"
          placeholder="Rechercher par nom ou ingrédient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-add-recipe" onClick={openAdd}>+ Recette</button>
      </div>

      {recipes.length === 0 && !showForm && (
        <div className="recipes-empty">
          <p>Aucune recette pour l'instant.</p>
          <button className="btn-add-recipe" onClick={openAdd}>Ajouter ma première recette</button>
        </div>
      )}

      {filtered.length === 0 && recipes.length > 0 && (
        <p className="recipes-no-results">Aucune recette contenant « {search} ».</p>
      )}

      <div className="recipes-list">
        {filtered.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            expanded={expandedId === recipe.id}
            onToggle={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
            onEdit={() => openEdit(recipe)}
            onDelete={() => handleDelete(recipe.id)}
            searchTerm={search}
          />
        ))}
      </div>

      {showForm && (
        <RecipeForm
          initial={editingRecipe}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingRecipe(null); }}
        />
      )}
    </div>
  );
}

function highlight(text, term) {
  if (!term.trim()) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  );
}

function RecipeCard({ recipe, expanded, onToggle, onEdit, onDelete, searchTerm }) {
  return (
    <div className={`recipe-card${expanded ? ' expanded' : ''}`}>
      <div className="recipe-card-header" onClick={onToggle}>
        <div className="recipe-card-title-row">
          <span className="recipe-card-name">{highlight(recipe.name, searchTerm)}</span>
          <span className="recipe-card-meta">{recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? 's' : ''}</span>
        </div>
        <div className="recipe-card-tags-row">
          {(recipe.tags || []).map((tag) => (
            <span key={tag} className="recipe-tag">{highlight(tag, searchTerm)}</span>
          ))}
          <span className="recipe-card-chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="recipe-card-body">
          <div className="recipe-section">
            <strong>Ingrédients</strong>
            <ul className="recipe-ing-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{highlight(ing, searchTerm)}</li>
              ))}
            </ul>
          </div>
          {recipe.instructions?.trim() && (
            <div className="recipe-section">
              <strong>Préparation</strong>
              <p className="recipe-instructions">{recipe.instructions}</p>
            </div>
          )}
          <div className="recipe-card-actions">
            <button className="btn-edit-recipe" onClick={onEdit}>Modifier</button>
            <button className="btn-delete-recipe" onClick={onDelete}>Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [ingredients, setIngredients] = useState(initial?.ingredients ?? ['']);
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initial?.tags ?? []);

  const setIng = (i, val) => setIngredients((prev) => prev.map((v, idx) => idx === i ? val : v));
  const addIng = () => setIngredients((prev) => [...prev, '']);
  const removeIng = (i) => setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().replace(/,$/, '');
      if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
      setTagInput('');
    }
  };
  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanIngs = ingredients.map((s) => s.trim()).filter(Boolean);
    if (!name.trim() || cleanIngs.length === 0) return;
    onSave({
      id: initial?.id ?? Date.now(),
      name: name.trim(),
      ingredients: cleanIngs,
      instructions: instructions.trim(),
      tags,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="recipe-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initial ? 'Modifier la recette' : 'Nouvelle recette'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form className="recipe-form-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom *</label>
            <input
              autoFocus
              type="text"
              placeholder="Ex : Poulet rôti aux herbes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Ingrédients *</label>
            <div className="ing-list">
              {ingredients.map((ing, i) => (
                <div key={i} className="ing-row">
                  <input
                    type="text"
                    placeholder={`Ingrédient ${i + 1}`}
                    value={ing}
                    onChange={(e) => setIng(i, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIng())}
                  />
                  {ingredients.length > 1 && (
                    <button type="button" className="ing-del" onClick={() => removeIng(i)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="ing-add" onClick={addIng}>+ Ingrédient</button>
            </div>
          </div>

          <div className="form-group">
            <label>Étiquettes <span className="form-hint">(Entrée pour valider)</span></label>
            <div className="tags-input-row">
              {tags.map((t) => (
                <span key={t} className="recipe-tag recipe-tag-removable">
                  {t}
                  <button type="button" onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input
                type="text"
                placeholder="ex: rapide, végétarien..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Préparation <span className="form-hint">(optionnel)</span></label>
            <textarea
              rows={4}
              placeholder="Étapes de préparation..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">
              {initial ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
