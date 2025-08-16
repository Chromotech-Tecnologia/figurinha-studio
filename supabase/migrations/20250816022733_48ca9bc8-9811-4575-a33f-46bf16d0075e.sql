-- Create storage bucket for sticker files
INSERT INTO storage.buckets (id, name, public) VALUES ('sticker-files', 'sticker-files', false);

-- Create storage policies for sticker files
CREATE POLICY "Admins can upload sticker files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'sticker-files' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can view sticker files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sticker-files' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can download purchased sticker files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sticker-files' AND EXISTS (
  SELECT 1 FROM public.orders o
  JOIN public.order_items oi ON o.id = oi.order_id
  WHERE o.user_id = auth.uid() AND o.status = 'paid'
));