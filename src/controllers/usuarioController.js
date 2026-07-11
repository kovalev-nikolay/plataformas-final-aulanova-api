const bcrypt = require('bcrypt');
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

async function store(req, res) {
  const { nombre, email, contrasena, rol } = req.body;
  const emailNormalizado = typeof email === 'string'
    ? email.trim().toLowerCase()
    : '';

  if (!nombre || !emailNormalizado || !contrasena || !rol) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios',
    });
  }

  if (!['admin', 'profesor', 'alumno'].includes(rol)) {
    return res.status(400).json({
      success: false,
      message: 'El rol no es válido',
    });
  }

  if (typeof contrasena !== 'string' || contrasena.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    });
  }

  try {
    const usuarioExistente = await usuarioModel.findByEmail(emailNormalizado);

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    const contrasenaCifrada = await bcrypt.hash(contrasena, 10);
    const usuario = await usuarioModel.create({
      nombre,
      email: emailNormalizado,
      contrasena: contrasenaCifrada,
      rol,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      usuario,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al crear el usuario',
    });
  }
}

module.exports = { index, store };
