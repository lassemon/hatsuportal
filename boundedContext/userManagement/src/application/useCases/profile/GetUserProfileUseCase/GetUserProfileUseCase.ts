import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { UserId } from '../../../../domain'
import { ProfileDTO } from '../../../dtos'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

export interface IGetUserProfileUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  userId: string
  userProfile: (profile: ProfileDTO) => void
}

export type IGetUserProfileUseCase = IUseCase<IGetUserProfileUseCaseOptions>

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(
    private readonly userReadRepository: IUserReadRepository,
    private readonly userApplicationMapper: IUserApplicationMapper
  ) {}

  async execute({ userId, userProfile }: IGetUserProfileUseCaseOptions): Promise<void> {
    const readModel = await this.userReadRepository.findById(new UserId(userId))
    if (!readModel) {
      throw new NotFoundError(`User with id ${userId} not found`)
    }
    userProfile(this.userApplicationMapper.profileDTOFromReadModel(readModel))
  }
}
