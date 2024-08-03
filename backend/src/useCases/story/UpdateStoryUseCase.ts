import {
  IUpdateStoryUseCase,
  IUpdateStoryUseCaseOptions,
  IRemoveImageFromStoryUseCase,
  ICreateImageUseCase,
  IStoryApplicationMapper,
  ImageDTO,
  NotFoundError,
  ApplicationError,
  AuthenticationError,
  IStoryRepository,
  IUserRepository
} from '@hatsuportal/application'
import { UserId, PostId } from '@hatsuportal/domain'

import _ from 'lodash'

import { Logger, unixtimeNow } from '@hatsuportal/common'

const logger = new Logger('UpdateStoryUseCase')

export class UpdateStoryUseCase implements IUpdateStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly userRepository: IUserRepository,
    private readonly createImageUseCase: ICreateImageUseCase,
    private readonly removeImageFromStoryUseCase: IRemoveImageFromStoryUseCase,
    private readonly storyMapper: IStoryApplicationMapper
  ) {}
  async execute({ updateStoryInput, storyUpdated }: IUpdateStoryUseCaseOptions) {
    try {
      const { loggedInUserId, updateStoryData, createImageInput } = updateStoryInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthenticationError('Must be logged in to update an story.')

      const existingStory = await this.storyRepository.findById(new PostId(updateStoryData.id))
      if (!existingStory) {
        throw new NotFoundError(`Cannot update story with id ${updateStoryData.id} because it does not exist.`)
      }

      // if story has existing images on the filesystem, remove them so that no 'ghost' files are accidentally left on the filesystem
      try {
        const removeImageFromStoryInput = {
          storyIdFromWhichToRemoveImage: updateStoryData.id,
          loggedInUserId
        }
        await this.removeImageFromStoryUseCase.execute({ removeImageFromStoryInput })
      } catch (error: unknown) {
        if (error instanceof Error) {
          logger.warn(`Something went wrong trying to remove image from story ${existingStory.id}`, error.stack)
        } else {
          logger.warn(`Something went wrong trying to remove image from story ${existingStory.id}`, error)
        }
      }

      existingStory.update({
        id: updateStoryData.id,
        visibility: updateStoryData.visibility || existingStory.visibility.value,
        imageId: updateStoryData.imageId ?? null,
        name: updateStoryData.name || existingStory.name,
        description: updateStoryData.description || existingStory.description,
        createdBy: existingStory.createdBy.value,
        createdByUserName: existingStory.createdByUserName.value,
        createdAt: existingStory.createdAt.value,
        updatedAt: unixtimeNow()
      })

      let savedImage: ImageDTO | null = null
      if (createImageInput) {
        // always set image filename to story id here to avoid duplicating filename prefix
        createImageInput.createImageData.fileName = existingStory.id.value.toLowerCase()
        await this.createImageUseCase.execute({
          createImageInput,
          imageCreated: (createImage) => {
            savedImage = createImage
            existingStory.imageId = savedImage?.id ?? null
          }
        })
      }

      const savedStory = await this.storyRepository.update(existingStory)

      storyUpdated(this.storyMapper.toDTO(savedStory), savedImage)
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
