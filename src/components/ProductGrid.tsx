import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import emojiPack from "@/assets/emoji-pack.jpg";
import animalsPack from "@/assets/animals-pack.jpg"; 
import memesPack from "@/assets/memes-pack.jpg";
import lovePack from "@/assets/love-pack.jpg";

// Mock data - em uma aplicação real, isso viria de uma API
const products = [
  {
    id: "1",
    name: "Pack Emojis Clássicos",
    image: emojiPack,
    price: 9.99,
    category: "Emojis",
    isNew: true,
  },
  {
    id: "2", 
    name: "Animais Fofos",
    image: animalsPack,
    price: 12.99,
    category: "Animais",
    isNew: false,
  },
  {
    id: "3",
    name: "Memes Brasileiros",
    image: memesPack, 
    price: 15.99,
    category: "Memes",
    isNew: true,
  },
  {
    id: "4",
    name: "Pack Romântico",
    image: lovePack,
    price: 8.99,
    category: "Amor",
    isNew: false,
  },
  {
    id: "5",
    name: "Comidas Deliciosas", 
    image: emojiPack,
    price: 11.99,
    category: "Comida",
    isNew: false,
  },
  {
    id: "6",
    name: "Esportes Brasil",
    image: animalsPack,
    price: 13.99,
    category: "Esportes", 
    isNew: true,
  }
];

export const ProductGrid = () => {
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
            <ProductCard key={product.id} {...product} />
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