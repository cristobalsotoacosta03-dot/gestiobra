import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function GestorObras() {
  const { usuario } = useAuth()
  const [obras, setObras] = useState([])
  const [selectedObra, setSelectedObra] = useState(null)
  const [showFormObra, setShowFormObra] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('En ejecución')

  const [formObra, setFormObra] = useState({
    numero_expediente: '',
    nombre: '',
    tipo_obra: 'Mixta',
    direccion: '',
    ciudad: '',
    cp: '',
    provincia: '',
    cliente_nombre: '',
    cliente_contacto: '',
    cliente_telefono: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    presupuesto_total: '',
  })

  const tipos_obra = ['Red Gas', 'Caldera', 'PCI', 'Fontanería', 'Albañilería', 'Mixta']
  const estados = ['Planificación', 'En ejecución', 'Parada', 'Finalizada', 'Archivada']

  const fetchObras = async () => {
    if (!usuario?.empresa_id) return

    try {
      setLoading(true)

      let query = supabase
        .from('obras')
        .select(`
          *,
          jefe_obra:personal(nombre_completo),
          partidas_presupuesto(*)
        `)
        .eq('empresa_id', usuario.empresa_id)

      if (filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setObras(data || [])
      if (data && data.length > 0 && !selectedObra) {
        setSelectedObra(data[0])
      }
    } catch (error) {
      console.error('Error fetching obras:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchObras()
  }, [usuario?.empresa_id, filtroEstado])

  const handleSubmitObra = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from('obras').insert({
        empresa_id: usuario.empresa_id,
        ...formObra,
      })

      if (error) throw error

      setFormObra({
        numero_expediente: '',
        nombre: '',
        tipo_obra: 'Mixta',
        direccion: '',
        ciudad: '',
        cp: '',
        provincia: '',
        cliente_nombre: '',
        cliente_contacto: '',
        cliente_telefono: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        presupuesto_total: '',
      })
      setShowFormObra(false)
      fetchObras()
    } catch (error) {
      console.error('Error creating obra:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleUpdateObra = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('obras')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      fetchObras()
    } catch (error) {
      console.error('Error updating obra:', error)
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Cargando obras...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Obras</h1>
        <button
          onClick={() => setShowFormObra(!showFormObra)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          + Nueva Obra
        </button>
      </div>

      {showFormObra && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Crear Nueva Obra</h2>
          <form onSubmit={handleSubmitObra} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Número de expediente"
              value={formObra.numero_expediente}
              onChange={(e) => setFormObra({ ...formObra, numero_expediente: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Nombre de la obra"
              value={formObra.nombre}
              onChange={(e) => setFormObra({ ...formObra, nombre: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={formObra.tipo_obra}
              onChange={(e) => setFormObra({ ...formObra, tipo_obra: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {tipos_obra.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Dirección"
              value={formObra.direccion}
              onChange={(e) => setFormObra({ ...formObra, direccion: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={formObra.ciudad}
              onChange={(e) => setFormObra({ ...formObra, ciudad: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="CP"
              value={formObra.cp}
              onChange={(e) => setFormObra({ ...formObra, cp: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Provincia"
              value={formObra.provincia}
              onChange={(e) => setFormObra({ ...formObra, provincia: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={formObra.cliente_nombre}
              onChange={(e) => setFormObra({ ...formObra, cliente_nombre: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Contacto del cliente"
              value={formObra.cliente_contacto}
              onChange={(e) => setFormObra({ ...formObra, cliente_contacto: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Teléfono del cliente"
              value={formObra.cliente_telefono}
              onChange={(e) => setFormObra({ ...formObra, cliente_telefono: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={formObra.fecha_inicio}
              onChange={(e) => setFormObra({ ...formObra, fecha_inicio: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Presupuesto total (€)"
              step="0.01"
              value={formObra.presupuesto_total}
              onChange={(e) => setFormObra({ ...formObra, presupuesto_total: parseFloat(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Crear Obra
              </button>
              <button
                type="button"
                onClick={() => setShowFormObra(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {estados.map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtroEstado === estado
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {estado}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Obras */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden max-h-96 overflow-y-auto">
            {obras.length === 0 ? (
              <div className="p-4 text-center text-gray-600 text-sm">
                No hay obras en este estado
              </div>
            ) : (
              obras.map((obra) => (
                <button
                  key={obra.id}
                  onClick={() => setSelectedObra(obra)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
                    selectedObra?.id === obra.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="font-bold text-gray-800 text-sm">{obra.numero_expediente}</div>
                  <div className="text-xs text-gray-600 mt-1">{obra.nombre}</div>
                  <div className="text-xs text-gray-500 mt-1">{obra.ciudad}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detalles de Obra */}
        {selectedObra && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedObra.nombre}</h2>
                  <p className="text-gray-600 mt-1">Exp: {selectedObra.numero_expediente}</p>
                </div>
                <select
                  value={selectedObra.estado}
                  onChange={(e) => handleUpdateObra(selectedObra.id, { estado: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {estados.map((est) => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Tipo</div>
                  <div className="font-bold text-gray-800">{selectedObra.tipo_obra}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Cliente</div>
                  <div className="font-bold text-gray-800">{selectedObra.cliente_nombre}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Dirección</div>
                  <div className="text-gray-800">{selectedObra.direccion}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Contacto</div>
                  <div className="text-gray-800">{selectedObra.cliente_contacto}</div>
                </div>
              </div>

              {/* Financiero */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3">Seguimiento Financiero</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600">Presupuesto</div>
                    <div className="text-lg font-bold text-green-600">
                      €{selectedObra.presupuesto_total?.toLocaleString('es-ES', { maximumFractionDigits: 2 }) || '0'}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600">Gasto Actual</div>
                    <div className="text-lg font-bold text-red-600">
                      €{selectedObra.gasto_actual?.toLocaleString('es-ES', { maximumFractionDigits: 2 }) || '0'}
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 ${selectedObra.presupuesto_total - selectedObra.gasto_actual >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                    <div className="text-xs text-gray-600">Diferencia</div>
                    <div className={`text-lg font-bold ${selectedObra.presupuesto_total - selectedObra.gasto_actual >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                      €{((selectedObra.presupuesto_total || 0) - (selectedObra.gasto_actual || 0)).toLocaleString('es-ES', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((selectedObra.gasto_actual / selectedObra.presupuesto_total) * 100 || 0, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {Math.round((selectedObra.gasto_actual / selectedObra.presupuesto_total) * 100 || 0)}% gastado
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
