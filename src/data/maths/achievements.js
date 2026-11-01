// Succès de l'onglet Maths, calculés à partir de computeStats (index.js). Chacun doit
// rester atteignable avec le contenu livré : le 100 % compte.
import { KINDS } from './index.js';

export const MATHS_ACHIEVEMENTS = [
  { id: 'first', title: 'Premier pas', description: 'Valider un premier exercice', check: (s) => s.validated >= 1 },
  { id: 'all_kinds', title: 'Touche-à-tout', description: 'Tenter un exercice de chaque type', check: (s) => s.kindsTried >= KINDS.length },
  { id: 'warmup', title: 'Bien échauffé', description: 'Valider 10 exercices d’échauffement (1 étoile)', check: (s) => s.byDifficulty[1] >= 10 },
  { id: 'reader', title: 'Lecteur', description: 'Lire toutes les fiches de cours d’un chapitre', check: (s) => s.chaptersRead >= 1 },
  { id: 'proofs', title: 'CQFD', description: 'Valider 5 démonstrations', check: (s) => s.proofs >= 5 },
  { id: 'revenge', title: 'Revanche', description: 'Réussir seul un exercice raté auparavant', check: (s) => s.revenges >= 1 },
  { id: 'reviews', title: 'Persévérant', description: 'Réussir 3 révisions', check: (s) => s.reviews >= 3 },
  { id: 'drills', title: 'Machine à calculer', description: 'Réussir 25 entraînements générés', check: (s) => s.drillWins >= 25 },
  { id: 'tough', title: 'Costaud', description: 'Valider 5 exercices à 3 étoiles', check: (s) => s.byDifficulty[3] >= 5 },
  { id: 'code', title: 'Force brute', description: 'Valider 3 exercices à coder', check: (s) => s.code >= 3 },
  { id: 'challenge', title: 'Défi relevé', description: 'Valider un exercice à 4 étoiles', check: (s) => s.byDifficulty[4] >= 1 },
  { id: 'chapter', title: 'Chapitre bouclé', description: 'Finir un chapitre à 100 %', check: (s) => s.chaptersDone >= 1 },
  { id: 'algebra', title: 'Algébriste', description: 'Finir tout le domaine Algèbre & arithmétique à 100 %', check: (s) => s.domainsDone.includes('algebre') },
  { id: 'comeback', title: 'Le retour', description: 'Refaire des maths après 3 semaines de pause', check: (s) => s.comebacks >= 1 },
];

export const unlockedAchievements = (stats) => MATHS_ACHIEVEMENTS.filter((a) => a.check(stats));
