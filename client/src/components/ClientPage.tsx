import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useConfig } from '@/contexts/ConfigContext';
import { Video, Download, FileArchive, FileText, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import type { Client } from '@shared/schema';

export default function ClientPage() {
  const [location] = useLocation();
  const { config } = useConfig();
  const username = location.split('/').pop();

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['/api/clients/username', username],
    enabled: !!username,
  });

  const handleWhatsAppSupport = () => {
    if (config?.whatsappNumber) {
      const message = `Hola, soy ${client?.name} y necesito soporte con mi proyecto.`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="fire-text text-xl">Cargando...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card fire-border p-8 text-center">
          <h1 className="text-2xl font-bold fire-text mb-4">Cliente no encontrado</h1>
          <p className="text-muted-foreground">El cliente solicitado no existe o el enlace no es válido.</p>
        </Card>
      </div>
    );
  }

  const downloadFiles = [
    {
      id: '1',
      name: 'Video_Corporativo_Final.mp4',
      size: '245.6 MB',
      type: 'video',
      icon: Video
    },
    {
      id: '2',
      name: 'Videos_Adicionales.zip',
      size: '1.2 GB',
      type: 'archive',
      icon: FileArchive
    },
    {
      id: '3',
      name: 'Licencia_y_Derechos.pdf',
      size: '2.1 MB',
      type: 'document',
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Client Header */}
      <header className="glass-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="fire-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                <Video className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold fire-text">VideoVenta</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Cliente:</div>
              <div className="font-semibold" data-testid="text-client-name">{client.name}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Client Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="fire-text">Bienvenido,</span>
              <span className="text-foreground ml-2" data-testid="text-welcome-client">{client.name}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Aquí puedes descargar todos los archivos de tu proyecto y documentación asociada
            </p>
          </div>

          {/* Project Information */}
          <Card className="glass-card fire-border p-8 mb-8">
            <h2 className="text-2xl font-bold fire-text mb-6">Información del Proyecto</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo de Proyecto</label>
                  <p className="font-semibold" data-testid="text-project-type">Video Corporativo</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Duración</label>
                  <p className="font-semibold" data-testid="text-project-duration">10-15 minutos</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Cantidad de Videos</label>
                  <p className="font-semibold" data-testid="text-project-quantity">30 videos</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Estado</label>
                  <Badge className="bg-green-500/20 text-green-400 ml-2" data-testid="badge-project-status">
                    Completado
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fecha de Entrega</label>
                  <p className="font-semibold" data-testid="text-delivery-date">15 de Diciembre, 2024</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Formato</label>
                  <p className="font-semibold" data-testid="text-project-format">MP4 - 1080p HD</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Download Section */}
          <Card className="glass-card fire-border p-8 mb-8">
            <h2 className="text-2xl font-bold fire-text mb-6">
              <Download className="inline mr-2" size={24} />
              Archivos de Descarga
            </h2>
            <div className="space-y-4">
              {downloadFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  data-testid={`download-file-${file.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="fire-gradient w-12 h-12 rounded-lg flex items-center justify-center">
                      <file.icon className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold" data-testid={`text-file-name-${file.id}`}>{file.name}</h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-file-size-${file.id}`}>{file.size}</p>
                    </div>
                  </div>
                  <Button 
                    className="fire-gradient text-white font-semibold hover:opacity-90"
                    data-testid={`button-download-${file.id}`}
                  >
                    <Download className="mr-2" size={16} />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="glass-card fire-border p-8">
            <h2 className="text-2xl font-bold fire-text mb-6">
              <CheckCircle className="inline mr-2" size={24} />
              Información Adicional
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Instrucciones de Uso</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start" data-testid="instruction-optimized">
                    <CheckCircle className="text-primary mr-2 mt-1 flex-shrink-0" size={16} />
                    Los videos están optimizados para redes sociales y web
                  </li>
                  <li className="flex items-start" data-testid="instruction-format">
                    <CheckCircle className="text-primary mr-2 mt-1 flex-shrink-0" size={16} />
                    Formato MP4 compatible con todas las plataformas
                  </li>
                  <li className="flex items-start" data-testid="instruction-resolution">
                    <CheckCircle className="text-primary mr-2 mt-1 flex-shrink-0" size={16} />
                    Resolución 1080p para máxima calidad
                  </li>
                  <li className="flex items-start" data-testid="instruction-audio">
                    <CheckCircle className="text-primary mr-2 mt-1 flex-shrink-0" size={16} />
                    Audio en calidad profesional 48kHz
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Soporte y Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3" data-testid="support-whatsapp">
                    <div className="fire-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                      <Phone className="text-white" size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-semibold">{config?.whatsappNumber || '+52 55 1234 5678'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3" data-testid="support-email">
                    <div className="fire-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                      <Mail className="text-white" size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">soporte@videoventa.com</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleWhatsAppSupport}
                    className="w-full fire-gradient text-white font-semibold hover:opacity-90 mt-4"
                    data-testid="button-contact-support"
                  >
                    <Phone className="mr-2" size={16} />
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
