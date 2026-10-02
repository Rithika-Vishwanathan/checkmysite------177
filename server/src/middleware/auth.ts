import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  let decoded;
  try {
    // Try to verify as standard JWT
    decoded = verifyToken(token);
    // If not a standard JWT, maybe it's the frontend's dummy base64 token
    if (!decoded) {
      decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    }
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, message: 'Invalid token structure.' });
  }

  req.userId = decoded.userId;
  next();
}
