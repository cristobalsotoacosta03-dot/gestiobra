// Configuración de Sentry (Monitoreo de Errores)
// Ubicación: src/lib/sentry.js

// Placeholder para Sentry
// Se activará cuando se configure el DSN en Vercel

let sentry = null

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    console.log('ℹ️ Sentry no configurado (opcional)')
    return null
  }

  try {
    // Importar dinámicamente para no romper si no está instalado
    import('@sentry/react').then((module) => {
      sentry = module.init({
        dsn: dsn,
        environment: import.meta.env.MODE || 'production',
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        // Integraciones
        integrations: [
          new module.BrowserTracing(),
          new module.Replay({
            maskAllText: true,
            blockAllMedia: true
          })
        ],
        
        // Filtros de errores
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'Network request failed',
          'Loading chunk'
        ]
      })

      console.log('✅ Sentry inicializado')
    }).catch((err) => {
      console.warn('⚠️ Sentry no instalado. Ejecuta: npm install @sentry/react')
    })
  } catch (error) {
    console.warn('⚠️ Error al inicializar Sentry:', error)
  }

  return sentry
}

// Función helper para reportar errores manualmente
export function captureException(error, context = {}) {
  if (sentry) {
    sentry.captureException(error, {
      extra: context
    })
  } else {
    console.error('Error (Sentry no configurado):', error, context)
  }
}

// Función helper para reportar mensajes
export function captureMessage(message, level = 'info') {
  if (sentry) {
    sentry.captureMessage(message, level)
  }
}

// Función helper para agregar contexto al usuario
export function setUserContext(user) {
  if (sentry && user) {
    sentry.setUser({
      id: user.id,
      email: user.email,
      empresa_id: user.empresa_id
    })
  }
}

// Función helper para limpiar contexto de usuario
export function clearUserContext() {
  if (sentry) {
    sentry.setUser(null)
  }
}

// Wrapper para fetch con tracking de errores
export function trackedFetch(url, options = {}) {
  return fetch(url, options).catch((error) => {
    captureException(error, {
      url,
      method: options.method || 'GET',
      timestamp: new Date().toISOString()
    })
    throw error
  })
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  trackedFetch
}