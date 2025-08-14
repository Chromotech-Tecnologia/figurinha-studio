import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-stickers.jpg";

export const Hero = () => {
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
            <Button variant="hero" size="lg" className="text-lg px-8">
              Ver Catálogo
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="premium" size="lg" className="text-lg px-8">
              Personalizar Figurinha
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};