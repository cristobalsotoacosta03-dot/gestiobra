import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function GestorPersonal() {
  const { usuario } = useAuth()
  const [personal, setPersonal] = useState([])
  const [perfiles, setPerfiles] = useState([])
  const [showFormPersonal, setShowFormPersonal] = useState(false)
  const [showFormPerfil, setShowFormPerfil] = useState(false)
  
  const [formPersonal, setFormPersonal] = useState({
    nombre_completo: '',
    dni: '',
    perfil_profesional_id: '',
    fecha_alta: new Date().toISOString().split('T')[0],
  })

  const [formPerfil, setFormPerfil] = useState({
    nombre: '',
    tipo_perfil: 'Oficial',
    coste_horario_empresa: '',
    coste_horario_social: '',
  })

  const tipos_perfil = ['Oficial', 'Peón', 'Especialista', 'Encargado']

  const fetchData = async () => {
    if (!usuario?.empresa_id) return

    try {
      const [{ data: personalData, error: personalError }, { data: perfilesData, error: perfilesError }] = await Promise.all([
        supabase
          .from('personal')
          .select('*, perfiles_profesionales(*)')
          .eq('empresa_id', usuario.empresa_id)
          .eq('activo', true)
          .order('nombre_completo'),
        supabase
          .from('perfiles_profesionales')
          .select('*')
          .eq('empresa_id', usuario.empresa_id)
          .eq('activo', true)
          .order('nombre'),
      ])

      if (personalError) throw personalError
      if (perfilesError) throw perfilesError

      setPersonal(personalData || [])
      setPerfiles(perfilesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [usuario?.empresa_id])

  const handleSubmitPersonal = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from('personal').insert({
        empresa_id: usuario.empresa_id,
        ...formPersonal,
      })

      if (error) throw error

      setFormPersonal({
        nombre_completo: '',
        dni: '',
        perfil_profesional_id: '',
        fecha_alta: new Date().toISOString().split('T')[0],
      })
      setShowFormPersonal(false)
      fetchData()
    } catch (error) {
      console.error('Error creating personal:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleSubmitPerfil = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from('perfiles_profesionales').insert({
        empresa_id: usuario.empresa_id,
        ...formPerfil,
      })

      if (error) throw error

      setFormPerfil({
        nombre: '',
        tipo_perfil: 'Oficial',
        coste_horario_empresa: '',
        coste_horario_social: '',
      })
      setShowFormPerfil(false)
      fetchData()
    } catch (error) {
      console.error('Error creating perfil:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleDeletePersonal = async (id) => {
    if (!confirm('¿Estás seguro?')) return

    try {
      const { error } = await supabase
        .from('personal')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Personal</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL: Perfiles Profesionales */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">Perfiles Profesionales</h2>
            <button
              onClick={() => setShowFormPerfil(!showFormPerfil)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg text-sm"
            >
              + Nuevo Perfil
            </button>
          </div>

          {showFormPerfil && (
            <form onSubmit={handleSubmitPerfil} className="bg-white rounded-lg shadow p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Nombre del perfil"
                value={formPerfil.nombre}
                onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                required
              />
              <select
                value={formPerfil.tipo_perfil}
                onChange={(e) => setFormPerfil({ ...formPerfil, tipo_perfil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
              >
                {tipos_perfil.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Coste horario empresa (€)"
                step="0.01"
                value={formPerfil.coste_horario_empresa}
                onChange={(e) => setFormPerfil({ ...formPerfil, coste_horario_empresa: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="number"
                placeholder="Coste horario social (€)"
                step="0.01"
                value={formPerfil.coste_horario_social}
                onChange={(e) => setFormPerfil({ ...formPerfil, coste_horario_social: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormPerfil(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {perfiles.map((perfil) => (
              <div key={perfil.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="font-bold text-gray-800">{perfil.nombre}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Tipo: <span className="font-medium">{perfil.tipo_perfil}</span></div>
                  <div>Coste: <span className="font-medium">€{perfil.coste_horario_empresa.toFixed(2)}/h</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL: Personal */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">Personal</h2>
            <button
              onClick={() => setShowFormPersonal(!showFormPersonal)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm"
            >
              + Nuevo Operario
            </button>
          </div>

          {showFormPersonal && (
            <form onSubmit={handleSubmitPersonal} className="bg-white rounded-lg shadow p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={formPersonal.nombre_completo}
                onChange={(e) => setFormPersonal({ ...formPersonal, nombre_completo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="DNI"
                value={formPersonal.dni}
                onChange={(e) => setFormPersonal({ ...formPersonal, dni: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formPersonal.perfil_profesional_id}
                onChange={(e) => setFormPersonal({ ...formPersonal, perfil_profesional_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona perfil</option>
                {perfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.tipo_perfil})</option>
                ))}
              </select>
              <input
                type="date"
                value={formPersonal.fecha_alta}
                onChange={(e) => setFormPersonal({ ...formPersonal, fecha_alta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormPersonal(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {personal.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="font-bold text-gray-800">{p.nombre_completo}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <div>DNI: <span className="font-medium">{p.dni}</span></div>
                  <div>Perfil: <span className="font-medium">{p.perfiles_profesionales?.nombre}</span></div>
                </div>
                <button
                  onClick={() => handleDeletePersonal(p.id)}
                  className="mt-2 text-red-600 hover:text-red-900 text-xs font-medium"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
