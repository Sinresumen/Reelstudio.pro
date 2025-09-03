import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfig } from '@/contexts/ConfigContext';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Phone } from 'lucide-react';

export default function PriceCalculator() {
  const { config } = useConfig();
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
    calculatePriceMutation.mutate({ duration, speed, quantity });
  }, [duration, speed, quantity]);

  const pricing = config?.pricing as any;
  const singingPackages = pricing?.singingPackages || {};

  const handleWhatsAppQuote = () => {
    if (config?.whatsappNumber && calculatedPrice) {
      const message = `Hola, me interesa una cotización para:\n- Duración: ${duration} minutos\n- Cantidad: ${quantity} videos\n- Velocidad: ${speed}\n- Total: $${calculatedPrice.totalMXN?.toLocaleString()} MXN`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <Label className="block text-sm font-medium mb-3 fire-text">Duración del Video</Label>
          <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-1 gap-3">
            {pricing?.durations && Object.entries(pricing.durations).map(([key, value]: [string, any]) => (
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

        <div>
          <Label className="block text-sm font-medium mb-3 fire-text">Cantidad de Videos</Label>
          <Select value={quantity} onValueChange={setQuantity}>
            <SelectTrigger className="bg-input border-border focus:border-primary" data-testid="select-quantity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pricing?.quantities && Object.entries(pricing.quantities).map(([key, value]: [string, any]) => (
                <SelectItem key={key} value={key}>
                  {value.label} (x{value.multiplier})
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
              {pricing?.speeds && Object.entries(pricing.speeds).map(([key, value]: [string, any]) => (
                <SelectItem key={key} value={key}>
                  {value.label} - {value.multiplier === 1 ? 'Sin recargo' : `+${Math.round((value.multiplier - 1) * 100)}%`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="glass-card fire-border bg-gradient-to-br from-orange-900/20 to-red-900/20 p-6">
          <h3 className="text-xl font-bold mb-4 fire-text">Resumen del Proyecto</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio base:</span>
              <span className="font-semibold" data-testid="text-base-price">
                ${calculatedPrice?.basePriceMXN?.toLocaleString() || '0'} MXN
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad:</span>
              <span className="font-semibold" data-testid="text-quantity-display">
                {pricing?.quantities?.[quantity]?.label || `${quantity} videos`} (x{calculatedPrice?.quantityMultiplier || 1})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Velocidad:</span>
              <span className="font-semibold" data-testid="text-speed-display">
                {pricing?.speeds?.[speed]?.label?.split(' - ')[0] || speed} 
                {calculatedPrice?.speedMultiplier > 1 ? ` (+${Math.round((calculatedPrice.speedMultiplier - 1) * 100)}%)` : ' (Sin recargo)'}
              </span>
            </div>
            <hr className="border-border" />
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

        <Card className="glass-card fire-border p-6">
          <h3 className="text-lg font-bold mb-4 fire-text">Videos Cantados - Paquetes</h3>
          <div className="space-y-3">
            {Object.entries(singingPackages).map(([key, pkg]: [string, any]) => (
              <div key={key} className="flex justify-between items-center p-3 border border-border rounded-lg" data-testid={`package-${key}`}>
                <div>
                  <div className="font-medium">{pkg.label}</div>
                  <div className="text-sm text-muted-foreground">{pkg.videos} videos</div>
                </div>
                <div className="fire-text font-semibold">${pkg.mxn?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
