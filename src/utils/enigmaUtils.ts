export function normHex(s: string): string {
  const n = parseInt(s, 16)
  if (isNaN(n)) return s.toUpperCase()
  return n.toString(16).toUpperCase()
}

export function refToKey(ref: string): string | null {
  const parts = ref.split(':')
  if (parts.length < 7) return null
  try {
    return `${normHex(parts[3])}:${normHex(parts[4])}:${normHex(parts[5])}:${normHex(parts[6])}`
  } catch { return null }
}
