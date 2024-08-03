import _ from 'lodash'
import {
  ApplicationError,
  ForbiddenError,
  ICreateImageUseCase,
  ICreateStoryUseCase,
  ICreateStoryUseCaseOptions,
  IImageApplicationMapper,
  IStoryApplicationMapper,
  ImageDTO,
  IRemoveImageFromStoryUseCase,
  RemoveImageFromStoryInputDTO,
  AuthenticationError
} from '@hatsuportal/application'
import { UserId, IStoryRepository, Story, IUserRepository, PostId } from '@hatsuportal/domain'
import { unixtimeNow, uuid } from '@hatsuportal/common'

export class CreateStoryUseCase implements ICreateStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly userRepository: IUserRepository,
    private readonly createImageUseCase: ICreateImageUseCase,
    private readonly removeImageFromStoryUseCase: IRemoveImageFromStoryUseCase,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly imageMapper: IImageApplicationMapper
  ) {}
  async execute({ createStoryInput, storyCreated }: ICreateStoryUseCaseOptions) {
    try {
      const { loggedInUserId, createStoryData, createImageInput } = createStoryInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthenticationError('Must be logged in to create a new story.')

      const story = new Story({
        id: uuid(),
        visibility: createStoryData.visibility,
        imageId: null, // image not created yet at this point so always start with null
        name: createStoryData.name,
        description: createStoryData.description,
        createdBy: loggedInUser.id.value,
        createdByUserName: loggedInUser.name.value,
        createdAt: unixtimeNow(),
        updatedAt: null
      })
      await this.ensureUniqueId(story.id)

      // if story has existing images on the filesystem, remove them so that no 'ghost' files are accidentally left on the filesystem
      try {
        const removeImageFromStoryInput: RemoveImageFromStoryInputDTO = {
          storyIdFromWhichToRemoveImage: story.id.value,
          loggedInUserId: loggedInUser.id.value
        }
        await this.removeImageFromStoryUseCase.execute({ removeImageFromStoryInput })
      } catch {
        // fail silently
      }

      let savedImage: ImageDTO | null = null
      if (createImageInput) {
        createImageInput.createImageData.fileName = story.id.value.toLowerCase()
        await this.createImageUseCase.execute({
          createImageInput,
          imageCreated: (createdImage: ImageDTO) => {
            savedImage = createdImage
            story.imageId = savedImage.id
          }
        })
      }

      const savedStory = await this.storyRepository.insert(story)

      storyCreated(this.storyMapper.toDTO(savedStory), savedImage ? this.imageMapper.toDTO(savedImage) : null)
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }

  private async ensureUniqueId(id: PostId): Promise<void> {
    const previousImage = await this.storyRepository.findById(id)
    if (previousImage) {
      throw new ForbiddenError(`Cannot create story with id ${id} because it already exists.`)
    }
  }
}
