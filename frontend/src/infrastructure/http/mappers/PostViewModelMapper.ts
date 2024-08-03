import { EntityTypeEnum, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { PostWithRelationsResponse } from '@hatsuportal/contracts'
import { IImageViewModelMapper } from 'application/interfaces'
import { IPostViewModelMapper } from 'application/interfaces/http/mappers/IPostViewModelMapper'
import { PostViewModel, PostViewModelDTO } from 'ui/features/post/common/viewModels/PostViewModel'

export class PostViewModelMapper implements IPostViewModelMapper {
  constructor(private readonly imageViewModelMapper: IImageViewModelMapper) {}
  toViewModel(response: PostWithRelationsResponse): PostViewModel<PostViewModelDTO> {
    return new PostViewModel({
      id: response.id,
      title: response.title,
      postType: validateAndCastEnum(response.postType, EntityTypeEnum),
      visibility: validateAndCastEnum(response.visibility, VisibilityEnum),
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      coverImage: response.coverImage ? this.imageViewModelMapper.toViewModel(response.coverImage) : null,
      imageLoadState: response.imageLoadState,
      imageLoadError: response.imageLoadError ?? null,
      tags: response.tags ?? []
    })
  }
}
