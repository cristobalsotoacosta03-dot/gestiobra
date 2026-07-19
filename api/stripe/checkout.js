// API Route: Crear Checkout Session de Stripe
// Ubicación: /api/stripe/checkout.js

import { createClient } from '@supabase/supabase-js'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Crear cliente de Supabase con service role key (backend only)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { priceId, planId } = await request.json()

    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener datos del usuario desde la tabla usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*, empresas(*)')
      .eq('auth_id', user.id)
      .single()

    if (usuarioError || !usuario) {
      return Response.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // 3. Buscar o crear customer de Stripe
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', usuario.id)
      .single()

    let customerId = existingCustomer?.stripe_customer_id

    if (!customerId) {
      // Crear nuevo customer en Stripe
      const customer = await stripe.customers.create({
        email: usuario.email,
        name: usuario.nombre,
        metadata: {
          user_id: usuario.id,
          empresa_id: usuario.empresa_id
        }
      })

      customerId = customer.id

      // Guardar customer en BD
      await supabase.from('customers').insert({
        user_id: usuario.id,
        stripe_customer_id: customerId,
        email: usuario.email
      })
    }

    // 4. Crear checkout session
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
        user_id: usuario.id,
        plan_id: planId
      }
    })

    // 5. Retornar session ID
    return Response.json({ sessionId: session.id })

  } catch (err) {
    console.error('Error creating checkout session:', err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}