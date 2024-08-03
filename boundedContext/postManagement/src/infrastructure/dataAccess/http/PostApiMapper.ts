import { IPostApiMapper } from '../../../application/dataAccess/http/IPostApiMapper'
import { PostSearchCriteriaDTO, PostWithRelationsDTO } from '../../../application/dtos'
import { PostWithRelationsResponse, SearchPostsRequest } from '@hatsuportal/contracts'
import _ from 'lodash'
import { castToEnum, EntityTypeEnum, OrderEnum, SortableKeyEnum, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'

const DEFAULT_POSTS_PER_PAGE = 10
const DEFAULT_PAGE_NUMBER = 0

export class PostApiMapper implements IPostApiMapper {
  public toPostSearchCriteriaDTO(searchPostsRequest: SearchPostsRequest): PostSearchCriteriaDTO {
    let parsedVisibility: VisibilityEnum[] = []
    if (!_.isEmpty(searchPostsRequest.visibility)) {
      parsedVisibility = _.uniq(searchPostsRequest.visibility?.map((visibility) => validateAndCastEnum(visibility, VisibilityEnum)))
    }

    return {
      order: castToEnum(searchPostsRequest.order, OrderEnum, OrderEnum.Ascending),
      orderBy: castToEnum(searchPostsRequest.orderBy, SortableKeyEnum, SortableKeyEnum.TITLE),
      postsPerPage: searchPostsRequest.postsPerPage ?? DEFAULT_POSTS_PER_PAGE,
      pageNumber: searchPostsRequest.pageNumber ?? DEFAULT_PAGE_NUMBER,
      search: searchPostsRequest.search,
      visibility: _.compact(parsedVisibility),
      postType: searchPostsRequest.postType !== undefined ? validateAndCastEnum(searchPostsRequest.postType, EntityTypeEnum) : undefined
    }
  }

  public toPostWithRelationsResponse(dto: PostWithRelationsDTO): PostWithRelationsResponse {
    return {
      id: dto.id,
      visibility: dto.visibility,
      title: dto.title,
      postType: dto.postType,
      coverImageId: dto.coverImage?.id ?? null,
      createdById: dto.createdById,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      tagIds: dto.tags.map((t) => t.id),
      createdByName: dto.createdByName,
      coverImage: dto.coverImage
        ? {
            id: dto.coverImage.id,
            createdById: dto.coverImage.createdById,
            createdAt: dto.coverImage.createdAt,
            updatedAt: dto.coverImage.updatedAt,
            mimeType: dto.coverImage.mimeType,
            size: dto.coverImage.size,
            base64: dto.coverImage.base64,
            createdByName: dto.coverImage.createdByName
          }
        : null,
      imageLoadState: dto.imageLoadState,
      imageLoadError: dto.imageLoadError ?? null,
      tags: dto.tags.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        createdById: t.createdById,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    }
  }
}
