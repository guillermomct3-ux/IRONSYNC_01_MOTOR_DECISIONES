-- IRONSYNC Schema v1

CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  admin_telefono TEXT NOT NULL,
  admin_nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  rol TEXT CHECK (rol IN (''admin'', ''operador'')) NOT NULL,
  pin TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  alias TEXT,
  codigo TEXT NOT NULL,
  marca TEXT DEFAULT ''Caterpillar'',
  modelo TEXT,
  serie TEXT,
  tipo TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asignaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  operador_id UUID REFERENCES usuarios(id),
  equipo_id UUID REFERENCES equipos(id),
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sesiones (
  telefono TEXT PRIMARY KEY,
  flujo TEXT,
  paso TEXT,
  datos JSONB DEFAULT ''{}'',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  clave TEXT PRIMARY KEY,
  intentos INTEGER DEFAULT 1,
  ultimo_intento TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID,
  operador_id UUID,
  equipo_id UUID,
  folio TEXT UNIQUE,
  maquina TEXT,
  serie TEXT,
  inicio TIMESTAMPTZ,
  fin TIMESTAMPTZ,
  horometro_inicio DECIMAL,
  horometro_fin DECIMAL,
  horas_horometro DECIMAL,
  operador_telefono TEXT,
  operador_nombre TEXT,
  fecha_turno DATE,
  observaciones TEXT,
  cliente_nombre TEXT,
  contrato_id TEXT,
  foto_inicio_url TEXT,
  foto_fin_url TEXT,
  sin_foto_inicio BOOLEAN DEFAULT FALSE,
  sin_foto_fin BOOLEAN DEFAULT FALSE,
  firma_residente_status TEXT DEFAULT ''pendiente'',
  estado TEXT DEFAULT ''abierto'',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turno_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id UUID REFERENCES turnos(id),
  tipo_evento TEXT,
  motivo_reportado TEXT,
  timestamp_inicio TIMESTAMPTZ,
  timestamp_fin TIMESTAMPTZ,
  duracion_min INTEGER,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_telefono ON usuarios(telefono);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_equipos_empresa ON equipos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_operador ON asignaciones(operador_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_equipo ON asignaciones(equipo_id);
CREATE INDEX IF NOT EXISTS idx_turnos_operador ON turnos(operador_id);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_folio ON turnos(folio);
CREATE INDEX IF NOT EXISTS idx_sesiones_updated ON sesiones(updated_at);
