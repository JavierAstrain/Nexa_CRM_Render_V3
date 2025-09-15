import { gql, useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

const Q = gql`query($s:String) { accounts(search:$s){ id name website phone } }`

export default function Accounts(){
  const { data } = useQuery(Q, { variables: { s: "" } })
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-semibold">Cuentas</div>
      </div>
      <table className="w-full">
        <thead><tr className="text-left text-gray-500 text-sm"><th>Nombre</th><th>Web</th><th>Teléfono</th></tr></thead>
        <tbody>
          {data?.accounts?.map((a:any)=> (
            <tr key={a.id} className="border-b last:border-none hover:bg-gray-50">
              <td className="py-2"><Link to={`/record/account/${a.id}`} className="text-nexa-700 hover:underline">{a.name}</Link></td>
              <td>{a.website||'-'}</td>
              <td>{a.phone||'-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
