import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Usuario administrador mock para desarrollo local sin Supabase
const ADMIN_MOCK = {
  id: 'admin-local-001',
  email: 'cristobalsotoacosta03@gmail.com',
  password: 'Sopero45',
  usuario: {
    id: '00000000-0000-0000-0000-000000000001',
    auth_id: 'admin-local-001',
    nombre: 'Cristóbal Soto',
    email: 'cristobalsotoacosta03@gmail.com',
    empresa_id: '00000000-0000-0000-0000-000000000001',
    rol_id: '00000000-0000-0000-0000-000000000002',
    roles: {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'Administrador',
      permisos: ['*'] // Todos los permisos
    },
    empresas: {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'GestiObra Demo'
    }
  }
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMockMode, setIsMockMode] = useState(false)

  // Obtener sesión actual
  useEffect(() => {
    const getSession = async () => {
      try {
        // Modo mock: Supabase no configurado
        if (!supabase) {
          console.log('🔧 Modo desarrollo local activado (sin Supabase)')
          setIsMockMode(true)
          setLoading(false)
          return
        }

        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError) throw authError
        
        if (session?.user) {
          setUser(session.user)
          // Obtener datos del usuario desde la tabla usuarios
          const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuarios')
            .select('*, roles(*), empresas(*)')
            .eq('auth_id', session.user.id)
            .single()
          
          if (usuarioError && usuarioError.code !== 'PGRST116') {
            console.error('Error fetching usuario:', usuarioError)
          } else {
            setUsuario(usuarioData)
          }
        }
      } catch (err) {
        console.error('Error in getSession:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escuchar cambios de autenticación (solo si Supabase está disponible)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user)
            const { data: usuarioData } = await supabase
              .from('usuarios')
              .select('*, roles(*), empresas(*)')
              .eq('auth_id', session.user.id)
              .single()
            setUsuario(usuarioData)
          } else {
            setUser(null)
            setUsuario(null)
          }
        }
      )

      return () => subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, nombre, empresa_id) => {
    // Modo mock: no permite registro
    if (!supabase) {
      setError('Modo desarrollo: use las credenciales de administrador')
      return { user: null, error: new Error('Modo desarrollo: use las credenciales de administrador') }
    }

    try {
      setLoading(true)
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (signUpError) throw signUpError
      
      // Crear registro en tabla usuarios
      if (newUser) {
        const { error: userTableError } = await supabase
          .from('usuarios')
          .insert({
            auth_id: newUser.id,
            nombre,
            email,
            empresa_id,
            rol_id: '00000000-0000-0000-0000-000000000001', // Rol por defecto
          })
        
        if (userTableError) throw userTableError
      }
      
      return { user: newUser, error: null }
    } catch (err) {
      setError(err.message)
      return { user: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    // Modo mock: validar contra credenciales de administrador
    if (!supabase) {
      try {
        setLoading(true)
        
        // Pequeña pausa para simular validación
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (email === ADMIN_MOCK.email && password === ADMIN_MOCK.password) {
          setUser(ADMIN_MOCK)
          setUsuario(ADMIN_MOCK.usuario)
          setError(null)
          return { user: ADMIN_MOCK, error: null }
        } else {
          const authError = new Error('Email o contraseña incorrectos')
          setError(authError.message)
          return { user: null, error: authError }
        }
      } catch (err) {
        setError(err.message)
        return { user: null, error: err }
      } finally {
        setLoading(false)
      }
    }

    // Modo Supabase real
    try {
      setLoading(true)
      const { data: { user: signInUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) throw signInError
      
      return { user: signInUser, error: null }
    } catch (err) {
      setError(err.message)
      return { user: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    // Modo mock: limpiar estado local
    if (!supabase) {
      try {
        setLoading(true)
        setUser(null)
        setUsuario(null)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
      return
    }

    // Modo Supabase real
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setUsuario(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permiso) => {
    if (!usuario?.roles) return false
    return usuario.roles.permisos?.includes(permiso) || usuario.roles.permisos?.includes('*')
  }

  return {
    user,
    usuario,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    hasPermission,
    isAuthenticated: !!user,
    isMockMode,
  }
}
