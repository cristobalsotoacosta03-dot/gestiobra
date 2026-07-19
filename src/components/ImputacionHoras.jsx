import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ImputacionHoras() {
  const { usuario } = useAuth()
  const [obras, setObras] = useState([])
  const [personal, setPersonal] = useState([])
  const [imputaciones, setImputaciones] = useState([])
  const [selectedObraId, setSelectedObraId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFormImputacion, setShowFormImputacion] = useState(false)

  const [formImputacion, setFormImputacion] = useState({
    obra_id: '',
    personal_id: '',
    fecha_imputacion: new Date().toISOString().split('T')[0],
    horas_trabajadas: '',
    descripcion_tarea: '',
    observaciones: '',
  })

  useEffect(() => {
    fetchData()
  }, [usuario?.empresa_id])

  const fetchData = async () => {
    if (!usuario?.empresa_id) return

    try {
      setLoading(true)

      const [{ data: obrasData }, { data: personalData }] = await Promise.all([
        supabase
          .from('obras')
          .select('id, nombre, numero_expediente')
          .eq('empresa_id', usuario.empresa_id)
          .eq('estado', 'En ejecución'),
        supabase
          .from('personal')
          .select('id, nombre_completo, perfiles_profesionales(nombre)')
          .eq('empresa_id', usuario.empresa_id)
          .eq('activo', true),
      ])

      setObras(obrasData || [])
      setPersonal(personalData || [])

      if (obrasData && obrasData.length > 0) {
        setSelectedObraId(obrasData[0].id)
        fetchImputaciones(obrasData[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImputaciones = async (obraId) => {
    try {
      const { data, error } = await supabase
        .from('imputacion_horas')
        .select(`
          *,
          personal(nombre_completo, perfiles_profesionales(coste_horario_empresa))
        `)
        .eq('obra_id', obraId)
        .order('fecha_imputacion', { ascending: false })

      if (error) throw error
      setImputaciones(data || [])
    } catch (error) {
      console.error('Error fetching imputaciones:', error)
    }
  }

  const handleSubmitImputacion = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from('imputacion_horas').insert({
        ...formImputacion,
        obra_id: selectedObraId,
      })

      if (error) throw error

      setFormImputacion({
        obra_id: '',
        personal_id: '',
        fecha_imputacion: new Date().toISOString().split('T')[0],
        horas_trabajadas: '',
        descripcion_tarea: '',
        observaciones: '',
      })
      setShowFormImputacion(false)
      fetchImputaciones(selectedObraId)
    } catch (error) {
      console.error('Error creating imputacion:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleChangeObra = (obraId) => {
    setSelectedObraId(obraId)
    fetchImputaciones(obraId)
  }

  const totalHoras = imputaciones.reduce((sum, imp) => sum + (imp.horas_trabajadas || 0), 0)
  const totalCoste = imputaciones.reduce((sum, imp) => sum + (imp.coste_total || 0), 0)

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Imputación de Horas</h1>

      {/* Selector de Obra */}
      <div className="mb-4 md:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona una obra</label>
        <select
          value={selectedObraId || ''}
          onChange={(e) => handleChangeObra(e.target.value)}
          className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
        >
          <option value="">-- Seleccionar --</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.numero_expediente} - {obra.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedObraId && (
        <>
          {/* Botón para añadir imputación */}
          <div className="mb-4 md:mb-6">
            <button
              onClick={() => setShowFormImputacion(!showFormImputacion)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg transition text-base md:text-lg"
            >
              + Registrar Horas
            </button>
          </div>

          {/* Formulario para registrar horas */}
          {showFormImputacion && (
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Registrar Imputación de Horas</h2>
              <form onSubmit={handleSubmitImputacion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operario</label>
                    <select
                      value={formImputacion.personal_id}
                      onChange={(e) => setFormImputacion({ ...formImputacion, personal_id: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      required
                    >
                      <option value="">-- Selecciona operario --</option>
                      {personal.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre_completo} ({p.perfiles_profesionales?.nombre})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <input
                      type="date"
                      value={formImputacion.fecha_imputacion}
                      onChange={(e) => setFormImputacion({ ...formImputacion, fecha_imputacion: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horas Trabajadas</label>
                    <input
                      type="number"
                      placeholder="0.5"
                      step="0.5"
                      value={formImputacion.horas_trabajadas}
                      onChange={(e) => setFormImputacion({ ...formImputacion, horas_trabajadas: parseFloat(e.target.value) })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de Tarea</label>
                    <input
                      type="text"
                      placeholder="Ej: Instalación tuberías"
                      value={formImputacion.descripcion_tarea}
                      onChange={(e) => setFormImputacion({ ...formImputacion, descripcion_tarea: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    placeholder="Observaciones adicionales"
                    value={formImputacion.observaciones}
                    onChange={(e) => setFormImputacion({ ...formImputacion, observaciones: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                    rows="3"
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 md:py-3 px-4 rounded-lg transition text-base"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFormImputacion(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 md:py-3 px-4 rounded-lg transition text-base"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
              <div className="text-xs md:text-sm text-gray-600">Total Horas</div>
              <div className="text-xl md:text-2xl font-bold text-blue-600 mt-1">{totalHoras.toFixed(1)}h</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
              <div className="text-xs md:text-sm text-gray-600">Costo Total</div>
              <div className="text-xl md:text-2xl font-bold text-green-600 mt-1">€{totalCoste.toFixed(2)}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 md:p-4 border border-purple-200">
              <div className="text-xs md:text-sm text-gray-600">Registros</div>
              <div className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{imputaciones.length}</div>
            </div>
          </div>

          {/* Listado de imputaciones */}
          {loading ? (
            <div className="text-center text-gray-600">Cargando...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Operario</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Horas</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Descripción</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Coste</th>
                  </tr>
                </thead>
                <tbody>
                  {imputaciones.map((imp) => (
                    <tr key={imp.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-3 text-sm font-medium text-gray-800">
                        {new Date(imp.fecha_imputacion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-3 md:px-6 py-3 text-sm text-gray-700">{imp.personal?.nombre_completo}</td>
                      <td className="px-3 md:px-6 py-3 text-sm font-medium text-blue-600">{imp.horas_trabajadas}h</td>
                      <td className="px-3 md:px-6 py-3 text-sm text-gray-600">{imp.descripcion_tarea}</td>
                      <td className="px-3 md:px-6 py-3 text-sm font-medium text-green-600">€{imp.coste_total?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {imputaciones.length === 0 && (
                <div className="p-6 text-center text-gray-600">
                  No hay imputaciones registradas
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
