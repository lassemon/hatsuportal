import { Image, Story } from '@hatsuportal/domain'
import _ from 'lodash'
import { StoryDatabaseSchema } from '../schemas/StoryDatabaseSchema'
import { Maybe, PartialExceptFor, unixtimeNow, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { IImageApplicationMapper, StoryDTO } from '@hatsuportal/application'

export interface IStoryInfrastructureMapper {
  toInsertQuery(story: Story): Omit<StoryDatabaseSchema, 'createdByUserName'>
  toUpdateQuery(story: Story): PartialExceptFor<Omit<StoryDatabaseSchema, 'createdByUserName'>, 'id'>
  toDTO(storyRecord: StoryDatabaseSchema, image: Maybe<Image>): StoryDTO
  toDomainEntity(storyRecord: StoryDatabaseSchema, image: Maybe<Image>): Story
}

export class StoryInfrastructureMapper implements IStoryInfrastructureMapper {
  constructor(private readonly imageApplicationMapper: IImageApplicationMapper) {}

  toInsertQuery(story: Story): Omit<StoryDatabaseSchema, 'createdByUserName'> {
    const createdAt = unixtimeNow()
    return {
      id: story.id.value,
      name: story.name,
      description: story.description,
      imageId: story.image?.id.value ?? null,
      visibility: story.visibility.value,
      createdBy: story.createdBy.value,
      createdAt: createdAt,
      updatedAt: null
    }
  }

  toUpdateQuery(story: Story): PartialExceptFor<Omit<StoryDatabaseSchema, 'createdByUserName'>, 'id'> {
    const updatedAt = unixtimeNow()
    return {
      id: story.id.value,
      name: story.name,
      description: story.description,
      imageId: story.image?.id.value ?? null,
      visibility: story.visibility.value,
      updatedAt: updatedAt
    }
  }

  toDTO(storyRecord: StoryDatabaseSchema, image?: Image): StoryDTO {
    return {
      id: storyRecord.id,
      visibility: validateAndCastEnum(storyRecord.visibility, VisibilityEnum),
      image: image ? this.imageApplicationMapper.toDTO(image) : null,
      name: storyRecord.name,
      description: storyRecord.description,
      createdBy: storyRecord.createdBy,
      createdByUserName: storyRecord.createdByUserName,
      createdAt: storyRecord.createdAt,
      updatedAt: storyRecord.updatedAt ?? null
    }
  }

  toDomainEntity(storyRecord: StoryDatabaseSchema, image?: Image): Story {
    return new Story(this.toDTO(storyRecord, image))
  }
}
