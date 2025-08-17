import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { ProductModal } from "./ProductModal";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  quantity?: number;
  isNew?: boolean;
  description?: string;
}

export const ProductCard = ({ id, name, image, price, category, quantity = 1, isNew, description }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = () => {
    addToCart(id, name, price, image);
  };

  const handleViewProduct = () => {
    setShowModal(true);
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-medium hover:-translate-y-1 bg-gradient-card">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-lg bg-muted">
          <img 
            src={image} 
            alt={name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button 
              variant="premium" 
              size="icon" 
              className="h-10 w-10"
              onClick={handleViewProduct}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="text-xs">{category}</Badge>
            {isNew && <Badge className="bg-accent text-accent-foreground">Novo</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{quantity} figurinhas</p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              R$ {price.toFixed(2)}
            </span>
            <Button variant="default" size="sm" className="gap-1" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4" />
              Comprar
            </Button>
          </div>
        </div>
      </CardContent>

      <ProductModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={{
          id,
          name,
          image,
          price,
          category,
          quantity,
          isNew,
          description
        }}
      />
    </Card>
  );
};