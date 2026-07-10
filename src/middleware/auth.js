const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido',
    });
  }

  const token = authorization.slice(7);

  try {
    // Guarda el contenido verificado para las siguientes funciones.
    req.user = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o vencido',
    });
  }
}

module.exports = { requireAuth };
