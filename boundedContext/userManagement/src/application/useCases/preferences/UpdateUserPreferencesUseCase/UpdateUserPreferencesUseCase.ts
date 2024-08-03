import { ConcurrencyError, IUnitOfWork, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { isUndefined } from 'lodash'
import { validateAndCastEnum } from '@hatsuportal/common'
import { PreferencesDTO, UpdateUserPreferencesInputDTO } from '../../../dtos'
import { ColorScheme, ColorSchemeEnum, NotificationSettings, ThemeId, User, UserId, IUserWriteRepository } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserLookupService } from '../../../services/UserLookupService'

export interface IUpdateUserPreferencesUseCaseOptions extends IUseCaseOptions {
  updatedById: string
  userId: string
  updateUserPreferencesInput: UpdateUserPreferencesInputDTO
  userPreferencesUpdated: (preferences: PreferencesDTO) => void
  updateConflict: (error: ConcurrencyError<User>) => void
}

export type IUpdateUserPreferencesUseCase = IUseCase<IUpdateUserPreferencesUseCaseOptions>

export class UpdateUserPreferencesUseCase implements IUpdateUserPreferencesUseCase {
  constructor(
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly userLookupService: IUserLookupService,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute({
    updatedById,
    userId,
    updateUserPreferencesInput,
    userPreferencesUpdated,
    updateConflict
  }: IUpdateUserPreferencesUseCaseOptions): Promise<void> {
    try {
      const userIdToUpdate = userId
      const updatedBy = new UserId(updatedById)

      const targetUser = await this.userWriteRepository.findById(new UserId(userIdToUpdate))
      if (!targetUser || !targetUser.active) {
        throw new NotFoundError(`Cannot update target user with id ${userIdToUpdate}, user not found`)
      }

      const [updatedUser] = await this.unitOfWork.execute<[User]>(async () => {
        const existingUser = await this.userWriteRepository.findByIdForUpdate(new UserId(userIdToUpdate))
        if (!existingUser || !existingUser.active) {
          throw new NotFoundError(`User with id ${userIdToUpdate} not found`)
        }

        const user = existingUser.clone()
        const { colorScheme, selectedThemeId, notificationSettings } = updateUserPreferencesInput

        if (!isUndefined(colorScheme)) {
          user.updateColorScheme(new ColorScheme(validateAndCastEnum(colorScheme, ColorSchemeEnum)), updatedBy)
        }
        if (!isUndefined(selectedThemeId)) {
          user.selectTheme(new ThemeId(selectedThemeId), updatedBy)
        }
        if (!isUndefined(notificationSettings)) {
          const current = user.preferences.notificationSettings.serialize()
          user.updateNotificationSettings(
            NotificationSettings.reconstruct({
              emailNotifications: notificationSettings.emailNotifications ?? current.emailNotifications,
              pushNotifications: notificationSettings.pushNotifications ?? current.pushNotifications
            }),
            updatedBy
          )
        }

        await this.userWriteRepository.update(user)
        return [user]
      })

      this.userLookupService.invalidateById(updatedUser.id)
      userPreferencesUpdated(this.userApplicationMapper.toPreferencesDTO(updatedUser))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
