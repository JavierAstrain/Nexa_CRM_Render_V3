import { useState } from 'react'

const REST_URL = import.meta.env.VITE_REST_URL || 'http://localhost:8080'

export default function LeadsWidget(){
  const [msgs, setMsgs] = useState<{from:'bot'|'user',text:string}[]>([
    { from:'bot', text:'¡Hola! Soy el widget de Nexa. ¿Cómo te llamas?' }
  ])
  const [form, setForm] = useState<any>({ firstName:'', lastName:'', email:'', phone:'', company:'', message:'' })
  const [step, setStep] = useState(0)

  async function send(text:string){
    setMsgs(m=> [...m, { from:'user', text }])
    if (step===0) { setForm((f:any)=> ({...f, firstName: text.split(' ')[0]||text, lastName: text.split(' ').slice(1).join(' ')})); setMsgs(m=> [...m, { from:'bot', text:'¿Cuál es tu email?' }]); setStep(1); return }
    if (step===1) { setForm((f:any)=> ({...f, email: text})); setMsgs(m=> [...m, { from:'bot', text:'¿Número de teléfono?' }]); setStep(2); return }
    if (step===2) { setForm((f:any)=> ({...f, phone: text})); setMsgs(m=> [...m, { from:'bot', text:'¿Empresa?' }]); setStep(3); return }
    if (step===3) { setForm((f:any)=> ({...f, company: text})); setMsgs(m=> [...m, { from:'bot', text:'Cuéntanos brevemente tu necesidad.' }]); setStep(4); return }
    if (step===4) {
      const payload = { ...form, message: text }
      try {
        const res = await fetch(`${REST_URL}/api/leads`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Fail')
        setMsgs(m=> [...m, { from:'bot', text:'¡Gracias! Hemos registrado tu solicitud. Un asesor te contactará pronto.' }])
      } catch {
        setMsgs(m=> [...m, { from:'bot', text:'Hubo un problema al enviar tu información. Intenta más tarde.' }])
      }
      setStep(5)
      return
    }
  }

  function onSubmit(e:any){
    e.preventDefault()
    const v = e.target.elements.msg.value.trim()
    if (!v) return
    send(v)
    e.target.reset()
  }

  return (
    <div className="max-w-md mx-auto card">
      <div className="text-xl font-semibold mb-3">Widget Web de Leads</div>
      <div className="h-80 overflow-y-auto border rounded-xl p-3 bg-gray-50">
        {msgs.map((m,i)=> (
          <div key={i} className={`my-1 flex ${m.from==='user'?'justify-end':'justify-start'}`}>
            <div className={`${m.from==='user'?'bg-nexa-600 text-white':'bg-white'} rounded-2xl px-3 py-2 max-w-[80%] shadow-soft`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      {step<=4 && (
        <form onSubmit={onSubmit} className="mt-3 flex gap-2">
          <input name="msg" className="border rounded-xl px-3 py-2 flex-1" placeholder="Escribe aquí..."/>
          <button className="btn-primary">Enviar</button>
        </form>
      )}
      {step>4 && <div className="text-sm text-gray-500 mt-2">Conversación finalizada.</div>}
    </div>
  )
}
