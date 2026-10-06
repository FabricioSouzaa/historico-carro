/** Duas listas têm as mesmas fotos, na mesma ordem (só o endereço temporário pode ter mudado). */
export function sameNames(a: { name: string }[] | null, b: { name: string }[]): boolean {
  return !!a && a.length === b.length && a.every((p, i) => p.name === b[i].name)
}
