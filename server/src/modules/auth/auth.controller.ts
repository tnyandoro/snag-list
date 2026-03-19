// server/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AppError } from '../../middleware/errorHandler';
import { catchAsync } from '../../utils/catchAsync';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /api/auth/register
  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, full_name, role, phone } = req.body;

    const user = await this.authService.register({
      email,
      password,
      full_name,
      role,
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        token: user.token,
        expires_at: user.expires_at,
      },
    });
  });

  // POST /api/auth/login
  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await this.authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          full_name: result.user.full_name,
          role: result.user.role,
          avatar_url: result.user.avatar_url,
        },
        token: result.token,
        expires_at: result.expires_at,
      },
    });
  });

  // POST /api/auth/logout
  logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // In production: blacklist token in Redis
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });

  // GET /api/auth/me
  me = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await this.authService.getCurrentUser(req.user?.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
          phone: user.phone,
          is_active: user.is_active,
        },
      },
    });
  });

  // POST /api/auth/refresh
  refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refresh_token } = req.body;

    const result = await this.authService.refreshToken(refresh_token);

    res.status(200).json({
      success: true,
      data: {
        token: result.token,
        expires_at: result.expires_at,
      },
    });
  });

  // POST /api/auth/forgot-password
  forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await this.authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  });

  // POST /api/auth/reset-password
  resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    await this.authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  });
}

export const authController = new AuthController();