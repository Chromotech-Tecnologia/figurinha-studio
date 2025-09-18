import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import logoImage from "@/assets/figurinha-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={logoImage} alt="Figurinha Studio" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold text-primary">Figurinha Studio</h3>
            </div>
            <p className="text-muted-foreground">
              A maior loja de figurinhas do WhatsApp do Brasil. 
              Milhares de opções e personalização exclusiva.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Categorias</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Emojis</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Animais</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Memes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Romântico</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Comida</a></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Ajuda</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Como Comprar</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Personalização</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Suporte</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contato@figurinhastudio.com</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground">
          <p>&copy; 2024 Figurinha Studio. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};