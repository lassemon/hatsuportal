import { Image, ImageDTO, ImageMetadata, ImageMetadataDTO, User } from '@hatsuportal/domain'
import { ImageResponseDTO } from '../api/responses/ImageResponseDTO'
import { CreateImageRequestDTO } from '../api/requests/CreateImageRequestDTO'
import { UpdateImageRequestDTO } from '../api/requests/UpdateImageRequestDTO'
import { InsertImageMetadataQueryDTO } from '../persistence/queries/InsertImageMetadataQueryDTO'
import { UpdateImageMetadataQueryDTO } from '../persistence/queries/UpdateImageMetadataQueryDTO'

export interface ImageMapperInterface {
  createRequestToImageMetadata(createImageRequest: CreateImageRequestDTO, user: User): ImageMetadata
  updateRequestToImageMetadata(existingImageMetadata: ImageMetadataDTO, updateImageRequest: UpdateImageRequestDTO): ImageMetadata
  toInsertQuery(imageMetadata: ImageMetadataDTO): InsertImageMetadataQueryDTO
  toUpdateQuery(imageMetadata: ImageMetadataDTO): UpdateImageMetadataQueryDTO
  toImageMetadata(imageMetadata: ImageMetadataDTO): ImageMetadata
  metadataToImage(imageMetadata: ImageMetadataDTO, base64: string): Image
  toResponse(image: ImageDTO): ImageResponseDTO
}
