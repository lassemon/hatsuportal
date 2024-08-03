import { describe, expect, it } from 'vitest'
import { ColorSchemeEnum } from '@hatsuportal/common'
import { PreferencesApiMapper } from './PreferencesApiMapper'
import { ThemeApiMapper } from './ThemeApiMapper'

describe('PreferencesApiMapper', () => {
  const mapper = new PreferencesApiMapper(new ThemeApiMapper())

  it('maps enriched PreferencesDTO to PreferencesResponse including selectedTheme', ({ unitFixture }) => {
    const preferences = unitFixture.preferencesDTOMockWithTheme()
    const response = mapper.toResponse(preferences)

    expect(response).toStrictEqual({
      colorScheme: preferences.colorScheme,
      selectedTheme: preferences.selectedTheme,
      notificationSettings: preferences.notificationSettings
    })
  })

  it('maps update request to input DTO', () => {
    const input = mapper.toUpdateUserPreferencesInputDTO({
      colorScheme: ColorSchemeEnum.Dark,
      selectedThemeId: '00000000-0000-0000-0000-000000000001',
      notificationSettings: { emailNotifications: false, pushNotifications: true }
    })

    expect(input).toStrictEqual({
      colorScheme: ColorSchemeEnum.Dark,
      selectedThemeId: '00000000-0000-0000-0000-000000000001',
      notificationSettings: { emailNotifications: false, pushNotifications: true }
    })
  })
})
