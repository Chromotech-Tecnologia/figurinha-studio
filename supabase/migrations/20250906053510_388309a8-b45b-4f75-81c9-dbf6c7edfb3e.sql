-- Adicionar campo deleted_at para soft delete de pedidos
ALTER TABLE public.orders ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Criar função para soft delete de pedidos
CREATE OR REPLACE FUNCTION public.soft_delete_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir pedidos';
  END IF;

  UPDATE public.orders
  SET deleted_at = now(),
      updated_at = now()
  WHERE id = p_order_id;
END;
$function$;

-- Criar função para restaurar pedidos
CREATE OR REPLACE FUNCTION public.restore_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem restaurar pedidos';
  END IF;

  UPDATE public.orders
  SET deleted_at = NULL,
      updated_at = now()
  WHERE id = p_order_id;
END;
$function$;