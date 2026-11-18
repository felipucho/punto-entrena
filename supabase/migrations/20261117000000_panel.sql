-- Panel de Punto (/panel): cuentas, intentos de entrada, sesiones e historial de cambios.
-- Solo las usa el servidor del panel con la clave secreta (service_role). RLS prendido y sin políticas: nadie más
-- (ni la clave pública ni un usuario de Supabase Auth) puede leer ni escribir nada.

create table public.usuarios (
  id bigint generated always as identity primary key,
  usuario text not null unique check (usuario ~ '^[a-z0-9._-]{3,32}$'),
  nombre text not null check (length(nombre) between 1 and 60),
  -- "scrypt$N$r$p$sal$hash" (base64url). Nunca la contraseña.
  clave_hash text not null,
  activo boolean not null default true,
  creado_el timestamptz not null default now()
);

-- Cada intento de entrar, bien o mal: de acá sale el bloqueo (5 fallidos por usuario o 20 por conexión en 15 minutos).
create table public.intentos (
  id bigint generated always as identity primary key,
  usuario text not null,
  ip text not null,
  exito boolean not null,
  creado_el timestamptz not null default now()
);

create index intentos_usuario_idx on public.intentos (usuario, creado_el desc);
create index intentos_ip_idx on public.intentos (ip, creado_el desc);

-- La cookie lleva un token al azar; acá se guarda solo su sha256. Borrar una fila cierra esa sesión.
create table public.sesiones (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  usuario_id bigint not null references public.usuarios (id) on delete cascade,
  vence_el timestamptz not null,
  creado_el timestamptz not null default now()
);

create index sesiones_usuario_idx on public.sesiones (usuario_id);

-- Quién cambió qué y cuándo.
create table public.historial (
  id bigint generated always as identity primary key,
  usuario_id bigint references public.usuarios (id) on delete set null,
  accion text not null,
  detalle text,
  creado_el timestamptz not null default now()
);

create index historial_creado_idx on public.historial (creado_el desc);

alter table public.usuarios enable row level security;
alter table public.intentos enable row level security;
alter table public.sesiones enable row level security;
alter table public.historial enable row level security;

revoke all on public.usuarios, public.intentos, public.sesiones, public.historial from anon, authenticated;
