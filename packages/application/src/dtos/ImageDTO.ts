import { ImageMetadataDTO } from './ImageMetadataDTO'

export interface ImageDTO extends ImageMetadataDTO {
  base64: string
}
