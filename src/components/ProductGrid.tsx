import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import emojiPack from "@/assets/emoji-pack.jpg";
import animalsPack from "@/assets/animals-pack.jpg"; 
import memesPack from "@/assets/memes-pack.jpg";
import lovePack from "@/assets/love-pack.jpg";

interface StickerPack {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  category: string;
  is_new: boolean;
}

// Mock data - fallback when no products in database
const mockProducts = [
  {
    id: "1",
    name: "Pack Emojis Clássicos",
    image_url: emojiPack,
    price: 9.99,
    category: "Emojis",
    is_new: true,
  },
  {
    id: "2", 
    name: "Animais Fofos",
    image_url: animalsPack,
    price: 12.99,
    category: "Animais",
    is_new: false,
  },
  {
    id: "3",
    name: "Memes Brasileiros",
    image_url: memesPack, 
    price: 15.99,
    category: "Memes",
    is_new: true,
  },
  {
    id: "4",
    name: "Pack Romântico",
    image_url: lovePack,
    price: 8.99,
    category: "Amor",
    is_new: false,
  },
  {
    id: "5",
    name: "Comidas Deliciosas", 
    image_url: emojiPack,
    price: 11.99,
    category: "Comida",
    is_new: false,
  },
  {
    id: "6",
    name: "Esportes Brasil",
    image_url: animalsPack,
    price: 13.99,
    category: "Esportes", 
    is_new: true,
  }
];

export const ProductGrid = () => {
  const [products, setProducts] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('sticker_packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setProducts(data);
    } else {
      // Use mock data if no products in database
      setProducts(mockProducts);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">Carregando produtos...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Figurinhas em Destaque
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubra nossa seleção especial de figurinhas para deixar suas conversas mais divertidas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              image={product.image_url || emojiPack}
              price={parseFloat(product.price.toString())}
              category={product.category}
              isNew={product.is_new}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Ver Mais Produtos
          </Button>
        </div>
      </div>
    </section>
  );
};