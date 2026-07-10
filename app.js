const express = require('express');

const app = express();
const PORT = 8888;

// Endpoint de prueba de la API.
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de AulaNova funcionando',
  });
});

// Inicia el servidor.
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
