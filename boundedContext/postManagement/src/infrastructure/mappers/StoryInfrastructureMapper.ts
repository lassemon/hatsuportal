import { Story } from '../../domain'
import _ from 'lodash'
import { StoryDatabaseSchema } from '../schemas/StoryDatabaseSchema'
import { ImageStateEnum, Maybe, PartialExceptFor, unixtimeNow, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { IImageApplicationMapper, ImageId, ImageLoadErrorDTO } from '@hatsuportal/common-bounded-context'
import { Image } from '@hatsuportal/common-bounded-context'
import { StoryDTO } from '../../application'

export interface IStoryInfrastructureMapper {
  toInsertQuery(story: Story): Omit<StoryDatabaseSchema, 'createdByName'>
  toUpdateQuery(story: Story): PartialExceptFor<Omit<StoryDatabaseSchema, 'createdByName'>, 'id'>
  toDTO(storyRecord: StoryDatabaseSchema, image: Maybe<Image>): StoryDTO
  toDomainEntity(storyRecord: StoryDatabaseSchema, image: Maybe<Image>, imageLoadError?: Maybe<Error>): Story
}

export class StoryInfrastructureMapper implements IStoryInfrastructureMapper {
  constructor(private readonly imageApplicationMapper: IImageApplicationMapper) {}

  toInsertQuery(story: Story): Omit<StoryDatabaseSchema, 'createdByName'> {
    const createdAt = unixtimeNow()
    return {
      id: story.id.value,
      name: story.name,
      description: story.description,
      imageId: story.image?.id.value ?? null,
      visibility: story.visibility.value,
      createdById: story.createdById.value,
      createdAt: createdAt,
      updatedAt: createdAt
    }
  }

  toUpdateQuery(story: Story): PartialExceptFor<Omit<StoryDatabaseSchema, 'createdByName'>, 'id'> {
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
    let imageLoadState: ImageStateEnum
    let imageLoadError: ImageLoadErrorDTO | undefined

    if (!storyRecord.imageId) {
      imageLoadState = ImageStateEnum.NotSet
    } else if (image) {
      imageLoadState = ImageStateEnum.Available
    } else {
      imageLoadState = ImageStateEnum.FailedToLoad
      imageLoadError = {
        imageId: storyRecord.imageId,
        error: 'Image failed to load'
      }
    }

    return {
      id: storyRecord.id,
      visibility: validateAndCastEnum(storyRecord.visibility, VisibilityEnum),
      image: image ? this.imageApplicationMapper.toDTO(image) : null,
      name: storyRecord.name,
      description: storyRecord.description,
      createdById: storyRecord.createdById,
      createdByName: storyRecord.createdByName,
      createdAt: storyRecord.createdAt,
      updatedAt: storyRecord.updatedAt ?? storyRecord.createdAt,
      imageLoadState,
      imageLoadError
    }
  }

  toDomainEntity(storyRecord: StoryDatabaseSchema, image?: Image, imageLoadError?: Maybe<Error>): Story {
    const story = new Story(this.toDTO(storyRecord, image))

    if (storyRecord.imageId && imageLoadError) {
      story.setImageLoadFailure(new ImageId(storyRecord.imageId), imageLoadError)
    }

    return story
  }
}
