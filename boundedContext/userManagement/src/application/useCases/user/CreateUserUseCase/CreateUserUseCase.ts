import { IUnitOfWork, IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  UserId,
  IUserWriteRepository,
  User,
  UserName,
  Email,
  UserRole,
  StatusMessage,
  ProfileImageId,
  ColorScheme,
  DefaultThemeId,
  NotificationSettings
} from '../../../../domain'
import { CreateUserInputDTO, UserDTO } from '../../../dtos'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserLookupService } from '../../../services/UserLookupService'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'
import { castToEnum, unixtimeNow, UserRoleEnum, uuid } from '@hatsuportal/common'
import { isEmpty, uniq } from 'lodash'
import { UserProfile } from '../../../../domain/valueObjects/UserProfile'
import { UserPreferences } from '../../../../domain/valueObjects/UserPreferences'
import { Bio } from '../../../../domain/valueObjects/Bio'

export interface ICreateUserUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createUserInput: CreateUserInputDTO
  userCreated: (user: UserDTO) => void
}

export type ICreateUserUseCase = IUseCase<ICreateUserUseCaseOptions>

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly userLookupService: IUserLookupService,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly unitOfWork: IUnitOfWork,
    private readonly passwordFactory: IPasswordFactory
  ) {}

  async execute({ createUserInput, createdById, userCreated }: ICreateUserUseCaseOptions): Promise<void> {
    const { password } = createUserInput

    const [savedUser] = await this.unitOfWork.execute<[User]>(async () => {
      const now = unixtimeNow()
      const user = User.create(
        {
          id: new UserId(uuid()),
          name: new UserName(createUserInput.name),
          email: new Email(createUserInput.email),
          active: true,
          profile: UserProfile.reconstruct({
            bio: new Bio(''),
            statusMessage: new StatusMessage(''),
            profileImageId: ProfileImageId.NOT_SET
          }),
          preferences: UserPreferences.reconstruct({
            colorScheme: ColorScheme.default(),
            selectedThemeId: new DefaultThemeId(),
            notificationSettings: NotificationSettings.reconstruct({
              emailNotifications: true,
              pushNotifications: true
            })
          }),
          roles: isEmpty(createUserInput.roles)
            ? [new UserRole(UserRoleEnum.Viewer)]
            : uniq(createUserInput.roles.map((role) => new UserRole(castToEnum(role, UserRoleEnum, UserRoleEnum.Viewer)))),
          createdAt: new CreatedAtTimestamp(now),
          updatedAt: new UnixTimestamp(now)
        },
        createdById
      )
      await this.userWriteRepository.insert(user, this.passwordFactory.create(password))
      return [user]
    })

    this.userLookupService.invalidateById(savedUser.id)
    userCreated(this.userApplicationMapper.toDTO(savedUser))
  }
}
