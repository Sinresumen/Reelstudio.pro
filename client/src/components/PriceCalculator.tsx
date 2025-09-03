import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfig } from '@/contexts/ConfigContext';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Phone, Video, Music, CheckCircle } from 'lucide-react';

export default function PriceCalculator() {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = React.useState('narrated');
  
  // Narrated videos state
  const [duration, setDuration] = React.useState('5-10');
  const [quantity, setQuantity] = React.useState('15');
  const [speed, setSpeed] = React.useState('normal');
  
  const [calculatedPrice, setCalculatedPrice] = React.useState<any>(null);

  const calculatePriceMutation = useMutation({
    mutationFn: async (data: { duration: string; speed: string; quantity: string }) => {
      const response = await apiRequest('POST', '/api/calculate-price', data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculatedPrice(data);
    },
  });

  React.useEffect(() => {
    if (activeTab === 'narrated') {
      calculatePriceMutation.mutate({ duration, speed, quantity });
    }
  }, [duration, speed, quantity, activeTab]);

  const pricing = config?.pricing as any;
  const narratedPricing = pricing?.narratedVideos || pricing;
  const singingPackages = pricing?.singingPackages || {};

  const handleWhatsAppQuote = () => {
    if (config?.whatsappNumber && calculatedPrice) {
      let message = '';
      if (activeTab === 'narrated') {
        message = `Hola, me interesa una cotización para videos narrados:\n- Duración: ${duration} minutos\n- Cantidad: ${quantity} videos\n- Velocidad: ${speed}\n- Total: $${calculatedPrice.totalMXN?.toLocaleString()} MXN`;
      } else {
        message = `Hola, me interesa información sobre los videos cantados y sus paquetes.`;
      }
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const renderNarratedVideos = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <Label className="block text-sm font-medium mb-3 fire-text">Duración del Video</Label>
          <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-1 gap-3">
            {narratedPricing?.durations && Object.entries(narratedPricing.durations).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={key} data-testid={`radio-duration-${key}`} />
                <Label 
                  htmlFor={key} 
                  className="flex-1 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{value.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {key === '5-10' && 'Ideal para presentaciones'}
                        {key === '10-20' && 'Perfecto para promocionales'}
                        {key === '20-30' && 'Documentales y tutoriales'}
                      </div>
                    </div>
                    <div className="fire-text font-semibold">${value.mxn?.toLocaleString()} MXN</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium mb-3 fire-text">Cantidad de Videos</Label>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger className="bg-input border-border focus:border-primary" data-testid="select-quantity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {narratedPricing?.quantities && Object.entries(narratedPricing.quantities).map(([key, value]: [string, any]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-3 fire-text">Velocidad de Entrega</Label>
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger className="bg-input border-border focus:border-primary" data-testid="select-speed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {narratedPricing?.speeds && Object.entries(narratedPricing.speeds).map(([key, value]: [string, any]) => (
                  <SelectItem key={key} value={key}>
                    {value.label.split(' - ')[0]} {value.multiplier > 1 ? `- +${Math.round((value.multiplier - 1) * 100)}%` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Video Features List */}
        <Card className="glass-card fire-border p-6">
          <h3 className="text-lg font-semibold fire-text mb-4">¿Qué incluyen los Videos Narrados?</h3>
          <div className="space-y-3">
            {narratedPricing?.videoFeatures && narratedPricing.videoFeatures.map((feature: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="fire-gradient w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="glass-card fire-border bg-gradient-to-br from-orange-900/20 to-red-900/20 p-6">
          <h3 className="text-xl font-bold mb-4 fire-text">Tu Cotización - Videos Narrados</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xl font-bold">
              <span className="fire-text">Total:</span>
              <span className="fire-text" data-testid="text-total-price">
                ${calculatedPrice?.totalMXN?.toLocaleString() || '0'} MXN
              </span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <span data-testid="text-total-price-usd">
                (${calculatedPrice?.totalUSD || 0} USD)
              </span>
            </div>
          </div>
          <Button 
            onClick={handleWhatsAppQuote}
            className="w-full fire-gradient text-white font-semibold mt-6 hover:opacity-90"
            data-testid="button-whatsapp-quote"
          >
            <Phone className="mr-2" size={16} />
            Solicitar Cotización
          </Button>
        </Card>
      </div>
    </div>
  );

  const renderSingingVideos = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold fire-text mb-4">Videos Cantados - Paquetes Fijos</h3>
        <p className="text-muted-foreground">Precios establecidos para videos musicales con letra personalizada</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(singingPackages).map(([key, pkg]: [string, any]) => (
          <Card key={key} className="glass-card fire-border p-6 hover:scale-105 transition-transform" data-testid={`package-${key}`}>
            <div className="text-center">
              <div className="fire-gradient w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Music className="text-white" size={24} />
              </div>
              <h4 className="text-xl font-bold fire-text mb-2">{pkg.label}</h4>
              <div className="text-3xl font-bold mb-2">${pkg.mxn?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mb-4">MXN</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center">
                  <Video className="mr-2" size={14} />
                  <span>{pkg.videos} videos</span>
                </div>
              </div>
              <Button 
                onClick={handleWhatsAppQuote}
                className="w-full fire-gradient text-white font-semibold mt-6 hover:opacity-90"
                data-testid={`button-package-${key}`}
              >
                <Phone className="mr-2" size={16} />
                Contactar
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Card className="glass-card fire-border p-6">
          <h4 className="text-lg font-semibold fire-text mb-4">¿Qué incluyen los Videos Cantados?</h4>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="fire-gradient w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <span className="text-sm">Letra personalizada según tu tema</span>
              </div>
              <div className="flex items-center">
                <div className="fire-gradient w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <span className="text-sm">Música de fondo profesional</span>
              </div>
              <div className="flex items-center">
                <div className="fire-gradient w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <span className="text-sm">Voces profesionales</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="fire-gradient w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <span className="text-sm">Animaciones sincronizadas</span>
              </div>
              <div className="flex items-center">
                <div className="fire-gradient w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <span className="text-sm">Formato HD optimizado</span>
              </div>
              <div className="flex items-center">
                <div className="fire-gradient w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="text-white" size={14} />
                </div>
                <span className="text-sm">Entrega en 5-7 días</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="narrated" className="data-[state=active]:fire-gradient data-[state=active]:text-white">
            <Video className="mr-2" size={16} />
            Videos Narrados
          </TabsTrigger>
          <TabsTrigger value="singing" className="data-[state=active]:fire-gradient data-[state=active]:text-white">
            <Music className="mr-2" size={16} />
            Videos Cantados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="narrated">
          {renderNarratedVideos()}
        </TabsContent>
        
        <TabsContent value="singing">
          {renderSingingVideos()}
        </TabsContent>
      </Tabs>
    </div>
  );
}