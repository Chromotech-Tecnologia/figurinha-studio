-- Create pack_images table for multiple images per pack
CREATE TABLE public.pack_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES public.sticker_packs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pack_images ENABLE ROW LEVEL SECURITY;

-- Create policies for pack_images
CREATE POLICY "Pack images are viewable by everyone" 
ON public.pack_images 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage pack images" 
ON public.pack_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create index for better performance
CREATE INDEX idx_pack_images_pack_id ON public.pack_images(pack_id);
CREATE INDEX idx_pack_images_order ON public.pack_images(pack_id, display_order);