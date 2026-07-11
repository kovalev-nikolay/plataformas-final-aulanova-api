const claseModel = require('../models/claseModel');
const cursoModel = require('../models/cursoModel');

function esFechaValida(fecha) {
  const partes = fecha.split('-').map(Number);

  return /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    && new Date(Date.UTC(partes[0], partes[1] - 1, partes[2]))
      .toISOString()
      .startsWith(fecha);
}

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

async function store(req, res) {
  const { courseId, titulo, fecha, hora, aula } = req.body;
  const tituloNormalizado = typeof titulo === 'string' ? titulo.trim() : '';
  const fechaNormalizada = typeof fecha === 'string' ? fecha.trim() : '';
  const horaNormalizada = typeof hora === 'string' ? hora.trim() : '';
  const aulaNormalizada = typeof aula === 'string' ? aula.trim() : '';

  if (
    courseId === undefined
    || courseId === null
    || courseId === ''
    || !tituloNormalizado
    || !fechaNormalizada
    || !horaNormalizada
    || !aulaNormalizada
  ) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios',
    });
  }

  const courseIdNormalizado = Number(courseId);

  if (!Number.isInteger(courseIdNormalizado) || courseIdNormalizado <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El id del curso no es válido',
    });
  }

  if (!esFechaValida(fechaNormalizada)) {
    return res.status(400).json({
      success: false,
      message: 'La fecha no es válida',
    });
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horaNormalizada)) {
    return res.status(400).json({
      success: false,
      message: 'La hora no es válida',
    });
  }

  try {
    const curso = await cursoModel.findById(courseIdNormalizado);

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    if (
      req.user.rol === 'profesor'
      && Number(curso.profesorId) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tenés permisos para crear clases en este curso',
      });
    }

    const clase = await claseModel.create({
      courseId: courseIdNormalizado,
      titulo: tituloNormalizado,
      fecha: fechaNormalizada,
      hora: horaNormalizada,
      aula: aulaNormalizada,
    });

    return res.status(201).json({
      success: true,
      message: 'Clase creada correctamente',
      clase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear la clase',
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

  const { courseId, titulo, fecha, hora, aula } = req.body;
  const tituloNormalizado = typeof titulo === 'string' ? titulo.trim() : '';
  const fechaNormalizada = typeof fecha === 'string' ? fecha.trim() : '';
  const horaNormalizada = typeof hora === 'string' ? hora.trim() : '';
  const aulaNormalizada = typeof aula === 'string' ? aula.trim() : '';

  if (
    courseId === undefined
    || courseId === null
    || courseId === ''
    || !tituloNormalizado
    || !fechaNormalizada
    || !horaNormalizada
    || !aulaNormalizada
  ) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios',
    });
  }

  const courseIdNormalizado = Number(courseId);

  if (!Number.isInteger(courseIdNormalizado) || courseIdNormalizado <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El id del curso no es válido',
    });
  }

  if (!esFechaValida(fechaNormalizada)) {
    return res.status(400).json({
      success: false,
      message: 'La fecha no es válida',
    });
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horaNormalizada)) {
    return res.status(400).json({
      success: false,
      message: 'La hora no es válida',
    });
  }

  try {
    const claseExistente = await claseModel.findById(id);

    if (!claseExistente) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada',
      });
    }

    const cursoNuevo = await cursoModel.findById(courseIdNormalizado);

    if (!cursoNuevo) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    if (req.user.rol === 'profesor') {
      const cursoActual = await cursoModel.findById(claseExistente.courseId);
      const profesorId = Number(req.user.id);

      if (
        !cursoActual
        || Number(cursoActual.profesorId) !== profesorId
        || Number(cursoNuevo.profesorId) !== profesorId
      ) {
        return res.status(403).json({
          success: false,
          message: 'No tenés permisos para modificar esta clase',
        });
      }
    }

    const clase = await claseModel.update(id, {
      courseId: courseIdNormalizado,
      titulo: tituloNormalizado,
      fecha: fechaNormalizada,
      hora: horaNormalizada,
      aula: aulaNormalizada,
    });

    return res.json({
      success: true,
      message: 'Clase actualizada correctamente',
      clase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la clase',
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
    const clase = await claseModel.findById(id);

    if (!clase) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada',
      });
    }

    const curso = await cursoModel.findById(clase.courseId);

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    if (
      req.user.rol === 'profesor'
      && Number(curso.profesorId) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tenés permisos para eliminar esta clase',
      });
    }

    await claseModel.remove(id);

    return res.json({
      success: true,
      message: 'Clase eliminada correctamente',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la clase',
    });
  }
}

module.exports = { index, store, update, destroy };
