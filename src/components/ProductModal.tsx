import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    category: string;
    quantity?: number;
    isNew?: boolean;
    description?: string;
  } | null;
}

interface PackImage {
  id: string;
  image_url: string;
  display_order: number;
}

export const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const { addToCart } = useCart();
  const [galleryImages, setGalleryImages] = useState<PackImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create combined images array (cover + gallery)
  const allImages = product ? [
    { id: 'cover', image_url: product.image, display_order: -1 },
    ...galleryImages
  ] : [];

  useEffect(() => {
    if (isOpen && product) {
      fetchGalleryImages();
      setCurrentImageIndex(0);
      setIsZoomed(false);
    }
  }, [isOpen, product]);

  const fetchGalleryImages = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pack_images')
        .select('*')
        .eq('pack_id', product.id)
        .order('display_order');

      if (!error && data) {
        setGalleryImages(data);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, product.name, product.price, product.image);
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            {/* Imagem Principal */}
            <div className="relative group">
              <img 
                src={allImages[currentImageIndex]?.image_url || product.image} 
                alt={product.name}
                className={`w-full max-h-96 object-cover rounded-lg cursor-pointer transition-transform ${
                  isZoomed ? 'scale-150 origin-center' : 'hover:scale-105'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              
              {/* Zoom Icon */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.isNew && <Badge className="bg-accent text-accent-foreground">Novo</Badge>}
              </div>
            </div>

            {/* Thumbnails Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => selectImage(index)}
                    className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`${product.name} - ${index === 0 ? 'Capa' : `Imagem ${index}`}`}
                      className="w-16 h-16 object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-xs text-white font-medium bg-black/50 px-1 rounded">
                          Capa
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do produto */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-muted-foreground">{product.quantity} figurinhas</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {product.description && (
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            <Button 
              onClick={handleAddToCart}
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Adicionar ao Carrinho - R$ {product.price.toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};