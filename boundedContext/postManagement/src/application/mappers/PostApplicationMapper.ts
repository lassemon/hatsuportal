import { EntityTypeEnum } from '@hatsuportal/common'
import { PostWithRelationsDTO } from '../dtos/post/PostWithRelationsDTO'
import { StoryWithRelationsDTO } from '../dtos/post/story/StoryWithRelationsDTO'
import { PostSearchCriteriaDTO, StorySearchCriteriaDTO } from '../dtos'

export interface IPostApplicationMapper {
  fromStoryWithRelations(story: StoryWithRelationsDTO): PostWithRelationsDTO
  toStorySearchCriteria(criteria: PostSearchCriteriaDTO): StorySearchCriteriaDTO
}

export class PostApplicationMapper implements IPostApplicationMapper {
  fromStoryWithRelations(story: StoryWithRelationsDTO): PostWithRelationsDTO {
    return {
      id: story.id,
      postType: EntityTypeEnum.Story,
      createdById: story.createdById,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      visibility: story.visibility,
      title: story.title,
      createdByName: story.createdByName,
      coverImage: story.coverImage,
      imageLoadState: story.imageLoadState,
      imageLoadError: story.imageLoadError,
      tags: story.tags
    }
  }

  toStorySearchCriteria(criteria: PostSearchCriteriaDTO): StorySearchCriteriaDTO {
    return {
      order: criteria.order,
      orderBy: criteria.orderBy,
      storiesPerPage: criteria.postsPerPage,
      pageNumber: criteria.pageNumber,
      loggedInCreatorId: criteria.loggedInCreatorId,
      onlyMyStories: false,
      search: criteria.search,
      visibility: criteria.visibility,
      hasImage: undefined
    }
  }
}
