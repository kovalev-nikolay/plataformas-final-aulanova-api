const cursoModel = require('../models/cursoModel');
const usuarioModel = require('../models/usuarioModel');

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

async function store(req, res) {
  const { nombre, idioma, nivel, profesorId } = req.body;
  const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
  const idiomaNormalizado = typeof idioma === 'string' ? idioma.trim() : '';
  const nivelNormalizado = typeof nivel === 'string' ? nivel.trim() : '';

  if (
    !nombreNormalizado
    || !idiomaNormalizado
    || !nivelNormalizado
    || profesorId === undefined
    || profesorId === null
    || profesorId === ''
  ) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios',
    });
  }

  const profesorIdNormalizado = Number(profesorId);

  if (!Number.isInteger(profesorIdNormalizado) || profesorIdNormalizado <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El id del profesor no es válido',
    });
  }

  try {
    const profesor = await usuarioModel.findById(profesorIdNormalizado);

    if (!profesor || profesor.rol !== 'profesor' || !profesor.activo) {
      return res.status(400).json({
        success: false,
        message: 'El profesor no es válido',
      });
    }

    const curso = await cursoModel.create({
      nombre: nombreNormalizado,
      idioma: idiomaNormalizado,
      nivel: nivelNormalizado,
      profesorId: profesorIdNormalizado,
    });

    return res.status(201).json({
      success: true,
      message: 'Curso creado correctamente',
      curso,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear el curso',
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

  const { nombre, idioma, nivel, profesorId } = req.body;
  const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
  const idiomaNormalizado = typeof idioma === 'string' ? idioma.trim() : '';
  const nivelNormalizado = typeof nivel === 'string' ? nivel.trim() : '';

  if (
    !nombreNormalizado
    || !idiomaNormalizado
    || !nivelNormalizado
    || profesorId === undefined
    || profesorId === null
    || profesorId === ''
  ) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios',
    });
  }

  const profesorIdNormalizado = Number(profesorId);

  if (!Number.isInteger(profesorIdNormalizado) || profesorIdNormalizado <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El id del profesor no es válido',
    });
  }

  try {
    const cursoExistente = await cursoModel.findById(id);

    if (!cursoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    const profesor = await usuarioModel.findById(profesorIdNormalizado);

    if (!profesor || profesor.rol !== 'profesor' || !profesor.activo) {
      return res.status(400).json({
        success: false,
        message: 'El profesor no es válido',
      });
    }

    const curso = await cursoModel.update(id, {
      nombre: nombreNormalizado,
      idioma: idiomaNormalizado,
      nivel: nivelNormalizado,
      profesorId: profesorIdNormalizado,
    });

    return res.json({
      success: true,
      message: 'Curso actualizado correctamente',
      curso,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el curso',
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
    const curso = await cursoModel.findById(id);

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    const cantidadClases = await cursoModel.countClasses(id);

    if (cantidadClases > 0) {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar un curso con clases asociadas',
      });
    }

    await cursoModel.remove(id);

    return res.json({
      success: true,
      message: 'Curso eliminado correctamente',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el curso',
    });
  }
}

module.exports = { index, store, update, destroy };
