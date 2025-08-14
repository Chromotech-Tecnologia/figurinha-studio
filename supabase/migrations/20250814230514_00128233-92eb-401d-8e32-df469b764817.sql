-- Add payment link and file upload fields to sticker_packs
ALTER TABLE public.sticker_packs 
ADD COLUMN payment_link TEXT,
ADD COLUMN sticker_files_url TEXT;

-- Update orders table to include customer info and approval workflow
ALTER TABLE public.orders 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN customer_email TEXT,
ADD COLUMN admin_approved BOOLEAN DEFAULT false,
ADD COLUMN approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Create order_items if needed to link orders and packs
ALTER TABLE public.order_items 
ADD COLUMN sticker_pack_name TEXT,
ADD COLUMN sticker_pack_image_url TEXT;