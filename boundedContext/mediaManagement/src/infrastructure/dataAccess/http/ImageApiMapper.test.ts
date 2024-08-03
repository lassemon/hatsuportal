import { describe, expect, it } from 'vitest'
import { ImageApiMapper } from './ImageApiMapper'

describe('ImageApiMapper', () => {
  const imageMapper = new ImageApiMapper()

  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createImageRequest()
    const dto = imageMapper.toCreateImageInputDTO(createRequest, unitFixture.sampleImageId)

    // common post properties
    expect((dto as any).id).toBeUndefined() // should not be given from request
    expect((dto as any).createdById).toBeUndefined() // should not be given from request
    expect((dto as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto as any).updatedAt).toBeUndefined() // should not be given from request

    // metadata properties
    expect(dto.ownerEntityType).toBe(createRequest.ownerEntityType)
    expect(dto.ownerEntityId).toBe(createRequest.ownerEntityId)
    expect(dto.role).toBe(createRequest.role)
    expect(dto.mimeType).toBe(createRequest.mimeType)
    expect(dto.size).toBe(createRequest.size)
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateImageRequest()
    const dto = imageMapper.toUpdateImageInputDTO(updateRequest, unitFixture.sampleImageId, unitFixture.sampleUserId)

    // common post properties
    expect(dto.id).toBe(unitFixture.sampleImageId) // should not be able to update from request
    expect((dto as any).createdById).toBeUndefined() // should not be able to update from request
    expect((dto as any).createdAt).toBeUndefined() // should not be able to update from request
    expect((dto as any).updatedAt).toBeUndefined() // should not be able to update from request

    // metadata properties
    expect(dto.mimeType).not.toBeUndefined() // mimetype should not become undefined when it is missing from update payload
    expect(dto.mimeType).toBe(updateRequest.mimeType)
    expect(dto.size).toBe(updateRequest.size)
    expect(dto.base64).toBe(updateRequest.base64)
  })

  it('converts image dto to response', ({ unitFixture }) => {
    // this is more of a dummy test because currently no specific mapping is done from ImageDTO -> ImageResponse
    expect(imageMapper.toResponse(unitFixture.imageDTOMock())).toStrictEqual(unitFixture.imageResponse())
  })
})
