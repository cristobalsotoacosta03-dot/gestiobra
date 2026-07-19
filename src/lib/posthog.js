// Configuración de PostHog (Analítica)
// Ubicación: src/lib/posthog.js

// Placeholder para PostHog
// Se activará cuando se configure la API key en Vercel

let posthog = null

export function initPostHog() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

  if (!apiKey) {
    console.log('ℹ️ PostHog no configurado (opcional)')
    return null
  }

  try {
    // Importar dinámicamente para no romper si no está instalado
    import('posthog-js').then((module) => {
      posthog = module.default(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true
      })

      console.log('✅ PostHog inicializado')
    }).catch((err) => {
      console.warn('⚠️ PostHog no instalado. Ejecuta: npm install posthog-js')
    })
  } catch (error) {
    console.warn('⚠️ Error al inicializar PostHog:', error)
  }

  return posthog
}

// Función helper para trackear eventos
export function trackEvent(eventName, properties = {}) {
  if (posthog) {
    posthog.capture(eventName, properties)
  }
}

// Función helper para identificar usuario
export function identifyUser(userId, properties = {}) {
  if (posthog) {
    posthog.identify(userId, properties)
  }
}

// Función helper para resetear identidad
export function resetUser() {
  if (posthog) {
    posthog.reset()
  }
}

// Función helper para trackear página vista
export function trackPageView(pageName) {
  if (posthog) {
    posthog.capture('$pageview', { page: pageName })
  }
}

// Eventos predefinidos para GestiObra
export const EVENTS = {
  // Autenticación
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Obras
  OBRA_CREATED: 'obra_created',
  OBRA_UPDATED: 'obra_updated',
  OBRA_DELETED: 'obra_deleted',
  OBRA_VIEWED: 'obra_viewed',
  
  // Presupuestos
  PRESUPUESTO_CREATED: 'presupuesto_created',
  PRESUPUESTO_UPDATED: 'presupuesto_updated',
  PRESUPUESTO_SENT: 'presupuesto_sent',
  PRESUPUESTO_ACCEPTED: 'presupuesto_accepted',
  
  // Materiales
  MATERIAL_CREATED: 'material_created',
  MATERIAL_UPDATED: 'material_updated',
  MATERIAL_DELETED: 'material_deleted',
  
  // Horas
  HORA_IMPUTADA: 'hora_imputada',
  HORA_VALIDADA: 'hora_validada',
  
  // Pagos
  PRICING_VIEWED: 'pricing_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  CUSTOMER_PORTAL_OPENED: 'customer_portal_opened',
  
  // Calculadoras
  CALCULATOR_USED: 'calculator_used',
  
  // Errores
  ERROR_OCCURRED: 'error_occurred'
}

export default {
  initPostHog,
  trackEvent,
  identifyUser,
  resetUser,
  trackPageView,
  EVENTS
}