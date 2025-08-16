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
  quantity: number;
  is_new: boolean;
}

interface ProductGridProps {
  selectedCategory: string;
}

// Mock data - fallback when no products in database
const mockProducts: StickerPack[] = [
  {
    id: "1",
    name: "Pack Emojis Clássicos",
    image_url: emojiPack,
    price: 9.99,
    category: "Emojis",
    quantity: 50,
    is_new: true,
  },
  {
    id: "2", 
    name: "Animais Fofos",
    image_url: animalsPack,
    price: 12.99,
    category: "Animais",
    quantity: 35,
    is_new: false,
  },
  {
    id: "3",
    name: "Memes Brasileiros",
    image_url: memesPack, 
    price: 15.99,
    category: "Memes",
    quantity: 42,
    is_new: true,
  },
  {
    id: "4",
    name: "Pack Romântico",
    image_url: lovePack,
    price: 8.99,
    category: "Amor",
    quantity: 28,
    is_new: false,
  },
  {
    id: "5",
    name: "Comidas Deliciosas", 
    image_url: emojiPack,
    price: 11.99,
    category: "Comida",
    quantity: 33,
    is_new: false,
  },
  {
    id: "6",
    name: "Esportes Brasil",
    image_url: animalsPack,
    price: 13.99,
    category: "Esportes", 
    quantity: 25,
    is_new: true,
  }
];

export const ProductGrid = ({ selectedCategory }: ProductGridProps) => {
  const [allProducts, setAllProducts] = useState<StickerPack[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, allProducts]);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('sticker_packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setAllProducts(data);
    } else {
      // Use mock data if no products in database
      setAllProducts(mockProducts);
    }
    setLoading(false);
  };

  const filterProducts = () => {
    if (selectedCategory === "all") {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => 
        product.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
      setFilteredProducts(filtered);
    }
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
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                name={product.name}
                image={product.image_url || emojiPack}
                price={parseFloat(product.price.toString())}
                category={product.category}
                quantity={product.quantity || 1}
                isNew={product.is_new}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhum produto encontrado nesta categoria
            </div>
          )}
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