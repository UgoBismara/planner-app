export const VINTED_KEY = 'vinted-listings';

// Les cinq valeurs du champ "État" dans le formulaire Vinted
export const ETATS = [
  'Neuf avec étiquette',
  'Neuf sans étiquette',
  'Très bon état',
  'Bon état',
  'Satisfaisant',
];

export const STATUSES = [
  { id: 'draft', label: '✏️ Brouillon' },
  { id: 'ready', label: '📋 À publier' },
  { id: 'published', label: '✓ En ligne' },
];

export function statusOf(id) {
  return STATUSES.find((s) => s.id === id) || STATUSES[0];
}

const EMPTY = {
  titre: '',
  description: '',
  marque: '',
  categorie: '',
  taille: '',
  etat: 'Très bon état',
  couleur: '',
  matiere: '',
  prix: '',
  prixMin: '',
  motsCles: [],
  defauts: [],
  conseilPhotos: '',
};

export function makeListing(fields = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...EMPTY,
    ...fields,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}

// L'API répond en snake_case ; l'app stocke en camelCase.
export function fromApi(data) {
  return makeListing({
    titre: data.titre || '',
    description: data.description || '',
    marque: data.marque || '',
    categorie: data.categorie || '',
    taille: data.taille || '',
    etat: ETATS.includes(data.etat) ? data.etat : 'Très bon état',
    couleur: data.couleur || '',
    matiere: data.matiere || '',
    prix: data.prix != null ? String(data.prix) : '',
    prixMin: data.prix_min != null ? String(data.prix_min) : '',
    motsCles: Array.isArray(data.mots_cles) ? data.mots_cles : [],
    defauts: Array.isArray(data.defauts) ? data.defauts : [],
    conseilPhotos: data.conseil_photos || '',
  });
}

// Ce qu'on colle dans le champ Description de Vinted : la description rédigée,
// les défauts (qui doivent rester visibles) puis les mots-clés pour la recherche.
export function descriptionText(listing) {
  const parts = [listing.description.trim()];

  if (listing.defauts.length) {
    parts.push(`À noter : ${listing.defauts.join(', ')}.`);
  }

  const specs = [
    listing.marque && `Marque : ${listing.marque}`,
    listing.taille && `Taille : ${listing.taille}`,
    listing.matiere && `Matière : ${listing.matiere}`,
    listing.couleur && `Couleur : ${listing.couleur}`,
  ].filter(Boolean);
  if (specs.length) parts.push(specs.join('\n'));

  if (listing.motsCles.length) parts.push(listing.motsCles.join(' · '));

  return parts.filter(Boolean).join('\n\n');
}
