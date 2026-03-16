const projects = require('./projects.json');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir peticiones desde el frontend
  res.status(200).json(projects);
};
