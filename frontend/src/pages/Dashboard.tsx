import { useQuery, gql } from '@apollo/client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

const Q = gql`query {
  analytics { winRate salesVelocityDays funnel { stage count } }
}`

export default function Dashboard(){
  const { data } = useQuery(Q)
  const funnel = data?.analytics?.funnel ?? []
  const winRate = data?.analytics?.winRate ?? 0
  const sv = data?.analytics?.salesVelocityDays ?? 0

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-3 card">
        <div className="text-sm text-gray-500">Win Rate</div>
        <div className="text-3xl font-bold">{(winRate*100).toFixed(1)}%</div>
        <div className="text-xs text-gray-500">Ventas ganadas / total</div>
      </div>
      <div className="col-span-12 lg:col-span-3 card">
        <div className="text-sm text-gray-500">Sales Velocity</div>
        <div className="text-3xl font-bold">{sv.toFixed(1)} días</div>
        <div className="text-xs text-gray-500">Promedio ganar una venta</div>
      </div>
      <div className="col-span-12 lg:col-span-6 card">
        <div className="font-semibold mb-2">Embudo de ventas</div>
        <div style={{width:'100%', height:220}}>
          <ResponsiveContainer>
            <BarChart data={funnel}>
              <XAxis dataKey="stage" />
              <YAxis/>
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-12 card">
        <div className="font-semibold mb-2">Resumen pipeline</div>
        <div className="text-sm text-gray-600">Tus actividades pendientes, oportunidades por cerrar y recomendaciones del Copiloto aparecerán aquí.</div>
      </div>
    </div>
  )
}
