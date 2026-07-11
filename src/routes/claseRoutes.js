const express = require('express');
const claseController = require('../controllers/claseController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Cada rol recibe solamente las clases que le corresponden.
router.get('/', requireAuth, claseController.index);

module.exports = router;
