import { describe, expect, it } from 'vitest'
import { NotificationSettings } from './NotificationSettings'

describe('NotificationSettings', () => {
  const notificationSettingsProps = {
    emailNotifications: true,
    pushNotifications: false
  }

  it('reconstruct creates notification settings', () => {
    const notificationSettings = NotificationSettings.reconstruct(notificationSettingsProps)
    expect(notificationSettings).to.be.instanceOf(NotificationSettings)
    expect(notificationSettings.emailNotifications).toBe(true)
    expect(notificationSettings.pushNotifications).toBe(false)
  })

  it('exposes equals and serialize helpers', () => {
    const notificationSettings = NotificationSettings.reconstruct(notificationSettingsProps)
    const same = NotificationSettings.reconstruct(notificationSettingsProps)
    const different = NotificationSettings.reconstruct({
      emailNotifications: false,
      pushNotifications: false
    })

    expect(notificationSettings.equals(same)).toBe(true)
    expect(notificationSettings.equals(different)).toBe(false)
    expect(notificationSettings.serialize()).toStrictEqual(notificationSettingsProps)
  })
})
