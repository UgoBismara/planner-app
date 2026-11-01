// Macros KaTeX de l'onglet Maths, partagées avec scripts/check-maths.js : notations
// françaises (pgcd, Re z…) et ensembles que KaTeX ne connaît pas de lui-même
// (il a déjà \N, \Z et \R).
export const KATEX_MACROS = {
  '\\Q': '\\mathbb{Q}',
  '\\C': '\\mathbb{C}',
  '\\U': '\\mathbb{U}',
  '\\K': '\\mathbb{K}',
  '\\pgcd': '\\operatorname{pgcd}',
  '\\ppcm': '\\operatorname{ppcm}',
  '\\card': '\\operatorname{card}',
  '\\Re': '\\operatorname{Re}',
  '\\Im': '\\operatorname{Im}',
};

// KaTeX peut enrichir l'objet macros qu'on lui passe (\gdef) : une copie par rendu
export const katexOptions = (displayMode = false) => ({
  macros: { ...KATEX_MACROS },
  displayMode,
  throwOnError: false,
  strict: 'ignore',
});
