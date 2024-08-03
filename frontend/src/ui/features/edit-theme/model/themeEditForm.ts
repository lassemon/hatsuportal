import { UserRoleEnum } from '@hatsuportal/common'
import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { PreferencesViewModelDTO } from 'ui/entities/user/model/PreferencesViewModel'
import { ThemeColorsDTO, ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { UserViewModelDTO } from 'ui/entities/user/model/UserViewModel'

export const DEFAULT_TEMPLATE_ID = '__default__'

export type FormInputs = {
  name: string
  lightColors: Record<ThemeColorFieldName, string>
  darkColors: Record<ThemeColorFieldName, string>
}

export const emptyColors = (): Record<ThemeColorFieldName, string> => ({
  primary: '',
  backgroundPrimary: '',
  backgroundSecondary: '',
  callToAction: ''
})

export type ThemeColorFieldName = keyof ThemeColorsDTO

export type ThemeColorFieldConfig = {
  name: ThemeColorFieldName
  label: string
  tooltip?: string
}

export const THEME_COLOR_FIELDS: ReadonlyArray<ThemeColorFieldConfig> = [
  { name: 'primary', label: 'Primary Color' },
  { name: 'backgroundPrimary', label: 'Primary Background Color' },
  { name: 'backgroundSecondary', label: 'Secondary Background Color' },
  {
    name: 'callToAction',
    label: 'Call To Action Color',
    tooltip:
      'Avoid shades of red, orange and green in call to action, since they might be confused with error, warning and success respectively.'
  }
]

function toInputColors(colors: ThemeColorsDTO): Record<ThemeColorFieldName, string> {
  return {
    primary: colors.primary,
    backgroundPrimary: colors.backgroundPrimary,
    backgroundSecondary: colors.backgroundSecondary,
    callToAction: colors.callToAction
  }
}

export function themeToFormEditInputs(theme: { name: string; lightColors: ThemeColorsDTO; darkColors: ThemeColorsDTO }): FormInputs {
  return {
    name: theme.name,
    lightColors: toInputColors(theme.lightColors),
    darkColors: toInputColors(theme.darkColors)
  }
}

export function themeToCreateFormInputs(theme: { lightColors: ThemeColorsDTO; darkColors: ThemeColorsDTO }): FormInputs {
  return {
    name: '',
    lightColors: toInputColors(theme.lightColors),
    darkColors: toInputColors(theme.darkColors)
  }
}

export function createDefaultThemeTemplate(): ThemeViewModel {
  return new ThemeViewModel({
    id: DEFAULT_TEMPLATE_ID,
    name: '',
    lightColors: DEFAULT_THEME_COLORS.lightColors,
    darkColors: DEFAULT_THEME_COLORS.darkColors,
    createdById: '',
    createdAt: 0,
    updatedAt: 0
  })
}

export function themeToDraftTemplate(source: ThemeViewModel): ThemeViewModel {
  return new ThemeViewModel({
    id: DEFAULT_TEMPLATE_ID,
    name: '',
    lightColors: source.lightColors,
    darkColors: source.darkColors,
    createdById: '',
    createdAt: 0,
    updatedAt: 0
  })
}

export function createInitialDraftTheme(preferences: PreferencesViewModelDTO | null): ThemeViewModel {
  if (preferences?.selectedTheme) {
    return themeToDraftTemplate(new ThemeViewModel(preferences.selectedTheme))
  }
  return createDefaultThemeTemplate()
}

export function canUserEditTheme(user: UserViewModelDTO | undefined, theme: ThemeViewModel): boolean {
  if (!user) return false
  if (user.roles.includes(UserRoleEnum.Viewer)) return false
  if (user.roles.includes(UserRoleEnum.SuperAdmin)) return true
  return theme.createdById === user.id
}
