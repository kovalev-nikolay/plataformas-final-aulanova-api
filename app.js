require('dotenv').config();

const express = require('express');
const pool = require('./db');
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const cursoRoutes = require('./src/routes/cursoRoutes');
const claseRoutes = require('./src/routes/claseRoutes');

const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usuarioRoutes);
app.use('/api/courses', cursoRoutes);
app.use('/api/classes', claseRoutes);

// Endpoint de prueba de la API.
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de AulaNova funcionando',
  });
});

// Comprueba la conexión con MySQL.
app.get('/api/db-test', async (req, res) => {
  try {
    await pool.query('SELECT 1 AS result');

    res.json({
      success: true,
      message: 'Conexión a MySQL correcta',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error de conexión a MySQL',
    });
  }
});

// Inicia el servidor.
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
