import {
  IUpdateStoryUseCase,
  IUpdateStoryUseCaseOptions,
  IStoryApplicationMapper,
  ApplicationError,
  UpdateStoryImageInputDTO
} from '@hatsuportal/application'
import {
  PostId,
  IStoryRepository,
  IUnitOfWork,
  Story,
  ImageUpdatedToStoryEvent,
  ImageAddedToStoryEvent,
  StoryUpdatedEvent
} from '@hatsuportal/domain'

import _ from 'lodash'

import { unixtimeNow, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'

export class UpdateStoryUseCase implements IUpdateStoryUseCase {
  constructor(
    private readonly storyUnitOfWork: IUnitOfWork<Story>,
    private readonly storyRepository: IStoryRepository,
    private readonly storyMapper: IStoryApplicationMapper
  ) {}
  async execute({ updateStoryInput, storyUpdated }: IUpdateStoryUseCaseOptions) {
    try {
      const { updateStoryData } = updateStoryInput

      // Existing story is not null because we already checked for it in the validation
      const existingStory = (await this.storyRepository.findById(new PostId(updateStoryData.id))) as Story

      try {
        if (updateStoryData.image) {
          const oldImage = existingStory.image
          this.updateStoryImage(existingStory, updateStoryData.image)

          if (oldImage) {
            existingStory.addDomainEvent(new ImageUpdatedToStoryEvent(existingStory, oldImage, existingStory.image!))
          } else {
            existingStory.addDomainEvent(new ImageAddedToStoryEvent(existingStory, existingStory.image!))
          }
        }

        existingStory.update({
          id: updateStoryData.id,
          visibility: updateStoryData.visibility || existingStory.visibility.value,
          name: updateStoryData.name || existingStory.name,
          description: updateStoryData.description || existingStory.description,
          createdBy: existingStory.createdBy.value,
          createdByUserName: existingStory.createdByUserName.value,
          createdAt: existingStory.createdAt.value,
          updatedAt: unixtimeNow()
        })

        existingStory.addDomainEvent(new StoryUpdatedEvent(existingStory))

        this.storyUnitOfWork.aggregate = existingStory
        // unit of work sends all domain events and takes care of committing the transaction
        await this.storyUnitOfWork.execute()
        storyUpdated(this.storyMapper.toDTO(this.storyUnitOfWork.aggregate))
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

  private updateStoryImage(existingStory: Story, newImage: UpdateStoryImageInputDTO) {
    existingStory.image?.update({
      ...(newImage.visibility ? { visibility: validateAndCastEnum(newImage.visibility, VisibilityEnum) } : {}),
      fileName: existingStory.id.value,
      mimeType: newImage.mimeType,
      size: newImage.size,
      base64: newImage.base64
    })
  }
}
