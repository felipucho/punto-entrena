-- Deshacer desde "Últimos cambios": cada fila guarda qué versión (sha del blob de Git) tenía cada archivo antes y
-- después del cambio. Deshacer vuelve a la de antes, solo si los archivos siguen como quedaron (nadie los tocó después).
alter table public.historial
  add column huella jsonb,
  add column deshecho_el timestamptz;
