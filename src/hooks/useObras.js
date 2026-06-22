import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { OBRAS_MOCK } from '../data/mocks'

export function useObras() {
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [modoDemo, setModoDemo] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setObras(OBRAS_MOCK)
      setModoDemo(true)
      setLoading(false)
      return
    }
    supabase
      .from('obras')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('Supabase error:', error); setObras(OBRAS_MOCK); setModoDemo(true) }
        else setObras(data || [])
        setLoading(false)
      })
  }, [])

  async function addObra(obraData) {
    if (!supabase) {
      setObras(prev => [{ ...obraData, id: String(Date.now()) }, ...prev])
      return
    }
    const { data, error } = await supabase.from('obras').insert([obraData]).select().single()
    if (!error && data) setObras(prev => [data, ...prev])
  }

  // KPIs derivados
  const activas    = obras.filter(o => o.estado === 'activa').length
  const pausadas   = obras.filter(o => o.estado === 'pausada').length
  const finalizadas = obras.filter(o => o.estado === 'finalizada').length

  return { obras, loading, modoDemo, addObra, kpi: { activas, pausadas, finalizadas } }
}
