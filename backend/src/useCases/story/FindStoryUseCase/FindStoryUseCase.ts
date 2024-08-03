import {
  IFindStoryUseCase,
  IFindStoryUseCaseOptions,
  IStoryApplicationMapper,
  IStoryRepository,
  PostId
} from '@hatsuportal/post-management'
import { VisibilityEnum } from '@hatsuportal/common'
import { ApplicationError, NotFoundError } from '@hatsuportal/common-bounded-context'

export class FindStoryUseCase implements IFindStoryUseCase {
  constructor(private readonly storyRepository: IStoryRepository, private readonly storyApplicationMapper: IStoryApplicationMapper) {}

  async execute({ findStoryInput, storyFound }: IFindStoryUseCaseOptions): Promise<void> {
    const { storyIdToFind, loggedInUserId } = findStoryInput
    try {
      const story = await this.storyRepository.findById(new PostId(storyIdToFind))

      if (!story) throw new NotFoundError()

      if (!loggedInUserId && story.visibility.equals(VisibilityEnum.LoggedIn))
        // don't show logged_in stories to non-logged in users
        throw new NotFoundError()

      if (loggedInUserId && story.visibility.equals(VisibilityEnum.Private) && story.createdById.value !== loggedInUserId)
        // don't show private stories to anyone else but their creator
        throw new NotFoundError()

      storyFound(this.storyApplicationMapper.toDTO(story))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
