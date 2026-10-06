/** Limita o índice ao intervalo válido; lista vazia devolve 0. */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0
  return Math.min(Math.max(index, 0), count - 1)
}

/** Qual slide está à vista, a partir da posição de rolagem do carrossel. */
export function slideIndex(scrollLeft: number, slideWidth: number, count: number): number {
  if (slideWidth <= 0) return 0
  return clampIndex(Math.round(scrollLeft / slideWidth), count)
}
