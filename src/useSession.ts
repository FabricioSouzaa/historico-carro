import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { startupLink, supabase, supabaseConfigured } from './supabase'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabaseConfigured)
  const [recovering, setRecovering] = useState(startupLink.recovery)

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  /** Termina o fluxo de recuperação e limpa o código da URL. */
  const finishRecovery = () => {
    setRecovering(false)
    window.history.replaceState(null, '', window.location.pathname)
  }

  return { session, ready, recovering, finishRecovery }
}
