import { Story } from '@hatsuportal/domain'
import { StoryDTO } from '../dtos/StoryDTO'
import { ImageDTO } from '../dtos/ImageDTO'
import { IImageApplicationMapper } from './ImageApplicationMapper'

export interface IStoryApplicationMapper {
  toDTO(story: Story): StoryDTO
  toDomainEntity(storyDTO: StoryDTO): Story
}

export class StoryApplicationMapper implements IStoryApplicationMapper {
  constructor(private readonly imageApplicationMapper: IImageApplicationMapper) {}

  toDTO(story: Story): StoryDTO {
    return {
      id: story.id.value,
      image: story.image ? this.imageApplicationMapper.toDTO(story.image) : null,
      name: story.name,
      description: story.description,
      visibility: story.visibility.value,
      createdBy: story.createdBy.value,
      createdByUserName: story.createdByUserName.value,
      createdAt: story.createdAt.value,
      updatedAt: story.updatedAt?.value ?? null
    }
  }

  toDomainEntity(storyDTO: StoryDTO): Story {
    return new Story(storyDTO)
  }
}
