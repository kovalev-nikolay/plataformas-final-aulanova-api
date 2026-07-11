const claseModel = require('../models/claseModel');

async function index(req, res) {
  try {
    const clases = await claseModel.allByUser(req.user);

    return res.json({
      success: true,
      clases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al recuperar las clases',
    });
  }
}

module.exports = { index };
