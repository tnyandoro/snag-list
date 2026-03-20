import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { pool } from '../config/database';
export interface AuthRequest extends Request { user?: { id: string; role: string }; }
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new AppError('Access token required', 401);
    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userResult = await pool.query('SELECT id, is_active FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) throw new AppError('User not found or inactive', 401);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') return next(new AppError('Invalid token', 401));
    if (error.name === 'TokenExpiredError') return next(new AppError('Token expired', 401));
    next(error);
  }
};
export const authorize = (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (!allowedRoles.includes(req.user.role)) return next(new AppError('Insufficient permissions', 403));
  next();
};
export const isAdmin = authorize('admin');
export const isOwner = authorize('owner', 'admin');
export const isInspector = authorize('inspector', 'admin');
export const isVendor = authorize('vendor', 'admin');
