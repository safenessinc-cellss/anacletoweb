const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/imagen', express.static(path.join(__dirname, '../imagen')));

// Crear pool de conexiones a MySQL usando variables de entorno de Railway
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conectado a MySQL en Railway');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
})();

// Función para crear tablas si no existen
async function createTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        local VARCHAR(255),
        descricao TEXT,
        imagem VARCHAR(255),
        categoria VARCHAR(100)
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(50),
        data VARCHAR(50) NOT NULL,
        horario VARCHAR(50) NOT NULL,
        tipo_servico VARCHAR(100),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`
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
    await db.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mensagem_usuario TEXT,
        resposta_bot TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tablas verificadas/creadas en MySQL');
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
  }
}
createTables();

// Insertar algunos proyectos de ejemplo (si la tabla está vacía)
(async () => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM projetos');
    if (rows[0].count === 0) {
      await db.query(
        'INSERT INTO projetos (titulo, local, descricao, imagem, categoria) VALUES ?',
        [[
          ['Edifício Corporate Tower', 'Centro Histórico - Porto Alegre', 'Fachada envidraçada para edifício corporativo de 18 andares.', '/imagen/corporate.jpg', 'comercial'],
          ['Shopping Total Canoas', 'Canoas - RS', 'Cúpula e fachadas ventiladas com mais de 5.000 m² de vidro.', '/imagen/shopping.jpg', 'comercial'],
          ['Hospital Municipal NH', 'Novo Hamburgo - Vale do Sinos', 'Sistemas de divisórias e fachadas para áreas médicas.', '/imagen/hospital.jpg', 'comercial'],
          ['Residencial Alphaville', 'Porto Alegre - RS', 'Esquadrias de alumínio para condomínio de alto padrão.', '/imagen/alphaville.jpg', 'residencial']
        ]]
      );
      console.log('✅ Proyectos de ejemplo insertados.');
    }
  } catch (error) {
    console.error('Error al insertar proyectos:', error);
  }
})();

// Importar rutas
const contactRouter = require('./routes/contact')(db);
const scheduleRouter = require('./routes/schedule')(db);
const budgetRouter = require('./routes/budget')(db);
const chatRouter = require('./routes/chat')(db);
const projectsRouter = require('./routes/projects')(db);
const uploadRouter = require('./routes/upload');

app.use('/api/contact', contactRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/chat', chatRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/upload', uploadRouter);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
