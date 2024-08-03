import { NotFoundError, IImageRepository, ITransactionManager } from '@hatsuportal/common-bounded-context'
import { IStoryApplicationMapper, IRemoveImageFromStoryUseCase, IRemoveImageFromStoryUseCaseOptions } from '@hatsuportal/post-management'
import { IStoryRepository, PostId } from '@hatsuportal/post-management'

export class RemoveImageFromStoryUseCase implements IRemoveImageFromStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly imageRepository: IImageRepository,
    private readonly storyApplicationMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({ removeImageFromStoryInput, imageRemoved }: IRemoveImageFromStoryUseCaseOptions): Promise<void> {
    const { storyIdFromWhichToRemoveImage } = removeImageFromStoryInput

    const existingStory = await this.storyRepository.findById(new PostId(storyIdFromWhichToRemoveImage))

    if (existingStory === null) {
      throw new NotFoundError(
        `Failed to remove image from story with id ${storyIdFromWhichToRemoveImage} because the story does not exist.`
      )
    }

    const updatedStory = await this.transactionManager.execute(async () => {
      if (!existingStory.image) {
        return existingStory
      } else {
        const existingImage = await this.imageRepository.findById(existingStory.image.id)
        if (existingImage) {
          // Image can be deleted at this point because always using 1to1 relationship between
          // an image and an story. No image can belong to multiple stories.
          await this.imageRepository.delete(existingImage)
        }
      }

      existingStory.update({ ...this.storyApplicationMapper.toDTO(existingStory), image: null })
      return await this.storyRepository.update(existingStory)
    }, [this.storyRepository, this.imageRepository])

    imageRemoved(this.storyApplicationMapper.toDTO(updatedStory))
  }
}
