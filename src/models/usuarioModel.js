const bcrypt = require('bcrypt');
const pool = require('../../db');

async function login({ email, contrasena }) {
  // Busca solamente usuarios activos.
  const [usuarios] = await pool.execute(
    `SELECT id, nombre, email, contrasena, rol
     FROM usuarios
     WHERE email = ? AND activo = TRUE
     LIMIT 1`,
    [email],
  );

  const usuario = usuarios[0];

  if (!usuario) {
    return null;
  }

  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

  return contrasenaValida ? usuario : null;
}

async function all() {
  // Recupera solamente datos públicos de los usuarios.
  const [usuarios] = await pool.query(
    `SELECT id, nombre, email, rol, activo
     FROM usuarios
     ORDER BY nombre`,
  );

  return usuarios;
}

async function findByEmail(email) {
  const [usuarios] = await pool.execute(
    `SELECT id, nombre, email, rol, activo
     FROM usuarios
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  return usuarios[0] || null;
}

async function create({ nombre, email, contrasena, rol }) {
  const [resultado] = await pool.execute(
    `INSERT INTO usuarios (nombre, email, contrasena, rol, activo)
     VALUES (?, ?, ?, ?, TRUE)`,
    [nombre, email, contrasena, rol],
  );

  return {
    id: resultado.insertId,
    nombre,
    email,
    rol,
    activo: true,
  };
}

module.exports = { login, all, findByEmail, create };
