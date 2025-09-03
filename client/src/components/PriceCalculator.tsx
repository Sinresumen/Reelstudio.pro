import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfig } from '@/contexts/ConfigContext';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Phone, Video, Music, CheckCircle, Clock, Package, Sparkles, X } from 'lucide-react';

export default function PriceCalculator() {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = React.useState('narrated');
  
  // Narrated videos state
  const [duration, setDuration] = React.useState('5-10');
  const [quantity, setQuantity] = React.useState('15');
  const [speed, setSpeed] = React.useState('normal');
  
  const [calculatedPrice, setCalculatedPrice] = React.useState<any>(null);
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = React.useState(false);

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

  // Calcular días de entrega basado en cantidad
  const getDeliveryDays = (videoQuantity: string, videoSpeed: string) => {
    const qty = parseInt(videoQuantity);
    let baseDays = { min: 2, max: 5 }; // Por defecto para 15 videos
    
    if (qty <= 15) {
      baseDays = { min: 2, max: 5 };
    } else if (qty <= 30) {
      baseDays = { min: 4, max: 10 };
    } else if (qty <= 60) {
      baseDays = { min: 8, max: 15 };
    } else {
      baseDays = { min: 15, max: 30 };
    }

    // Ajustar según velocidad
    if (videoSpeed === 'fast') {
      baseDays.min = Math.max(1, Math.floor(baseDays.min * 0.7));
      baseDays.max = Math.floor(baseDays.max * 0.7);
    } else if (videoSpeed === 'express') {
      baseDays.min = Math.max(1, Math.floor(baseDays.min * 0.5));
      baseDays.max = Math.floor(baseDays.max * 0.5);
    }

    return `${baseDays.min}-${baseDays.max} días`;
  };

  const handleOrderNow = (type?: string, packageId?: string) => {
    if (config?.whatsappNumber && (calculatedPrice || packageId)) {
      let message = '';
      if (type === 'singing' && packageId) {
        const pkg = singingPackages[packageId];
        message = `¡Hola! Me interesa ordenar el paquete de videos cantados:\n\n📦 Paquete: ${pkg.label}\n💰 Precio: $${pkg.mxn?.toLocaleString()} MXN\n🎬 Videos: ${pkg.videos}\n⏱️ Entrega: ${getDeliveryDays(pkg.videos.toString(), 'normal')}\n\n¿Podemos proceder con el pedido?`;
      } else {
        const durationLabel = narratedPricing?.durations?.[duration]?.label || duration;
        const quantityLabel = narratedPricing?.quantities?.[quantity]?.label || quantity;
        const deliveryDays = getDeliveryDays(quantity, speed);
        message = `¡Hola! Me interesa ordenar videos narrados con las siguientes características:\n\n📏 Duración: ${durationLabel}\n📦 Cantidad: ${quantityLabel}\n⏱️ Entrega: ${deliveryDays}\n💰 Total: $${calculatedPrice?.totalMXN?.toLocaleString()} MXN\n\n¿Podemos proceder con el pedido?`;
      }
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setShowQuoteModal(false);
    }
  };

  const QuoteModal = ({ type, packageId }: { type?: string; packageId?: string }) => {
    const isNarrated = type !== 'singing';
    const pkg = !isNarrated && packageId ? singingPackages[packageId] : null;
    
    return (
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Resumen de tu Cotización
            </DialogTitle>
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Tipo de Video */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                {isNarrated ? <Video className="w-5 h-5 text-orange-500" /> : <Music className="w-5 h-5 text-purple-500" />}
                {isNarrated ? 'Videos Narrados' : 'Videos Cantados'}
              </h3>
            </div>

            {/* Detalles */}
            <div className="space-y-3">
              {isNarrated ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Duración</span>
                    <span className="font-semibold">{narratedPricing?.durations?.[duration]?.label}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Cantidad</span>
                    <span className="font-semibold">{narratedPricing?.quantities?.[quantity]?.label}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Tiempo de entrega</span>
                    <span className="font-semibold">{getDeliveryDays(quantity, speed)}</span>
                  </div>
                </>
              ) : pkg && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Paquete</span>
                    <span className="font-semibold">{pkg.label}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Videos incluidos</span>
                    <span className="font-semibold">{pkg.videos}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Tiempo de entrega</span>
                    <span className="font-semibold">{getDeliveryDays(pkg.videos?.toString() || '15', 'normal')}</span>
                  </div>
                </>
              )}
            </div>

            {/* Precio Total */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-center">
              <p className="text-sm text-muted-foreground mb-1">Precio Total</p>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                ${isNarrated ? calculatedPrice?.totalMXN?.toLocaleString() : pkg?.mxn?.toLocaleString()} MXN
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                (≈ ${isNarrated ? calculatedPrice?.totalUSD : pkg?.usd} USD)
              </p>
            </div>

            {/* Características incluidas */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Incluye:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Calidad HD</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Edición profesional</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Revisiones incluidas</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Entrega garantizada</span>
                </div>
              </div>
            </div>

            {/* Botón de Acción */}
            <Button 
              onClick={() => handleOrderNow(type, packageId)}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Phone className="mr-2" size={20} />
              Ordenar Ahora por WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderNarratedVideos = () => (
    <div className="space-y-8">
      {/* Selector de Duración más compacto */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Duración del Video</Label>
        <div className="grid md:grid-cols-3 gap-3">
          {narratedPricing?.durations && Object.entries(narratedPricing.durations).map(([key, value]: [string, any]) => (
            <button
              key={key}
              onClick={() => setDuration(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                duration === key 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
              data-testid={`duration-option-${key}`}
            >
              <div className="text-sm font-medium">{value.label}</div>
              <div className="text-lg font-bold text-primary mt-1">
                ${value.mxn?.toLocaleString()} MXN
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cantidad y Velocidad en una fila */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cantidad */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Cantidad de Videos</Label>
          <Select value={quantity} onValueChange={setQuantity}>
            <SelectTrigger className="h-12" data-testid="select-quantity">
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

        {/* Velocidad */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Velocidad de Entrega</Label>
          <Select value={speed} onValueChange={setSpeed}>
            <SelectTrigger className="h-12" data-testid="select-speed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal ({getDeliveryDays(quantity, 'normal')})</SelectItem>
              <SelectItem value="fast">Rápido ({getDeliveryDays(quantity, 'fast')})</SelectItem>
              <SelectItem value="express">Express ({getDeliveryDays(quantity, 'express')})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid inferior con características y precio */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Características */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Incluye en Videos Narrados
            </h3>
            <div className="space-y-3 text-sm">
              {narratedPricing?.videoFeatures?.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Precio Total */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-orange-900/10 to-red-900/10">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Total a Pagar</p>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent" data-testid="text-total-price">
                ${calculatedPrice?.totalMXN?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                MXN (≈ ${calculatedPrice?.totalUSD || 0} USD)
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Entrega estimada: {getDeliveryDays(quantity, speed)}
              </p>
            </div>

            <Button 
              onClick={() => {
                setShowQuoteModal(true);
              }}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all"
              data-testid="button-quote-narrated"
            >
              Cotizar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de cotización */}
      <QuoteModal type="narrated" />
    </div>
  );

  const renderSingingVideos = () => (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
          Videos Cantados Premium
        </h3>
        <p className="text-muted-foreground">
          Producción musical con letra personalizada
        </p>
      </div>

      {/* Paquetes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(singingPackages).map(([key, pkg]: [string, any]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedPackage === key 
                ? 'border-2 border-purple-500 bg-purple-900/10' 
                : 'border-border hover:border-purple-500/50'
            }`}
            onClick={() => setSelectedPackage(key)}
            data-testid={`package-${key}`}
          >
            <CardContent className="p-4 text-center">
              {key === 'standard' && (
                <div className="mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500 text-white">
                    POPULAR
                  </span>
                </div>
              )}
              <h4 className="font-bold mb-2">{pkg.label}</h4>
              <div className="text-2xl font-bold mb-1">${pkg.mxn?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mb-3">MXN</div>
              <div className="text-sm mb-3">
                <div className="flex items-center justify-center gap-1">
                  <Video className="w-4 h-4 text-purple-500" />
                  <span>{pkg.videos} videos</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Entrega: {getDeliveryDays(pkg.videos?.toString() || '15', 'normal')}
                </div>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuoteModal(true);
                }}
                className={`w-full text-sm ${
                  selectedPackage === key
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-primary/10 hover:bg-primary/20'
                }`}
              >
                Cotizar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Características */}
      <Card className="border-purple-500/20">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-center">Incluye en Videos Cantados</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Letra personalizada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Música profesional</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Voces de estudio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Animaciones sincronizadas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Formato HD</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Revisiones incluidas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de cotización */}
      {selectedPackage && <QuoteModal type="singing" packageId={selectedPackage} />}
    </div>
  );

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger 
            value="narrated" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            <Video className="mr-2" size={16} />
            Videos Narrados
          </TabsTrigger>
          <TabsTrigger 
            value="singing" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Music className="mr-2" size={16} />
            Videos Cantados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="narrated" className="mt-6">
          {renderNarratedVideos()}
        </TabsContent>
        
        <TabsContent value="singing" className="mt-6">
          {renderSingingVideos()}
        </TabsContent>
      </Tabs>
    </div>
  );
}