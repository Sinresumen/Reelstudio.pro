import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfig } from '@/contexts/ConfigContext';
import { Phone, Play, Sparkles, ArrowRight, Trophy, Star, Zap } from 'lucide-react';
import PriceCalculator from './PriceCalculator';
import { useLocation } from 'wouter';

export default function LandingPage() {
  const { config } = useConfig();
  const [, navigate] = useLocation();
  const [logoClickCount, setLogoClickCount] = React.useState(0);
  const [showAdminHint, setShowAdminHint] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsAppContact = () => {
    if (config?.whatsappNumber) {
      const message = "Hola, me interesa obtener más información sobre los servicios de producción de videos.";
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsappNumber.replace(/\s+/g, '')}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount === 5) {
      // Navigate to admin panel after 5 clicks
      navigate('/admin');
      setLogoClickCount(0);
    } else if (newCount >= 3) {
      // Show hint after 3 clicks
      setShowAdminHint(true);
      setTimeout(() => setShowAdminHint(false), 2000);
    }
    
    // Reset counter after 3 seconds of no clicks
    setTimeout(() => {
      setLogoClickCount(0);
      setShowAdminHint(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header con Logo clickeable para Admin */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleLogoClick}
              className="text-2xl font-bold fire-text cursor-pointer select-none"
              data-testid="logo-admin-access"
            >
              {(config as any)?.businessName || 'VideoVenta'}
            </button>
            <nav className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection('videos')}
              >
                Videos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection('calculator')}
              >
                Cotizar
              </Button>
              <Button
                size="sm"
                onClick={handleWhatsAppContact}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                <Phone className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Price Calculator Section - FIRST */}
      <section id="calculator" className="py-20 relative pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/5 to-red-900/5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Cotización Instantánea</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {(config as any)?.siteContent?.calculatorTitle || 'Calcula tu Inversión'}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {(config as any)?.siteContent?.calculatorDescription || 'Obtén un presupuesto instantáneo y transparente para tu proyecto de video'}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
              <PriceCalculator />
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Videos Section - SECOND */}
      <section id="videos" className="py-12 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Nuestro Trabajo
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Ejemplos de producciones que hemos realizado
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(config as any)?.sampleVideos?.map((video: any, index: number) => (
              <div
                key={video.id || index}
                className="group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`card-video-${index}`}
              >
                <Card className="overflow-hidden bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
                  {/* Video thumbnail with overlay */}
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 to-red-600/30 mix-blend-overlay"></div>
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                          <Play className="text-white w-8 h-8 ml-1" fill="white" />
                        </div>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
                        {video.category || 'Promocional'}
                      </span>
                    </div>

                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-900/50 to-red-900/50"></div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {video.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section with Animated Background - THIRD */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-red-900/10 to-background"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`,
          }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            >
              <div className="w-1 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-60"></div>
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="inline-block animate-text-gradient bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent animate-gradient" style={{ backgroundSize: '300%' }}>
                {(config as any)?.siteContent?.heroTitle || 'VideoVenta'}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {(config as any)?.siteContent?.heroDescription || 'Producción de videos profesionales para tu marca'}
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-scroll-down"></div>
          </div>
        </div>
      </section>

      {/* Indicadores al final */}
      <section className="py-12 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{(config as any)?.siteContent?.trustIndicators?.projects || '100+ Proyectos'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{(config as any)?.siteContent?.trustIndicators?.rating || '5.0 Calificación'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{(config as any)?.siteContent?.trustIndicators?.delivery || 'Entrega Rápida'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {(config as any)?.siteContent?.companyDescription || 'Producción de videos profesionales'}
            </p>
            {(config as any)?.siteContent?.contactEmail && (
              <p className="text-sm text-muted-foreground">
                Email: {(config as any).siteContent.contactEmail}
              </p>
            )}
            <div className="mt-6">
              <p className="text-sm text-muted-foreground/60">
                © 2025 Reelstudio.pro. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}