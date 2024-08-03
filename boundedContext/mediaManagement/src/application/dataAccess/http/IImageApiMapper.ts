import { ImageResponse, ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { ImageDTO, ImageWithRelationsDTO } from '../../dtos'

export interface IImageApiMapper {
  toResponse(image: ImageDTO): ImageResponse
  toResponseWithRelations(image: ImageWithRelationsDTO): ImageWithRelationsResponse
}
