import { CreateStoryRequest, UpdateStoryRequest, StoryWithRelationsResponse } from '@hatsuportal/contracts'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { IStoryViewModelMapper, IImageViewModelMapper } from 'application/interfaces'
import { CommentViewModel } from 'ui/features/post/comment/viewModel/CommentViewModel'
import { validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'

export class StoryViewModelMapper implements IStoryViewModelMapper {
  constructor(private readonly imageViewModelMapper: IImageViewModelMapper) {}

  public toCreateStoryRequest(createPayload: CreateStoryRequest): CreateStoryRequest {
    return {
      visibility: createPayload.visibility,
      image: createPayload.image
        ? {
            mimeType: createPayload.image.mimeType,
            size: createPayload.image.size,
            base64: createPayload.image.base64
          }
        : null,
      name: createPayload.name,
      description: createPayload.description,
      tags: createPayload.tags ?? []
    }
  }

  /* safer/futureproof to keep this abstraction layer between DTO and ViewModel even though it maps only to itself atm. */
  public toUpdateStoryRequest(updatePayload: UpdateStoryRequest): UpdateStoryRequest {
    return {
      visibility: updatePayload.visibility,
      image: this.buildImageField(updatePayload),
      name: updatePayload.name,
      description: updatePayload.description,
      tags: updatePayload.tags
    }
  }

  public toViewModel(response: StoryWithRelationsResponse): StoryViewModel {
    return new StoryViewModel({
      id: response.id,
      name: response.name,
      description: response.description,
      visibility: validateAndCastEnum(response.visibility, VisibilityEnum),
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      coverImage: response.coverImage ? this.imageViewModelMapper.toViewModel(response.coverImage) : null,
      imageLoadState: response.imageLoadState,
      imageLoadError: response.imageLoadError ?? null,
      tags: response.tags ?? [],
      commentConnection: {
        totalCount: response.commentConnection.totalCount,
        comments: response.commentConnection.comments.map((comment) => new CommentViewModel(comment)),
        nextCursor: response.commentConnection.nextCursor
      }
    })
  }

  private buildImageField(updatePayload: UpdateStoryRequest) {
    if (updatePayload.image === undefined) {
      return undefined // no changes
    }

    if (updatePayload.image === null) {
      return null // explicit removal request
    }

    const { mimeType, size, base64 } = updatePayload.image
    return { mimeType, size, base64 }
  }
}
