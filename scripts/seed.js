require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../db');

async function cargarDatosIniciales() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Limpia los datos respetando las claves foráneas.
    await connection.query('DELETE FROM curso_alumnos');
    await connection.query('DELETE FROM clases');
    await connection.query('DELETE FROM cursos');
    await connection.query('DELETE FROM usuarios');

    const adminHash = await bcrypt.hash('admin123', 10);
    const profesorHash = await bcrypt.hash('profe123', 10);
    const alumnoHash = await bcrypt.hash('alumno123', 10);

    await connection.execute(
      'INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)',
      ['Sofía Martínez', 'admin@aulanova.com', adminHash, 'admin'],
    );

    const [profesor] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)',
      ['Diego Fernández', 'profesor@aulanova.com', profesorHash, 'profesor'],
    );

    const [alumno] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)',
      ['Camila Torres', 'alumno@aulanova.com', alumnoHash, 'alumno'],
    );

    // Crea los cursos del profesor.
    const [ingles] = await connection.execute(
      'INSERT INTO cursos (nombre, idioma, nivel, profesor_id) VALUES (?, ?, ?, ?)',
      ['Ingles inicial', 'Ingles', 'A1', profesor.insertId],
    );
    const [frances] = await connection.execute(
      'INSERT INTO cursos (nombre, idioma, nivel, profesor_id) VALUES (?, ?, ?, ?)',
      ['Frances conversacion', 'Frances', 'A2', profesor.insertId],
    );
    const [portugues] = await connection.execute(
      'INSERT INTO cursos (nombre, idioma, nivel, profesor_id) VALUES (?, ?, ?, ?)',
      ['Portugues para viajeros', 'Portugues', 'Inicial', profesor.insertId],
    );

    // Crea las clases iniciales.
    await connection.execute(
      'INSERT INTO clases (curso_id, titulo, fecha, hora, aula) VALUES (?, ?, ?, ?, ?)',
      [ingles.insertId, 'Presentaciones personales', '2026-07-06', '18:00', 'Aula 1'],
    );
    await connection.execute(
      'INSERT INTO clases (curso_id, titulo, fecha, hora, aula) VALUES (?, ?, ?, ?, ?)',
      [ingles.insertId, 'Verbo to be', '2026-07-08', '18:00', 'Aula 1'],
    );
    await connection.execute(
      'INSERT INTO clases (curso_id, titulo, fecha, hora, aula) VALUES (?, ?, ?, ?, ?)',
      [frances.insertId, 'Charla sobre rutinas', '2026-07-07', '19:30', 'Aula 2'],
    );
    await connection.execute(
      'INSERT INTO clases (curso_id, titulo, fecha, hora, aula) VALUES (?, ?, ?, ?, ?)',
      [portugues.insertId, 'Saludos y frases utiles', '2026-07-09', '17:00', 'Aula 3'],
    );

    // Inscribe a la alumna en sus cursos.
    await connection.execute(
      'INSERT INTO curso_alumnos (curso_id, alumno_id) VALUES (?, ?), (?, ?)',
      [ingles.insertId, alumno.insertId, frances.insertId, alumno.insertId],
    );

    await connection.commit();
    console.log('Datos iniciales cargados correctamente');
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Error al cargar los datos iniciales:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      connection.release();
    }

    await pool.end();
  }
}

cargarDatosIniciales();
