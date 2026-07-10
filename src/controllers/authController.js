const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

async function login(req, res) {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son obligatorios',
    });
  }

  try {
    const usuario = await usuarioModel.login({ email, contrasena });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
    }

    // El token contiene solamente datos públicos del usuario.
    const datosUsuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
    const accessToken = jwt.sign(
      datosUsuario,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' },
    );

    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      usuario: datosUsuario,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
    });
  }
}

module.exports = { login };
