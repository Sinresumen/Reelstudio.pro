import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useConfig } from '@/contexts/ConfigContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Users, Video, Settings, DollarSign, Edit, ArrowLeft, Plus, Eye, Trash2 } from 'lucide-react';
import type { Client, InsertClient } from '@shared/schema';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const [, setLocation] = useLocation();
  const [showAddClient, setShowAddClient] = React.useState(false);
  const { config, updateConfig, refetchConfig } = useConfig();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: InsertClient) => {
      const response = await apiRequest('POST', '/api/clients', clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowAddClient(false);
      toast({ title: 'Cliente creado exitosamente' });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: any) => {
      await updateConfig(updates);
    },
    onSuccess: () => {
      toast({ title: 'Configuración actualizada exitosamente' });
      refetchConfig();
    },
  });

  const handleCreateClient = (formData: FormData) => {
    const clientData: InsertClient = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      username: formData.get('username') as string,
      projects: [],
    };

    createClientMutation.mutate(clientData);
  };

  const handleWhatsAppConfigSave = () => {
    const whatsappNumber = (document.getElementById('whatsapp-config') as HTMLInputElement)?.value;
    const businessName = (document.getElementById('business-name-config') as HTMLInputElement)?.value;

    updateConfigMutation.mutate({
      whatsappNumber,
      businessName,
    });
  };

  const handlePricingUpdate = (key: string, field: string, value: number) => {
    if (!config?.pricing) return;

    const updatedPricing = { ...config.pricing };
    const [section, item] = key.split('-');
    
    if (section === 'duration') {
      const durationKey = key.replace('duration-', '').replace('-mxn', '').replace('-usd', '');
      if (!updatedPricing.durations[durationKey]) {
        updatedPricing.durations[durationKey] = { mxn: 0, usd: 0, label: '' };
      }
      updatedPricing.durations[durationKey][field as 'mxn' | 'usd'] = value;
    }

    updateConfigMutation.mutate({ pricing: updatedPricing });
  };

  const generateUsername = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card fire-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clientes</p>
              <p className="text-2xl font-bold fire-text" data-testid="stat-total-clients">{clients.length}</p>
            </div>
            <div className="fire-gradient w-12 h-12 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </Card>
        <Card className="glass-card fire-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Proyectos Activos</p>
              <p className="text-2xl font-bold fire-text" data-testid="stat-active-projects">
                {clients.reduce((acc, client) => acc + (client.projects?.length || 0), 0)}
              </p>
            </div>
            <div className="fire-gradient w-12 h-12 rounded-lg flex items-center justify-center">
              <Video className="text-white" size={24} />
            </div>
          </div>
        </Card>
        <Card className="glass-card fire-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Configuración</p>
              <p className="text-2xl font-bold fire-text" data-testid="stat-config-status">Activa</p>
            </div>
            <div className="fire-gradient w-12 h-12 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Actividad Reciente</h3>
        <div className="space-y-4">
          {clients.slice(0, 3).map((client) => (
            <div key={client.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="fire-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                  <Plus className="text-white" size={12} />
                </div>
                <div>
                  <p className="font-medium">Cliente agregado</p>
                  <p className="text-sm text-muted-foreground">{client.name}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Reciente'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold fire-text">Gestión de Clientes</h2>
        <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
          <DialogTrigger asChild>
            <Button className="fire-gradient text-white font-semibold hover:opacity-90" data-testid="button-add-client">
              <Plus className="mr-2" size={16} />
              Agregar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card fire-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="fire-text">Agregar Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateClient(formData);
              }}
              className="space-y-6"
              data-testid="form-add-client"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-name">Nombre de la Empresa</Label>
                  <Input
                    id="client-name"
                    name="name"
                    placeholder="ABC Corporation"
                    className="bg-input border-border focus:border-primary"
                    required
                    data-testid="input-client-name"
                    onChange={(e) => {
                      const usernameInput = document.getElementById('client-username') as HTMLInputElement;
                      if (usernameInput) {
                        usernameInput.value = generateUsername(e.target.value);
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="client-email">Email de Contacto</Label>
                  <Input
                    id="client-email"
                    name="email"
                    type="email"
                    placeholder="contacto@abccorp.com"
                    className="bg-input border-border focus:border-primary"
                    required
                    data-testid="input-client-email"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-phone">Teléfono</Label>
                  <Input
                    id="client-phone"
                    name="phone"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    className="bg-input border-border focus:border-primary"
                    data-testid="input-client-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="client-username">Username (Generado automáticamente)</Label>
                  <Input
                    id="client-username"
                    name="username"
                    placeholder="abc-corporation"
                    className="bg-muted border-border"
                    readOnly
                    data-testid="input-client-username"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddClient(false)}
                  className="flex-1"
                  data-testid="button-cancel-add-client"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 fire-gradient text-white font-semibold hover:opacity-90"
                  disabled={createClientMutation.isPending}
                  data-testid="button-submit-add-client"
                >
                  {createClientMutation.isPending ? 'Creando...' : 'Crear Cliente'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card fire-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Proyectos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="fire-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {client.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.username}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/20 text-primary">
                      {client.projects?.length || 0} proyectos
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setLocation(`/client/${client.username}`)}
                        data-testid={`button-view-client-${client.id}`}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" data-testid={`button-edit-client-${client.id}`}>
                        <Edit size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" data-testid={`button-delete-client-${client.id}`}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold fire-text">Configuración Global</h2>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">WhatsApp Integration</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="whatsapp-config">Número de WhatsApp</Label>
            <Input
              id="whatsapp-config"
              type="tel"
              defaultValue={config?.whatsappNumber}
              placeholder="+52 55 1234 5678"
              className="bg-input border-border focus:border-primary"
              data-testid="input-whatsapp-number"
            />
            <p className="text-xs text-muted-foreground mt-1">Formato: +52 55 1234 5678</p>
          </div>
          <div>
            <Label htmlFor="business-name-config">Nombre del Negocio</Label>
            <Input
              id="business-name-config"
              type="text"
              defaultValue={config?.businessName}
              placeholder="VideoVenta"
              className="bg-input border-border focus:border-primary"
              data-testid="input-business-name"
            />
            <p className="text-xs text-muted-foreground mt-1">Aparece en mensajes de WhatsApp</p>
          </div>
        </div>
        <Button 
          onClick={handleWhatsAppConfigSave}
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          disabled={updateConfigMutation.isPending}
          data-testid="button-save-whatsapp-config"
        >
          {updateConfigMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </Card>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Configuración del Sitio</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="hero-title">Título Principal</Label>
            <Input
              id="hero-title"
              type="text"
              defaultValue={config?.siteContent?.heroTitle}
              placeholder="Producción de Videos Profesionales"
              className="bg-input border-border focus:border-primary"
              data-testid="input-hero-title"
            />
          </div>
          <div>
            <Label htmlFor="hero-description">Descripción del Hero</Label>
            <Textarea
              id="hero-description"
              rows={3}
              defaultValue={config?.siteContent?.heroDescription}
              placeholder="Creamos contenido audiovisual de alta calidad..."
              className="bg-input border-border focus:border-primary"
              data-testid="textarea-hero-description"
            />
          </div>
          <div>
            <Label htmlFor="contact-email">Email de Contacto</Label>
            <Input
              id="contact-email"
              type="email"
              defaultValue={config?.siteContent?.contactEmail}
              placeholder="info@videoventa.com"
              className="bg-input border-border focus:border-primary"
              data-testid="input-contact-email"
            />
          </div>
        </div>
        <Button 
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          data-testid="button-update-site-content"
        >
          Actualizar Contenido
        </Button>
      </Card>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold fire-text">Gestión de Precios</h2>
        <Button 
          onClick={() => refetchConfig()}
          className="fire-gradient text-white font-semibold hover:opacity-90"
          data-testid="button-sync-calculator"
        >
          <DollarSign className="mr-2" size={16} />
          Sincronizar con Calculadora
        </Button>
      </div>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Precios por Duración</h3>
        <div className="space-y-4">
          {config?.pricing?.durations && Object.entries(config.pricing.durations).map(([key, value]: [string, any]) => (
            <div key={key} className="grid md:grid-cols-3 gap-4 p-4 border border-border rounded-lg">
              <div>
                <Label>{value.label}</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    defaultValue={value.mxn}
                    className="bg-input border-border focus:border-primary"
                    onChange={(e) => handlePricingUpdate(`duration-${key}`, 'mxn', parseInt(e.target.value))}
                    data-testid={`input-duration-${key}-mxn`}
                  />
                  <span className="flex items-center text-muted-foreground">MXN</span>
                </div>
              </div>
              <div>
                <Label>USD Equivalente</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    defaultValue={value.usd}
                    className="bg-input border-border focus:border-primary"
                    onChange={(e) => handlePricingUpdate(`duration-${key}`, 'usd', parseInt(e.target.value))}
                    data-testid={`input-duration-${key}-usd`}
                  />
                  <span className="flex items-center text-muted-foreground">USD</span>
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  className="w-full fire-gradient text-white font-semibold hover:opacity-90"
                  data-testid={`button-update-duration-${key}`}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold fire-text">Gestión de Contenido</h2>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Videos de Muestra</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {config?.sampleVideos?.map((video: any, index: number) => (
            <div key={video.id || index} className="border border-border rounded-lg p-4">
              <div className="aspect-video bg-muted rounded-lg mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="text-white" size={32} />
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Título del video"
                  defaultValue={video.title}
                  className="bg-input border-border focus:border-primary"
                  data-testid={`input-video-title-${index}`}
                />
                <Input
                  type="text"
                  placeholder="Descripción"
                  defaultValue={video.description}
                  className="bg-input border-border focus:border-primary"
                  data-testid={`input-video-description-${index}`}
                />
                <Input
                  type="url"
                  placeholder="URL del video"
                  defaultValue={video.videoUrl}
                  className="bg-input border-border focus:border-primary"
                  data-testid={`input-video-url-${index}`}
                />
                <Button 
                  className="w-full fire-gradient text-white font-semibold hover:opacity-90"
                  data-testid={`button-update-video-${index}`}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold fire-text">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Bienvenido, Admin</span>
              <Button 
                onClick={() => setLocation('/')}
                className="fire-gradient text-white font-semibold hover:opacity-90"
                data-testid="button-back-to-site"
              >
                <ArrowLeft className="mr-2" size={16} />
                Volver al Sitio
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <nav className="glass-card fire-border rounded-xl p-6 space-y-2">
              <Button
                variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeSection === 'dashboard' ? 'fire-gradient text-white' : ''
                }`}
                onClick={() => setActiveSection('dashboard')}
                data-testid="nav-dashboard"
              >
                <BarChart3 className="mr-2" size={16} />
                Dashboard
              </Button>
              <Button
                variant={activeSection === 'clients' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeSection === 'clients' ? 'fire-gradient text-white' : ''
                }`}
                onClick={() => setActiveSection('clients')}
                data-testid="nav-clients"
              >
                <Users className="mr-2" size={16} />
                Gestión de Clientes
              </Button>
              <Button
                variant={activeSection === 'config' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeSection === 'config' ? 'fire-gradient text-white' : ''
                }`}
                onClick={() => setActiveSection('config')}
                data-testid="nav-config"
              >
                <Settings className="mr-2" size={16} />
                Configuración
              </Button>
              <Button
                variant={activeSection === 'pricing' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeSection === 'pricing' ? 'fire-gradient text-white' : ''
                }`}
                onClick={() => setActiveSection('pricing')}
                data-testid="nav-pricing"
              >
                <DollarSign className="mr-2" size={16} />
                Precios
              </Button>
              <Button
                variant={activeSection === 'content' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeSection === 'content' ? 'fire-gradient text-white' : ''
                }`}
                onClick={() => setActiveSection('content')}
                data-testid="nav-content"
              >
                <Edit className="mr-2" size={16} />
                Contenido
              </Button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'clients' && renderClients()}
            {activeSection === 'config' && renderConfig()}
            {activeSection === 'pricing' && renderPricing()}
            {activeSection === 'content' && renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
