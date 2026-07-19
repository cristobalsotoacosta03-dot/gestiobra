// Cliente de Stripe para el frontend
// Ubicación: src/lib/stripe.js

import { loadStripe } from '@stripe/stripe-js'

// Cargar Stripe con la clave publishable (pública, segura para frontend)
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
)

// Función helper para obtener la instancia de Stripe
export async function getStripe() {
  const stripe = await stripePromise
  if (!stripe) {
    throw new Error('Stripe no está configurado')
  }
  return stripe
}