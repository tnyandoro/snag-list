// client-web/src/pages/auth/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      toast({
        title: '❌ Invalid link',
        description: 'Password reset token is missing',
        variant: 'destructive',
      });
      navigate('/login', { replace: true });
      return;
    }

    // Optional: Verify token with backend
    // For now, we assume the token is valid if present in URL
    setValidated(true);
  }, [token, navigate]);

  // Password strength validation
  const getPasswordStrength = (pwd: string) => {
    const checks = [
      pwd.length >= 8,
      /[A-Z]/.test(pwd),
      /[a-z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
    ];
    const score = checks.filter(Boolean).length;
    
    if (score <= 2) return { level: 'weak', color: 'red', text: 'Weak' };
    if (score <= 4) return { level: 'medium', color: 'yellow', text: 'Medium' };
    return { level: 'strong', color: 'green', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password.length < 8) {
      toast({
        title: '❌ Password too short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: '❌ Passwords do not match',
        description: 'Please confirm your password correctly',
        variant: 'destructive',
      });
      return;
    }

    if (!token) {
      toast({
        title: '❌ Invalid token',
        description: 'Reset token is missing',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        toast({
          title: '✅ Password updated',
          description: 'You can now sign in with your new password',
        });
        navigate('/login', { replace: true });
      } else {
        toast({
          title: '❌ Reset failed',
          description: result.error || 'Could not reset password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: '🔌 Connection error',
        description: 'Could not connect to the server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading/validating state
  if (!validated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Success state (optional - could redirect instead)
  // Form state - reset password
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Password
          </CardTitle>
          <CardDescription className="text-base">
            Enter a new password for your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.color === 'red' ? 'bg-red-500 w-1/3' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-2/3' :
                        'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium text-${passwordStrength.color}-600 dark:text-${passwordStrength.color}-400`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
              
              {/* Password requirements */}
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                  {password.length >= 8 ? '✓' : '○'} At least 8 characters
                </li>
                <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                </li>
                <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                  {/[0-9]/.test(password) ? '✓' : '○'} One number
                </li>
              </ul>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Match indicator */}
              {confirmPassword && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  {password === confirmPassword ? (
                    <><CheckCircle2 className="h-3 w-3" /> Passwords match</>
                  ) : (
                    <><AlertCircle className="h-3 w-3" /> Passwords do not match</>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading || password !== confirmPassword || password.length < 8}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating password...
                </span>
              ) : (
                'Reset Password'
              )}
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;