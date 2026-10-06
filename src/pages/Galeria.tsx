import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Carousel } from '../components/Carousel'
import { clampIndex } from '../lib/carousel'
import { newId } from '../lib/id'
import { compressImage } from '../lib/image'
import { addGalleryPhoto, deleteGalleryPhoto, listGallery, MAX_GALLERY_PHOTOS, type GalleryPhoto } from '../storage/gallery'

export function Galeria({ onBack }: { onBack: () => void }) {
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [current, setCurrent] = useState(0)
  const [startAt, setStartAt] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const reload = useCallback(async (focus: number) => {
    try {
      const list = await listGallery()
      setPhotos(list)
      setStartAt(clampIndex(focus, list.length))
      setCurrent(clampIndex(focus, list.length))
      setError('')
    } catch {
      setError('Não foi possível carregar as fotos. Verifique a conexão e tente de novo.')
      setPhotos((prev) => prev ?? [])
    }
  }, [])

  useEffect(() => {
    let alive = true
    listGallery()
      .then((list) => alive && setPhotos(list))
      .catch(() => {
        if (!alive) return
        setError('Não foi possível carregar as fotos. Verifique a conexão e tente de novo.')
        setPhotos([])
      })
    return () => {
      alive = false
    }
  }, [])

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (files.length === 0 || !photos) return
    const room = MAX_GALLERY_PHOTOS - photos.length
    if (room <= 0) return setError(`A galeria já tem o máximo de ${MAX_GALLERY_PHOTOS} fotos.`)
    setBusy(true)
    setError(files.length > room ? `Só coube${room === 1 ? '' : 'ram'} ${room}: o limite é de ${MAX_GALLERY_PHOTOS} fotos.` : '')
    let failed = 0
    for (const file of files.slice(0, room)) {
      try {
        await addGalleryPhoto(newId(), await compressImage(file))
      } catch {
        failed++
      }
    }
    if (failed > 0) setError(`${failed} ${failed === 1 ? 'foto não pôde' : 'fotos não puderam'} ser enviada${failed === 1 ? '' : 's'}.`)
    await reload(photos.length)
    setBusy(false)
  }

  async function removeCurrent() {
    const photo = photos?.[current]
    if (!photo || !window.confirm('Remover esta foto da galeria? Essa ação não pode ser desfeita.')) return
    setBusy(true)
    try {
      await deleteGalleryPhoto(photo.name)
      await reload(current)
    } catch {
      setError('Não foi possível remover a foto. Tente novamente.')
    } finally {
      setBusy(false)
    }
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
      ) : photos.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="mb-1 font-medium">Nenhuma foto ainda</p>
          <p className="muted">Adicione fotos do seu carro e dos momentos com ele. Elas ficam privadas, só você vê depois do login.</p>
        </div>
      ) : (
        <>
          {/* remonta quando a lista muda, para abrir na foto certa */}
          <Carousel key={photos.map((p) => p.name).join('|')} photos={photos} initialIndex={startAt} onIndexChange={setCurrent} />
          <p className="muted text-center" aria-live="polite">Foto {current + 1} de {photos.length}</p>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-primary" onClick={() => fileRef.current?.click()} disabled={busy || photos === null}>
          {busy ? 'Enviando…' : '📷 Adicionar fotos'}
        </button>
        {photos && photos.length > 0 && (
          <button type="button" className="btn-danger" onClick={removeCurrent} disabled={busy}>Remover esta foto</button>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>
    </div>
  )
}
