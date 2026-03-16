const express = require('express');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = (db) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { message } = req.body;

    const systemPrompt = 'Eres un asistente virtual de Anacleto Esquadrias, empresa especializada en soluciones de vidrio y aluminio en Rio Grande do Sul. Respondes de forma amable y profesional.';

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      });

      const resposta = completion.choices[0].message.content;

      // Guardar en BD
      await db.query(
        'INSERT INTO chats (mensagem_usuario, resposta_bot) VALUES (?, ?)',
        [message, resposta]
      );

      res.json({ success: true, resposta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error en el chat.', resposta: 'Lo siento, tengo problemas técnicos. Por favor, intenta más tarde.' });
    }
  });

  return router;
};
