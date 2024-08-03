import { Story } from '@hatsuportal/domain'
import _ from 'lodash'
import { StoryDatabaseSchema } from '../schemas/StoryDatabaseSchema'
import { PartialExceptFor, unixtimeNow, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { StoryDTO } from '@hatsuportal/application'

export interface IStoryInfrastructureMapper {
  toInsertQuery(story: Story): StoryDatabaseSchema
  toUpdateQuery(story: Story): PartialExceptFor<StoryDatabaseSchema, 'id'>
  toDTO(storyRecord: StoryDatabaseSchema): StoryDTO
  toDomainEntity(storyRecord: StoryDatabaseSchema): Story
}

export class StoryInfrastructureMapper implements IStoryInfrastructureMapper {
  toInsertQuery(story: Story): StoryDatabaseSchema {
    const createdAt = unixtimeNow()
    return {
      id: story.id.value,
      name: story.name,
      description: story.description,
      imageId: story.imageId?.value ?? null,
      visibility: story.visibility.value,
      createdBy: story.createdBy.value,
      createdByUserName: story.createdByUserName.value,
      createdAt: createdAt,
      updatedAt: null
    }
  }

  toUpdateQuery(story: Story): PartialExceptFor<StoryDatabaseSchema, 'id'> {
    const updatedAt = unixtimeNow()
    return {
      id: story.id.value,
      name: story.name,
      description: story.description,
      imageId: story.imageId?.value ?? null,
      visibility: story.visibility.value,
      updatedAt: updatedAt
    }
  }

  toDTO(storyRecord: StoryDatabaseSchema): StoryDTO {
    return {
      id: storyRecord.id,
      visibility: validateAndCastEnum(storyRecord.visibility, VisibilityEnum),
      imageId: storyRecord.imageId ?? null,
      name: storyRecord.name,
      description: storyRecord.description,
      createdBy: storyRecord.createdBy,
      createdByUserName: storyRecord.createdByUserName,
      createdAt: storyRecord.createdAt,
      updatedAt: storyRecord.updatedAt ?? null
    }
  }

  toDomainEntity(storyRecord: StoryDatabaseSchema): Story {
    return new Story(this.toDTO(storyRecord))
  }
}
