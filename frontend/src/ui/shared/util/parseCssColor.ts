import { parseCssColor as parseCssColorShared, isValidCssColor as isValidCssColorShared } from '@hatsuportal/common'
import type { ParseCssColorResult } from '@hatsuportal/common'

export type { ParseCssColorResult }

export function parseCssColor(raw: string): string | null {
  const result = parseCssColorShared(raw)
  return result.ok ? result.value : null
}
export function isValidCssColor(raw: string): boolean {
  return isValidCssColorShared(raw)
}
export function getCssColorError(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null // empty while drafting
  const result = parseCssColorShared(raw)
  return result.ok ? null : result.message
}
