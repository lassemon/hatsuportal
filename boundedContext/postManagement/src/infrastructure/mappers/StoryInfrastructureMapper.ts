import { PostCreatorId, PostId, PostVisibility, Story, TagId } from '../../domain'
import { StoryDatabaseSchema } from '../schemas/StoryDatabaseSchema'
import { PostImageLinkDatabaseSchema } from '../schemas/PostImageLinkDatabaseSchema'
import { StoryReadDatabaseSchema } from '../schemas/StoryReadDatabaseSchema'
import { StoryReadModelDTO } from '../../application/dtos/post/story/StoryReadModelDTO'
import { ImageRoleEnum, PartialExceptFor, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { CoverImageId } from '../../domain/valueObjects/CoverImageId'

export interface IStoryInfrastructureMapper {
  toStoryInsertRecord(
    story: Story
  ): Omit<StoryDatabaseSchema, 'postType' | 'coverImageId' | 'tagIds' | 'commentIds' | 'createdById' | 'createdAt' | 'updatedAt'>
  toStoryUpdateRecord(
    story: Story
  ): PartialExceptFor<Omit<StoryDatabaseSchema, 'postType' | 'coverImageId' | 'tagIds' | 'commentIds'>, 'id'>
  toImageLinkRow(story: Story): Omit<PostImageLinkDatabaseSchema, 'createdAt'> | null
  toDTO(storyRecord: StoryReadDatabaseSchema): StoryReadModelDTO
  toDomainEntity(storyRecord: StoryDatabaseSchema): Story
}

export class StoryInfrastructureMapper implements IStoryInfrastructureMapper {
  constructor() {}

  toStoryInsertRecord(
    story: Story
  ): Omit<StoryDatabaseSchema, 'postType' | 'coverImageId' | 'tagIds' | 'commentIds' | 'createdById' | 'createdAt' | 'updatedAt'> {
    return {
      id: story.id.value,
      name: story.name.value,
      description: story.description.value,
      visibility: story.visibility.value
    }
  }

  toStoryUpdateRecord(story: Story): PartialExceptFor<StoryDatabaseSchema, 'id'> {
    return {
      id: story.id.value,
      name: story.name.value,
      description: story.description.value,
      visibility: story.visibility.value
    }
  }

  toImageLinkRow(story: Story): Omit<PostImageLinkDatabaseSchema, 'createdAt'> | null {
    return story.coverImageId
      ? {
          postId: story.id.value,
          role: ImageRoleEnum.Cover,
          imageId: story.coverImageId.value
        }
      : null
  }

  toDTO(storyRecord: StoryReadDatabaseSchema): StoryReadModelDTO {
    return {
      id: storyRecord.id,
      visibility: validateAndCastEnum(storyRecord.visibility, VisibilityEnum),
      name: storyRecord.name,
      description: storyRecord.description,
      createdByName: storyRecord.createdByName,
      createdById: storyRecord.createdById,
      createdAt: storyRecord.createdAt,
      updatedAt: storyRecord.updatedAt ?? storyRecord.createdAt,
      coverImageId: storyRecord.coverImageId ?? null,
      tagIds: storyRecord.tagIds,
      commentIds: storyRecord.commentIds
    }
  }

  toDomainEntity(storyRecord: StoryDatabaseSchema): Story {
    return Story.reconstruct({
      id: new PostId(storyRecord.id),
      createdById: new PostCreatorId(storyRecord.createdById),
      visibility: new PostVisibility(validateAndCastEnum(storyRecord.visibility, VisibilityEnum)),
      name: new NonEmptyString(storyRecord.name),
      description: new NonEmptyString(storyRecord.description),
      coverImageId: storyRecord.coverImageId ? new CoverImageId(storyRecord.coverImageId) : null,
      tagIds: storyRecord.tagIds.map((id) => new TagId(id)),
      createdAt: new UnixTimestamp(storyRecord.createdAt),
      updatedAt: new UnixTimestamp(storyRecord.updatedAt)
    })
  }
}
