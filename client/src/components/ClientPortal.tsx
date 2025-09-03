import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileVideo, FileText, Calendar, CheckCircle, Clock, Package, Shield } from 'lucide-react';

export default function ClientPortal({ username }: { username: string }) {
  const [, setLocation] = useLocation();

  const { data: client, isLoading } = useQuery({
    queryKey: [`/api/clients/username/${username}`],
    queryFn: async () => {
      const response = await fetch(`/api/clients/username/${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cliente no encontrado');
        }
        throw new Error('Error al cargar los datos');
      }
      return response.json();
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: [`/api/projects/client/${client?.id}`],
    enabled: !!client?.id,
    queryFn: async () => {
      const response = await fetch(`/api/projects/client/${client.id}`);
      if (!response.ok) throw new Error('Error al cargar proyectos');
      return response.json();
    },
  });

  const generateCertificate = () => {
    if (!client) return;
    
    const certificateWindow = window.open('', '_blank');
    if (!certificateWindow) return;

    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    const certificateHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Certificado de Propiedad Intelectual</title>
  <style>
    @page { size: letter; margin: 1in; }
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #ff6b00; padding-bottom: 20px; }
    .logo { font-size: 32px; font-weight: bold; color: #ff6b00; margin-bottom: 10px; }
    h1 { color: #ff6b00; text-align: center; margin-bottom: 30px; }
    .info-section { margin-bottom: 30px; }
    .info-row { margin-bottom: 10px; display: flex; }
    .info-label { font-weight: bold; min-width: 150px; }
    .file-list { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .file-item { padding: 10px 0; border-bottom: 1px solid #ddd; }
    .file-item:last-child { border-bottom: none; }
    h2 { color: #333; font-size: 18px; margin-top: 30px; border-bottom: 2px solid #ff6b00; padding-bottom: 10px; }
    .terms { margin-top: 30px; background: #fafafa; padding: 20px; border-left: 4px solid #ff6b00; }
    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">VideoVenta</div>
    <h1>CERTIFICADO DE PROPIEDAD INTELECTUAL</h1>
  </div>

  <div class="info-section">
    <div class="info-row">
      <span class="info-label">Cliente:</span>
      <span>${client.name || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email:</span>
      <span>${client.email || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Fecha de emisión:</span>
      <span>${today.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
  </div>

  <h2>ARCHIVOS INCLUIDOS EN ESTE CERTIFICADO:</h2>
  <div class="file-list">
    ${projects.map((project: any, index: number) => `
      <div class="file-item">
        <strong>${index + 1}. ${project.name}</strong> (${project.type?.toUpperCase() || 'VIDEO'})
        ${project.downloadLinks?.map((link: any) => `<br>• ${link.title}`).join('') || ''}
      </div>
    `).join('')}
  </div>

  <div class="terms">
    <h2>TÉRMINOS Y CONDICIONES:</h2>
    <p>Por medio del presente documento, se certifica que <strong>${client.name}</strong> es el propietario intelectual legítimo de los archivos de video y contenido digital listados anteriormente.</p>

    <h3 style="color: #ff6b00; font-size: 16px;">DERECHOS DE PROPIEDAD:</h3>
    <ul>
      <li>El cliente tiene derechos exclusivos sobre el contenido entregado</li>
      <li>Puede usar, modificar y distribuir el contenido según sus necesidades</li>
      <li>Los archivos son de su propiedad completa tras la entrega</li>
    </ul>

    <h3 style="color: #ff6b00; font-size: 16px;">ALMACENAMIENTO Y ACCESO:</h3>
    <ul>
      <li>Los archivos estarán disponibles en: <strong>https://videoventa.com/client/${username}</strong></li>
      <li>Duración de almacenamiento: <strong>12 meses</strong></li>
      <li>Fecha de vencimiento: <strong>${expiryDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></li>
    </ul>

    <h3 style="color: #ff6b00; font-size: 16px;">RESPONSABILIDADES:</h3>
    <ul>
      <li>VideoVenta garantiza la originalidad del contenido entregado</li>
      <li>El cliente es responsable del uso apropiado del contenido</li>
      <li>Se recomienda descargar y respaldar todos los archivos antes del vencimiento</li>
    </ul>

    <p style="margin-top: 20px;"><strong>Este certificado es válido y tiene efectos legales.</strong></p>
  </div>

  <div class="footer">
    <p><strong>VideoVenta</strong><br>
    Portal de Entregas Digitales<br>
    Generado automáticamente el ${today.toLocaleString('es-MX')}</p>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="background: #ff6b00; color: white; border: none; padding: 10px 30px; border-radius: 5px; font-size: 16px; cursor: pointer;">
      Imprimir o Guardar como PDF
    </button>
  </div>
</body>
</html>
    `;
    
    certificateWindow.document.write(certificateHTML);
    certificateWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Cliente no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              El enlace que estás intentando acceder no existe o ha expirado.
            </p>
            <Button onClick={() => setLocation('/')} className="fire-gradient">
              Ir al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold fire-text">Portal de Cliente</h1>
              <Badge variant="outline">{client.username}</Badge>
            </div>
            <Button onClick={() => setLocation('/')} variant="outline">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Client Info */}
      <section className="container mx-auto px-4 py-8">
        <Card className="glass-card fire-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-primary" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-semibold">{client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{client.email || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-semibold">{client.phone || 'No especificado'}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button onClick={generateCertificate} className="fire-gradient">
                <FileText className="mr-2" size={16} />
                Descargar Certificado de Propiedad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold fire-text">Tus Proyectos</h2>
          
          {projects.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">
                  No tienes proyectos disponibles en este momento
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {projects.map((project: any) => (
                <Card key={project.id} className="glass-card fire-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileVideo className="text-primary" />
                        {project.name}
                      </CardTitle>
                      <Badge className={
                        project.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                        project.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-gray-500/20 text-gray-500'
                      }>
                        {project.status === 'completed' ? 'Completado' :
                         project.status === 'in_progress' ? 'En Progreso' :
                         'Pendiente'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo</p>
                          <p className="font-semibold">{project.type || 'Video'}</p>
                        </div>
                      </div>
                      {project.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Duración</p>
                            <p className="font-semibold">{project.duration}</p>
                          </div>
                        </div>
                      )}
                      {project.deliveryDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha de Entrega</p>
                            <p className="font-semibold">
                              {new Date(project.deliveryDate).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {project.status === 'completed' && project.downloadLinks && project.downloadLinks.length > 0 && (
                      <>
                        <div className="border-t border-border/50 pt-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Download className="w-4 h-4 text-primary" />
                            Archivos Disponibles para Descarga
                          </h4>
                          <div className="grid gap-3">
                            {project.downloadLinks.map((link: any, index: number) => (
                              <div key={link.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileVideo className="w-5 h-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{link.title}</p>
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => window.open(link.url, '_blank')}
                                  className="fire-gradient"
                                  size="sm"
                                >
                                  <Download className="mr-1" size={14} />
                                  Descargar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {project.status !== 'completed' && (
                      <div className="border-t border-border/50 pt-4">
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Este proyecto está {project.status === 'in_progress' ? 'en progreso' : 'pendiente'}. 
                          Los archivos estarán disponibles una vez completado.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 VideoVenta. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">
            Los archivos estarán disponibles por 12 meses. Recomendamos descargarlos y hacer respaldo.
          </p>
        </div>
      </footer>
    </div>
  );
}