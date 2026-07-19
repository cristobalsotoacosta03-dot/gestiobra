# Seguridad y Row Level Security (RLS)

## Configuración de Seguridad en Supabase

---

## 1. Estado Actual de RLS

### ✅ Implementado

Todas las tablas tienen RLS activado:

```sql
-- Verificar estado de RLS
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public';
```

**Resultado esperado:** Todas las tablas tienen `rls_enabled = true`

### Políticas Implementadas

#### 1. Empresas
- **Lectura:** Solo usuarios de la misma empresa
- **Inserción:** Permitida (para registro inicial)

#### 2. Usuarios
- **Lectura:** Solo usuarios de la misma empresa
- **Inserción:** Solo para la propia empresa

#### 3. Obras
- **Lectura:** Solo obras de la empresa del usuario
- **Inserción:** Solo para la propia empresa
- **Actualización:** Solo obras de la empresa del usuario

#### 4. Materiales
- **Lectura:** Solo materiales de la empresa del usuario
- **Inserción:** Solo para la propia empresa

#### 5. Personal
- **Lectura:** Solo personal de la empresa del usuario
- **Inserción:** Solo para la propia empresa

#### 6. Partidas de Presupuesto
- **Lectura:** Solo partidas de obras de la empresa del usuario

#### 7. Imputación de Horas
- **Lectura:** Solo imputaciones de obras de la empresa del usuario
- **Inserción:** Solo para obras de la empresa del usuario

---

## 2. Verificación de Políticas

### 2.1. Listar Todas las Políticas

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 2.2. Probar Políticas como Usuario

```sql
-- Simular sesión de usuario (reemplaza con tu auth.uid())
SET request.jwt.claims = '{"sub": "USER_AUTH_ID"}';

-- Verificar que solo ve sus obras
SELECT * FROM obras;

-- Debería retornar solo obras de tu empresa
```

### 2.3. Verificar Aislamiento Multi-Tenant

```sql
-- Crear dos empresas de prueba
INSERT INTO empresas (nombre, cif, email) VALUES 
  ('Empresa A', 'A12345678', 'empresa-a@test.com'),
  ('Empresa B', 'B12345678', 'empresa-b@test.com');

-- Crear usuarios en cada empresa
INSERT INTO usuarios (auth_id, empresa_id, nombre, email, rol_id) 
SELECT 
  '00000000-0000-0000-0000-000000000001',
  id,
  'Usuario A',
  'usuario-a@test.com',
  '00000000-0000-0000-0000-000000000002'
FROM empresas WHERE nombre = 'Empresa A';

-- Verificar aislamiento
SET request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001"}';
SELECT * FROM obras; -- Solo debería ver obras de Empresa A
```

---

## 3. Buenas Prácticas Implementadas

### 3.1. Principio de Mínimo Privilegio

- ✅ Los usuarios solo ven datos de su empresa
- ✅ No hay acceso cruzado entre empresas
- ✅ Service role key nunca se expone al cliente

### 3.2. Validación de Datos

- ✅ CHECK constraints en campos con valores específicos
- ✅ NOT NULL en campos obligatorios
- ✅ UNIQUE constraints para evitar duplicados
- ✅ FOREIGN KEY constraints para integridad referencial

### 3.3. Índices para Performance

```sql
-- Índices creados para optimizar consultas RLS
CREATE INDEX idx_obras_empresa_id ON obras(empresa_id);
CREATE INDEX idx_materiales_empresa_id ON materiales(empresa_id);
CREATE INDEX idx_personal_empresa_id ON personal(empresa_id);
CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);
```

---

## 4. Uso de Claves API

### 4.1. Anon/Public Key (Frontend)

```javascript
// ✅ CORRECTO: Expuesta en el frontend
const supabase = createClient(
  'https://szfikjyaktdpsimpqgxl.supabase.co',
  'sb_publishable_K85u06yzTpyDPfvts86mSQ_ewEzlF7b'
)
```

**Razón:** RLS protege los datos. La anon key solo permite operaciones permitidas por las políticas.

### 4.2. Service Role Key (Backend Only)

```javascript
// ❌ NUNCA hacer esto en el frontend
const supabaseAdmin = createClient(
  'https://szfikjyaktdpsimpqgxl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Service key
)
```

**Razón:** Esta clave bypasea RLS. Solo usarla en:
- API routes (Vercel/Netlify Functions)
- Edge functions de Supabase
- Scripts de backend

### 4.3. Variables de Entorno Seguras

```env
# ✅ Frontend (VITE_*)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# ✅ Backend (sin VITE_*)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 5. CORS Configuration

### 5.1. Configuración en Vercel

Crea `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://gestiobra.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 5.2. Configuración en Supabase

1. Ve a: https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/settings/api
2. En "URL Configuration", agrega:
   - `https://gestiobra.vercel.app`
   - `https://*.vercel.app` (preview deployments)

---

## 6. Stripe Webhook Security

### 6.1. Verificación de Firma (CRÍTICO)

```javascript
// api/stripe/webhook.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  try {
    // Verificar firma del webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    // Procesar evento
    await handleWebhookEvent(event)
    
    return Response.json({ received: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 })
  }
}
```

### 6.2. Eventos a Manejar

```javascript
async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      // Usuario completó el pago
      await activateSubscription(event.data.object)
      break
      
    case 'customer.subscription.deleted':
      // Usuario canceló suscripción
      await deactivateSubscription(event.data.object)
      break
      
    case 'invoice.payment_succeeded':
      // Pago exitoso
      await sendReceiptEmail(event.data.object)
      break
      
    case 'invoice.payment_failed':
      // Pago fallido
      await sendPaymentFailedEmail(event.data.object)
      break
  }
}
```

---

## 7. Rate Limiting

### 7.1. Middleware para API Routes

```javascript
// middleware.js
import { NextResponse } from 'next/server'

const rateLimit = new Map()

export function middleware(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for')
  const now = Date.now()
  
  // Limpiar entradas antiguas (> 1 minuto)
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.timestamp > 60000) {
      rateLimit.delete(key)
    }
  }
  
  // Verificar límite
  const userRequests = rateLimit.get(ip) || { count: 0, timestamp: now }
  
  if (userRequests.count >= 100) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Incrementar contador
  rateLimit.set(ip, {
    count: userRequests.count + 1,
    timestamp: now
  })
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

### 7.2. Rate Limiting en Supabase

```sql
-- Limitar consultas por usuario (opcional)
CREATE OR REPLACE FUNCTION check_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Implementar lógica de rate limiting
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Auditoría y Logs

### 8.1. Tabla de Auditoría

```sql
-- Ya existe en SCHEMA_DB.sql
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
```

### 8.2. Trigger para Auditoría Automática

```sql
-- Función genérica de auditoría
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO auditoria (
    usuario_id,
    tabla_afectada,
    registro_id,
    operacion,
    datos_anteriores,
    datos_nuevos
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas críticas
CREATE TRIGGER audit_obras
  AFTER INSERT OR UPDATE OR DELETE ON obras
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_presupuestos
  AFTER INSERT OR UPDATE OR DELETE ON presupuestos
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

## 9. Checklist de Seguridad

### Pre-Deploy

- [ ] RLS activado en todas las tablas
- [ ] Políticas RLS probadas y funcionando
- [ ] Service role key NO expuesta en frontend
- [ ] Variables de entorno configuradas en Vercel
- [ ] CORS configurado en Supabase
- [ ] Stripe webhook con verificación de firma
- [ ] Rate limiting implementado en API routes
- [ ] HTTPS habilitado (automático en Vercel)
- [ ] Headers de seguridad configurados

### Post-Deploy

- [ ] Verificar que no hay errores en consola
- [ ] Probar aislamiento multi-tenant
- [ ] Verificar que RLS bloquea acceso no autorizado
- [ ] Probar Stripe webhook en modo test
- [ ] Verificar logs de auditoría
- [ ] Configurar alertas de seguridad

---

## 10. Monitoreo de Seguridad

### 10.1. Sentry (Errores)

```javascript
// src/main.jsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
})
```

### 10.2. Logs de Supabase

```sql
-- Ver logs de autenticación
SELECT * FROM auth.audit.log_events 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

### 10.3. Alertas

Configurar alertas para:
- Intentos de acceso no autorizados
- Errores 401/403 frecuentes
- Cambios en políticas RLS
- Uso de service role key en frontend (nunca debería pasar)

---

## 11. Incidentes Comunes y Soluciones

### 11.1. "Permission denied" en Supabase

**Causa:** RLS bloquea la operación

**Solución:**
1. Verificar que el usuario esté autenticado
2. Verificar que pertenezca a la empresa correcta
3. Verificar que la política RLS permita la operación

```sql
-- Debug: ver qué usuario está activo
SELECT auth.uid();

-- Debug: ver políticas de la tabla
SELECT * FROM pg_policies WHERE tablename = 'obras';
```

### 11.2. "JWT expired"

**Causa:** Token de Supabase expirado

**Solución:**
```javascript
// Auto-refresh de token
const { data, error } = await supabase.auth.refreshSession()
```

### 11.3. "CORS error"

**Causa:** Dominio no permitido en Supabase

**Solución:**
1. Agregar dominio en Supabase Dashboard > Settings > API
2. Configurar CORS en Vercel

---

## 12. Mejores Prácticas

### ✅ Hacer

- Usar RLS en todas las tablas
- Validar datos en frontend Y backend
- Usar HTTPS en producción
- Rotar claves periódicamente
- Monitorear logs de acceso
- Implementar rate limiting
- Verificar firmas de webhooks

### ❌ No Hacer

- Exponer service role key en frontend
- Confiar solo en validación de frontend
- Desactivar RLS "temporalmente"
- Usar SQL sin preparar (SQL injection)
- Almacenar contraseñas en texto plano
- Ignorar errores de autenticación

---

**Responsable de seguridad:** Cristóbal Soto  
**Última revisión:** 5 de Julio de 2026  
**Próxima revisión:** 5 de Agosto de 2026