-- ══════════════════════════════════════════════════════════════════════════════════
-- GestiObra — Esquema de Base de Datos Completo
-- Ejecutar en la consola SQL de Supabase
-- ══════════════════════════════════════════════════════════════════════════════════

-- 1. EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════════════════════════════
-- 2. TABLA: Empresas (propietarias de las obras)
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  cif TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  cp TEXT,
  pais TEXT DEFAULT 'España',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 3. TABLA: Roles y Permisos
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  permisos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion, permisos) VALUES
  ('Admin', 'Administrador del sistema', '["*"]'),
  ('Jefe de Obra', 'Jefe de obra con acceso a presupuestos y personal', '["presupuestos:read", "presupuestos:write", "materiales:read", "personal:manage", "horas:read", "documentacion:manage", "planos:read"]'),
  ('Operario', 'Operario de obra con acceso limitado a móvil', '["horas:write", "planos:read", "tareas:read"]')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════════
-- 4. TABLA: Usuarios
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  rol_id UUID NOT NULL REFERENCES roles(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_id, empresa_id)
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 5. TABLA: Catálogo de Materiales
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS materiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('Gas', 'Calefacción', 'PCI', 'Fontanería', 'Albañilería', 'Diversos')),
  subcategoria TEXT,
  unidad_medida TEXT NOT NULL DEFAULT 'ud',
  precio_coste DECIMAL(12, 2) NOT NULL,
  precio_venta DECIMAL(12, 2) NOT NULL,
  margen_comercial DECIMAL(5, 2) DEFAULT 0,
  stock_actual INTEGER DEFAULT 0,
  referencia_cype TEXT,
  referencia_externa TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 6. TABLA: Perfiles Profesionales (Oficiales, Peones, etc.)
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS perfiles_profesionales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo_perfil TEXT NOT NULL CHECK (tipo_perfil IN ('Oficial', 'Peón', 'Especialista', 'Encargado')),
  coste_horario_empresa DECIMAL(10, 2) NOT NULL,
  coste_horario_social DECIMAL(10, 2) NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, nombre)
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 7. TABLA: Personal (Operarios de la empresa)
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS personal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre_completo TEXT NOT NULL,
  dni TEXT NOT NULL,
  perfil_profesional_id UUID NOT NULL REFERENCES perfiles_profesionales(id),
  fecha_alta DATE DEFAULT CURRENT_DATE,
  fecha_baja DATE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, dni)
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 8. TABLA: Obras
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS obras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero_expediente TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo_obra TEXT NOT NULL CHECK (tipo_obra IN ('Red Gas', 'Caldera', 'PCI', 'Fontanería', 'Albañilería', 'Mixta')),
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  cp TEXT,
  provincia TEXT,
  cliente_nombre TEXT,
  cliente_contacto TEXT,
  cliente_telefono TEXT,
  jefe_obra_id UUID REFERENCES personal(id) ON DELETE SET NULL,
  fecha_inicio DATE,
  fecha_prevista_fin DATE,
  fecha_fin_real DATE,
  presupuesto_total DECIMAL(14, 2) DEFAULT 0,
  gasto_actual DECIMAL(14, 2) DEFAULT 0,
  estado TEXT DEFAULT 'Planificación' CHECK (estado IN ('Planificación', 'En ejecución', 'Parada', 'Finalizada', 'Archivada')),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, numero_expediente)
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 9. TABLA: Partidas de Presupuesto
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS partidas_presupuesto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  numero_partida TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  unidad_medida TEXT NOT NULL,
  cantidad DECIMAL(12, 4) NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  precio_total DECIMAL(14, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  categoria TEXT NOT NULL,
  tipo_partida TEXT CHECK (tipo_partida IN ('Material', 'Mano de Obra', 'Subcontrata', 'Mixto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(obra_id, numero_partida)
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 10. TABLA: Líneas de Materiales en Partidas
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS partida_materiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partida_id UUID NOT NULL REFERENCES partidas_presupuesto(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materiales(id),
  cantidad DECIMAL(12, 4) NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  precio_total DECIMAL(14, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 11. TABLA: Imputación de Horas de Mano de Obra
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS imputacion_horas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  partida_id UUID REFERENCES partidas_presupuesto(id) ON DELETE SET NULL,
  personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  fecha_imputacion DATE NOT NULL,
  horas_trabajadas DECIMAL(5, 2) NOT NULL,
  descripcion_tarea TEXT,
  observaciones TEXT,
  estado TEXT DEFAULT 'Registrada' CHECK (estado IN ('Borrador', 'Registrada', 'Validada', 'Facturada')),
  coste_total DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 12. TABLA: Documentación Técnica
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS documentacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('Plano', 'Certificado', 'Boletín', 'Inspección', 'Autorización', 'Otro')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  archivo_url TEXT,
  archivo_nombre TEXT,
  fecha_documento DATE,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En trámite', 'Obtenido', 'Rechazado', 'Archivado')),
  usuario_responsable_id UUID REFERENCES usuarios(id),
  fecha_limite DATE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 13. TABLA: Auditoría de Cambios
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  tabla_afectada TEXT NOT NULL,
  registro_id UUID NOT NULL,
  operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  razon_cambio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════════
-- 14. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ══════════════════════════════════════════════════════════════════════════════════

-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas_presupuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE partida_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE imputacion_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- ──── POLÍTICAS PARA: empresas ────
CREATE POLICY "empresas_own" ON empresas FOR SELECT
  USING (
    id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "empresas_insert" ON empresas FOR INSERT
  WITH CHECK (true);

-- ──── POLÍTICAS PARA: usuarios ────
CREATE POLICY "usuarios_read_own_company" ON usuarios FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "usuarios_insert" ON usuarios FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

-- ──── POLÍTICAS PARA: obras ────
CREATE POLICY "obras_read" ON obras FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "obras_insert" ON obras FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "obras_update" ON obras FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

-- ──── POLÍTICAS PARA: materiales ────
CREATE POLICY "materiales_read" ON materiales FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "materiales_insert" ON materiales FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

-- ──── POLÍTICAS PARA: personal ────
CREATE POLICY "personal_read" ON personal FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "personal_insert" ON personal FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

-- ──── POLÍTICAS PARA: partidas_presupuesto ────
CREATE POLICY "partidas_read" ON partidas_presupuesto FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM obras 
      WHERE empresa_id IN (
        SELECT empresa_id FROM usuarios 
        WHERE auth_id = auth.uid()
      )
    )
  );

-- ──── POLÍTICAS PARA: imputacion_horas ────
CREATE POLICY "imputacion_read" ON imputacion_horas FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM obras 
      WHERE empresa_id IN (
        SELECT empresa_id FROM usuarios 
        WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "imputacion_insert" ON imputacion_horas FOR INSERT
  WITH CHECK (
    obra_id IN (
      SELECT id FROM obras 
      WHERE empresa_id IN (
        SELECT empresa_id FROM usuarios 
        WHERE auth_id = auth.uid()
      )
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════════
-- 15. ÍNDICES PARA OPTIMIZACIÓN
-- ══════════════════════════════════════════════════════════════════════════════════
CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);
CREATE INDEX idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX idx_obras_empresa_id ON obras(empresa_id);
CREATE INDEX idx_obras_estado ON obras(estado);
CREATE INDEX idx_materiales_empresa_id ON materiales(empresa_id);
CREATE INDEX idx_materiales_categoria ON materiales(categoria);
CREATE INDEX idx_personal_empresa_id ON personal(empresa_id);
CREATE INDEX idx_imputacion_obra_id ON imputacion_horas(obra_id);
CREATE INDEX idx_imputacion_fecha ON imputacion_horas(fecha_imputacion);
CREATE INDEX idx_documentacion_obra_id ON documentacion(obra_id);
CREATE INDEX idx_documentacion_estado ON documentacion(estado);
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla_afectada);
CREATE INDEX idx_auditoria_created_at ON auditoria(created_at);
