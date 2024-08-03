import { describe, expect, it } from 'vitest'
import { ProfileApiMapper } from './ProfileApiMapper'

describe('ProfileApiMapper', () => {
  const mapper = new ProfileApiMapper()

  it('converts profile dto to response', () => {
    expect(
      mapper.toResponse({
        bio: 'Hello',
        statusMessage: 'Available',
        profileImageId: 'image-1'
      })
    ).toStrictEqual({
      bio: 'Hello',
      statusMessage: 'Available',
      profileImageId: 'image-1'
    })
  })

  it('maps update request image fields to input dto', () => {
    expect(
      mapper.toUpdateUserProfileInputDTO({
        bio: 'Updated bio',
        image: {
          mimeType: 'image/webp',
          size: 100,
          base64: 'base64-data'
        }
      })
    ).toStrictEqual({
      bio: 'Updated bio',
      statusMessage: undefined,
      image: {
        mimeType: 'image/webp',
        size: 100,
        base64: 'base64-data'
      }
    })
  })

  it('maps null image to explicit removal', () => {
    expect(
      mapper.toUpdateUserProfileInputDTO({
        image: null
      })
    ).toStrictEqual({
      bio: undefined,
      statusMessage: undefined,
      image: null
    })
  })
})
