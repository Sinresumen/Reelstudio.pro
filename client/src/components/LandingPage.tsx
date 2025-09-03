import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfig } from '@/contexts/ConfigContext';
import { useLocation } from 'wouter';
import PriceCalculator from './PriceCalculator';
import AdminAuth from './AdminAuth';
import { Video, Phone } from 'lucide-react';

export default function LandingPage() {
  const { config } = useConfig();
  const [, setLocation] = useLocation();
  const [showAdminAuth, setShowAdminAuth] = React.useState(false);
  const [logoClickCount, setLogoClickCount] = React.useState(0);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setShowAdminAuth(true);
        return 0;
      }
      return newCount;
    });
  };

  const handleWhatsAppContact = () => {
    if (config?.whatsappNumber) {
      const message = 'Hola, me interesa conocer más sobre sus servicios de producción de video.';
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper functions to safely access nested properties
  const getSiteContent = (key: string) => {
    return config?.siteContent && typeof config.siteContent === 'object' && key in config.siteContent
      ? (config.siteContent as any)[key]
      : null;
  };

  const getSampleVideos = () => {
    return config?.sampleVideos && Array.isArray(config.sampleVideos) ? config.sampleVideos : [];
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fire particles background */}
      <div className="fire-particles fixed inset-0 pointer-events-none">
        <div className="fire-particle" style={{ left: '10%', animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="fire-particle" style={{ left: '20%', animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="fire-particle" style={{ left: '30%', animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="fire-particle" style={{ left: '70%', animationDelay: '3s', animationDuration: '4.5s' }}></div>
        <div className="fire-particle" style={{ left: '80%', animationDelay: '4s', animationDuration: '5.5s' }}></div>
        <div className="fire-particle" style={{ left: '90%', animationDelay: '5s', animationDuration: '4.2s' }}></div>
      </div>

      {/* Custom background image if set */}
      {config?.siteContent && 'backgroundImageUrl' in config.siteContent && config.siteContent.backgroundImageUrl && (
        <div 
          className="fixed inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.siteContent.backgroundImageUrl})` }}
        ></div>
      )}

      {/* Simple Header */}
      <header className="relative z-10 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-4 cursor-pointer"
              data-testid="logo-videoventa"
            >
              {config?.siteContent?.logoUrl ? (
                <img 
                  src={config.siteContent.logoUrl} 
                  alt="Logo" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="fire-gradient w-12 h-12 rounded-lg flex items-center justify-center">
                  <Video className="text-white" size={24} />
                </div>
              )}
              <span className="text-3xl font-bold fire-text">{config?.businessName || 'VideoVenta'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 animate-fire-flicker">
              <span className="fire-text">{config?.siteContent?.heroTitle?.split(' ').slice(0, 2).join(' ') || 'Producción de'}</span>
              <br />
              <span className="text-white">{config?.siteContent?.heroTitle?.split(' ').slice(2).join(' ') || 'Videos Profesionales'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              {config?.siteContent?.heroDescription || 'Creamos contenido audiovisual de alta calidad que impulsa tu marca. Desde videos corporativos hasta campañas promocionales completas.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => scrollToSection('calculator')} 
                className="fire-gradient text-white px-8 py-4 text-lg font-semibold hover:opacity-90 fire-shadow animate-glow-pulse"
                data-testid="button-calculate-price"
              >
                <span className="mr-2">🧮</span>
                Calcular Precio
              </Button>
              <Button 
                onClick={handleWhatsAppContact}
                variant="outline"
                className="border-2 border-primary text-primary px-8 py-4 text-lg font-semibold hover:bg-primary hover:text-white transition-all"
                data-testid="button-whatsapp-contact"
              >
                <Phone className="mr-2" size={20} />
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Videos Section - Simplified */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="fire-text">Nuestros Videos</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {config?.sampleVideos?.slice(0, 3).map((video: any, index: number) => (
              <Card key={video.id || index} className="glass-card fire-border hover:scale-105 transition-transform overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-red-900/50 to-orange-900/50 relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                    data-testid={`img-sample-video-${index}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-300">{video.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Price Calculator Section - Simplified */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-red-900/10 to-yellow-900/10"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="fire-text">{config?.siteContent?.calculatorTitle || 'Calculadora de Precios'}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {config?.siteContent?.calculatorDescription || 'Obtén una cotización instantánea personalizada para tu proyecto'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="glass-card fire-border p-8">
              <PriceCalculator />
            </Card>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 {config?.businessName || 'VideoVenta'}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS */}
      {config?.siteContent?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: config.siteContent.customCSS }} />
      )}

      {/* Admin Authentication Modal */}
      {showAdminAuth && (
        <AdminAuth onClose={() => setShowAdminAuth(false)} />
      )}
    </div>
  );
}