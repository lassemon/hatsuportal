import { ProfileImageId, User } from '../../domain'
import { PreferencesDTO, ProfileDTO, UserDTO, UserReadModelDTO } from '../dtos'

export interface IUserApplicationMapper {
  toDTO(user: User): UserDTO
  fromReadModel(readModel: UserReadModelDTO): UserDTO
  toProfileDTO(user: User): ProfileDTO
  profileDTOFromReadModel(readModel: UserReadModelDTO): ProfileDTO
  toPreferencesDTO(user: User): PreferencesDTO
  preferencesDTOFromReadModel(readModel: UserReadModelDTO): PreferencesDTO
}

export class UserApplicationMapper implements IUserApplicationMapper {
  toDTO(user: User): UserDTO {
    return {
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      roles: user.roles.map((role) => role.value),
      active: user.active,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value
    }
  }

  fromReadModel(readModel: UserReadModelDTO): UserDTO {
    return {
      id: readModel.id,
      name: readModel.name,
      email: readModel.email,
      roles: readModel.roles,
      active: readModel.active,
      createdAt: readModel.createdAt,
      updatedAt: readModel.updatedAt
    }
  }

  profileDTOFromReadModel(readModel: UserReadModelDTO): ProfileDTO {
    return {
      bio: readModel.bio,
      statusMessage: readModel.statusMessage,
      profileImageId: readModel.profileImageId
    }
  }

  preferencesDTOFromReadModel(readModel: UserReadModelDTO): PreferencesDTO {
    return {
      colorScheme: readModel.colorScheme,
      selectedThemeId: readModel.selectedThemeId,
      notificationSettings: {
        emailNotifications: readModel.notificationSettings.emailNotifications,
        pushNotifications: readModel.notificationSettings.pushNotifications
      }
    }
  }

  toProfileDTO(user: User): ProfileDTO {
    const profileImageId = user.profile.profileImageId.equals(ProfileImageId.NOT_SET)
      ? null
      : user.profile.profileImageId.value
    return {
      bio: user.profile.bio.value,
      statusMessage: user.profile.statusMessage.value,
      profileImageId
    }
  }

  toPreferencesDTO(user: User): PreferencesDTO {
    return {
      colorScheme: user.preferences.colorScheme.value,
      selectedThemeId: user.preferences.selectedThemeId.value,
      notificationSettings: user.preferences.notificationSettings.serialize()
    }
  }
}
