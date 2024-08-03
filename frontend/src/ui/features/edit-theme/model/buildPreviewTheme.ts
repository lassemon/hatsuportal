import { DEFAULT_THEME_COLORS, ThemeColors } from '@hatsuportal/contracts'
import { THEME_COLOR_FIELDS, ThemeColorFieldName } from './themeEditForm'
import { parseCssColor } from 'ui/shared/util/parseCssColor'
import { ThemeColorsDTO } from 'ui/entities/user/model/ThemeViewModel'

function mergeColorSide(
  defaults: ThemeColorsDTO,
  values: Partial<Record<ThemeColorFieldName, string>>
): { colors: ThemeColorsDTO; hasAnyValid: boolean } {
  const colors = { ...defaults }
  let hasAnyValid = false

  for (const { name } of THEME_COLOR_FIELDS) {
    const parsed = parseCssColor(values[name]?.trim() ?? '')

    if (!parsed) continue

    colors[name] = parsed

    hasAnyValid = true
  }

  return { colors, hasAnyValid }
}

export function parseInputColors(values: Record<ThemeColorFieldName, string>, defaults: ThemeColorsDTO): ThemeColorsDTO | null {
  const colors = { ...defaults }
  for (const { name } of THEME_COLOR_FIELDS) {
    const parsed = parseCssColor(values[name]?.trim() ?? '')
    if (!parsed) return null
    colors[name] = parsed
  }
  return colors
}

export function buildPreviewTheme(values: {
  light: Partial<Record<ThemeColorFieldName, string>>
  dark: Partial<Record<ThemeColorFieldName, string>>
}): ThemeColors | null {
  const light = mergeColorSide(DEFAULT_THEME_COLORS.lightColors, values.light)
  const dark = mergeColorSide(DEFAULT_THEME_COLORS.darkColors, values.dark)
  if (!light.hasAnyValid && !dark.hasAnyValid) return null

  return {
    lightColors: light.colors,
    darkColors: dark.colors
  }
}
