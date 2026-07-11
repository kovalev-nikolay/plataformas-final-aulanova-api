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

  // Formatea fecha y hora antes de devolver las clases.
  const [clases] = await pool.execute(
    `SELECT
       cl.id,
       cl.curso_id AS courseId,
       cl.titulo,
       DATE_FORMAT(cl.fecha, '%Y-%m-%d') AS fecha,
       TIME_FORMAT(cl.hora, '%H:%i') AS hora,
       cl.aula
     FROM clases cl
     INNER JOIN cursos c ON c.id = cl.curso_id
     ${filtro}
     ORDER BY cl.fecha, cl.hora`,
    parametros,
  );

  return clases;
}

module.exports = { allByUser };
