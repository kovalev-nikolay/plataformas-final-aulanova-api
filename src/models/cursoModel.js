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

module.exports = { allByUser };
