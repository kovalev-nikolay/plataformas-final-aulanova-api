const pool = require('../../db');

async function allByUser(usuario) {
  let filtro = '';
  const parametros = [];

  if (usuario.rol === 'profesor') {
    filtro = 'WHERE c.profesor_id = ?';
    parametros.push(usuario.id);
  } else if (usuario.rol === 'alumno') {
    filtro = `WHERE EXISTS (
      SELECT 1
      FROM curso_alumnos inscripcion
      WHERE inscripcion.curso_id = c.id
        AND inscripcion.alumno_id = ?
    )`;
    parametros.push(usuario.id);
  } else if (usuario.rol !== 'admin') {
    return [];
  }

  // Agrupa las inscripciones de cada curso.
  const [cursos] = await pool.execute(
    `SELECT
       c.id,
       c.nombre,
       c.idioma,
       c.nivel,
       c.profesor_id AS profesorId,
       GROUP_CONCAT(DISTINCT ca.alumno_id ORDER BY ca.alumno_id) AS alumnosIds
     FROM cursos c
     LEFT JOIN curso_alumnos ca ON ca.curso_id = c.id
     ${filtro}
     GROUP BY c.id, c.nombre, c.idioma, c.nivel, c.profesor_id
     ORDER BY c.nombre`,
    parametros,
  );

  return cursos.map((curso) => ({
    ...curso,
    alumnosIds: curso.alumnosIds
      ? curso.alumnosIds.split(',').map(Number)
      : [],
  }));
}

async function create({ nombre, idioma, nivel, profesorId }) {
  const [resultado] = await pool.execute(
    `INSERT INTO cursos (nombre, idioma, nivel, profesor_id)
     VALUES (?, ?, ?, ?)`,
    [nombre, idioma, nivel, profesorId],
  );

  return {
    id: resultado.insertId,
    nombre,
    idioma,
    nivel,
    profesorId,
    alumnosIds: [],
  };
}

async function findById(id) {
  const [cursos] = await pool.execute(
    `SELECT
       c.id,
       c.nombre,
       c.idioma,
       c.nivel,
       c.profesor_id AS profesorId,
       GROUP_CONCAT(DISTINCT ca.alumno_id ORDER BY ca.alumno_id) AS alumnosIds
     FROM cursos c
     LEFT JOIN curso_alumnos ca ON ca.curso_id = c.id
     WHERE c.id = ?
     GROUP BY c.id, c.nombre, c.idioma, c.nivel, c.profesor_id
     LIMIT 1`,
    [id],
  );

  const curso = cursos[0];

  if (!curso) {
    return null;
  }

  return {
    ...curso,
    alumnosIds: curso.alumnosIds
      ? curso.alumnosIds.split(',').map(Number)
      : [],
  };
}

async function update(id, { nombre, idioma, nivel, profesorId }) {
  await pool.execute(
    `UPDATE cursos
     SET nombre = ?, idioma = ?, nivel = ?, profesor_id = ?
     WHERE id = ?`,
    [nombre, idioma, nivel, profesorId, id],
  );

  return findById(id);
}

module.exports = { allByUser, create, findById, update };
