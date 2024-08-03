import { describe, expect, it } from 'vitest'
import { StoryApplicationMapper } from './StoryApplicationMapper'
import { Story } from '../../domain'
import { ImageApplicationMapper, ImageFactory } from '@hatsuportal/common-bounded-context'
import { StoryFactory } from '../services/StoryFactory'

describe('storyApplicationMapper', () => {
  const storyMapper = new StoryApplicationMapper(new StoryFactory())

  it('converts story entity to dto', ({ unitFixture }) => {
    const story = Story.create(unitFixture.storyDTOMock())
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
      image: {
        id: story.image?.id.value,
        fileName: story.image?.fileName.value,
        mimeType: story.image?.mimeType.value,
        size: story.image?.size.value,
        ownerEntityId: story.image?.ownerEntityId.value,
        ownerEntityType: story.image?.ownerEntityType.value,
        base64: story.image?.base64.value,
        createdById: story.image?.createdById.value,
        createdByName: story.image?.createdByName.value,
        createdAt: story.image?.createdAt.value,
        updatedAt: story.image?.updatedAt?.value
      },
      imageLoadState: story.imageLoadResult?.state.value,
      imageLoadError: null,
      name: story.name.value,
      description: story.description.value,
      createdById: story.createdById.value,
      createdByName: story.createdByName.value,
      createdAt: story.createdAt.value,
      updatedAt: story.updatedAt?.value
    }).toStrictEqual(unitFixture.storyDTOMock())
  })

  // TODO: Add tests for image load result with and without error

  it('converts create story input to story entity', ({ unitFixture }) => {
    // TODO: Add test for create story input to story entity
  })
})
