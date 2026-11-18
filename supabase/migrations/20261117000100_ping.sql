-- Para el aviso diario de .github/workflows/supabase-despierto.yml (el plan gratis pausa la base a los 7 días sin uso).
-- Devuelve 1 y no toca ninguna tabla: se puede llamar con la clave pública sin exponer nada.
create function public.ping() returns integer
language sql
stable
security invoker
set search_path = ''
as $$ select 1 $$;

revoke all on function public.ping() from public;
grant execute on function public.ping() to anon;
