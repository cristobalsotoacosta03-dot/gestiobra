import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { usuario, hasPermission } = useAuth()
  const [obras, setObras] = useState([])
  const [resumenFinanciero, setResumenFinanciero] = useState({
    presupuesto_total: 0,
    gasto_actual: 0,
    diferencia: 0,
    obras_activas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!usuario?.empresa_id) return

      try {
        // Obtener obras
        const { data: obrasData, error: obrasError } = await supabase
          .from('obras')
          .select('*')
          .eq('empresa_id', usuario.empresa_id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (obrasError) throw obrasError

        setObras(obrasData || [])

        // Calcular resumen financiero
        if (obrasData && obrasData.length > 0) {
          const totals = obrasData.reduce(
            (acc, obra) => ({
              presupuesto_total: acc.presupuesto_total + (obra.presupuesto_total || 0),
              gasto_actual: acc.gasto_actual + (obra.gasto_actual || 0),
              obras_activas: acc.obras_activas + (obra.estado === 'En ejecución' ? 1 : 0),
            }),
            { presupuesto_total: 0, gasto_actual: 0, obras_activas: 0 }
          )

          setResumenFinanciero({
            ...totals,
            diferencia: totals.presupuesto_total - totals.gasto_actual,
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [usuario?.empresa_id])

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Bienvenido, {usuario?.nombre}</p>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-medium">Obras Activas</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{resumenFinanciero.obras_activas}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-medium">Presupuesto Total</div>
          <div className="text-2xl font-bold text-green-600 mt-2">
            €{resumenFinanciero.presupuesto_total.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="text-gray-600 text-sm font-medium">Gasto Actual</div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            €{resumenFinanciero.gasto_actual.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${resumenFinanciero.diferencia >= 0 ? 'border-green-500' : 'border-red-500'}`}>
          <div className="text-gray-600 text-sm font-medium">Diferencia</div>
          <div className={`text-2xl font-bold mt-2 ${resumenFinanciero.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{resumenFinanciero.diferencia.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Últimas Obras */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Últimas Obras</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Expediente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Presupuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => {
                const porcentaje = obra.presupuesto_total > 0 ? (obra.gasto_actual / obra.presupuesto_total) * 100 : 0
                return (
                  <tr key={obra.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{obra.numero_expediente}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{obra.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{obra.tipo_obra}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        obra.estado === 'En ejecución' ? 'bg-blue-100 text-blue-800' :
                        obra.estado === 'Finalizada' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {obra.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">€{obra.presupuesto_total.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{Math.round(porcentaje)}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
