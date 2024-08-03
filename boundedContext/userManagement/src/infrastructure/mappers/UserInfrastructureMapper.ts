import { PartialExceptFor, unixtimeNow, ImageRoleEnum, validateAndCastEnum } from '@hatsuportal/common'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  ColorScheme,
  ColorSchemeEnum,
  DefaultThemeId,
  NotificationSettings,
  Password,
  ProfileImageId,
  StatusMessage,
  ThemeId,
  User,
  UserId,
  UserName,
  UserRole,
  Email
} from '../../domain'
import { UserProfile } from '../../domain/valueObjects/UserProfile'
import { UserPreferences } from '../../domain/valueObjects/UserPreferences'
import { UserReadModelDTO } from '../../application'
import { UnencryptedPasswordError } from '../../application/errors/UnencryptedPasswordError'
import { Encryption } from '../../application/auth/Encryption'
import { UserAggregateDatabaseSchema, UserDatabaseSchema } from '../schemas/UserDatabaseSchema'
import { UserImageLinkDatabaseSchema } from '../schemas/UserImageLinkDatabaseSchema'
import { UserPreferencesDatabaseSchema } from '../schemas/UserPreferencesDatabaseSchema'
import { UserProfileDatabaseSchema } from '../schemas/UserProfileDatabaseSchema'
import { UserReadDatabaseSchema } from '../schemas/UserReadDatabaseSchema'
import { Bio } from '../../domain/valueObjects/Bio'

export interface IUserInfrastructureMapper {
  toInsertQuery(user: User, password: Password): Promise<UserDatabaseSchema>
  toUpdateQuery(user: User, password?: Password): Promise<PartialExceptFor<Omit<UserDatabaseSchema, 'createdAt'>, 'id'>>
  toDTO(userRecord: UserReadDatabaseSchema): UserReadModelDTO
  toDomainEntity(userRecord: UserAggregateDatabaseSchema): User
  toProfileRecord(user: User): UserProfileDatabaseSchema
  toPreferencesRecord(user: User): UserPreferencesDatabaseSchema
  toProfileImageLinkRow(user: User): UserImageLinkDatabaseSchema | null
}

export class UserInfrastructureMapper implements IUserInfrastructureMapper {
  async toInsertQuery(user: User, password: Password): Promise<UserDatabaseSchema> {
    const createdAt = unixtimeNow()
    const encryptedPassword = await Encryption.encrypt(password.value)

    if (typeof password !== 'undefined' && password.value === encryptedPassword) {
      throw new UnencryptedPasswordError()
    }

    return {
      id: user.id.value,
      name: user.name.value,
      password: encryptedPassword,
      email: user.email.value,
      roles: user.roles.map((role) => role.value),
      active: user.active,
      createdAt: createdAt,
      updatedAt: createdAt
    }
  }

  async toUpdateQuery(user: User, password?: Password): Promise<PartialExceptFor<Omit<UserDatabaseSchema, 'createdAt'>, 'id'>> {
    const newPassword = password ? await Encryption.encrypt(password.value) : undefined

    if (typeof password !== 'undefined' && password.value === newPassword) {
      throw new UnencryptedPasswordError()
    }

    return {
      id: user.id.value,
      name: user.name.value,
      ...(newPassword ? { password: newPassword } : {}),
      email: user.email.value,
      roles: user.roles.map((role) => role.value),
      active: user.active,
      updatedAt: unixtimeNow()
    }
  }

  toDTO(userRecord: UserReadDatabaseSchema): UserReadModelDTO {
    const defaultNotificationSettings = NotificationSettings.reconstruct({
      emailNotifications: userRecord.notificationSettings?.emailNotifications ?? true,
      pushNotifications: userRecord.notificationSettings?.pushNotifications ?? true
    }).serialize()

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      roles: userRecord.roles ?? [],
      active: userRecord.active === 1 || userRecord.active === true,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
      bio: userRecord.bio ?? '',
      statusMessage: userRecord.statusMessage ?? '',
      profileImageId: userRecord.profileImageId ?? null,
      colorScheme: userRecord.colorScheme ?? ColorSchemeEnum.Light,
      selectedThemeId: userRecord.selectedThemeId ?? new DefaultThemeId().value,
      notificationSettings: userRecord.notificationSettings ?? defaultNotificationSettings
    }
  }

  toDomainEntity(userRecord: UserAggregateDatabaseSchema): User {
    const profile = UserProfile.reconstruct({
      bio: new Bio(userRecord.bio || ''),
      statusMessage: new StatusMessage(userRecord.statusMessage || ''),
      profileImageId: ProfileImageId.fromOptional(userRecord.profileImageId)
    })

    const preferences = UserPreferences.reconstruct({
      colorScheme: userRecord.colorScheme
        ? new ColorScheme(validateAndCastEnum(userRecord.colorScheme, ColorSchemeEnum))
        : ColorScheme.default(),
      selectedThemeId: new ThemeId(userRecord.selectedThemeId || new DefaultThemeId().value),
      notificationSettings: userRecord.notificationSettings
        ? NotificationSettings.reconstruct(userRecord.notificationSettings)
        : NotificationSettings.reconstruct({
            emailNotifications: true,
            pushNotifications: true
          })
    })

    return User.reconstruct({
      id: new UserId(userRecord.id),
      name: new UserName(userRecord.name),
      email: new Email(userRecord.email),
      active: userRecord.active === 1 || userRecord.active === true,
      roles: userRecord.roles.map((role) => new UserRole(role)),
      profile,
      preferences,
      createdAt: new CreatedAtTimestamp(userRecord.createdAt),
      updatedAt: new UnixTimestamp(userRecord.updatedAt)
    })
  }

  toProfileRecord(user: User): UserProfileDatabaseSchema {
    return {
      userId: user.id.value,
      bio: user.profile.bio.value,
      statusMessage: user.profile.statusMessage.value
    }
  }

  toPreferencesRecord(user: User): UserPreferencesDatabaseSchema {
    return {
      userId: user.id.value,
      colorScheme: user.preferences.colorScheme.value,
      selectedThemeId: user.preferences.selectedThemeId.value,
      notificationSettings: user.preferences.notificationSettings.serialize()
    }
  }

  toProfileImageLinkRow(user: User): UserImageLinkDatabaseSchema | null {
    const hasProfileImage = user.profile.profileImageId && !user.profile.profileImageId.equals(ProfileImageId.NOT_SET)
    return hasProfileImage
      ? {
          userId: user.id.value,
          role: ImageRoleEnum.ProfilePicture,
          imageId: user.profile.profileImageId.value
        }
      : null
  }
}
