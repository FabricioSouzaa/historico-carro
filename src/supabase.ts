import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)

// Sem as variáveis o app mostra uma tela de configuração (ver App.tsx) em vez de quebrar.
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing-key')
