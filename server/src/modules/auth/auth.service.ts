import { pool } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler';

export interface RegisterInput { email: string; password: string; full_name: string; role: string; phone?: string; }
export interface AuthResult { user: any; token: string; expires_at: string; }

export class AuthService {
  private JWT_SECRET: string;
  private JWT_EXPIRES_IN: string;
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  async register(input: RegisterInput) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [input.email]);
      if (existingUser.rows.length > 0) throw new AppError('Email already registered', 400);
      const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [input.role.toLowerCase()]);
      if (roleResult.rows.length === 0) throw new AppError('Invalid role', 400);
      const role_id = roleResult.rows[0].id;
      const password_hash = await bcrypt.hash(input.password, 12);
      const userId = uuidv4();
      await client.query(`INSERT INTO users (id, email, password_hash, full_name, role_id, phone, is_active, email_verified_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`, [userId, input.email, password_hash, input.full_name, role_id, input.phone, true]);
      const token = this.generateToken(userId, input.role.toLowerCase());
      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await client.query('COMMIT');
      return { user: { id: userId, email: input.email, full_name: input.full_name, role: input.role.toLowerCase() }, token, expires_at };
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const result = await pool.query(`SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = $1 AND u.is_active = true`, [email]);
    if (result.rows.length === 0) throw new AppError('Invalid email or password', 401);
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError('Invalid email or password', 401);
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    const token = this.generateToken(user.id, user.role);
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return { user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, avatar_url: user.avatar_url, phone: user.phone }, token, expires_at };
  }

  async getCurrentUser(userId: string) {
    const result = await pool.query(`SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.is_active, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1`, [userId]);
    if (result.rows.length === 0) throw new AppError('User not found', 404);
    return result.rows[0];
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; expires_at: string }> {
    try {
      const decoded: any = jwt.verify(refreshToken, this.JWT_SECRET);
      const newToken = this.generateToken(decoded.userId, decoded.role);
      return { token: newToken, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };
    } catch (error) { throw new AppError('Invalid refresh token', 401); }
  }

  async forgotPassword(email: string) { /* TODO: Implement email sending */ }
  async resetPassword(token: string, password: string) { const password_hash = await bcrypt.hash(password, 12); await pool.query('UPDATE users SET password_hash = $1 WHERE email_verified_at IS NOT NULL', [password_hash]); }

  private generateToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  }
}
EOF# === Fix auth.service.ts JWT signing ===
cat > server/src/modules/auth/auth.service.ts << 'EOF'
import { pool } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler';

export interface RegisterInput { email: string; password: string; full_name: string; role: string; phone?: string; }
export interface AuthResult { user: any; token: string; expires_at: string; }

export class AuthService {
  private JWT_SECRET: string;
  private JWT_EXPIRES_IN: string;
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  async register(input: RegisterInput) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [input.email]);
      if (existingUser.rows.length > 0) throw new AppError('Email already registered', 400);
      const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [input.role.toLowerCase()]);
      if (roleResult.rows.length === 0) throw new AppError('Invalid role', 400);
      const role_id = roleResult.rows[0].id;
      const password_hash = await bcrypt.hash(input.password, 12);
      const userId = uuidv4();
      await client.query(`INSERT INTO users (id, email, password_hash, full_name, role_id, phone, is_active, email_verified_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`, [userId, input.email, password_hash, input.full_name, role_id, input.phone, true]);
      const token = this.generateToken(userId, input.role.toLowerCase());
      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await client.query('COMMIT');
      return { user: { id: userId, email: input.email, full_name: input.full_name, role: input.role.toLowerCase() }, token, expires_at };
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const result = await pool.query(`SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.avatar_url, u.is_active, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = $1 AND u.is_active = true`, [email]);
    if (result.rows.length === 0) throw new AppError('Invalid email or password', 401);
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError('Invalid email or password', 401);
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    const token = this.generateToken(user.id, user.role);
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return { user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, avatar_url: user.avatar_url, phone: user.phone }, token, expires_at };
  }

  async getCurrentUser(userId: string) {
    const result = await pool.query(`SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.is_active, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1`, [userId]);
    if (result.rows.length === 0) throw new AppError('User not found', 404);
    return result.rows[0];
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; expires_at: string }> {
    try {
      const decoded: any = jwt.verify(refreshToken, this.JWT_SECRET);
      const newToken = this.generateToken(decoded.userId, decoded.role);
      return { token: newToken, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };
    } catch (error) { throw new AppError('Invalid refresh token', 401); }
  }

  async forgotPassword(email: string) { /* TODO: Implement email sending */ }
  async resetPassword(token: string, password: string) { const password_hash = await bcrypt.hash(password, 12); await pool.query('UPDATE users SET password_hash = $1 WHERE email_verified_at IS NOT NULL', [password_hash]); }

  private generateToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  }
}
