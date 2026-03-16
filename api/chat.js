const cohere = require('cohere-ai');

// Inicializa Cohere con la API key de las variables de entorno
cohere.init(process.env.COHERE_API_KEY);

module.exports = async (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Mensagem não fornecida' });
  }

  try {
    const response = await cohere.generate({
      model: 'command',
      prompt: `Você é um assistente virtual da empresa Anacleto Esquadrias, especializada em soluções de vidro e alumínio no Rio Grande do Sul. Responda de forma amigável e profissional a seguinte pergunta: ${message}`,
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = response.body.generations[0].text.trim();
    res.json({ resposta: reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar a mensagem' });
  }
};
