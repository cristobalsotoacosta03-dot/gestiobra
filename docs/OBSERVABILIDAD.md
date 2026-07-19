# Observabilidad y Analítica

## Implementación de PostHog/Sentry para GestiObra

---

## 1. PostHog (Analítica de Producto)

### 1.1. ¿Qué es PostHog?

PostHog es una plataforma de analítica de producto open-source que permite:
- **Event tracking:** Seguir acciones de usuarios
- **Session recording:** Grabar sesiones de usuario (opcional)
- **Feature flags:** Activar/desactivar funcionalidades
- **Funnels:** Analizar flujos de conversión
- **Retention:** Medir retención de usuarios

### 1.2. Alternativa: Umami

Umami es una alternativa más ligerta y privada:
- **Ventajas:** Más simple, self-hosted, sin cookies
- **Desventajas:** Menos features que PostHog
- **Recomendación:** Usar Umami si quieres simplicidad, PostHog si necesitas features avanzadas

### 1.3. Configuración de PostHog

#### Paso 1: Crear Cuenta

1. Ve a: https://app.posthog.com/signup
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto: "GestiObra"

#### Paso 2: Obtener API Key

1. Ve a: Project Settings > API Keys
2. Copia:
   - **Project API Key:** `phc_xxx`
   - **Personal API Key:** (para backend, opcional)

#### Paso 3: Configurar Variables de Entorno

```env
# .env
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://app.posthog.com

# Vercel
vercel env add VITE_POSTHOG_KEY production
vercel env add VITE_POSTHOG_HOST production
```

#### Paso 4: Implementar en Frontend

```javascript
// src/lib/posthog.js
import posthog from 'posthog-js'

export function initPostHog() {
  if (!import.meta.env.VITE_POSTHOG_KEY) {
    console.warn('PostHog no configurado')
    return
  }

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  })
}

export { posthog }
```

```javascript
// src/main.jsx
import { initPostHog } from './lib/posthog'

initPostHog()
```

### 1.5. Eventos a Trackear

```javascript
// src/hooks/useAnalytics.js
import { posthog } from '../lib/posthog'

export function useAnalytics() {
  const track = (event, properties = {}) => {
    posthog.capture(event, {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Eventos de autenticación
  const trackSignUp = (method) => {
    track('user_signed_up', { method })
  }

  const trackLogin = (method) => {
    track('user_logged_in', { method })
  }

  // Eventos de obras
  const trackProjectCreated = (project) => {
    track('project_created', {
      project_id: project.id,
      project_type: project.tipo_obra,
      project_state: project.estado
    })
  }

  const trackProjectUpdated = (projectId, changes) => {
    track('project_updated', {
      project_id: projectId,
      changes: Object.keys(changes)
    })
  }

  // Eventos de presupuestos
  const trackBudgetCreated = (budget) => {
    track('budget_created', {
      budget_id: budget.id,
      budget_amount: budget.importe_base,
      budget_margin: budget.margen_pct
    })
  }

  const trackBudgetExported = (budgetId, format) => {
    track('budget_exported', {
      budget_id: budgetId,
      format: format // 'pdf', 'excel', etc.
    })
  }

  // Eventos de calculadoras
  const trackCalculatorUsed = (calculatorType, inputs, result) => {
    track('calculator_used', {
      calculator_type: calculatorType, // 'acs', 'glp', 'tuberias'
      inputs: inputs,
      result: result
    })
  }

  // Eventos de pago
  const trackPricingViewed = () => {
    track('pricing_viewed')
  }

  const trackCheckoutStarted = (planId, price) => {
    track('checkout_started', {
      plan_id: planId,
      price: price
    })
  }

  const trackSubscriptionCreated = (planId, amount) => {
    track('subscription_created', {
      plan_id: planId,
      amount: amount
    })
  }

  return {
    track,
    trackSignUp,
    trackLogin,
    trackProjectCreated,
    trackProjectUpdated,
    trackBudgetCreated,
    trackBudgetExported,
    trackCalculatorUsed,
    trackPricingViewed,
    trackCheckoutStarted,
    trackSubscriptionCreated
  }
}
```

### 1.6. Ejemplos de Uso

```javascript
// En LoginPage.jsx
const { trackLogin } = useAnalytics()

async function handleLogin(email, password) {
  const { user, error } = await signIn(email, password)
  
  if (!error) {
    trackLogin('email')
  }
}

// En Obras.jsx
const { trackProjectCreated } = useAnalytics()

async function createObra(obraData) {
  const newObra = await addObra(obraData)
  
  if (newObra) {
    trackProjectCreated(newObra)
  }
}

// En Calculadoras.jsx
const { trackCalculatorUsed } = useAnalytics()

function handleCalculate(type, inputs, result) {
  trackCalculatorUsed(type, inputs, result)
}
```

---

## 2. Sentry (Monitoreo de Errores)

### 2.1. ¿Qué es Sentry?

Sentry es una plataforma de monitoreo de errores que permite:
- **Error tracking:** Capturar errores en tiempo real
- **Performance monitoring:** Medir performance de la app
- **Release tracking:** Ver qué versión tiene el error
- **Alerting:** Recibir alertas cuando hay errores

### 2.2. Configuración de Sentry

#### Paso 1: Crear Cuenta

1. Ve a: https://sentry.io/signup/
2. Crea una cuenta
3. Crea un nuevo proyecto: "GestiObra (React)"

#### Paso 2: Obtener DSN

1. Ve a: Project Settings > Client Keys (DSN)
2. Copia el **DSN**: `https://xxx@sentry.io/xxx`

#### Paso 3: Configurar Variables de Entorno

```env
# .env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_APP_ENV=development

# Vercel
vercel env add VITE_SENTRY_DSN production
vercel env add VITE_APP_ENV production
```

#### Paso 4: Implementar en Frontend

```javascript
// src/lib/sentry.js
import * as Sentry from '@sentry/react'

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry no configurado')
    return
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || 'development',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  })
}

export { Sentry }
```

```javascript
// src/main.jsx
import { initSentry } from './lib/sentry'

initSentry()
```

### 2.3. Capturar Errores Manualmente

```javascript
// src/hooks/useObras.js
import * as Sentry from '../lib/sentry'

export function useObras() {
  const [obras, setObras] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadObras() {
      try {
        const { data, error } = await supabase
          .from('obras')
          .select('*')
        
        if (error) throw error
        
        setObras(data || [])
      } catch (err) {
        console.error('Error loading obras:', err)
        
        // Capturar error en Sentry
        Sentry.captureException(err, {
          tags: {
            section: 'obras',
            action: 'load'
          },
          extra: {
            userId: user?.id,
            empresaId: user?.empresa_id
          }
        })
        
        setError(err.message)
      }
    }

    loadObras()
  }, [])

  return { obras, error }
}
```

### 2.4. Capturar Eventos de Usuario

```javascript
// src/components/LoginPage.jsx
import * as Sentry from '../lib/sentry'

async function handleLogin(email, password) {
  try {
    const { user, error } = await signIn(email, password)
    
    if (error) {
      Sentry.captureMessage('Login failed', {
        level: 'warning',
        extra: {
          email: email,
          error: error.message
        }
      })
    }
  } catch (err) {
    Sentry.captureException(err)
  }
}
```

---

## 3. Métricas y KPIs

### 3.1. Métricas de Negocio

```javascript
// src/hooks/useMetrics.js
import { posthog } from '../lib/posthog'

export function useMetrics() {
  // MRR (Monthly Recurring Revenue)
  const calculateMRR = (subscriptions) => {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => total + sub.plans?.price, 0)
  }

  // Churn Rate
  const calculateChurn = (subscriptions, period) => {
    const startOfPeriod = new Date()
    startOfPeriod.setMonth(startOfPeriod.getMonth() - 1)
    
    const activeAtStart = subscriptions.filter(sub => 
      new Date(sub.created_at) < startOfPeriod && sub.status === 'active'
    ).length
    
    const churned = subscriptions.filter(sub => 
      sub.status === 'canceled' && 
      new Date(sub.updated_at) >= startOfPeriod
    ).length
    
    return activeAtStart > 0 ? (churned / activeAtStart) * 100 : 0
  }

  // LTV (Lifetime Value)
  const calculateLTV = (subscriptions) => {
    const avgMonthlyRevenue = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => total + sub.plans?.price, 0) / subscriptions.length
    
    const avgLifespan = 12 // meses (estimado)
    
    return avgMonthlyRevenue * avgLifespan
  }

  // Conversion Rate
  const calculateConversion = (visitors, conversions) => {
    return visitors > 0 ? (conversions / visitors) * 100 : 0
  }

  return {
    calculateMRR,
    calculateChurn,
    calculateLTV,
    calculateConversion
  }
}
```

### 3.2. Dashboard de Métricas

```javascript
// src/pages/Metrics.jsx (solo para admin)
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Metrics() {
  const [metrics, setMetrics] = useState({
    mrr: 0,
    churn: 0,
    ltv: 0,
    totalUsers: 0,
    activeSubscriptions: 0
  })

  useEffect(() => {
    loadMetrics()
  }, [])

  async function loadMetrics() {
    // Obtener suscripciones
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')

    // Obtener usuarios
    const { data: users } = await supabase
      .from('usuarios')
      .select('*')

    // Calcular métricas
    const mrr = calculateMRR(subscriptions)
    const churn = calculateChurn(subscriptions)
    const ltv = calculateLTV(subscriptions)

    setMetrics({
      mrr,
      churn,
      ltv,
      totalUsers: users?.length || 0,
      activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Métricas de Negocio
      </h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">MRR</p>
          <p className="text-3xl font-bold text-slate-900">
            €{metrics.mrr.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Churn Rate</p>
          <p className="text-3xl font-bold text-slate-900">
            {metrics.churn.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">LTV</p>
          <p className="text-3xl font-bold text-slate-900">
            €{metrics.ltv.toFixed(0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Suscripciones Activas</p>
          <p className="text-3xl font-bold text-slate-900">
            {metrics.activeSubscriptions}
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. Health Checks

### 4.1. Endpoint de Health Check

```javascript
// api/health.js
export async function GET() {
  try {
    // Verificar conexión a Supabase
    const { error: supabaseError } = await supabase
      .from('empresas')
      .select('count')
      .limit(1)

    if (supabaseError) {
      return Response.json(
        { status: 'error', message: 'Supabase connection failed' },
        { status: 500 }
      )
    }

    // Verificar conexión a Stripe (si está configurado)
    let stripeStatus = 'not_configured'
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        await stripe.accounts.retrieve()
        stripeStatus = 'ok'
      } catch (err) {
        stripeStatus = 'error'
      }
    }

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'ok',
        stripe: stripeStatus
      }
    })
  } catch (err) {
    return Response.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}
```

### 4.2. Monitoreo Automático

Configurar monitoreo en Vercel:
1. Ve a tu proyecto > Settings > Monitoring
2. Agrega el endpoint: `https://gestiobra.vercel.app/api/health`
3. Configura alertas si el endpoint falla

---

## 5. Logs y Debugging

### 5.1. Logs de Vercel

```bash
# Ver logs en tiempo real
vercel logs https://gestiobra.vercel.app --follow

# Ver logs de un deploy específico
vercel logs [deployment-url]

# Filtrar por nivel de log
vercel logs [deployment-url] --level error
```

### 5.2. Logs de Supabase

```sql
-- Ver logs de autenticación
SELECT * FROM auth.audit.log_events 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- Ver queries lentas
SELECT * FROM pg_stat_statements 
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### 5.3. Logs de Stripe

```bash
# Ver webhooks recibidos
stripe events list --limit 10

# Ver detalles de un evento
stripe events retrieve evt_xxx

# Ver logs de CLI
stripe logs tail
```

---

## 6. Alertas

### 6.1. Alertas de Vercel

Configurar en Vercel Dashboard > Settings > Monitoring:

- **Deploy fallidos:** Email/Slack
- **Errores 5xx:** Email/Slack
- **Límite de bandwidth:** Email
- **Function timeouts:** Email

### 6.2. Alertas de Sentry

Configurar en Sentry Dashboard > Alerts:

- **Nuevo error crítico:** Email/Slack inmediato
- **Error repetitivo:** Email diario
- **Performance degradation:** Email semanal

### 6.3. Alertas de PostHog

Configurar en PostHog Dashboard > Alerts:

- **Caída en conversión:** Email semanal
- **Aumento en errores:** Email diario
- **Nuevo usuario registrado:** Email (opcional)

---

## 7. Dashboards

### 7.1. Dashboard de PostHog

Crear dashboard con:
- **Usuarios activos** (DAU/WAU/MAU)
- **Retención** (D1, D7, D30)
- **Funnels:**
  - Visitantes → Registro → Trial → Pago
- **Eventos principales:**
  - Proyectos creados
  - Presupuestos exportados
  - Calculadoras usadas

### 7.2. Dashboard de Sentry

Ver:
- **Errores por versión**
- **Errores por navegador**
- **Errores por usuario**
- **Performance por página**

### 7.3. Dashboard Personalizado

Crear dashboard en `/admin/metrics` con:
- MRR, Churn, LTV
- Usuarios activos
- Suscripciones nuevas
- Ingresos del mes

---

## 8. Eventos Principales

### 8.1. Eventos de Autenticación

```javascript
user_signed_up          // Usuario se registró
user_logged_in          // Usuario hizo login
user_logged_out         // Usuario cerró sesión
password_reset_requested // Usuario solicitó reset de contraseña
```

### 8.2. Eventos de Producto

```javascript
project_created         // Proyecto creado
project_updated         // Proyecto actualizado
project_deleted         // Proyecto eliminado
budget_created          // Presupuesto creado
budget_exported         // Presupuesto exportado
calculator_used         // Calculadora usada
material_added          // Material agregado
```

### 8.3. Eventos de Negocio

```javascript
pricing_viewed          // Usuario vio pricing
checkout_started        // Usuario inició checkout
subscription_created    // Suscripción creada
subscription_canceled   // Suscripción cancelada
subscription_upgraded   // Plan actualizado
```

### 8.4. Eventos de Error

```javascript
api_error               // Error en API
auth_error              // Error de autenticación
payment_error           // Error de pago
validation_error        // Error de validación
```

---

## 9. Privacy y Compliance

### 9.1. GDPR Compliance

PostHog y Sentry cumplen con GDPR:
- **PostHog:** https://posthog.com/privacy
- **Sentry:** https://sentry.io/privacy/

### 9.2. Configuración de Privacidad

```javascript
// PostHog: No capturar datos sensibles
posthog.capture('event_name', {
  // ✅ Capturar
  event_type: 'project_created',
  project_type: 'gas',
  
  // ❌ NO capturar
  // user_email: 'personal@email.com',
  // user_phone: '+34 600 000 000',
  // project_address: 'Calle Personal 123'
})

// Sentry: Enmascarar datos sensibles
Sentry.init({
  beforeSend(event) {
    // Enmascarar email
    if (event.user) {
      event.user.email = undefined
    }
    
    // Enmascarar IP
    event.user.ip_address = undefined
    
    return event
  }
})
```

### 9.3. Cookie Consent

Implementar banner de cookies:
```javascript
// src/components/CookieConsent.jsx
import { useState } from 'react'
import { initPostHog } from '../lib/posthog'

export default function CookieConsent() {
  const [accepted, setAccepted] = useState(false)

  function handleAccept() {
    setAccepted(true)
    initPostHog()
    localStorage.setItem('cookies_accepted', 'true')
  }

  if (accepted || localStorage.getItem('cookies_accepted')) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          Utilizamos cookies para mejorar tu experiencia.
        </p>
        <button
          onClick={handleAccept}
          className="bg-blue-600 px-4 py-2 rounded-lg text-sm"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
```

---

## 10. Troubleshooting

### PostHog no captura eventos

**Solución:**
1. Verifica que VITE_POSTHOG_KEY esté configurada
2. Verifica que initPostHog() se llame en main.jsx
3. Verifica en PostHog Dashboard > Data Management > Events

### Sentry no captura errores

**Solución:**
1. Verifica que VITE_SENTRY_DSN esté configurada
2. Verifica que initSentry() se llame en main.jsx
3. Verifica en Sentry Dashboard > Issues

### Eventos duplicados

**Solución:**
```javascript
// Usar distinct_id para evitar duplicados
posthog.capture('event_name', {
  distinct_id: user.id
})
```

---

## 11. Costos

### PostHog

- **Free:** 1M eventos/mes, 1 proyecto
- **Cloud:** $0.0001 por evento después de 1M
- **Self-hosted:** Gratis (requiere servidor)

### Sentry

- **Free:** 5K errores/mes, 1 proyecto
- **Team:** $26/mes (50K errores)
- **Business:** $80/mes (300K errores)

### Estimación para GestiObra (mes 1)

- **PostHog:** ~10K eventos → Gratis
- **Sentry:** ~100 errores → Gratis
- **Total:** €0/mes

---

**Responsable:** Cristóbal Soto  
**Última revisión:** 5 de Julio de 2026  
**Próxima revisión:** 5 de Agosto de 2026