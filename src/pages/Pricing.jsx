// Página de Pricing - Planes y Precios
// Ubicación: src/pages/Pricing.jsx

import { useState } from 'react'
import { useSubscription } from '../hooks/useSubscription'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    features: [
      '3 usuarios',
      '5 obras activas',
      'Calculadoras básicas (ACS, GLP)',
      'Biblia técnica',
      'Soporte por email'
    ],
    priceId: 'price_basic',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    features: [
      '10 usuarios',
      '20 obras activas',
      'Todas las calculadoras',
      'Biblia técnica completa',
      'Gestión de materiales',
      'Exportación de cálculos',
      'Soporte prioritario'
    ],
    priceId: 'price_pro',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    features: [
      'Usuarios ilimitados',
      'Obras ilimitadas',
      'Todas las funcionalidades',
      'API access',
      'Soporte 24/7',
      'Formación personalizada',
      'SLA garantizado'
    ],
    priceId: 'price_enterprise',
    popular: false
  }
]

export default function Pricing({ navigate }) {
  const [loading, setLoading] = useState(false)
  const { subscription } = useSubscription()

  async function handleSubscribe(priceId) {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      const { sessionId } = await response.json()
      
      // Redirigir a Stripe Checkout
      const stripe = await import('../lib/stripe').then(m => m.getStripe())
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        console.error('Error:', error)
        alert('Error al procesar el pago. Por favor, intenta de nuevo.')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error al procesar el pago. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Planes y Precios
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Elige el plan perfecto para tu empresa. Todos los planes incluyen 
          acceso a las calculadoras técnicas y la biblia técnica.
        </p>
      </div>

      {/* Planes */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border-2 p-8 relative ${
              plan.popular 
                ? 'border-blue-600 shadow-xl scale-105' 
                : 'border-slate-200 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  Más Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {plan.name}
              </h3>
              
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-slate-900">
                  €{plan.price}
                </span>
                <span className="text-slate-600">/mes</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5">✓</span>
                  <span className="text-sm text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading || subscription?.plan_id === plan.id}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Procesando...' : 
               subscription?.plan_id === plan.id ? 'Plan Actual' : 
               'Suscribirse'}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Preguntas Frecuentes
        </h2>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              ¿Puedo cambiar de plan en cualquier momento?
            </h3>
            <p className="text-slate-600">
              Sí, puedes cambiar de plan en cualquier momento desde tu panel de facturación. 
              Los cambios se aplican inmediatamente y se prorratea el costo.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              ¿Hay período de prueba?
            </h3>
            <p className="text-slate-600">
              Sí, ofrecemos 7 días de prueba gratuita en todos los planes. 
              No se requiere tarjeta de crédito para la prueba.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              ¿Cómo funciona la facturación?
            </h3>
            <p className="text-slate-600">
              La facturación es mensual y automática. Recibirás un email con tu factura 
              cada mes. Puedes ver y descargar todas tus facturas desde el panel de facturación.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              ¿Puedo cancelar en cualquier momento?
            </h3>
            <p className="text-slate-600">
              Sí, puedes cancelar tu suscripción en cualquier momento desde el panel de facturación. 
              Tu acceso continuará hasta el final del período pagado.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              ¿Qué métodos de pago aceptan?
            </h3>
            <p className="text-slate-600">
              Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express). 
              También aceptamos pagos mediante Stripe Link.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a las empresas que ya usan GestiObra para gestionar sus obras de forma profesional.
          </p>
          <button
            onClick={() => handleSubscribe('price_pro')}
            disabled={loading}
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            Comenzar Prueba Gratuita
          </button>
        </div>
      </div>
    </div>
  )
}