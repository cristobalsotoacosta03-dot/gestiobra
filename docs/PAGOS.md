# Sistema de Pagos con Stripe

## Implementación de Stripe para GestiObra

---

## 1. Configuración de Stripe

### 1.1. Crear Cuenta de Stripe

1. Ve a: https://dashboard.stripe.com/register
2. Crea una cuenta (usa modo test primero)
3. Completa la información de tu empresa

### 1.2. Obtener Claves API

#### Modo Test (Desarrollo)

1. Ve a: https://dashboard.stripe.com/test/apikeys
2. Copia las claves:
   - **Publishable key:** `pk_test_xxx`
   - **Secret key:** `sk_test_xxx`

#### Modo Live (Producción)

1. Activa tu cuenta en Stripe Dashboard
2. Ve a: https://dashboard.stripe.com/apikeys
3. Copia las claves de producción:
   - **Publishable key:** `pk_live_xxx`
   - **Secret key:** `sk_live_xxx`

### 1.3. Configurar Variables de Entorno

```env
# .env (local)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxx
STRIPE_SECRET_KEY=sk_test_51xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Vercel (producción)
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
```

---

## 2. Crear Producto y Precio en Stripe

### 2.1. Crear Producto

1. Ve a: https://dashboard.stripe.com/products
2. Haz clic en "Add product"
3. Completa:
   - **Name:** GestiObra Basic
   - **Description:** Plan básico de gestión de obras
   - **Price:** €49/mes
   - **Billing period:** Monthly
4. Guarda el **Price ID** (ej: `price_1xxx`)

### 2.2. Configurar Precios

Crea los siguientes precios en Stripe:

| Plan | Precio | Price ID | Límites |
|------|--------|----------|---------|
| Basic | €49/mes | `price_basic` | 3 usuarios, 5 obras |
| Pro | €99/mes | `price_pro` | 10 usuarios, 20 obras |
| Enterprise | €249/mes | `price_enterprise` | Ilimitado |

---

## 3. Implementación del Frontend

### 3.1. Cliente de Stripe

```javascript
// src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
)
```

### 3.2. Hook de Suscripción

```javascript
// src/hooks/useSubscription.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSubscription() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscription()
  }, [])

  async function loadSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error)
      } else {
        setSubscription(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const hasAccess = (feature) => {
    if (!subscription) return false
    if (subscription.plan_id === 'enterprise') return true
    // Lógica de features por plan
    return true
  }

  return {
    subscription,
    loading,
    hasAccess,
    refetch: loadSubscription
  }
}
```

### 3.3. Componente de Pago

```javascript
// src/components/PaymentGate.jsx
import { useState } from 'react'
import { useSubscription } from '../hooks/useSubscription'

export default function PaymentGate({ children, feature }) {
  const { hasAccess, loading } = useSubscription()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!hasAccess(feature)) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-2">
          ⚠️ Función Premium
        </h3>
        <p className="text-sm text-amber-700 mb-4">
          Esta funcionalidad requiere un plan de pago.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Ver Planes
        </button>
        
        {showUpgrade && <PricingModal onClose={() => setShowUpgrade(false)} />}
      </div>
    )
  }

  return children
}
```

### 3.4. Página de Pricing

```javascript
// src/pages/Pricing.jsx
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    features: ['3 usuarios', '5 obras activas', 'Calculadoras básicas'],
    priceId: 'price_basic'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    features: ['10 usuarios', '20 obras activas', 'Todas las calculadoras', 'Soporte prioritario'],
    priceId: 'price_pro',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    features: ['Usuarios ilimitados', 'Obras ilimitadas', 'API access', 'Soporte 24/7'],
    priceId: 'price_enterprise'
  }
]

export default function Pricing({ navigate }) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe(priceId) {
    setLoading(true)
    
    try {
      const stripe = await stripePromise
      
      // Llamar a API route para crear checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      const { sessionId } = await response.json()

      // Redirigir a Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        console.error('Error:', error)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Planes y Precios
        </h1>
        <p className="text-lg text-slate-600">
          Elige el plan perfecto para tu empresa
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border-2 p-8 ${
              plan.popular ? 'border-blue-600 shadow-xl' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Más Popular
              </span>
            )}
            
            <h3 className="text-2xl font-bold text-slate-900 mt-4">
              {plan.name}
            </h3>
            
            <div className="mt-4">
              <span className="text-4xl font-bold text-slate-900">
                €{plan.price}
              </span>
              <span className="text-slate-600">/mes</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading}
              className={`w-full mt-8 py-3 rounded-xl font-semibold ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {loading ? 'Procesando...' : 'Suscribirse'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 4. API Routes (Backend)

### 4.1. Crear Checkout Session

```javascript
// api/stripe/checkout.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { priceId } = await request.json()

    // Obtener usuario actual
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Crear o obtener customer de Stripe
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = customer?.stripe_customer_id

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      })
      
      customerId = stripeCustomer.id
      
      await supabase.from('customers').insert({
        user_id: user.id,
        stripe_customer_id: customerId
      })
    }

    // Crear checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.VITE_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.VITE_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id
      }
    })

    return Response.json({ sessionId: session.id })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
```

### 4.2. Webhook de Stripe

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
    console.error('Webhook error:', err)
    return Response.json({ error: err.message }, { status: 400 })
  }
}

async function handleWebhookEvent(event) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata.user_id
      
      // Crear suscripción en BD
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan_id: 'basic', // Determinar desde price_id
        status: 'active',
        current_period_start: new Date(session.current_period_start * 1000),
        current_period_end: new Date(session.current_period_end * 1000)
      })
      
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
      
      break
    }

    case 'invoice.payment_succeeded': {
      // Actualizar fecha de próximo pago
      const invoice = event.data.object
      
      await supabase
        .from('subscriptions')
        .update({
          current_period_start: new Date(invoice.period_start * 1000),
          current_period_end: new Date(invoice.period_end * 1000)
        })
        .eq('stripe_customer_id', invoice.customer)
      
      break
    }

    case 'invoice.payment_failed': {
      // Marcar suscripción como fallida
      const invoice = event.data.object
      
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer)
      
      // TODO: Enviar email de pago fallido
      break
    }
  }
}
```

---

## 5. Configurar Webhook en Stripe

### 5.1. Desarrollo Local (stripe-cli)

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Autenticarse
stripe login

# Escuchar webhooks
stripe listen --forward-to localhost:5175/api/stripe/webhook

# Copia el webhook secret que aparece
whsec_xxx
```

### 5.2. Producción (Vercel)

1. Ve a: https://dashboard.stripe.com/webhooks
2. Haz clic en "Add endpoint"
3. URL: `https://gestiobra.vercel.app/api/stripe/webhook`
4. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copia el **Webhook Secret**: `whsec_xxx`

---

## 6. Página de Billing

```javascript
// src/pages/Billing.jsx
import { useState, useEffect } from 'react'
import { useSubscription } from '../hooks/useSubscription'

export default function Billing() {
  const { subscription, loading } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)

  async function openCustomerPortal() {
    setPortalLoading(true)
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Facturación y Suscripción
      </h1>

      {subscription ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Plan Actual: {subscription.plans?.name}
              </h2>
              <p className="text-slate-600 mt-1">
                €{subscription.plans?.price}/mes
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {subscription.status === 'active' ? 'Activo' : 'Pendiente'}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Próxima facturación
            </h3>
            <p className="text-slate-600">
              {new Date(subscription.current_period_end).toLocaleDateString('es-ES')}
            </p>
          </div>

          <div className="border-t border-slate-200 pt-6 mt-6">
            <button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              {portalLoading ? 'Cargando...' : 'Gestionar Suscripción'}
            </button>
            <p className="text-sm text-slate-500 mt-2">
              Cambiar plan, actualizar método de pago, ver facturas
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">
            Sin Suscripción Activa
          </h2>
          <p className="text-amber-700 mb-6">
            Suscríbete para acceder a todas las funcionalidades
          </p>
          <button
            onClick={() => navigate('pricing')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Ver Planes
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 7. Customer Portal de Stripe

```javascript
// api/stripe/portal.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { data: { user } } = await getSupabaseUser()
    
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL}/billing`
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
```

---

## 8. Esquema de Base de Datos

```sql
-- Tabla: customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: plans
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

-- Insertar planes por defecto
INSERT INTO plans (id, name, price, interval, features, limits) VALUES
  ('basic', 'Basic', 49, 'month', 
   '["3 usuarios", "5 obras activas", "Calculadoras básicas"]',
   '{"users": 3, "projects": 5}'),
  ('pro', 'Pro', 99, 'month',
   '["10 usuarios", "20 obras activas", "Todas las calculadoras", "Soporte prioritario"]',
   '{"users": 10, "projects": 20}'),
  ('enterprise', 'Enterprise', 249, 'month',
   '["Usuarios ilimitados", "Obras ilimitadas", "API access", "Soporte 24/7"]',
   '{"users": -1, "projects": -1}')
ON CONFLICT DO NOTHING;
```

---

## 9. Testing en Modo Test

### 9.1. Tarjetas de Prueba

Stripe proporciona tarjetas de prueba:

```
# Éxito
4242 4242 4242 4242
Cualquier fecha futura
Cualquier CVC (3 dígitos)

# Fallo
4000 0000 0000 0002

# Autenticación 3D Secure
4000 0027 6000 3184
```

### 9.2. Flujo de Testing

1. **Crear suscripción:**
   - Ve a `/pricing`
   - Selecciona un plan
   - Usa tarjeta de prueba: `4242 4242 4242 4242`
   - Completa el checkout

2. **Verificar webhook:**
   ```bash
   # En terminal
   stripe listen --forward-to localhost:5175/api/stripe/webhook
   
   # Ver eventos recibidos
   stripe events list
   ```

3. **Verificar en BD:**
   ```sql
   SELECT * FROM subscriptions;
   SELECT * FROM customers;
   ```

4. **Gestionar suscripción:**
   - Ve a `/billing`
   - Haz clic en "Gestionar Suscripción"
   - Cancela o cambia de plan

---

## 10. Producción

### 10.1. Cambiar a Modo Live

1. **Stripe Dashboard:**
   - Activa tu cuenta
   - Completa la verificación de empresa
   - Obtén claves de producción

2. **Variables de entorno:**
   ```bash
   vercel env rm VITE_STRIPE_PUBLISHABLE_KEY production
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
   # Pega la clave pk_live_xxx
   
   vercel env rm STRIPE_SECRET_KEY production
   vercel env add STRIPE_SECRET_KEY production
   # Pega la clave sk_live_xxx
   ```

3. **Webhook de producción:**
   - Crea nuevo endpoint en Stripe Dashboard
   - URL: `https://gestiobra.vercel.app/api/stripe/webhook`
   - Copia el webhook secret

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### 10.2. Verificar en Producción

1. **Checklist:**
   - [ ] Claves de producción configuradas
   - [ ] Webhook de producción activo
   - [ ] HTTPS funcionando
   - [ ] Checkout funciona con tarjeta real
   - [ ] Webhook recibe eventos
   - [ ] Suscripciones se crean en BD
   - [ ] Customer portal funciona

2. **Monitoreo:**
   - Stripe Dashboard > Developers > Webhooks
   - Ver eventos recibidos
   - Verificar que no hay errores

---

## 11. Cumplimiento Legal

### 11.1. Términos de Servicio

Crear `/legal/terminos` con:
- Descripción del servicio
- Precios y facturación
- Política de cancelación
- Limitación de responsabilidad
- Jurisdicción (España)

### 11.2. Política de Privacidad

Crear `/legal/privacidad` con:
- Datos recogidos
- Uso de datos
- Compartición con terceros (Stripe)
- Derechos del usuario (RGPD)
- Contacto

### 11.3. Información Fiscal

- **NIF/CIF:** Tu número fiscal
- **Razón social:** Nombre de tu empresa
- **Dirección:** Dirección fiscal
- **Email de contacto:** Para facturas y soporte

---

## 12. Métricas a Trackear

### 12.1. Métricas de Negocio

- **MRR (Monthly Recurring Revenue):** Ingresos recurrentes mensuales
- **Churn rate:** % de clientes que cancelan
- **LTV (Lifetime Value):** Valor de vida del cliente
- **CAC (Customer Acquisition Cost):** Costo de adquisición
- **Conversion rate:** % de visitantes que se suscriben

### 12.2. Métricas de Producto

- **Trial conversion:** % de trials que se convierten a paid
- **Feature adoption:** Uso de funcionalidades premium
- **Time to value:** Tiempo hasta primer "aha moment"
- **NPS (Net Promoter Score):** Satisfacción del cliente

---

## 13. Soporte y Documentación

### 13.1. Documentación de Stripe

- **Guía oficial:** https://stripe.com/docs/subscriptions
- **Testing:** https://stripe.com/docs/testing
- **Webhooks:** https://stripe.com/docs/webhooks

### 13.2. Herramientas

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Stripe Sigma:** Analytics avanzados (de pago)

---

## 14. Troubleshooting

### Error: "No such customer"

**Causa:** Customer no existe en Stripe

**Solución:**
```javascript
// Crear customer antes de checkout
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { user_id: user.id }
})
```

### Error: "Webhook signature verification failed"

**Causa:** Webhook secret incorrecto

**Solución:**
1. Verifica STRIPE_WEBHOOK_SECRET en variables de entorno
2. Verifica que el webhook esté configurado correctamente
3. Usa stripe-cli para desarrollo local

### Error: "Invalid API Key"

**Causa:** Clave incorrecta o en modo incorrecto

**Solución:**
1. Verifica que usas claves de test en desarrollo
2. Verifica que usas claves de live en producción
3. No mezcles claves de test y live

---

**Responsable:** Cristóbal Soto  
**Última revisión:** 5 de Julio de 2026  
**Próxima revisión:** 5 de Agosto de 2026