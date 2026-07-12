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

async function update(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El id no es válido',
    });
  }

  const { nombre, email, rol, activo } = req.body;
  const emailNormalizado = typeof email === 'string'
    ? email.trim().toLowerCase()
    : '';

  if (!nombre || !emailNormalizado || !rol || activo === undefined || activo === null) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios',
    });
  }

  if (typeof activo !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'El estado activo no es válido',
    });
  }

  if (!['admin', 'profesor', 'alumno'].includes(rol)) {
    return res.status(400).json({
      success: false,
      message: 'El rol no es válido',
    });
  }

  try {
    const usuarioExistente = await usuarioModel.findById(id);

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const usuarioConEmail = await usuarioModel.findByEmail(emailNormalizado);

    if (usuarioConEmail && usuarioConEmail.id !== id) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    const usuario = await usuarioModel.update(id, {
      nombre,
      email: emailNormalizado,
      rol,
      activo,
    });

    return res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
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
      message: 'Error al actualizar el usuario',
    });
  }
}

async function destroy(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El id no es válido',
    });
  }

  try {
    const usuario = await usuarioModel.findById(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (id === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'No podés eliminar tu propia cuenta',
      });
    }

    if (usuario.rol === 'profesor') {
      const cantidadCursos = await usuarioModel.countCoursesByProfesor(id);

      if (cantidadCursos > 0) {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar un profesor con cursos asignados',
        });
      }
    }

    await usuarioModel.remove(id);

    return res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario',
    });
  }
}

module.exports = { index, store, update, destroy };
