// Hook para gestionar suscripciones de Stripe
// Ubicación: src/hooks/useSubscription.js

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSubscription() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar suscripción al montar el componente
  useEffect(() => {
    loadSubscription()
  }, [])

  async function loadSubscription() {
    try {
      // 1. Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // 2. Obtener datos del usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (usuarioError || !usuario) {
        setLoading(false)
        return
      }

      // 3. Obtener suscripción activa
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('user_id', usuario.id)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString())
        .single()

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        // PGRST116 = no rows found (no hay suscripción activa)
        console.error('Error loading subscription:', subscriptionError)
        setError(subscriptionError.message)
      } else {
        setSubscription(subscriptionData)
      }
    } catch (err) {
      console.error('Error in loadSubscription:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Verificar si el usuario tiene acceso a una funcionalidad
  function hasAccess(feature) {
    if (!subscription) return false
    
    // Plan Enterprise tiene acceso a todo
    if (subscription.plan_id === 'enterprise') return true
    
    // Plan Pro tiene acceso a casi todo
    if (subscription.plan_id === 'pro') {
      // Definir qué features incluye Pro
      const proFeatures = ['calculators', 'projects', 'budgets', 'materials']
      return proFeatures.includes(feature)
    }
    
    // Plan Basic tiene acceso limitado
    if (subscription.plan_id === 'basic') {
      // Definir qué features incluye Basic
      const basicFeatures = ['calculators', 'projects']
      return basicFeatures.includes(feature)
    }
    
    return false
  }

  // Verificar si el usuario puede crear más recursos
  function canCreate(resourceType) {
    if (!subscription) return false
    
    const limits = {
      basic: { users: 3, projects: 5 },
      pro: { users: 10, projects: 20 },
      enterprise: { users: -1, projects: -1 } // -1 = ilimitado
    }
    
    const planLimits = limits[subscription.plan_id]
    if (!planLimits) return false
    
    // TODO: Implementar lógica de conteo de usuarios/proyectos
    // Por ahora retornar true si tiene suscripción activa
    return true
  }

  return {
    subscription,
    loading,
    error,
    hasAccess,
    canCreate,
    refetch: loadSubscription
  }
}