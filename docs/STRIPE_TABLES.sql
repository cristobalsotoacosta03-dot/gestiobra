-- ══════════════════════════════════════════════════════════════════════════════════
-- GestiObra - Tablas para Stripe (Suscripciones)
-- Ejecutar en la consola SQL de Supabase
-- ══════════════════════════════════════════════════════════════════════════════════

-- 1. TABLA: customers (Clientes de Stripe)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. TABLA: subscriptions (Suscripciones)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: plans (Planes de suscripción)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insertar planes por defecto
INSERT INTO plans (id, name, price, interval, features, limits) VALUES
  ('basic', 'Basic', 49, 'month', 
   '["3 usuarios", "5 obras activas", "Calculadoras básicas (ACS, GLP)", "Biblia técnica", "Soporte por email"]',
   '{"users": 3, "projects": 5}'),
  ('pro', 'Pro', 99, 'month',
   '["10 usuarios", "20 obras activas", "Todas las calculadoras", "Biblia técnica completa", "Gestión de materiales", "Exportación de cálculos", "Soporte prioritario"]',
   '{"users": 10, "projects": 20}'),
  ('enterprise', 'Enterprise', 249, 'month',
   '["Usuarios ilimitados", "Obras ilimitadas", "Todas las funcionalidades", "API access", "Soporte 24/7", "Formación personalizada", "SLA garantizado"]',
   '{"users": -1, "projects": -1}')
ON CONFLICT (id) DO NOTHING;

-- 5. Índices para optimización
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(active);

-- 6. Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS

-- Customers: Solo el usuario puede ver/editar su propio customer
CREATE POLICY "customers_own" ON customers FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "customers_insert" ON customers FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

-- Subscriptions: Solo el usuario puede ver su propia suscripción
CREATE POLICY "subscriptions_own" ON subscriptions FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM usuarios 
      WHERE auth_id = auth.uid()
    )
  );

-- Plans: Todos pueden ver los planes activos
CREATE POLICY "plans_read_active" ON plans FOR SELECT
  USING (active = true);

-- 8. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Verificación
-- Ejecutar estas consultas para verificar que todo está correcto:

-- Ver planes insertados
-- SELECT * FROM plans;

-- Verificar RLS activo
-- SELECT schemaname, tablename, rowsecurity as rls_enabled
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- AND tablename IN ('customers', 'subscriptions', 'plans');

-- Ver políticas creadas
-- SELECT policyname, tablename, cmd, permissive
-- FROM pg_policies
-- WHERE tablename IN ('customers', 'subscriptions', 'plans');