import { describe, expect, it } from 'vitest'
import { StoryApplicationMapper } from './StoryApplicationMapper'
import { Story } from '@hatsuportal/domain'

describe('storyApplicationMapper', () => {
  const storyMapper = new StoryApplicationMapper()

  it('converts story entity to dto', ({ unitFixture }) => {
    const story = new Story(unitFixture.storyDTO())
    const result = storyMapper.toDTO(story)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.storyDTO())
  })

  it('converts dto into story entity', ({ unitFixture }) => {
    const story = storyMapper.toDomainEntity(unitFixture.storyDTO())
    expect(story).toBeInstanceOf(Story)
    expect({
      id: story.id.value,
      visibility: story.visibility.value,
      imageId: story.imageId?.value,
      name: story.name,
      description: story.description,
      createdBy: story.createdBy.value,
      createdByUserName: story.createdByUserName.value,
      createdAt: story.createdAt.value,
      updatedAt: story.updatedAt?.value
    }).toStrictEqual(unitFixture.storyDTO())
  })
})
