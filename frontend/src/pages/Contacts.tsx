import { gql, useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

const Q = gql`query($s:String){ contacts(search:$s){ id firstName lastName email account{ id name } } }`
export default function Contacts(){
  const { data } = useQuery(Q, { variables: { s: "" } })
  return (
    <div className="card">
      <div className="text-xl font-semibold mb-4">Contactos</div>
      <table className="w-full">
        <thead><tr className="text-left text-gray-500 text-sm"><th>Nombre</th><th>Email</th><th>Cuenta</th></tr></thead>
        <tbody>
          {data?.contacts?.map((c:any)=> (
            <tr key={c.id} className="border-b last:border-none hover:bg-gray-50">
              <td className="py-2"><Link to={`/record/contact/${c.id}`} className="text-nexa-700 hover:underline">{c.firstName} {c.lastName}</Link></td>
              <td>{c.email||'-'}</td>
              <td><Link to={`/record/account/${c.account?.id}`} className="text-nexa-700 hover:underline">{c.account?.name||'-'}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
