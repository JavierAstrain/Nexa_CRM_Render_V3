import { gql, useQuery, useMutation } from '@apollo/client'
import { useMemo, useState } from 'react'

const LIST_Q = gql`query($s:String){ opportunities(search:$s){ id name amount probability stage score account{ name } } }`
const UPDATE = gql`mutation($id:ID!,$input:OpportunityInput!){ updateOpportunity(id:$id, input:$input){ id amount probability stage } }`
const SET_STAGE = gql`mutation($id:ID!,$stage:Stage!){ setOpportunityStage(id:$id, stage:$stage){ id stage } }`

const STAGES = ['PROSPECT','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST'] as const

export default function OpportunitiesTable(){
  const [search, setSearch] = useState('')
  const { data, refetch } = useQuery(LIST_Q, { variables: { s: search } })
  const [upd] = useMutation(UPDATE)
  const [setStage] = useMutation(SET_STAGE)
  const [selected, setSelected] = useState<string[]>([])

  const rows = useMemo(()=> data?.opportunities ?? [], [data])

  function toggle(id:string){
    setSelected(s=> s.includes(id) ? s.filter(x=> x!==id) : [...s, id])
  }

  async function bulkStage(stage:string){
    await Promise.all(selected.map(id=> setStage({ variables:{ id, stage } })))
    setSelected([])
    await refetch()
  }

  async function updateCell(id:string, field:'amount'|'probability', value:number){
    await upd({ variables: { id, input: { [field]: value } } })
    await refetch()
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xl font-semibold mr-auto">Oportunidades — Vista Tabla</div>
        <input className="border rounded px-2 py-1" value={search} onChange={e=> setSearch(e.target.value)} placeholder="Buscar..."/>
        <select className="border rounded px-2 py-1" onChange={e=> bulkStage(e.target.value)} defaultValue="">
          <option value="" disabled>Acción masiva: Mover a…</option>
          {STAGES.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            <th><input type="checkbox" onChange={e=> setSelected(e.target.checked? rows.map((r:any)=> r.id): [])} checked={selected.length && selected.length===rows.length ? true : false}/></th>
            <th>Nombre</th><th>Cuenta</th><th>Stage</th><th>Score</th><th>Monto</th><th>Prob.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o:any)=> (
            <tr key={o.id} className="border-b last:border-none hover:bg-gray-50">
              <td className="py-2"><input type="checkbox" checked={selected.includes(o.id)} onChange={()=> toggle(o.id)}/></td>
              <td>{o.name}</td>
              <td>{o.account?.name||'-'}</td>
              <td>{o.stage}</td>
              <td>{o.score ?? '-'}</td>
              <td>
                <input type="number" defaultValue={o.amount ?? 0} className="border rounded px-2 py-1 w-28"
                  onBlur={e=> updateCell(o.id, 'amount', parseFloat(e.target.value||'0'))}/>
              </td>
              <td>
                <input type="number" defaultValue={o.probability ?? 0} className="border rounded px-2 py-1 w-20"
                  onBlur={e=> updateCell(o.id, 'probability', parseFloat(e.target.value||'0'))}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
