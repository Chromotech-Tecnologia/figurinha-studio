import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-stickers.jpg";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

export const Hero = () => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const scrollToProducts = () => {
    const productsSection = document.querySelector('[data-section="products"]');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="animate-bounce-soft mb-6">
            <Sparkles className="w-16 h-16 mx-auto text-accent" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">
            Figurinhas do WhatsApp
            <span className="block text-accent">Personalizadas</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fadeIn">
            Milhares de figurinhas incríveis para o seu WhatsApp. 
            Crie também figurinhas personalizadas com o seu logotipo!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn">
            <Button variant="hero" size="lg" className="text-lg px-8" onClick={scrollToProducts}>
              Ver Catálogo
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="premium" size="lg" className="text-lg px-8" onClick={() => setIsCustomizeModalOpen(true)}>
              Personalizar Figurinha
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Personalização */}
      <Dialog open={isCustomizeModalOpen} onOpenChange={setIsCustomizeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gradient-primary">
              Área de Personalização
            </DialogTitle>
            <DialogDescription className="text-lg mt-4">
              Estamos preparando uma área especial onde você poderá criar suas próprias figurinhas personalizadas com seu logotipo!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-6">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                🚀 Em breve você poderá:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>✨ Criar figurinhas com seu logotipo</li>
                <li>🎨 Escolher cores e estilos</li>
                <li>📱 Baixar diretamente para o WhatsApp</li>
              </ul>
            </div>
            <Button onClick={() => setIsCustomizeModalOpen(false)} className="w-full">
              Entendi, obrigado!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};