import { ImageStateEnum } from '@hatsuportal/common'
import { EntityLoadError, EntityLoadErrorDTO, EntityLoadResult } from '@hatsuportal/platform'
import { Story, Tag } from '../../domain'
import { StoryDTO } from '../dtos/post/story/StoryDTO'
import { StoryWithRelationsDTO } from '../dtos/post/story/StoryWithRelationsDTO'
import { CommentWithRelationsDTO, StoryReadModelDTO } from '../dtos'
import { ImageAttachmentReadModelDTO } from '../dtos/image/ImageAttachmentReadModelDTO'

export interface IStoryApplicationMapper {
  toDTO(story: Story): StoryDTO
  toDTOWithRelations(
    story: StoryReadModelDTO,
    storyCreatedByName: string,
    coverImageLoadResult: EntityLoadResult<ImageAttachmentReadModelDTO, EntityLoadError>,
    coverImageCreatedByName: string,
    tags: Tag[],
    comments: CommentWithRelationsDTO[]
  ): StoryWithRelationsDTO
}

export class StoryApplicationMapper implements IStoryApplicationMapper {
  toDTO(story: Story): StoryDTO {
    return {
      id: story.id.value,
      title: story.title.value,
      body: story.body.value,
      coverImageId: story.coverImageId?.value ?? null,
      visibility: story.visibility.value,
      createdById: story.createdById.value,
      createdAt: story.createdAt.value,
      updatedAt: story.updatedAt.value,
      tagIds: story.tagIds.map((tag) => tag.value)
    }
  }

  toDTOWithRelations(
    story: StoryReadModelDTO,
    storyCreatedByName: string,
    coverImageLoadResult: EntityLoadResult<ImageAttachmentReadModelDTO, EntityLoadError>,
    coverImageCreatedByName: string,
    tags: Tag[],
    comments: CommentWithRelationsDTO[]
  ): StoryWithRelationsDTO {
    let imageLoadState: ImageStateEnum = ImageStateEnum.NotSet
    let imageLoadError: EntityLoadErrorDTO | null = null

    if (coverImageLoadResult.isSuccess()) {
      imageLoadState = ImageStateEnum.Available
    } else if (coverImageLoadResult.isFailed()) {
      imageLoadState = ImageStateEnum.FailedToLoad
      imageLoadError = {
        entityId: coverImageLoadResult.error!.entityId.value,
        error: coverImageLoadResult.error!.error.message
      }
    }

    return {
      id: story.id,
      title: story.title,
      body: story.body,
      visibility: story.visibility,
      createdById: story.createdById,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      createdByName: storyCreatedByName,
      coverImage: coverImageLoadResult.isSuccess()
        ? {
            ...coverImageLoadResult.value,
            createdByName: coverImageCreatedByName
          }
        : null,
      imageLoadState,
      imageLoadError,
      tags: tags.map((tag) => ({
        id: tag.id.value,
        slug: tag.slug.value,
        name: tag.name.value,
        createdById: tag.createdById.value,
        createdAt: tag.createdAt.value,
        updatedAt: tag.updatedAt.value
      })),
      commentListChunk: {
        comments: comments.map((comment) => ({
          id: comment.id,
          postId: comment.postId,
          authorId: comment.authorId,
          authorName: comment.authorName,
          body: comment.body,
          parentCommentId: comment.parentCommentId,
          isDeleted: comment.isDeleted,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          replyCount: comment.replyCount,
          hasReplies: comment.hasReplies,
          nextCursor: comment.nextCursor
        })),
        nextCursor: comments.length > 0 ? comments[comments.length - 1].nextCursor : null
      }
    }
  }
}
