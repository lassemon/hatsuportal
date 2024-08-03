import { describe, expect, it } from 'vitest'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ImageStateEnum } from '@hatsuportal/common'
import { PostQueryMapper } from './PostQueryMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('PostQueryMapper', () => {
  const mapper = new PostQueryMapper()

  it('maps story without cover image to contract', () => {
    const story = {
      ...Fixture.storyReadModelDTOMock(),
      createdByName: 'Test User',
      coverImage: null,
      imageLoadState: ImageStateEnum.NotSet,
      imageLoadError: null,
      tags: [],
      commentListChunk: { comments: [], nextCursor: null }
    }

    const contract = mapper.toStoryContract(story)

    expect(contract.id).toBe(Fixture.sampleStoryId)
    expect(contract.coverImage).toBeNull()
    expect(contract.tags).toEqual([])
  })

  it('maps story with cover image and tags to contract', () => {
    const image = Fixture.imageAttacmentMock()
    const story = {
      ...Fixture.storyReadModelDTOMock(),
      createdByName: 'Test User',
      coverImage: { ...image, createdByName: 'Image Creator' },
      imageLoadState: ImageStateEnum.Available,
      imageLoadError: null,
      tags: [Fixture.tagDTOMock()],
      commentListChunk: { comments: [], nextCursor: null }
    }

    const contract = mapper.toStoryContract(story)

    expect(contract.coverImage).not.toBeNull()
    expect(contract.coverImage?.kind).toBe(mediaV1.MediaKindContract.Image)
    expect(contract.coverImage?.id).toBe(Fixture.sampleImageId)
    expect(contract.coverImage?.storageKey).toBe(image.storageKey)
    expect(contract.tags).toHaveLength(1)
    expect(contract.tags[0].slug).toBe('test-tag')
  })
})
