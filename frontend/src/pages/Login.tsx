import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MUT = gql`mutation($email:String!,$password:String!){ login(email:$email, password:$password){ token user{ email } } }`

export default function Login({ onLogin }:{ onLogin:(t:string)=>void }){
  const [email, setEmail] = useState('admin@nexa.dev')
  const [password, setPassword] = useState('nexa1234')
  const [login] = useMutation(MUT)
  const nav = useNavigate()

  async function submit(e:any){
    e.preventDefault()
    const res = await login({ variables: { email, password } })
    const token = res.data.login.token
    localStorage.setItem('token', token)
    onLogin(token)
    nav('/')
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-xl font-semibold mb-4">Ingresar</div>
      <form onSubmit={submit} className="space-y-3">
        <input className="border rounded px-3 py-2 w-full" value={email} onChange={e=> setEmail(e.target.value)}/>
        <input type="password" className="border rounded px-3 py-2 w-full" value={password} onChange={e=> setPassword(e.target.value)}/>
        <button className="btn-primary w-full">Entrar</button>
      </form>
      <div className="text-xs text-gray-500 mt-3">SSO demo disponible en backend `/auth/demo`.</div>
    </div>
  )
}
