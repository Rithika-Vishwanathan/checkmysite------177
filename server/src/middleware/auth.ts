import type { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../firebase.js';
import { User } from '../models/User.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!firebaseAdmin.apps.length) {
    return res.status(500).json({ success: false, message: 'Firebase admin is not configured.' });
  }

  firebaseAdmin
    .auth()
    .verifyIdToken(token)
    .then(async (decoded) => {
      req.userId = decoded.uid;

      try {
        const email = decoded.email || `${decoded.uid}@placeholder.local`;
        const name = decoded.name || decoded.email?.split('@')[0] || 'User';
        const provider = decoded.firebase?.sign_in_provider || 'email';

        await User.findOneAndUpdate(
          { firebaseUid: decoded.uid },
          {
            firebaseUid: decoded.uid,
            email,
            name,
            displayName: decoded.name || name,
            photoURL: decoded.picture || undefined,
            provider,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      } catch (error) {
        console.warn('User sync failed after valid token verification:', error instanceof Error ? error.message : error);
      }

      next();
    })
    .catch(() => {
      res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    });
}
