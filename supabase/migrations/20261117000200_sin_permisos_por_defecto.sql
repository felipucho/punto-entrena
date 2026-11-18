-- Supabase les da a anon y authenticated acceso a todo lo nuevo que se cree en public. Una tabla futura sin
-- "enable row level security" + revoke quedaría legible con la clave pública. Esto lo corta para lo que se cree
-- de acá en adelante; lo que necesite acceso público se habilita a mano, como ping().
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated, public;
