const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Solamente los administradores pueden listar usuarios.
router.get('/', requireAuth, requireRole('admin'), usuarioController.index);
router.post('/', requireAuth, requireRole('admin'), usuarioController.store);

module.exports = router;
