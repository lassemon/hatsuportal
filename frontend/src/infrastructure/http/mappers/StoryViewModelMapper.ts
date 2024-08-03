import { CreateStoryRequest, UpdateStoryRequest, StoryResponse } from '@hatsuportal/contracts'
import { StoryViewModel } from 'ui/features/story/viewModels/StoryViewModel'
import { IStoryViewModelMapper, IImageViewModelMapper } from 'application/interfaces'
import { VisibilityEnum, validateAndCastEnum } from '@hatsuportal/common'

export class StoryViewModelMapper implements IStoryViewModelMapper {
  constructor(private readonly imageViewModelMapper: IImageViewModelMapper) {}

  public toCreateStoryRequest(story: StoryViewModel): CreateStoryRequest {
    return {
      visibility: story.visibility,
      image: story.image
        ? {
            mimeType: story.image.mimeType,
            size: story.image.size,
            base64: story.image.base64
          }
        : null,
      name: story.name,
      description: story.description
    }
  }

  public toUpdateStoryRequest(story: StoryViewModel): UpdateStoryRequest {
    return {
      id: story.id,
      visibility: story.visibility,
      image: story.image
        ? {
            id: story.image.id,
            mimeType: story.image.mimeType,
            size: story.image.size,
            base64: story.image.base64
          }
        : null,
      name: story.name,
      description: story.description
    }
  }

  public toViewModel(response: StoryResponse): StoryViewModel {
    return new StoryViewModel({
      id: response.id,
      name: response.name,
      description: response.description,
      visibility: validateAndCastEnum(response.visibility, VisibilityEnum),
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      image: response.image ? this.imageViewModelMapper.toViewModel(response.image) : null,
      imageLoadState: response.imageLoadState,
      imageLoadError: response.imageLoadError ?? null
    })
  }
}
