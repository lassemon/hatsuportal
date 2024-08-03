import {
  IUpdateStoryUseCase,
  IUpdateStoryUseCaseOptions,
  IStoryApplicationMapper,
  PostId,
  IStoryRepository
} from '@hatsuportal/post-management'

import { ConcurrencyError, IImageRepository, ITransactionManager } from '@hatsuportal/common-bounded-context'

export class UpdateStoryUseCase implements IUpdateStoryUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}
  async execute({ updateStoryInput, storyUpdated, updateConflict }: IUpdateStoryUseCaseOptions) {
    try {
      const savedStory = await this.transactionManager.execute(async () => {
        const existingStory = await this.storyRepository.findById(new PostId(updateStoryInput.updateStoryData.id))

        // Existing story is not null because we already checked for it in the validation
        const story = this.storyMapper.updateInputToDomainEntity(updateStoryInput, existingStory!)

        // storyRepository will update the story and the image if it exists
        const savedStory = await this.storyRepository.update(story)

        // returning the story here will trigger transaction manager to commit the transaction
        return savedStory
      }, [this.storyRepository, this.imageRepository])

      storyUpdated(this.storyMapper.toDTO(savedStory))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
