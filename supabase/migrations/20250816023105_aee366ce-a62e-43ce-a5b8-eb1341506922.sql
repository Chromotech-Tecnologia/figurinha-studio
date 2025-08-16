-- Add quantity field to sticker_packs and remove payment_link from creation
ALTER TABLE public.sticker_packs 
ADD COLUMN quantity INTEGER DEFAULT 1;

-- Remove payment_link from pack creation (will be added during order approval)
-- Keep the column but it will only be filled when admin approves orders

-- Create storage bucket for pack images
INSERT INTO storage.buckets (id, name, public) VALUES ('pack-images', 'pack-images', true);

-- Create storage policies for pack images
CREATE POLICY "Admins can upload pack images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pack-images' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Anyone can view pack images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pack-images');