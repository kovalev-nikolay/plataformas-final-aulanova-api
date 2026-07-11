const cursoModel = require('../models/cursoModel');

async function index(req, res) {
  try {
    const cursos = await cursoModel.allByUser(req.user);

    return res.json({
      success: true,
      cursos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al recuperar los cursos',
    });
  }
}

module.exports = { index };
