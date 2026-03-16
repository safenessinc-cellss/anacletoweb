const express = require('express');
const multer = require('multer');
const path = require('path');

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../imagen/')); // guarda en /imagen
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = express.Router();

// Ruta para subir una imagen
router.post('/', upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se subió ninguna imagen.' });
  }
  const imageUrl = `/imagen/${req.file.filename}`;
  res.json({ success: true, imageUrl, message: 'Imagen subida correctamente.' });
});

module.exports = router;
