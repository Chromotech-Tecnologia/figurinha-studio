import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";

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

export const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product.id, product.name, product.price, product.image);
    onClose();
  };

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
          {/* Imagem em tamanho grande */}
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full max-h-96 object-cover rounded-lg"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.isNew && <Badge className="bg-accent text-accent-foreground">Novo</Badge>}
            </div>
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