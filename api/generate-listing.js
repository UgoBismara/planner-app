// Génération d'annonces via l'API Gemini (palier gratuit).
// Appel REST direct : pas de SDK à installer, et le JSON renvoyé au front
// garde exactement la forme que src/data/vinted.js sait lire.

// Surchargeable sans redéploiement de code si Google renomme le modèle gratuit.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

// Valeurs acceptées par Vinted dans le champ "État" — l'enum évite d'avoir à
// corriger à la main avant de recopier dans l'app.
const ETATS = [
  'Neuf avec étiquette',
  'Neuf sans étiquette',
  'Très bon état',
  'Bon état',
  'Satisfaisant',
];

// Schéma au format OpenAPI attendu par Gemini (responseSchema).
// propertyOrdering compte : le modèle remplit les champs dans cet ordre, donc
// la description est rédigée après que le type de pièce et la marque sont posés.
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    titre: { type: 'STRING', description: 'Max 60 caractères. Type de pièce + marque + couleur.' },
    marque: { type: 'STRING', description: 'Chaîne vide si illisible sur les photos.' },
    categorie: { type: 'STRING', description: 'Chemin Vinted, ex. "Femmes > Vêtements > Robes".' },
    taille: { type: 'STRING', description: 'Chaîne vide si aucune étiquette visible.' },
    etat: { type: 'STRING', enum: ETATS },
    couleur: { type: 'STRING' },
    matiere: { type: 'STRING', description: 'Chaîne vide si aucune composition lisible.' },
    description: {
      type: 'STRING',
      description: '3 à 5 lignes : la pièce, la matière, la coupe, les défauts, pourquoi tu la vends.',
    },
    defauts: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Défauts réellement visibles sur les photos. Tableau vide si aucun.',
    },
    prix: { type: 'NUMBER', description: 'Prix conseillé en euros, net vendeur.' },
    prix_min: { type: 'NUMBER', description: 'Plancher raisonnable en cas de négociation.' },
    mots_cles: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '3 à 6 termes de recherche que taperait un acheteur.',
    },
    conseil_photos: {
      type: 'STRING',
      description: 'Une phrase : la photo qui manque pour mieux vendre.',
    },
  },
  required: [
    'titre',
    'marque',
    'categorie',
    'taille',
    'etat',
    'couleur',
    'matiere',
    'description',
    'defauts',
    'prix',
    'prix_min',
    'mots_cles',
    'conseil_photos',
  ],
  propertyOrdering: [
    'titre',
    'marque',
    'categorie',
    'taille',
    'etat',
    'couleur',
    'matiere',
    'description',
    'defauts',
    'prix',
    'prix_min',
    'mots_cles',
    'conseil_photos',
  ],
};

const SYSTEM = `Tu rédiges des annonces de vêtements d'occasion pour Vinted (marché français).

Règles :
- Tu ne décris QUE ce que tu vois sur les photos. Pas de matière, de marque ni de taille inventée : si ce n'est pas lisible, renvoie une chaîne vide.
- Signale les défauts visibles (bouloches, taches, trous, décoloration, semelles usées). Une annonce honnête évite les litiges et les remboursements.
- Le ton est direct et concret, celui d'un particulier. Pas de superlatifs publicitaires, pas d'emojis, pas de hashtags.
- Le prix tient compte de la marque, de l'état et du marché de l'occasion français. C'est le prix net vendeur : les frais de protection acheteur s'ajoutent par-dessus et ne te concernent pas.
- Si l'utilisateur fournit des indications (marque, taille, prix souhaité), elles prévalent sur ta lecture des photos.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { images, hints } = req.body;

  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Au moins une photo est requise' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res
      .status(500)
      .json({ error: 'GEMINI_API_KEY non configurée — à ajouter côté Vercel' });
  }

  const indications = [
    hints?.marque && `Marque : ${hints.marque}`,
    hints?.taille && `Taille : ${hints.taille}`,
    hints?.prix && `Prix souhaité : ${hints.prix} €`,
    hints?.notes && `Précisions : ${hints.notes}`,
  ].filter(Boolean);

  const parts = images.slice(0, 6).map((img) => ({
    inline_data: {
      mime_type: img.mediaType || 'image/jpeg',
      data: img.data,
    },
  }));

  parts.push({
    text: indications.length
      ? `Rédige l'annonce pour cet article.\n\nIndications du vendeur :\n${indications.join('\n')}`
      : "Rédige l'annonce pour cet article.",
  });

  try {
    const response = await fetch(ENDPOINT(MODEL, key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
          temperature: 0.4,
          maxOutputTokens: 2000,
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.error?.message || 'erreur inconnue';
      console.error('generate-listing Gemini error:', response.status, message);

      if (response.status === 429) {
        return res
          .status(429)
          .json({ error: 'Quota gratuit atteint — réessaie dans quelques minutes' });
      }
      if (response.status === 400 && /API key/i.test(message)) {
        return res.status(401).json({ error: 'Clé API refusée — vérifie GEMINI_API_KEY' });
      }
      if (response.status === 404) {
        return res
          .status(502)
          .json({ error: `Modèle "${MODEL}" indisponible — change GEMINI_MODEL` });
      }
      return res.status(502).json({ error: "Le service d'analyse a renvoyé une erreur" });
    }

    // Une requête bloquée répond 200 sans candidat exploitable.
    const blocked = payload?.promptFeedback?.blockReason;
    if (blocked) {
      return res.status(422).json({ error: `Photos refusées par le filtre (${blocked})` });
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      const reason = payload?.candidates?.[0]?.finishReason || 'réponse vide';
      console.error('generate-listing: pas de contenu,', reason);
      return res
        .status(422)
        .json({ error: 'Analyse impossible — réessaie avec des photos plus nettes' });
    }

    res.json(JSON.parse(text));
  } catch (error) {
    // JSON.parse inclus : responseSchema rend le cas improbable, pas impossible.
    console.error('generate-listing error:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
}
