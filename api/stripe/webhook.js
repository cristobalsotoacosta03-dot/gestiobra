// API Route: Webhook de Stripe
// Ubicación: /api/stripe/webhook.js

import { createClient } from '@supabase/supabase-js'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Cliente de Supabase con service role key (backend only)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // 1. Obtener el body y la firma del webhook
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return Response.json(
        { error: 'Firma de webhook faltante' },
        { status: 400 }
      )
    }

    // 2. Verificar la firma del webhook (CRÍTICO para seguridad)
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Error verificando firma de webhook:', err)
      return Response.json(
        { error: 'Firma de webhook inválida' },
        { status: 400 }
      )
    }

    // 3. Procesar el evento
    console.log(`📥 Webhook recibido: ${event.type}`)
    
    await handleWebhookEvent(event)

    // 4. Retornar éxito
    return Response.json({ received: true })

  } catch (err) {
    console.error('Error en webhook de Stripe:', err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      // Usuario completó el checkout de suscripción
      const session = event.data.object
      
      console.log('✅ Checkout completado:', session.id)
      
      // Obtener metadata
      const userId = session.metadata?.user_id
      const planId = session.metadata?.plan_id

      if (!userId || !planId) {
        console.error('Metadata faltante en checkout session')
        return
      }

      // Crear o actualizar suscripción en BD
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date(session.current_period_start * 1000).toISOString(),
          current_period_end: new Date(session.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'stripe_subscription_id'
        })

      if (subError) {
        console.error('Error creando suscripción:', subError)
        return
      }

      console.log(`✅ Suscripción creada para usuario: ${userId}`)
      
      // TODO: Enviar email de confirmación
      // await sendSubscriptionConfirmationEmail(userId, planId)
      
      break
    }

    case 'customer.subscription.created': {
      // Nueva suscripción creada
      const subscription = event.data.object
      
      console.log('📝 Suscripción creada en Stripe:', subscription.id)
      
      // Actualizar estado en BD
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      
      break
    }

    case 'customer.subscription.updated': {
      // Suscripción actualizada (cambio de plan, renovación, etc.)
      const subscription = event.data.object
      
      console.log('🔄 Suscripción actualizada:', subscription.id)
      
      // Actualizar en BD
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      
      break
    }

    case 'customer.subscription.deleted': {
      // Suscripción cancelada
      const subscription = event.data.object
      
      console.log('❌ Suscripción cancelada:', subscription.id)
      
      // Marcar como cancelada en BD
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      
      // TODO: Enviar email de cancelación
      // await sendSubscriptionCanceledEmail(subscription.metadata.user_id)
      
      break
    }

    case 'invoice.payment_succeeded': {
      // Pago exitoso
      const invoice = event.data.object
      
      console.log('💰 Pago exitoso:', invoice.id)
      
      // Actualizar fecha de próxima facturación
      if (invoice.subscription) {
        await supabase
          .from('subscriptions')
          .update({
            current_period_start: new Date(invoice.period_start * 1000).toISOString(),
            current_period_end: new Date(invoice.period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', invoice.subscription)
      }
      
      // TODO: Enviar recibo/factura por email
      // await sendInvoiceEmail(invoice)
      
      break
    }

    case 'invoice.payment_failed': {
      // Pago fallido
      const invoice = event.data.object
      
      console.log('⚠️ Pago fallido:', invoice.id)
      
      // Marcar suscripción como past_due
      if (invoice.subscription) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', invoice.subscription)
      }
      
      // Obtener usuario para enviar email
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', invoice.subscription)
        .single()
      
      if (subscription) {
        // TODO: Enviar email de pago fallido
        // await sendPaymentFailedEmail(subscription.user_id, invoice.amount_due / 100)
      }
      
      break
    }

    default:
      console.log(`ℹ️ Evento no manejado: ${event.type}`)
  }
}