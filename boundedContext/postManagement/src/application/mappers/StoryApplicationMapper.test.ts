import { describe, expect, it } from 'vitest'
import { StoryApplicationMapper } from './StoryApplicationMapper'
import { Story } from '../../domain'

describe('storyApplicationMapper', () => {
  const storyMapper = new StoryApplicationMapper()

  it('converts story entity to dto', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const result = storyMapper.toDTO(story)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.storyDTOMock())
  })

  it('converts dto into story entity', ({ unitFixture }) => {
    const story = storyMapper.dtoToDomainEntity(unitFixture.storyDTOMock())
    expect(story).toBeInstanceOf(Story)
    expect({
      id: story.id.value,
      visibility: story.visibility.value,
      name: story.name.value,
      description: story.description.value,
      createdById: story.createdById.value,
      createdAt: story.createdAt.value,
      updatedAt: story.updatedAt?.value,
      coverImageId: story.coverImageId?.value,
      tagIds: story.tagIds.map((tag) => tag.value)
    }).toStrictEqual(unitFixture.storyDTOMock())
  })
})
