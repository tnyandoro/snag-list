import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AppError } from '../../middleware/errorHandler';
import { catchAsync } from '../../utils/catchAsync';

export class AuthController {
  private authService: AuthService;
  constructor() { this.authService = new AuthService(); }

  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, full_name, role, phone } = req.body;
    const result = await this.authService.register({ email, password, full_name, role, phone });
    res.status(201).json({ success: true, message: 'User registered', data: { user: result.user, token: result.token, expires_at: result.expires_at } });
  });

  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    res.status(200).json({ success: true, message: 'Login successful', data: { user: result.user, token: result.token, expires_at: result.expires_at } });
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Logout successful' });
  });

  me = catchAsync(async (req: any, res: Response) => {
    const user = await this.authService.getCurrentUser(req.user?.id);
    res.status(200).json({ success: true, data: { user } });
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;
    const result = await this.authService.refreshToken(refresh_token);
    res.status(200).json({ success: true, data: result });
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.authService.forgotPassword(email);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await this.authService.resetPassword(token, password);
    res.status(200).json({ success: true, message: 'Password reset successful' });
  });
}
export const authController = new AuthController();
