import tinycolor from 'tinycolor2'

export const CSS_COLOR_MAX_LENGTH = 64
const FORBIDDEN_CHARS = /[;{}<>\\]/
const DISALLOWED_SUBSTRINGS = /(var\s*\(|calc\s*\(|url\s*\(|gradient|@import)/i
const FUNCTIONAL_PREFIX = /^(#|rgb\(|rgba\(|hsl\(|hsla\()/i
const NAMED_ALIAS = /^[a-zA-Z]+$/

export type ParseCssColorResult = { ok: true; value: string } | { ok: false; message: string }

export function parseCssColor(raw: string): ParseCssColorResult {
  const trimmed = raw.trim()

  if (!trimmed) return { ok: false, message: 'Color must not be empty.' }

  if (trimmed.length > CSS_COLOR_MAX_LENGTH) {
    return { ok: false, message: `Color exceeds maximum length of ${CSS_COLOR_MAX_LENGTH}.` }
  }

  if (FORBIDDEN_CHARS.test(trimmed)) {
    return { ok: false, message: `'${trimmed}' contains invalid characters.` }
  }

  if (DISALLOWED_SUBSTRINGS.test(trimmed)) {
    return { ok: false, message: `'${trimmed}' is not an allowed color format.` }
  }

  if (FUNCTIONAL_PREFIX.test(trimmed)) {
    if (!tinycolor(trimmed).isValid()) {
      return { ok: false, message: `'${trimmed}' is not a valid color.` }
    }
    return { ok: true, value: trimmed }
  }

  if (NAMED_ALIAS.test(trimmed)) {
    const tc = tinycolor(trimmed)
    if (!tc.isValid() || tc.getFormat() !== 'name') {
      return { ok: false, message: `'${trimmed}' is not a valid color name.` }
    }
    return { ok: true, value: trimmed }
  }

  return {
    ok: false,
    message: `'${trimmed}' must be a hex/rgb/hsl color or a named CSS color (e.g. red, whitesmoke).`
  }
}

export function isValidCssColor(raw: string): boolean {
  return parseCssColor(raw).ok
}
