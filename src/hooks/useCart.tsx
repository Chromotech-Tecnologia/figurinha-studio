import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CartItem {
  id: string;
  pack_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (packId: string, name: string, price: number, imageUrl: string) => Promise<void>;
  removeFromCart: (packId: string) => Promise<void>;
  updateQuantity: (packId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        pack_id,
        quantity,
        sticker_packs (
          name,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cart:', error);
    } else {
      const cartItems = data?.map((item: any) => ({
        id: item.id,
        pack_id: item.pack_id,
        name: item.sticker_packs.name,
        price: parseFloat(item.sticker_packs.price),
        image_url: item.sticker_packs.image_url,
        quantity: item.quantity,
      })) || [];
      setItems(cartItems);
    }
    setLoading(false);
  };

  const addToCart = async (packId: string, name: string, price: number, imageUrl: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar items ao carrinho",
        variant: "destructive",
      });
      return;
    }

    const existingItem = items.find(item => item.pack_id === packId);
    
    if (existingItem) {
      await updateQuantity(packId, existingItem.quantity + 1);
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          pack_id: packId,
          quantity: 1,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar ao carrinho",
          variant: "destructive",
        });
      } else {
        const newItem: CartItem = {
          id: data.id,
          pack_id: packId,
          name,
          price,
          image_url: imageUrl,
          quantity: 1,
        };
        setItems(prev => [...prev, newItem]);
        toast({
          title: "Adicionado ao carrinho!",
          description: `${name} foi adicionado ao seu carrinho`,
        });
      }
    }
  };

  const removeFromCart = async (packId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('pack_id', packId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item",
        variant: "destructive",
      });
    } else {
      setItems(prev => prev.filter(item => item.pack_id !== packId));
      toast({
        title: "Item removido",
        description: "Item removido do carrinho",
      });
    }
  };

  const updateQuantity = async (packId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('pack_id', packId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade",
        variant: "destructive",
      });
    } else {
      setItems(prev => 
        prev.map(item => 
          item.pack_id === packId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setItems([]);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};