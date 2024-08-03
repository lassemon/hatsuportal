import tinycolor from 'tinycolor2'

export type ThemeColorPickerMode = 'hex' | 'rgb' | 'hsl'

const NAMED_ALIAS = /^[a-zA-Z]+$/

export function isNamedCssColor(value: string): boolean {
  return NAMED_ALIAS.test(value.trim())
}

export function detectPickerMode(value: string): ThemeColorPickerMode {
  const trimmed = value.trim().toLowerCase()
  if (trimmed.startsWith('hsl')) return 'hsl'
  if (trimmed.startsWith('rgb')) return 'rgb'
  return 'hex'
}

export function colorHasAlpha(value: string): boolean {
  const tc = tinycolor(value.trim())
  return tc.isValid() && tc.getAlpha() < 1
}

export function toSwatchBackground(value: string): string {
  const tc = tinycolor(value.trim())
  return tc.isValid() ? tc.toHexString() : '#cccccc'
}

export function toHexPickerValue(value: string): string {
  const tc = tinycolor(value.trim())
  return tc.isValid() ? tc.toHexString() : '#000000'
}

export function toHexAlphaPickerValue(value: string): string {
  const tc = tinycolor(value.trim())
  if (!tc.isValid()) return '#000000ff'
  return tc.getAlpha() < 1 ? tc.toHex8String() : tc.toHexString()
}

export function toRgbPickerValue(value: string): string {
  const tc = tinycolor(value.trim())
  return tc.isValid() ? tc.toRgbString() : 'rgb(0, 0, 0)'
}

export function toHslPickerValue(value: string): string {
  const tc = tinycolor(value.trim())
  return tc.isValid() ? tc.toHslString() : 'hsl(0, 0%, 0%)'
}
