import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Get all sticker packs with their categories and quantities
      const { data: packs, error } = await supabase
        .from('sticker_packs')
        .select('category, quantity');

      if (error) throw error;

      // Count packs and total stickers by category
      const categoryMap = new Map<string, { count: number; totalStickers: number }>();
      let totalPacks = 0;
      let totalStickers = 0;

      packs?.forEach(pack => {
        const category = pack.category;
        const quantity = pack.quantity || 1;
        
        totalPacks++;
        totalStickers += quantity;

        if (categoryMap.has(category)) {
          const existing = categoryMap.get(category)!;
          categoryMap.set(category, {
            count: existing.count + 1,
            totalStickers: existing.totalStickers + quantity
          });
        } else {
          categoryMap.set(category, {
            count: 1,
            totalStickers: quantity
          });
        }
      });

      // Create categories array
      const categoryList: Category[] = [
        { id: "all", name: "Todas", count: totalStickers }
      ];

      categoryMap.forEach((data, categoryName) => {
        categoryList.push({
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName,
          count: data.totalStickers
        });
      });

      setCategories(categoryList);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories([
        { id: "all", name: "Todas", count: 0 },
        { id: "emojis", name: "Emojis", count: 0 },
        { id: "animais", name: "Animais", count: 0 },
        { id: "memes", name: "Memes", count: 0 },
        { id: "amor", name: "Amor", count: 0 },
      ]);
    }
  };

  return (
    <div className="bg-card border-b shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="transition-all duration-200 hover:shadow-soft"
              onClick={() => onCategoryChange(category.id)}
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