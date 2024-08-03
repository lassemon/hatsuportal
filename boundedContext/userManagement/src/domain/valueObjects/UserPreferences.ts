import { CompositeValueObject } from '@hatsuportal/shared-kernel'
import { ColorScheme } from './ColorScheme'
import { NotificationSettings } from './NotificationSettings'
import { ThemeId } from './ThemeId'

export interface UserPreferencesProps {
  colorScheme: ColorScheme
  selectedThemeId: ThemeId
  notificationSettings: NotificationSettings
}

export class UserPreferences extends CompositeValueObject {
  private constructor(
    readonly colorScheme: ColorScheme,
    readonly selectedThemeId: ThemeId,
    readonly notificationSettings: NotificationSettings
  ) {
    super()
  }

  static reconstruct(props: UserPreferencesProps): UserPreferences {
    return new UserPreferences(props.colorScheme, props.selectedThemeId, props.notificationSettings)
  }

  withSelectedTheme(themeId: ThemeId): UserPreferences {
    if (themeId.equals(this.selectedThemeId)) return this
    return new UserPreferences(this.colorScheme, themeId, this.notificationSettings)
  }

  withColorScheme(colorScheme: ColorScheme): UserPreferences {
    if (colorScheme.equals(this.colorScheme)) return this
    return new UserPreferences(colorScheme, this.selectedThemeId, this.notificationSettings)
  }

  withNotificationSettings(notificationSettings: NotificationSettings): UserPreferences {
    if (notificationSettings.equals(this.notificationSettings)) return this
    return new UserPreferences(this.colorScheme, this.selectedThemeId, notificationSettings)
  }

  clone(): UserPreferences {
    return new UserPreferences(this.colorScheme, this.selectedThemeId, this.notificationSettings)
  }

  equals(other: unknown): boolean {
    return (
      other instanceof UserPreferences &&
      this.colorScheme.equals(other.colorScheme) &&
      this.selectedThemeId.equals(other.selectedThemeId) &&
      this.notificationSettings.equals(other.notificationSettings)
    )
  }

  serialize(): Record<string, unknown> {
    return {
      colorScheme: this.colorScheme.value,
      selectedThemeId: this.selectedThemeId.value,
      notificationSettings: this.notificationSettings.serialize()
    }
  }
}
