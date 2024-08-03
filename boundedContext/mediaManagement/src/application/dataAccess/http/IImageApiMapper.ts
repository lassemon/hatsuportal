import { CreateImageRequest, UpdateImageRequest, ImageResponse, ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { CreateImageInputDTO, ImageDTO, ImageWithRelationsDTO, UpdateImageInputDTO } from '../../dtos'

export interface IImageApiMapper {
  toCreateImageInputDTO(createImageRequest: CreateImageRequest, loggedInUserId?: string): CreateImageInputDTO
  toUpdateImageInputDTO(updateImageRequest: UpdateImageRequest, imageId: string, loggedInUserId?: string): UpdateImageInputDTO
  toResponse(image: ImageDTO): ImageResponse
  toResponseWithRelations(image: ImageWithRelationsDTO): ImageWithRelationsResponse
}
