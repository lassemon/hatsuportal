import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { UserId } from '../../../../domain'
import { PreferencesDTO } from '../../../dtos'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

export interface IGetUserPreferencesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  userId: string
  userPreferences: (preferences: PreferencesDTO) => void
}

export type IGetUserPreferencesUseCase = IUseCase<IGetUserPreferencesUseCaseOptions>

export class GetUserPreferencesUseCase implements IGetUserPreferencesUseCase {
  constructor(
    private readonly userReadRepository: IUserReadRepository,
    private readonly userApplicationMapper: IUserApplicationMapper
  ) {}

  async execute({ userId, userPreferences }: IGetUserPreferencesUseCaseOptions): Promise<void> {
    const readModel = await this.userReadRepository.findById(new UserId(userId))
    if (!readModel) {
      throw new NotFoundError(`User with id ${userId} not found`)
    }
    userPreferences(this.userApplicationMapper.preferencesDTOFromReadModel(readModel))
  }
}
