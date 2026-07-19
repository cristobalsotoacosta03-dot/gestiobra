# Checklist de Despliegue Final - GestiObra

**Guía paso a paso para poner GestiObra en producción**

---

## 📋 Pre-requisitos

- [ ] Cuenta de Stripe creada (https://dashboard.stripe.com/register)
- [ ] Cuenta de Supabase activa (https://supabase.com)
- [ ] Cuenta de Vercel (https://vercel.com)
- [ ] Repositorio Git configurado

---

## 🗄️ PASO 1: Configurar Base de Datos (Supabase)

### 1.1. Ejecutar Schema Core

1. Abrir Supabase Dashboard: https://supabase.com/dashboard/project/szfikjyaktdpsimpqgxl/editor
2. Ir a **SQL Editor**
3. Ejecutar `docs/SCHEMA_DB.sql`:
   ```bash
   # Copiar contenido completo de docs/SCHEMA_DB.sql
   # Pegar en SQL Editor
   # Click en "Run"
   ```
4. Verificar que se crearon 14 tablas:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename NOT LIKE 'pg_%';
   ```

**✅ Checklist:**
- [ ] SCHEMA_DB.sql ejecutado sin errores
- [ ] 14 tablas creadas
- [ ] RLS activo en todas las tablas

### 1.2. Ejecutar Schema Stripe

1. En el mismo SQL Editor
2. Ejecutar `docs/STRIPE_TABLES.sql`:
   ```bash
   # Copiar contenido completo de docs/STRIPE_TABLES.sql
   # Pegar en SQL Editor
   # Click en "Run"
   ```
3. Verificar tablas creadas:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('customers', 'subscriptions', 'plans');
   ```

4. Verificar planes insertados:
   ```sql
   SELECT * FROM plans;
   -- Debería mostrar: basic (€49), pro (€99), enterprise (€249)
   ```

**✅ Checklist:**
- [ ] STRIPE_TABLES.sql ejecutado sin errores
- [ ] Tablas customers, subscriptions, plans creadas
- [ ] 3 planes insertados correctamente
- [ ] RLS activo en tablas de Stripe

### 1.3. Crear Usuario Admin

1. Ir a **Authentication** → **Users**
2. Crear usuario:
   ```
   Email: admin@gestiobra.com
   Password: [contraseña segura]
   ```
3. En **SQL Editor**, ejecutar:
   ```sql
   -- Crear empresa
   INSERT INTO empresas (nombre, cif, email, activo)
   VALUES ('GestiObra Demo', 'B12345678', 'admin@gestiobra.com', true)
   RETURNING id;
   
   -- Crear rol admin
   INSERT INTO roles (nombre, descripcion, permisos)
   VALUES ('admin', 'Administrador del sistema', '{"all": true}')
   RETURNING id;
   
   -- Vincular usuario (reemplazar UUIDs)
   INSERT INTO usuarios (auth_id, empresa_id, rol_id, nombre, email, activo)
   VALUES (
     'UUID_DEL_USUARIO_AUTH',
     'UUID_DE_EMPRESA',
     'UUID_DE_ROL',
     'Admin GestiObra',
     'admin@gestiobra.com',
     true
   );
   ```

**✅ Checklist:**
- [ ] Usuario admin creado en Supabase Auth
- [ ] Empresa creada
- [ ] Rol admin creado
- [ ] Usuario vinculado a empresa y rol

---

## 💳 PASO 2: Configurar Stripe

### 2.1. Crear Productos y Precios

1. Ir a Stripe Dashboard: https://dashboard.stripe.com/products
2. Click en **"+ Add product"**

**Producto 1: Basic**
```
Name: GestiObra Basic
Pricing: €49.00 EUR / month
Billing period: Monthly
```
3. Copiar el **Price ID** (ej: `price_1ABC...`)

**Producto 2: Pro**
```
Name: GestiObra Pro
Pricing: €99.00 EUR / month
Billing period: Monthly
```
4. Copiar el **Price ID**

**Producto 3: Enterprise**
```
Name: GestiObra Enterprise
Pricing: €249.00 EUR / month
Billing period: Monthly
```
5. Copiar el **Price ID**

**✅ Checklist:**
- [ ] Producto Basic creado
- [ ] Producto Pro creado
- [ ] Producto Enterprise creado
- [ ] Price IDs anotados

### 2.2. Obtener API Keys

1. Ir a **Developers** → **API keys**
2. Copiar:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

**✅ Checklist:**
- [ ] Publishable key copiada
- [ ] Secret key copiada

### 2.3. Configurar Webhook (Local)

1. Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
2. Autenticarse:
   ```bash
   stripe login
   ```
3. Iniciar webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:5175/api/stripe/webhook
   ```
4. Copiar el **Webhook secret** (whsec_...)

**✅ Checklist:**
- [ ] Stripe CLI instalado
- [ ] Webhook forwarding activo
- [ ] Webhook secret copiado

### 2.4. Actualizar Price IDs en Código

1. Abrir `src/pages/Pricing.jsx`
2. Reemplazar price IDs:
   ```javascript
   const PLANS = [
     {
       id: 'basic',
       priceId: 'price_1ABC...', // Reemplazar con ID real
       ...
     },
     {
       id: 'pro',
       priceId: 'price_1DEF...', // Reemplazar con ID real
       ...
     },
     {
       id: 'enterprise',
       priceId: 'price_1GHI...', // Reemplazar con ID real
       ...
     }
   ]
   ```
3. Hacer lo mismo en `src/components/SubscriptionGate.jsx`

**✅ Checklist:**
- [ ] Price IDs actualizados en Pricing.jsx
- [ ] Price IDs actualizados en SubscriptionGate.jsx

---

## 🔧 PASO 3: Configurar Variables de Entorno

### 3.1. Variables Locales (.env)

Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://szfikjyaktdpsimpqgxl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_K85u06yzTpyDPfvts86mSQ_ewEzlF7b
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
VITE_APP_URL=http://localhost:5175
VITE_APP_NAME=GestiObra
```

**✅ Checklist:**
- [ ] Archivo .env creado
- [ ] Todas las variables configuradas
- [ ] Service role key obtenida de Supabase Dashboard

### 3.2. Variables en Vercel

1. Instalar Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Autenticarse:
   ```bash
   vercel login
   ```

3. Configurar variables:
   ```bash
   # Supabase
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   
   # Stripe
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
   vercel env add STRIPE_SECRET_KEY production
   vercel env add STRIPE_WEBHOOK_SECRET production
   
   # App
   vercel env add VITE_APP_URL production
   vercel env add VITE_APP_NAME production
   ```

4. Para cada variable, pegar el valor cuando lo solicite.

**✅ Checklist:**
- [ ] Vercel CLI instalado
- [ ] Autenticado en Vercel
- [ ] 8 variables de entorno configuradas

---

## 🚀 PASO 4: Deploy a Producción

### 4.1. Verificar Build Local

```bash
# Instalar dependencias
npm install

# Verificar que no hay errores
npm run verify

# Build de producción
npm run build

# Preview local del build
npm run preview
```

Abrir http://localhost:4173 y verificar que carga correctamente.

**✅ Checklist:**
- [ ] npm install completado
- [ ] npm run verify sin errores
- [ ] npm run build exitoso
- [ ] Preview funciona correctamente

### 4.2. Primer Deploy

```bash
# Deploy a preview
vercel

# Responder preguntas:
# - Set up and deploy? Y
# - Which scope? Tu cuenta
# - Link to existing project? N
# - Project name? gestiobra
# - In which directory? ./
# - Override settings? N
```

Verificar que el deploy fue exitoso: https://gestiobra-xxx.vercel.app

**✅ Checklist:**
- [ ] Deploy a preview exitoso
- [ ] URL de preview funciona
- [ ] No hay errores en consola

### 4.3. Deploy a Producción

```bash
vercel --prod
```

Esperar 1-2 minutos. Verificar: https://gestiobra.vercel.app

**✅ Checklist:**
- [ ] Deploy a producción exitoso
- [ ] URL de producción funciona
- [ ] HTTPS activo (candado en navegador)
- [ ] No hay errores en consola

---

## 🔗 PASO 5: Configurar Webhook en Producción

### 5.1. Actualizar Webhook URL

1. En Stripe Dashboard, ir a **Developers** → **Webhooks**
2. Click en **"+ Add endpoint"**
3. Configurar:
   ```
   Endpoint URL: https://gestiobra.vercel.app/api/stripe/webhook
   Events: Select events → subscription.created, subscription.updated, subscription.deleted, invoice.payment_succeeded, invoice.payment_failed, checkout.session.completed
   ```
4. Copiar el **Webhook secret** (whsec_...)
5. Actualizar en Vercel:
   ```bash
   vercel env rm STRIPE_WEBHOOK_SECRET production
   vercel env add STRIPE_WEBHOOK_SECRET production
   # Pegar el nuevo secret
   ```
6. Redeploy:
   ```bash
   vercel --prod
   ```

**✅ Checklist:**
- [ ] Webhook endpoint creado en Stripe
- [ ] Eventos seleccionados correctamente
- [ ] Webhook secret actualizado en Vercel
- [ ] Redeploy ejecutado

---

## ✅ PASO 6: Verificación Post-Deploy

### 6.1. Verificación Básica

1. **Abrir aplicación**: https://gestiobra.vercel.app
2. **Verificar consola del navegador** (F12):
   - No debe haber errores en rojo
   - Verificar que Supabase se conecta
3. **Verificar HTTPS**: Debe mostrar candado en barra de direcciones
4. **Verificar variables**:
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   console.log(import.meta.env.VITE_APP_URL)
   ```

**✅ Checklist:**
- [ ] App carga correctamente
- [ ] Sin errores en consola
- [ ] HTTPS activo
- [ ] Variables de entorno accesibles

### 6.2. Verificación de Funcionalidades

1. **Login/Registro**:
   - Ir a http://localhost:5175 (o producción)
   - Probar registro de nuevo usuario
   - Probar login
   - Verificar redirección a dashboard

2. **Dashboard**:
   - Verificar que carga KPIs
   - Verificar que no hay errores

3. **Navegación**:
   - Probar todas las páginas del menú
   - Verificar que no hay 404s

4. **Stripe - Pricing**:
   - Ir a /pricing
   - Verificar que se muestran 3 planes
   - Verificar precios (€49, €99, €249)

**✅ Checklist:**
- [ ] Login/Registro funciona
- [ ] Dashboard carga correctamente
- [ ] Navegación completa funciona
- [ ] Página /pricing se muestra

### 6.3. Verificación de Base de Datos

1. En Supabase Dashboard → **Table Editor**:
   - Verificar que existen las tablas core
   - Verificar que existen tablas de Stripe
   - Verificar que hay planes insertados

2. Probar RLS:
   ```sql
   -- Verificar políticas
   SELECT schemaname, tablename, policyname, cmd
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

**✅ Checklist:**
- [ ] Tablas visibles en Table Editor
- [ ] Planes de Stripe insertados
- [ ] Políticas RLS activas

---

## 🧪 PASO 7: Testing de Stripe (Modo Test)

### 7.1. Probar Checkout

1. Ir a http://localhost:5175/pricing
2. Click en "Suscribirse" en cualquier plan
3. Usar tarjeta de prueba:
   ```
   Número: 4242 4242 4242 4242
   Fecha: Cualquier fecha futura
   CVC: Cualquier 3 dígitos
   ```
4. Completar checkout
5. Verificar redirección a /billing?success=true

**✅ Checklist:**
- [ ] Checkout se abre correctamente
- [ ] Pago con tarjeta de prueba exitoso
- [ ] Redirección a /billing funciona
- [ ] Suscripción aparece en BD

### 7.2. Verificar Webhook

1. En terminal donde corre Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5175/api/stripe/webhook
   ```
2. Verificar que aparecen eventos:
   ```
   ✅ Received event: checkout.session.completed
   ✅ Received event: customer.subscription.created
   ```

3. En Supabase, verificar:
   ```sql
   SELECT * FROM subscriptions;
   SELECT * FROM customers;
   ```

**✅ Checklist:**
- [ ] Webhook recibe eventos
- [ ] Eventos se procesan correctamente
- [ ] Tabla subscriptions actualizada
- [ ] Tabla customers actualizada

### 7.3. Probar Customer Portal

1. Ir a /billing
2. Click en "Gestionar Suscripción"
3. Verificar que se abre portal de Stripe
4. Probar cambiar método de pago
5. Probar cancelar suscripción

**✅ Checklist:**
- [ ] Portal se abre correctamente
- [ ] Se puede ver método de pago
- [ ] Se puede actualizar método de pago
- [ ] Cancelación funciona

---

## 📊 PASO 8: Configuración de Dominio (Opcional)

### 8.1. Comprar Dominio

Recomendados:
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com
- Google Domains: https://domains.google

Buscar: `gestiobra.com`, `gestiobra.es`, `gestiobra.app`

### 8.2. Configurar en Vercel

1. Ir a Vercel Dashboard → Proyecto → Settings → Domains
2. Agregar dominio: `gestiobra.com`
3. Vercel dará instrucciones DNS

### 8.3. Configurar DNS

En registrador de dominio, agregar:
```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### 8.4. Actualizar Variables

```bash
vercel env rm VITE_APP_URL production
vercel env add VITE_APP_URL production
# Valor: https://gestiobra.com

vercel --prod
```

**✅ Checklist:**
- [ ] Dominio comprado
- [ ] DNS configurado
- [ ] Dominio agregado en Vercel
- [ ] VITE_APP_URL actualizado
- [ ] Redeploy ejecutado

---

## 🔍 PASO 9: Monitoreo y Observabilidad

### 9.1. Vercel Analytics

1. Ir a Vercel Dashboard → Proyecto → Analytics
2. Habilitar:
   - Web Vitals
   - Speed Insights
   - Analytics

**✅ Checklist:**
- [ ] Web Vitals habilitado
- [ ] Speed Insights habilitado
- [ ] Analytics habilitado

### 9.2. Logs

```bash
# Ver logs en tiempo real
vercel logs https://gestiobra.vercel.app --follow
```

**✅ Checklist:**
- [ ] Logs se pueden ver
- [ ] No hay errores 5xx
- [ ] No hay errores de build

---

## 🎯 PASO 10: Checklist Final Pre-Producción

### Seguridad
- [ ] RLS activo en todas las tablas
- [ ] Service role key NO expuesta en frontend
- [ ] Webhook con verificación de firma
- [ ] HTTPS activo
- [ ] Variables de entorno en Vercel (no en código)

### Funcionalidad
- [ ] Login/Registro funciona
- [ ] Dashboard carga correctamente
- [ ] CRUD de obras funciona
- [ ] CRUD de presupuestos funciona
- [ ] Calculadoras funcionan
- [ ] Biblia técnica funciona
- [ ] Pricing page se muestra
- [ ] Checkout de Stripe funciona
- [ ] Customer portal funciona
- [ ] Webhooks funcionan

### Performance
- [ ] Build exitoso sin errores
- [ ] Tiempo de carga < 3s
- [ ] Sin errores en consola
- [ ] Imágenes optimizadas
- [ ] Bundle size aceptable (< 500KB)

### SEO y Accesibilidad
- [ ] Meta tags configurados
- [ ] Títulos descriptivos
- [ ] Alt texts en imágenes
- [ ] Navegación por teclado funciona

---

## 🚨 Troubleshooting Común

### Error: "Function timeout"
**Causa**: Build muy lento
**Solución**: Verificar tamaño de bundle, optimizar imports

### Error: "Module not found"
**Causa**: Dependencia no instalada
**Solución**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Environment variable not found"
**Causa**: Variables no configuradas en Vercel
**Solución**:
```bash
vercel env ls
vercel env add VARIABLE_NAME production
```

### La app carga pero no hay datos
**Causa**: Problema con Supabase o RLS
**Solución**:
1. Verificar variables de Supabase
2. Verificar políticas RLS
3. Verificar que hay datos en tablas

### Error 404 en rutas
**Causa**: Vercel no configurado para SPA
**Solución**: Verificar vercel.json tiene rewrites

### Stripe webhook no funciona
**Causa**: URL incorrecta o secret erróneo
**Solución**:
1. Verificar URL en Stripe Dashboard
2. Verificar STRIPE_WEBHOOK_SECRET en Vercel
3. Verificar logs de webhook en Stripe Dashboard

---

## 📞 Contacto y Soporte

**Desarrollo**: cristobalsotoacosta03@gmail.com  
**Repositorio**: https://github.com/cristobalsotoacosta03-dot/gestiobra.git

---

## ✅ Estado Final

Una vez completados todos los pasos:

- [ ] **PRODUCCIÓN LISTA** ✅
- [ ] Aplicación funcionando en https://gestiobra.vercel.app
- [ ] Stripe en modo test funcionando
- [ ] Base de datos configurada
- [ ] Webhooks funcionando
- [ ] Listo para capturar primeros clientes

**¡Felicidades! GestiObra está lista para producción.** 🚀

---

**Última actualización**: Julio 2026  
**Versión**: 1.0.0