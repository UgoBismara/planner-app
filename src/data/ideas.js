// Partagé par l'onglet « 💡 Idées » et l'encart de l'écran Semaine : une seule
// clé de stockage, donc une seule liste synchronisée entre les deux vues.

export const IDEAS_KEY = 'planner_ideas';

export const IDEA_TYPES = [
  { id: 'event', label: 'Événement', icon: '📅' },
  { id: 'goal', label: 'Objectif', icon: '🎯' },
];

export const ideaTypeOf = (id) =>
  IDEA_TYPES.find((t) => t.id === id) ?? IDEA_TYPES[0];

export const makeIdea = (text, type) => ({
  id: `idea_${Date.now()}`,
  text,
  type,
  done: false,
  createdAt: new Date().toISOString(),
});
