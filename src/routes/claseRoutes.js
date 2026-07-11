const express = require('express');
const claseController = require('../controllers/claseController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Cada rol recibe solamente las clases que le corresponden.
router.get('/', requireAuth, claseController.index);
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'profesor'),
  claseController.store,
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'profesor'),
  claseController.update,
);

module.exports = router;
