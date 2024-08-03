import { describe, expect, it } from 'vitest'
import { StoryApplicationMapper } from './StoryApplicationMapper'

describe('storyApplicationMapper', () => {
  const storyMapper = new StoryApplicationMapper()

  it('converts story entity to dto', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const result = storyMapper.toDTO(story)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.storyDTOMock())
  })
})
