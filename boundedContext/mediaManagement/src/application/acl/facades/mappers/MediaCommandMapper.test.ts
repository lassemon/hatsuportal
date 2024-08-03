import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { MediaCommandMapper } from './MediaCommandMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('MediaCommandMapper', () => {
  const mapper = new MediaCommandMapper()

  it('maps create staged command to input and result', () => {
    const input = mapper.toCreateStagedImageVersionInput({
      createdById: Fixture.sampleUserId,
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: Fixture.sampleImageId,
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA'
    })

    expect(input).toStrictEqual({
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: Fixture.sampleImageId,
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA'
    })

    expect(
      mapper.toCreateStagedImageVersionResult({
        createdById: Fixture.sampleUserId,
        imageId: Fixture.sampleImageId,
        stagedVersionId: Fixture.sampleImageVersionId
      })
    ).toStrictEqual({
      createdById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId
    })
  })

  it('maps promote and delete commands', () => {
    expect(
      mapper.toPromoteImageVersionInput({
        promotedById: Fixture.sampleUserId,
        imageId: Fixture.sampleImageId,
        stagedVersionId: Fixture.sampleImageVersionId
      })
    ).toStrictEqual({
      promotedById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId
    })

    expect(
      mapper.toDeleteImageInput({
        deletedById: Fixture.sampleUserId,
        imageId: Fixture.sampleImageId
      })
    ).toStrictEqual({ imageId: Fixture.sampleImageId })
  })
})
