const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM projetos');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener proyectos' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM projetos WHERE id = ?', [req.params.id]);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ error: 'Projeto no encontrado' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener proyecto' });
    }
  });

  return router;
};
