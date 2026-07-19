// API Route: Customer Portal de Stripe
// Ubicación: /api/stripe/portal.js

import { createClient } from '@supabase/supabase-js'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Cliente de Supabase con service role key (backend only)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener datos del usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (usuarioError || !usuario) {
      return Response.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // 3. Buscar customer de Stripe
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', usuario.id)
      .single()

    if (customerError || !customer) {
      return Response.json(
        { error: 'Cliente de Stripe no encontrado' },
        { status: 404 }
      )
    }

    // 4. Crear sesión del customer portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL}/billing`
    })

    // 5. Retornar URL del portal
    return Response.json({ url: portalSession.url })

  } catch (err) {
    console.error('Error creando customer portal session:', err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}