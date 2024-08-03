import {
  ApplicationError,
  AuthorizationError,
  IImageStorageService,
  IStoryApplicationMapper,
  IRemoveImageFromStoryUseCase,
  IRemoveImageFromStoryUseCaseOptions,
  NotFoundError
} from '@hatsuportal/application'
import { IImageRepository, IStoryRepository, PostId, Story } from '@hatsuportal/domain'

export class RemoveImageFromStoryUseCase implements IRemoveImageFromStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageRepository: IImageRepository,
    private readonly storyApplicationMapper: IStoryApplicationMapper
  ) {}

  async execute({ removeImageFromStoryInput, imageRemoved }: IRemoveImageFromStoryUseCaseOptions): Promise<void> {
    try {
      const { storyIdFromWhichToRemoveImage, loggedInUserId } = removeImageFromStoryInput
      const existingStory = await this.storyRepository.findById(new PostId(storyIdFromWhichToRemoveImage))

      if (existingStory === null) {
        throw new NotFoundError(
          `Failed to remove image from story with id ${storyIdFromWhichToRemoveImage} because the story does not exist.`
        )
      }

      if (!existingStory.createdBy.equals(loggedInUserId)) {
        throw new AuthorizationError(`Cannot remove image from story that is not yours.`)
      }

      // TODO replace with unit of work
      if (existingStory?.image) {
        const existingImage = await this.imageRepository.findById(existingStory.image.id)
        if (existingImage) {
          await this.imageStorageService.deleteImageFromFileSystem(existingImage.fileName)
          // Image can be deleted at this point because currently using 1to1 relatioship between
          // an image and an story. No image can belong to multiple stories
          await this.imageRepository.delete(existingImage)
        }
      }
      const storyWithoutImage = new Story({ ...this.storyApplicationMapper.toDTO(existingStory), image: null })
      const updatedStory = await this.storyRepository.update(storyWithoutImage)
      imageRemoved?.(this.storyApplicationMapper.toDTO(updatedStory))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
