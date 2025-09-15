import { useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'

const Q = {
  account: gql`query($id:ID!){ accounts{ id name website phone } }`, // simplified for demo
  contact: gql`query($s:String){ contacts(search:$s){ id firstName lastName email phone title account{ id name } activities{ id type subject createdAt } } }`,
  opportunity: gql`query($s:String){ opportunities(search:$s){ id name amount probability stage score account{ id name } contact{ id firstName lastName } activities{ id type subject createdAt } } }`
}

const COPILOT_Q = gql`query($t:String!,$id:ID!){ copilot(entityType:$t, entityId:$id){ title detail } }`

export default function RecordDetail(){
  const { type, id } = useParams()
  const { data: dOpp } = useQuery(Q.opportunity, { variables: { s: "" }, skip: type!=='opportunity' })
  const { data: dCont } = useQuery(Q.contact, { variables: { s: "" }, skip: type!=='contact' })

  const entity: any =
    type==='opportunity' ? (dOpp?.opportunities?.find((x:any)=> x.id===id)) :
    type==='contact' ? (dCont?.contacts?.find((x:any)=> x.id===id)) :
    null

  const { data: dCop } = useQuery(COPILOT_Q, { variables: { t: type||'', id: id||'' }, skip: !type||!id })

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-3 card">
        <div className="font-semibold mb-2">Información</div>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(entity,null,2)}</pre>
      </div>
      <div className="col-span-12 lg:col-span-6 card">
        <div className="font-semibold mb-2">Timeline</div>
        <div className="space-y-2">
          {(entity?.activities||[]).map((a:any)=> (
            <div key={a.id} className="border rounded-xl p-2">
              <div className="text-sm font-semibold">{a.type} — {a.subject}</div>
              <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-3 card">
        <div className="font-semibold mb-2">Copiloto Nexa</div>
        <div className="space-y-2">
          {dCop?.copilot?.map((c:any,i:number)=> (
            <div key={i} className="border rounded-xl p-2 bg-white">
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="text-xs text-gray-600">{c.detail}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">Acciones rápidas: programar llamada, crear tarea, generar propuesta.</div>
      </div>
    </div>
  )
}
