import { gql, useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'

const Q_PRODUCTS = gql`query($s:String){ products(search:$s){ id name } }`
const Q_LISTS = gql`query{ priceLists{ id name currency items{ id price product{ id name } } } }`
const MUT = gql`mutation($opp:ID!,$title:String!,$cur:String!,$lines:[QuoteLineInput!]!){
  createQuote(opportunityId:$opp,title:$title,currency:$cur,lines:$lines){ id title total lines{ id product{ name } qty unitPrice lineTotal } }
}`

export default function QuoteCPQ(){
  const { data: dL } = useQuery(Q_LISTS)
  const [oppId, setOppId] = useState('')
  const [title, setTitle] = useState('Nueva Cotización')
  const [currency, setCurrency] = useState('USD')
  const [lines, setLines] = useState<{productId:string, qty:number, unitPrice:number}[]>([])
  const [createQuote, { data: dQ }] = useMutation(MUT)

  function addLine(item:any){
    setLines(ls=> [...ls, { productId: item.product.id, qty: 1, unitPrice: item.price }])
  }
  function total(){
    return lines.reduce((a,l)=> a + l.qty*l.unitPrice, 0)
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-4 card">
        <div className="font-semibold mb-2">Lista de precios</div>
        {dL?.priceLists?.map((pl:any)=> (
          <div key={pl.id} className="mb-3">
            <div className="text-sm font-semibold">{pl.name} ({pl.currency})</div>
            <div className="space-y-1 mt-1">
              {pl.items.map((it:any)=> (
                <button key={it.id} className="w-full text-left border rounded-xl p-2 hover:bg-gray-50" onClick={()=> addLine(it)}>
                  {it.product.name} — {it.price}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="col-span-12 lg:col-span-8 card">
        <div className="font-semibold mb-2">Editor de cotización</div>
        <div className="flex gap-2 mb-3">
          <input placeholder="ID Oportunidad" className="border rounded px-2 py-1" value={oppId} onChange={e=> setOppId(e.target.value)}/>
          <input className="border rounded px-2 py-1 flex-1" value={title} onChange={e=> setTitle(e.target.value)}/>
          <select className="border rounded px-2 py-1" value={currency} onChange={e=> setCurrency(e.target.value)}><option>USD</option><option>CLP</option></select>
          <div className="px-3 py-1 rounded-xl bg-gray-100">Total: <b>{total().toFixed(2)} {currency}</b></div>
          <button className="btn-primary" onClick={()=> createQuote({ variables:{ opp: oppId, title, cur: currency, lines } })}>Guardar</button>
        </div>
        <div className="text-sm text-gray-600">Agrega productos desde la izquierda. Edita cantidad y precio directamente en la línea.</div>
        <ul className="mt-2 space-y-2">
          {lines.map((l, idx)=> (
            <li key={idx} className="border rounded-xl p-2 flex items-center gap-2">
              <span>Producto {l.productId.slice(0,6)}…</span>
              <input type="number" className="border rounded px-2 py-1 w-20" value={l.qty} onChange={e=> setLines(ls=> ls.map((x,i)=> i===idx? {...x, qty: parseInt(e.target.value||'1')} : x))}/>
              <input type="number" className="border rounded px-2 py-1 w-28" value={l.unitPrice} onChange={e=> setLines(ls=> ls.map((x,i)=> i===idx? {...x, unitPrice: parseFloat(e.target.value||'0')} : x))}/>
              <div className="ml-auto font-semibold">{(l.qty*l.unitPrice).toFixed(2)}</div>
              <button onClick={()=> setLines(ls=> ls.filter((_,i)=> i!==idx))} className="text-red-600">Eliminar</button>
            </li>
          ))}
        </ul>

        {dQ?.createQuote && (
          <div className="mt-4 border rounded-xl p-3">
            <div className="font-semibold">Cotización creada</div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(dQ.createQuote,null,2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
