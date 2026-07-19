// Componente para proteger funcionalidades premium
// Ubicación: src/components/SubscriptionGate.jsx

import { useState } from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { getStripe } from '../lib/stripe'

export default function SubscriptionGate({ 
  children, 
  feature, 
  fallback = null,
  showUpgrade = true 
}) {
  const { hasAccess, loading, subscription } = useSubscription()
  const [showPricing, setShowPricing] = useState(false)

  // Mostrar loading mientras se verifica la suscripción
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si tiene acceso, mostrar el contenido
  if (hasAccess(feature)) {
    return children
  }

  // Si no tiene acceso y no hay suscripción, mostrar mensaje de upgrade
  if (!subscription) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Funcionalidad Premium
        </h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Esta funcionalidad requiere un plan de pago. 
          Suscríbete para acceder a todas las herramientas de GestiObra.
        </p>
        
        {showUpgrade && (
          <button
            onClick={() => setShowPricing(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver Planes y Precios
          </button>
        )}

        {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      </div>
    )
  }

  // Si tiene suscripción pero no acceso a esta feature específica
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center">
      <div className="text-6xl mb-4">⭐</div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        Mejora tu Plan
      </h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Tu plan actual no incluye esta funcionalidad. 
        Actualiza a un plan superior para desbloquearla.
      </p>
      
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setShowPricing(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Ver Planes
        </button>
        
        <button
          onClick={() => window.location.href = '/billing'}
          className="bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          Mi Suscripción
        </button>
      </div>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}

// Modal de Pricing (versión simplificada)
function PricingModal({ onClose }) {
  const [loading, setLoading] = useState(false)

  const plans = [
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

  async function handleSubscribe(priceId) {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      const { sessionId } = await response.json()
      
      const stripe = await getStripe()
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">
              Elige tu Plan
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border-2 p-6 ${
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
                  className={`w-full mt-6 py-3 rounded-xl font-semibold ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Procesando...' : 'Suscribirse'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}