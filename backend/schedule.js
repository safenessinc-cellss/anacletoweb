const mysql = require('mysql2/promise'); // Importamos mysql2 con soporte de promesas

// Crear el pool de conexiones usando las variables de entorno de Railway
const db = mysql.createPool({
  host: process.env.MYSQLHOST,         // Ejemplo: containers-us-west-xxx.railway.app
  user: process.env.MYSQLUSER,         // Normalmente "root"
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,          // Normalmente 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar la conexión (opcional)
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conectado a MySQL en Railway');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
})();

// Función para crear las tablas si no existen
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

// Llamar a la función de creación de tablas (sin await aquí, se ejecuta asíncrona)
createTables();
