import { useState } from 'react'
import { supabaseConfigured } from './supabase'
import { useSession } from './useSession'
import { Login } from './pages/Login'
import { Ajustes } from './pages/Ajustes'
import { Gastos } from './pages/Gastos'
import { Planejados } from './pages/Planejados'
import { VisaoGeral } from './pages/VisaoGeral'
import { useData } from './useData'

const TABS = [
  { id: 'visao', label: 'Visão geral', icon: '📊' },
  { id: 'gastos', label: 'Gastos', icon: '🧾' },
  { id: 'planejados', label: 'Planejados', icon: '🗓️' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
] as const

type TabId = (typeof TABS)[number]['id']

function MissingConfig() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-2 text-xl font-bold">Falta configurar o Supabase</h1>
      <p className="muted">
        Crie o arquivo <code>.env.local</code> na raiz do projeto (veja <code>.env.local.example</code>) com{' '}
        <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> e reinicie o <code>npm run dev</code>.
      </p>
    </main>
  )
}

export default function App() {
  const { session, ready } = useSession()
  if (!supabaseConfigured) return <MissingConfig />
  if (!ready) return <p className="p-6 text-center muted">Carregando…</p>
  if (!session) return <Login />
  return <Main email={session.user.email ?? ''} />
}

function Main({ email }: { email: string }) {
  const api = useData()
  const [tab, setTab] = useState<TabId>('visao')

  return (
    <div className="min-h-dvh">
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-around md:justify-start md:gap-2 md:px-4">
          <span className="mr-4 hidden font-bold md:block">🚗 Histórico do Carro</span>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium md:flex-none md:flex-row md:gap-2 md:text-sm ${
                tab === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span aria-hidden="true" className="text-lg md:text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-3xl p-4 pb-40 md:pb-24">
        {api.error && (
          <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            <span>{api.error}</span>
            <button type="button" className="shrink-0 font-medium underline" onClick={api.clearError}>Fechar</button>
          </div>
        )}
        {api.loading ? (
          <p className="py-10 text-center muted">Carregando seus dados…</p>
        ) : (
          <>
            {tab === 'visao' && <VisaoGeral api={api} />}
            {tab === 'gastos' && <Gastos api={api} />}
            {tab === 'planejados' && <Planejados api={api} />}
            {tab === 'ajustes' && <Ajustes api={api} email={email} />}
          </>
        )}
      </main>
    </div>
  )
}
