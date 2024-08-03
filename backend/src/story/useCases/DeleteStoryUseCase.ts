import {
  ApplicationError,
  AuthorizationError,
  IDeleteStoryUseCase,
  IDeleteStoryUseCaseOptions,
  IStoryApplicationMapper,
  IRemoveImageFromStoryUseCase,
  NotFoundError,
  AuthenticationError
} from '@hatsuportal/application'
import { PostId, IStoryRepository, IUserRepository, UserId } from '@hatsuportal/domain'

export class DeleteStoryUseCase implements IDeleteStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly userRepository: IUserRepository,
    private readonly removeImageFromStoryUseCase: IRemoveImageFromStoryUseCase,
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

      const removeImageFromStoryInput = {
        loggedInUserId,
        storyIdFromWhichToRemoveImage: storyIdToDelete
      }
      await this.removeImageFromStoryUseCase.execute({ removeImageFromStoryInput })
      await this.storyRepository.delete(storyToDelete.id)
      storyDeleted(this.storyMapper.toDTO(storyToDelete))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
