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
import { Phone, Video, Music, CheckCircle, Clock, Package, Sparkles, X, Timer, Zap, Gauge, Monitor } from 'lucide-react';

export default function PriceCalculator() {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = React.useState('narrated');
  
  // Narrated videos state
  const [duration, setDuration] = React.useState('5-10');
  const [quantity, setQuantity] = React.useState('15');
  const [speed, setSpeed] = React.useState('normal');
  const [quality, setQuality] = React.useState('hd');
  
  // Singing videos state
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null);
  const [singingSpeed, setSingingSpeed] = React.useState('normal');
  const [singingQuality, setSingingQuality] = React.useState('hd');
  
  const [calculatedPrice, setCalculatedPrice] = React.useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = React.useState(false);

  const calculatePriceMutation = useMutation({
    mutationFn: async (data: { duration: string; speed: string; quantity: string; quality?: string }) => {
      const response = await apiRequest('POST', '/api/calculate-price', data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculatedPrice(data);
    },
  });

  React.useEffect(() => {
    if (activeTab === 'narrated') {
      calculatePriceMutation.mutate({ duration, speed, quantity, quality });
    }
  }, [duration, speed, quantity, quality, activeTab]);

  const pricing = config?.pricing as any;
  const narratedPricing = pricing?.narratedVideos || pricing;
  const singingPackages = pricing?.singingPackages || {};

  // Calcular precio con calidad
  const applyQualityPrice = (basePrice: number, videoQuality: string) => {
    if (videoQuality === '2k') return Math.round(basePrice * 1.10);
    if (videoQuality === '4k') return Math.round(basePrice * 1.25);
    return basePrice;
  };

  // Calcular precio de paquete cantado con opciones
  const calculateSingingPrice = (pkg: any, videoSpeed: string, videoQuality: string) => {
    let price = pkg.mxn || 0;
    
    // Aplicar modificador de velocidad
    if (videoSpeed === 'fast') price = Math.round(price * 1.2);
    if (videoSpeed === 'express') price = Math.round(price * 1.4);
    
    // Aplicar modificador de calidad
    price = applyQualityPrice(price, videoQuality);
    
    return price;
  };

  // Calcular días de entrega basado en cantidad
  const getDeliveryDays = (videoQuantity: string | number, videoSpeed: string) => {
    const qty = typeof videoQuantity === 'string' ? parseInt(videoQuantity) : videoQuantity;
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
        const finalPrice = calculateSingingPrice(pkg, singingSpeed, singingQuality);
        const qualityLabel = singingQuality === 'hd' ? 'HD' : singingQuality === '2k' ? '2K' : '4K';
        const speedLabel = singingSpeed === 'normal' ? 'Normal' : singingSpeed === 'fast' ? 'Rápida' : 'Express';
        
        message = `¡Hola! Me interesa ordenar el paquete de videos cantados:\n\n📦 Paquete: ${pkg.label}\n📹 Calidad: ${qualityLabel}\n⚡ Entrega: ${speedLabel} (${getDeliveryDays(pkg.videos, singingSpeed)})\n💰 Precio: $${finalPrice.toLocaleString()} MXN\n🎬 Videos: ${pkg.videos}\n\n¿Podemos proceder con el pedido?`;
      } else {
        const durationLabel = narratedPricing?.durations?.[duration]?.label || duration;
        const quantityLabel = narratedPricing?.quantities?.[quantity]?.label || quantity;
        const qualityLabel = quality === 'hd' ? 'HD' : quality === '2k' ? '2K' : '4K';
        const deliveryDays = getDeliveryDays(quantity, speed);
        const finalPrice = applyQualityPrice(calculatedPrice?.totalMXN || 0, quality);
        
        message = `¡Hola! Me interesa ordenar videos narrados con las siguientes características:\n\n📏 Duración: ${durationLabel}\n📦 Cantidad: ${quantityLabel}\n📹 Calidad: ${qualityLabel}\n⏱️ Entrega: ${deliveryDays}\n💰 Total: $${finalPrice.toLocaleString()} MXN\n\n¿Podemos proceder con el pedido?`;
      }
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setShowQuoteModal(false);
    }
  };

  const QuoteModal = ({ type, packageId }: { type?: string; packageId?: string }) => {
    const isNarrated = type !== 'singing';
    const pkg = !isNarrated && packageId ? singingPackages[packageId] : null;
    const finalPrice = isNarrated 
      ? applyQualityPrice(calculatedPrice?.totalMXN || 0, quality)
      : pkg ? calculateSingingPrice(pkg, singingSpeed, singingQuality) : 0;
    
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
                    <span className="text-muted-foreground">Calidad</span>
                    <span className="font-semibold">{quality === 'hd' ? 'HD' : quality === '2k' ? '2K' : '4K'}</span>
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
                    <span className="text-muted-foreground">Calidad</span>
                    <span className="font-semibold">{singingQuality === 'hd' ? 'HD' : singingQuality === '2k' ? '2K' : '4K'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Tiempo de entrega</span>
                    <span className="font-semibold">{getDeliveryDays(pkg.videos, singingSpeed)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Precio Total */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-center">
              <p className="text-sm text-muted-foreground mb-1">Precio Total</p>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                ${finalPrice.toLocaleString()} MXN
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                (≈ ${Math.round(finalPrice / 18)} USD)
              </p>
            </div>

            {/* Características incluidas */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Incluye:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Calidad {isNarrated ? quality.toUpperCase() : singingQuality.toUpperCase()}</span>
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

  const renderNarratedVideos = () => {
    const finalPrice = applyQualityPrice(calculatedPrice?.totalMXN || 0, quality);
    
    return (
      <div className="space-y-8">
        {/* Header elegante */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 mb-4">
            <Video className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Producción Profesional</span>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Videos Narrados Premium
          </h3>
          <p className="text-muted-foreground">
            Contenido audiovisual narrado profesionalmente
          </p>
        </div>

        {/* Selector de Duración con diseño de cards transparentes */}
        <div>
          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            Duración del Video
          </Label>
          <div className="grid md:grid-cols-3 gap-3">
            {narratedPricing?.durations && Object.entries(narratedPricing.durations).map(([key, value]: [string, any], index: number) => (
              <div
                key={key}
                className={`group relative transform transition-all duration-300 hover:scale-105 ${
                  duration === key ? 'scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {key === '10-20' && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold">
                      POPULAR
                    </span>
                  </div>
                )}
                
                <Card
                  onClick={() => setDuration(key)}
                  className={`cursor-pointer overflow-hidden transition-all duration-300 ${
                    duration === key 
                      ? 'border-2 border-orange-500 bg-gradient-to-br from-orange-900/20 to-red-900/20' 
                      : 'border-border/50 hover:border-orange-500/50 bg-card/50 backdrop-blur-sm'
                  }`}
                  data-testid={`duration-option-${key}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                        key === '5-10' ? 'from-green-500 to-emerald-600' :
                        key === '10-20' ? 'from-orange-500 to-red-600' :
                        'from-purple-500 to-pink-600'
                      } p-0.5`}>
                        <div className="w-full h-full rounded-md bg-background flex items-center justify-center">
                          <Timer className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      {duration === key && (
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="text-sm font-medium mb-1">{value.label}</div>
                    <div className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      ${value.mxn?.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">MXN base</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Cantidad, Velocidad y Calidad */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Cantidad */}
          <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/50 border-orange-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                Cantidad
              </Label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger className="h-10" data-testid="select-quantity">
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
            </CardContent>
          </Card>

          {/* Velocidad */}
          <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/50 border-orange-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-orange-500" />
                Entrega
              </Label>
              <Select value={speed} onValueChange={setSpeed}>
                <SelectTrigger className="h-10" data-testid="select-speed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal ({getDeliveryDays(quantity, 'normal')})</SelectItem>
                  <SelectItem value="fast">Rápida ({getDeliveryDays(quantity, 'fast')})</SelectItem>
                  <SelectItem value="express">Express ({getDeliveryDays(quantity, 'express')})</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Calidad */}
          <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/50 border-orange-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-orange-500" />
                Calidad
              </Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="h-10" data-testid="select-quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hd">HD (1920x1080)</SelectItem>
                  <SelectItem value="2k">2K (+10%)</SelectItem>
                  <SelectItem value="4k">4K (+25%)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Grid inferior con características y precio */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Características con diseño transparente */}
          <Card className="overflow-hidden bg-gradient-to-br from-orange-900/10 to-red-900/10 border-orange-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Incluye en Videos Narrados
              </h3>
              <div className="grid gap-3 text-sm">
                {narratedPricing?.videoFeatures?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${
                      index === 0 ? 'from-green-500 to-emerald-500' :
                      index === 1 ? 'from-yellow-500 to-orange-500' :
                      index === 2 ? 'from-blue-500 to-cyan-500' :
                      index === 3 ? 'from-purple-500 to-pink-500' :
                      index === 4 ? 'from-red-500 to-pink-500' :
                      'from-indigo-500 to-purple-500'
                    } group-hover:scale-110 transition-transform`}>
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="pt-1">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Precio Total con diseño premium */}
          <Card className="overflow-hidden border-2 border-orange-500/30 bg-gradient-to-br from-orange-900/20 via-card to-red-900/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
            <CardContent className="relative p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Total a Pagar</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent" data-testid="text-total-price">
                  ${finalPrice.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  MXN (≈ ${Math.round(finalPrice / 18)} USD)
                </p>
                <div className="mt-3 space-y-1">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <p className="text-xs text-orange-400 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      Entrega: {getDeliveryDays(quantity, speed)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-400 flex items-center justify-center gap-1">
                      <Monitor className="w-3 h-3" />
                      Calidad: {quality === 'hd' ? 'HD' : quality === '2k' ? '2K' : '4K'}
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setShowQuoteModal(true)}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                data-testid="button-quote-narrated"
              >
                <Sparkles className="mr-2" size={18} />
                Ver Cotización Completa
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal de cotización */}
        <QuoteModal type="narrated" />
      </div>
    );
  };

  const renderSingingVideos = () => (
    <div>
      {/* Header elegante */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-purple-500/20 mb-4">
          <Music className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-500">Paquetes Especiales</span>
        </div>
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
          Videos Cantados Premium
        </h3>
        <p className="text-muted-foreground">
          Producción musical con letra personalizada
        </p>
      </div>

      {/* Opciones de Velocidad y Calidad para videos cantados */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Velocidad de Entrega */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-purple-500" />
              Velocidad de Entrega
            </Label>
            <Select value={singingSpeed} onValueChange={setSingingSpeed}>
              <SelectTrigger className="h-10" data-testid="select-singing-speed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal ({getDeliveryDays(selectedPackage ? singingPackages[selectedPackage]?.videos : 15, 'normal')})</SelectItem>
                <SelectItem value="fast">Rápida ({getDeliveryDays(selectedPackage ? singingPackages[selectedPackage]?.videos : 15, 'fast')})</SelectItem>
                <SelectItem value="express">Express ({getDeliveryDays(selectedPackage ? singingPackages[selectedPackage]?.videos : 15, 'express')})</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Calidad */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-500" />
              Calidad de Video
            </Label>
            <Select value={singingQuality} onValueChange={setSingingQuality}>
              <SelectTrigger className="h-10" data-testid="select-singing-quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hd">HD (1920x1080)</SelectItem>
                <SelectItem value="2k">2K (+10%)</SelectItem>
                <SelectItem value="4k">4K (+25%)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Paquetes con diseño transparente */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(singingPackages).map(([key, pkg]: [string, any], index: number) => {
          const finalPrice = calculateSingingPrice(pkg, singingSpeed, singingQuality);
          
          return (
            <div
              key={key}
              className={`group relative transform transition-all duration-500 hover:scale-105 ${
                selectedPackage === key ? 'scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {key === 'standard' && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-semibold">
                    POPULAR
                  </span>
                </div>
              )}

              <Card 
                className={`h-full cursor-pointer overflow-hidden transition-all duration-300 ${
                  selectedPackage === key 
                    ? 'border-2 border-purple-500 bg-gradient-to-br from-purple-900/20 to-pink-900/20' 
                    : 'border-border/50 hover:border-purple-500/50 bg-card/50 backdrop-blur-sm'
                }`}
                onClick={() => setSelectedPackage(key)}
                data-testid={`package-${key}`}
              >
                <CardContent className="p-4 text-center">
                  {/* Icon */}
                  <div className={`mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-r ${
                    key === 'basic' ? 'from-gray-500 to-gray-600' :
                    key === 'standard' ? 'from-purple-500 to-pink-500' :
                    key === 'premium' ? 'from-yellow-500 to-orange-500' :
                    'from-cyan-500 to-blue-500'
                  } p-0.5`}>
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-background">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <h4 className="font-bold mb-2">{pkg.label}</h4>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-1">
                    ${finalPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">MXN</div>
                  
                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex items-center justify-center gap-1">
                      <Video className="w-3 h-3 text-purple-500" />
                      <span>{pkg.videos} videos</span>
                    </div>
                    <div className="text-muted-foreground">
                      {getDeliveryDays(pkg.videos, singingSpeed)}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQuoteModal(true);
                    }}
                    className={`w-full text-sm ${
                      selectedPackage === key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-purple-500/10 hover:bg-purple-500/20'
                    }`}
                  >
                    Cotizar
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Características con diseño transparente */}
      <Card className="overflow-hidden bg-gradient-to-br from-purple-900/10 to-pink-900/10 border-purple-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-center">Incluye en Videos Cantados</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              { icon: Music, text: "Letra personalizada", color: "from-purple-500 to-pink-500" },
              { icon: Sparkles, text: "Música profesional", color: "from-yellow-500 to-orange-500" },
              { icon: Video, text: "Animaciones sincronizadas", color: "from-blue-500 to-cyan-500" },
              { icon: CheckCircle, text: "Formato seleccionado", color: "from-green-500 to-emerald-500" },
              { icon: Clock, text: "Entrega garantizada", color: "from-red-500 to-pink-500" },
              { icon: Zap, text: "Revisiones incluidas", color: "from-orange-500 to-yellow-500" }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-4 w-4 text-white" />
                </div>
                <span className="pt-1">{feature.text}</span>
              </div>
            ))}
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
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-card/50 backdrop-blur-sm">
          <TabsTrigger 
            value="narrated" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all"
          >
            <Video className="mr-2" size={16} />
            Videos Narrados
          </TabsTrigger>
          <TabsTrigger 
            value="singing" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all"
          >
            <Music className="mr-2" size={16} />
            Videos Cantados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="narrated" className="mt-6 animate-fade-in">
          {renderNarratedVideos()}
        </TabsContent>
        
        <TabsContent value="singing" className="mt-6 animate-fade-in">
          {renderSingingVideos()}
        </TabsContent>
      </Tabs>
    </div>
  );
}