import { PasswordForm } from '../components/PasswordForm'

/** Aberta pelo link "recuperar senha" do e-mail: o usuário já está autenticado e só precisa definir a nova senha. */
export function ResetPassword({ onDone }: { onDone: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center p-6">
      <h1 className="mb-1 text-2xl font-bold">Criar nova senha</h1>
      <p className="muted mb-6">Defina a senha que você vai usar para entrar no app.</p>
      <div className="card">
        <PasswordForm onSuccess={onDone} onCancel={onDone} cancelLabel="Agora não" />
      </div>
    </main>
  )
}
