const express = require('express');
const nodemailer = require('nodemailer');

module.exports = (db) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { nome, email, telefone, mensagem } = req.body;

    // Opcional: guardar en tabla de contactos (si la creas)
    // await db.query('INSERT INTO contatos ...')

    // Configurar transporte de email
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
      from: `"Anacleto Web" <${process.env.EMAIL_USER}>`,
      to: 'projetos@anacletoesquadrias.com.br', // Cambia si quieres otro destino
      subject: 'Novo contato do site',
      text: `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nMensagem: ${mensagem}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Mensagem enviada com sucesso.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' });
    }
  });

  return router;
};
