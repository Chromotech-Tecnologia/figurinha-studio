-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Criar tabela de relacionamento pack_categories (muitos para muitos)
CREATE TABLE public.pack_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES public.sticker_packs(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pack_id, category_id)
);

-- Habilitar RLS
ALTER TABLE public.pack_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pack_categories
CREATE POLICY "Anyone can view pack categories" 
ON public.pack_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage pack categories" 
ON public.pack_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Inserir categorias padrão baseadas nos dados existentes
INSERT INTO public.categories (name, description, color) VALUES
('Emojis', 'Emojis divertidos e expressivos', '#f59e0b'),
('Animais', 'Figurinhas de animais fofos', '#10b981'),
('Memes', 'Memes engraçados e virais', '#ef4444'),
('Romântico', 'Figurinhas românticas e de amor', '#ec4899'),
('Comida', 'Figurinhas de comidas deliciosas', '#f97316'),
('Diversos', 'Outras categorias', '#8b5cf6');

-- Migrar dados existentes da coluna category para a nova estrutura
INSERT INTO public.pack_categories (pack_id, category_id)
SELECT 
  sp.id,
  c.id
FROM public.sticker_packs sp
JOIN public.categories c ON LOWER(c.name) = LOWER(sp.category)
WHERE sp.category IS NOT NULL;

-- Criar trigger para atualizar updated_at nas categorias
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();