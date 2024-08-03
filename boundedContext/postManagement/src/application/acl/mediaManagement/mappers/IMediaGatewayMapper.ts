import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ImageAttachmentReadModelDTO } from '../../../dtos/image/ImageAttachmentReadModelDTO'

export interface IMediaGatewayMapper {
  toAttachmentReadModelDTO(image: mediaV1.ImageContract): ImageAttachmentReadModelDTO
}
