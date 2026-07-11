const claseModel = require('../models/claseModel');
const cursoModel = require('../models/cursoModel');

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

  const partesFecha = fechaNormalizada.split('-').map(Number);
  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fechaNormalizada)
    && new Date(Date.UTC(...[partesFecha[0], partesFecha[1] - 1, partesFecha[2]]))
      .toISOString()
      .startsWith(fechaNormalizada);

  if (!fechaValida) {
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

module.exports = { index, store };
