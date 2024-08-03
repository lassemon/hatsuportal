import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IMediaGatewayMapper } from '../../../../application/acl/mediaManagement/mappers/IMediaGatewayMapper'
import { ImageAttachmentReadModelDTO } from '../../../../application/dtos/image/ImageAttachmentReadModelDTO'

export class MediaGatewayMapper implements IMediaGatewayMapper {
  toAttachmentReadModelDTO(image: mediaV1.ImageContract): ImageAttachmentReadModelDTO {
    return {
      id: image.id,
      storageKey: image.storageKey,
      mimeType: image.mimeType,
      size: image.size,
      base64: image.base64,
      createdById: image.createdById,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    }
  }
}
