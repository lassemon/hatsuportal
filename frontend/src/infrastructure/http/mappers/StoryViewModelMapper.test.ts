import { describe, expect, it } from 'vitest'
import { StoryViewModelMapper } from './StoryViewModelMapper'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { ImageViewModel } from 'ui/entities/image/model/ImageViewModel'
import { ImageViewModelMapper } from './ImageViewModelMapper'

describe('StoryViewModelMapper', () => {
  const storyMapper = new StoryViewModelMapper(new ImageViewModelMapper())

  it('converts story response to StoryViewModel entity', ({ unitFixture }) => {
    expect(storyMapper.toViewModel(unitFixture.storyWithRelationsResponse())).toBeInstanceOf(StoryViewModel)
    expect(storyMapper.toViewModel(unitFixture.storyWithRelationsResponse()).coverImage).toBeInstanceOf(ImageViewModel)
  })
})
