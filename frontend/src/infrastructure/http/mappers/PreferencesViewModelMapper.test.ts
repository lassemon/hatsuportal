import { ColorSchemeEnum } from '@hatsuportal/common'
import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { PreferencesViewModel } from 'ui/entities/user/model/PreferencesViewModel'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { PreferencesViewModelMapper } from './PreferencesViewModelMapper'
import { ThemeViewModelMapper } from './ThemeViewModelMapper'

describe('PreferencesViewModelMapper', () => {
  const preferencesMapper = new PreferencesViewModelMapper(new ThemeViewModelMapper())

  const selectedTheme = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Default',
    lightColors: DEFAULT_THEME_COLORS.lightColors,
    darkColors: DEFAULT_THEME_COLORS.darkColors,
    createdById: '22222222-2222-2222-2222-222222222222',
    createdAt: 1_700_000_000,
    updatedAt: 1_700_000_100
  }

  const preferencesResponse = {
    colorScheme: ColorSchemeEnum.Dark,
    selectedTheme,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: false
    }
  }

  it('converts response to PreferencesViewModel entity', () => {
    const viewModel = preferencesMapper.toViewModel(preferencesResponse)

    expect(viewModel).toBeInstanceOf(PreferencesViewModel)
    expect(viewModel.colorScheme).toBe(ColorSchemeEnum.Dark)
    expect(viewModel.selectedTheme).toBeInstanceOf(ThemeViewModel)
    expect(viewModel.notificationSettings).toStrictEqual(preferencesResponse.notificationSettings)
    expect(viewModel.selectedTheme.displayColors).toStrictEqual({
      lightColors: selectedTheme.lightColors,
      darkColors: selectedTheme.darkColors
    })
  })
})
