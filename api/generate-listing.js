import Anthropic from '@anthropic-ai/sdk';

// Valeurs acceptées par Vinted dans le champ "État" — l'enum évite d'avoir à
// corriger à la main avant de recopier dans l'app.
const ETATS = [
  'Neuf avec étiquette',
  'Neuf sans étiquette',
  'Très bon état',
  'Bon état',
  'Satisfaisant',
];

const LISTING_TOOL = {
  name: 'creer_annonce',
  description: "Enregistre l'annonce Vinted rédigée à partir des photos.",
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      titre: {
        type: 'string',
        description: 'Max 60 caractères. Format "Type de pièce + marque + couleur/détail".',
      },
      description: {
        type: 'string',
        description:
          '3 à 5 lignes : la pièce, la matière, la coupe, les défauts éventuels, pourquoi tu la vends.',
      },
      marque: { type: 'string', description: 'Vide si illisible sur les photos.' },
      categorie: {
        type: 'string',
        description: 'Chemin Vinted, ex. "Femmes > Vêtements > Robes".',
      },
      taille: { type: 'string', description: 'Vide si aucune étiquette visible.' },
      etat: { type: 'string', enum: ETATS },
      couleur: { type: 'string' },
      matiere: { type: 'string', description: 'Vide si aucune composition lisible.' },
      prix: { type: 'number', description: 'Prix conseillé en euros, ce que le vendeur touche.' },
      prix_min: { type: 'number', description: 'Plancher raisonnable en cas de négociation.' },
      mots_cles: {
        type: 'array',
        items: { type: 'string' },
        description: '3 à 6 termes de recherche que taperait un acheteur.',
      },
      defauts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Défauts réellement visibles sur les photos. Tableau vide si aucun.',
      },
      conseil_photos: {
        type: 'string',
        description: 'Une phrase : la photo qui manque pour mieux vendre.',
      },
    },
    required: [
      'titre',
      'description',
      'marque',
      'categorie',
      'taille',
      'etat',
      'couleur',
      'matiere',
      'prix',
      'prix_min',
      'mots_cles',
      'defauts',
      'conseil_photos',
    ],
    additionalProperties: false,
  },
};

const SYSTEM = `Tu rédiges des annonces de vêtements d'occasion pour Vinted (marché français).

Règles :
- Tu ne décris QUE ce que tu vois sur les photos. Pas de matière, de marque ni de taille inventée : si ce n'est pas lisible, laisse le champ vide.
- Signale les défauts visibles (bouloches, taches, trous, décoloration, semelles usées). Une annonce honnête évite les litiges et les remboursements.
- Le ton est direct et concret, celui d'un particulier. Pas de superlatifs publicitaires, pas d'emojis, pas de hashtags.
- Le prix tient compte de la marque, de l'état et du marché de l'occasion français. C'est le prix net vendeur : les frais de protection acheteur s'ajoutent par-dessus et ne te concernent pas.
- Si l'utilisateur fournit des indications (marque, taille, prix souhaité), elles prévalent sur ta lecture des photos.

Appelle toujours l'outil creer_annonce pour rendre ton résultat.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { images, hints } = req.body;

  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Au moins une photo est requise' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const content = images.slice(0, 6).map((img) => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: img.mediaType || 'image/jpeg',
      data: img.data,
    },
  }));

  const indications = [
    hints?.marque && `Marque : ${hints.marque}`,
    hints?.taille && `Taille : ${hints.taille}`,
    hints?.prix && `Prix souhaité : ${hints.prix} €`,
    hints?.notes && `Précisions : ${hints.notes}`,
  ].filter(Boolean);

  content.push({
    type: 'text',
    text: indications.length
      ? `Rédige l'annonce pour cet article.\n\nIndications du vendeur :\n${indications.join('\n')}`
      : "Rédige l'annonce pour cet article.",
  });

  try {
    const msg = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 2000,
      // Tâche courte et lancée à la main depuis le téléphone : on privilégie
      // la latence et le coût plutôt que la profondeur de raisonnement.
      output_config: { effort: 'low' },
      system: SYSTEM,
      tools: [LISTING_TOOL],
      messages: [{ role: 'user', content }],
    });

    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block) {
      return res
        .status(422)
        .json({ error: 'Analyse impossible — réessaie avec des photos plus nettes' });
    }

    res.json(block.input);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Trop de requêtes — attends quelques secondes' });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ error: 'Clé API refusée — vérifie ANTHROPIC_API_KEY' });
    }
    // Un crédit épuisé revient en 400 : sans ce cas, le message générique
    // ci-dessous envoie chercher une panne alors qu'il suffit de recharger.
    if (
      error instanceof Anthropic.BadRequestError &&
      /credit balance/i.test(error.message)
    ) {
      return res.status(402).json({
        error: 'Crédit API Anthropic épuisé — recharge sur console.anthropic.com',
      });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('generate-listing API error:', error.status, error.message);
      return res.status(502).json({ error: "Le service d'analyse n'a pas répondu" });
    }
    console.error('generate-listing error:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
}
