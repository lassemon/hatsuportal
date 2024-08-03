import { CompositeValueObject } from '@hatsuportal/shared-kernel'

export interface NotificationSettingsProps extends Record<string, unknown> {
  emailNotifications: boolean
  pushNotifications: boolean
}

export class NotificationSettings extends CompositeValueObject {
  private constructor(
    readonly emailNotifications: boolean,
    readonly pushNotifications: boolean
  ) {
    super()
  }

  static reconstruct(props: NotificationSettingsProps): NotificationSettings {
    return new NotificationSettings(props.emailNotifications, props.pushNotifications)
  }

  equals(other: unknown): boolean {
    return (
      other instanceof NotificationSettings &&
      this.emailNotifications === other.emailNotifications &&
      this.pushNotifications === other.pushNotifications
    )
  }

  serialize(): NotificationSettingsProps {
    return {
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications
    }
  }
}
