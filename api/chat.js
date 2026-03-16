const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem não fornecida' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Você é um assistente virtual da empresa Anacleto Esquadrias, especializada em soluções de vidro e alumínio no Rio Grande do Sul. Responda de forma amigável e profissional: ${message}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ resposta: text });
  } catch (error) {
    console.error('Erro no Gemini:', error);
    res.status(500).json({ error: 'Erro ao processar a mensagem' });
  }
};
