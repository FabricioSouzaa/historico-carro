import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Carousel } from '../components/Carousel'
import { clampIndex } from '../lib/carousel'
import { newId } from '../lib/id'
import { compressImage } from '../lib/image'
import { addGalleryPhoto, deleteGalleryPhoto, listGallery, MAX_GALLERY_PHOTOS, type GalleryPhoto } from '../storage/gallery'

const URL_REFRESH_MS = 45 * 60 * 1000 // os endereços das fotos valem 1 hora
const ERROR_RELOAD_COOLDOWN_MS = 5 * 60 * 1000

export function Galeria({ onBack }: { onBack: () => void }) {
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [current, setCurrent] = useState(0)
  const [startAt, setStartAt] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const currentRef = useRef(0)
  const loadedAt = useRef(0)

  const showIndex = useCallback((i: number) => {
    currentRef.current = i
    setCurrent(i)
  }, [])

  /** Recarrega a lista e abre na foto `focus`. Em modo silencioso, uma falha não troca o que já está na tela. */
  const load = useCallback(
    async (focus: number, silent = false): Promise<boolean> => {
      try {
        const list = await listGallery()
        loadedAt.current = Date.now()
        const i = clampIndex(focus, list.length)
        setPhotos(list)
        setStartAt(i)
        showIndex(i)
        setLoadFailed(false)
        return true
      } catch {
        if (!silent) setLoadFailed(true)
        setPhotos((prev) => prev ?? [])
        return false
      }
    },
    [showIndex],
  )

  useEffect(() => {
    let alive = true
    listGallery()
      .then((list) => {
        if (!alive) return
        loadedAt.current = Date.now()
        setPhotos(list)
      })
      .catch(() => {
        if (!alive) return
        setLoadFailed(true)
        setPhotos([])
      })
    return () => {
      alive = false
    }
  }, [])

  // volta de outra aba/app depois de muito tempo: renova os endereços das fotos antes de expirarem
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && loadedAt.current && Date.now() - loadedAt.current > URL_REFRESH_MS) {
        void load(currentRef.current, true)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  // uma imagem que não carrega costuma ser endereço vencido: recarrega a lista (com intervalo mínimo, para não entrar em laço)
  const handleImageError = useCallback(() => {
    if (Date.now() - loadedAt.current > ERROR_RELOAD_COOLDOWN_MS) void load(currentRef.current, true)
  }, [load])

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (files.length === 0 || !photos || loadFailed) return
    const room = MAX_GALLERY_PHOTOS - photos.length
    if (room <= 0) return setError(`A galeria já tem o máximo de ${MAX_GALLERY_PHOTOS} fotos.`)
    setBusy(true)
    setError('')
    const notes: string[] = []
    if (files.length > room) notes.push(`Só ${room === 1 ? 'coube 1' : `couberam ${room}`}: o limite é de ${MAX_GALLERY_PHOTOS} fotos.`)
    let failed = 0
    for (const file of files.slice(0, room)) {
      try {
        await addGalleryPhoto(newId(), await compressImage(file))
      } catch {
        failed++
      }
    }
    if (failed > 0) notes.push(`${failed} ${failed === 1 ? 'foto não pôde ser enviada' : 'fotos não puderam ser enviadas'}.`)
    // a mensagem é definida depois da recarga, senão ela apagaria os avisos acima
    if (!(await load(photos.length, true))) notes.push('Não foi possível atualizar a lista; recarregue a página.')
    setError(notes.join(' '))
    setBusy(false)
  }

  async function removeCurrent() {
    const photo = photos?.[current]
    if (!photos || !photo || !window.confirm('Remover esta foto da galeria? Essa ação não pode ser desfeita.')) return
    setBusy(true)
    setError('')
    try {
      await deleteGalleryPhoto(photo.name)
    } catch {
      setError('Não foi possível remover a foto. Tente novamente.')
      setBusy(false)
      return
    }
    // some da tela na hora; a recarga confirma com o servidor, mas se falhar a foto já não volta
    const remaining = photos.filter((p) => p.name !== photo.name)
    const next = clampIndex(current, remaining.length)
    setPhotos(remaining)
    setStartAt(next)
    showIndex(next)
    void load(next, true)
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Meu carro</h1>
        <button type="button" className="btn-ghost" onClick={onBack}>← Voltar</button>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}

      {photos === null ? (
        <p className="py-10 text-center muted">Carregando fotos…</p>
      ) : loadFailed ? (
        <div className="card py-10 text-center">
          <p className="mb-3 font-medium">Não foi possível carregar as fotos.</p>
          <button type="button" className="btn-primary" onClick={() => void load(0)}>Tentar de novo</button>
        </div>
      ) : photos.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="mb-1 font-medium">Nenhuma foto ainda</p>
          <p className="muted">Adicione fotos do seu carro e dos momentos com ele. Elas ficam privadas, só você vê depois do login.</p>
        </div>
      ) : (
        <>
          {/* remonta quando a lista muda, para abrir na foto certa */}
          <Carousel key={photos.map((p) => p.name).join('|')} photos={photos} initialIndex={startAt} onIndexChange={showIndex} onImageError={handleImageError} />
          <p className="muted text-center" aria-live="polite">Foto {current + 1} de {photos.length}</p>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-primary" onClick={() => fileRef.current?.click()} disabled={busy || photos === null || loadFailed}>
          {busy ? 'Enviando…' : '📷 Adicionar fotos'}
        </button>
        {photos && photos.length > 0 && !loadFailed && (
          <button type="button" className="btn-danger" onClick={removeCurrent} disabled={busy}>Remover esta foto</button>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>
    </div>
  )
}
