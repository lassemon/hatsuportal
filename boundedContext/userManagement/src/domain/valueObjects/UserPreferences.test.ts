import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { ColorScheme, ColorSchemeEnum } from './ColorScheme'
import { DefaultThemeId } from './DefaultThemeId'
import { NotificationSettings } from './NotificationSettings'
import { ThemeId } from './ThemeId'
import { UserPreferences } from './UserPreferences'

describe('UserPreferences', () => {
  const buildPreferences = () =>
    UserPreferences.reconstruct({
      colorScheme: ColorScheme.default(),
      selectedThemeId: new DefaultThemeId(),
      notificationSettings: NotificationSettings.reconstruct({
        emailNotifications: true,
        pushNotifications: false
      })
    })

  it('reconstruct creates user preferences', () => {
    const preferences = buildPreferences()
    expect(preferences).to.be.instanceOf(UserPreferences)
    expect(preferences.colorScheme.value).to.eq(ColorSchemeEnum.Light)
    expect(preferences.selectedThemeId.value).to.eq(new DefaultThemeId().value)
    expect(preferences.notificationSettings.emailNotifications).toBe(true)
    expect(preferences.notificationSettings.pushNotifications).toBe(false)
  })

  it('withSelectedTheme returns same instance when theme unchanged', () => {
    const preferences = buildPreferences()
    const themeId = new DefaultThemeId()
    expect(preferences.withSelectedTheme(themeId)).toBe(preferences)
  })

  it('withSelectedTheme returns new instance when theme changes', () => {
    const preferences = buildPreferences()
    const newThemeId = new ThemeId(uuid())
    const updated = preferences.withSelectedTheme(newThemeId)
    expect(updated).not.toBe(preferences)
    expect(updated.selectedThemeId.value).toBe(newThemeId.value)
  })

  it('withColorScheme returns same instance when color scheme unchanged', () => {
    const preferences = buildPreferences()
    expect(preferences.withColorScheme(ColorScheme.default())).toBe(preferences)
  })

  it('withColorScheme returns new instance when color scheme changes', () => {
    const preferences = buildPreferences()
    const darkScheme = new ColorScheme(ColorSchemeEnum.Dark)
    const updated = preferences.withColorScheme(darkScheme)
    expect(updated).not.toBe(preferences)
    expect(updated.colorScheme.value).toBe(ColorSchemeEnum.Dark)
  })

  it('withNotificationSettings returns same instance when settings unchanged', () => {
    const preferences = buildPreferences()
    expect(
      preferences.withNotificationSettings(
        NotificationSettings.reconstruct({
          emailNotifications: true,
          pushNotifications: false
        })
      )
    ).toBe(preferences)
  })

  it('withNotificationSettings returns new instance when settings change', () => {
    const preferences = buildPreferences()
    const updated = preferences.withNotificationSettings(
      NotificationSettings.reconstruct({
        emailNotifications: false,
        pushNotifications: true
      })
    )
    expect(updated).not.toBe(preferences)
    expect(updated.notificationSettings.emailNotifications).toBe(false)
    expect(updated.notificationSettings.pushNotifications).toBe(true)
  })

  it('clone creates equal copy', () => {
    const preferences = buildPreferences()
    const clone = preferences.clone()
    expect(clone).not.toBe(preferences)
    expect(clone.equals(preferences)).toBe(true)
  })

  it('equals compares all fields', () => {
    const preferences = buildPreferences()
    const same = buildPreferences()
    const different = preferences.withSelectedTheme(new ThemeId(uuid()))
    expect(preferences.equals(same)).toBe(true)
    expect(preferences.equals(different)).toBe(false)
  })

  it('serialize returns plain object', () => {
    const preferences = buildPreferences()
    expect(preferences.serialize()).toStrictEqual({
      colorScheme: ColorSchemeEnum.Light,
      selectedThemeId: new DefaultThemeId().value,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: false
      }
    })
  })
})
