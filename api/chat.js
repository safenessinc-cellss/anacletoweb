const cohere = require('cohere-ai');

// Inicializa Cohere con la API key de las variables de entorno
cohere.init(process.env.e99la0ANT3PKOT4jYUdJ9QeB6t78zdQM7FCs4z11);

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder a preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Mensagem não fornecida' });
  }

  try {
    const response = await cohere.generate({
      model: 'command-xlarge-nightly', // Modelo gratuito
      prompt: `Você é um assistente virtual da empresa Anacleto Esquadrias, especializada em soluções de vidro e alumínio no Rio Grande do Sul. Responda de forma amigável e profissional a seguinte pergunta: ${message}`,
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = response.body.generations[0].text.trim();
    res.json({ resposta: reply });
  } catch (error) {
    console.error('Erro no Cohere:', error);
    res.status(500).json({ error: 'Erro ao processar a mensagem' });
  }
};
