-- 1) Fix orders status CHECK constraint to include 'paid'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (status IN ('pending','paid','approved','cancelled'));

-- 2) Add WhatsApp request fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS whatsapp_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- 3) Function to safely request WhatsApp send by the customer
CREATE OR REPLACE FUNCTION public.request_order_whatsapp(p_order_id uuid, p_whatsapp_number text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET whatsapp_requested = true,
      whatsapp_number = p_whatsapp_number,
      updated_at = now()
  WHERE id = p_order_id AND user_id = auth.uid();
END;
$$;

-- Ensure authenticated users can execute the function
REVOKE ALL ON FUNCTION public.request_order_whatsapp(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_order_whatsapp(uuid, text) TO authenticated;