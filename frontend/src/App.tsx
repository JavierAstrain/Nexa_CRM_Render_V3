import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { HomeModernIcon, ChartBarIcon, UsersIcon, BuildingOfficeIcon, ClipboardDocumentListIcon, Cog8ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Contacts from './pages/Contacts'
import Opportunities from './pages/Opportunities'
import Workflows from './pages/Workflows'
import QuoteCPQ from './pages/QuoteCPQ'
import Login from './pages/Login'
import RecordDetail from './pages/RecordDetail'

function App() {
  const [dark, setDark] = useState(false)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const nav = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    nav('/login')
  }

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-graybg'}`}>
      <div className="flex">
        <aside className="w-64 p-4">
          <div className="h-16 mb-6 flex items-center font-bold text-xl text-white rounded-xl px-4" style={{backgroundImage: 'linear-gradient(90deg,#002a5c,#00bcd4)'}}>
            Nexa CRM
          </div>
          <nav className="space-y-1">
            <Link className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-soft" to="/"><HomeModernIcon className="w-5 h-5"/> Dashboard</Link>
            <Link className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-soft" to="/accounts"><BuildingOfficeIcon className="w-5 h-5"/> Cuentas</Link>
            <Link className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-soft" to="/contacts"><UsersIcon className="w-5 h-5"/> Contactos</Link>
            <Link className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-soft" to="/opportunities"><ChartBarIcon className="w-5 h-5"/> Oportunidades</Link>
            <Link className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-soft" to="/cpq"><ClipboardDocumentListIcon className="w-5 h-5"/> Cotizaciones</Link>
            <Link className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-soft" to="/workflows"><Cog8ToothIcon className="w-5 h-5"/> Workflows</Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl font-semibold">Bienvenido</div>
            <div className="flex items-center gap-2">
              <button className="btn-primary" onClick={() => setDark(v => !v)}>{dark ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}</button>
              {!token ? <Link className="btn-primary" to="/login">Ingresar</Link> : <button onClick={logout} className="btn-primary">Salir</button>}
            </div>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/accounts" element={<Accounts/>}/>
            <Route path="/contacts" element={<Contacts/>}/>
            <Route path="/opportunities" element={<Opportunities/>}/>
            <Route path="/record/:type/:id" element={<RecordDetail/>}/>
            <Route path="/cpq" element={<QuoteCPQ/>}/>
            <Route path="/workflows" element={<Workflows/>}/>
            <Route path="/login" element={<Login onLogin={(t)=> setToken(t)}/>}/>
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
