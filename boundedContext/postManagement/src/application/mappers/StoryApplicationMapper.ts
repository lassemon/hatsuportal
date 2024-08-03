import { EntityTypeEnum, ImageStateEnum, unixtimeNow, uuid } from '@hatsuportal/common'
import { Story } from '../../domain'
import { ImageLoadErrorDTO, ImageProps } from '@hatsuportal/common-bounded-context'
import { IStoryFactory } from '../services/StoryFactory'
import { StoryDTO } from '../dtos/StoryDTO'
import { CreateStoryImageInputDTO, CreateStoryInputDTO } from '../dtos/CreateStoryInputDTO'
import { UpdateStoryImageInputDTO, UpdateStoryInputDTO } from '../dtos/UpdateStoryInputDTO'

export interface IStoryApplicationMapper {
  toDTO(story: Story): StoryDTO
  dtoToDomainEntity(storyDTO: StoryDTO): Story
  createInputToDomainEntity(createStoryInput: CreateStoryInputDTO, createdById: string, createdByName: string): Story
  updateInputToDomainEntity(updateStoryInput: UpdateStoryInputDTO, story: Story): Story
}

export class StoryApplicationMapper implements IStoryApplicationMapper {
  constructor(private readonly storyFactory: IStoryFactory) {}
  toDTO(story: Story): StoryDTO {
    let imageLoadState: ImageStateEnum
    let imageLoadError: ImageLoadErrorDTO | null = null

    if (story.imageLoadResult) {
      if (story.imageLoadResult.isSuccess()) {
        imageLoadState = ImageStateEnum.Available
      } else if (story.imageLoadResult.isFailed()) {
        imageLoadState = ImageStateEnum.FailedToLoad
        imageLoadError = {
          imageId: story.imageLoadResult.loadError!.imageId.value,
          error: story.imageLoadResult.loadError!.error.message
        }
      } else {
        imageLoadState = ImageStateEnum.NotSet
      }
    } else {
      imageLoadState = story.image ? ImageStateEnum.Available : ImageStateEnum.NotSet
    }

    return {
      id: story.id.value,
      // TODO, might not be cosher according to clean architecture to use the imageApplicationMapper here ?
      image: story.image ? story.image.getProps() : null,
      name: story.name.value,
      description: story.description.value,
      visibility: story.visibility.value,
      createdById: story.createdById.value,
      createdByName: story.createdByName.value,
      createdAt: story.createdAt.value,
      updatedAt: story.updatedAt?.value ?? null,
      imageLoadState,
      imageLoadError
    }
  }

  dtoToDomainEntity(storyDTO: StoryDTO): Story {
    return Story.reconstruct(storyDTO)
  }

  createInputToDomainEntity(createStoryInput: CreateStoryInputDTO, createdById: string, createdByName: string): Story {
    const { createStoryData } = createStoryInput
    const newStoryId = uuid()
    const now = unixtimeNow()

    const result = this.storyFactory.createStory({
      id: newStoryId,
      visibility: createStoryData.visibility,
      image: createStoryData.image ? this.createStoryImage(createStoryData.image, newStoryId, createdById, createdByName) : null,
      name: createStoryData.name,
      description: createStoryData.description,
      createdById: createdById,
      createdByName: createdByName,
      createdAt: now,
      updatedAt: now
    })

    if (result.isFailure()) {
      throw result.error
    }

    return result.value
  }

  updateInputToDomainEntity(updateStoryInput: UpdateStoryInputDTO, existingStory: Story): Story {
    const { updateStoryData } = updateStoryInput
    existingStory.update({
      visibility: updateStoryData.visibility || existingStory.visibility.value,
      name: updateStoryData.name || existingStory.name.value,
      description: updateStoryData.description || existingStory.description.value,
      image: updateStoryData.image ? this.updateStoryImage(existingStory, updateStoryData.image) : null
    })
    return existingStory
  }

  private createStoryImage(newImage: CreateStoryImageInputDTO, storyId: string, createdById: string, createdByName: string): ImageProps {
    const now = unixtimeNow()
    return {
      id: uuid(),
      fileName: storyId,
      mimeType: newImage.mimeType,
      size: newImage.size,
      ownerEntityId: storyId,
      ownerEntityType: EntityTypeEnum.Story,
      base64: newImage.base64,
      createdById: createdById,
      createdByName: createdByName,
      createdAt: now,
      updatedAt: now
    }
  }

  private updateStoryImage(existingStory: Story, imageUpdateDTO: UpdateStoryImageInputDTO): ImageProps {
    let existingImageProps = existingStory.image?.getProps()

    if (existingImageProps) {
      // update the existing image
      return {
        ...existingImageProps,
        mimeType: imageUpdateDTO.mimeType || existingImageProps.mimeType,
        size: imageUpdateDTO.size || existingImageProps.size,
        base64: imageUpdateDTO.base64 || existingImageProps.base64
      }
    } else {
      // create a brand new image
      return this.createStoryImage(
        imageUpdateDTO,
        existingStory.id.value,
        existingStory.createdById.value,
        existingStory.createdByName.value
      )
    }
  }
}
