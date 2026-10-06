import { createClient } from '@supabase/supabase-js'
import { parseAuthLink } from './lib/authLink'
import { cleanEnv } from './lib/env'

const url = cleanEnv(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const anonKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

// O cliente apaga o hash da URL ao processar o link do e-mail, então lemos antes de criá-lo.
export const startupLink = typeof window === 'undefined' ? { recovery: false, error: null } : parseAuthLink(window.location.hash, window.location.search)
export const supabaseConfigured = Boolean(url && anonKey)

// Sem as variáveis o app mostra uma tela de configuração (ver App.tsx) em vez de quebrar.
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing-key')

