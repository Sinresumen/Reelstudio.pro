import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Plus, Edit, Trash2, Users, Video, DollarSign, Settings, LogOut, Package } from 'lucide-react';
import { useLocation } from 'wouter';
import { useConfig } from '@/contexts/ConfigContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ClientWithProjects } from '@shared/schema';
import AdminLogin from './AdminLogin';
import ProjectManager from './ProjectManager';
import { useToast } from '@/hooks/use-toast';

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { config, refetchConfig } = useConfig();
  const [showAddClient, setShowAddClient] = React.useState(false);
  const [showEditClient, setShowEditClient] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<any>(null);
  const [selectedClientForProjects, setSelectedClientForProjects] = React.useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-auth', {
        credentials: 'include',
      });
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      toast({
        title: "Sesión Cerrada",
        description: "Ha cerrado sesión exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };
  
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json() as Promise<ClientWithProjects[]>;
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/config', data);
      return response.json();
    },
    onSuccess: () => {
      refetchConfig();
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (client: any) => {
      const response = await apiRequest('POST', '/api/clients', client);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowAddClient(false);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const response = await apiRequest('PUT', `/api/clients/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowEditClient(false);
      setEditingClient(null);
    },
  });

  const handleCreateClient = (formData: FormData) => {
    const client = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      username: formData.get('username'),
    };
    createClientMutation.mutate(client);
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setShowEditClient(true);
  };

  const handleUpdateClient = (formData: FormData) => {
    updateClientMutation.mutate({
      id: editingClient.id,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
    });
  };

  const handleSiteContentUpdate = () => {
    const heroTitle = (document.getElementById('hero-title') as HTMLInputElement)?.value;
    const heroDescription = (document.getElementById('hero-description') as HTMLTextAreaElement)?.value;
    const calculatorTitle = (document.getElementById('calculator-title') as HTMLInputElement)?.value;
    const calculatorDescription = (document.getElementById('calculator-description') as HTMLTextAreaElement)?.value;
    const contactEmail = (document.getElementById('contact-email') as HTMLInputElement)?.value;
    const companyDescription = (document.getElementById('company-description') as HTMLTextAreaElement)?.value;
    const logoUrl = (document.getElementById('logo-url') as HTMLInputElement)?.value;
    const backgroundImageUrl = (document.getElementById('background-image-url') as HTMLInputElement)?.value;
    const customCSS = (document.getElementById('custom-css') as HTMLTextAreaElement)?.value;
    const trustProjects = (document.getElementById('trust-projects') as HTMLInputElement)?.value;
    const trustRating = (document.getElementById('trust-rating') as HTMLInputElement)?.value;
    const trustDelivery = (document.getElementById('trust-delivery') as HTMLInputElement)?.value;

    updateConfigMutation.mutate({
      ...config,
      siteContent: {
        ...config?.siteContent,
        heroTitle,
        heroDescription,
        calculatorTitle,
        calculatorDescription,
        contactEmail,
        companyDescription,
        logoUrl,
        backgroundImageUrl,
        customCSS,
        trustIndicators: {
          projects: trustProjects,
          rating: trustRating,
          delivery: trustDelivery,
        },
      },
    });
  };

  const handleWhatsAppConfigSave = () => {
    const whatsappNumber = (document.getElementById('whatsapp-config') as HTMLInputElement)?.value;
    const businessName = (document.getElementById('business-name-config') as HTMLInputElement)?.value;
    const whatsappApiKey = (document.getElementById('whatsapp-api-key') as HTMLInputElement)?.value;
    const whatsappPhoneId = (document.getElementById('whatsapp-phone-id') as HTMLInputElement)?.value;

    updateConfigMutation.mutate({
      ...config,
      whatsappNumber,
      businessName,
      messagingApis: {
        ...config?.messagingApis,
        whatsappApiKey,
        whatsappPhoneId,
      },
    });
  };

  const handlePricingUpdate = (key: string, field: string, value: number) => {
    if (!config?.pricing) return;

    const updatedPricing = { ...config.pricing } as any;
    const [section, item] = key.split('-');
    
    if (section === 'narratedDuration' && item) {
      if (!updatedPricing.narratedVideos) updatedPricing.narratedVideos = {};
      if (!updatedPricing.narratedVideos.durations) updatedPricing.narratedVideos.durations = {};
      if (!updatedPricing.narratedVideos.durations[item]) {
        updatedPricing.narratedVideos.durations[item] = { mxn: 0, usd: 0, label: '' };
      }
      updatedPricing.narratedVideos.durations[item][field as 'mxn' | 'usd'] = value;
    } else if (section === 'singingPackage' && item) {
      if (!updatedPricing.singingPackages) updatedPricing.singingPackages = {};
      if (!updatedPricing.singingPackages[item]) {
        updatedPricing.singingPackages[item] = { mxn: 0, usd: 0, videos: 0, label: '' };
      }
      updatedPricing.singingPackages[item][field as 'mxn' | 'usd' | 'videos'] = value;
    } else if (section === 'speed' && item) {
      if (!updatedPricing.narratedVideos) updatedPricing.narratedVideos = {};
      if (!updatedPricing.narratedVideos.speeds) updatedPricing.narratedVideos.speeds = {};
      if (!updatedPricing.narratedVideos.speeds[item]) {
        updatedPricing.narratedVideos.speeds[item] = { multiplier: 1, label: '' };
      }
      updatedPricing.narratedVideos.speeds[item]['multiplier'] = value;
    } else if (section === 'quantity' && item) {
      if (!updatedPricing.narratedVideos) updatedPricing.narratedVideos = {};
      if (!updatedPricing.narratedVideos.quantities) updatedPricing.narratedVideos.quantities = {};
      if (!updatedPricing.narratedVideos.quantities[item]) {
        updatedPricing.narratedVideos.quantities[item] = { multiplier: 1, label: '' };
      }
      updatedPricing.narratedVideos.quantities[item]['multiplier'] = value;
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
                {clients.reduce((acc, client) => acc + (client.projects?.filter(p => p.status === 'in-progress').length || 0), 0)}
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
              <p className="text-sm text-muted-foreground">Videos Completados</p>
              <p className="text-2xl font-bold fire-text" data-testid="stat-completed-videos">
                {clients.reduce((acc, client) => acc + (client.projects?.filter(p => p.status === 'delivered').length || 0), 0)}
              </p>
            </div>
            <div className="fire-gradient w-12 h-12 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Configuración de WhatsApp Business API</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="whatsapp-config">Número de WhatsApp</Label>
            <Input
              id="whatsapp-config"
              type="tel"
              placeholder="+52 55 1234 5678"
              defaultValue={config?.whatsappNumber}
              className="bg-input border-border focus:border-primary"
              data-testid="input-whatsapp-number"
            />
          </div>
          <div>
            <Label htmlFor="business-name-config">Nombre del Negocio</Label>
            <Input
              id="business-name-config"
              type="text"
              placeholder="VideoVenta System"
              defaultValue={config?.businessName}
              className="bg-input border-border focus:border-primary"
              data-testid="input-business-name"
            />
          </div>
          <div>
            <Label htmlFor="whatsapp-api-key">WhatsApp API Token</Label>
            <Input
              id="whatsapp-api-key"
              type="password"
              placeholder="EAAxxxxxxxxxxxxxx..."
              defaultValue={config?.messagingApis?.whatsappApiKey}
              className="bg-input border-border focus:border-primary"
              data-testid="input-whatsapp-api-key"
            />
          </div>
          <div>
            <Label htmlFor="whatsapp-phone-id">Phone Number ID</Label>
            <Input
              id="whatsapp-phone-id"
              type="text"
              placeholder="1234567890123456"
              defaultValue={config?.messagingApis?.whatsappPhoneId}
              className="bg-input border-border focus:border-primary"
              data-testid="input-whatsapp-phone-id"
            />
          </div>
        </div>
        <Button 
          onClick={handleWhatsAppConfigSave}
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          disabled={updateConfigMutation.isPending}
          data-testid="button-update-whatsapp"
        >
          {updateConfigMutation.isPending ? 'Guardando...' : 'Actualizar WhatsApp'}
        </Button>
      </Card>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Configuración de Messenger API</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="messenger-page-id">Facebook Page ID</Label>
            <Input
              id="messenger-page-id"
              type="text"
              placeholder="1234567890"
              defaultValue={config?.messagingApis?.messengerPageId}
              className="bg-input border-border focus:border-primary"
              data-testid="input-messenger-page-id"
            />
          </div>
          <div>
            <Label htmlFor="messenger-app-id">Facebook App ID</Label>
            <Input
              id="messenger-app-id"
              type="text"
              placeholder="9876543210"
              defaultValue={config?.messagingApis?.messengerAppId}
              className="bg-input border-border focus:border-primary"
              data-testid="input-messenger-app-id"
            />
          </div>
          <div>
            <Label htmlFor="messenger-api-key">Messenger API Token</Label>
            <Input
              id="messenger-api-key"
              type="password"
              placeholder="EAAxxxxxxxxxxxxxx..."
              defaultValue={config?.messagingApis?.messengerApiKey}
              className="bg-input border-border focus:border-primary"
              data-testid="input-messenger-api-key"
            />
          </div>
          <div>
            <Label htmlFor="messenger-webhook-verify">Webhook Verify Token</Label>
            <Input
              id="messenger-webhook-verify"
              type="text"
              placeholder="my-verify-token-123"
              defaultValue={config?.messagingApis?.messengerWebhookVerify}
              className="bg-input border-border focus:border-primary"
              data-testid="input-messenger-webhook-verify"
            />
          </div>
        </div>
        <Button 
          onClick={() => {
            const messengerPageId = (document.getElementById('messenger-page-id') as HTMLInputElement)?.value;
            const messengerAppId = (document.getElementById('messenger-app-id') as HTMLInputElement)?.value;
            const messengerApiKey = (document.getElementById('messenger-api-key') as HTMLInputElement)?.value;
            const messengerWebhookVerify = (document.getElementById('messenger-webhook-verify') as HTMLInputElement)?.value;

            updateConfigMutation.mutate({
              ...config,
              messagingApis: {
                ...config?.messagingApis,
                messengerPageId,
                messengerAppId,
                messengerApiKey,
                messengerWebhookVerify,
              },
            });
          }}
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          disabled={updateConfigMutation.isPending}
          data-testid="button-update-messenger"
        >
          {updateConfigMutation.isPending ? 'Guardando...' : 'Actualizar Messenger'}
        </Button>
      </Card>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Logo y Fondo</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="logo-url">URL del Logo</Label>
            <Input
              id="logo-url"
              type="url"
              placeholder="https://ejemplo.com/logo.png"
              defaultValue={config?.siteContent?.logoUrl}
              className="bg-input border-border focus:border-primary"
              data-testid="input-logo-url"
            />
          </div>
          <div>
            <Label htmlFor="background-image-url">URL de Imagen de Fondo</Label>
            <Input
              id="background-image-url"
              type="url"
              placeholder="https://ejemplo.com/fondo.jpg"
              defaultValue={config?.siteContent?.backgroundImageUrl}
              className="bg-input border-border focus:border-primary"
              data-testid="input-background-url"
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">CSS Personalizado</h3>
        <div>
          <Label htmlFor="custom-css">Estilos CSS Personalizados</Label>
          <Textarea
            id="custom-css"
            rows={10}
            placeholder=".mi-clase { color: red; }"
            defaultValue={config?.siteContent?.customCSS}
            className="bg-input border-border focus:border-primary font-mono text-sm"
            data-testid="textarea-custom-css"
          />
        </div>
      </Card>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Sección Hero</h3>
        <div>
          <Label htmlFor="hero-title">Título Principal</Label>
          <Input
            id="hero-title"
            type="text"
            defaultValue={config?.siteContent?.heroTitle}
            placeholder="Videos Profesionales que Cuentan Tu Historia"
            className="bg-input border-border focus:border-primary mb-4"
            data-testid="input-hero-title"
          />
          <Label htmlFor="hero-description">Descripción Hero</Label>
          <Textarea
            id="hero-description"
            rows={3}
            defaultValue={config?.siteContent?.heroDescription}
            placeholder="Creamos contenido audiovisual de alta calidad..."
            className="bg-input border-border focus:border-primary"
            data-testid="textarea-hero-description"
          />
        </div>
        <Button 
          onClick={handleSiteContentUpdate}
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          disabled={updateConfigMutation.isPending}
          data-testid="button-update-hero"
        >
          {updateConfigMutation.isPending ? 'Guardando...' : 'Guardar Sección Hero'}
        </Button>
      </Card>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Sección Calculadora</h3>
        <div>
          <Label htmlFor="calculator-title">Título de Calculadora</Label>
          <Input
            id="calculator-title"
            type="text"
            defaultValue={config?.siteContent?.calculatorTitle}
            placeholder="Calcula tu Inversión"
            className="bg-input border-border focus:border-primary mb-4"
            data-testid="input-calculator-title"
          />
          <Label htmlFor="calculator-description">Descripción de Calculadora</Label>
          <Textarea
            id="calculator-description"
            rows={3}
            defaultValue={config?.siteContent?.calculatorDescription}
            placeholder="Obtén un presupuesto instantáneo..."
            className="bg-input border-border focus:border-primary"
            data-testid="textarea-calculator-description"
          />
        </div>
        <Button 
          onClick={handleSiteContentUpdate}
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          disabled={updateConfigMutation.isPending}
          data-testid="button-update-calculator"
        >
          {updateConfigMutation.isPending ? 'Guardando...' : 'Guardar Calculadora'}
        </Button>
      </Card>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Información de Contacto</h3>
        <div>
          <Label htmlFor="contact-email">Email de Contacto</Label>
          <Input
            id="contact-email"
            type="email"
            defaultValue={config?.siteContent?.contactEmail}
            placeholder="info@videoventa.com"
            className="bg-input border-border focus:border-primary mb-4"
            data-testid="input-contact-email"
          />
          <Label htmlFor="company-description">Descripción de la Empresa</Label>
          <Textarea
            id="company-description"
            rows={3}
            defaultValue={config?.siteContent?.companyDescription}
            placeholder="Creamos contenido audiovisual profesional..."
            className="bg-input border-border focus:border-primary"
            data-testid="textarea-company-description"
          />
        </div>
        <Button 
          onClick={handleSiteContentUpdate}
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          disabled={updateConfigMutation.isPending}
          data-testid="button-update-contact"
        >
          {updateConfigMutation.isPending ? 'Guardando...' : 'Guardar Información'}
        </Button>
      </Card>

      <Card className="glass-card fire-border p-6">
        <h3 className="text-xl font-bold mb-4 fire-text">Indicadores de Confianza</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="trust-projects">Proyectos Completados</Label>
            <Input
              id="trust-projects"
              type="text"
              defaultValue={config?.siteContent?.trustIndicators?.projects}
              placeholder="100+ Proyectos"
              className="bg-input border-border focus:border-primary"
              data-testid="input-trust-projects"
            />
          </div>
          <div>
            <Label htmlFor="trust-rating">Calificación</Label>
            <Input
              id="trust-rating"
              type="text"
              defaultValue={config?.siteContent?.trustIndicators?.rating}
              placeholder="5.0 Calificación"
              className="bg-input border-border focus:border-primary"
              data-testid="input-trust-rating"
            />
          </div>
          <div>
            <Label htmlFor="trust-delivery">Entrega</Label>
            <Input
              id="trust-delivery"
              type="text"
              defaultValue={config?.siteContent?.trustIndicators?.delivery}
              placeholder="Entrega Rápida"
              className="bg-input border-border focus:border-primary"
              data-testid="input-trust-delivery"
            />
          </div>
        </div>
        <Button 
          onClick={handleSiteContentUpdate}
          className="fire-gradient text-white font-semibold hover:opacity-90 mt-4"
          disabled={updateConfigMutation.isPending}
          data-testid="button-update-trust"
        >
          {updateConfigMutation.isPending ? 'Guardando...' : 'Guardar Indicadores'}
        </Button>
      </Card>

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
                  placeholder="URL de la imagen"
                  defaultValue={video.thumbnail}
                  className="bg-input border-border focus:border-primary"
                  data-testid={`input-video-thumbnail-${index}`}
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

        {/* Edit Client Dialog */}
        <Dialog open={showEditClient} onOpenChange={setShowEditClient}>
          <DialogContent className="glass-card fire-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="fire-text">Editar Cliente</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateClient(formData);
              }}
              className="space-y-6"
              data-testid="form-edit-client"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-client-name">Nombre de la Empresa</Label>
                  <Input
                    id="edit-client-name"
                    name="name"
                    defaultValue={editingClient?.name}
                    placeholder="ABC Corporation"
                    className="bg-input border-border focus:border-primary"
                    required
                    data-testid="input-edit-client-name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-client-email">Email de Contacto</Label>
                  <Input
                    id="edit-client-email"
                    name="email"
                    type="email"
                    defaultValue={editingClient?.email}
                    placeholder="contacto@abccorp.com"
                    className="bg-input border-border focus:border-primary"
                    required
                    data-testid="input-edit-client-email"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-client-phone">Teléfono</Label>
                  <Input
                    id="edit-client-phone"
                    name="phone"
                    type="tel"
                    defaultValue={editingClient?.phone}
                    placeholder="+52 55 1234 5678"
                    className="bg-input border-border focus:border-primary"
                    data-testid="input-edit-client-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-client-username">Username</Label>
                  <Input
                    id="edit-client-username"
                    name="username"
                    value={editingClient?.username}
                    className="bg-muted border-border"
                    readOnly
                    disabled
                    data-testid="input-edit-client-username"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditClient(false);
                    setEditingClient(null);
                  }}
                  className="flex-1"
                  data-testid="button-cancel-edit-client"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 fire-gradient text-white font-semibold hover:opacity-90"
                  disabled={updateClientMutation.isPending}
                  data-testid="button-submit-edit-client"
                >
                  {updateClientMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card fire-border p-6">
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
                        title="Ver página del cliente"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setSelectedClientForProjects(client)}
                        data-testid={`button-projects-client-${client.id}`}
                        title="Gestionar proyectos"
                      >
                        <Package size={16} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEditClient(client)}
                        data-testid={`button-edit-client-${client.id}`}
                        title="Editar cliente"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive" 
                        data-testid={`button-delete-client-${client.id}`}
                        title="Eliminar cliente"
                      >
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

      {/* Project Manager Section */}
      {selectedClientForProjects && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold fire-text">Gestión de Proyectos</h3>
            <Button
              variant="outline"
              onClick={() => setSelectedClientForProjects(null)}
              data-testid="button-close-projects"
            >
              Cerrar
            </Button>
          </div>
          <ProjectManager
            clientId={selectedClientForProjects.id}
            clientName={selectedClientForProjects.name}
          />
        </div>
      )}
    </div>
  );

  const renderPricing = () => {
    const narratedPricing = config?.pricing?.narratedVideos || {};
    const singingPackages = config?.pricing?.singingPackages || {};
    const videoFeatures = narratedPricing?.videoFeatures || [];

    return (
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

        {/* Videos Narrados */}
        <Card className="glass-card fire-border p-6">
          <h3 className="text-xl font-bold mb-4 fire-text">Videos Narrados - Precios Base</h3>
          <div className="space-y-4">
            {narratedPricing?.durations && Object.entries(narratedPricing.durations).map(([key, value]: [string, any]) => (
              <div key={key} className="grid md:grid-cols-3 gap-4 p-4 border border-border rounded-lg">
                <div>
                  <Label>{value.label}</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      defaultValue={value.mxn}
                      className="bg-input border-border focus:border-primary"
                      onChange={(e) => handlePricingUpdate(`narratedDuration-${key}`, 'mxn', parseInt(e.target.value))}
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
                      onChange={(e) => handlePricingUpdate(`narratedDuration-${key}`, 'usd', parseInt(e.target.value))}
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
          
          {/* Características */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold fire-text mb-3">Características Incluidas</h4>
            <div className="bg-muted/20 p-4 rounded-lg">
              <ul className="space-y-2 text-sm">
                {videoFeatures.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Videos Cantados */}
        <Card className="glass-card fire-border p-6">
          <h3 className="text-xl font-bold mb-4 fire-text">Videos Cantados - Paquetes</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(singingPackages).map(([key, pkg]: [string, any]) => (
              <div key={key} className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-3 fire-text">{pkg.label}</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Precio MXN</Label>
                    <Input
                      type="number"
                      defaultValue={pkg.mxn}
                      className="bg-input border-border focus:border-primary"
                      onChange={(e) => handlePricingUpdate(`singingPackage-${key}`, 'mxn', parseInt(e.target.value))}
                      data-testid={`input-singing-${key}-mxn`}
                    />
                  </div>
                  <div>
                    <Label>Precio USD</Label>
                    <Input
                      type="number"
                      defaultValue={pkg.usd}
                      className="bg-input border-border focus:border-primary"
                      onChange={(e) => handlePricingUpdate(`singingPackage-${key}`, 'usd', parseInt(e.target.value))}
                      data-testid={`input-singing-${key}-usd`}
                    />
                  </div>
                  <div>
                    <Label>Videos</Label>
                    <Input
                      type="number"
                      defaultValue={pkg.videos}
                      className="bg-input border-border focus:border-primary"
                      onChange={(e) => handlePricingUpdate(`singingPackage-${key}`, 'videos', parseInt(e.target.value))}
                      data-testid={`input-singing-${key}-videos`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Multiplicadores */}
        <Card className="glass-card fire-border p-6">
          <h3 className="text-xl font-bold mb-4 fire-text">Multiplicadores de Precio</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Velocidad de Entrega</h4>
              <div className="space-y-2">
                {narratedPricing?.speeds && Object.entries(narratedPricing.speeds).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Label className="flex-1">{value.label}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={value.multiplier}
                      className="w-24 bg-input border-border focus:border-primary"
                      onChange={(e) => handlePricingUpdate(`speed-${key}`, 'multiplier', parseFloat(e.target.value))}
                      data-testid={`input-speed-${key}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Cantidad de Videos</h4>
              <div className="space-y-2">
                {narratedPricing?.quantities && Object.entries(narratedPricing.quantities).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Label className="flex-1">{value.label}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={value.multiplier}
                      className="w-24 bg-input border-border focus:border-primary"
                      onChange={(e) => handlePricingUpdate(`quantity-${key}`, 'multiplier', parseFloat(e.target.value))}
                      data-testid={`input-quantity-${key}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Show login screen if not authenticated
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => {
      setIsAuthenticated(true);
      checkAuthStatus();
    }} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold fire-text">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                className="border-primary text-primary hover:bg-primary hover:text-white"
                data-testid="button-back-to-site"
              >
                Volver al Sitio
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                data-testid="button-logout"
              >
                <LogOut size={16} className="mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 glass-card fire-border">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="clients" data-testid="tab-clients">Clientes</TabsTrigger>
            <TabsTrigger value="pricing" data-testid="tab-pricing">Precios</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">Contenido</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            {renderClients()}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {renderPricing()}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {renderContent()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {renderSettings()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}