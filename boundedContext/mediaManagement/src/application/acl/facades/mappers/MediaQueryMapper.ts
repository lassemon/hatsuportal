import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { Image } from '../../../../domain'
import { CurrentImage } from '../../../../domain/entities/CurrentImage'

export interface IMediaQueryMapper {
  toImageContract(image: Image): mediaV1.ImageContract
}

export class MediaQueryMapper implements IMediaQueryMapper {
  public toImageContract(image: Image): mediaV1.ImageContract {
    const currentImage = CurrentImage.fromImageEnsuringCurrentVersion(image)
    return {
      id: currentImage.id.toString(),
      kind: mediaV1.MediaKindContract.Image,
      storageKey: currentImage.storageKey.toString(),
      mimeType: currentImage.mimeType.toString(),
      size: currentImage.size.value,
      base64: currentImage.base64.toString(),
      createdById: currentImage.createdById.toString(),
      createdAt: currentImage.createdAt.value,
      updatedAt: currentImage.updatedAt.value
    }
  }
}
