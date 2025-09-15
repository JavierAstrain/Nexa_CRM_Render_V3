import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'

const MUT = gql`mutation($name:String!,$def:JSON!){ createWorkflow(name:$name, definition:$def) }`

export default function Workflows(){
  const [name, setName] = useState('Auto note on create')
  const [trigger, setTrigger] = useState('opportunity.created')
  const [action, setAction] = useState('ADD_NOTE_TO_OPP')
  const [stage, setStage] = useState('QUALIFIED')
  const [create] = useMutation(MUT)

  function buildDef(){
    const actions = [{ type: action, params: action==='SET_STAGE' ? { stage } : { subject:'Nota', notes: 'Generado por Workflow' } }]
    return { trigger, actions }
  }

  async function save(){
    await create({ variables: { name, def: buildDef() } })
    alert('Workflow guardado!')
  }

  return (
    <div className="card space-y-3">
      <div className="text-xl font-semibold">Workflow Builder (simulado)</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-sm text-gray-500">Nombre</div>
          <input className="border rounded px-2 py-1 w-full" value={name} onChange={e=> setName(e.target.value)}/>
        </div>
        <div>
          <div className="text-sm text-gray-500">Trigger</div>
          <select className="border rounded px-2 py-1 w-full" value={trigger} onChange={e=> setTrigger(e.target.value)}>
            <option value="opportunity.created">Opportunity created</option>
            <option value="opportunity.stage_changed">Opportunity stage changed</option>
          </select>
        </div>
        <div>
          <div className="text-sm text-gray-500">Action</div>
          <select className="border rounded px-2 py-1 w-full" value={action} onChange={e=> setAction(e.target.value)}>
            <option value="ADD_NOTE_TO_OPP">Add note to opportunity</option>
            <option value="SET_STAGE">Set stage</option>
          </select>
        </div>
        {action==='SET_STAGE' && (
          <div>
            <div className="text-sm text-gray-500">Stage</div>
            <select className="border rounded px-2 py-1 w-full" value={stage} onChange={e=> setStage(e.target.value)}>
              {['PROSPECT','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST'].map(s=> <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="border rounded-xl p-3 bg-gray-50 text-sm">
        <div className="font-semibold mb-1">Vista previa JSON</div>
        <pre className="whitespace-pre-wrap">{JSON.stringify(buildDef(), null, 2)}</pre>
      </div>

      <button className="btn-primary" onClick={save}>Guardar workflow</button>
    </div>
  )
}
