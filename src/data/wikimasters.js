// Onglet Cartes (WikiMasters) : chaque jour, des articles de Wikipédia FR tirés
// au hasard, à capturer dans le jeu.
//
// Deux clés séparées pour qu'aucun écrivain n'écrase l'autre :
// - CARDS_KEY : liste des cartes, écrite UNIQUEMENT par scripts/wikimasters-draw.js
//   (routine cloud quotidienne, via l'API REST Firestore)
// - CAUGHT_KEY : { [pageid]: 'AAAA-MM-JJ' } des cartes capturées, écrite UNIQUEMENT par l'appli
export const CARDS_KEY = 'wikimasters-cards';
export const CAUGHT_KEY = 'wikimasters-caught';
export const CARDS_PER_DAY = 5;
