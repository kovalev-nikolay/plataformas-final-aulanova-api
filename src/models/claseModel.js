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

async function create({ courseId, titulo, fecha, hora, aula }) {
  const [resultado] = await pool.execute(
    `INSERT INTO clases (curso_id, titulo, fecha, hora, aula)
     VALUES (?, ?, ?, ?, ?)`,
    [courseId, titulo, fecha, hora, aula],
  );

  return {
    id: resultado.insertId,
    courseId,
    titulo,
    fecha,
    hora,
    aula,
  };
}

async function findById(id) {
  const [clases] = await pool.execute(
    `SELECT
       id,
       curso_id AS courseId,
       titulo,
       DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
       TIME_FORMAT(hora, '%H:%i') AS hora,
       aula
     FROM clases
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return clases[0] || null;
}

async function update(id, { courseId, titulo, fecha, hora, aula }) {
  await pool.execute(
    `UPDATE clases
     SET curso_id = ?, titulo = ?, fecha = ?, hora = ?, aula = ?
     WHERE id = ?`,
    [courseId, titulo, fecha, hora, aula, id],
  );

  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM clases WHERE id = ?', [id]);
}

module.exports = { allByUser, create, findById, update, remove };
