/** Reduz as dimensões mantendo a proporção; nunca amplia. */
export function fitSize(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem'))
    }
    img.src = url
  })
}

/** Redimensiona e comprime para JPEG: uma foto de celular de vários MB vira ~200-500 KB. */
export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  const img = await loadImage(file)
  const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, maxSide)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível')
  ctx.fillStyle = '#fff' // PNG com transparência não vira fundo preto
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao comprimir'))), 'image/jpeg', quality),
  )
}
