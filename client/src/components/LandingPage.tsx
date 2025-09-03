import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/contexts/ConfigContext';
import { useLocation } from 'wouter';
import PriceCalculator from './PriceCalculator';
import AdminAuth from './AdminAuth';
import { Video, Phone, Mail, Clock, Users, CheckCircle, Play } from 'lucide-react';

export default function LandingPage() {
  const { config } = useConfig();
  const [, setLocation] = useLocation();
  const [showAdminAuth, setShowAdminAuth] = React.useState(false);

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

  const sampleVideos = config?.sampleVideos || [];

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

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="fire-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                <Video className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold fire-text">VideoVenta</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')} 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-home"
              >
                Inicio
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-services"
              >
                Servicios
              </button>
              <button 
                onClick={() => scrollToSection('calculator')} 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-calculator"
              >
                Calculadora
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-contact"
              >
                Contacto
              </button>
              <Button 
                onClick={() => setShowAdminAuth(true)} 
                className="fire-gradient text-white font-semibold hover:opacity-90"
                data-testid="button-admin"
              >
                Admin
              </Button>
            </nav>
            <Button className="md:hidden fire-gradient text-white p-2" data-testid="button-mobile-menu">
              <span className="sr-only">Menu</span>
              ☰
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20"></div>
        <div 
          className="absolute inset-0 opacity-30" 
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
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
                {config?.whatsappNumber || '+52 55 1234 5678'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Videos Section */}
      <section id="services" className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="fire-text">Videos de Muestra</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explora nuestros diferentes estilos y especialidades en producción audiovisual
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sampleVideos.map((video: any, index: number) => (
              <Card key={video.id || index} className="glass-card fire-border hover:scale-105 transition-transform overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-red-900/50 to-orange-900/50 relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                    style={{ maxWidth: '300px' }}
                    data-testid={`img-sample-video-${index}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-300">{video.description}</p>
                  </div>
                  <Button 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 fire-gradient w-16 h-16 rounded-full text-white hover:scale-110 transition-transform"
                    data-testid={`button-play-video-${index}`}
                  >
                    <Play size={24} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Price Calculator Section */}
      <section id="calculator" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-red-900/10 to-yellow-900/10"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="fire-text">Calculadora de Precios</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Obtén una cotización instantánea personalizada para tu proyecto
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="glass-card fire-border p-8">
              <PriceCalculator />
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="fire-text">Contáctanos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ¿Listo para llevar tu proyecto al siguiente nivel? Contáctanos hoy mismo
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
            <Card className="glass-card fire-border p-8">
              <h3 className="text-xl font-bold mb-6 fire-text">Formulario de Contacto</h3>
              <form className="space-y-4" data-testid="form-contact">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Tu nombre" 
                    className="bg-input border-border focus:border-primary"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    className="bg-input border-border focus:border-primary"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+52 55 1234 5678" 
                    className="bg-input border-border focus:border-primary"
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    rows={4} 
                    placeholder="Describe tu proyecto..." 
                    className="bg-input border-border focus:border-primary"
                    data-testid="textarea-message"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full fire-gradient text-white font-semibold hover:opacity-90"
                  data-testid="button-submit-contact"
                >
                  Enviar Mensaje
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="glass-card fire-border p-8">
                <h3 className="text-xl font-bold mb-6 fire-text">Información de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3" data-testid="contact-whatsapp">
                    <div className="fire-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                      <Phone className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="font-medium">WhatsApp</div>
                      <div className="text-muted-foreground">{config?.whatsappNumber || '+52 55 1234 5678'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3" data-testid="contact-email">
                    <div className="fire-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                      <Mail className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">{config?.siteContent?.contactEmail || 'info@videoventa.com'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3" data-testid="contact-hours">
                    <div className="fire-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                      <Clock className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="font-medium">Horario</div>
                      <div className="text-muted-foreground">Lun - Vie: 9:00 - 18:00</div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="glass-card fire-border p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20"></div>
                <div className="relative">
                  <h3 className="text-xl font-bold mb-4 fire-text">¿Por qué elegir VideoVenta?</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center" data-testid="feature-delivery">
                      <CheckCircle className="text-primary mr-2" size={16} />
                      Entrega garantizada en tiempo
                    </li>
                    <li className="flex items-center" data-testid="feature-revisions">
                      <CheckCircle className="text-primary mr-2" size={16} />
                      Revisiones ilimitadas
                    </li>
                    <li className="flex items-center" data-testid="feature-quality">
                      <CheckCircle className="text-primary mr-2" size={16} />
                      Calidad 4K profesional
                    </li>
                    <li className="flex items-center" data-testid="feature-support">
                      <CheckCircle className="text-primary mr-2" size={16} />
                      Soporte 24/7
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="fire-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                  <Video className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold fire-text">VideoVenta</span>
              </div>
              <p className="text-muted-foreground">
                {config?.siteContent?.companyDescription || 'Creamos contenido audiovisual profesional que impulsa tu marca y conecta con tu audiencia.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Videos Corporativos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Videos Promocionales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Videos Explicativos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Videos Cantados</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Portafolio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Testimonios</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <Phone className="mr-2" size={16} />
                  <span>{config?.whatsappNumber || '+52 55 1234 5678'}</span>
                </li>
                <li className="flex items-center">
                  <Mail className="mr-2" size={16} />
                  {config?.siteContent?.contactEmail || 'info@videoventa.com'}
                </li>
                <li className="flex items-center">
                  <Clock className="mr-2" size={16} />
                  Lun - Vie: 9:00 - 18:00
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 VideoVenta. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Admin Authentication Modal */}
      {showAdminAuth && (
        <AdminAuth onClose={() => setShowAdminAuth(false)} />
      )}
    </div>
  );
}
