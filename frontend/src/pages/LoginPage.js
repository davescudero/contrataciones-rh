import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        setError(result.error.message || 'Error al iniciar sesión');
        setIsLoading(false);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1760236365577-ae02e8524a74?crop=entropy&cs=srgb&fm=jpg&q=85')`
      }}
    >
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-slate-200" data-testid="login-card">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <CardTitle className="font-heading text-2xl font-bold tracking-tight text-slate-900">
            Sistema de Reclutamiento
          </CardTitle>
          <CardDescription className="font-body text-slate-500">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" data-testid="login-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-sm font-medium text-slate-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email')}
                className="h-11"
                data-testid="login-email-input"
              />
              {errors.email && (
                <p className="text-sm text-red-500" data-testid="email-error">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body text-sm font-medium text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="h-11"
                data-testid="login-password-input"
              />
              {errors.password && (
                <p className="text-sm text-red-500" data-testid="password-error">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
              disabled={isLoading}
              data-testid="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
