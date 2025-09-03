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
import { Phone, Video, Music, CheckCircle, Clock, Package, Sparkles, Zap, Timer, Users, Gauge } from 'lucide-react';

export default function PriceCalculator() {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = React.useState('narrated');
  
  // Narrated videos state
  const [duration, setDuration] = React.useState('5-10');
  const [quantity, setQuantity] = React.useState('15');
  const [speed, setSpeed] = React.useState('normal');
  
  const [calculatedPrice, setCalculatedPrice] = React.useState<any>(null);
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null);

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

  const handleWhatsAppQuote = (type?: string, packageId?: string) => {
    if (config?.whatsappNumber && (calculatedPrice || packageId)) {
      let message = '';
      if (type === 'singing' && packageId) {
        const pkg = singingPackages[packageId];
        message = `Hola, me interesa el paquete ${pkg.label} de videos cantados:\n- Precio: $${pkg.mxn?.toLocaleString()} MXN\n- Videos: ${pkg.videos}`;
      } else {
        const durationLabel = narratedPricing?.durations?.[duration]?.label || duration;
        const quantityLabel = narratedPricing?.quantities?.[quantity]?.label || quantity;
        const speedLabel = narratedPricing?.speeds?.[speed]?.label || speed;
        message = `Hola, me interesa una cotización para videos narrados:\n- Duración: ${durationLabel}\n- Cantidad: ${quantityLabel}\n- Velocidad: ${speedLabel}\n- Total: $${calculatedPrice?.totalMXN?.toLocaleString()} MXN`;
      }
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const renderNarratedVideos = () => (
    <div>
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 mb-4">
          <Video className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-500">Producción Profesional</span>
        </div>
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          Videos Narrados Premium
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Contenido audiovisual narrado profesionalmente para tu marca
        </p>
      </div>

      {/* Duration Selection Cards */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-orange-500" />
          <h4 className="text-xl font-semibold">Selecciona la Duración</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {narratedPricing?.durations && Object.entries(narratedPricing.durations).map(([key, value]: [string, any], index: number) => (
            <div
              key={key}
              className={`group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                duration === key ? 'scale-105 -translate-y-2' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {key === '10-20' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold">
                    MÁS POPULAR
                  </span>
                </div>
              )}

              <Card 
                className={`h-full cursor-pointer overflow-hidden transition-all duration-300 ${
                  duration === key 
                    ? 'border-2 border-orange-500 bg-gradient-to-br from-orange-900/20 to-red-900/20' 
                    : 'border-border hover:border-orange-500/50 bg-card/50'
                }`}
                onClick={() => setDuration(key)}
                data-testid={`duration-card-${key}`}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Icon */}
                    <div className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-r ${
                      key === '5-10' ? 'from-green-500 to-emerald-600' :
                      key === '10-20' ? 'from-orange-500 to-red-600' :
                      'from-purple-500 to-pink-600'
                    } p-1`}>
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                        <Timer className="h-8 w-8 text-primary" />
                      </div>
                    </div>

                    {/* Duration Name */}
                    <h5 className="text-xl font-bold mb-2">{value.label}</h5>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4">
                      {key === '5-10' && 'Ideal para presentaciones cortas y contenido rápido'}
                      {key === '10-20' && 'Perfecto para contenido promocional y explicativo'}
                      {key === '20-30' && 'Documentales completos y contenido extenso'}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        ${value.mxn?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">MXN base</div>
                    </div>

                    {/* Select Button */}
                    <Button 
                      className={`w-full ${
                        duration === key
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {duration === key ? 'Seleccionado ✓' : 'Seleccionar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Options Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Quantity Card */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/50 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-500" />
              <h4 className="text-lg font-semibold">Cantidad de Videos</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {narratedPricing?.quantities && Object.entries(narratedPricing.quantities).map(([key, value]: [string, any]) => (
                <Button
                  key={key}
                  variant={quantity === key ? "default" : "outline"}
                  className={`h-20 flex flex-col justify-center ${
                    quantity === key 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-0' 
                      : 'hover:border-orange-500/50'
                  }`}
                  onClick={() => setQuantity(key)}
                  data-testid={`quantity-option-${key}`}
                >
                  <span className="text-lg font-bold">{value.label}</span>
                  {value.multiplier > 1 && (
                    <span className="text-xs opacity-90">Descuento x{value.multiplier}</span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Speed Card */}
        <Card className="overflow-hidden bg-gradient-to-br from-card/80 to-card/50 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-orange-500" />
              <h4 className="text-lg font-semibold">Velocidad de Entrega</h4>
            </div>
            <div className="space-y-3">
              {narratedPricing?.speeds && Object.entries(narratedPricing.speeds).map(([key, value]: [string, any]) => (
                <Button
                  key={key}
                  variant={speed === key ? "default" : "outline"}
                  className={`w-full h-16 justify-between px-4 ${
                    speed === key 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-0' 
                      : 'hover:border-orange-500/50'
                  }`}
                  onClick={() => setSpeed(key)}
                  data-testid={`speed-option-${key}`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className={`w-5 h-5 ${
                      key === 'express' ? 'text-yellow-400' :
                      key === 'fast' ? 'text-orange-400' :
                      'text-current'
                    }`} />
                    <span className="font-medium">{value.label.split(' - ')[0]}</span>
                  </div>
                  {value.multiplier > 1 && (
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">
                      +{Math.round((value.multiplier - 1) * 100)}%
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section with Features and Price */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Features Card */}
        <Card className="overflow-hidden bg-gradient-to-br from-orange-900/10 to-red-900/10 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                ¿Qué incluyen los Videos Narrados?
              </h4>
            </div>
            <div className="grid gap-4">
              {[
                { icon: CheckCircle, text: "HD Horizontal (1920x1080)", color: "from-green-500 to-emerald-500" },
                { icon: Sparkles, text: "1 Edición profesional incluida", color: "from-yellow-500 to-orange-500" },
                { icon: Video, text: "Prompt personalizado", color: "from-blue-500 to-cyan-500" },
                { icon: Zap, text: "Calidad de imagen profesional", color: "from-orange-500 to-red-500" },
                { icon: Music, text: "Estilo de imágenes 2.5D", color: "from-purple-500 to-pink-500" },
                { icon: Package, text: "Variedad de temas disponibles", color: "from-indigo-500 to-purple-500" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm leading-relaxed pt-2">{feature.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Summary Card */}
        <Card className="overflow-hidden border-2 border-orange-500/30 bg-gradient-to-br from-orange-900/20 via-card to-red-900/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
          <CardContent className="relative p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Cotización Final
              </h3>
              <p className="text-sm text-muted-foreground">Videos Narrados Profesionales</p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duración
                </span>
                <span className="font-semibold">{narratedPricing?.durations?.[duration]?.label}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Cantidad
                </span>
                <span className="font-semibold">{narratedPricing?.quantities?.[quantity]?.label}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Entrega
                </span>
                <span className="font-semibold">{narratedPricing?.speeds?.[speed]?.label?.split(' - ')[0]}</span>
              </div>
            </div>

            {/* Total Price */}
            <div className="text-center mb-6 p-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <p className="text-sm text-muted-foreground mb-2">Total a Pagar</p>
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent" data-testid="text-total-price">
                ${calculatedPrice?.totalMXN?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground mt-2" data-testid="text-total-price-usd">
                MXN (≈ ${calculatedPrice?.totalUSD || 0} USD)
              </div>
            </div>

            <Button 
              onClick={() => handleWhatsAppQuote()}
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
              data-testid="button-whatsapp-quote"
            >
              <Phone className="mr-2" size={20} />
              Solicitar Cotización por WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSingingVideos = () => (
    <div>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-purple-500/20 mb-4">
          <Music className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-500">Paquetes Especiales</span>
        </div>
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Videos Cantados Premium
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Producción musical profesional con letra personalizada para tu marca
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Object.entries(singingPackages).map(([key, pkg]: [string, any], index: number) => (
          <div
            key={key}
            className={`group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
              selectedPackage === key ? 'scale-105 -translate-y-2' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Popular Badge */}
            {key === 'standard' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold">
                  MÁS POPULAR
                </span>
              </div>
            )}

            <Card 
              className={`h-full cursor-pointer overflow-hidden transition-all duration-300 ${
                selectedPackage === key 
                  ? 'border-2 border-purple-500 bg-gradient-to-br from-purple-900/20 to-pink-900/20' 
                  : 'border-border hover:border-purple-500/50 bg-card/50'
              }`}
              onClick={() => setSelectedPackage(key)}
              data-testid={`package-${key}`}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Icon */}
                  <div className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-r ${
                    key === 'basic' ? 'from-gray-500 to-gray-600' :
                    key === 'standard' ? 'from-purple-500 to-pink-500' :
                    key === 'premium' ? 'from-yellow-500 to-orange-500' :
                    'from-cyan-500 to-blue-500'
                  } p-1`}>
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                      <Music className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {/* Package Name */}
                  <h4 className="text-xl font-bold mb-2">{pkg.label}</h4>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold">${pkg.mxn?.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">MXN</div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Video className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">{pkg.videos} videos</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Letra personalizada</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span>Producción HD</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsAppQuote('singing', key);
                    }}
                    className={`mt-6 w-full ${
                      selectedPackage === key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                    data-testid={`button-package-${key}`}
                  >
                    <Phone className="mr-2" size={16} />
                    {selectedPackage === key ? 'Contactar Ahora' : 'Seleccionar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <Card className="overflow-hidden bg-gradient-to-br from-purple-900/10 to-pink-900/10 border-purple-500/20 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              ¿Qué incluyen los Videos Cantados?
            </h4>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Music, text: "Letra 100% personalizada para tu marca", color: "from-purple-500 to-pink-500" },
              { icon: Sparkles, text: "Música profesional y voces de estudio", color: "from-yellow-500 to-orange-500" },
              { icon: Video, text: "Animaciones sincronizadas con la música", color: "from-blue-500 to-cyan-500" },
              { icon: CheckCircle, text: "Formato HD optimizado para redes", color: "from-green-500 to-emerald-500" },
              { icon: Clock, text: "Entrega en 5-7 días hábiles", color: "from-red-500 to-pink-500" },
              { icon: Zap, text: "Revisiones incluidas hasta aprobación", color: "from-orange-500 to-yellow-500" }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color}`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm leading-relaxed">{feature.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-card/50 backdrop-blur-sm">
          <TabsTrigger 
            value="narrated" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
          >
            <Video className="mr-2" size={18} />
            Videos Narrados
          </TabsTrigger>
          <TabsTrigger 
            value="singing" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
          >
            <Music className="mr-2" size={18} />
            Videos Cantados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="narrated" className="mt-8 animate-fade-in">
          {renderNarratedVideos()}
        </TabsContent>
        
        <TabsContent value="singing" className="mt-8 animate-fade-in">
          {renderSingingVideos()}
        </TabsContent>
      </Tabs>
    </div>
  );
}