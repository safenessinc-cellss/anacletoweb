const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); // Usamos la versión promise

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes y frontend)
app.use('/imagen', express.static(path.join(__dirname, '../imagen')));
// Si quieres servir el frontend también (opcional)
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuración de la conexión a MySQL usando variables de entorno de Railway
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear el pool de conexiones
let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Pool de MySQL creado');
} catch (error) {
  console.error('❌ Error al crear pool de MySQL:', error);
  process.exit(1);
}

// Función para probar la conexión y crear tablas
async function initializeDatabase() {
  try {
    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ Conectado a MySQL en Railway');

    // Crear tablas si no existen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        local VARCHAR(255),
        descricao TEXT,
        imagem VARCHAR(500),
        categoria VARCHAR(100)
      );
    `);
    console.log('✅ Tabla "projetos" verificada');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(50),
        data VARCHAR(50) NOT NULL,
        horario VARCHAR(50) NOT NULL,
        tipo_servico VARCHAR(255),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "visitas" verificada');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orcamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255),
        email VARCHAR(255),
        tipo VARCHAR(100),
        dimensoes VARCHAR(100),
        material VARCHAR(100),
        detalhes TEXT,
        resposta_ia TEXT,
        enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "orcamentos" verificada');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mensagem_usuario TEXT,
        resposta_bot TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "chats" verificada');

    // Verificar si hay proyectos, si no, insertar algunos de ejemplo
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM projetos');
    if (rows[0].count === 0) {
      await connection.query(
        'INSERT INTO projetos (titulo, local, descricao, imagem, categoria) VALUES ?',
        [[
          ['Edifício Corporate Tower', 'Centro Histórico - Porto Alegre', 'Fachada envidraçada para edifício corporativo de 18 andares.', '/imagem/corporate.jpg', 'comercial'],
          ['Shopping Total Canoas', 'Canoas - RS', 'Cúpula e fachadas ventiladas com mais de 5.000 m² de vidro.', '/imagem/shopping.jpg', 'comercial'],
          ['Hospital Municipal NH', 'Novo Hamburgo - Vale do Sinos', 'Sistemas de divisórias e fachadas para áreas médicas.', '/imagem/hospital.jpg', 'comercial'],
          ['Residencial Alphaville', 'Porto Alegre - RS', 'Esquadrias de alumínio para condomínio de alto padrão.', '/imagem/alphaville.jpg', 'residencial']
        ]]
      );
      console.log('✅ Proyectos de ejemplo insertados');
    }

    connection.release();
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

// Llamar a la inicialización
initializeDatabase();

// Hacer que el pool esté disponible para las rutas (lo pasaremos con un middleware)
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Importar rutas (ajusta las rutas según tus archivos)
app.use('/api/contact', require('./routes/contact'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/projects', require('./routes/projects'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
