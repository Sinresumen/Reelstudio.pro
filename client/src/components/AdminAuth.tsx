import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';

interface AdminAuthProps {
  onClose: () => void;
}

export default function AdminAuth({ onClose }: AdminAuthProps) {
  const [password, setPassword] = React.useState('');
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('POST', '/api/admin/login', { password });
      return response.json();
    },
    onSuccess: () => {
      onClose();
      setLocation('/admin');
    },
    onError: () => {
      alert('Contraseña incorrecta');
      setPassword('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-card fire-border w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold fire-text">Acceso Administrativo</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              data-testid="button-close-auth"
            >
              <X size={20} />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-admin-login">
            <div>
              <Label htmlFor="admin-password">Contraseña de Administrador</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="bg-input border-border focus:border-primary"
                required
                data-testid="input-admin-password"
              />
            </div>
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel-auth"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 fire-gradient text-white font-semibold hover:opacity-90"
                disabled={loginMutation.isPending}
                data-testid="button-submit-auth"
              >
                {loginMutation.isPending ? 'Verificando...' : 'Ingresar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
