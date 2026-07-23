import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, mediaType } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: image,
            },
          },
          {
            type: 'text',
            text: `Tu vois une étiquette nutritionnelle. Extrais les valeurs POUR 100g ou 100mL.
Réponds UNIQUEMENT avec ce JSON (rien d'autre, pas de texte autour) :
{"name":"nom du produit","kcal":0,"proteines":0,"lipides":0,"glucides":0,"unit":"g"}
Règles :
- unit = "g" si aliment solide, "ml" si boisson/liquide
- Toutes les valeurs numériques sont des nombres décimaux (pas des strings)
- Si une valeur est absente de l'étiquette, mets 0
- Le nom doit être court et en français si possible`,
          },
        ],
      },
    ],
  });

  try {
    const raw = msg.content[0].text.trim();
    // Extract JSON even if there's extra text around it
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');
    const data = JSON.parse(match[0]);
    res.json(data);
  } catch {
    res.status(422).json({ error: 'Analyse impossible — essaie avec une meilleure photo' });
  }
}
