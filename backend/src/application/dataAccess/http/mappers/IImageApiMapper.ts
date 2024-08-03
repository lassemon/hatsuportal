import { CreateImageInputDTO, UpdateImageInputDTO, ImageDTO } from '@hatsuportal/common-bounded-context'
import { CreateImageRequest, UpdateImageRequest, ImageResponse } from '@hatsuportal/contracts'

export interface IImageApiMapper {
  toCreateImageInputDTO(createImageRequest: CreateImageRequest, loggedInUserId?: string): CreateImageInputDTO
  toUpdateImageInputDTO(updateImageRequest: UpdateImageRequest, loggedInUserId?: string): UpdateImageInputDTO
  toResponse(image: ImageDTO): ImageResponse
}
