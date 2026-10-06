import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { clampIndex, slideIndex } from '../lib/carousel'
import type { GalleryPhoto } from '../storage/gallery'

interface Props {
  photos: GalleryPhoto[]
  initialIndex?: number
  onIndexChange?: (index: number) => void
  onImageError?: () => void
}

/** Carrossel com rolagem por toque (scroll-snap), setas, bolinhas e teclado. Sem bibliotecas. */
export function Carousel({ photos, initialIndex = 0, onIndexChange, onImageError }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(clampIndex(initialIndex, photos.length))

  // abre já na foto pedida (o carrossel é remontado quando a lista muda)
  useLayoutEffect(() => {
    const el = track.current
    if (el) el.scrollTo({ left: clampIndex(initialIndex, photos.length) * el.clientWidth, behavior: 'instant' })
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // girar o celular ou redimensionar a janela muda a largura: mantém a foto atual alinhada
  const indexRef = useRef(index)
  const settleUntil = useRef(0)
  const settleTimer = useRef(0)
  useLayoutEffect(() => {
    indexRef.current = index
  }, [index])
  useLayoutEffect(() => {
    const el = track.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let width = el.clientWidth
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return
      width = el.clientWidth
      // a mudança de largura faz o navegador disparar rolagens que não são do usuário: ignora por um instante
      settleUntil.current = performance.now() + 250
      el.scrollTo({ left: indexRef.current * width, behavior: 'instant' })
      // se um gesto terminou dentro da janela, o último scroll foi ignorado: relê a posição quando ela acaba
      window.clearTimeout(settleTimer.current)
      settleTimer.current = window.setTimeout(() => syncRef.current(), 260)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(settleTimer.current)
    }
  }, [])

  function syncIndex() {
    const el = track.current
    if (!el) return
    const next = slideIndex(el.scrollLeft, el.clientWidth, photos.length)
    if (next !== index) {
      setIndex(next)
      onIndexChange?.(next)
    }
  }
  const syncRef = useRef(syncIndex)
  useLayoutEffect(() => {
    syncRef.current = syncIndex
  })

  function handleScroll() {
    if (performance.now() < settleUntil.current) return // reflexo de uma rotação, não de um gesto
    syncIndex()
  }

  function goTo(i: number) {
    const el = track.current
    if (el) el.scrollTo({ left: clampIndex(i, photos.length) * el.clientWidth, behavior: 'smooth' })
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') goTo(index + 1)
    if (e.key === 'ArrowLeft') goTo(index - 1)
  }

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Fotos do carro"
      className="relative mx-auto w-full max-w-md"
      onKeyDown={handleKey}
    >
      <div
        ref={track}
        tabIndex={0}
        onScroll={handleScroll}
        className="flex aspect-[3/4] snap-x snap-mandatory overflow-x-auto rounded-2xl bg-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p, i) => (
          <div key={p.name} role="group" aria-roledescription="slide" aria-label={`Foto ${i + 1} de ${photos.length}`} className="h-full w-full shrink-0 snap-center">
            <img src={p.url} alt={`Foto ${i + 1} do carro`} loading={i <= 1 ? 'eager' : 'lazy'} draggable={false} onError={onImageError} className="h-full w-full object-contain" />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Foto anterior" className="absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl text-white disabled:opacity-30">‹</button>
          <button type="button" onClick={() => goTo(index + 1)} disabled={index === photos.length - 1} aria-label="Próxima foto" className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl text-white disabled:opacity-30">›</button>
          <div className="mt-3 flex justify-center gap-2">
            {photos.map((p, i) => (
              <button key={p.name} type="button" onClick={() => goTo(i)} aria-label={`Ir para a foto ${i + 1}`} aria-current={i === index} className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-blue-600' : 'w-2.5 bg-slate-300 dark:bg-slate-700'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
