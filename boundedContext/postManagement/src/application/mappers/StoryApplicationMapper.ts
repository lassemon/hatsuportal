import { ImageStateEnum, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { PostCreatorId, PostId, PostVisibility, Story, Tag, TagId } from '../../domain'
import { StoryDTO } from '../dtos/post/story/StoryDTO'
import { StoryWithRelationsDTO } from '../dtos/post/story/StoryWithRelationsDTO'
import { CommentWithRelationsDTO, StoryReadModelDTO } from '../dtos'
import { ImageAttachmentReadModelDTO } from '../dtos/image/ImageAttachmentReadModelDTO'
import ImageLoadResult from '../acl/mediaManagement/outcomes/ImageLoadResult'
import { ImageLoadError } from '../acl/mediaManagement/errors/ImageLoadError'
import { ImageLoadErrorDTO } from '../dtos/image/ImageLoadErrorDTO'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { CoverImageId } from '../../domain/valueObjects/CoverImageId'

export interface IStoryApplicationMapper {
  toDTO(story: Story): StoryDTO
  toDTOWithRelations(
    story: StoryReadModelDTO,
    storyCreatedByName: string,
    coverImageLoadResult: ImageLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>,
    coverImageCreatedByName: string,
    tags: Tag[],
    comments: CommentWithRelationsDTO[]
  ): StoryWithRelationsDTO
  dtoToDomainEntity(storyDTO: StoryDTO): Story
}

export class StoryApplicationMapper implements IStoryApplicationMapper {
  toDTO(story: Story): StoryDTO {
    return {
      id: story.id.value,
      name: story.name.value,
      description: story.description.value,
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
    coverImageLoadResult: ImageLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>,
    coverImageCreatedByName: string,
    tags: Tag[],
    comments: CommentWithRelationsDTO[]
  ): StoryWithRelationsDTO {
    let imageLoadState: ImageStateEnum = ImageStateEnum.NotSet
    let imageLoadError: ImageLoadErrorDTO | null = null

    if (coverImageLoadResult.isSuccess()) {
      imageLoadState = ImageStateEnum.Available
    } else if (coverImageLoadResult.isFailed()) {
      imageLoadState = ImageStateEnum.FailedToLoad
      imageLoadError = {
        imageId: coverImageLoadResult.error!.imageId.value,
        error: coverImageLoadResult.error!.error.message
      }
    }

    return {
      id: story.id,
      name: story.name,
      description: story.description,
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

  dtoToDomainEntity(storyDTO: StoryDTO): Story {
    return Story.reconstruct({
      id: new PostId(storyDTO.id),
      createdById: new PostCreatorId(storyDTO.createdById),
      visibility: new PostVisibility(validateAndCastEnum(storyDTO.visibility, VisibilityEnum)),
      name: new NonEmptyString(storyDTO.name),
      description: new NonEmptyString(storyDTO.description),
      coverImageId: storyDTO.coverImageId ? new CoverImageId(storyDTO.coverImageId) : null,
      tagIds: storyDTO.tagIds.map((id) => new TagId(id)),
      createdAt: new UnixTimestamp(storyDTO.createdAt),
      updatedAt: new UnixTimestamp(storyDTO.updatedAt)
    })
  }
}
