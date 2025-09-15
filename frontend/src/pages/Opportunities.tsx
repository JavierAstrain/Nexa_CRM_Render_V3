import { gql, useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

const LIST_Q = gql`query($s:String,$stage:Stage){ opportunities(search:$s, stage:$stage){
  id name amount probability stage score account{ id name } } }`
const SET_STAGE = gql`mutation($id:ID!,$stage:Stage!){ setOpportunityStage(id:$id, stage:$stage){ id stage } }`

const STAGES: any[] = ['PROSPECT','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST']

export default function Opportunities(){
  const [stage, setStage] = useState<string | null>(null)
  const { data, refetch } = useQuery(LIST_Q, { variables: { s: "", stage } })
  const [setOppStage] = useMutation(SET_STAGE)

  const grouped: Record<string, any[]> = {}
  (data?.opportunities||[]).forEach((o:any)=> {
    grouped[o.stage] = grouped[o.stage] || []
    grouped[o.stage].push(o)
  })

  async function onDragEnd(result: DropResult){
    if (!result.destination) return
    const id = result.draggableId
    const newStage = result.destination.droppableId
    await setOppStage({ variables: { id, stage: newStage } })
    await refetch()
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold">Oportunidades</div>
          <select className="border rounded px-2 py-1" onChange={e=> setStage(e.target.value || null)}>
            <option value="">Todas</option>
            {STAGES.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-6 gap-4">
          {STAGES.map(col=> (
            <Droppable droppableId={col} key={col}>
              {(provided)=> (
                <div ref={provided.innerRef} {...provided.droppableProps} className="card min-h-[400px]">
                  <div className="font-semibold mb-2">{col}</div>
                  {(grouped[col]||[]).map((o:any, idx:number)=> (
                    <Draggable draggableId={o.id} index={idx} key={o.id}>
                      {(prov)=> (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                          className="rounded-xl border p-3 mb-2 bg-white hover:shadow-soft">
                          <Link to={`/record/opportunity/${o.id}`} className="font-semibold hover:underline">{o.name}</Link>
                          <div className="text-sm text-gray-500">{o.account?.name||'-'}</div>
                          <div className="text-sm">Score: <span className="font-semibold">{o.score ?? '-'}</span></div>
                          <div className="text-sm">Monto: {o.amount ?? '-'}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
