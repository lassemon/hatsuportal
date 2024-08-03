import { describe, expect, it } from 'vitest'
import { StoryApplicationMapper } from './StoryApplicationMapper'
import { Story } from '@hatsuportal/domain'
import { ImageApplicationMapper } from './ImageApplicationMapper'

describe('storyApplicationMapper', () => {
  const storyMapper = new StoryApplicationMapper(new ImageApplicationMapper())

  it('converts story entity to dto', ({ unitFixture }) => {
    const story = new Story(unitFixture.storyDTOMock())
    const result = storyMapper.toDTO(story)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.storyDTOMock())
  })

  it('converts dto into story entity', ({ unitFixture }) => {
    const story = storyMapper.toDomainEntity(unitFixture.storyDTOMock())
    expect(story).toBeInstanceOf(Story)
    expect({
      id: story.id.value,
      visibility: story.visibility.value,
      image: {
        id: story.image?.id.value,
        fileName: story.image?.fileName.value,
        mimeType: story.image?.mimeType.value,
        size: story.image?.size.value,
        ownerId: story.image?.ownerId?.value,
        ownerType: story.image?.ownerType?.value,
        base64: story.image?.base64.value,
        visibility: story.image?.visibility.value,
        createdBy: story.image?.createdBy.value,
        createdByUserName: story.image?.createdByUserName.value,
        createdAt: story.image?.createdAt.value,
        updatedAt: story.image?.updatedAt?.value
      },
      name: story.name,
      description: story.description,
      createdBy: story.createdBy.value,
      createdByUserName: story.createdByUserName.value,
      createdAt: story.createdAt.value,
      updatedAt: story.updatedAt?.value
    }).toStrictEqual(unitFixture.storyDTOMock())
  })
})
