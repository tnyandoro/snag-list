import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Fix: Parse PORT to number with default fallback
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'property-platform-api',
    version: '1.0.0',
  });
});

// Minimal auth endpoint for testing
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (email === 'admin@propertyplatform.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 'test-user-id',
          email: 'admin@propertyplatform.com',
          full_name: 'Platform Admin',
          role: 'admin',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Catch-all for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server - listen on 0.0.0.0 for Docker networking
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
});

export default app;
