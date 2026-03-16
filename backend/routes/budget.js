const express = require('express');
const nodemailer = require('nodemailer');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = (db) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { nome, email, tipo, dimensoes, material, detalhes } = req.body;

    const prompt = `Genera un presupuesto detallado y profesional para una esquadria de aluminio con las siguientes características:
    - Tipo: ${tipo}
    - Dimensiones: ${dimensoes}
    - Material: ${material}
    - Detalles adicionales: ${detalhes}
    Incluye conceptos como materiales, mano de obra, instalación y plazos estimados.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });

      const respostaIA = completion.choices[0].message.content;

      // Guardar en BD
      await db.query(
        'INSERT INTO orcamentos (nome, email, tipo, dimensoes, material, detalhes, resposta_ia) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nome, email, tipo, dimensoes, material, detalhes, respostaIA]
      );

      // Enviar email
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Anacleto Orçamentos" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Seu orçamento personalizado - Anacleto Esquadrias',
        text: `Olá ${nome}, segue o orçamento gerado pela nossa IA:\n\n${respostaIA}\n\nEm breve um consultor entrará em contato para detalhes.`,
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: 'Orçamento gerado e enviado por e-mail.', respostaIA });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Erro ao gerar orçamento com IA.' });
    }
  });

  return router;
};
