import { describe, expect, it } from 'vitest'
import { ImagePresentationMapper } from './ImagePresentationMapper'

describe('ImagePresentationMapper', () => {
  const imageMapper = new ImagePresentationMapper()

  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createImageRequest()
    const dto = imageMapper.toCreateImageInputDTO(createRequest, unitFixture.loggedInUserId())

    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())

    // common post properties
    expect((dto.createImageData as any).id).toBeUndefined() // should not be given from request
    expect((dto.createImageData as any).createdById).toBeUndefined() // should not be given from request
    expect((dto.createImageData as any).createdByName).toBeUndefined() // should not be given from request
    expect((dto.createImageData as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.createImageData as any).updatedAt).toBeUndefined() // should not be given from request

    // metadata properties
    expect(dto.createImageData.fileName).toBe(createRequest.fileName)
    expect(dto.createImageData.mimeType).toBe(createRequest.mimeType)
    expect(dto.createImageData.size).toBe(createRequest.size)
    expect(dto.createImageData.ownerEntityId).toStrictEqual(createRequest.ownerEntityId)
    expect(dto.createImageData.ownerEntityType).toBe(createRequest.ownerEntityType)
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateImageRequest()
    const dto = imageMapper.toUpdateImageInputDTO(updateRequest, unitFixture.loggedInUserId())

    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())

    // common post properties
    expect(dto.updateImageData.id).toBe(updateRequest.id) // should not be able to update from request
    expect((dto.updateImageData as any).createdById).toBeUndefined() // should not be able to update from request
    expect((dto.updateImageData as any).createdByName).toBeUndefined() // should not be able to update from request
    expect((dto.updateImageData as any).createdAt).toBeUndefined() // should not be able to update from request
    expect((dto.updateImageData as any).updatedAt).toBeUndefined() // should not be able to update from request

    // metadata properties
    expect(dto.updateImageData.fileName).toBe(updateRequest.fileName)
    expect(dto.updateImageData.mimeType).not.toBeUndefined() // mimetype should not become undefined when it is missing from update payload
    expect(dto.updateImageData.mimeType).toBe(updateRequest.mimeType)
    expect(dto.updateImageData.size).toBe(updateRequest.size)
    expect(dto.updateImageData.ownerEntityId).toStrictEqual(updateRequest.ownerEntityId)
    expect(dto.updateImageData.ownerEntityType).toBe(updateRequest.ownerEntityType)
    expect(dto.updateImageData.base64).toBe(updateRequest.base64)
  })

  it('converts image dto to response', ({ unitFixture }) => {
    // this is more of a dummy test because currently no specific mapping is done from ImageDTO -> ImageResponse
    expect(imageMapper.toResponse(unitFixture.imageDTOMock())).toStrictEqual(unitFixture.imageResponse())
  })

  it('converts image response to ImagePresentation entity', ({ unitFixture }) => {
    expect(imageMapper.toImagePresentationDTO(unitFixture.imageResponse())).toStrictEqual(unitFixture.imageDTOMock())
  })
})
