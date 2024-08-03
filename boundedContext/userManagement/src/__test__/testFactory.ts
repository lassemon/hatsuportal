import { Mocked, vi } from 'vitest'
import { UserAggregateDatabaseSchema, UserDatabaseSchema } from '../infrastructure/schemas/UserDatabaseSchema'
import { UserReadDatabaseSchema } from '../infrastructure/schemas/UserReadDatabaseSchema'
import {
  Email,
  NotificationSettings,
  StatusMessage,
  Theme,
  ThemeColors,
  ThemeId,
  ThemeName,
  User,
  UserId,
  UserName,
  UserProps,
  UserRole
} from '../domain'
import { unixtimeNow, UserRoleEnum } from '@hatsuportal/common'
import { CreatedAtTimestamp, IDomainEventDispatcher, IDomainEventHolder, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  sampleUserId,
  sampleUserName,
  sampleStoryId,
  sampleImageId,
  sampleTagId,
  sampleEmail,
  samplePasswordHash
} from '@hatsuportal/shared-kernel/test'
import { cloneDeep } from 'lodash'
import { IUserAuthorizationService } from '../application/authorization/services/UserAuthorizationService'
import { ITokenService } from '../application/services/ITokenService'
import { IUserWriteRepository } from '../domain'
import { IUserReadRepository } from '../application/read/IUserReadRepository'
import { IUserLookupService } from '../application/services/UserLookupService'
import { UserReadModelDTO } from '../application/dtos/user/UserReadModelDTO'
import { ColorScheme, ColorSchemeEnum } from '../domain/valueObjects/ColorScheme'
import { DefaultThemeId } from '../domain/valueObjects/DefaultThemeId'
import { SystemUserId } from '../domain/valueObjects/SystemUserId'
import { ProfileImageId } from '../domain/valueObjects/ProfileImageId'
import { flattenDomainEventsFromHolders, EntityLoadResult, IDomainEventService, IUnitOfWork } from '@hatsuportal/platform'
import { CreateUserRequest, UpdateUserRequest } from '@hatsuportal/contracts'
import { UserPreferences } from '../domain/valueObjects/UserPreferences'
import { UserProfile } from '../domain/valueObjects/UserProfile'
import { Bio } from '../domain/valueObjects/Bio'
import { IMediaGateway } from '../application/acl/mediaManagement/IMediaGateway'
import { IProfileImageCleanupService } from '../application/services/profile/ProfileImageCleanupService'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export { sampleUserId, sampleStoryId, sampleImageId, sampleTagId, sampleUserName, sampleEmail }

export class TestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const userDatabaseRecord = (): UserDatabaseSchema => {
  return cloneDeep({
    id: userDTOMock().id,
    name: userDTOMock().name,
    password: samplePasswordHash,
    email: userDTOMock().email,
    roles: [UserRoleEnum.Admin, UserRoleEnum.Moderator], // json types are strings in database
    active: true,
    createdAt: userDTOMock().createdAt,
    updatedAt: userDTOMock().updatedAt
  })
}

const userJoinedDatabaseFields = () => ({
  profileImageId: null,
  bio: '',
  statusMessage: '',
  colorScheme: ColorSchemeEnum.Light,
  selectedThemeId: new DefaultThemeId().value,
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: true
  }
})

export const userAggregateDatabaseRecord = (): UserAggregateDatabaseSchema => {
  const { password: _password, ...root } = userDatabaseRecord()
  return cloneDeep({
    ...root,
    ...userJoinedDatabaseFields()
  })
}

export const userReadDatabaseRecord = (): UserReadDatabaseSchema => {
  return cloneDeep(userAggregateDatabaseRecord())
}

export const userDTOMock = () => {
  return cloneDeep({
    id: sampleUserId,
    name: sampleUserName,
    email: sampleEmail,
    roles: [UserRoleEnum.Admin],
    active: true,
    createdAt,
    updatedAt
  })
}

export const userMock = (overrides: Partial<UserProps> = {}): User => {
  const user = User.reconstruct({
    id: overrides.id ? overrides.id : new UserId(userDTOMock().id),
    name: overrides.name ? overrides.name : new UserName(userDTOMock().name),
    email: overrides.email ? overrides.email : new Email(userDTOMock().email),
    active: typeof overrides.active !== 'undefined' ? overrides.active : userDTOMock().active,
    roles: overrides.roles ? overrides.roles : userDTOMock().roles.map((role) => new UserRole(role)),
    profile: overrides.profile
      ? overrides.profile
      : UserProfile.reconstruct({
          bio: new Bio(''),
          statusMessage: new StatusMessage(''),
          profileImageId: ProfileImageId.NOT_SET
        }),
    preferences: overrides.preferences
      ? overrides.preferences
      : UserPreferences.reconstruct({
          colorScheme: ColorScheme.default(),
          selectedThemeId: new DefaultThemeId(),
          notificationSettings: NotificationSettings.reconstruct({
            emailNotifications: true,
            pushNotifications: true
          })
        }),
    createdAt: overrides.createdAt ? overrides.createdAt : new CreatedAtTimestamp(userDTOMock().createdAt),
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(userDTOMock().updatedAt)
  })

  // Spy on the methods but retain their original implementations
  vi.spyOn(user, 'serialize').mockImplementation(function (this: User) {
    return User.prototype.serialize.apply(this)
  })

  return user
}

export const userReadModelDTOMock = (overrides: Partial<UserReadModelDTO> = {}): UserReadModelDTO => {
  return cloneDeep({
    ...userDTOMock(),
    bio: '',
    statusMessage: '',
    profileImageId: null,
    colorScheme: ColorSchemeEnum.Light,
    selectedThemeId: new DefaultThemeId().value,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true
    },
    ...overrides
  })
}

export const userReadModelFromUser = (user: User, overrides: Partial<UserReadModelDTO> = {}): UserReadModelDTO => {
  const profileImageId = ProfileImageId.NOT_SET.equals(user.profile.profileImageId) ? null : user.profile.profileImageId.value

  return userReadModelDTOMock({
    id: user.id.value,
    name: user.name.value,
    email: user.email.value,
    roles: user.roles.map((role) => role.value),
    active: user.active,
    createdAt: user.createdAt.value,
    updatedAt: user.updatedAt.value,
    bio: user.profile.bio.value,
    statusMessage: user.profile.statusMessage.value,
    profileImageId,
    colorScheme: user.preferences.colorScheme.value,
    selectedThemeId: user.preferences.selectedThemeId.value,
    notificationSettings: user.preferences.notificationSettings.serialize(),
    ...overrides
  })
}

export const userWriteRepositoryMock = (): Mocked<IUserWriteRepository> => {
  class UserWriteRepositoryMock implements IUserWriteRepository {
    findById = vi.fn().mockResolvedValue(userMock())
    findByIdForUpdate = vi.fn().mockResolvedValue(userMock())
    getUserCredentialsByUserId = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    findByName = vi.fn().mockResolvedValue(userMock())
    count = vi.fn().mockResolvedValue(1)
    insert = vi.fn().mockResolvedValue(userMock())
    update = vi.fn().mockResolvedValue(userMock())
    deactivate = vi.fn().mockResolvedValue(userMock())
  }
  return new UserWriteRepositoryMock()
}

export const userReadRepositoryMock = (): Mocked<IUserReadRepository> => {
  class UserReadRepositoryMock implements IUserReadRepository {
    findById = vi.fn().mockResolvedValue(userReadModelDTOMock())
    findAll = vi.fn().mockResolvedValue([userReadModelDTOMock()])
    findByName = vi.fn().mockResolvedValue(userReadModelDTOMock())
    findByProfileImageId = vi.fn().mockResolvedValue([userReadModelDTOMock()])
    findAllReferencedProfileImageIds = vi.fn().mockResolvedValue([])
    findUserIdsBySelectedThemeId = vi.fn().mockResolvedValue([])
    invalidateById = vi.fn()
  }
  return new UserReadRepositoryMock()
}

export const userLookupServiceMock = (): Mocked<IUserLookupService> => {
  class UserLookupServiceMock implements IUserLookupService {
    invalidateById = vi.fn()
  }
  return new UserLookupServiceMock()
}

export const tokenServiceMock = (): Mocked<ITokenService> => {
  class TokenServiceMock implements ITokenService {
    createAuthToken = vi.fn().mockReturnValue('new-auth-token')
    createRefreshToken = vi.fn().mockReturnValue('refresh-token')
    verifyRefreshToken = vi.fn().mockReturnValue({ userId: sampleUserId })
  }
  return new TokenServiceMock()
}

export const domainEventDispatcherMock = (): Mocked<IDomainEventDispatcher> => {
  return {
    register: vi.fn(),
    dispatch: vi.fn()
  }
}

export const domainEventServiceMock = (): Mocked<IDomainEventService> => {
  class DomainEventServiceMock implements IDomainEventService {
    persistEvents = vi.fn()
  }
  return new DomainEventServiceMock()
}

export const unitOfWorkMock = (domainEventServiceMock: Mocked<IDomainEventService>): IUnitOfWork => {
  class UnitOfWorkMock implements IUnitOfWork {
    private activeScope: { eventHolders: Set<IDomainEventHolder>; state: 'active' | 'completed' } | undefined

    execute = async <T extends Array<IDomainEventHolder | null>>(work: () => Promise<[...T]>): Promise<[...T]> => {
      if (this.activeScope?.state === 'active') {
        const nestedHolders = await work()
        for (const holder of nestedHolders) {
          if (holder) this.activeScope.eventHolders.add(holder)
        }
        return nestedHolders
      }

      const scope: { eventHolders: Set<IDomainEventHolder>; state: 'active' | 'completed' } = {
        eventHolders: new Set<IDomainEventHolder>(),
        state: 'active'
      }
      this.activeScope = scope

      try {
        const rootHolders = await work()
        for (const holder of rootHolders) {
          if (holder) scope.eventHolders.add(holder)
        }
        const events = flattenDomainEventsFromHolders(scope.eventHolders)
        await domainEventServiceMock.persistEvents(events)
        scope.eventHolders.forEach((holder) => holder.clearEvents())
        return rootHolders
      } finally {
        scope.state = 'completed'
        this.activeScope = undefined
      }
    }
  }

  return new UnitOfWorkMock()
}

export const userAuthorizationServiceMock = (): Mocked<IUserAuthorizationService> => {
  class UserAuthorizationServiceMock implements IUserAuthorizationService {
    canCreateUser = vi.fn().mockReturnValue({ allowed: true })
    canUpdateUser = vi.fn().mockReturnValue({ allowed: true })
    canDeactivateUser = vi.fn().mockReturnValue({ allowed: true })
    canViewUser = vi.fn().mockReturnValue({ allowed: true })
    canListAllUsers = vi.fn().mockReturnValue({ allowed: true })
    canUpdateProfile = vi.fn().mockReturnValue({ allowed: true })
    canViewProfile = vi.fn().mockReturnValue({ allowed: true })
    canUpdatePreferences = vi.fn().mockReturnValue({ allowed: true })
    canViewPreferences = vi.fn().mockReturnValue({ allowed: true })
  }
  return new UserAuthorizationServiceMock()
}

export const mediaGatewayMock = (): Mocked<IMediaGateway> => {
  class MediaGatewayMock implements IMediaGateway {
    getImageById = vi.fn().mockResolvedValue(
      EntityLoadResult.success({
        id: sampleImageId,
        storageKey: 'profile_image_test.webp',
        mimeType: 'image/webp',
        size: 100,
        base64: 'base64-data',
        createdById: sampleUserId,
        createdAt: createdAt,
        updatedAt: updatedAt
      })
    )
    prepareStagedImageFile = vi.fn().mockResolvedValue({
      imageId: sampleImageId,
      stagedVersionId: 'test-staged-version-id',
      storageKey: 'staged_profile_image_test.webp',
      mimeType: 'image/webp',
      size: 100,
      createdById: sampleUserId
    })
    registerPreparedStagedImageFileRollbackCleanup = vi.fn().mockResolvedValue(void 0)
    saveStagedImageMetadata = vi.fn().mockResolvedValue(void 0)
    createStagedImageVersion = vi.fn().mockResolvedValue({
      imageId: sampleImageId,
      stagedVersionId: 'test-staged-version-id'
    })
    promoteImageVersion = vi.fn().mockResolvedValue(void 0)
    deleteImage = vi.fn().mockResolvedValue(void 0)
  }
  return new MediaGatewayMock()
}

export const profileImageCleanupServiceMock = (): Mocked<IProfileImageCleanupService> => {
  class ProfileImageCleanupServiceMock implements IProfileImageCleanupService {
    deleteProfileImageIfUnreferenced = vi.fn().mockResolvedValue(void 0)
  }
  return new ProfileImageCleanupServiceMock()
}

export const createUserRequest = (): CreateUserRequest => {
  return cloneDeep({
    id: 'not ok id', // should not be able to give this
    name: 'username',
    email: 'email@test.com',
    roles: [UserRoleEnum.Admin],
    password: 'password',
    active: false, // should not be able to give this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
  })
}

export const updateUserRequest = (): UpdateUserRequest => {
  return cloneDeep({
    id: sampleUserId,
    email: 'updatedemail',
    oldPassword: 'password',
    newPassword: 'updatedPassword',
    name: 'updated name',
    password: 'some password', // should not be able to change this directly
    roles: [UserRoleEnum.Editor, UserRoleEnum.Moderator],
    active: false,
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this,
    updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
  })
}

export const lightThemeColorsMock = (): ThemeColors => {
  return new ThemeColors({
    primary: '#F1F3F5',
    backgroundPrimary: '#21252A',
    backgroundSecondary: '#131D29',
    callToAction: '#BFFA00'
  })
}

export const darkThemeColorsMock = (): ThemeColors => {
  return new ThemeColors({
    primary: '#0C2A28',
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F8F4F2',
    callToAction: '#CD5B43'
  })
}

export const themeDTOMock = () => {
  return cloneDeep({
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Custom',
    lightColors: lightThemeColorsMock().serialize(),
    darkColors: darkThemeColorsMock().serialize(),
    createdById: sampleUserId,
    createdAt,
    updatedAt
  })
}

export const themeMock = (): Theme => {
  return Theme.reconstruct({
    id: new ThemeId(themeDTOMock().id),
    name: new ThemeName(themeDTOMock().name),
    lightColors: lightThemeColorsMock(),
    darkColors: darkThemeColorsMock(),
    createdById: new SystemUserId(),
    createdAt: new CreatedAtTimestamp(createdAt),
    updatedAt: new UnixTimestamp(updatedAt)
  })
}
