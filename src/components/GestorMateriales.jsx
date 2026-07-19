import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function GestorMateriales() {
  const { usuario } = useAuth()
  const [materiales, setMateriales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Gas',
    unidad_medida: 'ud',
    precio_coste: '',
    precio_venta: '',
  })

  const categorias = ['Gas', 'Calefacción', 'PCI', 'Fontanería', 'Albañilería', 'Diversos']
  const unidades = ['ud', 'ml', 'm', 'm2', 'm3', 'kg', 'l']

  const fetchMateriales = async () => {
    if (!usuario?.empresa_id) return
    
    try {
      setLoading(true)
      let query = supabase
        .from('materiales')
        .select('*')
        .eq('empresa_id', usuario.empresa_id)
        .eq('activo', true)

      if (filtro !== 'todos') {
        query = query.eq('categoria', filtro)
      }

      const { data, error } = await query.order('nombre')

      if (error) throw error
      setMateriales(data || [])
    } catch (error) {
      console.error('Error fetching materiales:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMateriales()
  }, [usuario?.empresa_id, filtro])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const margen = formData.precio_venta - formData.precio_coste
      const margen_porcentaje = (margen / formData.precio_coste) * 100

      const { error } = await supabase.from('materiales').insert({
        empresa_id: usuario.empresa_id,
        ...formData,
        margen_comercial: margen_porcentaje,
      })

      if (error) throw error

      setFormData({
        codigo: '',
        nombre: '',
        categoria: 'Gas',
        unidad_medida: 'ud',
        precio_coste: '',
        precio_venta: '',
      })
      setShowForm(false)
      fetchMateriales()
    } catch (error) {
      console.error('Error creating material:', error)
      alert('Error al crear material: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este material?')) return

    try {
      const { error } = await supabase
        .from('materiales')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error
      fetchMateriales()
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Error al eliminar material: ' + error.message)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Catálogo de Materiales</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          + Nuevo Material
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Crear Material</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Código"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={formData.unidad_medida}
              onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {unidades.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Precio de coste"
              step="0.01"
              value={formData.precio_coste}
              onChange={(e) => setFormData({ ...formData, precio_coste: parseFloat(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Precio de venta"
              step="0.01"
              value={formData.precio_venta}
              onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === 'todos'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tabla de Materiales */}
      {loading ? (
        <div className="text-center text-gray-600">Cargando materiales...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Precio Coste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Precio Venta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Margen %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((material) => (
                <tr key={material.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{material.codigo}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{material.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{material.categoria}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{material.unidad_medida}</td>
                  <td className="px-6 py-4 text-sm font-medium">€{material.precio_coste.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-medium">€{material.precio_venta.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      material.margen_comercial > 30 ? 'bg-green-100 text-green-800' :
                      material.margen_comercial > 15 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {material.margen_comercial.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {materiales.length === 0 && (
            <div className="p-6 text-center text-gray-600">
              No hay materiales registrados
            </div>
          )}
        </div>
      )}
    </div>
  )
}
