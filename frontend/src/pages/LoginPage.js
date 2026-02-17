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
import { Loader2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      {/* Top institutional bar */}
      <div className="w-full py-3 px-6" style={{ backgroundColor: '#691C32' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img 
            src="/logo-banner.png" 
            alt="Gobierno de México" 
            className="h-10 md:h-14 object-contain brightness-0 invert"
          />
        </div>
      </div>

      {/* Main content */}
      <div 
        className="flex-1 flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #691C32 0%, #4A1424 40%, #2D0D16 100%)',
        }}
      >
        <div className="w-full max-w-md">
          {/* Logo escudo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/logo-escudo.png" 
              alt="Escudo institucional" 
              className="h-24 md:h-28 object-contain drop-shadow-lg"
            />
          </div>

          <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-xl" data-testid="login-card">
            <CardHeader className="space-y-1 text-center pb-2">
              <CardTitle className="font-heading text-2xl font-bold tracking-tight" style={{ color: '#691C32' }}>
                Sistema de Contrataciones
              </CardTitle>
              <CardDescription className="font-body text-gray-500 text-sm">
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
                  <Label htmlFor="email" className="font-body text-sm font-medium text-gray-700">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...register('email')}
                    className="h-11 border-gray-300 focus:border-[#691C32] focus:ring-[#691C32]"
                    data-testid="login-email-input"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500" data-testid="email-error">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-body text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="h-11 border-gray-300 focus:border-[#691C32] focus:ring-[#691C32]"
                    data-testid="login-password-input"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500" data-testid="password-error">{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#691C32' }}
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
      </div>

      {/* Bottom institutional bar */}
      <div className="w-full py-2 px-6 text-center" style={{ backgroundColor: '#B38E5D' }}>
        <p className="text-white text-xs font-medium tracking-wide">
          Gobierno de México
        </p>
      </div>
    </div>
  );
}
