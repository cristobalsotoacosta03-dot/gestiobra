# Programa Beta Cerrada

## Sistema de Invitaciones para GestiObra

---

## 1. Objetivo de la Beta

### 1.1. ¿Por qué una Beta Cerrada?

- **Control:** Limitar acceso a usuarios seleccionados
- **Feedback:** Obtener feedback de usuarios reales antes del lanzamiento público
- **Estabilidad:** Probar la app con carga real sin exponerla a todo el público
- **Iteración:** Mejorar el producto basándose en uso real

### 1.2. Objetivos de la Beta

1. **Onboarding:** Probar flujo de registro y primera experiencia
2. **Funcionalidades:** Validar que las features principales funcionan
3. **Performance:** Medir velocidad y estabilidad con usuarios reales
4. **Pricing:** Validar que los precios son aceptables
5. **Feedback:** Recoger sugerencias y bugs

### 1.3. Métricas de Éxito

- **Registros:** 50-100 usuarios beta
- **Retención D7:** >40% (usuarios que vuelven después de 7 días)
- **Retención D30:** >20% (usuarios que vuelven después de 30 días)
- **NPS:** >50 (satisfacción)
- **Bugs críticos:** 0 (ningún bug que impida usar la app)

---

## 2. Sistema de Invitaciones

### 2.1. Método 1: Códigos de Invitación

#### Ventajas
- Fácil de compartir
- Control granular (un código = un usuario)
- Puedes revocar códigos individualmente

#### Desventajas
- Menos escalable
- Requiere gestión manual

### 2.2. Método 2: Whitelist de Emails

#### Ventajas
- Más seguro
- No requiere gestión de códigos
- Automático

#### Desventajas
- Menos flexible
- Requiere mantener lista de emails

### 2.3. Método Recomendado: Híbrido

Combinar ambos métodos:
- **Whitelist** para usuarios VIP (inversores, beta testers clave)
- **Códigos** para el resto (permite compartir)

---

## 3. Implementación

### 3.1. Esquema de Base de Datos

```sql
-- Tabla: invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  email TEXT, -- NULL = código genérico
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE, -- NULL hasta que se canjee
  max_uses INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_invitations_code ON invitations(code);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_empresa_id ON invitations(empresa_id);

-- Tabla: beta_users (para tracking)
CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  feedback_submitted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_beta_users_user_id ON beta_users(user_id);
CREATE INDEX idx_beta_users_signup_date ON beta_users(signup_date);
```

### 3.2. API Routes

#### Crear Invitación (Admin)

```javascript
// api/beta/invitations.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Generar código aleatorio
function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function POST(request) {
  try {
    // Verificar que el usuario es admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*, roles(*)')
      .eq('auth_id', user.id)
      .single()

    if (!usuario?.roles?.permisos?.includes('*')) {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { email, maxUses, expiresInDays } = await request.json()

    // Verificar si ya existe una invitación para este email
    if (email) {
      const { data: existing } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', email)
        .is('used_at', null)
        .gt('expires_at', new Date())
        .single()

      if (existing) {
        return Response.json({ 
          error: 'Ya existe una invitación activa para este email' 
        }, { status: 400 })
      }
    }

    // Crear invitación
    const code = generateCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30))

    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        code,
        email,
        max_uses: maxUses || 1,
        expires_at: expiresAt,
        created_by: usuario.id
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ invitation })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener todas las invitaciones
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('*, created_by_user:usuarios!created_by(nombre)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ invitations })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
```

#### Validar Invitación

```javascript
// api/beta/validate.js
export async function POST(request) {
  try {
    const { code, email } = await request.json()

    // Buscar invitación por código o email
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .or(`code.eq.${code},and(email.eq.${email},code.is.null)`)
      .is('used_at', null)
      .gt('expires_at', new Date())
      .single()

    if (error || !invitation) {
      return Response.json({ 
        valid: false, 
        message: 'Código de invitación inválido o expirado' 
      }, { status: 400 })
    }

    // Verificar que no se haya excedido el límite de usos
    if (invitation.uses_count >= invitation.max_uses) {
      return Response.json({ 
        valid: false, 
        message: 'Este código de invitación ya ha sido usado' 
      }, { status: 400 })
    }

    return Response.json({ 
      valid: true, 
      invitation: {
        code: invitation.code,
        email: invitation.email,
        expiresAt: invitation.expires_at
      }
    })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
```

#### Canjear Invitación

```javascript
// api/beta/redeem.js
export async function POST(request) {
  try {
    const { code, email } = await request.json()

    // Validar invitación
    const validation = await validateInvitation(code, email)
    
    if (!validation.valid) {
      return Response.json(validation, { status: 400 })
    }

    // Marcar invitación como usada
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ 
        used_at: new Date(),
        uses_count: supabase.raw('uses_count + 1')
      })
      .eq('code', validation.invitation.code)

    if (updateError) throw updateError

    return Response.json({ 
      success: true, 
      message: 'Invitación canjeada exitosamente' 
    })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
```

---

## 4. Páginas de Beta

### 4.1. Página de Aterrizaje (/beta)

```javascript
// src/pages/Beta.jsx
import { useState } from 'react'

export default function Beta({ navigate }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validar invitación
      const validation = await fetch('/api/beta/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email })
      }).then(r => r.json())

      if (!validation.valid) {
        setError(validation.message)
        setLoading(false)
        return
      }

      // Redirigir a registro
      navigate('signup', { code, email })
    } catch (err) {
      setError('Error al validar invitación')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            ¡Estás en la lista!
          </h1>
          <p className="text-slate-600 mb-6">
            Te enviaremos un email cuando tu acceso esté listo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            GestiObra Beta
          </h1>
          <p className="text-slate-600">
            Acceso exclusivo para beta testers
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>¿Tienes un código de invitación?</strong><br>
            Ingresa tu email y el código para acceder a la beta cerrada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Código de Invitación
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              placeholder="ABC12345"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Validando...' : 'Acceder a la Beta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            ¿No tienes invitación?{' '}
            <a href="mailto:beta@gestiobra.com" className="text-blue-600 hover:underline">
              Solicitar acceso
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 4.2. Página de Solicitud de Acceso

```javascript
// src/pages/BetaRequest.jsx
import { useState } from 'react'

export default function BetaRequest() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    cargo: '',
    motivo: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // Guardar solicitud en base de datos
      await supabase.from('beta_requests').insert({
        ...formData,
        status: 'pending'
      })

      // Enviar email de notificación al equipo
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'beta@gestiobra.com',
          subject: 'Nueva solicitud de acceso a Beta',
          html: `
            <h2>Nueva solicitud de Beta</h2>
            <p><strong>Nombre:</strong> ${formData.nombre}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Empresa:</strong> ${formData.empresa}</p>
            <p><strong>Cargo:</strong> ${formData.cargo}</p>
            <p><strong>Motivo:</strong> ${formData.motivo}</p>
          `
        })
      })

      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Solicitud Enviada
          </h1>
          <p className="text-slate-600 mb-6">
            Gracias por tu interés. Te contactaremos pronto con tu código de invitación.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Solicitar Acceso a Beta
          </h1>
          <p className="text-slate-600">
            Cuéntanos por qué quieres ser parte de la beta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email profesional
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Empresa
            </label>
            <input
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cargo
            </label>
            <input
              type="text"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Por qué quieres participar en la beta?
            </label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## 5. Panel de Administración

### 5.1. Dashboard de Beta

```javascript
// src/pages/admin/BetaDashboard.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function BetaDashboard() {
  const [stats, setStats] = useState({
    totalInvitations: 0,
    usedInvitations: 0,
    pendingRequests: 0,
    activeUsers: 0
  })
  const [invitations, setInvitations] = useState([])
  const [requests, setRequests] = useState([])

  useEffect(() => {
    loadStats()
    loadInvitations()
    loadRequests()
  }, [])

  async function loadStats() {
    const { data: invitations } = await supabase
      .from('invitations')
      .select('*')

    const { data: betaUsers } = await supabase
      .from('beta_users')
      .select('*')

    const { data: requests } = await supabase
      .from('beta_requests')
      .select('*')
      .eq('status', 'pending')

    setStats({
      totalInvitations: invitations?.length || 0,
      usedInvitations: invitations?.filter(i => i.used_at).length || 0,
      pendingRequests: requests?.length || 0,
      activeUsers: betaUsers?.length || 0
    })
  }

  async function loadInvitations() {
    const { data } = await supabase
      .from('invitations')
      .select('*, created_by_user:usuarios!created_by(nombre)')
      .order('created_at', { ascending: false })

    setInvitations(data || [])
  }

  async function loadRequests() {
    const { data } = await supabase
      .from('beta_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setRequests(data || [])
  }

  async function approveRequest(requestId) {
    // Generar código de invitación
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    // Crear invitación
    const { data: request } = await supabase
      .from('beta_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    const { data: invitation } = await supabase
      .from('invitations')
      .insert({
        code,
        email: request.email,
        max_uses: 1,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .select()
      .single()

    // Marcar solicitud como aprobada
    await supabase
      .from('beta_requests')
      .update({ status: 'approved', invitation_id: invitation.id })
      .eq('id', requestId)

    // Enviar email con código
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON({
        to: request.email,
        subject: 'Tu acceso a GestiObra Beta',
        html: `
          <h2>¡Bienvenido a GestiObra Beta!</h2>
          <p>Tu código de invitación es: <strong>${code}</strong></p>
          <p>Ingresa en: https://gestiobra.vercel.app/beta</p>
        `
      })
    })

    loadStats()
    loadRequests()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Dashboard Beta
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Invitaciones Totales</p>
          <p className="text-3xl font-bold text-slate-900">{stats.totalInvitations}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Invitaciones Usadas</p>
          <p className="text-3xl font-bold text-slate-900">{stats.usedInvitations}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Solicitudes Pendientes</p>
          <p className="text-3xl font-bold text-slate-900">{stats.pendingRequests}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Usuarios Activos</p>
          <p className="text-3xl font-bold text-slate-900">{stats.activeUsers}</p>
        </div>
      </div>

      {/* Solicitudes pendientes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Solicitudes Pendientes
        </h2>
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900">{request.nombre}</p>
                <p className="text-sm text-slate-600">{request.email} - {request.empresa}</p>
                <p className="text-sm text-slate-500 mt-1">{request.motivo}</p>
              </div>
              <button
                onClick={() => approveRequest(request.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Aprobar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invitaciones */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Invitaciones
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4">Código</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Expira</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map(inv => (
                <tr key={inv.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 font-mono">{inv.code}</td>
                  <td className="py-3 px-4">{inv.email || 'Genérico'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inv.used_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.used_at ? 'Usada' : 'Disponible'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(inv.expires_at).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

---

## 6. Flujo de Usuario Beta

### 6.1. Flujo Completo

```
1. Usuario visita /beta
   ↓
2. Ingresa email y código de invitación
   ↓
3. Sistema valida código
   ↓
4. Redirige a /signup con código pre-llenado
   ↓
5. Usuario completa registro
   ↓
6. Sistema canjea código de invitación
   ↓
7. Crea registro en beta_users
   ↓
8. Redirige a /dashboard
   ↓
9. Usuario puede usar la app
```

### 6.2. Modificaciones en Registro

```javascript
// En LoginPage.jsx o SignupPage.jsx
async function handleSignup(email, password, invitationCode) {
  // 1. Validar invitación
  if (invitationCode) {
    const validation = await fetch('/api/beta/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: invitationCode, email })
    }).then(r => r.json())

    if (!validation.valid) {
      setError('Código de invitación inválido')
      return
    }
  }

  // 2. Crear usuario
  const { user, error } = await signUp(email, password)
  
  if (error) {
    setError(error.message)
    return
  }

  // 3. Canjear invitación
  if (invitationCode) {
    await fetch('/api/beta/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: invitationCode, email })
    })

    // 4. Crear registro en beta_users
    await supabase.from('beta_users').insert({
      user_id: user.id,
      invitation_code: invitationCode
    })
  }

  // 5. Redirigir a dashboard
  navigate('dashboard')
}
```

---

## 7. Gestión de Beta

### 7.1. Generar Códigos en Lote

```javascript
// scripts/generate-beta-codes.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function generateCodes(count, expiresInDays = 30) {
  const codes = []
  
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    codes.push({
      code,
      max_uses: 1,
      expires_at: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    })
  }

  const { data, error } = await supabase
    .from('invitations')
    .insert(codes)
    .select()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`✅ ${data.length} códigos generados:`)
  data.forEach(inv => {
    console.log(`  - ${inv.code}`)
  })
}

generateCodes(50) // Generar 50 códigos
```

### 7.2. Enviar Invitaciones por Email

```javascript
// scripts/send-beta-invitations.js
import { createClient } from '@supabase/supabase-js'
import { resend } from '../src/lib/email'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sendInvitations() {
  // Obtener solicitudes aprobadas sin enviar
  const { data: requests } = await supabase
    .from('beta_requests')
    .select('*')
    .eq('status', 'approved')
    .is('invitation_sent', null)

  for (const request of requests) {
    // Obtener invitación
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', request.email)
      .single()

    // Enviar email
    await resend.emails.send({
      from: 'GestiObra Beta <beta@gestiobra.com>',
      to: request.email,
      subject: 'Tu acceso a GestiObra Beta',
      html: `
        <h2>¡Bienvenido a GestiObra Beta!</h2>
        <p>Hola ${request.nombre},</p>
        <p>Tu solicitud de acceso a la beta ha sido aprobada.</p>
        <p><strong>Tu código de invitación es:</strong></p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-family: monospace; letter-spacing: 4px;">
          ${invitation.code}
        </div>
        <p>Ingresa en: <a href="https://gestiobra.vercel.app/beta">https://gestiobra.vercel.app/beta</a></p>
        <p>Este código expira el: ${new Date(invitation.expires_at).toLocaleDateString('es-ES')}</p>
      `
    })

    // Marcar como enviado
    await supabase
      .from('beta_requests')
      .update({ invitation_sent: true })
      .eq('id', request.id)

    console.log(`✅ Invitación enviada a ${request.email}`)
  }
}

sendInvitations()
```

---

## 8. Desactivar Modo Beta

### 8.1. Criterios para Cerrar Beta

- [ ] 50+ usuarios registrados
- [ ] Retención D7 > 40%
- [ ] Sin bugs críticos por 2 semanas
- [ ] Feedback positivo (NPS > 50)
- [ ] Performance estable (< 2s carga)

### 8.2. Proceso de Cierre

1. **Comunicar fin de beta:**
   - Email a todos los beta users
   - Aviso en la app
   - 2 semanas de anticipación

2. **Migrar a producción:**
   - Eliminar restricción de invitaciones
   - Abrir registro público
   - Mantener datos de beta users

3. **Recompensar beta users:**
   - Descuento del 20% por 6 meses
   - Badge de "Beta Tester" en perfil
   - Acceso prioritario a nuevas features

### 8.3. Código para Desactivar Beta

```javascript
// src/lib/beta.js
export function isBetaMode() {
  // Cambiar a false para cerrar beta
  return import.meta.env.VITE_BETA_MODE === 'true'
}

export function checkBetaAccess() {
  if (!isBetaMode()) {
    return { allowed: true }
  }

  // Verificar si el usuario tiene acceso beta
  const betaUser = localStorage.getItem('beta_user')
  
  if (betaUser) {
    return { allowed: true }
  }

  return { 
    allowed: false, 
    redirect: '/beta' 
  }
}
```

---

## 9. Documentación para Usuarios Beta

### 9.1. Guía de Inicio Rápido

```markdown
# Guía de Inicio Rápido - GestiObra Beta

## Bienvenido

Gracias por participar en la beta de GestiObra. Tu feedback es invaluable.

## Primeros Pasos

1. **Completa tu perfil**
   - Ve a Configuración > Perfil
   - Agrega información de tu empresa

2. **Crea tu primera obra**
   - Ve a Obras > Nueva Obra
   - Completa los datos básicos

3. **Genera un presupuesto**
   - Ve a Presupuestos > Nuevo
   - Selecciona la obra
   - Agrega partidas

4. **Prueba las calculadoras**
   - Ve a Calculadoras
   - Prueba ACS, GLP y Tuberías

## Reportar Bugs

- Email: bugs@gestiobra.com
- Incluye: Descripción, pasos para reproducir, capturas de pantalla

## Dar Feedback

- Email: feedback@gestiobra.com
- Incluye: Tu experiencia, sugerencias, mejoras
```

---

## 10. Checklist de Lanzamiento Beta

### Pre-Launch

- [ ] Sistema de invitaciones implementado
- [ ] Páginas /beta y /beta-request creadas
- [ ] Panel de administración funcionando
- [ ] Emails de invitación funcionando
- [ ] Tracking de beta_users implementado
- [ ] Documentación de usuario lista
- [ ] 50 códigos de invitación generados
- [ ] Lista de beta testers definida

### Launch

- [ ] Enviar invitaciones a primeros 10 usuarios
- [ ] Monitorear errores en Sentry
- [ ] Monitorear eventos en PostHog
- [ ] Estar disponible para soporte
- [ ] Recolectar feedback diario

### Post-Launch

- [ ] Revisar métricas semanalmente
- [ ] Corregir bugs críticos inmediatamente
- [ ] Iterar basándose en feedback
- [ ] Preparar comunicado de cierre de beta

---

## 11. Costos

### Infraestructura

- **Supabase:** Gratis (hasta 50K usuarios)
- **Vercel:** Gratis (hobby plan)
- **Resend:** Gratis (100 emails/día)

### Tiempo

- **Implementación:** 8-12 horas
- **Gestión de beta:** 2-3 horas/semana
- **Soporte a usuarios:** 1-2 horas/día

---

**Responsable:** Cristóbal Soto  
**Última revisión:** 5 de Julio de 2026  
**Próxima revisión:** 5 de Agosto de 2026