import { ColorSchemeEnum } from '@hatsuportal/common'
import { UserDTO } from './UserDTO'

export interface UserReadModelDTO extends UserDTO {
  readonly bio: string
  readonly statusMessage: string
  readonly profileImageId: string | null
  readonly colorScheme: ColorSchemeEnum
  readonly selectedThemeId: string
  readonly notificationSettings: {
    readonly emailNotifications: boolean
    readonly pushNotifications: boolean
  }
}
