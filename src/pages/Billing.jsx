// Página de Billing - Gestión de Suscripción
// Ubicación: src/pages/Billing.jsx

import { useState, useEffect } from 'react'
import { useSubscription } from '../hooks/useSubscription'

export default function Billing({ navigate }) {
  const { subscription, loading, refetch } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Recargar suscripción al montar (por si vuelve del checkout)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success')) {
      refetch()
    }
  }, [refetch])

  async function openCustomerPortal() {
    setPortalLoading(true)
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      } else {
        alert('Error al abrir el portal de facturación')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error al abrir el portal de facturación')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si no hay suscripción activa
  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Sin Suscripción Activa
          </h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Suscríbete a uno de nuestros planes para acceder a todas las funcionalidades 
            de GestiObra y gestionar tus obras de forma profesional.
          </p>
          <button
            onClick={() => navigate('pricing')}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver Planes y Precios
          </button>
        </div>
      </div>
    )
  }

  // Calcular días restantes
  const periodEnd = new Date(subscription.current_period_end)
  const now = new Date()
  const daysRemaining = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Facturación y Suscripción
        </h1>
        <p className="text-slate-600">
          Gestiona tu plan y método de pago
        </p>
      </div>

      {/* Plan Actual */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Plan {subscription.plans?.name || subscription.plan_id}
            </h2>
            <p className="text-slate-600">
              €{subscription.plans?.price || 0}/mes
            </p>
          </div>
          
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            subscription.status === 'active'
              ? 'bg-green-100 text-green-700'
              : subscription.status === 'past_due'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {subscription.status === 'active' && '✓ Activo'}
            {subscription.status === 'past_due' && '⚠️ Pago Pendiente'}
            {subscription.status === 'canceled' && '✗ Cancelado'}
            {subscription.status === 'incomplete' && '⏳ Incompleto'}
          </span>
        </div>

        {/* Información del período */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            Próxima facturación
          </h3>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Fecha</p>
              <p className="text-lg font-semibold text-slate-900">
                {periodEnd.toLocaleDateString('es-ES', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Días restantes</p>
              <p className="text-lg font-semibold text-slate-900">
                {daysRemaining} días
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="border-t border-slate-200 pt-6 mt-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? 'Cargando...' : 'Gestionar Suscripción'}
            </button>
            
            <button
              onClick={() => navigate('pricing')}
              className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cambiar Plan
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Cambiar plan, actualizar método de pago, ver facturas
          </p>
        </div>
      </div>

      {/* Historial de Facturas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">
          Historial de Facturas
        </h3>
        <p className="text-slate-600 mb-4">
          Puedes ver y descargar todas tus facturas desde el portal de facturación.
        </p>
        <button
          onClick={openCustomerPortal}
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
        >
          Ver todas las facturas →
        </button>
      </div>

      {/* Información de Soporte */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          ¿Necesitas ayuda?
        </h3>
        <p className="text-slate-600 mb-4">
          Si tienes preguntas sobre tu suscripción o facturación, contacta con nosotros.
        </p>
        <a
          href="mailto:soporte@gestiobra.com"
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Contactar con Soporte →
        </a>
      </div>
    </div>
  )
}