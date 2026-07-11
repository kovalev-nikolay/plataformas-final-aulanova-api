const usuarioModel = require('../models/usuarioModel');

async function index(req, res) {
  try {
    const usuarios = await usuarioModel.all();

    return res.json({
      success: true,
      usuarios,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al recuperar los usuarios',
    });
  }
}

module.exports = { index };
