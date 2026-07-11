const express = require('express');
const cursoController = require('../controllers/cursoController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Cada rol recibe solamente los cursos que le corresponden.
router.get('/', requireAuth, cursoController.index);

module.exports = router;
