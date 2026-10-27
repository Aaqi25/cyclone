import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { inMemoryStore, getDb } from './db.ts';
import { User, UserRole } from '../src/types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'cycloneshield_jwt_dev_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token provided in demo mode, provide standard Viewer context or reject
    res.status(401).json({ error: 'Access token missing or invalid. Please sign in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      organization: decoded.organization,
      createdAt: decoded.createdAt || new Date().toISOString(),
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authorization token.' });
  }
}

// Role-based permission enforcement middleware
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (req.user.role === 'Administrator' || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      error: `Access Denied: Role '${req.user.role}' lacks permission for this disaster command action. Required role: ${allowedRoles.join(', ')} or Administrator.`,
    });
  };
}

export async function recordAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  performedBy: string,
  userRole: UserRole,
  details: string
) {
  const logItem = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    entityType,
    entityId,
    performedBy,
    userRole,
    timestamp: new Date().toISOString(),
    details,
  };

  inMemoryStore.auditLogs.unshift(logItem);

  const db = getDb();
  if (db) {
    try {
      await db.collection('audit_logs').insertOne(logItem);
    } catch (e) {
      console.warn('Failed to persist audit log in MongoDB:', e);
    }
  }
}
