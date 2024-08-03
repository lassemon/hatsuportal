import { UserRoleEnum, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  Email,
  Password,
  User,
  UserId,
  UserName,
  UserWriteRepository,
  UserInfrastructureMapper,
  UserRole,
  ColorSchemeEnum,
  DefaultThemeId,
  ProfileImageId,
  NotificationSettings,
  StatusMessage,
  ColorScheme
} from '@hatsuportal/user-management'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { UserProfile } from '../../../../../boundedContext/userManagement/src/domain/valueObjects/UserProfile'
import { Bio } from '../../../../../boundedContext/userManagement/src/domain/valueObjects/Bio'
import { UserPreferences } from '../../../../../boundedContext/userManagement/src/domain/valueObjects/UserPreferences'

export type SeedLoginUserOptions = {
  username?: string
  password?: string
  roles?: UserRoleEnum[]
}

export type LoginUserSeed = {
  userId: string
  username: string
  password: string
}

function normalizeNameAsEmail(name: string): string {
  return `${name.replace(/[^a-z0-9]/gi, '').toLowerCase()}@hatsuportal.test`
}

export function createUserWriteRepository(persistenceHarness: PersistenceHarness): UserWriteRepository {
  return new UserWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new UserInfrastructureMapper()
  )
}

export async function seedLoginUser(persistenceHarness: PersistenceHarness, options: SeedLoginUserOptions = {}): Promise<LoginUserSeed> {
  const password = options.password ?? 'ValidPassword123'
  const username = options.username ?? `user${uuid().slice(0, 8)}`
  const userId = uuid()
  const now = unixtimeNow()
  const roles = (options.roles ?? [UserRoleEnum.Viewer]).map((role) => new UserRole(role))
  const profile = UserProfile.reconstruct({
    bio: new Bio('bio'),
    statusMessage: new StatusMessage('status message'),
    profileImageId: ProfileImageId.NOT_SET
  })
  const preferences = UserPreferences.reconstruct({
    colorScheme: new ColorScheme(ColorSchemeEnum.Light),
    selectedThemeId: new DefaultThemeId(),
    notificationSettings: NotificationSettings.reconstruct({
      emailNotifications: true,
      pushNotifications: true
    })
  })

  const user = User.create(
    {
      id: new UserId(userId),
      name: new UserName(username),
      email: new Email(normalizeNameAsEmail(username)),
      active: true,
      roles,
      profile,
      preferences,
      createdAt: new CreatedAtTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    },
    userId
  )

  const userWriteRepository = createUserWriteRepository(persistenceHarness)

  await persistenceHarness.createUnitOfWork().execute(async () => {
    await userWriteRepository.insert(user, Password.create(password))
    return [user]
  })

  return { userId, username, password }
}
