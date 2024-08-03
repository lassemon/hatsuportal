import { useEffect, useRef } from 'react'
import { Control, useWatch } from 'react-hook-form'
import { useDebouncedValue } from 'ui/shared/hooks/useDebouncedValue'
import { ThemeColorFieldName, THEME_COLOR_FIELDS } from './themeEditForm'
import { ThemeColors } from '@hatsuportal/contracts'
import { getCssColorError } from 'ui/shared/util/parseCssColor'
import { buildPreviewTheme } from './buildPreviewTheme'
import { emptyColors, FormInputs } from './themeEditForm'

function errorsForSide(values: Record<ThemeColorFieldName, string>) {
  return Object.fromEntries(THEME_COLOR_FIELDS.map(({ name }) => [name, getCssColorError(values[name] ?? '')])) as Partial<
    Record<ThemeColorFieldName, string | null>
  >
}

export function useThemeColorPreview(control: Control<FormInputs>, setThemePreview: (theme: ThemeColors | null) => void) {
  const lightValues = useWatch({ control, name: 'lightColors' }) ?? emptyColors()
  const darkValues = useWatch({ control, name: 'darkColors' }) ?? emptyColors()
  const debouncedLight = useDebouncedValue(lightValues, 300)
  const debouncedDark = useDebouncedValue(darkValues, 300)
  const setThemePreviewRef = useRef(setThemePreview)
  setThemePreviewRef.current = setThemePreview
  const fieldErrors = {
    light: errorsForSide(debouncedLight),
    dark: errorsForSide(debouncedDark)
  }
  useEffect(() => {
    setThemePreviewRef.current(buildPreviewTheme({ light: debouncedLight, dark: debouncedDark }))
  }, [debouncedLight, debouncedDark]) // remove setThemePreview from deps
  return { fieldErrors }
}
