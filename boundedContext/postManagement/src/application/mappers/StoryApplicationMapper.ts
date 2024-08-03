import { ImageStateEnum } from '@hatsuportal/common'
import { Story } from '../../domain'
import { StoryDTO } from '../dtos/StoryDTO'
import { IImageApplicationMapper, ImageLoadErrorDTO } from '@hatsuportal/common-bounded-context'

export interface IStoryApplicationMapper {
  toDTO(story: Story): StoryDTO
  toDomainEntity(storyDTO: StoryDTO): Story
}

export class StoryApplicationMapper implements IStoryApplicationMapper {
  constructor(private readonly imageApplicationMapper: IImageApplicationMapper) {}

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
      image: story.image ? this.imageApplicationMapper.toDTO(story.image) : null,
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

  toDomainEntity(storyDTO: StoryDTO): Story {
    return Story.reconstruct(storyDTO)
  }
}
