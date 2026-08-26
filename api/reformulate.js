const ALLOWED_ORIGINS = new Set([
  'https://tenebros2812.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
]);

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    observation: { type: 'string' },
    diagnosis: { type: 'string' },
    work: { type: 'string' },
    parts: { type: 'string' },
    tests: { type: 'string' },
    notes: { type: 'string' }
  },
  required: ['observation', 'diagnosis', 'work', 'parts', 'tests', 'notes']
};

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!ALLOWED_ORIGINS.has(req.headers.origin)) return res.status(403).json({ error: 'Origine non autorisée.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Service IA non configuré.' });

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text || text.length > 12000) return res.status(400).json({ error: 'Dictée absente ou trop longue.' });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
        store: false,
        instructions: [
          'Tu reformules une dictée de technicien de maintenance industrielle en compte rendu professionnel, concis et fidèle.',
          'N’invente jamais une information, une cause, une pièce, une mesure ou un résultat.',
          'Conserve les références techniques, valeurs, symptômes, actions et réserves exactement.',
          'Répartis seulement les informations présentes dans les six rubriques demandées.',
          'Laisse une rubrique vide si la dictée ne fournit aucune information correspondante.'
        ].join(' '),
        input: text,
        text: {
          format: {
            type: 'json_schema',
            name: 'rapport_intervention',
            strict: true,
            schema
          }
        }
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      const detail = payload?.error?.message || payload?.error?.code || `Erreur OpenAI ${response.status}`;
      return res.status(502).json({ error: detail });
    }
    const outputText = payload.output?.flatMap(item => item.content || []).find(part => part.type === 'output_text')?.text;
    if (!outputText) return res.status(502).json({ error: 'Réponse IA vide.' });
    return res.status(200).json(JSON.parse(outputText));
  } catch {
    return res.status(500).json({ error: 'Service IA momentanément indisponible.' });
  }
}
