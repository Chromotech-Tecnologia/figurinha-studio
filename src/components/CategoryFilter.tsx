import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const categories = [
  { id: "all", name: "Todas", count: 1547 },
  { id: "emoji", name: "Emojis", count: 324 },
  { id: "animals", name: "Animais", count: 256 },
  { id: "memes", name: "Memes", count: 189 },
  { id: "love", name: "Amor", count: 142 },
  { id: "food", name: "Comida", count: 98 },
  { id: "sports", name: "Esportes", count: 76 },
  { id: "work", name: "Trabalho", count: 54 },
];

export const CategoryFilter = () => {
  return (
    <div className="bg-card border-b shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={category.id === "all" ? "default" : "outline"}
              size="sm"
              className="transition-all duration-200 hover:shadow-soft"
            >
              {category.name}
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs bg-muted"
              >
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};