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
      // Get categories from database with pack counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          color,
          pack_categories!inner(
            pack_id,
            sticker_packs!inner(
              quantity
            )
          )
        `);

      if (categoriesError) throw categoriesError;

      // Calculate totals
      let totalStickers = 0;
      const categoryList: Category[] = [];

      // Get all packs to calculate total
      const { data: allPacks } = await supabase
        .from('sticker_packs')
        .select('quantity');
      
      if (allPacks) {
        totalStickers = allPacks.reduce((sum, pack) => sum + (pack.quantity || 1), 0);
      }

      // Add "All" category
      categoryList.push({
        id: "all",
        name: "Todas",
        count: totalStickers
      });

      // Process each category
      categoriesData?.forEach(category => {
        const categoryStickers = category.pack_categories?.reduce((sum, pc: any) => {
          return sum + (pc.sticker_packs?.quantity || 1);
        }, 0) || 0;

        categoryList.push({
          id: category.id,
          name: category.name,
          count: categoryStickers
        });
      });

      setCategories(categoryList);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories([
        { id: "all", name: "Todas", count: 0 },
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