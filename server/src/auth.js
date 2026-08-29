import jwt from 'jsonwebtoken';

export function createToken(user) { return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' }); }
export function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret'); next(); }
  catch { return res.status(401).json({ message: 'Session expired or invalid.' }); }
}
export const authorize = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Access denied.' });
