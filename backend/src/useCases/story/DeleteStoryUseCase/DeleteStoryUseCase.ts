import {
  ApplicationError,
  AuthorizationError,
  IDeleteStoryUseCase,
  IDeleteStoryUseCaseOptions,
  IStoryApplicationMapper,
  NotFoundError,
  AuthenticationError
} from '@hatsuportal/application'
import { IStoryRepository, IUnitOfWork, IUserRepository, PostId, Story, UserId } from '@hatsuportal/domain'

export class DeleteStoryUseCase implements IDeleteStoryUseCase {
  constructor(
    private readonly storyUnitOfWork: IUnitOfWork<Story>,
    private readonly storyRepository: IStoryRepository,
    private readonly userRepository: IUserRepository,
    private readonly storyMapper: IStoryApplicationMapper
  ) {}

  async execute({ deleteStoryInput, storyDeleted }: IDeleteStoryUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, storyIdToDelete } = deleteStoryInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthenticationError('Must be logged in to update an story.')

      const storyToDelete = await this.storyRepository.findById(new PostId(storyIdToDelete))
      if (!storyToDelete) {
        throw new NotFoundError(`Could not delete story with id ${storyIdToDelete} because the story does not exist.`)
      }
      if (!storyToDelete.createdBy.equals(loggedInUser.id)) {
        throw new AuthorizationError('This story was not created by you.')
      }

      try {
        storyToDelete.delete()
        this.storyUnitOfWork.aggregate = storyToDelete
        await this.storyUnitOfWork.execute()
        storyDeleted(this.storyMapper.toDTO(storyToDelete))
      } catch (error) {
        throw error
      }
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
