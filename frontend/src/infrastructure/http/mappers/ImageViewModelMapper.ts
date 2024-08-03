import { IImageViewModelMapper } from 'application/interfaces'
import { ImageResponse } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'
import { validateAndCastEnum, EntityTypeEnum } from '@hatsuportal/common'

export class ImageViewModelMapper implements IImageViewModelMapper {
  public toViewModel(response: ImageResponse): ImageViewModel {
    return new ImageViewModel({
      id: response.id,
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      fileName: response.fileName,
      mimeType: response.mimeType,
      size: response.size,
      ownerEntityId: response.ownerEntityId,
      ownerEntityType: validateAndCastEnum(response.ownerEntityType, EntityTypeEnum),
      base64: response.base64
    })
  }
}
