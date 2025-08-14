-- Promote Alexandre to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'alexandre@chromotech.com.br';