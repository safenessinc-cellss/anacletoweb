const express = require('express');
const nodemailer = require('nodemailer');

module.exports = (db) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { nome, email, telefone, data, horario, tipo_servico, comentarios } = req.body;

    try {
      // Guardar en MySQL
      await db.query(
        'INSERT INTO visitas (nome, email, telefone, data, horario, tipo_servico) VALUES (?, ?, ?, ?, ?, ?)',
        [nome, email, telefone, data, horario, tipo_servico]
      );

      // Enviar email de confirmación al cliente
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
        from: `"Anacleto Visitas" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Confirmação de visita técnica - Anacleto Esquadrias',
        text: `Olá ${nome}, sua visita técnica foi agendada para ${data} no período da ${horario}. Em breve um técnico entrará em contato. Obrigado!`,
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: 'Visita agendada e e-mail enviado.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Erro ao processar solicitação.' });
    }
  });

  return router;
};
